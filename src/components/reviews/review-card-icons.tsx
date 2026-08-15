/** 리뷰 카드용 아이콘·카운트 */

type IconSize = "mobile" | "desktop";

/** 모바일 하트 13×11 / 댓글 12×12 · 데스크톱 21×18 / 20×20 */
const LIKE_SIZE = { mobile: { w: 13, h: 11 }, desktop: { w: 21, h: 18 } } as const;
const COMMENT_SIZE = { mobile: { w: 12, h: 12 }, desktop: { w: 20, h: 20 } } as const;

export function ReviewLikeIcon({
  size = "desktop",
  stroke = "#C0C0C0",
}: {
  size?: IconSize;
  stroke?: string;
}) {
  const { w, h } = LIKE_SIZE[size];
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 21 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="block shrink-0"
    >
      <path
        d="M13.4395 1.10547C14.4137 0.494364 15.5099 0.370369 16.5508 0.624023C18.6536 1.13673 20.5 3.18567 20.5 5.80566C20.5 7.10358 19.9675 8.48679 19.1006 9.85645C18.2368 11.2211 17.0649 12.535 15.8447 13.6836C14.6259 14.831 13.3714 15.8018 12.3545 16.4834C11.8455 16.8246 11.4021 17.0888 11.0576 17.2656C10.8852 17.3541 10.7448 17.4175 10.6377 17.457C10.5174 17.5014 10.4808 17.5 10.5 17.5C10.5192 17.5 10.4826 17.5014 10.3623 17.457C10.2552 17.4175 10.1148 17.3541 9.94238 17.2656C9.59787 17.0888 9.15449 16.8246 8.64551 16.4834C7.62864 15.8018 6.37414 14.831 5.15527 13.6836C3.93515 12.535 2.76322 11.2211 1.89941 9.85645C1.03252 8.48679 0.5 7.10358 0.5 5.80566C0.500011 3.17454 2.26963 1.1628 4.31738 0.666992C5.33317 0.421104 6.42118 0.546614 7.41699 1.15723C8.41559 1.76968 9.36062 2.89515 10.0312 4.71387L10.5352 6.08105L10.9766 4.69238C11.5622 2.84988 12.4632 1.71791 13.4395 1.10547Z"
        stroke={stroke}
      />
    </svg>
  );
}

export function ReviewCommentIcon({
  size = "desktop",
  stroke = "#C0C0C0",
}: {
  size?: IconSize;
  stroke?: string;
}) {
  const { w, h } = COMMENT_SIZE[size];
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="block shrink-0"
    >
      <path
        d="M9.5 0.5C14.4703 0.500131 18.5 4.52952 18.5 9.5C18.5 10.4366 18.3553 11.3394 18.0898 12.1885L19.1426 18.5L13.7686 17.4248C12.4984 18.1105 11.0447 18.5 9.5 18.5C4.52957 18.5 0.5 14.4706 0.5 9.5C0.5 4.52944 4.52957 0.5 9.5 0.5Z"
        fill="white"
      />
      <path
        d="M9.5 0.5L9.50001 0H9.5V0.5ZM18.0898 12.1885L17.6126 12.0393L17.577 12.1531L17.5967 12.2707L18.0898 12.1885ZM19.1426 18.5L19.0445 18.9903L19.755 19.1324L19.6358 18.4177L19.1426 18.5ZM13.7686 17.4248L13.8666 16.9345L13.6898 16.8991L13.531 16.9848L13.7686 17.4248ZM9.5 18.5V19H9.50001L9.5 18.5ZM9.5 0.5L9.49999 1C14.1942 1.00012 18 4.80568 18 9.5H18.5H19C19 4.25336 14.7464 0.000138193 9.50001 0L9.5 0.5ZM18.5 9.5H18C18 10.3848 17.8633 11.2373 17.6126 12.0393L18.0898 12.1885L18.5671 12.3377C18.8473 11.4414 19 10.4884 19 9.5H18.5ZM18.0898 12.1885L17.5967 12.2707L18.6494 18.5823L19.1426 18.5L19.6358 18.4177L18.583 12.1062L18.0898 12.1885ZM19.1426 18.5L19.2407 18.0097L13.8666 16.9345L13.7686 17.4248L13.6705 17.9151L19.0445 18.9903L19.1426 18.5ZM13.7686 17.4248L13.531 16.9848C12.3319 17.6321 10.9597 18 9.49999 18L9.5 18.5L9.50001 19C11.1297 19 12.6648 18.5889 14.0061 17.8648L13.7686 17.4248ZM9.5 18.5V18C4.80571 18 1 14.1944 1 9.5H0.5H0C0 14.7467 4.25343 19 9.5 19V18.5ZM0.5 9.5H1C1 4.80558 4.80571 1 9.5 1V0.5V0C4.25343 0 0 4.25329 0 9.5H0.5Z"
        fill={stroke}
      />
    </svg>
  );
}

export function ReviewLikeCount({
  count,
  size = "desktop",
}: {
  count: number;
  size?: IconSize;
}) {
  const isMobile = size === "mobile";
  return (
    <span
      className={
        isMobile
          ? "inline-flex items-center gap-[3px]"
          : "inline-flex items-center gap-[7px]"
      }
    >
      <ReviewLikeIcon
        size={size}
        stroke={isMobile ? "#505050" : "#C0C0C0"}
      />
      <span
        className={
          isMobile
            ? "text-[8px] font-normal leading-[10px] text-[#505050]"
            : "text-[14px] font-normal leading-[17px] text-[var(--color-text-primary)]"
        }
      >
        {count}
      </span>
    </span>
  );
}

export function ReviewCommentCount({
  count,
  size = "desktop",
}: {
  count: number;
  size?: IconSize;
}) {
  const isMobile = size === "mobile";
  return (
    <span
      className={
        isMobile
          ? "inline-flex items-center gap-[3px]"
          : "inline-flex items-center gap-[7px]"
      }
    >
      <ReviewCommentIcon
        size={size}
        stroke={isMobile ? "#505050" : "#C0C0C0"}
      />
      <span
        className={
          isMobile
            ? "text-[8px] font-normal leading-[10px] text-[#505050]"
            : "text-[14px] font-normal leading-[17px] text-[var(--color-text-primary)]"
        }
      >
        {count}
      </span>
    </span>
  );
}
