import type { TodayAlbumTab } from "@/src/lib/today-album/types";
import { TODAY_ALBUM_TABS } from "@/src/lib/today-album/types";

interface TodayAlbumTabsProps {
  activeTab: TodayAlbumTab;
  hasAlbum: (tab: TodayAlbumTab) => boolean;
  onTabChange: (tab: TodayAlbumTab) => void;
}

const TAB_BACKGROUND: Record<TodayAlbumTab, string> = {
  today: "var(--color-today-album-tab-today)",
  yesterday: "var(--color-today-album-tab-yesterday)",
  previous: "var(--color-today-album-tab-previous)",
};

export function TodayAlbumTabs({
  activeTab,
  hasAlbum,
  onTabChange,
}: TodayAlbumTabsProps) {
  return (
    <div className="flex items-end gap-1">
      {TODAY_ALBUM_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const tabHasAlbum = hasAlbum(tab.id);

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            disabled={!tabHasAlbum}
            className={`rounded-t-2xl px-6 py-2.5 text-sm font-semibold shadow-[var(--shadow-today-album-tab)] transition sm:px-8 sm:text-base ${
              isActive
                ? "border border-b-0 border-[var(--color-border)] bg-white text-[var(--color-text-primary)]"
                : tabHasAlbum
                  ? `border border-[var(--color-border)] hover:opacity-90 text-[var(--color-text-secondary)]`
                  : "cursor-not-allowed border border-[var(--color-border)] bg-[var(--color-today-album-tab-today)] text-[var(--color-text-muted)]"
            }`}
            style={
              !isActive && tabHasAlbum
                ? { backgroundColor: TAB_BACKGROUND[tab.id] }
                : undefined
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
