"use client";

interface TextQuestionProps {
  value: string;
  onChange: (s: string) => void;
}

export function TextQuestion({ value, onChange }: TextQuestionProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your thoughts here..."
      rows={4}
      className="w-full border-2 border-gray-200 rounded-xl p-5 text-lg focus:outline-none focus:border-purple-400 resize-none"
    />
  );
}
