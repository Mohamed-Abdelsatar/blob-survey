interface PollChartProps {
  prompt: string;
  counts: Record<string, number>;
}

export function PollChart({ prompt, counts }: PollChartProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const max = Math.max(...Object.values(counts), 1);

  return (
    <div className="bg-gray-800 rounded-2xl p-6">
      <p className="text-gray-300 text-sm mb-4">{prompt}</p>
      <div className="flex flex-col gap-3">
        {Object.entries(counts).map(([option, count]) => (
          <div key={option}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white">{option}</span>
              <span className="text-gray-400">
                {count} ({Math.round((count / total) * 100)}%)
              </span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
