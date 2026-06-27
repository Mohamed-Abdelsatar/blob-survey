interface ResponseCountProps {
  count: number;
  surveyName: string;
}

export function ResponseCount({ count, surveyName }: ResponseCountProps) {
  return (
    <div className="text-center py-6">
      <h1 className="text-2xl font-bold text-white">{surveyName}</h1>
      <p className="text-5xl font-black text-purple-400 mt-2">{count}</p>
      <p className="text-gray-400 text-sm">responses so far</p>
    </div>
  );
}
