/** 디자이너 가이드 실물 샘플 */

import Image from "next/image";
import { HomeHeroCopy } from "@/src/components/app/home-hero-copy";
import { EmptyState } from "@/src/components/common/empty-state";
import { ColorChipGrid, type ColorChipData } from "@/src/components/designer/color-chip";
import { RatingDisplay } from "@/src/components/app/rating-display";
import { ReviewRatingBadge } from "@/src/components/reviews/review-rating-badge";
import { REVIEW_DETAIL_INTERACTION_CLASS } from "@/src/components/interaction/review-detail-interaction-styles";
import { LOGO_ALT, LOGO_SRC } from "@/src/lib/site/branding";
import { formatRating, getRatingScoreColor } from "@/src/lib/utils/rating";
import { TODAY_ALBUM_TABS } from "@/src/lib/today-album/types";

const BRAND_CHIPS: ColorChipData[] = [
  {
    name: "Brand",
    hex: "#43A7B2",
    token: "--color-brand-primary",
    swatch: "#43A7B2",
    note: "CTA · 링크",
  },
  {
    name: "Brand hover",
    hex: "#3796A0",
    token: "--color-brand-primary-hover",
    swatch: "#3796A0",
  },
  {
    name: "Hero title",
    hex: "#35909A",
    token: "--color-hero-title",
    swatch: "#35909A",
  },
  {
    name: "Text",
    hex: "#505050",
    token: "--color-text-primary",
    swatch: "#505050",
    note: "본문",
  },
  {
    name: "Secondary",
    hex: "#949494",
    token: "--color-text-secondary",
    swatch: "#949494",
  },
  {
    name: "Muted",
    hex: "#C4C4C4",
    token: "--color-text-muted",
    swatch: "#C4C4C4",
  },
  {
    name: "Border",
    hex: "#E4E4E7",
    token: "--color-border",
    swatch: "#E4E4E7",
  },
  {
    name: "Background",
    hex: "#FFFFFF",
    token: "--background",
    swatch: "#FFFFFF",
  },
];

const TODAY_ALBUM_CHIPS: ColorChipData[] = [
  {
    name: "Today 탭",
    hex: "#FBFBFB",
    token: "--color-today-album-tab-today",
    swatch: "#FBFBFB",
  },
  {
    name: "Yesterday 탭",
    hex: "#F4F4F4",
    token: "--color-today-album-tab-yesterday",
    swatch: "#F4F4F4",
  },
  {
    name: "Previous 탭",
    hex: "#E3E3E3",
    token: "--color-today-album-tab-previous",
    swatch: "#E3E3E3",
  },
];

const RATING_CHIPS: ColorChipData[] = [
  {
    name: "9.0+",
    hex: "#F82512",
    token: "--color-rating-score-high",
    swatch: "#F82512",
  },
  {
    name: "6.0–8.9",
    hex: "#FFA310",
    token: "--color-rating-score-mid-high",
    swatch: "#FFA310",
  },
  {
    name: "3.0–5.9",
    hex: "#F8CA12",
    token: "--color-rating-score-mid",
    swatch: "#F8CA12",
  },
  {
    name: "0–2.9",
    hex: "#63C4CC",
    token: "--color-rating-score-low",
    swatch: "#63C4CC",
  },
];

function SpecimenBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5 sm:p-6">
      <p className="mb-4 text-xs font-semibold tracking-wide text-[var(--color-brand-primary)]">
        LIVE · {title}
      </p>
      {children}
    </section>
  );
}

export function DesignerIndexSpecimens() {
  return (
    <div>
      <SpecimenBlock title="브랜드 스트립">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <Image
            src={LOGO_SRC}
            alt={LOGO_ALT}
            width={141}
            height={73}
            className="h-auto w-[104px] sm:w-[141px]"
          />
          <div className="flex flex-1 gap-2">
            {["#43A7B2", "#35909A", "#505050", "#949494", "#F82512", "#FFA310", "#F8CA12"].map(
              (hex) => (
                <span
                  key={hex}
                  className="h-10 flex-1 rounded-lg border border-zinc-200"
                  style={{ background: hex }}
                  title={hex}
                />
              )
            )}
          </div>
        </div>
      </SpecimenBlock>
      <HomeHeroCopy className="mt-10" />
    </div>
  );
}

export function DesignerColorSpecimens() {
  return (
    <div>
      <SpecimenBlock title="브랜드 · 텍스트">
        <ColorChipGrid chips={BRAND_CHIPS} />
      </SpecimenBlock>
      <SpecimenBlock title="평점 온도계">
        <ColorChipGrid chips={RATING_CHIPS} />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[9.5, 7.0, 4.5, 1.0].map((rating) => (
            <div
              key={rating}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-4 text-center"
            >
              <RatingDisplay rating={rating} />
            </div>
          ))}
        </div>
      </SpecimenBlock>
      <SpecimenBlock title="오늘의 앨범">
        <ColorChipGrid chips={TODAY_ALBUM_CHIPS} />
        <div className="mt-6 flex items-end gap-1">
          {TODAY_ALBUM_TABS.map((tab, index) => {
            const isActive = index === 0;
            return (
              <span
                key={tab.id}
                className={`box-border flex h-[45px] w-[130px] items-center justify-center rounded-t-2xl text-sm font-semibold sm:text-base ${
                  isActive
                    ? "relative z-10 border border-[var(--color-border)] border-b-white bg-white text-[var(--color-text-primary)]"
                    : "border border-[var(--color-border)] text-[var(--color-text-secondary)]"
                }`}
                style={
                  isActive
                    ? undefined
                    : {
                        backgroundColor: `var(--color-today-album-tab-${tab.id})`,
                      }
                }
              >
                {tab.label}
              </span>
            );
          })}
        </div>
      </SpecimenBlock>
    </div>
  );
}

export function DesignerTypeSpecimens() {
  return (
    <SpecimenBlock title="타입 스케일">
      <div className="space-y-6">
        <p className="text-[length:var(--text-hero-title-mobile)] font-semibold leading-[var(--leading-hero-title)] tracking-[var(--tracking-hero-title)] text-[var(--color-hero-title)] sm:text-[length:var(--text-hero-title-desktop)]">
          당신의 음악을 기록하고 공유하세요
        </p>
        <p className="text-[length:var(--text-hero-subtitle-mobile)] text-[var(--color-hero-subtitle)] sm:text-[length:var(--text-hero-subtitle-desktop)] sm:font-semibold">
          좋아하는 앨범을 저장하고, 리뷰로 감상을 남기고, 새로운 음악을 발견하세요.
        </p>
        <p className="text-[length:var(--nav-menu-font-size)] font-medium tracking-[var(--tracking-nav-menu)] text-[var(--color-nav-menu)]">
          앨범 리뷰 · 국내게시판 · 해외게시판
        </p>
        <p className="text-[15px] leading-7 text-[var(--color-text-primary)]">
          본문 예시. 색은 #505050, 서체는 Pretendard입니다. 검정 본문은 쓰지 않습니다.
        </p>
        <p className="text-[14px] font-bold leading-[145%] tracking-[0.03em] text-[var(--color-text-primary)] sm:text-[length:var(--text-today-album-title)]">
          오늘의 앨범 제목 · 24px / #505050
        </p>
        <p className="text-[length:var(--text-today-album-body-mobile)] font-normal leading-[170%] tracking-[0.03em] text-[var(--color-text-muted)] sm:text-[15px]">
          오늘의 앨범 소개글. 15px / 행간 170% / #C4C4C4.
        </p>
        <p className="text-sm text-[var(--color-text-secondary)]">
          보조 텍스트 #949494 — 설명, 날짜, 빈 상태.
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">캡션 · 플레이스홀더 #C4C4C4</p>
      </div>
    </SpecimenBlock>
  );
}

export function DesignerLayoutSpecimens() {
  return (
    <SpecimenBlock title="캔버스 · 라운드 · 끊김">
      <div className="space-y-5 text-sm text-[var(--color-text-primary)]">
        <div>
          <p className="mb-2 text-xs text-[var(--color-text-secondary)]">콘텐츠 최대 1100px</p>
          <div className="h-3 w-full rounded-full bg-[rgba(67,167,178,0.2)]">
            <div className="h-3 max-w-[1100px] rounded-full bg-[var(--color-brand-primary)]" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "15px 커버", radius: "15px" },
            { label: "24px 슬라이드", radius: "24px" },
            { label: "26px 오늘의 앨범", radius: "26px" },
            { label: "필 (pill)", radius: "999px" },
          ].map((item) => (
            <div
              key={item.label}
              className="border border-zinc-200 bg-white px-3 py-6 text-center text-xs"
              style={{ borderRadius: item.radius }}
            >
              {item.label}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "base", px: "0" },
            { label: "sm 640", px: "640" },
            { label: "md 768", px: "768" },
          ].map((bp) => (
            <span
              key={bp.label}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1 font-mono text-xs"
            >
              {bp.label}
            </span>
          ))}
        </div>
      </div>
    </SpecimenBlock>
  );
}

export function DesignerComponentSpecimens() {
  const samples = [
    { rating: 9.6, label: "High" },
    { rating: 7.2, label: "Mid-high" },
    { rating: 4.0, label: "Mid" },
    { rating: 1.5, label: "Low" },
  ];

  return (
    <div>
      <SpecimenBlock title="Primary · Secondary">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="rounded-full bg-[var(--color-brand-primary)] px-8 py-3 text-sm font-medium text-white hover:bg-[var(--color-brand-primary-hover)]"
          >
            리뷰 작성
          </button>
          <button
            type="button"
            className={`${REVIEW_DETAIL_INTERACTION_CLASS.pill} ${REVIEW_DETAIL_INTERACTION_CLASS.likeButton}`}
          >
            <span className={REVIEW_DETAIL_INTERACTION_CLASS.label}>좋아요</span>
          </button>
          <button
            type="button"
            className="text-sm font-medium text-[var(--color-brand-primary)] underline underline-offset-2"
          >
            홈으로 돌아가기
          </button>
        </div>
      </SpecimenBlock>

      <SpecimenBlock title="평점 뱃지 (커버 좌하단)">
        <div className="flex flex-wrap gap-6">
          {samples.map((sample) => (
            <div
              key={sample.rating}
              className="relative h-[120px] w-[120px] overflow-hidden rounded-[15px] bg-zinc-200"
            >
              <div className="flex h-full items-center justify-center text-xs text-[var(--color-text-secondary)]">
                {sample.label}
              </div>
              <ReviewRatingBadge
                ratingText={formatRating(sample.rating)}
                ratingColor={getRatingScoreColor(sample.rating)}
                size="desktop"
              />
            </div>
          ))}
        </div>
      </SpecimenBlock>

      <SpecimenBlock title="빈 상태">
        <EmptyState>아직 작성한 리뷰가 없습니다.</EmptyState>
      </SpecimenBlock>
    </div>
  );
}

export function DesignerSpecimens({ slug }: { slug?: string }) {
  if (!slug) return <DesignerIndexSpecimens />;
  if (slug === "01_brand") return <DesignerIndexSpecimens />;
  if (slug === "02_color") return <DesignerColorSpecimens />;
  if (slug === "03_typography") return <DesignerTypeSpecimens />;
  if (slug === "04_layout") return <DesignerLayoutSpecimens />;
  if (slug === "05_components") return <DesignerComponentSpecimens />;
  return null;
}
