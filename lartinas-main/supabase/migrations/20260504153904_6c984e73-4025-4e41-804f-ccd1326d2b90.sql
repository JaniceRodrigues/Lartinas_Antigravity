-- Revogar EXECUTE de roles públicas em funções SECURITY DEFINER que só devem rodar via triggers/RLS internos
REVOKE EXECUTE ON FUNCTION public.tl_inspections() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tl_applications() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tl_contracts() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tl_payments() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tl_tickets() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_contract_application() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_room_no_overlap() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_timeline(public.timeline_entity, uuid, text, text, text, jsonb) FROM PUBLIC, anon, authenticated;

-- has_role precisa ser executável por usuários autenticados (usado em policies RLS via PostgREST)
-- mantém EXECUTE para authenticated apenas
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;