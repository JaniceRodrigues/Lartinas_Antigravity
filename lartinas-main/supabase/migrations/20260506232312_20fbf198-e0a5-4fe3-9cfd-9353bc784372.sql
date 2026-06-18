
-- 1. Estender profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS rg text,
  ADD COLUMN IF NOT EXISTS passport text,
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS nationality text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS emergency_contact_name text,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
  ADD COLUMN IF NOT EXISTS internal_notes text;

-- Índice único parcial para e-mail (apenas quando preenchido)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_idx
  ON public.profiles (lower(email)) WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_cpf_unique_idx
  ON public.profiles (cpf) WHERE cpf IS NOT NULL;

-- Permitir que staff manage profiles (insert/update/delete) para cadastros administrativos
DROP POLICY IF EXISTS "Staff manages profiles" ON public.profiles;
CREATE POLICY "Staff manages profiles" ON public.profiles
  FOR ALL TO public
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operacao'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operacao'::app_role));

-- 2. Estender owners
ALTER TABLE public.owners
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'ativo',
  ADD COLUMN IF NOT EXISTS financial_notes text;

-- Permitir profile_id nulo (cadastros sem login). Manter NOT NULL atual? owners.profile_id já é NOT NULL.
ALTER TABLE public.owners ALTER COLUMN profile_id DROP NOT NULL;

-- 3. apartment_payout_config
CREATE TABLE IF NOT EXISTS public.apartment_payout_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id uuid NOT NULL UNIQUE,
  owner_id uuid NOT NULL,
  payout_type text NOT NULL DEFAULT 'percentual' CHECK (payout_type IN ('percentual','fixo')),
  payout_value numeric NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.apartment_payout_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manages payout config" ON public.apartment_payout_config
  FOR ALL TO public
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operacao'::app_role) OR public.has_role(auth.uid(), 'financeiro'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operacao'::app_role) OR public.has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "Owner reads own payout config" ON public.apartment_payout_config
  FOR SELECT TO public
  USING (owner_id IN (SELECT id FROM public.owners WHERE profile_id = auth.uid()));

CREATE TRIGGER update_apartment_payout_config_updated_at
  BEFORE UPDATE ON public.apartment_payout_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. person_documents
CREATE TABLE IF NOT EXISTS public.person_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  scope text NOT NULL CHECK (scope IN ('morador','proprietario')),
  document_type text NOT NULL CHECK (document_type IN ('rg','cpf','passaporte','comprovante_endereco','foto','contrato','outro')),
  file_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS person_documents_profile_idx ON public.person_documents(profile_id);

ALTER TABLE public.person_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manages person documents" ON public.person_documents
  FOR ALL TO public
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operacao'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operacao'::app_role));

CREATE POLICY "Owner reads own person documents" ON public.person_documents
  FOR SELECT TO public
  USING (profile_id = auth.uid());

-- 5. Bucket person-documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('person-documents', 'person-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Staff manages person-documents files" ON storage.objects
  FOR ALL TO public
  USING (bucket_id = 'person-documents' AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operacao'::app_role)))
  WITH CHECK (bucket_id = 'person-documents' AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operacao'::app_role)));

CREATE POLICY "Users read own person-documents files" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'person-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
