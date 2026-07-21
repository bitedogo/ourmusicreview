/** My Reviews / My Favorite 폴더형 컬렉션 카드 */

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
  const slots = [covers[0] ?? null, covers[1] ?? null, covers[2] ?? null];
  const coverLayers = [
    { left: 73.88, top: 5, z: 1, url: slots[2] },
    { left: 51.88, top: 19, z: 2, url: slots[1] },
    { left: 30, top: 33, z: 3, url: slots[0] },
  ];

  const content = (
    <div
      className="relative"
      style={{ width: ACTIVITY_FOLDER_WIDTH, height: ACTIVITY_FOLDER_HEIGHT }}
    >
      {coverLayers.map((layer, index) => (
        <div
          key={index}
          className="absolute overflow-hidden bg-zinc-200"
          style={{
            left: layer.left,
            top: layer.top,
            width: 166.68,
            height: 166.68,
            borderRadius: "14.125px 14.125px 0 0",
            zIndex: layer.z,
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
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-zinc-100 to-zinc-300" />
          )}
        </div>
      ))}

      <div
        className="absolute z-10"
        style={{
          left: 5,
          top: 123,
          width: 261,
          height: 159,
          filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.25))",
        }}
      >
        <div
          className="absolute bg-white"
          style={{ left: 0, top: 38, width: 261, height: 121, borderRadius: 15 }}
        />
        <div
          className="absolute bg-white"
          style={{ left: 0, top: 0, width: 132, height: 63, borderRadius: 15 }}
        />
      </div>

      <p
        className="absolute z-20 flex items-center text-[15px] font-normal leading-[145%] tracking-[-0.005em] text-black"
        style={{ left: 26, top: 215, width: 120, height: 22 }}
      >
        {title}
      </p>
      <p
        className="absolute z-20 flex items-center text-[22px] font-normal leading-[145%] tracking-[-0.005em] text-[#909090]"
        style={{ left: 26, top: 238, width: 120, height: 32 }}
      >
        {isLoading ? "..." : `${count} Saved`}
      </p>

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
