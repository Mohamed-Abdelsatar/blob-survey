"use client";

interface Survey {
  id: string;
  name: string;
  eventDate: string | null;
  createdAt: string;
  _count: { responses: number };
}

interface SurveyListProps {
  surveys: Survey[];
}

export function SurveyList({ surveys }: SurveyListProps) {
  function copyLink(path: string) {
    navigator.clipboard.writeText(`${window.location.origin}${path}`);
    alert("Link copied!");
  }

  return (
    <div className="flex flex-col gap-3">
      {surveys.length === 0 && (
        <p className="text-gray-400 italic">No surveys yet. Create one below.</p>
      )}
      {surveys.map((s) => (
        <div
          key={s.id}
          className="bg-white rounded-xl border-2 border-gray-100 p-4 flex flex-col gap-2"
        >
          <div>
            <h3 className="font-semibold">{s.name}</h3>
            <p className="text-sm text-gray-400">{s._count.responses} responses</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => copyLink(`/survey/${s.id}`)}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
            >
              📋 Copy survey link
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
          </div>
        </div>
      ))}
    </div>
  );
}
