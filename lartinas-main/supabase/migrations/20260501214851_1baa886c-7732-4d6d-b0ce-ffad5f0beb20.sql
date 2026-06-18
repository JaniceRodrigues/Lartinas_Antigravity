-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'operacao', 'moradora', 'proprietario', 'fornecedor');
CREATE TYPE public.house_gender AS ENUM ('feminina', 'mista', 'sem_preferencia');
CREATE TYPE public.room_status AS ENUM ('disponivel', 'reservado', 'ocupado', 'manutencao');
CREATE TYPE public.application_status AS ENUM ('nova', 'em_analise', 'entrevista', 'aprovada', 'recusada', 'cancelada');
CREATE TYPE public.ticket_status AS ENUM ('aberto', 'em_andamento', 'aguardando', 'resolvido', 'fechado');
CREATE TYPE public.ticket_priority AS ENUM ('baixa', 'media', 'alta', 'urgente');
CREATE TYPE public.ticket_category AS ENUM ('manutencao', 'limpeza', 'eletrica', 'hidraulica', 'internet', 'mobilia', 'outro');

-- ============ TIMESTAMP HELPER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ USER ROLES (separate table — security best practice) ============
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============ APARTMENTS ============
CREATE TABLE public.apartments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  address TEXT,
  description TEXT,
  vibe TEXT[] DEFAULT '{}',
  rules TEXT,
  gender public.house_gender NOT NULL DEFAULT 'feminina',
  amenities TEXT[] DEFAULT '{}',
  cover_photo_url TEXT,
  photos TEXT[] DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_apartments_updated BEFORE UPDATE ON public.apartments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ROOMS ============
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  apartment_id UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC(10,2) NOT NULL,
  size_m2 NUMERIC(5,1),
  status public.room_status NOT NULL DEFAULT 'disponivel',
  available_from DATE,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_rooms_apartment ON public.rooms(apartment_id);
CREATE INDEX idx_rooms_status ON public.rooms(status);
CREATE TRIGGER trg_rooms_updated BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ APPLICATIONS ============
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  age INTEGER,
  occupation TEXT,
  move_in_date DATE,
  stay_months INTEGER,
  budget_max NUMERIC(10,2),
  gender_preference public.house_gender DEFAULT 'sem_preferencia',
  lifestyle JSONB DEFAULT '{}'::jsonb,
  answers JSONB DEFAULT '{}'::jsonb,
  status public.application_status NOT NULL DEFAULT 'nova',
  score INTEGER DEFAULT 0,
  suggested_room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_user ON public.applications(user_id);
CREATE TRIGGER trg_applications_updated BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ APPLICATION HISTORY ============
CREATE TABLE public.application_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.application_history ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_app_history_application ON public.application_history(application_id);

-- ============ TICKETS ============
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  apartment_id UUID REFERENCES public.apartments(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category public.ticket_category NOT NULL DEFAULT 'outro',
  priority public.ticket_priority NOT NULL DEFAULT 'media',
  status public.ticket_status NOT NULL DEFAULT 'aberto',
  photos TEXT[] DEFAULT '{}',
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_tickets_reporter ON public.tickets(reporter_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE TRIGGER trg_tickets_updated BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ANNOUNCEMENTS ============
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  apartment_id UUID REFERENCES public.apartments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  pinned BOOLEAN NOT NULL DEFAULT false,
  audience TEXT NOT NULL DEFAULT 'all',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_announcements_updated BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ RLS POLICIES ============

-- profiles: own read/write, admin all
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operacao'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- user_roles: users can read their own roles, only admin can write
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manages roles" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- apartments: public read of active, admin write
CREATE POLICY "Public reads active apartments" ON public.apartments FOR SELECT
  USING (active = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operacao'));
CREATE POLICY "Admin manages apartments" ON public.apartments FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operacao'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operacao'));

-- rooms: public read, admin write
CREATE POLICY "Public reads rooms" ON public.rooms FOR SELECT
  USING (true);
CREATE POLICY "Admin manages rooms" ON public.rooms FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operacao'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operacao'));

-- applications: anyone (incl. anonymous) can submit; user/admin can read own
CREATE POLICY "Anyone can submit application" ON public.applications FOR INSERT
  WITH CHECK (true);
CREATE POLICY "User reads own application" ON public.applications FOR SELECT
  USING (
    (user_id IS NOT NULL AND auth.uid() = user_id)
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'operacao')
  );
CREATE POLICY "Admin updates applications" ON public.applications FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operacao'));
CREATE POLICY "Admin deletes applications" ON public.applications FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- application_history: admin only
CREATE POLICY "Admin reads history" ON public.application_history FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operacao'));
CREATE POLICY "Admin writes history" ON public.application_history FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operacao'));

-- tickets
CREATE POLICY "Reporter reads own tickets" ON public.tickets FOR SELECT
  USING (
    auth.uid() = reporter_id
    OR auth.uid() = assigned_to
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'operacao')
  );
CREATE POLICY "Authenticated creates ticket" ON public.tickets FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Reporter updates own ticket" ON public.tickets FOR UPDATE
  USING (
    auth.uid() = reporter_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'operacao')
  );
CREATE POLICY "Admin deletes tickets" ON public.tickets FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- announcements: authenticated read, admin write
CREATE POLICY "Authenticated reads announcements" ON public.announcements FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin manages announcements" ON public.announcements FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operacao'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operacao'));

-- ============ STORAGE BUCKETS ============
INSERT INTO storage.buckets (id, name, public) VALUES
  ('apartment-photos', 'apartment-photos', true),
  ('room-photos', 'room-photos', true),
  ('ticket-photos', 'ticket-photos', false),
  ('profile-photos', 'profile-photos', true);

-- Storage policies
-- apartment & room photos: public read, admin write
CREATE POLICY "Public reads apartment photos" ON storage.objects FOR SELECT
  USING (bucket_id = 'apartment-photos');
CREATE POLICY "Admin uploads apartment photos" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'apartment-photos' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operacao')));
CREATE POLICY "Admin updates apartment photos" ON storage.objects FOR UPDATE
  USING (bucket_id = 'apartment-photos' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operacao')));
CREATE POLICY "Admin deletes apartment photos" ON storage.objects FOR DELETE
  USING (bucket_id = 'apartment-photos' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operacao')));

CREATE POLICY "Public reads room photos" ON storage.objects FOR SELECT
  USING (bucket_id = 'room-photos');
CREATE POLICY "Admin uploads room photos" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'room-photos' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operacao')));
CREATE POLICY "Admin updates room photos" ON storage.objects FOR UPDATE
  USING (bucket_id = 'room-photos' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operacao')));
CREATE POLICY "Admin deletes room photos" ON storage.objects FOR DELETE
  USING (bucket_id = 'room-photos' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operacao')));

-- profile photos: public read, user manages own (folder = user id)
CREATE POLICY "Public reads profile photos" ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-photos');
CREATE POLICY "User uploads own profile photo" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "User updates own profile photo" ON storage.objects FOR UPDATE
  USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "User deletes own profile photo" ON storage.objects FOR DELETE
  USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ticket photos: reporter + admin
CREATE POLICY "Reporter reads own ticket photos" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'ticket-photos' AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'operacao')
    )
  );
CREATE POLICY "User uploads own ticket photo" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ticket-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admin manages ticket photos" ON storage.objects FOR DELETE
  USING (bucket_id = 'ticket-photos' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operacao')));