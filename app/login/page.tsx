import { auth, signIn } from "@/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect("/")

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--paper)" }}>
      <div className="w-full max-w-md border p-10" style={{ background: "var(--paper)", borderColor: "var(--rule)" }}>
        <div className="eyebrow flex justify-between items-center mb-8">
          <span>Wiom · Operations Engine</span>
          <span style={{ color: "var(--warm)" }}>v1</span>
        </div>

        <h1 className="font-serif text-5xl leading-[0.95] tracking-tight" style={{ color: "var(--ink)" }}>
          Closed <em className="italic font-light" style={{ color: "var(--accent)" }}>Loop.</em>
        </h1>
        <p className="font-serif italic text-base mt-4" style={{ color: "var(--ink-2)" }}>
          Seven stages from Sense to Verify. Zero open loops.
        </p>

        <div className="border-t my-8" style={{ borderColor: "var(--rule)" }} />

        <p className="text-[13px] mb-5" style={{ color: "var(--ink-mute)" }}>
          Sign in with your <strong style={{ color: "var(--ink)" }}>@wiom.in</strong> or <strong style={{ color: "var(--ink)" }}>@i2e1.com</strong> Google account.
        </p>

        <form
          action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/" })
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 border px-4 py-3 text-sm font-medium transition hover:bg-[color:var(--paper-2)]"
            style={{ borderColor: "var(--rule)", color: "var(--ink)", background: "var(--paper)" }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>
        </form>

        <p className="text-[11px] font-mono mt-6 italic" style={{ color: "var(--ink-faint)" }}>
          Issue-ID travels every stage. Aging clock per stage. Stuck loops auto-escalate.
        </p>
      </div>
    </div>
  )
}
