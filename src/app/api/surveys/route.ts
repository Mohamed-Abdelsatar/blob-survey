import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOwner } from "@/lib/auth";

export async function GET() {
  const owner = await getCurrentOwner();
  const surveys = await db.survey.findMany({
    where: { owner },
    include: {
      questions: { orderBy: { order: "asc" } },
      _count: { select: { responses: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(surveys);
}

export async function POST(req: NextRequest) {
  const owner = await getCurrentOwner();
  const body = await req.json();
  const { name, eventDate, questions } = body as {
    name: string;
    eventDate?: string;
    questions: { type: string; prompt: string; options?: string[]; order: number }[];
  };

  const survey = await db.survey.create({
    data: {
      name,
      owner,
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
