"use client";

interface PollQuestionProps {
  options: string[];
  value: string | null;
  onChange: (s: string) => void;
}

export function PollQuestion({ options, value, onChange }: PollQuestionProps) {
  return (
    <div className="flex flex-col gap-3 py-4">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`w-full py-3 px-6 rounded-xl border-2 text-left font-medium transition-all ${
            value === opt
              ? "bg-purple-600 border-purple-600 text-white"
              : "bg-white border-gray-200 hover:border-purple-400"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
