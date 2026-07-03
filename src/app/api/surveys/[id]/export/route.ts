import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const survey = await db.survey.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
      responses: { orderBy: { submittedAt: "asc" } },
    },
  });

  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const headers = ["Submitted At", ...survey.questions.map((q) => q.prompt)];

  const rows = survey.responses.map((r) => {
    const answers = JSON.parse(r.answers) as Record<string, unknown>;
    return [
      new Date(r.submittedAt).toISOString(),
      ...survey.questions.map((q) => {
        const val = answers[q.id];
        return val !== undefined ? String(val) : "";
      }),
    ];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${survey.name.replace(/[^a-z0-9]/gi, "_")}_responses.csv"`,
    },
  });
}
