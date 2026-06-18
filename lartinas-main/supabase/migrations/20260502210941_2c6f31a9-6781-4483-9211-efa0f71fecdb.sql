
-- Enums
DO $$ BEGIN CREATE TYPE public.lead_status AS ENUM ('novo','qualificado','descartado','convertido'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.contract_status AS ENUM ('rascunho','ativo','encerrado','cancelado'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.payment_status AS ENUM ('pendente','pago','atrasado','cancelado','estornado'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.payment_kind AS ENUM ('caucao','mensalidade','taxa','multa','outro'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.inspection_kind AS ENUM ('entrada','periodica','saida'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.inspection_status AS ENUM ('agendada','realizada','pendencias'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.timeline_entity AS ENUM ('pessoa','quarto','apartamento','contrato','candidatura'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.apartments
  ADD COLUMN IF NOT EXISTS code text UNIQUE,
  ADD COLUMN IF NOT EXISTS house_type text;

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text, phone text, origin text, language text, country text,
  status public.lead_status NOT NULL DEFAULT 'novo',
  owner_id uuid, notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages leads" ON public.leads FOR ALL
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role) OR has_role(auth.uid(),'comercial'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role) OR has_role(auth.uid(),'comercial'::app_role));

CREATE TABLE IF NOT EXISTS public.owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE,
  document text, bank_info jsonb DEFAULT '{}'::jsonb, notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages owners" ON public.owners FOR ALL
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role));
CREATE POLICY "Owner reads self" ON public.owners FOR SELECT USING (profile_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, category text, contact_name text, contact_email text, contact_phone text,
  active boolean NOT NULL DEFAULT true, notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages vendors" ON public.vendors FOR ALL
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role));

CREATE TABLE IF NOT EXISTS public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.applications(id) ON DELETE SET NULL,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
  apartment_id uuid REFERENCES public.apartments(id) ON DELETE SET NULL,
  tenant_id uuid NOT NULL,
  owner_id uuid REFERENCES public.owners(id) ON DELETE SET NULL,
  start_date date NOT NULL, end_date date,
  monthly_value numeric NOT NULL, deposit_value numeric DEFAULT 0,
  status public.contract_status NOT NULL DEFAULT 'rascunho',
  signed_at timestamptz, notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages contracts" ON public.contracts FOR ALL
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role));
CREATE POLICY "Financeiro reads contracts" ON public.contracts FOR SELECT USING (has_role(auth.uid(),'financeiro'::app_role));
CREATE POLICY "Comercial reads contracts" ON public.contracts FOR SELECT USING (has_role(auth.uid(),'comercial'::app_role));
CREATE POLICY "Tenant reads own contract" ON public.contracts FOR SELECT USING (tenant_id = auth.uid());
CREATE POLICY "Owner reads own contract" ON public.contracts FOR SELECT
  USING (owner_id IN (SELECT id FROM public.owners WHERE profile_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.enforce_contract_application()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE app_status public.application_status;
BEGIN
  IF NEW.application_id IS NULL THEN RETURN NEW; END IF;
  SELECT status INTO app_status FROM public.applications WHERE id = NEW.application_id;
  IF app_status IS DISTINCT FROM 'aprovada'::public.application_status THEN
    RAISE EXCEPTION 'Contrato exige candidatura aprovada (status atual: %)', app_status;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_contracts_application_check ON public.contracts;
CREATE TRIGGER trg_contracts_application_check BEFORE INSERT OR UPDATE OF application_id, status ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_contract_application();

CREATE OR REPLACE FUNCTION public.enforce_room_no_overlap()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status <> 'ativo' THEN RETURN NEW; END IF;
  IF EXISTS (
    SELECT 1 FROM public.contracts c
    WHERE c.room_id = NEW.room_id AND c.id <> NEW.id AND c.status = 'ativo'
      AND daterange(c.start_date, COALESCE(c.end_date,'infinity'::date), '[]') &&
          daterange(NEW.start_date, COALESCE(NEW.end_date,'infinity'::date), '[]')
  ) THEN RAISE EXCEPTION 'Já existe contrato ativo neste quarto no período informado'; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_contracts_no_overlap ON public.contracts;
CREATE TRIGGER trg_contracts_no_overlap BEFORE INSERT OR UPDATE OF room_id, status, start_date, end_date ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_room_no_overlap();

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  kind public.payment_kind NOT NULL DEFAULT 'mensalidade',
  amount numeric NOT NULL, due_date date NOT NULL, paid_at timestamptz,
  status public.payment_status NOT NULL DEFAULT 'pendente',
  method text, reference text, notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages payments" ON public.payments FOR ALL
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role));
CREATE POLICY "Financeiro reads payments" ON public.payments FOR SELECT USING (has_role(auth.uid(),'financeiro'::app_role));
CREATE POLICY "Financeiro updates payments" ON public.payments FOR UPDATE USING (has_role(auth.uid(),'financeiro'::app_role));
CREATE POLICY "Tenant reads own payments" ON public.payments FOR SELECT
  USING (contract_id IN (SELECT id FROM public.contracts WHERE tenant_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id uuid REFERENCES public.apartments(id) ON DELETE CASCADE,
  room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE SET NULL,
  kind public.inspection_kind NOT NULL,
  status public.inspection_status NOT NULL DEFAULT 'agendada',
  scheduled_for timestamptz, performed_at timestamptz, performed_by uuid,
  checklist jsonb DEFAULT '{}'::jsonb, notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages inspections" ON public.inspections FOR ALL
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role));

CREATE TABLE IF NOT EXISTS public.timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type public.timeline_entity NOT NULL,
  entity_id uuid NOT NULL,
  event_type text NOT NULL, title text NOT NULL, description text,
  metadata jsonb DEFAULT '{}'::jsonb, actor_id uuid,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_timeline_entity ON public.timeline_events(entity_type, entity_id, occurred_at DESC);
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff reads timeline" ON public.timeline_events FOR SELECT
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role) OR has_role(auth.uid(),'financeiro'::app_role) OR has_role(auth.uid(),'comercial'::app_role));
CREATE POLICY "Tenant reads own timeline" ON public.timeline_events FOR SELECT
  USING (entity_type = 'pessoa' AND entity_id = auth.uid());
CREATE POLICY "Admin writes timeline" ON public.timeline_events FOR INSERT
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'operacao'::app_role));

CREATE OR REPLACE FUNCTION public.log_timeline(
  _entity_type public.timeline_entity, _entity_id uuid,
  _event_type text, _title text, _description text DEFAULT NULL, _metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.timeline_events(entity_type, entity_id, event_type, title, description, metadata, actor_id)
  VALUES (_entity_type, _entity_id, _event_type, _title, _description, _metadata, auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.tl_applications()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_timeline('candidatura', NEW.id, 'application.created', 'Candidatura recebida', NEW.full_name, jsonb_build_object('status', NEW.status));
    IF NEW.user_id IS NOT NULL THEN
      PERFORM public.log_timeline('pessoa', NEW.user_id, 'application.created', 'Nova candidatura', NEW.full_name, jsonb_build_object('application_id', NEW.id));
    END IF;
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.log_timeline('candidatura', NEW.id, 'application.status', 'Status: '||NEW.status, NULL, jsonb_build_object('from', OLD.status, 'to', NEW.status));
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_tl_applications ON public.applications;
CREATE TRIGGER trg_tl_applications AFTER INSERT OR UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.tl_applications();

CREATE OR REPLACE FUNCTION public.tl_contracts()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_timeline('contrato', NEW.id, 'contract.created', 'Contrato criado', NULL, jsonb_build_object('status', NEW.status));
    PERFORM public.log_timeline('pessoa', NEW.tenant_id, 'contract.created', 'Novo contrato', NULL, jsonb_build_object('contract_id', NEW.id));
    PERFORM public.log_timeline('quarto', NEW.room_id, 'contract.created', 'Contrato vinculado', NULL, jsonb_build_object('contract_id', NEW.id));
    IF NEW.apartment_id IS NOT NULL THEN
      PERFORM public.log_timeline('apartamento', NEW.apartment_id, 'contract.created', 'Contrato vinculado', NULL, jsonb_build_object('contract_id', NEW.id));
    END IF;
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.log_timeline('contrato', NEW.id, 'contract.status', 'Status: '||NEW.status, NULL, jsonb_build_object('from', OLD.status, 'to', NEW.status));
    PERFORM public.log_timeline('pessoa', NEW.tenant_id, 'contract.status', 'Contrato '||NEW.status, NULL, jsonb_build_object('contract_id', NEW.id));
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_tl_contracts ON public.contracts;
CREATE TRIGGER trg_tl_contracts AFTER INSERT OR UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.tl_contracts();

CREATE OR REPLACE FUNCTION public.tl_payments()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _tenant uuid;
BEGIN
  SELECT tenant_id INTO _tenant FROM public.contracts WHERE id = NEW.contract_id;
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_timeline('contrato', NEW.contract_id, 'payment.created', 'Pagamento '||NEW.kind, NULL, jsonb_build_object('payment_id', NEW.id, 'amount', NEW.amount));
    IF _tenant IS NOT NULL THEN
      PERFORM public.log_timeline('pessoa', _tenant, 'payment.created', 'Pagamento agendado', NULL, jsonb_build_object('payment_id', NEW.id));
    END IF;
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.log_timeline('contrato', NEW.contract_id, 'payment.status', 'Pagamento '||NEW.status, NULL, jsonb_build_object('payment_id', NEW.id));
    IF _tenant IS NOT NULL THEN
      PERFORM public.log_timeline('pessoa', _tenant, 'payment.status', 'Pagamento '||NEW.status, NULL, jsonb_build_object('payment_id', NEW.id));
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_tl_payments ON public.payments;
CREATE TRIGGER trg_tl_payments AFTER INSERT OR UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.tl_payments();

CREATE OR REPLACE FUNCTION public.tl_tickets()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_timeline('pessoa', NEW.reporter_id, 'ticket.created', NEW.title, NEW.description, jsonb_build_object('ticket_id', NEW.id));
    IF NEW.apartment_id IS NOT NULL THEN
      PERFORM public.log_timeline('apartamento', NEW.apartment_id, 'ticket.created', NEW.title, NULL, jsonb_build_object('ticket_id', NEW.id));
    END IF;
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.log_timeline('pessoa', NEW.reporter_id, 'ticket.status', 'Chamado '||NEW.status, NULL, jsonb_build_object('ticket_id', NEW.id));
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_tl_tickets ON public.tickets;
CREATE TRIGGER trg_tl_tickets AFTER INSERT OR UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.tl_tickets();

CREATE OR REPLACE FUNCTION public.tl_inspections()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.apartment_id IS NOT NULL THEN
      PERFORM public.log_timeline('apartamento', NEW.apartment_id, 'inspection.created', 'Vistoria '||NEW.kind, NULL, jsonb_build_object('inspection_id', NEW.id));
    END IF;
    IF NEW.room_id IS NOT NULL THEN
      PERFORM public.log_timeline('quarto', NEW.room_id, 'inspection.created', 'Vistoria '||NEW.kind, NULL, jsonb_build_object('inspection_id', NEW.id));
    END IF;
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.apartment_id IS NOT NULL THEN
      PERFORM public.log_timeline('apartamento', NEW.apartment_id, 'inspection.status', 'Vistoria '||NEW.status, NULL, jsonb_build_object('inspection_id', NEW.id));
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_tl_inspections ON public.inspections;
CREATE TRIGGER trg_tl_inspections AFTER INSERT OR UPDATE ON public.inspections FOR EACH ROW EXECUTE FUNCTION public.tl_inspections();

DO $$ BEGIN CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER trg_owners_updated BEFORE UPDATE ON public.owners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER trg_vendors_updated BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER trg_contracts_updated BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER trg_inspections_updated BEFORE UPDATE ON public.inspections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
