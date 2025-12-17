import NextAuth from "next-auth";
import prisma from "./db/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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

     * Add fields to session
     */
    async session({ session, token, trigger, user }) {
      session.user.id = token.sub!;
      session.user.role = typeof token.role === "string" ? token.role : "user";
      session.user.name = token.name;

      // When session.update
      if (trigger === "update" && user?.name) {
        session.user.name = user.name;
      }

      return session;
    },

    /**
     * JWT callback — MUST ALWAYS RETURN TOKEN
     */
    async jwt({ token, user, trigger, session }) {
      // When logging in for the first time
      if (user) {
        token.sub = user.id;
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
        if (trigger === "signIn" || trigger === "signUp") {
          const cookiesObject = await cookies();
          const sessionCardId = cookiesObject.get("sessionCartId")?.value;

          if (sessionCardId) {
            const sessionCart = await prisma.cart.findFirst({
              where: { sessionCartId: sessionCardId },
            });
            if (sessionCart) {
              // delete current user cart
              await prisma.cart.deleteMany({
                where: { userId: user.id },
              });
              await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { userId: user.id },
              });
            }
          }
        }
      }
      if (session?.user.name && "trigger") {
        token.name = session.user.name;
      }
      return token; // IMPORTANT — always return token
    },
    // authorized({ request, auth }: any) {
    //   // Array of regex patterns for paths we want to protect
    //   const protectedPaths = [
    //     /\/shipping-address/,
    //     /\/payment-method/,
    //     /\/place-order/,
    //     /\/profile/,
    //     /\/user\/(.+)/,
    //     /\/order\/(.+)/,
    //     /\/admin/,
    //   ];

    //   // // Get pathname from the request URL object
    //   const { pathname } = request.nextUrl;

    //   // Check if the current path matches any of the protected paths
    //   if (protectedPaths.some((pattern) => pattern.test(pathname))) {
    //     return false;
    //   }

    //   if (!request.cookies.get("sessionCartId")) {
    //     // Generate a random sessionCartId and set it as a cookie
    //     const sessionCartId = crypto.randomUUID();

    //     // Clone the req header
    //     const newRequestHeaders = new Headers(request.headers);

    //     // Create new response and add the new headers
    //     const response = NextResponse.next({
    //       request: {
    //         headers: newRequestHeaders,
    //       },
    //     });
    //     //  set newly generated sessionCartId as a cookie
    //     response.cookies.set("sessionCartId", sessionCartId);
    //     return response;
    //   } else {
    //     return true;
    //   }
    // },
    authorized({ request, auth }) {
      const protectedPaths = [
        /\/shipping-address/,
        /\/payment-method/,
        /\/place-order/,
        /\/profile/,
        /\/user\/(.+)/,
        /\/order\/(.+)/,
        /\/admin/,
      ];

      const { pathname } = request.nextUrl;

      const isProtected = protectedPaths.some((pattern) =>
        pattern.test(pathname)
      );

      // If route is protected and user not logged in → block
      if (isProtected) {
        return !!auth?.user; // ✅ allow if user exists
      }

      // Session cart cookie logic
      if (!request.cookies.get("sessionCartId")) {
        const sessionCartId = crypto.randomUUID();
        const newRequestHeaders = new Headers(request.headers);

        const response = NextResponse.next({
          request: { headers: newRequestHeaders },
        });

        response.cookies.set("sessionCartId", sessionCartId);
        return response;
      }

      return true;
    },
  },

  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  adapter: PrismaAdapter(prisma),
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(config);
