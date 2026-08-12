/** 회원 목록 필터·정렬 순수 함수 */

import type {
  Member,
  MemberSortColumn,
  MemberTabType,
} from "@/src/components/admin/members/types";

export function filterAndSortMembers(
  members: Member[],
  options: {
    activeTab: MemberTabType;
    searchQuery: string;
    sortColumn: MemberSortColumn;
    sortDirection: "asc" | "desc";
  }
): Member[] {
  let list = members;

  if (options.activeTab === "admin") {
    list = list.filter((member) => member.role === "ADMIN");
  } else if (options.activeTab === "warned") {
    list = list.filter(
      (member) =>
        member.accountStatus === "WARNED" || (member.warningCount ?? 0) > 0
    );
  } else if (options.activeTab === "suspended") {
    list = list.filter((member) => member.accountStatus === "SUSPENDED");
  }

  const query = options.searchQuery.trim().toLowerCase();
  if (query) {
    list = list.filter(
      (member) =>
        member.nickname.toLowerCase().includes(query) ||
        member.id.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)
    );
  }

  return [...list].sort((a, b) => {
    let cmp = 0;
    switch (options.sortColumn) {
      case "nickname":
        cmp = (a.nickname || a.id).localeCompare(b.nickname || b.id);
        break;
      case "role":
        cmp = (a.role === "ADMIN" ? 1 : 0) - (b.role === "ADMIN" ? 1 : 0);
        break;
      case "createdAt":
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "email":
        cmp = (a.email || "").localeCompare(b.email || "");
        break;
      case "accountStatus": {
        const rank = (status: string | undefined) =>
          status === "SUSPENDED" ? 2 : status === "WARNED" ? 1 : 0;
        cmp = rank(a.accountStatus) - rank(b.accountStatus);
        break;
      }
      default:
        break;
    }
    return options.sortDirection === "asc" ? cmp : -cmp;
  });
}
