import { DashboardView } from '@/components/dashboard/dashboard-view';
import { getDashboardData } from '@/lib/dashboard';

export default async function DashboardPage() {
  const data = await getDashboardData();

  return <DashboardView data={data} />;
}
