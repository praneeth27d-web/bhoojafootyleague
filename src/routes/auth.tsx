import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, Card } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "League Admin Sign In — Bhooja Football League" },
      {
        name: "description",
        content: "Sign in to update Bhooja Football League results, squads and transfers.",
      },
      { property: "og:title", content: "BFL Admin Sign In" },
      { property: "og:description", content: "Private sign in for league organisers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-primary";

function AuthPage() {
  const navigate = useNavigate();
  const { session, ready } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && session) void navigate({ to: "/admin", replace: true });
  }, [ready, session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    setBusy(false);
  }

  return (
    <AppShell title="League admin" subtitle="Private area for updating the league">
      <div className="max-w-md">
        <Card title="Sign in">
          <form onSubmit={submit} className="space-y-4 px-4 py-5">
            <label className="block text-xs font-semibold text-muted-foreground">
              Email
              <input
                type="email"
                required
                autoComplete="email"
                className={`mt-1 ${inputClass}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block text-xs font-semibold text-muted-foreground">
              Password
              <input
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
                className={`mt-1 ${inputClass}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && <p className="text-sm font-semibold text-destructive">{error}</p>}
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Please wait…" : "Sign in"}
            </button>
          </form>
        </Card>
        <p className="mt-3 text-xs text-muted-foreground">
          Sign in with the league admin account. New accounts cannot be created.
        </p>
      </div>
    </AppShell>
  );
}
