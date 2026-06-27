"use client";

import { StarRating } from "./StarRating";
import { PollQuestion } from "./PollQuestion";
import { TextQuestion } from "./TextQuestion";

interface Question {
  id: string;
  type: string;
  prompt: string;
  options: string | null;
}

interface QuestionCardProps {
  question: Question;
  value: unknown;
  onChange: (v: unknown) => void;
}

export function QuestionCard({ question, value, onChange }: QuestionCardProps) {
  const options: string[] = question.options ? JSON.parse(question.options) : [];

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <div className="text-center mb-2">
        <span className="text-3xl">{question.type === "star" ? "⭐" : question.type === "poll" ? "🗳️" : "💬"}</span>
        <h2 className="text-xl font-semibold mt-1">{question.prompt}</h2>
      </div>

      {question.type === "star" && (
        <StarRating value={value as number | null} onChange={(n) => onChange(n)} />
      )}
      {question.type === "poll" && (
        <PollQuestion
          options={options}
          value={value as string | null}
          onChange={(s) => onChange(s)}
        />
      )}
      {question.type === "text" && (
        <TextQuestion value={(value as string) ?? ""} onChange={(s) => onChange(s)} />
      )}
    </div>
  );
}
