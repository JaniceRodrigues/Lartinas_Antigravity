
-- =========================================================
-- Enums
-- =========================================================
DO $$ BEGIN
  CREATE TYPE public.contract_template_kind AS ENUM ('moradora','proprietario','regras_casa','vistoria','aditivo');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.contract_document_status AS ENUM ('rascunho','pendente_aprovacao','aprovado','enviado','assinado','vencido','cancelado','renovado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.contract_addendum_kind AS ENUM ('prorrogacao','reajuste','troca_quarto','outro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.contract_addendum_status AS ENUM ('rascunho','ativo','cancelado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================================
-- Add timeline entity values for new types (best-effort)
-- =========================================================
DO $$ BEGIN
  ALTER TYPE public.timeline_entity ADD VALUE IF NOT EXISTS 'documento';
EXCEPTION WHEN others THEN NULL; END $$;

-- =========================================================
-- contract_templates
-- =========================================================
CREATE TABLE IF NOT EXISTS public.contract_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kind public.contract_template_kind NOT NULL,
  content text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff manages templates" ON public.contract_templates;
CREATE POLICY "Staff manages templates" ON public.contract_templates
  FOR ALL USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role));

DROP POLICY IF EXISTS "Authenticated reads active templates" ON public.contract_templates;
CREATE POLICY "Authenticated reads active templates" ON public.contract_templates
  FOR SELECT USING (auth.uid() IS NOT NULL AND active = true);

CREATE TRIGGER trg_contract_templates_updated
  BEFORE UPDATE ON public.contract_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- contract_documents
-- =========================================================
CREATE TABLE IF NOT EXISTS public.contract_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL,
  template_id uuid,
  kind public.contract_template_kind NOT NULL,
  title text NOT NULL,
  content_rendered text NOT NULL DEFAULT '',
  pdf_path text,
  status public.contract_document_status NOT NULL DEFAULT 'rascunho',
  approved_by uuid,
  approved_at timestamptz,
  sent_at timestamptz,
  signed_at timestamptz,
  signed_by_ip text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contract_documents_contract ON public.contract_documents(contract_id);

ALTER TABLE public.contract_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff manages documents" ON public.contract_documents;
CREATE POLICY "Staff manages documents" ON public.contract_documents
  FOR ALL USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role));

DROP POLICY IF EXISTS "Tenant reads own documents" ON public.contract_documents;
CREATE POLICY "Tenant reads own documents" ON public.contract_documents
  FOR SELECT USING (
    contract_id IN (SELECT id FROM public.contracts WHERE tenant_id = auth.uid())
  );

DROP POLICY IF EXISTS "Tenant signs own document" ON public.contract_documents;
CREATE POLICY "Tenant signs own document" ON public.contract_documents
  FOR UPDATE USING (
    contract_id IN (SELECT id FROM public.contracts WHERE tenant_id = auth.uid())
    AND status = 'enviado'
  );

CREATE TRIGGER trg_contract_documents_updated
  BEFORE UPDATE ON public.contract_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- contract_addendums
-- =========================================================
CREATE TABLE IF NOT EXISTS public.contract_addendums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL,
  kind public.contract_addendum_kind NOT NULL,
  description text NOT NULL,
  effective_date date,
  document_id uuid REFERENCES public.contract_documents(id) ON DELETE SET NULL,
  status public.contract_addendum_status NOT NULL DEFAULT 'rascunho',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contract_addendums_contract ON public.contract_addendums(contract_id);

ALTER TABLE public.contract_addendums ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff manages addendums" ON public.contract_addendums;
CREATE POLICY "Staff manages addendums" ON public.contract_addendums
  FOR ALL USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role));

DROP POLICY IF EXISTS "Tenant reads own addendums" ON public.contract_addendums;
CREATE POLICY "Tenant reads own addendums" ON public.contract_addendums
  FOR SELECT USING (
    contract_id IN (SELECT id FROM public.contracts WHERE tenant_id = auth.uid())
  );

CREATE TRIGGER trg_contract_addendums_updated
  BEFORE UPDATE ON public.contract_addendums
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- contract_checklist_items
-- =========================================================
CREATE TABLE IF NOT EXISTS public.contract_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL,
  kind text NOT NULL,
  label text NOT NULL,
  required boolean NOT NULL DEFAULT true,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  completed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contract_checklist_contract ON public.contract_checklist_items(contract_id);

ALTER TABLE public.contract_checklist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff manages checklist" ON public.contract_checklist_items;
CREATE POLICY "Staff manages checklist" ON public.contract_checklist_items
  FOR ALL USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role));

DROP POLICY IF EXISTS "Tenant reads own checklist" ON public.contract_checklist_items;
CREATE POLICY "Tenant reads own checklist" ON public.contract_checklist_items
  FOR SELECT USING (
    contract_id IN (SELECT id FROM public.contracts WHERE tenant_id = auth.uid())
  );

CREATE TRIGGER trg_contract_checklist_updated
  BEFORE UPDATE ON public.contract_checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- Alter contracts
-- =========================================================
ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS pdf_main_document_id uuid,
  ADD COLUMN IF NOT EXISTS renewal_alert_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS auto_renewal boolean NOT NULL DEFAULT false;

-- =========================================================
-- Alter payments
-- =========================================================
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS proof_validation_status text,
  ADD COLUMN IF NOT EXISTS proof_validated_by uuid,
  ADD COLUMN IF NOT EXISTS proof_validated_at timestamptz,
  ADD COLUMN IF NOT EXISTS proof_rejection_reason text;

-- =========================================================
-- Storage bucket
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
  VALUES ('contract-pdfs','contract-pdfs', false)
  ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Staff reads contract pdfs" ON storage.objects;
CREATE POLICY "Staff reads contract pdfs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'contract-pdfs' AND (
      has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role)
    )
  );

DROP POLICY IF EXISTS "Staff writes contract pdfs" ON storage.objects;
CREATE POLICY "Staff writes contract pdfs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'contract-pdfs' AND (
      has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role)
    )
  );

DROP POLICY IF EXISTS "Staff updates contract pdfs" ON storage.objects;
CREATE POLICY "Staff updates contract pdfs" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'contract-pdfs' AND (
      has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role)
    )
  );

DROP POLICY IF EXISTS "Tenant reads own contract pdfs" ON storage.objects;
CREATE POLICY "Tenant reads own contract pdfs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'contract-pdfs' AND (
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.contracts WHERE tenant_id = auth.uid()
      )
    )
  );

-- =========================================================
-- RPC: expire overdue reservations
-- =========================================================
CREATE OR REPLACE FUNCTION public.expire_overdue_reservations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n integer;
BEGIN
  WITH upd AS (
    UPDATE public.payments SET status = 'expirado'
    WHERE kind = 'reserva' AND status = 'pendente' AND expires_at IS NOT NULL AND expires_at < CURRENT_DATE
    RETURNING id
  )
  SELECT count(*) INTO n FROM upd;
  RETURN n;
END $$;

-- =========================================================
-- Trigger: prevent signed document edits (except status -> renovado/cancelado by staff)
-- =========================================================
CREATE OR REPLACE FUNCTION public.prevent_signed_document_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'assinado' THEN
    -- Allow only superficial fields to change (notes), not content/pdf
    IF NEW.content_rendered IS DISTINCT FROM OLD.content_rendered
       OR NEW.pdf_path IS DISTINCT FROM OLD.pdf_path
       OR NEW.title IS DISTINCT FROM OLD.title THEN
      RAISE EXCEPTION 'Documento assinado é imutável. Crie um aditivo.';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_prevent_signed_document_update ON public.contract_documents;
CREATE TRIGGER trg_prevent_signed_document_update
  BEFORE UPDATE ON public.contract_documents
  FOR EACH ROW EXECUTE FUNCTION public.prevent_signed_document_update();

-- =========================================================
-- Trigger: enforce checklist before sending
-- =========================================================
CREATE OR REPLACE FUNCTION public.enforce_checklist_before_send()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE pending integer;
BEGIN
  IF NEW.status = 'enviado' AND OLD.status IS DISTINCT FROM 'enviado' THEN
    SELECT count(*) INTO pending
    FROM public.contract_checklist_items
    WHERE contract_id = NEW.contract_id AND required = true AND completed = false;
    IF pending > 0 THEN
      RAISE EXCEPTION 'Existem % item(ns) obrigatórios pendentes no checklist do contrato', pending;
    END IF;
    NEW.sent_at = now();
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_enforce_checklist_before_send ON public.contract_documents;
CREATE TRIGGER trg_enforce_checklist_before_send
  BEFORE UPDATE ON public.contract_documents
  FOR EACH ROW EXECUTE FUNCTION public.enforce_checklist_before_send();

-- =========================================================
-- Triggers: timeline logging
-- =========================================================
CREATE OR REPLACE FUNCTION public.tl_contract_documents()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_timeline('contrato', NEW.contract_id, 'document.created', 'Documento: '||NEW.title, NULL, jsonb_build_object('document_id', NEW.id, 'kind', NEW.kind));
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.log_timeline('contrato', NEW.contract_id, 'document.status', 'Documento '||NEW.status, NEW.title, jsonb_build_object('document_id', NEW.id, 'from', OLD.status, 'to', NEW.status));
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_tl_contract_documents ON public.contract_documents;
CREATE TRIGGER trg_tl_contract_documents
  AFTER INSERT OR UPDATE ON public.contract_documents
  FOR EACH ROW EXECUTE FUNCTION public.tl_contract_documents();

CREATE OR REPLACE FUNCTION public.tl_contract_addendums()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_timeline('contrato', NEW.contract_id, 'addendum.created', 'Aditivo: '||NEW.kind, NEW.description, jsonb_build_object('addendum_id', NEW.id));
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.log_timeline('contrato', NEW.contract_id, 'addendum.status', 'Aditivo '||NEW.status, NEW.description, jsonb_build_object('addendum_id', NEW.id));
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_tl_contract_addendums ON public.contract_addendums;
CREATE TRIGGER trg_tl_contract_addendums
  AFTER INSERT OR UPDATE ON public.contract_addendums
  FOR EACH ROW EXECUTE FUNCTION public.tl_contract_addendums();
