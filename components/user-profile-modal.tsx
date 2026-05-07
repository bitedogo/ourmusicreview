// components/user-profile-modal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useLayoutEffect, useCallback, useMemo, useId } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchJson } from "@/src/lib/http/client";

interface UserProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  id: string;
  nickname: string;
  name: string | null;
  email: string | null;
  profileImage: string | null;
  gender: "MALE" | "FEMALE" | "NONE" | null;
  createdAt: string;
  averageRating: number;
}

interface UserReview {
  id: string;
  content: string;
  rating: number;
  album: {
    id: string;
    title: string;
    artist: string;
    imageUrl: string;
  };
  createdAt: string;
}

interface ProfileApiData {
  profile: UserProfile;
  totalReviewCount: number;
  reviews: UserReview[];
}

const GENDER_LABEL: Record<string, string> = {
  MALE: "남성",
  FEMALE: "여성",
  NONE: "-",
};

const RATING_COMMENT: Record<number, string> = {
  0: "취향 문턱이 너무 높으신데요..",
  1: "쉽게 만족 안 하시는 타입이군요..?",
  2: "듣는 기준이 확실히 까다롭네요 ㅠㅠ",
  3: "좋은 점수 받기 쉽지 않겠어요..",
  4: "기준이 살짝 높은 편이네요..",
  5: "무난하게 평가하시는 편이네요",
  6: "여유 있게 들어주시는 느낌이네요~~",
  7: "음악을 잘 즐기시는 편이네요!!",
  8: "긍정적으로 많이 들으시는 듯..?",
  9: "거의 다 좋게 들으시겠어요 ㅎㅎ",
  10: "음악 자체를 즐기시는 타입이네요!!",
};

const INITIAL_REVIEW_LIMIT = 5;

function ProfileReviewRow({
  review,
  onNavigate,
}: {
  review: UserReview;
  onNavigate: () => void;
}) {
  return (
    <li>
      <Link
        href={`/review/${encodeURIComponent(review.id)}`}
        onClick={onNavigate}
        className="flex items-center space-x-3 rounded-lg py-1 transition hover:bg-zinc-50"
      >
        {review.album.imageUrl ? (
          <Image
            src={review.album.imageUrl}
            alt={review.album.title}
            width={40}
            height={40}
            className="rounded-md object-cover"
          />
        ) : null}
        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-medium text-gray-900">{review.album.title}</p>
          <p className="text-xs text-gray-500">
            {review.album.artist} - 평점: {review.rating}
          </p>
        </div>
      </Link>
    </li>
  );
}

function ProfileRatingGauge({ averageRating, nickname }: { averageRating: number; nickname: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gradId = `pmg-${uid}`;
  const pathId = `pml-${uid}`;

  const { arcLength, dashOffset, dotX, dotY, displayRating, ratingComment, reviewerType } = useMemo(() => {
    const clamped = Math.min(10, Math.max(0, averageRating));
    const pct = clamped / 10;
    const arc = Math.PI * 48;
    return {
      arcLength: arc,
      dashOffset: arc * (1 - pct),
      dotX: 64 + 48 * Math.cos(Math.PI * (1 - pct)),
      dotY: 56 - 48 * Math.sin(Math.PI * (1 - pct)),
      displayRating: clamped,
      ratingComment: RATING_COMMENT[Math.round(clamped)] ?? RATING_COMMENT[5],
      reviewerType: clamped < 3.5 ? "harsh" : clamped < 6.5 ? "critical" : "light",
    } as const;
  }, [averageRating]);

  return (
    <div className="flex w-[190px] shrink-0 flex-col items-center gap-1">
      <div className="relative h-32 w-44">
        <svg viewBox="0 0 128 88" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5c6ba3" />
              <stop offset="100%" stopColor="#1E264D" />
            </linearGradient>
            <path id={pathId} d="M 8 56 A 56 56 0 0 1 120 56" fill="none" />
          </defs>
          <path
            d="M 16 56 A 48 48 0 0 1 112 56"
            fill="none"
            stroke="#e4e4e7"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 16 56 A 48 48 0 0 1 112 56"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.4s ease-out" }}
          />
          <circle cx={dotX} cy={dotY} r="5" fill="white" stroke="#1E264D" strokeWidth="2" />
          <text
            fontSize="5"
            fontWeight={reviewerType === "harsh" ? 600 : 500}
            fill={reviewerType === "harsh" ? "#1E264D" : "#71717a"}
          >
            <textPath href={`#${pathId}`} startOffset="12%" textAnchor="middle">
              Harsh Reviewer
            </textPath>
          </text>
          <text
            fontSize="5"
            fontWeight={reviewerType === "critical" ? 600 : 500}
            fill={reviewerType === "critical" ? "#1E264D" : "#71717a"}
          >
            <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
              Critical Reviewer
            </textPath>
          </text>
          <text
            fontSize="5"
            fontWeight={reviewerType === "light" ? 600 : 500}
            fill={reviewerType === "light" ? "#1E264D" : "#71717a"}
          >
            <textPath href={`#${pathId}`} startOffset="88%" textAnchor="middle">
              Light Reviewer
            </textPath>
          </text>
        </svg>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <span className="text-4xl font-bold text-[#1E264D]">{displayRating.toFixed(1)}</span>
        </div>
      </div>
      <p className="text-sm text-zinc-600">
        평론가 <span className="font-semibold text-zinc-900">{nickname}</span> 님의 평균평점
      </p>
      <p className="text-sm font-semibold text-[#1E264D]">{ratingComment}</p>
    </div>
  );
}

export function UserProfileModal({ userId, isOpen, onClose }: UserProfileModalProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalReviewCount, setTotalReviewCount] = useState(0);
  const [isAllReviewsView, setIsAllReviewsView] = useState(false);

  const resetState = useCallback(() => {
    setUserProfile(null);
    setUserReviews([]);
    setTotalReviewCount(0);
    setIsLoading(false);
    setIsLoadingMore(false);
    setIsAllReviewsView(false);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    resetState();
  }, [onClose, resetState]);

  useLayoutEffect(() => {
    if (!isOpen || !userId) {
      return;
    }

    let cancelled = false;

    async function loadInitial() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchJson<{ ok: boolean; data: ProfileApiData }>(
          `/api/profile/${userId}?offset=0&limit=${INITIAL_REVIEW_LIMIT}`,
        );
        if (cancelled) return;
        if (data.ok && data.data) {
          setUserProfile(data.data.profile);
          setUserReviews(data.data.reviews);
          setTotalReviewCount(data.data.totalReviewCount);
          setIsAllReviewsView(false);
        } else {
          setError("프로필 정보를 가져오는 데 실패했습니다.");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch user profile:", err);
          setError("프로필 정보를 가져오는 중 오류가 발생했습니다.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadInitial();
    return () => {
      cancelled = true;
    };
  }, [userId, isOpen]);

  const handleOpenAllReviewsView = useCallback(async () => {
    if (!userId || isLoadingMore) return;

    if (userReviews.length >= totalReviewCount) {
      setIsAllReviewsView(true);
      return;
    }

    setIsLoadingMore(true);
    try {
      const data = await fetchJson<{ ok: boolean; data: ProfileApiData }>(
        `/api/profile/${userId}?offset=0&limit=${Math.max(totalReviewCount, INITIAL_REVIEW_LIMIT)}`,
      );
      if (data.ok && data.data) {
        setTotalReviewCount(data.data.totalReviewCount);
        setUserReviews(data.data.reviews);
        setIsAllReviewsView(true);
      }
    } catch {
    } finally {
      setIsLoadingMore(false);
    }
  }, [userId, isLoadingMore, userReviews.length, totalReviewCount]);

  const showMoreButton = userReviews.length < totalReviewCount;

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

                {userProfile && !isAllReviewsView && (
                  <div className="mt-4">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-20 w-20 overflow-hidden rounded-full border border-gray-200">
                          <Image
                            src={userProfile.profileImage || "/default-avatar.png"}
                            alt={userProfile.nickname}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-gray-900">{userProfile.nickname}</p>
                          <p className="text-sm text-gray-500">{userProfile.email}</p>
                          <p className="text-xs text-gray-500">
                            가입일: {new Date(userProfile.createdAt).toLocaleDateString("ko-KR")}
                          </p>
                          <p className="mt-1 text-sm font-medium text-gray-700">
                            성별:{" "}
                            <span className="font-semibold text-gray-900">
                              {GENDER_LABEL[userProfile.gender || "NONE"]}
                            </span>
                          </p>
                        </div>
                      </div>
                      <ProfileRatingGauge
                        averageRating={userProfile.averageRating}
                        nickname={userProfile.nickname}
                      />
                    </div>

                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-md font-semibold text-gray-800">작성 리뷰 ({totalReviewCount})</h4>
                        {showMoreButton ? (
                          <button
                            type="button"
                            onClick={handleOpenAllReviewsView}
                            disabled={isLoadingMore}
                            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isLoadingMore ? "불러오는 중..." : "더보기"}
                          </button>
                        ) : null}
                      </div>
                      {userReviews.length > 0 ? (
                        <ul className="space-y-2">
                          {userReviews.slice(0, INITIAL_REVIEW_LIMIT).map((review) => (
                            <ProfileReviewRow key={review.id} review={review} onNavigate={handleClose} />
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">작성한 리뷰가 없습니다.</p>
                      )}
                    </div>
                  </div>
                )}

                {userProfile && isAllReviewsView && (
                  <div className="mt-4">
                    <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-3">
                      <h4 className="text-md font-semibold text-gray-800">작성 리뷰 전체 ({totalReviewCount})</h4>
                      <button
                        type="button"
                        onClick={() => setIsAllReviewsView(false)}
                        className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                      >
                        프로필로
                      </button>
                    </div>
                    {userReviews.length > 0 ? (
                      <ul className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                        {userReviews.map((review) => (
                          <ProfileReviewRow key={review.id} review={review} onNavigate={handleClose} />
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">작성한 리뷰가 없습니다.</p>
                    )}
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
