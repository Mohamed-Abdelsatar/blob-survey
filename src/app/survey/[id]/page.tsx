import { notFound } from "next/navigation";
import { SurveyFlow } from "@/components/survey/SurveyFlow";

async function getSurvey(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/surveys/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const survey = await getSurvey(id);
  if (!survey) notFound();

  return (
    <main>
      <SurveyFlow survey={survey} />
    </main>
  );
}
