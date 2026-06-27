"use client";

import { useState } from "react";
import { QuestionEditor, type QuestionDraft } from "./QuestionEditor";

interface SurveyBuilderProps {
  onCreated: () => void;
}

export function SurveyBuilder({ onCreated }: SurveyBuilderProps) {
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

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
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border-2 border-purple-100 p-6 flex flex-col gap-4"
    >
      <h2 className="text-lg font-bold">New Survey</h2>
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
