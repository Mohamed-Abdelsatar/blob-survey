interface WordCloudProps {
  prompt: string;
  topWords: string[];
}

const sizes = ["text-4xl", "text-3xl", "text-2xl", "text-xl", "text-lg", "text-base"];
const colors = [
  "text-purple-400",
  "text-pink-400",
  "text-yellow-400",
  "text-green-400",
  "text-blue-400",
];

export function WordCloud({ prompt, topWords }: WordCloudProps) {
  return (
    <div className="bg-gray-800 rounded-2xl p-6">
      <p className="text-gray-300 text-sm mb-4">{prompt}</p>
      {topWords.length === 0 ? (
        <p className="text-gray-500 italic">No text responses yet</p>
      ) : (
        <div className="flex flex-wrap gap-3 justify-center">
          {topWords.map((word, i) => (
            <span
              key={word}
              className={`font-bold ${sizes[Math.min(i, sizes.length - 1)]} ${
                colors[i % colors.length]
              }`}
            >
              {word}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
