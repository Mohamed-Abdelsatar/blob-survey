"use client";

import { useEffect, useState } from "react";
import type { AggregateResult } from "@/lib/aggregates";
import { ResponseCount } from "./ResponseCount";
import { StarChart } from "./StarChart";
import { PollChart } from "./PollChart";
import { WordCloud } from "./WordCloud";

interface Question {
  id: string;
  type: string;
  prompt: string;
}

interface Survey {
  id: string;
  name: string;
  questions: Question[];
}

interface ResultsPayload {
  responseCount: number;
  aggregates: Record<string, AggregateResult>;
}

interface ResultsScreenProps {
  survey: Survey;
}

export function ResultsScreen({ survey }: ResultsScreenProps) {
  const [data, setData] = useState<ResultsPayload>({
    responseCount: 0,
    aggregates: {},
  });

  useEffect(() => {
    const es = new EventSource(`/api/events/${survey.id}`);
    es.onmessage = (e) => setData(JSON.parse(e.data));
    return () => es.close();
  }, [survey.id]);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <ResponseCount count={data.responseCount} surveyName={survey.name} />
      <div className="grid gap-4 max-w-3xl mx-auto mt-4">
        {survey.questions.map((q) => {
          const agg = data.aggregates[q.id];
          if (!agg) {
            return (
              <div
                key={q.id}
                className="bg-gray-800 rounded-2xl p-6 text-gray-500 italic"
              >
                {q.prompt} — no responses yet
              </div>
            );
          }
          if (agg.type === "star") {
            return (
              <StarChart
                key={q.id}
                prompt={q.prompt}
                average={agg.average}
                distribution={agg.distribution}
              />
            );
          }
          if (agg.type === "poll") {
            return (
              <PollChart key={q.id} prompt={q.prompt} counts={agg.counts} />
            );
          }
          return <WordCloud key={q.id} prompt={q.prompt} topWords={agg.topWords} />;
        })}
      </div>
    </div>
  );
}
