interface StarChartProps {
  prompt: string;
  average: number;
  distribution: number[];
}

export function StarChart({ prompt, average, distribution }: StarChartProps) {
  const max = Math.max(...distribution, 1);
  return (
    <div className="bg-gray-800 rounded-2xl p-6">
      <p className="text-gray-300 text-sm mb-3">{prompt}</p>
      <p className="text-5xl font-black text-yellow-400">{average.toFixed(1)} ★</p>
      <div className="flex gap-1 mt-4 items-end h-16">
        {distribution.map((count, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-yellow-400 rounded transition-all duration-700"
              style={{ height: `${(count / max) * 56}px` }}
            />
            <span className="text-gray-500 text-xs">{i + 1}★</span>
          </div>
        ))}
      </div>
    </div>
  );
}
