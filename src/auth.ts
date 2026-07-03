import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db, isDemoMode } from "@/lib/db";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: isDemoMode ? undefined : PrismaAdapter(db as any),
  secret: process.env.AUTH_SECRET || "default-auth-secret-key-finance-ai-sandbox",
  ...authConfig,
});
