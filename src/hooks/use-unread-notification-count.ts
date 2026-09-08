/** 헤더용 안 읽은 메일·공지 개수 */

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  fetchAnnouncements,
  fetchMailNotifications,
} from "@/src/lib/notifications/client-api";

export function useUnreadNotificationCount() {
  const { data: session, status } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [announcementUnreadCount, setAnnouncementUnreadCount] = useState(0);
  const isLoggedIn = status === "authenticated" && !!session?.user?.name;

  const refreshUnreadCount = useCallback(async () => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      setAnnouncementUnreadCount(0);
      return;
    }

    try {
      const [mail, announcements] = await Promise.all([
        fetchMailNotifications(1),
        fetchAnnouncements(1),
      ]);
      setUnreadCount(mail.data.unreadCount ?? 0);
      setAnnouncementUnreadCount(announcements.data.unreadCount ?? 0);
    } catch {
      setUnreadCount(0);
      setAnnouncementUnreadCount(0);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    let cancelled = false;
    if (!isLoggedIn) return;

    void Promise.all([fetchMailNotifications(1), fetchAnnouncements(1)])
      .then(([mail, announcements]) => {
        if (cancelled) return;
        setUnreadCount(mail.data.unreadCount ?? 0);
        setAnnouncementUnreadCount(announcements.data.unreadCount ?? 0);
      })
      .catch(() => {
        if (cancelled) return;
        setUnreadCount(0);
        setAnnouncementUnreadCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const onFocus = () => {
      void refreshUnreadCount();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    const timer = window.setInterval(() => {
      void refreshUnreadCount();
    }, 60_000);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      window.clearInterval(timer);
    };
  }, [isLoggedIn, refreshUnreadCount]);

  return {
    unreadCount: isLoggedIn ? unreadCount : 0,
    setUnreadCount,
    announcementUnreadCount: isLoggedIn ? announcementUnreadCount : 0,
    setAnnouncementUnreadCount,
    refreshUnreadCount,
    isLoggedIn,
  };
}
