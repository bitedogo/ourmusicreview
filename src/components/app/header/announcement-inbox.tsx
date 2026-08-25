"use client";
/** 헤더 공지 인박스 */

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  fetchAnnouncements,
  markAnnouncementsSeen,
  type AnnouncementItem,
} from "@/src/lib/notifications/client-api";
import { HeaderIconButton } from "./header-icon-button";
import {
  HeaderInboxPanel,
  HeaderInboxStatus,
  HeaderInboxTimestamp,
} from "./header-inbox-panel";

interface AnnouncementInboxTriggerProps {
  unreadCount: number;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function AnnouncementInboxTrigger({
  unreadCount,
  isOpen,
  onToggle,
  className = "",
}: AnnouncementInboxTriggerProps) {
  return (
    <div className={className}>
      <HeaderIconButton
        label="공지 알림"
        expanded={isOpen}
        onClick={onToggle}
      >
        <Image
          src="/icons/announcements-badge.svg"
          alt=""
          aria-hidden
          width={30}
          height={30}
          className="h-[30px] w-[30px] shrink-0 object-contain"
        />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-4 text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </HeaderIconButton>
    </div>
  );
}

interface AnnouncementInboxPanelProps {
  onClose: () => void;
  onUnreadCountChange: Dispatch<SetStateAction<number>>;
}

export function AnnouncementInboxPanel({
  onClose,
  onUnreadCountChange,
}: AnnouncementInboxPanelProps) {
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchAnnouncements(12);
        if (cancelled) return;
        setItems(data.data.items ?? []);
        try {
          await markAnnouncementsSeen();
          if (!cancelled) onUnreadCountChange(0);
        } catch {
          if (!cancelled) {
            onUnreadCountChange(data.data.unreadCount ?? 0);
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [onUnreadCountChange]);

  return (
    <HeaderInboxPanel title="공지 알림" widthClass="w-[20rem] max-w-[calc(100vw-2rem)]">
      {isLoading ? (
        <HeaderInboxStatus>불러오는 중...</HeaderInboxStatus>
      ) : items.length === 0 ? (
        <HeaderInboxStatus>새로운 공지가 없습니다.</HeaderInboxStatus>
      ) : (
        <ul className="max-h-72 overflow-y-auto">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.link}
                onClick={onClose}
                className="block px-3 py-2 hover:bg-zinc-50"
              >
                <p className="line-clamp-1 text-xs font-medium text-[var(--color-text-primary)]">
                  {item.title}
                </p>
                <HeaderInboxTimestamp value={item.createdAt} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </HeaderInboxPanel>
  );
}
