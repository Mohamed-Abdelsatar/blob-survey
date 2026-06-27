"use client";

interface StarRatingProps {
  value: number | null;
  onChange: (n: number) => void;
}

export function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="flex gap-3 justify-center py-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className={`text-5xl transition-transform hover:scale-125 ${
            value !== null && star <= value ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
