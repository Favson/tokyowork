import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, LoaderCircle, LogOut, ShieldCheck } from "lucide-react";
import { supabase, useAuth } from "@/lib/auth";

export function AuthPanel({ compact = false }: { compact?: boolean }) {
  const { user, loading, configError, signOut } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (loading) {
    return <div className="border border-[#f1eadb]/15 bg-[#29211b] p-5 text-sm text-[#b9ad9c]" data-testid="loading-auth">Checking sign-in…</div>;
  }

  if (user) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 border border-[#a8c19b]/30 bg-[#a8c19b]/[.06] p-4" data-testid="panel-authenticated">
        <div className="flex items-center gap-3">
          <ShieldCheck size={17} className="text-[#a8c19b]" />
          <p className="text-[0.82rem] text-[#d6ccba]">Signed in as <strong className="text-[#f1eadb]">{user.email}</strong></p>
        </div>
        <button type="button" onClick={() => void signOut()} className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[.14em] text-[#cf9e54]" data-testid="button-sign-out">
          <LogOut size={13} /> Sign out
        </button>
      </div>
    );
  }

  if (configError) {
    return <div className="border border-[#c46d52]/40 bg-[#c46d52]/10 p-5 text-[0.8rem] leading-[1.6] text-[#e7aa8d]" role="alert" data-testid="text-auth-config-error">{configError} Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before enabling sign-in.</div>;
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError("");
    setMessage("");
    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.href } });
    setBusy(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    if (mode === "signup" && !result.data.session) {
      setMessage("Check your email to confirm your account, then return here to sign in.");
    }
  };

  return (
    <div className={`border border-[#cf9e54]/35 bg-[#cf9e54]/[.05] ${compact ? "p-5" : "p-6 sm:p-8"}`} data-testid="panel-auth">
      <div className="mb-5">
        <p className="eyebrow mb-2">Account required</p>
        <h2 className="display-serif text-3xl text-[#f1eadb]">{mode === "signin" ? "Sign in to order." : "Create your account."}</h2>
        <p className="mt-3 text-[0.8rem] leading-[1.6] text-[#b9ad9c]">Use Google or your email and password. Your account keeps your order history private.</p>
      </div>
      <button
        type="button"
        onClick={() => { if (supabase) void supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.href } }); }}
        className="flex w-full items-center justify-center gap-3 border border-[#f1eadb]/25 px-4 py-3 font-mono text-[0.62rem] uppercase tracking-[.14em] text-[#f1eadb] transition-colors hover:border-[#cf9e54]"
        data-testid="button-sign-in-google"
      >
        Continue with Google <ArrowRight size={14} />
      </button>
      <div className="my-5 flex items-center gap-3 text-[0.58rem] uppercase tracking-[.16em] text-[#817667]"><span className="h-px flex-1 bg-[#f1eadb]/10" />or<span className="h-px flex-1 bg-[#f1eadb]/10" /></div>
      <form onSubmit={submit} className="space-y-4">
        <label className="block"><span className="field-label">Email</span><input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field-input" data-testid="input-auth-email" /></label>
        <label className="block"><span className="field-label">Password</span><input type="password" required minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="field-input" data-testid="input-auth-password" /></label>
        {error && <p className="border border-[#c46d52]/40 bg-[#c46d52]/10 p-3 text-[0.75rem] leading-[1.5] text-[#e7aa8d]" role="alert" data-testid="text-auth-error">{error}</p>}
        {message && <p className="border border-[#a8c19b]/30 bg-[#a8c19b]/[.06] p-3 text-[0.75rem] leading-[1.5] text-[#c7d9bd]" role="status" data-testid="text-auth-message">{message}</p>}
        <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-3 bg-[#cf9e54] px-4 py-3 font-mono text-[0.62rem] uppercase tracking-[.14em] text-[#211d17] disabled:opacity-60" data-testid="button-submit-auth">
          {busy ? <LoaderCircle size={14} className="animate-spin" /> : null}{mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
      <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }} className="mt-5 font-mono text-[0.59rem] uppercase tracking-[.13em] text-[#cf9e54]" data-testid="button-toggle-auth-mode">
        {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}

export function AdminMfaGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [factorId, setFactorId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");

  const prepare = async () => {
    if (!supabase || !user) return;
    setLoading(true);
    setError("");
    const { data: assurance, error: assuranceError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assuranceError) {
      setError(assuranceError.message);
      setLoading(false);
      return;
    }
    if (assurance.currentLevel === "aal2") {
      setReady(true);
      setLoading(false);
      return;
    }
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) {
      setError(factorsError.message);
      setLoading(false);
      return;
    }
    const verified = factors.totp.find((factor) => factor.status === "verified");
    if (verified) {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: verified.id });
      if (challengeError) setError(challengeError.message);
      else {
        setFactorId(verified.id);
        setChallengeId(challenge.id);
      }
    } else {
      const { data: enrollment, error: enrollmentError } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Tokyo by LYA staff" });
      if (enrollmentError) setError(enrollmentError.message);
      else {
        setFactorId(enrollment.id);
        setQrCode(enrollment.totp.qr_code);
        setSecret(enrollment.totp.secret);
      }
    }
    setLoading(false);
  };

  useEffect(() => { void prepare(); }, [user?.id]);

  if (ready) return <>{children}</>;
  return (
    <div className="border border-[#cf9e54]/35 bg-[#cf9e54]/[.05] p-6 sm:p-8" data-testid="panel-admin-mfa">
      <p className="eyebrow mb-3">Staff verification</p>
      <h2 className="display-serif text-4xl text-[#f1eadb]">Secure the console.</h2>
      <p className="mt-4 max-w-[560px] text-[0.82rem] leading-[1.7] text-[#b9ad9c]">Admin access requires a time-based one-time code. Use an authenticator app, not SMS, for stronger protection.</p>
      {loading && <p className="mt-5 text-sm text-[#b9ad9c]">Preparing MFA…</p>}
      {qrCode && <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start"><img src={qrCode} alt="Scan this QR code in your authenticator app" className="h-44 w-44 bg-white p-2" data-testid="img-mfa-qr" /><div className="text-[0.75rem] leading-[1.6] text-[#b9ad9c]">Scan the QR code. If needed, enter this secret manually: <code className="break-all text-[#f1eadb]">{secret}</code></div></div>}
      {(factorId || qrCode) && <form onSubmit={async (event) => { event.preventDefault(); setError(""); if (!supabase) return; const challengeResult = challengeId ? { data: { id: challengeId } } : await supabase.auth.mfa.challenge({ factorId }); const currentChallenge = challengeResult.data?.id; if (!currentChallenge) return; const result = await supabase.auth.mfa.verify({ factorId, challengeId: currentChallenge, code: code.trim() }); if (result.error) setError(result.error.message); else { setReady(true); setChallengeId(""); setQrCode(""); } }} className="mt-6 flex flex-col gap-3 sm:flex-row"><input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value)} className="field-input sm:max-w-48" placeholder="6-digit code" aria-label="MFA code" data-testid="input-mfa-code" /><button type="submit" className="bg-[#cf9e54] px-5 py-3 font-mono text-[0.62rem] uppercase tracking-[.14em] text-[#211d17]" data-testid="button-verify-mfa">Verify MFA</button></form>}
      {error && <p className="mt-4 border border-[#c46d52]/40 bg-[#c46d52]/10 p-3 text-[0.75rem] text-[#e7aa8d]" role="alert" data-testid="text-mfa-error">{error}</p>}
    </div>
  );
}