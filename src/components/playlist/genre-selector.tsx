"use client";
/** 플레이리스트 장르 선택 — 대분류 단일 · 소분류는 같은 대분류 안에서만 */

import { useEffect, useMemo, useState } from "react";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import {
  GENRE_CIRCLE_LABELS,
  SPECIAL_GENRE_ALL,
  SPECIAL_GENRE_COMPREHENSIVE,
  getGenreCircleLabel,
  sortRootGenres,
  withComprehensiveSubgenre,
} from "@/src/lib/genres/genre-covers";

export interface GenreOption {
  id: string;
  nameKo: string;
  nameEn: string;
  parentId: string | null;
}

export interface GenreTreeNode extends GenreOption {
  children: GenreOption[];
}

interface GenreSelectorProps {
  value: string[];
  onChange: (genreIds: string[]) => void;
  disabled?: boolean;
}

function familyIdsOf(parent: GenreTreeNode): string[] {
  return [parent.id, ...parent.children.map((child) => child.id)];
}

export function GenreSelector({
  value,
  onChange,
  disabled = false,
}: GenreSelectorProps) {
  const [tree, setTree] = useState<GenreTreeNode[]>([]);
  const [activeParentId, setActiveParentId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await fetchJson<{
          ok: boolean;
          genres: GenreTreeNode[];
        }>("/api/genres");
        if (cancelled) return;
        const genres = sortRootGenres(response.genres ?? []);
        setTree(genres);
        setActiveParentId((prev) => prev ?? genres[0]?.id ?? null);
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          getApiErrorMessage(err, "장르 목록을 불러오지 못했습니다.")
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const genreById = useMemo(() => {
    const map = new Map<string, GenreOption>();
    for (const root of tree) {
      map.set(root.id, root);
      for (const child of root.children) {
        map.set(child.id, child);
      }
    }
    return map;
  }, [tree]);

  const rootIds = useMemo(() => tree.map((g) => g.id), [tree]);

  const allGenreIds = useMemo(() => {
    const ids: string[] = [];
    for (const root of tree) {
      ids.push(root.id);
      for (const child of root.children) {
        ids.push(child.id);
      }
    }
    return ids;
  }, [tree]);

  const isComprehensiveSelected =
    rootIds.length > 0 &&
    value.length === rootIds.length &&
    rootIds.every((id) => value.includes(id));

  const isAllSelected =
    allGenreIds.length > 0 &&
    value.length === allGenreIds.length &&
    allGenreIds.every((id) => value.includes(id));

  const parentChips = useMemo(
    () => [
      ...tree.map((parent) => ({
        id: parent.id,
        label: getGenreCircleLabel(parent.id) ?? parent.nameKo,
        kind: "genre" as const,
      })),
      {
        id: SPECIAL_GENRE_COMPREHENSIVE,
        label: GENRE_CIRCLE_LABELS[SPECIAL_GENRE_COMPREHENSIVE],
        kind: "special" as const,
      },
      {
        id: SPECIAL_GENRE_ALL,
        label: GENRE_CIRCLE_LABELS[SPECIAL_GENRE_ALL],
        kind: "special" as const,
      },
    ],
    [tree]
  );

  const selectedGenres = useMemo(
    () =>
      value
        .map((id) => {
          const genre = genreById.get(id);
          if (!genre) return null;
          const isRoot = genre.parentId == null;
          return {
            ...genre,
            label: isRoot
              ? (getGenreCircleLabel(id) ?? genre.nameKo)
              : genre.nameKo,
          };
        })
        .filter((g): g is GenreOption & { label: string } => Boolean(g)),
    [value, genreById]
  );

  const activeParent = tree.find((g) => g.id === activeParentId) ?? null;

  function removeGenre(genreId: string) {
    if (disabled) return;
    onChange(value.filter((id) => id !== genreId));
  }

  function handleParentChip(chipId: string) {
    if (disabled) return;

    if (chipId === SPECIAL_GENRE_COMPREHENSIVE) {
      setActiveParentId(null);
      onChange(isComprehensiveSelected ? [] : [...rootIds]);
      return;
    }

    if (chipId === SPECIAL_GENRE_ALL) {
      setActiveParentId(null);
      onChange(isAllSelected ? [] : [...allGenreIds]);
      return;
    }

    const parent = tree.find((g) => g.id === chipId);
    if (!parent) return;

    if (activeParentId === chipId) {
      const family = familyIdsOf(parent);
      const hasFamily = value.some((id) => family.includes(id));
      if (!hasFamily) onChange([chipId]);
      return;
    }

    setActiveParentId(chipId);
    onChange([chipId]);
  }

  function handleSubgenre(childId: string, parent: GenreTreeNode) {
    if (disabled) return;

    const isComprehensive = childId === parent.id;
    if (isComprehensive) {
      if (value.length === 1 && value[0] === parent.id) {
        onChange([]);
      } else {
        onChange([parent.id]);
      }
      return;
    }

    const childIds = parent.children.map((child) => child.id);
    const currentChildren = value.filter((id) => childIds.includes(id));

    if (currentChildren.includes(childId)) {
      const next = currentChildren.filter((id) => id !== childId);
      onChange(next);
      return;
    }

    onChange([...currentChildren, childId]);
  }

  if (isLoading) {
    return (
      <p className="text-xs text-zinc-500">장르 목록을 불러오는 중...</p>
    );
  }

  if (loadError) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
        {loadError}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-xs font-medium text-zinc-600">대분류</p>
        <div className="flex flex-wrap gap-1.5">
          {parentChips.map((chip) => {
            const parent =
              chip.kind === "genre"
                ? tree.find((g) => g.id === chip.id)
                : null;
            const familySelected =
              parent != null &&
              value.some((id) => familyIdsOf(parent).includes(id));
            const isActive =
              chip.kind === "genre" && activeParentId === chip.id;
            const isSelected =
              chip.id === SPECIAL_GENRE_COMPREHENSIVE
                ? isComprehensiveSelected
                : chip.id === SPECIAL_GENRE_ALL
                  ? isAllSelected
                  : familySelected;
            return (
              <button
                key={chip.id}
                type="button"
                disabled={disabled}
                onClick={() => handleParentChip(chip.id)}
                className={[
                  "rounded-full border px-2.5 py-1 text-[11px] transition",
                  isSelected
                    ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-white"
                    : isActive
                      ? "border-zinc-400 bg-zinc-100 text-zinc-800"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50",
                  disabled ? "opacity-60" : "",
                ].join(" ")}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeParent ? (
        <div>
          <p className="mb-1.5 text-xs font-medium text-zinc-600">
            {getGenreCircleLabel(activeParent.id) ?? activeParent.nameKo} 소분류
            <span className="ml-1 font-normal text-zinc-400">
              (같은 대분류 안에서만 선택 · 종합 시 소분류 해제)
            </span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {withComprehensiveSubgenre(activeParent).map((child) => {
              const isComprehensive = child.id === activeParent.id;
              const isSelected = isComprehensive
                ? value.length === 1 && value[0] === activeParent.id
                : value.includes(child.id);
              return (
                <button
                  key={isComprehensive ? `${child.id}-comprehensive` : child.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSubgenre(child.id, activeParent)}
                  className={[
                    "rounded-full border px-2.5 py-1 text-[11px] transition",
                    isSelected
                      ? isComprehensive
                        ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-white"
                        : "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50",
                    disabled ? "opacity-60" : "",
                  ].join(" ")}
                >
                  {child.nameKo}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {selectedGenres.length > 0 ? (
        <div>
          <p className="mb-1.5 text-xs font-medium text-zinc-600">선택된 장르</p>
          <div className="flex flex-wrap gap-1.5">
            {selectedGenres.map((genre) => (
              <button
                key={genre.id}
                type="button"
                disabled={disabled}
                onClick={() => removeGenre(genre.id)}
                className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] text-zinc-700 hover:bg-zinc-200 disabled:opacity-60"
                title="클릭하여 제거"
              >
                {genre.label}
                <span aria-hidden className="text-zinc-400">
                  ×
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
