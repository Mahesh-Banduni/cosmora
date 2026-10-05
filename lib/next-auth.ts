import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/generated/prisma/enums";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
    error: "/login",
  },
  secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });

        // Compare against a dummy hash when the user is missing so the
        // response time does not reveal whether the account exists.
        const hash =
          user?.passwordHash ??
          "$2a$12$abcdefghijklmnopqrstuuI5s4J8PqXwZ2hJ7kYvN3pQ9sR2tU5vW6xYy";
        const valid = await compare(credentials.password, hash);

        if (!user || !valid) return null;
        if (user.status !== "ACTIVE") return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
        token.organizationId =
          (user as { organizationId?: string | null }).organizationId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.organizationId =
          (token.organizationId as string | null) ?? null;
      }
      return session;
    },
  },
};