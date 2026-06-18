INSERT INTO public.user_roles (user_id, role)
VALUES ('aa97a03d-c6c0-4714-a40b-bb2967032119', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;