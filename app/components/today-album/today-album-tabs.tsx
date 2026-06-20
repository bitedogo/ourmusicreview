import type { TodayAlbumTab } from "@/src/lib/today-album/types";
import { TODAY_ALBUM_TABS } from "@/src/lib/today-album/types";

interface TodayAlbumTabsProps {
  activeTab: TodayAlbumTab;
  hasAlbum: (tab: TodayAlbumTab) => boolean;
  onTabChange: (tab: TodayAlbumTab) => void;
}

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
            className={`rounded-t-2xl px-6 py-2.5 text-sm font-semibold transition sm:px-8 sm:text-base ${
              isActive
                ? "border border-b-0 border-zinc-200 bg-white text-zinc-900"
                : tabHasAlbum
                  ? "border border-zinc-200 bg-zinc-100 text-zinc-500 hover:bg-zinc-50"
                  : "cursor-not-allowed border border-zinc-200 bg-zinc-50 text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
