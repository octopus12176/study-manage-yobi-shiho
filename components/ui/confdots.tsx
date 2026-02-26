type ConfDotsProps = {
  value: number;
  size?: number;
};

export function ConfDots({ value, size = 7 }: ConfDotsProps) {
  return (
    <div className='flex items-center gap-1'>
      {[1, 2, 3, 4, 5].map((v) => (
        <span
          key={v}
          style={{
            width: size,
            height: size,
            borderRadius: '999px',
            background:
              v <= value
                ? value <= 2
                  ? 'var(--danger)'
                  : value <= 3
                    ? 'var(--warn)'
                    : 'var(--success)'
                : 'var(--border)',
          }}
        />
      ))}
    </div>
  );
}
