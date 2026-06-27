import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeAggregates } from "@/lib/aggregates";
import { broadcast } from "@/lib/sse";

export async function POST(req: NextRequest) {
  const { surveyId, answers } = await req.json() as {
    surveyId: string;
    answers: Record<string, unknown>;
  };

  await db.response.create({
    data: { surveyId, answers: JSON.stringify(answers) },
  });

  const payload = await computeAggregates(surveyId);
  broadcast(surveyId, payload);

  return NextResponse.json({ ok: true });
}
