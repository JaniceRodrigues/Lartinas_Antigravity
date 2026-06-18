
-- Etapa 3: Contratos de partes (morador/proprietário) + Financeiro unificado

CREATE TYPE party_contract_type AS ENUM ('morador','proprietario');
CREATE TYPE party_contract_status AS ENUM ('rascunho','enviado','assinado','ativo','finalizado','cancelado');
CREATE TYPE financial_entry_type AS ENUM ('pagar','receber');
CREATE TYPE financial_entry_origin AS ENUM ('contrato_morador','contrato_proprietario','receita_avulsa','despesa_avulsa');
CREATE TYPE financial_entry_status AS ENUM ('pendente','pago','vencido','cancelado');

-- party_contracts
CREATE TABLE public.party_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_type party_contract_type NOT NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES public.owners(id) ON DELETE SET NULL,
  apartment_id uuid REFERENCES public.apartments(id) ON DELETE SET NULL,
  template_id uuid REFERENCES public.contract_templates(id) ON DELETE SET NULL,
  title text NOT NULL,
  content_rendered text NOT NULL DEFAULT '',
  total_value numeric NOT NULL DEFAULT 0,
  installments_count int NOT NULL DEFAULT 1 CHECK (installments_count >= 1),
  first_due_date date,
  start_date date,
  end_date date,
  status party_contract_status NOT NULL DEFAULT 'rascunho',
  pdf_path text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT party_contracts_party_check CHECK (
    (party_type = 'morador' AND profile_id IS NOT NULL AND owner_id IS NULL) OR
    (party_type = 'proprietario' AND owner_id IS NOT NULL AND profile_id IS NULL)
  )
);

CREATE INDEX idx_party_contracts_status ON public.party_contracts(status);
CREATE INDEX idx_party_contracts_profile ON public.party_contracts(profile_id);
CREATE INDEX idx_party_contracts_owner ON public.party_contracts(owner_id);

ALTER TABLE public.party_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manages party contracts" ON public.party_contracts
  FOR ALL USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao'));

CREATE POLICY "Morador reads own party contracts" ON public.party_contracts
  FOR SELECT USING (party_type='morador' AND profile_id = auth.uid());

CREATE POLICY "Proprietario reads own party contracts" ON public.party_contracts
  FOR SELECT USING (party_type='proprietario' AND owner_id IN (SELECT id FROM owners WHERE profile_id=auth.uid()));

CREATE TRIGGER trg_party_contracts_updated BEFORE UPDATE ON public.party_contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- send history
CREATE TABLE public.party_contract_send_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_contract_id uuid NOT NULL REFERENCES public.party_contracts(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  status text NOT NULL DEFAULT 'enviado',
  error_message text,
  sent_by uuid,
  sent_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pcsh_contract ON public.party_contract_send_history(party_contract_id);
ALTER TABLE public.party_contract_send_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manages send history" ON public.party_contract_send_history
  FOR ALL USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao'));
CREATE POLICY "Party reads own send history" ON public.party_contract_send_history
  FOR SELECT USING (
    party_contract_id IN (
      SELECT id FROM party_contracts WHERE profile_id=auth.uid()
        OR owner_id IN (SELECT id FROM owners WHERE profile_id=auth.uid())
    )
  );

-- financial_entries
CREATE TABLE public.financial_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type financial_entry_type NOT NULL,
  origin financial_entry_origin NOT NULL,
  party_contract_id uuid REFERENCES public.party_contracts(id) ON DELETE RESTRICT,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES public.owners(id) ON DELETE SET NULL,
  category text,
  description text,
  amount numeric NOT NULL DEFAULT 0,
  installment_number int,
  installments_total int,
  due_date date NOT NULL,
  paid_at timestamptz,
  status financial_entry_status NOT NULL DEFAULT 'pendente',
  payment_method text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_fe_type_status_due ON public.financial_entries(type, status, due_date);
CREATE INDEX idx_fe_contract ON public.financial_entries(party_contract_id);
CREATE INDEX idx_fe_origin ON public.financial_entries(origin);

ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manages financial entries" ON public.financial_entries
  FOR ALL USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao') OR has_role(auth.uid(),'financeiro'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao') OR has_role(auth.uid(),'financeiro'));

CREATE POLICY "Morador reads own entries" ON public.financial_entries
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Proprietario reads own entries" ON public.financial_entries
  FOR SELECT USING (owner_id IN (SELECT id FROM owners WHERE profile_id=auth.uid()));

CREATE TRIGGER trg_financial_entries_updated BEFORE UPDATE ON public.financial_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RPC: gerar parcelas
CREATE OR REPLACE FUNCTION public.generate_contract_financial_entries(_contract_id uuid)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  c party_contracts%ROWTYPE;
  i int;
  per_amount numeric;
  base_date date;
  inserted_count int := 0;
BEGIN
  SELECT * INTO c FROM party_contracts WHERE id = _contract_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Contrato não encontrado'; END IF;
  IF EXISTS (SELECT 1 FROM financial_entries WHERE party_contract_id = _contract_id AND status <> 'cancelado') THEN
    RETURN 0;
  END IF;
  IF c.first_due_date IS NULL THEN RAISE EXCEPTION 'Defina a data do primeiro vencimento'; END IF;
  per_amount := round(c.total_value / c.installments_count, 2);
  base_date := c.first_due_date;
  FOR i IN 1..c.installments_count LOOP
    INSERT INTO financial_entries(
      type, origin, party_contract_id, profile_id, owner_id,
      category, description, amount, installment_number, installments_total,
      due_date, status, created_by
    ) VALUES (
      CASE WHEN c.party_type='morador' THEN 'receber'::financial_entry_type ELSE 'pagar'::financial_entry_type END,
      CASE WHEN c.party_type='morador' THEN 'contrato_morador'::financial_entry_origin ELSE 'contrato_proprietario'::financial_entry_origin END,
      c.id, c.profile_id, c.owner_id,
      'Contrato', c.title || ' (' || i || '/' || c.installments_count || ')',
      per_amount, i, c.installments_count,
      (base_date + ((i-1) || ' months')::interval)::date,
      'pendente', auth.uid()
    );
    inserted_count := inserted_count + 1;
  END LOOP;
  RETURN inserted_count;
END $$;

-- prevent delete with active entries
CREATE OR REPLACE FUNCTION public.prevent_party_contract_delete()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM financial_entries WHERE party_contract_id = OLD.id AND status <> 'cancelado') THEN
    RAISE EXCEPTION 'Não é possível excluir: existem lançamentos financeiros ativos. Cancele o contrato.';
  END IF;
  RETURN OLD;
END $$;
CREATE TRIGGER trg_prevent_party_contract_delete BEFORE DELETE ON public.party_contracts
  FOR EACH ROW EXECUTE FUNCTION public.prevent_party_contract_delete();

-- on cancel, cancel pending entries
CREATE OR REPLACE FUNCTION public.cascade_cancel_contract_entries()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.status = 'cancelado' AND OLD.status <> 'cancelado' THEN
    UPDATE financial_entries SET status='cancelado'
      WHERE party_contract_id = NEW.id AND status='pendente';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_cascade_cancel_contract_entries AFTER UPDATE ON public.party_contracts
  FOR EACH ROW EXECUTE FUNCTION public.cascade_cancel_contract_entries();

-- mark overdue
CREATE OR REPLACE FUNCTION public.mark_overdue_financial_entries()
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n int;
BEGIN
  WITH upd AS (
    UPDATE financial_entries SET status='vencido'
    WHERE status='pendente' AND due_date < CURRENT_DATE
    RETURNING id
  ) SELECT count(*) INTO n FROM upd;
  RETURN n;
END $$;
