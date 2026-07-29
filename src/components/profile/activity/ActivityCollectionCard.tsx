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

function ActivityFolderShape() {
  return (
    <svg
      className="pointer-events-none absolute z-10"
      width={261}
      height={159}
      viewBox="4 2 261 159"
      fill="none"
      aria-hidden
      style={{
        left: 5,
        top: 123,
        filter: FOLDER_SHADOW,
      }}
    >
      <path
        d="M121 2C129.284 2 136 8.71573 136 17V40H250C258.284 40 265 46.7157 265 55V146C265 154.284 258.284 161 250 161H19C10.7157 161 4 154.284 4 146V55C4 54.1482 4.0716 53.3131 4.20801 52.5C4.0716 51.6869 4 50.8518 4 50V17C4 8.71573 10.7157 2 19 2H121Z"
        fill="white"
      />
    </svg>
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

      {/* Figma Rectangle 77: left 324 → card 17, top 131, 111×35 */}
      {isOwner && onPrivacyChange && (
        <div
          className="absolute z-20"
          style={{ left: 17, top: 131, width: 111, height: 35 }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <ProfilePrivacyToggle
            isPublic={isPublic}
            disabled={isSavingPrivacy}
            onChange={onPrivacyChange}
          />
        </div>
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
