/** NextAuth 인증 옵션·프로바이더 설정 */

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { initializeDatabase } from "../db";
import { User } from "../db/entities/User";
import { getServerEnv } from "@/src/lib/env";
import { credentialsProvider, supabaseCredentialsProvider } from "./credentials";
import { resolveProfileImageFromDb } from "./profile-image";

const env = getServerEnv();

export const authOptions: NextAuthOptions = {
  providers: [
    credentialsProvider,
    supabaseCredentialsProvider,
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
            const { isEmailBlocked } = await import(
              "@/src/lib/users/blocked-email"
            );
            if (await isEmailBlocked(dataSource, profile.email!)) {
              return { id: "", name: "", email: "", image: "", role: "" };
            }
            dbUser = userRepository.create({
              id: profile.sub,
              email: profile.email!,
              nickname: profile.name || profile.email!.split("@")[0],
              profileImage: picture,
              role: "USER",
              emailVerifiedAt: new Date(),
            });
            await userRepository.save(dbUser);
          } else {
            if (!dbUser.emailVerifiedAt) {
              await userRepository.update(
                { id: dbUser.id },
                { emailVerifiedAt: new Date() }
              );
              dbUser.emailVerifiedAt = new Date();
            }
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

          const { assertUserNotSuspended } = await import(
            "@/src/lib/users/user-sanction-service"
          );
          try {
            await assertUserNotSuspended(dataSource, dbUser);
          } catch {
            return { id: "", name: "", email: "", image: "", role: "" };
          }

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
    async signIn({ user }) {
      if (!user?.id) return false;
      try {
        const dataSource = await initializeDatabase();
        const dbUser = await dataSource.getRepository(User).findOne({
          where: { id: user.id },
        });
        if (!dbUser) return true;
        const { assertUserNotSuspended } = await import(
          "@/src/lib/users/user-sanction-service"
        );
        await assertUserNotSuspended(dataSource, dbUser);
        return true;
      } catch {
        return "/auth/signin?error=suspended";
      }
    },
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
