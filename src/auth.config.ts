import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "google-placeholder-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "google-placeholder-client-secret",
    }),
    Credentials({
      id: "demo",
      name: "Demo Account",
      credentials: {},
      async authorize() {
        // Return developer demo account
        return {
          id: "demo-user-id",
          name: "Alex Sterling",
          email: "alex@example.com",
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        };
      }
    })
  ],
  session: {
    strategy: "jwt", // JWT works with credentials provider and edge runtimes
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.sub || "demo-user-id") as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: "/login",
  }
} satisfies NextAuthConfig;
