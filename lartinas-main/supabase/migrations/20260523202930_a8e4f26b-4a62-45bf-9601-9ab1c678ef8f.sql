
CREATE OR REPLACE FUNCTION public.sync_status_from_contract()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status) THEN
    IF NEW.status = 'ativo' THEN
      IF NEW.room_id IS NOT NULL THEN
        UPDATE public.rooms SET status = 'alugada'::room_status WHERE id = NEW.room_id;
      END IF;
      IF NEW.apartment_id IS NOT NULL THEN
        UPDATE public.apartments SET status = 'alugada'::apartment_status WHERE id = NEW.apartment_id;
      END IF;
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'ativo' AND NEW.status IN ('encerrado','cancelado') THEN
      IF NEW.room_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.contracts WHERE room_id = NEW.room_id AND id <> NEW.id AND status = 'ativo'
      ) THEN
        UPDATE public.rooms SET status = 'disponivel'::room_status WHERE id = NEW.room_id;
      END IF;
      IF NEW.apartment_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.contracts WHERE apartment_id = NEW.apartment_id AND id <> NEW.id AND status = 'ativo'
      ) THEN
        UPDATE public.apartments SET status = 'disponivel'::apartment_status WHERE id = NEW.apartment_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_sync_status_from_contract ON public.contracts;
CREATE TRIGGER trg_sync_status_from_contract
  AFTER INSERT OR UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.sync_status_from_contract();
