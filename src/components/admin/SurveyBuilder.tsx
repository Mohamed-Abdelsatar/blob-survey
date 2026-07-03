"use client";

import { useState } from "react";
import { QuestionEditor, type QuestionDraft } from "./QuestionEditor";

interface SurveyBuilderProps {
  onCreated: () => void;
}

const TEMPLATES: { emoji: string; name: string; questions: QuestionDraft[] }[] = [
  {
    emoji: "🎤",
    name: "Workshop / Talk Feedback",
    questions: [
      { type: "star", prompt: "How would you rate this session?", options: [] },
      { type: "poll", prompt: "What was the best part?", options: ["Content", "Speaker energy", "Examples", "Q&A"] },
      { type: "text", prompt: "What would you change or improve?", options: [] },
    ],
  },
  {
    emoji: "🎉",
    name: "Event Vibe Check",
    questions: [
      { type: "star", prompt: "How was the overall vibe?", options: [] },
      { type: "poll", prompt: "Best part of the event?", options: ["People", "Food", "Activities", "Location"] },
      { type: "star", prompt: "Would you come back next time?", options: [] },
      { type: "text", prompt: "Any shoutouts or roasts?", options: [] },
    ],
  },
  {
    emoji: "💼",
    name: "Team Retro",
    questions: [
      { type: "star", prompt: "How did this sprint feel overall?", options: [] },
      { type: "poll", prompt: "Biggest blocker this sprint?", options: ["Unclear requirements", "Too many meetings", "Tech debt", "Other"] },
      { type: "text", prompt: "What should we stop doing immediately?", options: [] },
      { type: "text", prompt: "What should we keep doing?", options: [] },
    ],
  },
];

export function SurveyBuilder({ onCreated }: SurveyBuilderProps) {
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  function applyTemplate(t: typeof TEMPLATES[number]) {
    setName(t.name);
    setQuestions(t.questions.map((q) => ({ ...q, options: [...q.options] })));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || questions.length === 0) return;
    setSaving(true);
    await fetch("/api/surveys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        eventDate: eventDate || undefined,
        questions: questions.map((q, i) => ({
          type: q.type,
          prompt: q.prompt,
          options: q.type === "poll" ? q.options.filter(Boolean) : undefined,
          order: i,
        })),
      }),
    });
    setSaving(false);
    setName("");
    setEventDate("");
    setQuestions([]);
    setOpen(false);
    onCreated();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700"
      >
        + Create New Survey
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-purple-100 p-6 flex flex-col gap-4">
      <h2 className="text-lg font-bold">New Survey</h2>

      {/* Templates */}
      <div>
        <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Start from a template</p>
        <div className="flex flex-col gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => applyTemplate(t)}
              className="text-left px-4 py-3 rounded-xl border-2 border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-colors flex items-center gap-3"
            >
              <span className="text-2xl">{t.emoji}</span>
              <div>
                <p className="font-medium text-sm">{t.name}</p>
                <p className="text-xs text-gray-400">{t.questions.length} questions</p>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 mb-1 font-medium uppercase tracking-wide">Or build from scratch</p>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Survey name (e.g. Tech Conf 2024)"
        required
        className="border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-400"
      />
      <input
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
        type="date"
        className="border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-400"
      />
      <QuestionEditor questions={questions} onChange={setQuestions} />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 py-2 border-2 border-gray-200 rounded-xl text-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !name || questions.length === 0}
          className="flex-1 py-2 bg-purple-600 text-white rounded-xl font-semibold disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save Survey"}
        </button>
      </div>
    </form>
  );
}
