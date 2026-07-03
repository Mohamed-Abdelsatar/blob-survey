import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOwner } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const survey = await db.survey.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(survey);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owner = await getCurrentOwner();
  const survey = await db.survey.findUnique({ where: { id } });
  if (!survey || survey.owner !== owner) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  await db.survey.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
