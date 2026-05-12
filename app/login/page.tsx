import { auth, signIn } from "@/auth"
import { redirect } from "next/navigation"
import { AuthError } from "next-auth"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await auth()
  if (session) redirect("/")

  const params = await searchParams
  const errorMsg = params.error
    ? "Sign in failed. Check your email is @wiom.in / @i2e1.com and the password is correct."
    : null

  async function doSignIn(formData: FormData) {
    "use server"
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/",
      })
    } catch (err) {
      if (err instanceof AuthError) {
        redirect("/login?error=1")
      }
      throw err
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--paper)" }}>
      <div className="w-full max-w-md border p-10" style={{ background: "var(--paper)", borderColor: "var(--rule)" }}>
        <div className="eyebrow flex justify-between items-center mb-8">
          <span>Wiom · Netbox</span>
          <span style={{ color: "var(--warm)" }}>v1</span>
        </div>

        <h1 className="font-serif text-5xl leading-[0.95] tracking-tight" style={{ color: "var(--ink)" }}>
          Netbox <em className="italic font-light" style={{ color: "var(--accent)" }}>Issue.</em>
        </h1>
        <p className="font-serif italic text-base mt-4" style={{ color: "var(--ink-2)" }}>
          Detection to closure. Seven stages from Sense to Verify.
        </p>

        <div className="border-t my-8" style={{ borderColor: "var(--rule)" }} />

        <p className="text-[13px] mb-5" style={{ color: "var(--ink-mute)" }}>
          Sign in with your <strong style={{ color: "var(--ink)" }}>@wiom.in</strong> or <strong style={{ color: "var(--ink)" }}>@i2e1.com</strong> email and the shared portal password.
        </p>

        {errorMsg && (
          <div className="mb-5 border-l-4 px-3 py-2 text-[13px]" style={{ borderColor: "var(--warm)", background: "var(--warm-soft)", color: "var(--warm)" }}>
            {errorMsg}
          </div>
        )}

        <form action={doSignIn} className="space-y-4">
          <label className="block">
            <span className="block text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: "var(--ink-mute)" }}>Email</span>
            <input
              name="email"
              type="email"
              required
              autoFocus
              placeholder="you@wiom.in"
              className="w-full px-3 py-2.5 border text-[14px] focus:outline-none focus:border-[color:var(--accent)]"
              style={{ borderColor: "var(--rule)", background: "var(--paper)" }}
            />
          </label>

          <label className="block">
            <span className="block text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: "var(--ink-mute)" }}>Password</span>
            <input
              name="password"
              type="password"
              required
              className="w-full px-3 py-2.5 border text-[14px] focus:outline-none focus:border-[color:var(--accent)]"
              style={{ borderColor: "var(--rule)", background: "var(--paper)" }}
            />
          </label>

          <button
            type="submit"
            className="w-full px-4 py-3 text-sm font-medium transition"
            style={{ background: "var(--accent)", color: "var(--paper)" }}
          >
            Sign in
          </button>
        </form>

        <p className="text-[11px] font-mono mt-6 italic" style={{ color: "var(--ink-faint)" }}>
          Issue-ID travels every stage. Aging clock per stage. Stuck loops auto-escalate.
        </p>
      </div>
    </div>
  )
}
