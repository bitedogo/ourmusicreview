/** NextAuth 인증 옵션·프로바이더 설정 */

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { initializeDatabase } from "../db";
import { User } from "../db/entities/User";
import bcrypt from "bcryptjs";
import { getServerEnv } from "@/src/lib/env";
import { getSupabaseClient } from "@/src/lib/supabase";

function isBcryptHash(value: string) {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

async function resolveProfileImageFromDb(
  userId: string,
  fallback?: string | null
): Promise<string | null> {
  try {
    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);
    const dbUser = await userRepository.findOne({ where: { id: userId } });
    return dbUser?.profileImage ?? fallback ?? null;
  } catch {
    return fallback ?? null;
  }
}

const env = getServerEnv();

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

        if (typeof user.password !== "string" || !user.password) {
          return null;
        }

        const currentPasswordHash = user.password;
        const isHashed = isBcryptHash(currentPasswordHash);
        const isPasswordValid = isHashed
          ? await bcrypt.compare(credentials.password, currentPasswordHash)
          : credentials.password === currentPasswordHash;

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

        const profileImage = user.profileImage || null;

        return {
          id: user.id,
          name: user.nickname,
          email: user.email || null,
          role: user.role,
          profileImage,
          image: profileImage,
        };
      },
    }),
    CredentialsProvider({
      id: "supabase",
      name: "Supabase",
      credentials: {
        accessToken: { label: "Supabase Access Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.accessToken) {
          return null;
        }

        const supabase = getSupabaseClient();
        supabase.auth.setSession({ access_token: credentials.accessToken, refresh_token: "" });
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          return null;
        }
        if (!user) {
          return null;
        }

        const dataSource = await initializeDatabase();
        const userRepository = dataSource.getRepository(User);

        let dbUser = await userRepository.findOne({
          where: { email: user.email! },
        });

        if (!dbUser) {
          dbUser = userRepository.create({
            id: user.id,
            email: user.email!,
            nickname: user.user_metadata.full_name || user.email!.split('@')[0],
            profileImage: user.user_metadata.avatar_url || null,
            role: "USER",
          });
          await userRepository.save(dbUser);
        } else if (dbUser.id !== user.id) {
          await userRepository.update({ email: user.email! }, { id: user.id });
          dbUser.id = user.id;
        }

        const profileImage = dbUser.profileImage || null;

        return {
          id: dbUser.id,
          name: dbUser.nickname,
          email: dbUser.email || null,
          role: dbUser.role,
          profileImage,
          image: profileImage,
        };
      },
    }),
    GoogleProvider({
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret,
      async profile(profile) {
        try {
          const dataSource = await initializeDatabase();
          const userRepository = dataSource.getRepository(User);

          let dbUser = await userRepository.findOne({
            where: { email: profile.email! },
          });

          const picture = profile.picture || null;

          if (!dbUser) {
            dbUser = userRepository.create({
              id: profile.sub,
              email: profile.email!,
              nickname: profile.name || profile.email!.split("@")[0],
              profileImage: picture,
              role: "USER",
            });
            await userRepository.save(dbUser);
          } else {
            if (dbUser.id !== profile.sub) {
              await userRepository.update({ email: profile.email! }, { id: profile.sub });
              dbUser.id = profile.sub;
            }
            if (picture && picture !== dbUser.profileImage) {
              await userRepository.update({ id: dbUser.id }, { profileImage: picture });
              dbUser.profileImage = picture;
            }
          }

          const profileImage = dbUser.profileImage || null;

          return {
            id: dbUser.id,
            name: dbUser.nickname,
            email: dbUser.email!,
            image: profileImage,
            profileImage,
            role: dbUser.role,
          };
        } catch {
          return { id: "", name: "", email: "", image: "", role: "" };
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const userWithProfile = user as {
          profileImage?: string | null;
          image?: string | null;
          role?: "USER" | "ADMIN";
        };
        const fallbackProfileImage =
          userWithProfile.profileImage ?? userWithProfile.image ?? null;
        const profileImage = user.id
          ? await resolveProfileImageFromDb(user.id, fallbackProfileImage)
          : fallbackProfileImage;

        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = profileImage;
        token.profileImage = profileImage;
        token.role = userWithProfile.role;
      }

      if (trigger === "update" && session) {
        const s = session as {
          profileImage?: string | null;
          image?: string | null;
          name?: string | null;
          email?: string | null;
        };
        if ("profileImage" in session) {
          const profileImage = s.profileImage ?? s.image ?? null;
          token.profileImage = profileImage;
          token.image = profileImage;
        }
        if ("image" in session && !("profileImage" in session)) {
          token.image = s.image ?? null;
          token.profileImage = s.image ?? null;
        }
        if ("name" in session) {
          token.name = s.name ?? null;
        }
        if ("email" in session) {
          token.email = s.email ?? null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as {
          role?: string;
          id?: string;
          name?: string | null;
          profileImage?: string | null;
          email?: string | null;
        };
        u.role = token.role as "USER" | "ADMIN" | undefined;
        u.id = token.id as string;
        u.name = (token.name as string | null) ?? null;
        u.profileImage = (token.profileImage as string | null) ?? (token.image as string | null) ?? null;
        (u as { image?: string | null }).image =
          (token.image as string | null) ?? (token.profileImage as string | null) ?? null;
        u.email = (token.email as string | null) ?? null;
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
      name: env.nextAuthUrl?.startsWith("https://")
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: env.nextAuthUrl?.startsWith("https://") ?? env.nodeEnv === "production",
        maxAge: undefined,
      },
    },
  },
  secret: env.nextAuthSecret,
};
