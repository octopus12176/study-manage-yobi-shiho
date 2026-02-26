import { ReviewSummary } from '@/components/review/review-summary';
import { ReviewInsightsSection } from '@/components/review/review-insights-section';
import { getDashboardData } from '@/lib/dashboard';

export default async function ReviewPage() {
  const data = await getDashboardData();

  return (
    <div className='flex flex-col gap-6'>
      <ReviewSummary data={data} />
      <ReviewInsightsSection data={data} />
    </div>
  );
}
