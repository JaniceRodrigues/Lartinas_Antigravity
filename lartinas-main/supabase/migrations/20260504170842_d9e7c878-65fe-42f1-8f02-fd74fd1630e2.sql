
-- Extend enums
ALTER TYPE payment_kind ADD VALUE IF NOT EXISTS 'reserva';
ALTER TYPE payment_kind ADD VALUE IF NOT EXISTS 'proporcional';
ALTER TYPE payment_kind ADD VALUE IF NOT EXISTS 'repasse';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'expirado';

-- Extend payments
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS person_id uuid,
  ADD COLUMN IF NOT EXISTS late_fee numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS interest numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS proof_url text,
  ADD COLUMN IF NOT EXISTS receipt_number text,
  ADD COLUMN IF NOT EXISTS batch_id uuid,
  ADD COLUMN IF NOT EXISTS original_amount numeric,
  ADD COLUMN IF NOT EXISTS expires_at date;

-- contract_billing_rules
CREATE TABLE IF NOT EXISTS public.contract_billing_rules (
  contract_id uuid PRIMARY KEY,
  grace_days int NOT NULL DEFAULT 5,
  late_fee_type text NOT NULL DEFAULT 'percentual' CHECK (late_fee_type IN ('fixo','percentual')),
  late_fee_value numeric NOT NULL DEFAULT 2,
  daily_interest_pct numeric NOT NULL DEFAULT 0.033,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contract_billing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manages billing rules" ON public.contract_billing_rules
  FOR ALL USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao') OR has_role(auth.uid(),'financeiro'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao') OR has_role(auth.uid(),'financeiro'));
CREATE POLICY "Tenant reads own billing rules" ON public.contract_billing_rules
  FOR SELECT USING (contract_id IN (SELECT id FROM contracts WHERE tenant_id = auth.uid()));
CREATE TRIGGER trg_billing_rules_updated BEFORE UPDATE ON public.contract_billing_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- deposits
CREATE TABLE IF NOT EXISTS public.deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL,
  amount numeric NOT NULL,
  multiplier numeric,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  expected_return_date date,
  status text NOT NULL DEFAULT 'retido' CHECK (status IN ('retido','devolvido','parcial','usado')),
  returned_amount numeric NOT NULL DEFAULT 0,
  justification text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manages deposits" ON public.deposits
  FOR ALL USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao') OR has_role(auth.uid(),'financeiro'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao') OR has_role(auth.uid(),'financeiro'));
CREATE POLICY "Tenant reads own deposits" ON public.deposits
  FOR SELECT USING (contract_id IN (SELECT id FROM contracts WHERE tenant_id = auth.uid()));
CREATE TRIGGER trg_deposits_updated BEFORE UPDATE ON public.deposits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: enforce justification on partial/used returns
CREATE OR REPLACE FUNCTION public.enforce_deposit_return()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.status IN ('parcial','usado') AND (NEW.justification IS NULL OR length(trim(NEW.justification)) = 0) THEN
    RAISE EXCEPTION 'Justificativa obrigatória para devolução parcial ou uso de caução';
  END IF;
  IF NEW.returned_amount > NEW.amount THEN
    RAISE EXCEPTION 'Valor devolvido não pode exceder o valor da caução';
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.enforce_deposit_return() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER trg_deposit_return BEFORE INSERT OR UPDATE ON public.deposits
  FOR EACH ROW EXECUTE FUNCTION public.enforce_deposit_return();

-- owner_payouts
CREATE TABLE IF NOT EXISTS public.owner_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  model text NOT NULL CHECK (model IN ('percentual','liquido','fixo')),
  percentage numeric,
  gross_revenue numeric NOT NULL DEFAULT 0,
  costs numeric NOT NULL DEFAULT 0,
  final_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','pago','cancelado')),
  paid_at timestamptz,
  proof_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.owner_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manages payouts" ON public.owner_payouts
  FOR ALL USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao') OR has_role(auth.uid(),'financeiro'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao') OR has_role(auth.uid(),'financeiro'));
CREATE POLICY "Owner reads own payouts" ON public.owner_payouts
  FOR SELECT USING (owner_id IN (SELECT id FROM owners WHERE profile_id = auth.uid()));
CREATE TRIGGER trg_payouts_updated BEFORE UPDATE ON public.owner_payouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: enforce period closed
CREATE OR REPLACE FUNCTION public.enforce_payout_period()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.period_end >= CURRENT_DATE THEN
    RAISE EXCEPTION 'Repasse só pode ser criado após fechamento do período (period_end deve ser passado)';
  END IF;
  IF NEW.period_end < NEW.period_start THEN
    RAISE EXCEPTION 'period_end deve ser maior que period_start';
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.enforce_payout_period() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER trg_payout_period BEFORE INSERT ON public.owner_payouts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_payout_period();

-- owner_payout_items
CREATE TABLE IF NOT EXISTS public.owner_payout_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id uuid NOT NULL REFERENCES public.owner_payouts(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('receita','custo')),
  payment_id uuid,
  description text,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.owner_payout_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manages payout items" ON public.owner_payout_items
  FOR ALL USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao') OR has_role(auth.uid(),'financeiro'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao') OR has_role(auth.uid(),'financeiro'));
CREATE POLICY "Owner reads own payout items" ON public.owner_payout_items
  FOR SELECT USING (payout_id IN (SELECT id FROM owner_payouts WHERE owner_id IN (SELECT id FROM owners WHERE profile_id = auth.uid())));

-- payment_batches
CREATE TABLE IF NOT EXISTS public.payment_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type text NOT NULL,
  actor_id uuid,
  affected_count int NOT NULL DEFAULT 0,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff reads batches" ON public.payment_batches
  FOR SELECT USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao') OR has_role(auth.uid(),'financeiro'));
CREATE POLICY "Staff writes batches" ON public.payment_batches
  FOR INSERT WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao') OR has_role(auth.uid(),'financeiro'));

-- payment_charges
CREATE TABLE IF NOT EXISTS public.payment_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL CHECK (kind IN ('multa','juros')),
  amount numeric NOT NULL,
  reason text
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_payment_charge_multa
  ON public.payment_charges(payment_id) WHERE kind = 'multa';
ALTER TABLE public.payment_charges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff reads charges" ON public.payment_charges
  FOR SELECT USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao') OR has_role(auth.uid(),'financeiro'));
CREATE POLICY "Staff writes charges" ON public.payment_charges
  FOR INSERT WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao') OR has_role(auth.uid(),'financeiro'));
CREATE POLICY "Tenant reads own charges" ON public.payment_charges
  FOR SELECT USING (payment_id IN (SELECT p.id FROM payments p JOIN contracts c ON c.id = p.contract_id WHERE c.tenant_id = auth.uid()));

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs','payment-proofs', false)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Staff reads payment proofs" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-proofs' AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao') OR has_role(auth.uid(),'financeiro')));
CREATE POLICY "Staff uploads payment proofs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'payment-proofs' AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao') OR has_role(auth.uid(),'financeiro')));
CREATE POLICY "Staff updates payment proofs" ON storage.objects
  FOR UPDATE USING (bucket_id = 'payment-proofs' AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao') OR has_role(auth.uid(),'financeiro')));
CREATE POLICY "Staff deletes payment proofs" ON storage.objects
  FOR DELETE USING (bucket_id = 'payment-proofs' AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'operacao') OR has_role(auth.uid(),'financeiro')));

-- Apply overdue charges function
CREATE OR REPLACE FUNCTION public.apply_overdue_charges()
RETURNS TABLE(updated_payment_id uuid, multa_applied numeric, juros_applied numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  r RECORD;
  rule RECORD;
  days_late int;
  multa_val numeric;
  juros_val numeric;
  base_amount numeric;
BEGIN
  FOR r IN
    SELECT p.* FROM payments p
    WHERE p.status IN ('pendente','atrasado')
      AND p.due_date < CURRENT_DATE
  LOOP
    SELECT * INTO rule FROM contract_billing_rules WHERE contract_id = r.contract_id;
    IF NOT FOUND THEN
      rule.grace_days := 5;
      rule.late_fee_type := 'percentual';
      rule.late_fee_value := 2;
      rule.daily_interest_pct := 0.033;
    END IF;

    days_late := (CURRENT_DATE - r.due_date) - rule.grace_days;
    IF days_late <= 0 THEN CONTINUE; END IF;

    base_amount := COALESCE(r.original_amount, r.amount);
    multa_val := 0;
    juros_val := 0;

    -- Multa (apenas uma vez)
    IF NOT EXISTS (SELECT 1 FROM payment_charges WHERE payment_id = r.id AND kind = 'multa') THEN
      IF rule.late_fee_type = 'fixo' THEN
        multa_val := rule.late_fee_value;
      ELSE
        multa_val := round(base_amount * rule.late_fee_value / 100, 2);
      END IF;
      IF multa_val > 0 THEN
        INSERT INTO payment_charges(payment_id, kind, amount, reason)
          VALUES (r.id, 'multa', multa_val, 'Multa por atraso ('||rule.late_fee_value||(CASE WHEN rule.late_fee_type='percentual' THEN '%' ELSE ' fixo' END)||')');
      END IF;
    END IF;

    -- Juros (recalcula sempre)
    juros_val := round(base_amount * (rule.daily_interest_pct / 100) * days_late, 2);

    UPDATE payments SET
      status = 'atrasado',
      late_fee = COALESCE((SELECT SUM(amount) FROM payment_charges WHERE payment_id = r.id AND kind = 'multa'),0),
      interest = juros_val,
      original_amount = COALESCE(original_amount, amount),
      amount = base_amount + COALESCE((SELECT SUM(amount) FROM payment_charges WHERE payment_id = r.id AND kind = 'multa'),0) + juros_val
      WHERE id = r.id;

    updated_payment_id := r.id;
    multa_applied := multa_val;
    juros_applied := juros_val;
    RETURN NEXT;
  END LOOP;
END $$;
REVOKE EXECUTE ON FUNCTION public.apply_overdue_charges() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_overdue_charges() TO authenticated;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON public.payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_contract ON public.payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_deposits_contract ON public.deposits(contract_id);
CREATE INDEX IF NOT EXISTS idx_payouts_owner ON public.owner_payouts(owner_id);
