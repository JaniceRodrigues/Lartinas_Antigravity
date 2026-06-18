import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { formatCEP, useCepLookup } from "@/hooks/use-cep-lookup";

export type AddressValue = {
  cep?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
};

type Props = {
  value: AddressValue;
  onChange: (v: AddressValue) => void;
  disabled?: boolean;
  showNeighborhood?: boolean;
};

export function AddressFields({ value, onChange, disabled, showNeighborhood = true }: Props) {
  const { loading, lookup } = useCepLookup();
  const numberRef = useRef<HTMLInputElement>(null);

  const update = (patch: Partial<AddressValue>) => onChange({ ...value, ...patch });

  const handleCepChange = async (raw: string) => {
    const formatted = formatCEP(raw);
    update({ cep: formatted });
    if (formatted.replace(/\D/g, "").length === 8) {
      const res = await lookup(formatted);
      if (res) {
        onChange({
          ...value,
          cep: formatted,
          street: res.logradouro || value.street || "",
          neighborhood: res.bairro || value.neighborhood || "",
          city: res.localidade || value.city || "",
          state: res.uf || value.state || "",
          complement: value.complement || res.complemento || "",
        });
        setTimeout(() => numberRef.current?.focus(), 50);
      } else {
        toast.error("CEP não encontrado. Preencha manualmente.");
      }
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
      <Field label="CEP" className="md:col-span-2">
        <div className="relative">
          <Input
            value={value.cep || ""}
            onChange={(e) => handleCepChange(e.target.value)}
            placeholder="00000-000"
            inputMode="numeric"
            disabled={disabled}
          />
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </div>
        </div>
      </Field>
      <Field label="Rua / Logradouro" className="md:col-span-4">
        <Input value={value.street || ""} onChange={(e) => update({ street: e.target.value })} disabled={disabled} />
      </Field>
      <Field label="Número" className="md:col-span-2">
        <Input ref={numberRef} value={value.number || ""} onChange={(e) => update({ number: e.target.value })} disabled={disabled} />
      </Field>
      <Field label="Complemento" className="md:col-span-4">
        <Input value={value.complement || ""} onChange={(e) => update({ complement: e.target.value })} disabled={disabled} />
      </Field>
      {showNeighborhood && (
        <Field label="Bairro" className="md:col-span-2">
          <Input value={value.neighborhood || ""} onChange={(e) => update({ neighborhood: e.target.value })} disabled={disabled} />
        </Field>
      )}
      <Field label="Cidade" className={showNeighborhood ? "md:col-span-3" : "md:col-span-5"}>
        <Input value={value.city || ""} onChange={(e) => update({ city: e.target.value })} disabled={disabled} />
      </Field>
      <Field label="UF" className="md:col-span-1">
        <Input
          value={value.state || ""}
          onChange={(e) => update({ state: e.target.value.toUpperCase().slice(0, 2) })}
          maxLength={2}
          disabled={disabled}
        />
      </Field>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
