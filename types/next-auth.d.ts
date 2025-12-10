import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    role?: string | null;
    name?: string | null;
  }
}
