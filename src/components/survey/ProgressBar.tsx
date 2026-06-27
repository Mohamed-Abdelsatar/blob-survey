interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100);
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-purple-500 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
