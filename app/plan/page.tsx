import { PlanView } from '@/components/plan/plan-view';
import { getDashboardData } from '@/lib/dashboard';

export default async function PlanPage() {
  const data = await getDashboardData();

  return <PlanView data={data} />;
}
