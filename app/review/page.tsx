import { ReviewView } from '@/components/review/review-view';
import { getDashboardData } from '@/lib/dashboard';
import { generateReviewInsights } from '@/lib/review/insights';

export default async function ReviewPage() {
  const data = await getDashboardData();

  const insights = await generateReviewInsights(data);

  return <ReviewView data={data} insights={insights} />;
}
