const listeners = new Map<string, Set<ReadableStreamDefaultController>>();

export function addListener(surveyId: string, ctrl: ReadableStreamDefaultController) {
  if (!listeners.has(surveyId)) listeners.set(surveyId, new Set());
  listeners.get(surveyId)!.add(ctrl);
}

export function removeListener(surveyId: string, ctrl: ReadableStreamDefaultController) {
  listeners.get(surveyId)?.delete(ctrl);
}

export function broadcast(surveyId: string, data: unknown) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  const encoder = new TextEncoder();
  for (const ctrl of listeners.get(surveyId) ?? []) {
    try {
      ctrl.enqueue(encoder.encode(payload));
    } catch {
      // client disconnected
    }
  }
}
