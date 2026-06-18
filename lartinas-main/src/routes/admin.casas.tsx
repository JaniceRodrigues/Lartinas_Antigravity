import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Loader2, X, ImagePlus, Pencil, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { AddressFields } from "@/components/forms/AddressFields";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/casas")({
  component: AdminCasas,
});

const MAX_PHOTO = 5 * 1024 * 1024;
const MAX_VIDEO = 50 * 1024 * 1024; // 50MB
const ACCEPT_PHOTO = ["image/jpeg", "image/png", "image/webp"];
const ACCEPT_VIDEO = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

type House = {
  id: string;
  name: string;
  neighborhood: string;
  description: string | null;
  address: string | null;
  cep: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  city: string | null;
  state: string | null;
  active: boolean;
  status: "disponivel" | "alugada" | "aguardando_vistoria" | "desativado";
  cover_photo_url: string | null;
  photos: string[] | null;
  videos: string[] | null;
};

const STATUS_OPTIONS = [
  { value: "disponivel", label: "Disponível" },
  { value: "alugada", label: "Alugada" },
  { value: "aguardando_vistoria", label: "Aguardando vistoria" },
  { value: "desativado", label: "Desativado" },
] as const;

function publicUrl(path: string) {
  return supabase.storage.from("apartment-photos").getPublicUrl(path).data.publicUrl;
}

async function uploadOne(file: File, folder: string): Promise<string> {
  const isVideo = ACCEPT_VIDEO.includes(file.type);
  const isPhoto = ACCEPT_PHOTO.includes(file.type);
  if (!isPhoto && !isVideo) throw new Error(`Formato inválido: ${file.name}`);
  
  const limit = isVideo ? MAX_VIDEO : MAX_PHOTO;
  if (file.size > limit) {
    const limitMb = limit / (1024 * 1024);
    throw new Error(`${file.name} excede ${limitMb}MB`);
  }
  
  const ext = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg");
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("apartment-photos").upload(path, file, { contentType: file.type });
  if (error) throw error;
  return publicUrl(path);
}

function AdminCasas() {
  const [houses, setHouses] = useState<House[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<House | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", neighborhood: "", description: "", address: "",
    cep: "", street: "", number: "", complement: "", city: "", state: "",
    status: "disponivel" as House["status"],
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [existingVideos, setExistingVideos] = useState<string[]>([]);

  const load = () =>
    supabase.from("apartments").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setHouses((data as any) || []));

  useEffect(() => { load(); }, []);

  const reset = () => {
    setEditing(null);
    setForm({ name: "", neighborhood: "", description: "", address: "", cep: "", street: "", number: "", complement: "", city: "", state: "", status: "disponivel" });
    setCoverFile(null); setCoverUrl(null);
    setGalleryFiles([]); setExistingPhotos([]);
    setVideoFiles([]); setExistingVideos([]);
  };

  const startEdit = (h: House) => {
    setEditing(h);
    setForm({
      name: h.name, neighborhood: h.neighborhood, description: h.description ?? "", address: h.address ?? "",
      cep: h.cep ?? "", street: h.street ?? "", number: h.number ?? "", complement: h.complement ?? "",
      city: h.city ?? "", state: h.state ?? "", status: h.status ?? "disponivel",
    });
    setCoverUrl(h.cover_photo_url);
    setExistingPhotos(h.photos ?? []);
    setExistingVideos(h.videos ?? []);
    setCoverFile(null); setGalleryFiles([]); setVideoFiles([]);
    setOpen(true);
  };

  const save = async () => {
    if (!form.name || !form.neighborhood) return toast.error("Nome e bairro são obrigatórios.");
    setSaving(true);
    try {
      const id = editing?.id ?? crypto.randomUUID();
      let finalCover = coverUrl;
      if (coverFile) finalCover = await uploadOne(coverFile, id);
      
      const newGallery: string[] = [];
      for (const f of galleryFiles) newGallery.push(await uploadOne(f, id));
      const photos = [...existingPhotos, ...newGallery];

      const newVideosList: string[] = [];
      for (const f of videoFiles) newVideosList.push(await uploadOne(f, id));
      const videos = [...existingVideos, ...newVideosList];

      const payload = {
        name: form.name,
        neighborhood: form.neighborhood,
        description: form.description || null,
        address: form.address || null,
        cep: form.cep || null,
        street: form.street || null,
        number: form.number || null,
        complement: form.complement || null,
        city: form.city || null,
        state: form.state || null,
        status: form.status,
        active: form.status !== "desativado",
        cover_photo_url: finalCover,
        photos,
        videos,
      };
      if (editing) {
        const { error } = await supabase.from("apartments").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Casa atualizada!");
      } else {
        const { error } = await supabase.from("apartments").insert({ id, ...payload });
        if (error) throw error;
        toast.success("Casa criada!");
      }
      setOpen(false); reset(); load();
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-semibold">Casas</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild>
            <Button onClick={reset} className="rounded-full bg-gradient-sunset shadow-warm">
              <Plus className="mr-2 h-4 w-4" /> Nova casa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl">
            <DialogHeader><DialogTitle className="font-display text-2xl">{editing ? "Editar casa" : "Nova casa"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <AddressFields
                  value={{
                    cep: form.cep, street: form.street, number: form.number, complement: form.complement,
                    neighborhood: form.neighborhood, city: form.city, state: form.state,
                  }}
                  onChange={(addr) => setForm((s) => ({
                    ...s,
                    cep: addr.cep ?? "", street: addr.street ?? "", number: addr.number ?? "",
                    complement: addr.complement ?? "", neighborhood: addr.neighborhood ?? s.neighborhood,
                    city: addr.city ?? "", state: addr.state ?? "",
                  }))}
                />
              </div>
              <div><Label>Descrição</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" /></div>

              <div>
                <Label>Status</Label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as House["status"] })}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div>
                <Label>Foto de capa</Label>
                <div className="mt-2 flex items-center gap-3">
                  {(coverFile || coverUrl) && (
                    <div className="relative h-20 w-28 overflow-hidden rounded-xl border border-border">
                      <img src={coverFile ? URL.createObjectURL(coverFile) : coverUrl!} className="h-full w-full object-cover" alt="capa" />
                    </div>
                  )}
                  <Input type="file" accept={ACCEPT_PHOTO.join(",")} onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
                </div>
              </div>

              <div>
                <Label>Galeria</Label>
                {existingPhotos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {existingPhotos.map((url) => (
                      <div key={url} className="relative h-16 w-20 overflow-hidden rounded-lg border border-border">
                        <img src={url} className="h-full w-full object-cover" alt="" />
                        <button
                          type="button"
                          onClick={() => setExistingPhotos((p) => p.filter((u) => u !== url))}
                          className="absolute right-0 top-0 rounded-bl-lg bg-black/60 p-0.5 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {galleryFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {galleryFiles.map((f, i) => (
                      <div key={i} className="relative h-16 w-20 overflow-hidden rounded-lg border border-primary">
                        <img src={URL.createObjectURL(f)} className="h-full w-full object-cover" alt="" />
                        <button
                          type="button"
                          onClick={() => setGalleryFiles((g) => g.filter((_, idx) => idx !== i))}
                          className="absolute right-0 top-0 rounded-bl-lg bg-black/60 p-0.5 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/50">
                  <ImagePlus className="h-4 w-4" /> Adicionar fotos
                  <input
                    type="file"
                    multiple
                    accept={ACCEPT_PHOTO.join(",")}
                    className="hidden"
                    onChange={(e) => setGalleryFiles((g) => [...g, ...Array.from(e.target.files ?? [])])}
                  />
                </label>
              </div>

              <div>
                <Label>Vídeos</Label>
                {existingVideos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {existingVideos.map((url) => (
                      <div key={url} className="relative h-16 w-20 overflow-hidden rounded-lg border border-border">
                        <video src={url} className="h-full w-full object-cover" muted playsInline />
                        <button
                          type="button"
                          onClick={() => setExistingVideos((v) => v.filter((u) => u !== url))}
                          className="absolute right-0 top-0 rounded-bl-lg bg-black/60 p-0.5 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {videoFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {videoFiles.map((f, i) => (
                      <div key={i} className="relative h-16 w-20 overflow-hidden rounded-lg border border-primary">
                        <video src={URL.createObjectURL(f)} className="h-full w-full object-cover" muted playsInline />
                        <button
                          type="button"
                          onClick={() => setVideoFiles((v) => v.filter((_, idx) => idx !== i))}
                          className="absolute right-0 top-0 rounded-bl-lg bg-black/60 p-0.5 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/50">
                  <Video className="h-4 w-4" /> Adicionar vídeos
                  <input
                    type="file"
                    multiple
                    accept={ACCEPT_VIDEO.join(",")}
                    className="hidden"
                    onChange={(e) => setVideoFiles((v) => [...v, ...Array.from(e.target.files ?? [])])}
                  />
                </label>
              </div>

              <Button onClick={save} disabled={saving} className="w-full rounded-full bg-gradient-sunset shadow-warm">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : (editing ? "Salvar alterações" : "Criar")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {houses.length === 0 && (
          <div className="col-span-full rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground shadow-soft">
            Nenhuma casa cadastrada ainda.
          </div>
        )}
        {houses.map((h) => (
          <div key={h.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
            {h.cover_photo_url ? (
              <img src={h.cover_photo_url} alt={h.name} className="h-40 w-full object-cover" />
            ) : (
              <div className="grid h-40 w-full place-items-center bg-muted text-muted-foreground"><ImagePlus className="h-8 w-8" /></div>
            )}
            <div className="p-5">
              <p className="text-xs text-muted-foreground">{h.neighborhood}</p>
              <h3 className="mt-1 font-display text-xl font-semibold">{h.name}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-foreground/70">{h.description}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium capitalize text-foreground">
                    {STATUS_OPTIONS.find((o) => o.value === h.status)?.label ?? "—"}
                  </span>
                  <span>· {h.photos?.length ?? 0} fotos {h.videos?.length ? `· ${h.videos.length} vídeo(s)` : ""}</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => startEdit(h)} className="rounded-full">
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Editar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
