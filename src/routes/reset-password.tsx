import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, Card } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Admin Password — Bhooja Football League" },
      { name: "description", content: "Set a new password for the BFL league admin account." },
      { property: "og:title", content: "BFL Admin Password Reset" },
      { property: "og:description", content: "Set a new league admin password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-primary";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setReady(true);
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    void supabase.auth.getSession().then(({ data: d }) => d.session && setReady(true));
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setBusy(false);
      return setError(err.message);
    }
    // Sign out every device, including this one, so the new password is required everywhere.
    await supabase.auth.signOut({ scope: "global" });
    setBusy(false);
    setDone(true);
  }

  return (
    <AppShell title="Reset password" subtitle="League admin account">
      <div className="max-w-md">
        <Card title="Set a new password">
          {done ? (
            <div className="space-y-4 px-4 py-5 text-sm">
              <p>Password changed. All devices have been signed out.</p>
              <button
                type="button"
                onClick={() => navigate({ to: "/auth" })}
                className="w-full rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground"
              >
                Sign in
              </button>
            </div>
          ) : !ready ? (
            <p className="px-4 py-5 text-sm text-muted-foreground">
              Open this page from the reset link in your email.
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-4 px-4 py-5">
              <label className="block text-xs font-semibold text-muted-foreground">
                New password
                <input type="password" required minLength={6} autoComplete="new-password"
                  className={`mt-1 ${inputClass}`} value={password}
                  onChange={(e) => setPassword(e.target.value)} />
              </label>
              <label className="block text-xs font-semibold text-muted-foreground">
                Confirm password
                <input type="password" required minLength={6} autoComplete="new-password"
                  className={`mt-1 ${inputClass}`} value={confirm}
                  onChange={(e) => setConfirm(e.target.value)} />
              </label>
              {error && <p className="text-sm font-semibold text-destructive">{error}</p>}
              <button type="submit" disabled={busy}
                className="w-full rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60">
                {busy ? "Saving…" : "Save and sign out all devices"}
              </button>
            </form>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
