"use client";

import { useState } from "react";
import { QRModal } from "./QRModal";

interface Survey {
  id: string;
  name: string;
  eventDate: string | null;
  createdAt: string;
  _count: { responses: number };
}

interface SurveyListProps {
  surveys: Survey[];
  onDeleted: () => void;
}

export function SurveyList({ surveys, onDeleted }: SurveyListProps) {
  const [qrSurvey, setQrSurvey] = useState<Survey | null>(null);

  function copyLink(path: string) {
    navigator.clipboard.writeText(`${window.location.origin}${path}`);
    alert("Link copied!");
  }

  async function deleteSurvey(id: string, name: string) {
    if (!confirm(`Delete "${name}" and all its responses? This cannot be undone.`)) return;
    await fetch(`/api/surveys/${id}`, { method: "DELETE" });
    onDeleted();
  }

  function exportCSV(id: string) {
    window.open(`/api/surveys/${id}/export`, "_blank");
  }

  return (
    <>
      {qrSurvey && (
        <QRModal
          surveyId={qrSurvey.id}
          surveyName={qrSurvey.name}
          onClose={() => setQrSurvey(null)}
        />
      )}
      <div className="flex flex-col gap-3">
        {surveys.length === 0 && (
          <p className="text-gray-400 italic">No surveys yet. Create one above.</p>
        )}
        {surveys.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border-2 border-gray-100 p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{s.name}</h3>
                <p className="text-sm text-gray-400">{s._count.responses} responses</p>
              </div>
              <button
                onClick={() => deleteSurvey(s.id, s.name)}
                className="px-3 py-1 text-sm bg-red-50 text-red-500 rounded-lg hover:bg-red-100 flex-shrink-0"
              >
                🗑 Delete
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => copyLink(`/survey/${s.id}`)}
                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
              >
                📋 Copy link
              </button>
              <button
                onClick={() => setQrSurvey(s)}
                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
              >
                📱 QR Code
              </button>
              <button
                onClick={() => copyLink(`/results/${s.id}`)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                📺 Copy results link
              </button>
              <a
                href={`/results/${s.id}`}
                target="_blank"
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Open results ↗
              </a>
              <button
                onClick={() => exportCSV(s.id)}
                className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
              >
                📊 Export CSV
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
