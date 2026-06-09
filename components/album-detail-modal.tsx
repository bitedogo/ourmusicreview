import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import Image from "next/image";
import { MusicInfo } from "@/src/lib/itunes/types";

interface AlbumDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: MusicInfo | null;
}

export function AlbumDetailModal({ isOpen, onClose, album }: AlbumDetailModalProps) {
  if (!album) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  앨범 상세 정보
                </Dialog.Title>
                <div className="mt-4">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={album.albumImage || album.artistImage || "/default-album.png"}
                      alt={album.albumName}
                      width={100}
                      height={100}
                      className="rounded-md object-cover"
                    />
                    <div>
                      <p className="text-lg font-bold text-zinc-900">{album.albumName}</p>
                      <p className="text-sm text-zinc-600">{album.artistName}</p>
                      {album.releaseDate && (
                        <p className="text-xs text-zinc-500">발매일: {album.releaseDate}</p>
                      )}
                    </div>
                  </div>

                  {album.tracks && album.tracks.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-zinc-800">트랙리스트</h4>
                      <ul className="mt-2 text-sm text-zinc-700 divide-y divide-zinc-200 border border-zinc-200 rounded-md bg-zinc-50 p-2 max-h-60 overflow-y-auto">
                        {album.tracks.map((track, index) => (
                          <li key={track.id} className="flex justify-between items-center py-2 px-3 last:border-b-0">
                            <span className="flex-1 truncate"><span className="text-zinc-500 mr-2 font-medium">{index + 1}.</span>{track.title}</span>
                            <span className="text-xs text-zinc-500">{Math.floor(track.duration / 60)}:{('0' + (track.duration % 60)).slice(-2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    닫기
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
