
REVOKE EXECUTE ON FUNCTION public.user_has_apartment_access(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_has_apartment_access(uuid, uuid) TO authenticated, service_role;
