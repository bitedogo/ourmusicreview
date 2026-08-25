"use client";
/** 헤더 활동 알림 인박스 */

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { getApiErrorMessage } from "@/src/lib/http/client";
import {
  fetchMailNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type MailNotificationItem,
} from "@/src/lib/notifications/client-api";
import { HeaderIconButton } from "./header-icon-button";
import {
  HeaderInboxPanel,
  HeaderInboxStatus,
  HeaderInboxTimestamp,
} from "./header-inbox-panel";

interface MailInboxTriggerProps {
  unreadCount: number;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function MailInboxTrigger({
  unreadCount,
  isOpen,
  onToggle,
  className = "",
}: MailInboxTriggerProps) {
  return (
    <div className={className}>
      <HeaderIconButton
        label="활동 알림"
        expanded={isOpen}
        onClick={onToggle}
      >
        <Image
          src="/icons/mail-badge.svg"
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

interface MailInboxPanelProps {
  unreadCount: number;
  onClose: () => void;
  onUnreadCountChange: Dispatch<SetStateAction<number>>;
}

export function MailInboxPanel({
  unreadCount,
  onClose,
  onUnreadCountChange,
}: MailInboxPanelProps) {
  const [items, setItems] = useState<MailNotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchMailNotifications(20, true);
        if (cancelled) return;
        setItems(data.data.items ?? []);
        onUnreadCountChange(data.data.unreadCount ?? 0);
      } catch (loadError) {
        if (!cancelled) {
          setError(getApiErrorMessage(loadError, "알림을 불러오지 못했습니다."));
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

  async function handleReadAll() {
    try {
      await markAllNotificationsRead();
      setItems([]);
      onUnreadCountChange(0);
    } catch {
      /* ignore */
    }
  }

  async function handleOpenItem(item: MailNotificationItem) {
    if (!item.isRead) {
      try {
        await markNotificationRead(item.id);
        setItems((prev) => prev.filter((current) => current.id !== item.id));
        onUnreadCountChange((prev) => Math.max(0, prev - 1));
      } catch {
        /* ignore */
      }
    }
    onClose();
  }

  return (
    <HeaderInboxPanel
      title="활동 알림"
      widthClass="w-[22rem] max-w-[calc(100vw-2rem)]"
      action={
        unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => {
              void handleReadAll();
            }}
            className="text-[11px] text-[var(--color-text-secondary)] underline hover:text-[var(--color-text-primary)]"
          >
            모두 읽음
          </button>
        ) : null
      }
    >
      {isLoading ? (
        <HeaderInboxStatus>불러오는 중...</HeaderInboxStatus>
      ) : error ? (
        <p className="px-3 py-4 text-xs text-red-500">{error}</p>
      ) : items.length === 0 ? (
        <HeaderInboxStatus>새 알림이 없습니다.</HeaderInboxStatus>
      ) : (
        <ul className="max-h-80 overflow-y-auto">
          {items.map((item) => (
            <li key={item.id}>
              {item.link ? (
                <Link
                  href={item.link}
                  onClick={() => {
                    void handleOpenItem(item);
                  }}
                  className="block px-3 py-2 hover:bg-zinc-50"
                >
                  <MailInboxItemBody item={item} />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    void handleOpenItem(item);
                  }}
                  className="block w-full px-3 py-2 text-left hover:bg-zinc-50"
                >
                  <MailInboxItemBody item={item} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </HeaderInboxPanel>
  );
}

function MailInboxItemBody({ item }: { item: MailNotificationItem }) {
  const isAdminWarn = item.type === "ADMIN_WARN";

  return (
    <>
      <p
        className={`line-clamp-2 text-xs font-medium ${
          isAdminWarn ? "" : "text-[var(--color-text-primary)]"
        }`}
        style={isAdminWarn ? { color: "#F82512" } : undefined}
      >
        {item.title}
      </p>
      {item.body ? (
        <p className="mt-0.5 line-clamp-2 text-[11px] text-[var(--color-text-secondary)]">
          {item.body}
        </p>
      ) : null}
      <HeaderInboxTimestamp value={item.createdAt} />
    </>
  );
}
