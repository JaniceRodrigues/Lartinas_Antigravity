-- Fix mutable search_path on remaining functions
ALTER FUNCTION public.prevent_signed_document_update() SET search_path = public;
ALTER FUNCTION public.prevent_party_contract_delete() SET search_path = public;

-- Revoke execute on SECURITY DEFINER functions from anon role (only authenticated should call)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_timeline(timeline_entity, uuid, text, text, text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.apply_overdue_charges() FROM anon;
REVOKE EXECUTE ON FUNCTION public.expire_overdue_reservations() FROM anon;
REVOKE EXECUTE ON FUNCTION public.mark_overdue_financial_entries() FROM anon;
REVOKE EXECUTE ON FUNCTION public.generate_contract_financial_entries(uuid) FROM anon;