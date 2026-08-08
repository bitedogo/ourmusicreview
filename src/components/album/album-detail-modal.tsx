"use client";
/** 앨범 상세 모달 */

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import Image from "next/image";
import {
  AlbumDetailPanel,
  formatAlbumReleaseDate,
} from "@/src/components/album/album-detail-panel";
import { ArtistNamesLinks } from "@/src/components/app/artist-name-link";
import { StreamingLinkButtons } from "@/src/components/streaming/streaming-link-buttons";
import type { AlbumDetail } from "@/src/lib/album/detail-types";
import type { AlbumStreamingLinks } from "@/src/lib/streaming/types";

interface AlbumDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: AlbumDetail | null;
  streamingLinks?: AlbumStreamingLinks | null;
  isLoading?: boolean;
  error?: string | null;
}

export function AlbumDetailModal({
  isOpen,
  onClose,
  album,
  streamingLinks = null,
  isLoading = false,
  error = null,
}: AlbumDetailModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-5 text-left shadow-xl transition-all sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <Dialog.Title className="text-lg font-semibold text-[var(--color-text-primary)]">
                    앨범 상세 정보
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full px-2 py-1 text-sm text-[var(--color-text-secondary)] transition hover:bg-zinc-100 hover:text-[var(--color-text-primary)]"
                  >
                    닫기
                  </button>
                </div>

                {isLoading ? (
                  <p className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">앨범 정보를 불러오는 중...</p>
                ) : error ? (
                  <p className="mt-8 text-center text-sm text-red-600">{error}</p>
                ) : album ? (
                  <div className="mt-5">
                    <div className="flex items-start gap-4 sm:gap-5">
                      <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:h-48 sm:w-48">
                        {album.imageUrl ? (
                          <Image
                            src={album.imageUrl}
                            alt={album.name}
                            fill
                            unoptimized
                            sizes="192px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-[var(--color-text-muted)]">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-lg font-bold leading-snug text-[var(--color-text-primary)] sm:text-xl">
                          {album.name}
                        </p>
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)] sm:text-base">
                          <ArtistNamesLinks
                            artists={album.artists}
                            linkClassName="truncate text-left text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-brand-primary)] hover:underline disabled:cursor-wait disabled:no-underline sm:text-base"
                          />
                        </p>
                        <dl className="mt-4 grid grid-cols-1 gap-1.5 text-sm text-[var(--color-text-secondary)]">
                          <div>
                            <dt className="inline text-[var(--color-text-muted)]">발매일: </dt>
                            <dd className="inline">
                              {formatAlbumReleaseDate(
                                album.releaseDate,
                                album.releaseDatePrecision
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="inline text-[var(--color-text-muted)]">장르: </dt>
                            <dd className="inline">{album.genre || "-"}</dd>
                          </div>
                        </dl>
                        <StreamingLinkButtons links={streamingLinks} className="mt-4" />
                      </div>
                    </div>

                    <div className="mt-5">
                      <AlbumDetailPanel album={album} />
                    </div>
                  </div>
                ) : null}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
