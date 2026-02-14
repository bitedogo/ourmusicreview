import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { initializeDatabase } from "../db";
import { User } from "../db/entities/User";
import bcrypt from "bcryptjs";

function isBcryptHash(value: string) {
  // $2a$ / $2b$ / $2y$ + cost(2 digits) + '$'
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

        // 레거시(평문) 비밀번호 지원:
        // - 해시인 경우: bcrypt.compare
        // - 평문인 경우: 문자열 비교 후, 성공 시 즉시 bcrypt 해시로 업그레이드(1회성 마이그레이션)
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
      // 로그인 시 사용자 정보 토큰에 주입
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

      // 클라이언트에서 session.update(...) 호출 시 프로필 이미지 갱신
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
        // maxAge 생략 → 세션 쿠키로 설정, 브라우저를 닫으면 쿠키 삭제되어 자동 로그아웃
        maxAge: undefined,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
