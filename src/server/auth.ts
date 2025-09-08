import { getServerSession, type NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { db } from "~/server/db";
import { env } from "~/env";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
};

export const getServerAuthSession = () => getServerSession(authOptions);
