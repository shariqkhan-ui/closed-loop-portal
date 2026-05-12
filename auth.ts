import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

const ALLOWED_DOMAINS = ["wiom.in", "i2e1.com"]

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    signIn({ profile }) {
      const email = profile?.email
      if (!email) return false
      const domain = email.split("@")[1]?.toLowerCase()
      return ALLOWED_DOMAINS.includes(domain ?? "")
    },
    session({ session }) {
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
})
