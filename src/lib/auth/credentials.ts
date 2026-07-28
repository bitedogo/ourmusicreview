/** Credentials 프로바이더 (아이디/비밀번호, Supabase 토큰) authorize 로직 */

import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { initializeDatabase } from "../db";
import { User } from "../db/entities/User";
import { getSupabaseClient } from "@/src/lib/supabase";

function isBcryptHash(value: string) {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

export const credentialsProvider = CredentialsProvider({
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
});

export const supabaseCredentialsProvider = CredentialsProvider({
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
});
