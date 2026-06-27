import { db } from "@/lib/db";

export type AggregateResult =
  | { type: "star"; average: number; distribution: number[] }
  | { type: "poll"; counts: Record<string, number> }
  | { type: "text"; topWords: string[] };

export async function computeAggregates(surveyId: string) {
  const survey = await db.survey.findUnique({
    where: { id: surveyId },
    include: { questions: true, responses: true },
  });
  if (!survey) return { responseCount: 0, aggregates: {} };

  const responseCount = survey.responses.length;
  const aggregates: Record<string, AggregateResult> = {};

  for (const q of survey.questions) {
    const answers = survey.responses
      .map((r) => {
        const parsed = JSON.parse(r.answers) as Record<string, unknown>;
        return parsed[q.id];
      })
      .filter(Boolean);

    if (q.type === "star") {
      const nums = answers.map(Number).filter((n) => !isNaN(n));
      const distribution = [1, 2, 3, 4, 5].map(
        (star) => nums.filter((n) => n === star).length
      );
      const average = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
      aggregates[q.id] = { type: "star", average, distribution };
    } else if (q.type === "poll") {
      const options: string[] = q.options ? JSON.parse(q.options) : [];
      const counts: Record<string, number> = Object.fromEntries(options.map((o) => [o, 0]));
      for (const a of answers) {
        if (typeof a === "string" && counts[a] !== undefined) counts[a]++;
      }
      aggregates[q.id] = { type: "poll", counts };
    } else {
      const words = answers
        .flatMap((a) => (typeof a === "string" ? a.toLowerCase().split(/\W+/) : []))
        .filter((w) => w.length > 3);
      const freq: Record<string, number> = {};
      for (const w of words) freq[w] = (freq[w] ?? 0) + 1;
      const topWords = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([w]) => w);
      aggregates[q.id] = { type: "text", topWords };
    }
  }

  return { responseCount, aggregates };
}
