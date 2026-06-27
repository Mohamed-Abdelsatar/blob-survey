"use client";

import { useState } from "react";
import { BlobMascot, type BlobState } from "./BlobMascot";
import { QuestionCard } from "./QuestionCard";
import { ProgressBar } from "./ProgressBar";
import { CompletionScreen } from "./CompletionScreen";
import { getQuip, getMeme } from "@/lib/quips";

interface Question {
  id: string;
  type: string;
  prompt: string;
  options: string | null;
}

interface Survey {
  id: string;
  name: string;
  questions: Question[];
}

interface SurveyFlowProps {
  survey: Survey;
}

function sentimentFromAnswer(question: Question, value: unknown): BlobState {
  if (value === null || value === undefined || value === "") return "idle";
  if (question.type === "star") {
    const n = Number(value);
    if (n >= 5) return "excited";
    if (n >= 3) return "happy";
    return "sad";
  }
  return "happy";
}

export function SurveyFlow({ survey }: SurveyFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [blobState, setBlobState] = useState<BlobState>("idle");
  const [quip, setQuip] = useState<string | null>(getQuip("idle"));
  const [meme, setMeme] = useState<{ url: string; alt: string } | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const questions = survey.questions;
  const currentQuestion = questions[currentIndex];

  function handleAnswer(value: unknown) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    const state = sentimentFromAnswer(currentQuestion, value);
    setBlobState(state);

    if (currentQuestion.type === "text" && value) {
      setQuip(getQuip("submitted"));
      setMeme(getMeme("submitted"));
    } else if (state === "excited") {
      setQuip(getQuip("excited"));
      setMeme(getMeme("excited"));
    } else if (state === "happy") {
      setQuip(getQuip("happy"));
      setMeme(getMeme("happy"));
    } else if (state === "sad") {
      setQuip(getQuip("sad"));
      setMeme(getMeme("sad"));
    }
  }

  async function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setBlobState("idle");
      setQuip(null);
      setMeme(null);
    } else {
      setSubmitting(true);
      await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyId: survey.id, answers }),
      });
      setBlobState("celebrating");
      setQuip("You legend. That's a wrap! 🎊");
      setDone(true);
      setSubmitting(false);
    }
  }

  function handleSkip() {
    setBlobState("idle");
    setQuip(getQuip("skipped"));
    setMeme(getMeme("skipped"));
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleNext();
    }
  }

  if (done) return <CompletionScreen surveyName={survey.name} />;

  const currentValue = answers[currentQuestion?.id];
  const hasAnswer =
    currentValue !== undefined && currentValue !== null && currentValue !== "";

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4">
        <ProgressBar current={currentIndex} total={questions.length} />
        <p className="text-xs text-gray-400 text-right mt-1">
          {currentIndex + 1} / {questions.length}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center pb-32">
        <div className="w-full animate-fade-in" key={currentQuestion.id}>
          <QuestionCard
            question={currentQuestion}
            value={currentValue ?? null}
            onChange={handleAnswer}
          />
        </div>
      </div>

      <div className="fixed bottom-32 left-0 right-0 flex justify-center gap-4 px-4">
        <button
          onClick={handleSkip}
          className="px-6 py-2 text-gray-400 hover:text-gray-600 text-sm"
        >
          Skip
        </button>
        <button
          onClick={handleNext}
          disabled={!hasAnswer || submitting}
          className="px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold disabled:opacity-40 hover:bg-purple-700 transition-colors"
        >
          {currentIndex === questions.length - 1 ? "Submit" : "Next →"}
        </button>
      </div>

      <BlobMascot state={blobState} quip={quip} meme={meme} />
    </div>
  );
}
