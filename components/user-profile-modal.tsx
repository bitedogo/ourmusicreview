// components/user-profile-modal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useUserProfileData, UserProfilePanel } from "@/components/user-profile-view";

interface UserProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ userId, isOpen, onClose }: UserProfileModalProps) {
  const {
    userProfile,
    userReviews,
    isLoading,
    isLoadingMore,
    error,
    totalReviewCount,
    isAllReviewsView,
    setIsAllReviewsView,
    handleOpenAllReviewsView,
    resetState,
    showMoreButton,
    reviewsHidden,
    ratingHidden,
  } = useUserProfileData(userId, { enabled: isOpen });

  const handleClose = () => {
    onClose();
    resetState();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-white/20 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {isLoading && <div className="mt-4 text-center text-gray-500">로딩 중...</div>}
                {error && <div className="mt-4 text-center text-red-500">{error}</div>}

                {userProfile && (
                  <div className="mt-4">
                    <UserProfilePanel
                      userProfile={userProfile}
                      userReviews={userReviews}
                      totalReviewCount={totalReviewCount}
                      isAllReviewsView={isAllReviewsView}
                      isLoadingMore={isLoadingMore}
                      showMoreButton={showMoreButton}
                      onOpenAllReviews={handleOpenAllReviewsView}
                      onBackToProfile={() => setIsAllReviewsView(false)}
                      onReviewNavigate={handleClose}
                      reviewsHidden={reviewsHidden}
                      ratingHidden={ratingHidden}
                    />
                  </div>
                )}

                <div className="mt-4 text-right">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={handleClose}
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
