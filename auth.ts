import NextAuth from "next-auth";
import prisma from "./db/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
export const config = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user
        const user = await prisma.user.findFirst({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        // Compare password
        const isMatch = compareSync(
          credentials.password as string,
          user.password
        );

        if (!isMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    /**
     * Protect routes
     */
    // authorized({ auth, request: { nextUrl } }) {
    //   const isLoggedIn = !!auth?.user;
    //   const isOnSignIn = nextUrl.pathname.startsWith("/sign-in");
    //   const isOnSignUp = nextUrl.pathname.startsWith("/sign-up");

    //   if (isOnSignIn || isOnSignUp) return true;

    //   if (!isLoggedIn) return false;

    //   return true;
    // },

    /**
     * Add fields to session
     */
    async session({ session, token, trigger, user }) {
      session.user.id = token.sub!;
      session.user.role = typeof token.role === "string" ? token.role : "user";
      session.user.name = token.name;

      // When session.update() is called
      if (trigger === "update" && user?.name) {
        session.user.name = user.name;
      }

      return session;
    },

    /**
     * JWT callback — MUST ALWAYS RETURN TOKEN
     */
    async jwt({ token, user, trigger }) {
      // When logging in for the first time
      if (user) {
        token.role = user.role;

        if (user.name === "NO_NAME") {
          token.name = user.email!.split("@")[0];

          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        } else {
          token.name = user.name;
        }
      }

      return token; // IMPORTANT — always return token
    },
    authorized({ request, auth }: any) {
      if (!request.cookies.get("sessionCartId")) {
        // Generate a random sessionCartId and set it as a cookie
        const sessionCartId = crypto.randomUUID();

        // Clone the req header
        const newRequestHeaders = new Headers(request.headers);

        // Create new response and add the new headers
        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        });
        //  set newly generated sessionCartId as a cookie
        response.cookies.set("sessionCartId", sessionCartId);
        return response;
      } else {
        return true;
      }
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  adapter: PrismaAdapter(prisma),
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(config);
