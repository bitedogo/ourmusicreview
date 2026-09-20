/** 관리자 홈 */

import { AdminOverview } from "@/src/components/admin/shell/admin-overview";
import { getAdminOverview } from "@/src/lib/admin/admin-overview-service";
import { withDatabaseRead } from "@/src/lib/db";

export default async function AdminHomePage() {
  const data = await withDatabaseRead(getAdminOverview);

  return <AdminOverview data={data} />;
}
