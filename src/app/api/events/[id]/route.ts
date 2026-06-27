import { NextRequest } from "next/server";
import { computeAggregates } from "@/lib/aggregates";
import { addListener, removeListener } from "@/lib/sse";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(ctrl) {
      const initial = await computeAggregates(id);
      ctrl.enqueue(encoder.encode(`data: ${JSON.stringify(initial)}\n\n`));
      addListener(id, ctrl);
    },
    cancel(ctrl) {
      removeListener(id, ctrl as unknown as ReadableStreamDefaultController);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
