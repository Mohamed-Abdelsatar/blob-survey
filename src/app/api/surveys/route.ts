import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const surveys = await db.survey.findMany({
    include: {
      questions: { orderBy: { order: "asc" } },
      _count: { select: { responses: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(surveys);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, eventDate, questions } = body as {
    name: string;
    eventDate?: string;
    questions: { type: string; prompt: string; options?: string[]; order: number }[];
  };

  const survey = await db.survey.create({
    data: {
      name,
      eventDate: eventDate ? new Date(eventDate) : null,
      questions: {
        create: questions.map((q) => ({
          type: q.type,
          prompt: q.prompt,
          options: q.options ? JSON.stringify(q.options) : null,
          order: q.order,
        })),
      },
    },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(survey, { status: 201 });
}
