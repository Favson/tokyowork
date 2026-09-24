import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { setAuthTokenGetter } from "@workspace/api-client-react";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const clientAdminEmails = new Set(
  (import.meta.env.VITE_ADMIN_EMAILS as string | undefined ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);
export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        persistSession: true,
        storage: window.sessionStorage,
      },
    })
  : null;

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configError: string | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setAuthTokenGetter(null);
      return;
    }

    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setLoading(false);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    setAuthTokenGetter(async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
      setAuthTokenGetter(null);
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    session,
    loading,
    configError: supabaseConfigured ? null : "Supabase Auth is not configured for this environment.",
    signOut: async () => {
      if (supabase) await supabase.auth.signOut();
    },
  }), [loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}