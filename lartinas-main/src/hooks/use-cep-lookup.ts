import { useState, useCallback } from "react";

export type ViaCepResult = {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  complemento: string;
};

export const formatCEP = (v: string) =>
  v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");

export function useCepLookup() {
  const [loading, setLoading] = useState(false);

  const lookup = useCallback(async (cep: string): Promise<ViaCepResult | null> => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return null;
    setLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.erro) return null;
      return {
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        localidade: data.localidade || "",
        uf: data.uf || "",
        complemento: data.complemento || "",
      };
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, lookup };
}
