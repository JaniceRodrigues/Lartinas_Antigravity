
REVOKE EXECUTE ON FUNCTION public.enforce_contract_application() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_room_no_overlap() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_timeline(public.timeline_entity, uuid, text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tl_applications() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tl_contracts() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tl_payments() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tl_tickets() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tl_inspections() FROM PUBLIC, anon, authenticated;
