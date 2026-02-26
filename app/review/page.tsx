import { ReviewView } from '@/components/review/review-view';
import { getDashboardData } from '@/lib/dashboard';

export default async function ReviewPage() {
  const data = await getDashboardData();

  return <ReviewView data={data} />;
}
