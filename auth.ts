import NextAuth from "next-auth";
import prisma from "./db/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";

export const config = {
  providers: [
    CredentialProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        // Find user by email
        const user = await prisma.user.findFirst({
          where: { email: credentials.email as string },
        });
        // check password match
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );

          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        return null;
      },
    }),
  ],
  // callbacks: {
  //   async session({ session, token, trigger, user }: any) {
  //     //set the user id and role to session
  //     session.user.id = token.sub;
  //     //if there is an update, set the user name
  //     if (trigger === "update") {
  //       session.user.name = user.name;
  //     }

  //     return session;
  //   },
  // },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnSignIn = nextUrl.pathname.startsWith("/sign-in");
      const isOnSignUp = nextUrl.pathname.startsWith("/sign-up");

      // Allow access to sign-in and sign-up pages
      if (isOnSignIn || isOnSignUp) {
        return true;
      }

      // For protected routes, redirect to sign-in if not logged in
      if (!isLoggedIn) {
        return false; // This will redirect to sign-in page
      }

      return true;
    },

    async session({ session, token, trigger, user }: any) {
      //set the user id and role to session
      session.user.id = token.sub;
      //if there is an update, set the user name
      if (trigger === "update") {
        session.user.name = user.name;
      }

      return session;
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
