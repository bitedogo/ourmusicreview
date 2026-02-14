import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { initializeDatabase } from "../db";
import { User } from "../db/entities/User";
import bcrypt from "bcryptjs";

function isBcryptHash(value: string) {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        id: { label: "ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.id || !credentials?.password) {
          return null;
        }

        const dataSource = await initializeDatabase();
        const userRepository = dataSource.getRepository(User);

        const user = await userRepository.findOne({
          where: { id: credentials.id },
        });

        if (!user) {
          return null;
        }

        const isHashed = isBcryptHash(user.password);
        const isPasswordValid = isHashed
          ? await bcrypt.compare(credentials.password, user.password)
          : credentials.password === user.password;

        if (!isPasswordValid) {
          return null;
        }

        if (!isHashed) {
          try {
            const upgradedHash = await bcrypt.hash(credentials.password, 10);
            await userRepository.update({ id: user.id }, { password: upgradedHash });
          } catch {
          }
        }

        return {
          id: user.id,
          name: user.nickname,
          email: user.email || null,
          role: user.role,
          profileImage: user.profileImage || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as {
          role?: "USER" | "ADMIN";
          id: string;
          profileImage?: string | null;
        };
        token.role = u.role;
        token.id = u.id;
        token.profileImage = u.profileImage ?? null;
      }

      if (trigger === "update" && session && "profileImage" in session) {
        token.profileImage = (session as { profileImage?: string | null }).profileImage ?? null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as {
          role?: string;
          id?: string;
          profileImage?: string | null;
        };
        u.role = token.role as "USER" | "ADMIN" | undefined;
        u.id = token.id as string;
        u.profileImage = (token.profileImage as string | null) ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: process.env.NEXTAUTH_URL?.startsWith("https://") ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NEXTAUTH_URL?.startsWith("https://") ?? process.env.NODE_ENV === "production",
        maxAge: undefined,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
