/** 관리자 FAQ 관리 페이지 */

import { FaqManagementClient } from "./faq-management-client";

export default function AdminFaqPage() {
  return (
    <div className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <FaqManagementClient />
    </div>
  );
}
