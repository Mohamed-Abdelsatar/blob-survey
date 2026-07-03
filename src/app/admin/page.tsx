"use client";

import { useCallback, useEffect, useState } from "react";
import { SurveyList } from "@/components/admin/SurveyList";
import { SurveyBuilder } from "@/components/admin/SurveyBuilder";

interface Survey {
  id: string;
  name: string;
  eventDate: string | null;
  createdAt: string;
  _count: { responses: number };
}

export default function AdminPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/surveys");
    setSurveys(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🫧 Blob Survey</h1>
        <form action="/api/logout" method="POST">
          <button type="submit" className="text-sm text-gray-400 hover:text-gray-600">
            Log out
          </button>
        </form>
      </div>
      <SurveyBuilder onCreated={load} />
      <h2 className="font-semibold text-gray-700">Your Surveys</h2>
      <SurveyList surveys={surveys} onDeleted={load} />
    </main>
  );
}
