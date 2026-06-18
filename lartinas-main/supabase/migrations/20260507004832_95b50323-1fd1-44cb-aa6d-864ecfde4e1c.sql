-- Restore execute permissions (needed for RLS policies and triggers to work)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_timeline(timeline_entity, uuid, text, text, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_overdue_charges() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_overdue_reservations() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_overdue_financial_entries() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_contract_financial_entries(uuid) TO anon, authenticated;