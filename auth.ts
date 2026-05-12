import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

const ALLOWED_DOMAINS = ["wiom.in", "i2e1.com"]
const SHARED_PASSWORD = "Netbox@500"

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Wiom credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = String(creds?.email || "").trim().toLowerCase()
        const password = String(creds?.password || "")
        if (!email || !password) return null
        const domain = email.split("@")[1]
        if (!ALLOWED_DOMAINS.includes(domain || "")) return null
        if (password !== SHARED_PASSWORD) return null
        return { id: email, email, name: email.split("@")[0] }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
})
