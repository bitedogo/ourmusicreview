"use client";
/** 헤더 공지 인박스 */

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useClickOutside } from "@/src/hooks/use-click-outside";
import {
  fetchAnnouncements,
  type AnnouncementItem,
} from "@/src/lib/notifications/client-api";
import { HeaderIconButton } from "./header-icon-button";
import {
  HeaderInboxPanel,
  HeaderInboxStatus,
  HeaderInboxTimestamp,
} from "./header-inbox-panel";

interface AnnouncementInboxProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function AnnouncementInbox({
  isOpen,
  onToggle,
  onClose,
}: AnnouncementInboxProps) {
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, onClose, isOpen);

  async function handleToggle() {
    const next = !isOpen;
    onToggle();
    if (!next || items.length > 0 || isLoading) return;

    setIsLoading(true);
    try {
      const data = await fetchAnnouncements(12);
      setItems(data.data.items ?? []);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <HeaderIconButton
        label="공지 알림"
        expanded={isOpen}
        onClick={() => {
          void handleToggle();
        }}
      >
        <Image
          src="/icons/announcements-badge.svg"
          alt=""
          aria-hidden
          width={30}
          height={30}
          className="h-[30px] w-[30px] shrink-0 object-contain"
        />
      </HeaderIconButton>

      {isOpen ? (
        <HeaderInboxPanel title="공지 알림" widthClass="w-[20rem]">
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
      ) : null}
    </div>
  );
}
