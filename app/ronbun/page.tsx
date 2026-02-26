import { TrackView } from '@/components/track/track-view';
import { getTrackPageData } from '@/lib/track-stats';

export default async function RonbunPage() {
  const data = await getTrackPageData('ronbun');

  return (
    <main className='flex flex-col gap-4'>
      <div>
        <h1 className='text-2xl font-black'>論文</h1>
        <p className='text-sub'>論文試験に向けた学習の進捗を分析</p>
      </div>

      <TrackView data={data} />
    </main>
  );
}
