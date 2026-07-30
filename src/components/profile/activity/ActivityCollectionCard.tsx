/** My Reviews / My Favorite / My Playlist 폴더형 컬렉션 카드 */

import Image from "next/image";
import Link from "next/link";
import { ProfilePrivacyToggle } from "../ProfilePrivacyToggle";
import {
  ACTIVITY_FOLDER_HEIGHT,
  ACTIVITY_FOLDER_SCALE_CLASS,
  ACTIVITY_FOLDER_SHELL_CLASS,
  ACTIVITY_FOLDER_WIDTH,
} from "./activity-folder-styles";

export interface ActivityCollectionCardProps {
  title: string;
  count: number;
  covers: string[];
  href?: string;
  isLoading: boolean;
  isOwner: boolean;
  isPublic: boolean;
  isSavingPrivacy?: boolean;
  onPrivacyChange?: (value: boolean) => void;
}

/** Figma Union 폴더 실루엣 (viewBox 4 2 261 159) */
const FOLDER_SHADOW = "drop-shadow(0px 2px 4px rgba(0,0,0,0.25))";
const COVER_SIZE = 166.68;
/** covers[0]=맨 앞. emptyBg는 뒤로 갈수록 진함 */
const COVER_LAYER_LAYOUT = [
  { left: 73.88, top: 5, z: 1, emptyBg: "#C4C4C4" },
  { left: 62.91, top: 12, z: 2, emptyBg: "#D0D0D0" },
  { left: 51.94, top: 19, z: 3, emptyBg: "#D9D9D9" },
  { left: 40.97, top: 26, z: 4, emptyBg: "#E3E3E3" },
  { left: 30, top: 33, z: 5, emptyBg: "#EFEFEF" },
] as const;

/** 데스크톱 — 공개 토글 111×35에 맞춘 갈피 */
const FOLDER_PATH_DESKTOP =
  "M121 2C129.284 2 136 8.71573 136 17V40H250C258.284 40 265 46.7157 265 55V146C265 154.284 258.284 161 250 161H19C10.7157 161 4 154.284 4 146V55C4 54.1482 4.0716 53.3131 4.20801 52.5C4.0716 51.6869 4 50.8518 4 50V17C4 8.71573 10.7157 2 19 2H121Z";

/** 모바일 — 공개 토글 90×25에 맞춰 갈피 폭·높이 축소 */
const FOLDER_PATH_MOBILE =
  "M105 2C113.284 2 118 8.71573 118 15V32H250C258.284 32 265 38.7157 265 47V146C265 154.284 258.284 161 250 161H19C10.7157 161 4 154.284 4 146V47C4 46.1482 4.0716 45.3131 4.20801 44.5C4.0716 43.6869 4 42.8518 4 42V15C4 6.71573 10.7157 2 19 2H105Z";

function ActivityFolderShape() {
  const baseClass = "pointer-events-none absolute z-10";
  const style = {
    left: 5,
    top: 123,
    filter: FOLDER_SHADOW,
  } as const;

  return (
    <>
      <svg
        className={`${baseClass} lg:hidden`}
        width={261}
        height={159}
        viewBox="4 2 261 159"
        fill="none"
        aria-hidden
        style={style}
      >
        <path d={FOLDER_PATH_MOBILE} fill="white" />
      </svg>
      <svg
        className={`${baseClass} hidden lg:block`}
        width={261}
        height={159}
        viewBox="4 2 261 159"
        fill="none"
        aria-hidden
        style={style}
      >
        <path d={FOLDER_PATH_DESKTOP} fill="white" />
      </svg>
    </>
  );
}

export function ActivityCollectionCard({
  title,
  count,
  covers,
  href,
  isLoading,
  isOwner,
  isPublic,
  isSavingPrivacy = false,
  onPrivacyChange,
}: ActivityCollectionCardProps) {
  const coverLayers = COVER_LAYER_LAYOUT.map((layer, index) => ({
    ...layer,
    url: covers[COVER_LAYER_LAYOUT.length - 1 - index] ?? null,
  }));

  const content = (
    <div
      className="relative"
      style={{ width: ACTIVITY_FOLDER_WIDTH, height: ACTIVITY_FOLDER_HEIGHT }}
    >
      {coverLayers.map((layer, index) => (
        <div
          key={index}
          className="absolute overflow-hidden"
          style={{
            left: layer.left,
            top: layer.top,
            width: COVER_SIZE,
            height: COVER_SIZE,
            borderRadius: "14.125px 14.125px 0 0",
            zIndex: layer.z,
            backgroundColor: layer.emptyBg,
          }}
        >
          {layer.url ? (
            <Image
              src={layer.url}
              alt=""
              width={167}
              height={167}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
      ))}

      <ActivityFolderShape />

      <p
        className="absolute z-20 flex items-center text-[15px] font-normal leading-[145%] tracking-[-0.005em] text-black"
        style={{ left: 27, top: 215, width: 120, height: 22 }}
      >
        {title}
      </p>
      <p
        className="absolute z-20 flex items-center text-[22px] font-normal leading-[145%] tracking-[-0.005em] text-[#909090]"
        style={{ left: 26, top: 238, width: 120, height: 32 }}
      >
        {isLoading ? "..." : `${count} Saved`}
      </p>

      {/* 공개/비공개 — 갈피 안 좌우·상하 패딩 대칭 */}
      {isOwner && onPrivacyChange && (
        <>
          <div
            className="absolute z-20 lg:hidden"
            style={{ left: 17, top: 130 }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <ProfilePrivacyToggle
              size="sm"
              isPublic={isPublic}
              disabled={isSavingPrivacy}
              onChange={onPrivacyChange}
            />
          </div>
          <div
            className="absolute z-20 hidden lg:block"
            style={{ left: 17, top: 131 }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <ProfilePrivacyToggle
              size="md"
              isPublic={isPublic}
              disabled={isSavingPrivacy}
              onChange={onPrivacyChange}
            />
          </div>
        </>
      )}
    </div>
  );

  const scaledContent = (
    <div className={ACTIVITY_FOLDER_SCALE_CLASS}>{content}</div>
  );

  if (!href) {
    return <div className={ACTIVITY_FOLDER_SHELL_CLASS}>{scaledContent}</div>;
  }

  return (
    <Link href={href} className={ACTIVITY_FOLDER_SHELL_CLASS}>
      {scaledContent}
    </Link>
  );
}
