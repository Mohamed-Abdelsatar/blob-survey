interface ResponseCountProps {
  count: number;
  surveyName: string;
}

function hype(count: number) {
  if (count === 0) return "👀 Waiting for brave souls...";
  if (count < 5) return "🌱 Just getting started";
  if (count < 20) return "🔥 It's heating up!";
  if (count < 50) return "🚀 We're cooking!";
  return "🤯 Absolute chaos. Love it.";
}

export function ResponseCount({ count, surveyName }: ResponseCountProps) {
  return (
    <div className="text-center py-6">
      <h1 className="text-2xl font-bold text-white">📊 {surveyName}</h1>
      <p className="text-7xl font-black text-purple-400 mt-2">{count}</p>
      <p className="text-gray-400 text-sm">responses so far</p>
      <p className="text-gray-300 text-base mt-1">{hype(count)}</p>
    </div>
  );
}
