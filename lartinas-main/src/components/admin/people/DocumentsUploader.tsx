import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, Trash2, Upload, FileText } from "lucide-react";

const TYPES = [
  { v: "rg", label: "RG" },
  { v: "cpf", label: "CPF" },
  { v: "passaporte", label: "Passaporte" },
  { v: "comprovante_endereco", label: "Comprovante de endereço" },
  { v: "foto", label: "Foto" },
  { v: "contrato", label: "Contrato" },
  { v: "outro", label: "Outro" },
];

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = "application/pdf,image/jpeg,image/png";

export function DocumentsUploader({
  profileId,
  scope,
}: {
  profileId: string;
  scope: "morador" | "proprietario";
}) {
  const [docs, setDocs] = useState<any[]>([]);
  const [type, setType] = useState("rg");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const { data } = await supabase
      .from("person_documents")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });
    setDocs(data || []);
  }

  useEffect(() => { load(); }, [profileId]);

  async function handleUpload(file: File) {
    if (file.size > MAX_BYTES) {
      toast.error("Arquivo maior que 10MB");
      return;
    }
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Apenas PDF, JPG ou PNG");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${profileId}/${type}-${Date.now()}.${ext}`;
      const up = await supabase.storage.from("person-documents").upload(path, file, { contentType: file.type });
      if (up.error) throw up.error;
      const { error } = await supabase.from("person_documents").insert({
        profile_id: profileId,
        scope,
        document_type: type,
        file_path: path,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
      });
      if (error) throw error;
      toast.success("Documento enviado");
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function download(d: any) {
    const { data, error } = await supabase.storage.from("person-documents").createSignedUrl(d.file_path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  }

  async function remove(d: any) {
    if (!confirm("Excluir documento?")) return;
    await supabase.storage.from("person-documents").remove([d.file_path]);
    await supabase.from("person_documents").delete().eq("id", d.id);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 p-4">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => <SelectItem key={t.v} value={t.v}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        />
        <Button onClick={() => fileRef.current?.click()} disabled={busy} variant="default">
          <Upload className="mr-2 h-4 w-4" /> {busy ? "Enviando..." : "Enviar arquivo"}
        </Button>
        <p className="ml-auto text-xs text-muted-foreground">PDF, JPG ou PNG · até 10MB</p>
      </div>

      <div className="space-y-2">
        {docs.length === 0 ? (
          <p className="rounded-xl border border-border/60 p-6 text-center text-sm text-muted-foreground">
            Nenhum documento enviado.
          </p>
        ) : docs.map((d) => (
          <div key={d.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{d.file_name}</p>
              <p className="text-xs text-muted-foreground">
                {TYPES.find(t => t.v === d.document_type)?.label} · {new Date(d.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => download(d)}><Download className="h-4 w-4" /></Button>
            <Button size="sm" variant="ghost" onClick={() => remove(d)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
