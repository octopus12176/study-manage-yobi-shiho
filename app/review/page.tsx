import { Suspense } from 'react';

import { ReviewSummary } from '@/components/review/review-summary';
import { ReviewInsightsSection } from '@/components/review/review-insights-section';
import { getDashboardData } from '@/lib/dashboard';

function InsightsLoading() {
  return (
    <div className='flex items-center justify-center py-12'>
      <div className='flex flex-col items-center gap-4'>
        <div className='flex gap-1'>
          <div className='h-2 w-2 rounded-full bg-accent animate-bounce' style={{ animationDelay: '0ms' }} />
          <div className='h-2 w-2 rounded-full bg-accent animate-bounce' style={{ animationDelay: '150ms' }} />
          <div className='h-2 w-2 rounded-full bg-accent animate-bounce' style={{ animationDelay: '300ms' }} />
        </div>
        <p className='text-sm text-sub'>AI分析中...</p>
      </div>
    </div>
  );
}

export default async function ReviewPage() {
  const data = await getDashboardData();

  return (
    <div className='flex flex-col gap-6'>
      <ReviewSummary data={data} />
      <Suspense fallback={<InsightsLoading />}>
        <ReviewInsightsSection data={data} />
      </Suspense>
    </div>
  );
}
