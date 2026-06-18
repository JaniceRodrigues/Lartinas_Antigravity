// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { contract_id } = await req.json();
    if (!contract_id) throw new Error("contract_id obrigatório");

    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Authorization: only staff (admin/operacao) may send contracts
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    const { data: userData, error: userErr } = await supa.auth.getUser(jwt);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const { data: callerRoles } = await supa
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);
    const isStaff = (callerRoles ?? []).some((r: { role: string }) =>
      ["admin", "operacao"].includes(r.role)
    );
    if (!isStaff) {
      return new Response(JSON.stringify({ ok: false, error: "Forbidden" }), {
        status: 403,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }


    const { data: c, error } = await supa
      .from("party_contracts")
      .select("*, profiles(email, full_name), owners(profile_id, profiles:profile_id(email, full_name))")
      .eq("id", contract_id)
      .single();
    if (error || !c) throw new Error(error?.message ?? "Contrato não encontrado");

    const recipientEmail =
      c.party_type === "morador"
        ? c.profiles?.email
        : c.owners?.profiles?.email;
    const recipientName =
      c.party_type === "morador"
        ? c.profiles?.full_name
        : c.owners?.profiles?.full_name;

    if (!recipientEmail) throw new Error("Destinatário sem e-mail cadastrado");

    let pdfUrl: string | null = null;
    if (c.pdf_path) {
      const { data: signed } = await supa.storage
        .from("contract-pdfs")
        .createSignedUrl(c.pdf_path, 60 * 60 * 24 * 7);
      pdfUrl = signed?.signedUrl ?? null;
    }

    const RESEND = Deno.env.get("RESEND_API_KEY");
    const LOVABLE = Deno.env.get("LOVABLE_API_KEY");
    let sendStatus = "enviado";
    let sendError: string | null = null;

    const html = `
      <div style="font-family:Arial,sans-serif;background:#fff;padding:24px;color:#222">
        <h2>Olá, ${recipientName ?? ""}</h2>
        <p>Você recebeu o contrato <strong>${c.title}</strong>.</p>
        ${pdfUrl ? `<p><a href="${pdfUrl}" style="background:#e8744a;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Visualizar contrato</a></p>` : ""}
        <p style="margin-top:16px;color:#666;font-size:13px">Em caso de dúvidas, responda a este e-mail.</p>
      </div>`;

    if (RESEND && LOVABLE) {
      try {
        const r = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LOVABLE}`,
            "X-Connection-Api-Key": RESEND,
          },
          body: JSON.stringify({
            from: "Lartinas <onboarding@resend.dev>",
            to: [recipientEmail],
            subject: `Contrato: ${c.title}`,
            html,
          }),
        });
        if (!r.ok) {
          sendStatus = "falhou";
          sendError = await r.text();
        }
      } catch (e) {
        sendStatus = "falhou";
        sendError = String(e);
      }
    } else {
      sendStatus = "registrado";
      sendError = "Provider de e-mail não configurado (RESEND_API_KEY ausente)";
    }

    await supa.from("party_contract_send_history").insert({
      party_contract_id: contract_id,
      recipient_email: recipientEmail,
      status: sendStatus,
      error_message: sendError,
    });

    if (sendStatus === "enviado" && c.status === "rascunho") {
      await supa.from("party_contracts").update({ status: "enviado" }).eq("id", contract_id);
    }

    return new Response(
      JSON.stringify({ ok: sendStatus !== "falhou", status: sendStatus, error: sendError }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
