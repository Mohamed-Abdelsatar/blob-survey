"use client";

export interface QuestionDraft {
  type: "star" | "poll" | "text";
  prompt: string;
  options: string[];
  order: number;
}

interface QuestionEditorProps {
  questions: QuestionDraft[];
  onChange: (qs: QuestionDraft[]) => void;
}

export function QuestionEditor({ questions, onChange }: QuestionEditorProps) {
  function update(index: number, patch: Partial<QuestionDraft>) {
    onChange(questions.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  function remove(index: number) {
    onChange(
      questions
        .filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, order: i }))
    );
  }

  function add() {
    onChange([
      ...questions,
      { type: "star", prompt: "", options: ["", ""], order: questions.length },
    ]);
  }

  function addOption(qIdx: number) {
    update(qIdx, { options: [...questions[qIdx].options, ""] });
  }

  function updateOption(qIdx: number, oIdx: number, value: string) {
    const opts = [...questions[qIdx].options];
    opts[oIdx] = value;
    update(qIdx, { options: opts });
  }

  return (
    <div className="flex flex-col gap-4">
      {questions.map((q, i) => (
        <div
          key={i}
          className="bg-gray-50 rounded-xl p-4 border border-gray-200"
        >
          <div className="flex gap-2 mb-3">
            {(["star", "poll", "text"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => update(i, { type: t })}
                className={`px-3 py-1 rounded-lg text-sm capitalize ${
                  q.type === t
                    ? "bg-purple-600 text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                {t}
              </button>
            ))}
            <button
              type="button"
              onClick={() => remove(i)}
              className="ml-auto text-red-400 text-sm hover:text-red-600"
            >
              Remove
            </button>
          </div>
          <input
            value={q.prompt}
            onChange={(e) => update(i, { prompt: e.target.value })}
            placeholder="Question prompt..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
          />
          {q.type === "poll" && (
            <div className="mt-3 flex flex-col gap-2">
              {q.options.map((opt, oi) => (
                <input
                  key={oi}
                  value={opt}
                  onChange={(e) => updateOption(i, oi, e.target.value)}
                  placeholder={`Option ${oi + 1}`}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                />
              ))}
              <button
                type="button"
                onClick={() => addOption(i)}
                className="text-sm text-purple-600 hover:underline text-left"
              >
                + Add option
              </button>
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="border-2 border-dashed border-gray-300 rounded-xl py-3 text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
      >
        + Add question
      </button>
    </div>
  );
}
