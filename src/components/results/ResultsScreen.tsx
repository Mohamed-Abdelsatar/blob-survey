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
  const [data, setData] = useState<ResultsPayload>({ responseCount: 0, aggregates: {} });
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const es = new EventSource(`/api/events/${survey.id}`);
    es.onmessage = (e) => {
      setData(JSON.parse(e.data));
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    };
    return () => es.close();
  }, [survey.id]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Live Results</p>
          <h1 className="text-xl font-bold">{survey.name}</h1>
        </div>
        <div className={`flex items-center gap-2 transition-all ${pulse ? "scale-110" : "scale-100"}`}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-2xl font-extrabold text-green-400">{data.responseCount}</span>
          <span className="text-gray-400 text-sm">responses</span>
        </div>
      </div>

      <ResponseCount count={data.responseCount} surveyName={survey.name} />

      <div className="grid gap-6 max-w-4xl mx-auto px-4 pb-12 mt-2">
        {survey.questions.map((q) => {
          const agg = data.aggregates[q.id];
          if (!agg) {
            return (
              <div key={q.id} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <p className="text-gray-500 text-sm mb-1">{q.type === "star" ? "⭐" : q.type === "poll" ? "🗳️" : "💬"} {q.prompt}</p>
                <p className="text-gray-600 italic text-sm">Waiting for first response...</p>
              </div>
            );
          }
          if (agg.type === "star") {
            return <StarChart key={q.id} prompt={q.prompt} average={agg.average} distribution={agg.distribution} />;
          }
          if (agg.type === "poll") {
            return <PollChart key={q.id} prompt={q.prompt} counts={agg.counts} />;
          }
          return <WordCloud key={q.id} prompt={q.prompt} topWords={agg.topWords} />;
        })}
      </div>
    </div>
  );
}
