import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "operacao" | "financeiro" | "comercial" | "moradora" | "proprietario" | "fornecedor";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  hasRole: (r: AppRole) => boolean;
  isAdmin: boolean;
  isStaff: boolean;
  loading: boolean;
  rolesLoading: boolean;
  authReady: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  // Session ref keeps the latest token available without causing re-renders
  // on every TOKEN_REFRESHED event.
  const sessionRef = useRef<Session | null>(null);

  useEffect(() => {
    let active = true;
    let currentUserId: string | null = null;
    let rolesFetchedFor: string | null = null;

    const fetchRoles = async (uid: string, isInitial: boolean) => {
      if (isInitial) setRolesLoading(true);
      try {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
        if (!active) return;
        setRoles((data ?? []).map((r) => r.role as AppRole));
        rolesFetchedFor = uid;
      } catch {
        if (active) setRoles([]);
      } finally {
        if (active && isInitial) setRolesLoading(false);
      }
    };

    const handleSession = (sess: Session | null) => {
      sessionRef.current = sess;
      const nextUserId = sess?.user?.id ?? null;
      const userChanged = nextUserId !== currentUserId;

      if (userChanged) {
        currentUserId = nextUserId;
        setUser(sess?.user ?? null);
        if (sess?.user) {
          fetchRoles(sess.user.id, rolesFetchedFor !== sess.user.id);
        } else {
          setRoles([]);
          setRolesLoading(false);
          rolesFetchedFor = null;
        }
      }
      if (active) setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      handleSession(sess);
    });

    supabase.auth.getSession().then(({ data }) => handleSession(data.session));

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const isAdmin = roles.includes("admin") || roles.includes("operacao");
    const isStaff = isAdmin || roles.includes("financeiro") || roles.includes("comercial");
    return {
      session: sessionRef.current,
      user,
      roles,
      hasRole: (r: AppRole) => roles.includes(r),
      isAdmin,
      isStaff,
      loading,
      rolesLoading,
      authReady: !loading,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    };
  }, [user, roles, loading, rolesLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx) return ctx;
  // Safety fallback: a "neutral" loading state if used outside provider.
  // Prevents crashes during isolated tests/storybook; production tree wraps with AuthProvider.
  return {
    session: null,
    user: null,
    roles: [],
    hasRole: () => false,
    isAdmin: false,
    isStaff: false,
    loading: true,
    rolesLoading: true,
    authReady: false,
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
}
