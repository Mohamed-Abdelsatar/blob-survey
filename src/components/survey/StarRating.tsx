"use client";

interface StarRatingProps {
  value: number | null;
  onChange: (n: number) => void;
}

const starEmojis = ["💀", "😬", "🤷", "😊", "🔥"];
const starLabels = ["Painful", "Meh", "Fine I guess", "Pretty good", "LEGENDARY"];

export function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="flex gap-3 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            title={starLabels[star - 1]}
            className={`text-6xl transition-all hover:scale-125 ${
              value !== null && star <= value ? "grayscale-0 scale-110" : "grayscale opacity-40"
            }`}
          >
            {starEmojis[star - 1]}
          </button>
        ))}
      </div>
      {value !== null && (
        <p className="text-base font-semibold text-purple-600 animate-fade-in">
          {starLabels[value - 1]}
        </p>
      )}
    </div>
  );
}
