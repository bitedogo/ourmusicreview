/** 프로필 섹션별 안내 말풍선 문구 */

import { MasterpiecePlusBadge } from "./MasterpiecePlusBadge";
import { ProfileInfoTip } from "./ProfileInfoTip";

export function ActivityInfoTip() {
  return (
    <ProfileInfoTip label="나의 활동 안내" tipId="activity-info-tip">
      &apos;나의 활동&apos; 내용 중 기본적으로{" "}
      <span className="text-[#43A7B2]">작성한 게시글,</span>
      <br />
      <span className="text-[#43A7B2]">작성한 댓글, 추천한 글</span>은 타유저가 보는
      <br />
      나의 &apos;마이페이지&apos;에서는 비공개로 설정되어 있습니다.
      <br />
      활동에 참고하시기 바랍니다.
    </ProfileInfoTip>
  );
}

export function MasterpieceInfoTip() {
  return (
    <ProfileInfoTip label="나의 Masterpiece 안내" tipId="masterpiece-info-tip" tall>
      <span className="block">
        &apos;나의 Masterpiece&apos;는 메인페이지 Masterpiece를
        <br />
        본인의 명반으로 채워 꾸밀 수 있는 기능입니다.
      </span>
      <span className="mt-2 block">
        빈 앨범 카드 셀렉션 속 <MasterpiecePlusBadge /> 을 눌러 앨범을 검색하고
        <br />
        나의 Masterpiece를 만들어보세요.
      </span>
      <span className="mt-2 block">
        편집으로 추가한 나의 Masterpiece를 관리하세요.
      </span>
    </ProfileInfoTip>
  );
}
