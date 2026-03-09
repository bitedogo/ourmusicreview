export interface ReviewStatusSource {
  isApproved: "Y" | "N";
  rejectReason: string | null;
}

export type ReviewStatus = "approved" | "rejected" | "pending";

export function getReviewStatus(review: ReviewStatusSource): ReviewStatus {
  if (review.isApproved === "Y") {
    return "approved";
  }

  if (review.rejectReason) {
    return "rejected";
  }

  return "pending";
}
