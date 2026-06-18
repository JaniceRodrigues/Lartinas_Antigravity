import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";

export const Route = createFileRoute("/owner/documentos")({ component: OwnerDocs });

function OwnerDocs() {
  const { user } = useAuth();
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [title, setTitle] = useState(""); const [category, setCategory] = useState("outro");
  const [file, setFile] = useState<File | null>(null); const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data: o } = await supabase.from("owners").select("id").eq("profile_id", user.id).maybeSingle();
    if (!o) return;
    setOwnerId(o.id);
    const { data } = await supabase.from("owner_documents").select("*").eq("owner_id", o.id).order("created_at", { ascending: false });
    setDocs(data || []);
  };
  useEffect(() => { load(); }, [user]);

  const upload = async () => {
    if (!user || !ownerId || !file || !title) return;
    setBusy(true);
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from("owner-documents").upload(path, file);
    if (upErr) { setBusy(false); return toast.error(upErr.message); }
    const { error } = await supabase.from("owner_documents").insert({
      owner_id: ownerId, title, category, file_path: path, mime_type: file.type, size_bytes: file.size, uploaded_by: user.id,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setFile(null); setTitle("");
    toast.success("Documento enviado");
    load();
  };

  const download = async (path: string) => {
    const { data, error } = await supabase.storage.from("owner-documents").createSignedUrl(path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Documentos" title="Documentos do imóvel" description="Contratos, comprovantes, regulamentos." />

      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <h2 className="mb-3 font-display text-lg font-semibold">Enviar documento</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" /></div>
          <div><Label>Categoria</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1" /></div>
          <div><Label>Arquivo</Label><Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-1" /></div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button onClick={upload} disabled={busy || !file || !title} className="rounded-full bg-gradient-sunset shadow-warm">
            <Upload className="mr-2 h-4 w-4" /> {busy ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card shadow-soft">
        <Table>
          <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Categoria</TableHead><TableHead>Data</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {docs.length === 0 && <TableRow><TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">Sem documentos.</TableCell></TableRow>}
            {docs.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.title}</TableCell>
                <TableCell>{d.category}</TableCell>
                <TableCell>{formatDate(d.created_at)}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => download(d.file_path)}>
                    <Download className="mr-1 h-3 w-3" /> Baixar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
