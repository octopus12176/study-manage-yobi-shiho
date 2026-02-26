import { TrackView } from '@/components/track/track-view';
import { getTrackPageData } from '@/lib/track-stats';

export default async function TantouPage() {
  const data = await getTrackPageData('tantou');

  return (
    <main className='flex flex-col gap-4'>
      <div>
        <h1 className='text-2xl font-black'>短答</h1>
        <p className='text-sub'>短答試験に向けた学習の進捗を分析</p>
      </div>

      <TrackView data={data} />
    </main>
  );
}
