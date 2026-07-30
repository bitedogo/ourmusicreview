/** Masterpiece 앨범 그리드 (편집 · 추가 · 드래그) */

import { ItunesAlbumPickerModal } from "@/src/components/itunes/itunes-album-picker-modal";
import {
  MASTERPIECE_GRID,
  MASTERPIECE_GRID_COL_WIDTH,
  PROFILE_CLUSTER_BAND_CLASS,
} from "@/src/components/profile/profile-section-styles";
import { MasterpieceAddCard } from "./MasterpieceAddCard";
import {
  MasterpieceAlbumCard,
  type MasterpieceSlideAlbum,
} from "./MasterpieceAlbumCard";
import type { SearchAlbumResult } from "@/src/lib/search/types";

interface MasterpieceAlbumsGridProps {
  albums: MasterpieceSlideAlbum[];
  isLoading: boolean;
  error: string | null;
  isEditing: boolean;
  canAdd: boolean;
  isEmpty: boolean;
  processingIds: Set<string>;
  draggingId: string | null;
  isSavingOrder: boolean;
  modalOpen: boolean;
  addSubmitting: boolean;
  addError: string | null;
  onOpenAdd: () => void;
  onCloseModal: () => void;
  onAlbumSelect: (album: SearchAlbumResult) => void;
  onDragStart: (id: string) => void;
  onDrop: (id: string, sourceId?: string) => void;
  onDragEnd: () => void;
  onRemove: (id: string) => void;
}

export function MasterpieceAlbumsGrid({
  albums,
  isLoading,
  error,
  isEditing,
  canAdd,
  isEmpty,
  processingIds,
  draggingId,
  isSavingOrder,
  modalOpen,
  addSubmitting,
  addError,
  onOpenAdd,
  onCloseModal,
  onAlbumSelect,
  onDragStart,
  onDrop,
  onDragEnd,
  onRemove,
}: MasterpieceAlbumsGridProps) {
  return (
    <div className={PROFILE_CLUSTER_BAND_CLASS}>
      {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

      {isLoading ? (
        <p className="py-16 text-center text-sm text-zinc-500">불러오는 중...</p>
      ) : isEmpty && canAdd ? (
        <div className="flex justify-center">
          <div className={MASTERPIECE_GRID_COL_WIDTH}>
            <MasterpieceAddCard
              count={albums.length}
              onClick={onOpenAdd}
              disabled={isEditing}
            />
          </div>
        </div>
      ) : (
        <div className={MASTERPIECE_GRID}>
          {albums.map((album) => (
            <MasterpieceAlbumCard
              key={album.id}
              album={album}
              isEditing={isEditing}
              isProcessing={processingIds.has(album.id)}
              isDragging={draggingId === album.id}
              draggable={!isSavingOrder && !isEditing}
              onDragStart={() => onDragStart(album.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void onDrop(album.id);
              }}
              onDragEnd={onDragEnd}
              onTouchDrop={(targetId) => void onDrop(targetId, album.id)}
              onRemove={() => void onRemove(album.id)}
            />
          ))}

          {canAdd && (
            <MasterpieceAddCard
              count={albums.length}
              onClick={onOpenAdd}
              disabled={isEditing}
            />
          )}
        </div>
      )}

      <ItunesAlbumPickerModal
        open={modalOpen}
        onClose={onCloseModal}
        onAlbumSelect={onAlbumSelect}
        isSelecting={addSubmitting}
        selectError={addError}
        titleId="add-pick-album-title"
      />
    </div>
  );
}
