import { notFound } from "next/navigation";
import { ResultsScreen } from "@/components/results/ResultsScreen";

async function getSurvey(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/surveys/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const survey = await getSurvey(id);
  if (!survey) notFound();
  return <ResultsScreen survey={survey} />;
}
