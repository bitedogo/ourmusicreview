/** 계정 삭제 연쇄 처리(회원 탈퇴/관리자 강제 탈퇴 공용) */

import type { DataSource } from "typeorm";
import { User } from "@/src/lib/db/entities/User";
import { UserFavoriteAlbum } from "@/src/lib/db/entities/UserFavoriteAlbum";
import { Like } from "@/src/lib/db/entities/Like";
import { Report } from "@/src/lib/db/entities/Report";
import { Comment } from "@/src/lib/db/entities/Comment";
import { Review } from "@/src/lib/db/entities/Review";

/**
 * 유저와 연관된 즐겨찾기·좋아요·신고·댓글·리뷰를 모두 삭제한 뒤 유저를 제거한다.
 * 대상 유저가 없으면 false를 반환하고 아무 것도 삭제하지 않는다.
 */
export async function deleteUserAccount(
  dataSource: DataSource,
  userId: string
): Promise<boolean> {
  const userRepo = dataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: userId } });

  if (!user) {
    return false;
  }

  await dataSource.getRepository(UserFavoriteAlbum).delete({ userId });
  await dataSource.getRepository(Like).delete({ userId });
  await dataSource.getRepository(Report).delete({ userId });
  await dataSource.getRepository(Comment).delete({ userId });
  await dataSource.getRepository(Review).delete({ userId });

  await userRepo.remove(user);

  return true;
}
