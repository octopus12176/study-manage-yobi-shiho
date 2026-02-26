export default function Loading() {
  return (
    <div className='flex items-center justify-center py-12'>
      <div className='flex flex-col items-center gap-4'>
        <div className='flex gap-1'>
          <div className='h-2 w-2 rounded-full bg-accent animate-bounce' style={{ animationDelay: '0ms' }} />
          <div className='h-2 w-2 rounded-full bg-accent animate-bounce' style={{ animationDelay: '150ms' }} />
          <div className='h-2 w-2 rounded-full bg-accent animate-bounce' style={{ animationDelay: '300ms' }} />
        </div>
        <p className='text-sm text-sub'>読み込み中...</p>
      </div>
    </div>
  );
}
