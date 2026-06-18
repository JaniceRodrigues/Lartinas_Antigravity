import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";

export const Route = createFileRoute("/portal/perfil")({
  component: Perfil,
});

function Perfil() {
  const { user, roles } = useAuth();
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    bio: "",
    avatar_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [avatarSignedUrl, setAvatarSignedUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resolveAvatar = async (value: string) => {
    if (!value) return setAvatarSignedUrl("");
    if (value.startsWith("http")) return setAvatarSignedUrl(value);
    const { data } = await supabase.storage
      .from("profile-photos")
      .createSignedUrl(value, 3600);
    setAvatarSignedUrl(data?.signedUrl || "");
  };

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        if (data) {
          setProfile({
            full_name: data.full_name || "",
            phone: data.phone || "",
            bio: data.bio || "",
            avatar_url: data.avatar_url || "",
          });
          resolveAvatar(data.avatar_url || "");
        }
        setFetching(false);
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    if (profile.full_name.trim().length === 0) {
      return toast.error("Informe seu nome completo.");
    }
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name.trim().slice(0, 120),
        phone: profile.phone.trim().slice(0, 30) || null,
        bio: profile.bio.trim().slice(0, 1000) || null,
      })
      .eq("id", user.id);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado!");
  };

  const onPickFile = () => fileInputRef.current?.click();

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      return toast.error("Selecione uma imagem.");
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Imagem deve ter no máximo 5MB.");
    }
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("profile-photos")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      setUploading(false);
      return toast.error(upErr.message);
    }
    const { data: pub } = supabase.storage.from("profile-photos").getPublicUrl(path);
    void pub;
    const { error: updErr } = await supabase
      .from("profiles")
      .update({ avatar_url: path })
      .eq("id", user.id);
    setUploading(false);
    if (updErr) return toast.error(updErr.message);
    setProfile((p) => ({ ...p, avatar_url: path }));
    resolveAvatar(path);
    toast.success("Foto atualizada!");
  };

  const initials =
    profile.full_name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || user?.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">Meu perfil</h1>
        <p className="mt-1 text-muted-foreground">
          Atualize sua foto e informações pessoais.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        {fetching ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-background shadow-warm">
                  <AvatarImage src={avatarSignedUrl} alt={profile.full_name} />
                  <AvatarFallback className="bg-gradient-sunset text-xl font-display text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={onPickFile}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-warm transition hover:scale-105 disabled:opacity-60"
                  aria-label="Trocar foto"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onUpload}
                />
              </div>
              <div className="text-center sm:text-left">
                <div className="font-display text-xl">
                  {profile.full_name || "Sem nome"}
                </div>
                <div className="text-sm text-muted-foreground">{user?.email}</div>
                {roles.length > 0 && (
                  <div className="mt-2 flex flex-wrap justify-center gap-1 sm:justify-start">
                    {roles.map((r) => (
                      <span
                        key={r}
                        className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="full_name">Nome completo</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="mt-1"
                  maxLength={120}
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" value={user?.email || ""} disabled className="mt-1" />
              </div>
              <div>
                <Label htmlFor="phone">WhatsApp</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="mt-1"
                  maxLength={30}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Conte um pouco sobre você..."
                  className="mt-1"
                  maxLength={1000}
                />
                <div className="mt-1 text-right text-xs text-muted-foreground">
                  {profile.bio.length}/1000
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={save}
                disabled={loading}
                className="rounded-full bg-gradient-sunset px-8 shadow-warm"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                  </>
                ) : (
                  "Salvar alterações"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
