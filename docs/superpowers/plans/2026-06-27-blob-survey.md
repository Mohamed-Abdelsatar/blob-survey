# Blob Survey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive event survey site with a blob mascot that reacts emotionally to every answer, a live public results screen, and an admin panel for creating surveys.

**Architecture:** A single Next.js (App Router) application with API routes for the backend, Prisma + SQLite for persistence, and Server-Sent Events for real-time results streaming. The blob mascot is a Lottie animation controlled by React state based on the current answer sentiment.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS v4, Prisma 6, SQLite, lottie-react, Recharts, @dnd-kit/sortable (drag-drop question reorder)

## Global Constraints

- Node.js ≥ 20
- All pages must be mobile-first and readable on a projector (large text, high contrast)
- No auth library — admin protected by a single `ADMIN_PASSWORD` env var checked server-side
- SQLite file at `prisma/dev.db`; env var `DATABASE_URL=file:./prisma/dev.db`
- No deletion of surveys in v1 (intentional)
- Results screen must be dark mode by default
- Lottie blob asset at `public/blob.json` (downloaded manually from LottieFiles — see Task 6)

---

## File Map

```
/prisma
  schema.prisma
  seed.ts

/src/app
  layout.tsx
  page.tsx                         → redirect to /admin
  /survey/[id]/page.tsx            → attendee survey flow
  /results/[id]/page.tsx           → live public results screen
  /admin/page.tsx                  → admin panel (survey list + builder)
  /admin/login/page.tsx            → password entry
  /api/surveys/route.ts            → GET list, POST create
  /api/surveys/[id]/route.ts       → GET single survey + questions
  /api/responses/route.ts          → POST submit response
  /api/events/[id]/route.ts        → GET SSE stream

/src/components/survey
  SurveyFlow.tsx                   → orchestrates question sequence + mascot
  QuestionCard.tsx                 → renders one question (delegates to type)
  StarRating.tsx                   → 1–5 star input
  PollQuestion.tsx                 → multiple-choice buttons
  TextQuestion.tsx                 → open textarea
  BlobMascot.tsx                   → Lottie animation + speech bubble
  ProgressBar.tsx                  → top progress indicator
  CompletionScreen.tsx             → confetti + thank you

/src/components/results
  ResultsScreen.tsx                → root component, SSE consumer
  StarChart.tsx                    → average + distribution bar
  PollChart.tsx                    → animated bar chart (Recharts)
  WordCloud.tsx                    → top-words display
  ResponseCount.tsx                → live counter header

/src/components/admin
  SurveyList.tsx                   → table of existing surveys
  SurveyBuilder.tsx                → create new survey form
  QuestionEditor.tsx               → add/edit/reorder questions

/src/lib
  db.ts                            → Prisma client singleton
  aggregates.ts                    → compute result summaries from raw answers
  quips.ts                         → speech bubble text keyed by sentiment
  sse.ts                           → SSE response helpers
  auth.ts                          → admin password check
```

---

## Task 1: Project Setup

**Files:**
- Create: `package.json` (via npx)
- Create: `tailwind.config.ts`
- Create: `.env.local`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`

**Interfaces:**
- Produces: Running Next.js dev server at `localhost:3000`

- [ ] **Step 1: Scaffold Next.js app**

```bash
cd /Users/mohamedabdelsatar/Desktop/Idea
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack
```

When prompted for "Would you like to use Turbopack": choose No.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install prisma @prisma/client lottie-react recharts @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install -D @types/node
```

- [ ] **Step 3: Create `.env.local`**

```
DATABASE_URL="file:./prisma/dev.db"
ADMIN_PASSWORD="event2024"
```

- [ ] **Step 4: Update root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Blob Survey",
  description: "Interactive event feedback",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} min-h-screen bg-gray-50`}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Create root redirect**

`src/app/page.tsx`:

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/admin");
}
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```

Expected: Server starts at `http://localhost:3000`, browser shows redirect to `/admin` (404 is fine — page not built yet).

- [ ] **Step 7: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js app with dependencies"
```

---

## Task 2: Database Schema

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/db.ts`

**Interfaces:**
- Produces: `db` (Prisma client singleton) — imported as `import { db } from "@/lib/db"`
- Produces: Types `Survey`, `Question`, `Response` from `@prisma/client`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider sqlite
```

- [ ] **Step 2: Write schema**

Replace `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Survey {
  id        String     @id @default(cuid())
  name      String
  eventDate DateTime?
  createdAt DateTime   @default(now())
  questions Question[]
  responses Response[]
}

model Question {
  id       String  @id @default(cuid())
  surveyId String
  survey   Survey  @relation(fields: [surveyId], references: [id])
  type     String  // "star" | "poll" | "text"
  prompt   String
  options  String? // JSON array string for poll options e.g. '["Option A","Option B"]'
  order    Int
}

model Response {
  id          String   @id @default(cuid())
  surveyId    String
  survey      Survey   @relation(fields: [surveyId], references: [id])
  answers     String   // JSON object: { "<questionId>": <answer> }
  submittedAt DateTime @default(now())
}
```

- [ ] **Step 3: Run migration**

```bash
npx prisma migrate dev --name init
```

Expected: `prisma/dev.db` created, migration applied.

- [ ] **Step 4: Create Prisma client singleton**

`src/lib/db.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- [ ] **Step 5: Verify types generated**

```bash
npx prisma generate
```

Expected: `@prisma/client` types regenerated, no errors.

- [ ] **Step 6: Commit**

```bash
git add prisma/ src/lib/db.ts
git commit -m "feat: add Prisma schema and SQLite database"
```

---

## Task 3: API — Surveys CRUD

**Files:**
- Create: `src/app/api/surveys/route.ts`
- Create: `src/app/api/surveys/[id]/route.ts`

**Interfaces:**
- Consumes: `db` from `@/lib/db`
- Produces:
  - `GET /api/surveys` → `Survey[]` (with `questions` included)
  - `POST /api/surveys` body `{ name: string, eventDate?: string, questions: { type: string, prompt: string, options?: string[], order: number }[] }` → `Survey`
  - `GET /api/surveys/[id]` → `Survey & { questions: Question[] }`

- [ ] **Step 1: Create surveys list + create route**

`src/app/api/surveys/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const surveys = await db.survey.findMany({
    include: { questions: { orderBy: { order: "asc" } }, _count: { select: { responses: true } } },
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
```

- [ ] **Step 2: Create single survey route**

`src/app/api/surveys/[id]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const survey = await db.survey.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(survey);
}
```

- [ ] **Step 3: Test with curl**

```bash
# Create a survey
curl -X POST http://localhost:3000/api/surveys \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Event",
    "questions": [
      {"type":"star","prompt":"How was the keynote?","order":0},
      {"type":"poll","prompt":"Best snack?","options":["Pizza","Tacos","Fruit"],"order":1},
      {"type":"text","prompt":"Any other thoughts?","order":2}
    ]
  }'
```

Expected: `201` response with survey object including `id`.

```bash
# List surveys
curl http://localhost:3000/api/surveys
```

Expected: array containing the created survey.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/surveys/
git commit -m "feat: add surveys CRUD API routes"
```

---

## Task 4: API — Submit Response & SSE Events

**Files:**
- Create: `src/app/api/responses/route.ts`
- Create: `src/app/api/events/[id]/route.ts`
- Create: `src/lib/aggregates.ts`
- Create: `src/lib/sse.ts`

**Interfaces:**
- Consumes: `db` from `@/lib/db`
- Produces:
  - `POST /api/responses` body `{ surveyId: string, answers: Record<string, unknown> }` → `{ ok: true }`
  - `GET /api/events/[id]` → SSE stream emitting `{ responseCount: number, aggregates: Record<string, unknown> }` on each new response
  - `computeAggregates(surveyId: string): Promise<{ responseCount: number, aggregates: Record<string, AggregateResult> }>`

- [ ] **Step 1: Create aggregates helper**

`src/lib/aggregates.ts`:

```ts
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
```

- [ ] **Step 2: Create SSE helper**

`src/lib/sse.ts`:

```ts
// Global map of surveyId → set of SSE controller writers
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
```

- [ ] **Step 3: Create response submission route**

`src/app/api/responses/route.ts`:

```ts
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
```

- [ ] **Step 4: Create SSE events route**

`src/app/api/events/[id]/route.ts`:

```ts
import { NextRequest } from "next/server";
import { computeAggregates } from "@/lib/aggregates";
import { addListener, removeListener } from "@/lib/sse";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(ctrl) {
      // Send current state immediately on connect
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
```

- [ ] **Step 5: Test response submission and SSE**

In one terminal tab, subscribe to events (replace `<surveyId>` with the ID from Task 3):

```bash
curl -N http://localhost:3000/api/events/<surveyId>
```

Expected: immediately receives a JSON payload with `responseCount: 0`.

In another tab, submit a response:

```bash
curl -X POST http://localhost:3000/api/responses \
  -H "Content-Type: application/json" \
  -d '{"surveyId":"<surveyId>","answers":{"<questionId>":4}}'
```

Expected: SSE tab receives updated payload with `responseCount: 1` and aggregates.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/responses/ src/app/api/events/ src/lib/aggregates.ts src/lib/sse.ts
git commit -m "feat: add response submission and SSE live updates"
```

---

## Task 5: Quips & Blob Mascot Component

**Files:**
- Create: `src/lib/quips.ts`
- Create: `src/components/survey/BlobMascot.tsx`
- Download: `public/blob.json` (see step 1)

**Interfaces:**
- Consumes: nothing external
- Produces:
  - `getQuip(sentiment: "excited" | "happy" | "sad" | "submitted" | "skipped" | "idle"): string`
  - `<BlobMascot state="idle" | "excited" | "happy" | "sad" | "celebrating" quip={string | null} />`

- [ ] **Step 1: Download blob Lottie asset**

Go to [lottiefiles.com/featured](https://lottiefiles.com/featured) and search "blob" or "jelly". Download a free animation as `blob.json`. Place it at `public/blob.json`.

**Alternatively**, use this minimal inline blob as a placeholder until a real asset is found. Create `public/blob.json` with a valid Lottie JSON (copy any free blob from LottieFiles search results).

Verify: `public/blob.json` exists and is valid JSON.

- [ ] **Step 2: Create quips library**

`src/lib/quips.ts`:

```ts
const quipsByMood = {
  excited: [
    "YESSS. My faith in humanity: restored.",
    "Okay okay, who paid you to say that? 😂",
    "Top tier. You have exceptional taste.",
    "Five stars. You are five stars.",
  ],
  happy: [
    "Solid. I respect this answer.",
    "Not bad! Not bad at all.",
    "Good vibes detected. Logging them.",
  ],
  sad: [
    "Oof. That bad? I believe you.",
    "Should've stayed home, huh?",
    "Noted. Aggressively noted.",
    "On behalf of everyone: sorry.",
  ],
  submitted: [
    "Words! Actual words! I'm so proud.",
    "Verbose. I like it.",
    "I read every letter. All of them.",
  ],
  skipped: [
    "No judgment. (I'm judging a little.)",
    "Silence speaks volumes. Apparently.",
    "Bold move. Respect.",
  ],
  idle: ["Hey there!", "Ready when you are.", "Let's do this."],
};

export function getQuip(mood: keyof typeof quipsByMood): string {
  const pool = quipsByMood[mood];
  return pool[Math.floor(Math.random() * pool.length)];
}
```

- [ ] **Step 3: Create BlobMascot component**

`src/components/survey/BlobMascot.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

type BlobState = "idle" | "excited" | "happy" | "sad" | "celebrating";

interface BlobMascotProps {
  state: BlobState;
  quip: string | null;
}

const stateStyles: Record<BlobState, string> = {
  idle: "scale-100 hue-rotate-0",
  excited: "scale-110 hue-rotate-30 animate-bounce",
  happy: "scale-105 hue-rotate-15",
  sad: "scale-90 hue-rotate-180 opacity-80",
  celebrating: "scale-125 hue-rotate-60 animate-spin",
};

export function BlobMascot({ state, quip }: BlobMascotProps) {
  const [blobData, setBlobData] = useState<unknown>(null);

  useEffect(() => {
    fetch("/blob.json")
      .then((r) => r.json())
      .then(setBlobData);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-2 z-50">
      {quip && (
        <div className="bg-white border-2 border-gray-800 rounded-2xl rounded-br-none px-4 py-2 max-w-[200px] text-sm font-medium shadow-lg animate-fade-in">
          {quip}
        </div>
      )}
      <div
        className={`w-24 h-24 transition-all duration-500 ${stateStyles[state]}`}
      >
        {blobData ? (
          <Lottie animationData={blobData} loop={state === "idle" || state === "happy"} />
        ) : (
          <div className="w-24 h-24 rounded-full bg-purple-400 animate-pulse" />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Add fade-in animation to Tailwind config**

In `tailwind.config.ts`, add:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
};
export default config;
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/quips.ts src/components/survey/BlobMascot.tsx public/blob.json tailwind.config.ts
git commit -m "feat: add blob mascot component and quips"
```

---

## Task 6: Survey Question Components

**Files:**
- Create: `src/components/survey/StarRating.tsx`
- Create: `src/components/survey/PollQuestion.tsx`
- Create: `src/components/survey/TextQuestion.tsx`
- Create: `src/components/survey/ProgressBar.tsx`
- Create: `src/components/survey/CompletionScreen.tsx`
- Create: `src/components/survey/QuestionCard.tsx`

**Interfaces:**
- Produces:
  - `<StarRating value={number | null} onChange={(n: number) => void} />`
  - `<PollQuestion options={string[]} value={string | null} onChange={(s: string) => void} />`
  - `<TextQuestion value={string} onChange={(s: string) => void} />`
  - `<ProgressBar current={number} total={number} />`
  - `<CompletionScreen surveyName={string} />`
  - `<QuestionCard question={Question} value={unknown} onChange={(v: unknown) => void} />`

- [ ] **Step 1: StarRating**

`src/components/survey/StarRating.tsx`:

```tsx
"use client";

interface StarRatingProps {
  value: number | null;
  onChange: (n: number) => void;
}

export function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="flex gap-3 justify-center py-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className={`text-5xl transition-transform hover:scale-125 ${
            value !== null && star <= value ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: PollQuestion**

`src/components/survey/PollQuestion.tsx`:

```tsx
"use client";

interface PollQuestionProps {
  options: string[];
  value: string | null;
  onChange: (s: string) => void;
}

export function PollQuestion({ options, value, onChange }: PollQuestionProps) {
  return (
    <div className="flex flex-col gap-3 py-4">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`w-full py-3 px-6 rounded-xl border-2 text-left font-medium transition-all ${
            value === opt
              ? "bg-purple-600 border-purple-600 text-white"
              : "bg-white border-gray-200 hover:border-purple-400"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: TextQuestion**

`src/components/survey/TextQuestion.tsx`:

```tsx
"use client";

interface TextQuestionProps {
  value: string;
  onChange: (s: string) => void;
}

export function TextQuestion({ value, onChange }: TextQuestionProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your thoughts here..."
      rows={4}
      className="w-full border-2 border-gray-200 rounded-xl p-4 text-base focus:outline-none focus:border-purple-400 resize-none"
    />
  );
}
```

- [ ] **Step 4: ProgressBar**

`src/components/survey/ProgressBar.tsx`:

```tsx
interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100);
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-purple-500 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
```

- [ ] **Step 5: CompletionScreen**

`src/components/survey/CompletionScreen.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

export function CompletionScreen({ surveyName }: { surveyName: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); }, []);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen gap-6 transition-opacity duration-700 ${show ? "opacity-100" : "opacity-0"}`}>
      <div className="text-7xl animate-bounce">🎉</div>
      <h1 className="text-3xl font-bold text-center">You&apos;re done!</h1>
      <p className="text-gray-500 text-center max-w-sm">
        Thanks for your feedback on <strong>{surveyName}</strong>. The blob is very proud of you.
      </p>
    </div>
  );
}
```

- [ ] **Step 6: QuestionCard**

`src/components/survey/QuestionCard.tsx`:

```tsx
"use client";

import type { Question } from "@prisma/client";
import { StarRating } from "./StarRating";
import { PollQuestion } from "./PollQuestion";
import { TextQuestion } from "./TextQuestion";

interface QuestionCardProps {
  question: Question;
  value: unknown;
  onChange: (v: unknown) => void;
}

export function QuestionCard({ question, value, onChange }: QuestionCardProps) {
  const options: string[] = question.options ? JSON.parse(question.options) : [];

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <h2 className="text-xl font-semibold text-center mb-2">{question.prompt}</h2>

      {question.type === "star" && (
        <StarRating value={value as number | null} onChange={(n) => onChange(n)} />
      )}
      {question.type === "poll" && (
        <PollQuestion options={options} value={value as string | null} onChange={(s) => onChange(s)} />
      )}
      {question.type === "text" && (
        <TextQuestion value={(value as string) ?? ""} onChange={(s) => onChange(s)} />
      )}
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/survey/
git commit -m "feat: add survey question components"
```

---

## Task 7: Survey Flow Page

**Files:**
- Create: `src/components/survey/SurveyFlow.tsx`
- Create: `src/app/survey/[id]/page.tsx`

**Interfaces:**
- Consumes:
  - `GET /api/surveys/[id]` → `{ id, name, questions: Question[] }`
  - `POST /api/responses` with `{ surveyId, answers }`
  - `<BlobMascot state quip />` from Task 5
  - `<QuestionCard question value onChange />` from Task 6
  - `<ProgressBar current total />` from Task 6
  - `<CompletionScreen surveyName />` from Task 6
  - `getQuip(mood)` from `@/lib/quips`

- [ ] **Step 1: Create SurveyFlow client component**

`src/components/survey/SurveyFlow.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { Question, Survey } from "@prisma/client";
import { BlobMascot } from "./BlobMascot";
import { QuestionCard } from "./QuestionCard";
import { ProgressBar } from "./ProgressBar";
import { CompletionScreen } from "./CompletionScreen";
import { getQuip } from "@/lib/quips";

type BlobState = "idle" | "excited" | "happy" | "sad" | "celebrating";

interface SurveyFlowProps {
  survey: Survey & { questions: Question[] };
}

function sentimentFromAnswer(question: Question, value: unknown): BlobState {
  if (value === null || value === undefined || value === "") return "idle";
  if (question.type === "star") {
    const n = Number(value);
    if (n >= 5) return "excited";
    if (n >= 3) return "happy";
    return "sad";
  }
  if (question.type === "text") return "happy";
  return "happy";
}

function quipMoodFromState(state: BlobState) {
  if (state === "excited") return "excited" as const;
  if (state === "happy") return "happy" as const;
  if (state === "sad") return "sad" as const;
  return "idle" as const;
}

export function SurveyFlow({ survey }: SurveyFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [blobState, setBlobState] = useState<BlobState>("idle");
  const [quip, setQuip] = useState<string | null>(getQuip("idle"));
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const questions = survey.questions;
  const currentQuestion = questions[currentIndex];

  function handleAnswer(value: unknown) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    const state = sentimentFromAnswer(currentQuestion, value);
    setBlobState(state);
    setQuip(
      currentQuestion.type === "text" && value
        ? getQuip("submitted")
        : getQuip(quipMoodFromState(state))
    );
  }

  async function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setBlobState("idle");
      setQuip(null);
    } else {
      setSubmitting(true);
      await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyId: survey.id, answers }),
      });
      setBlobState("celebrating");
      setQuip("You legend. That's a wrap! 🎊");
      setDone(true);
      setSubmitting(false);
    }
  }

  function handleSkip() {
    setBlobState("idle");
    setQuip(getQuip("skipped"));
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleNext();
    }
  }

  if (done) return <CompletionScreen surveyName={survey.name} />;

  const currentValue = answers[currentQuestion?.id];
  const hasAnswer = currentValue !== undefined && currentValue !== null && currentValue !== "";

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4">
        <ProgressBar current={currentIndex} total={questions.length} />
        <p className="text-xs text-gray-400 text-right mt-1">
          {currentIndex + 1} / {questions.length}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center pb-32">
        <div className="w-full animate-fade-in" key={currentQuestion.id}>
          <QuestionCard
            question={currentQuestion}
            value={currentValue ?? null}
            onChange={handleAnswer}
          />
        </div>
      </div>

      <div className="fixed bottom-32 left-0 right-0 flex justify-center gap-4 px-4">
        <button
          onClick={handleSkip}
          className="px-6 py-2 text-gray-400 hover:text-gray-600 text-sm"
        >
          Skip
        </button>
        <button
          onClick={handleNext}
          disabled={!hasAnswer || submitting}
          className="px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold disabled:opacity-40 hover:bg-purple-700 transition-colors"
        >
          {currentIndex === questions.length - 1 ? "Submit" : "Next →"}
        </button>
      </div>

      <BlobMascot state={blobState} quip={quip} />
    </div>
  );
}
```

- [ ] **Step 2: Create survey page (server component)**

`src/app/survey/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { SurveyFlow } from "@/components/survey/SurveyFlow";

async function getSurvey(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/surveys/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function SurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const survey = await getSurvey(id);
  if (!survey) notFound();

  return (
    <main>
      <SurveyFlow survey={survey} />
    </main>
  );
}
```

- [ ] **Step 3: Add `NEXT_PUBLIC_BASE_URL` to `.env.local`**

```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

- [ ] **Step 4: Verify survey flow in browser**

1. Get a survey ID from `curl http://localhost:3000/api/surveys` (use the one created in Task 3)
2. Open `http://localhost:3000/survey/<id>`
3. Answer each question, confirm blob changes state, quip appears, progress bar advances
4. On last question click Submit, confirm completion screen with confetti

- [ ] **Step 5: Commit**

```bash
git add src/components/survey/SurveyFlow.tsx src/app/survey/ .env.local
git commit -m "feat: add attendee survey flow page with blob reactions"
```

---

## Task 8: Results Screen

**Files:**
- Create: `src/components/results/ResponseCount.tsx`
- Create: `src/components/results/StarChart.tsx`
- Create: `src/components/results/PollChart.tsx`
- Create: `src/components/results/WordCloud.tsx`
- Create: `src/components/results/ResultsScreen.tsx`
- Create: `src/app/results/[id]/page.tsx`

**Interfaces:**
- Consumes:
  - `GET /api/events/[id]` SSE stream → `{ responseCount, aggregates }`
  - `GET /api/surveys/[id]` → survey with questions
  - `AggregateResult` type from `@/lib/aggregates`

- [ ] **Step 1: ResponseCount**

`src/components/results/ResponseCount.tsx`:

```tsx
interface ResponseCountProps {
  count: number;
  surveyName: string;
}

export function ResponseCount({ count, surveyName }: ResponseCountProps) {
  return (
    <div className="text-center py-6">
      <h1 className="text-2xl font-bold text-white">{surveyName}</h1>
      <p className="text-5xl font-black text-purple-400 mt-2">{count}</p>
      <p className="text-gray-400 text-sm">responses so far</p>
    </div>
  );
}
```

- [ ] **Step 2: StarChart**

`src/components/results/StarChart.tsx`:

```tsx
interface StarChartProps {
  prompt: string;
  average: number;
  distribution: number[];
}

export function StarChart({ prompt, average, distribution }: StarChartProps) {
  const max = Math.max(...distribution, 1);
  return (
    <div className="bg-gray-800 rounded-2xl p-6">
      <p className="text-gray-300 text-sm mb-3">{prompt}</p>
      <p className="text-5xl font-black text-yellow-400">{average.toFixed(1)} ★</p>
      <div className="flex gap-1 mt-4 items-end h-16">
        {distribution.map((count, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-yellow-400 rounded transition-all duration-700"
              style={{ height: `${(count / max) * 56}px` }}
            />
            <span className="text-gray-500 text-xs">{i + 1}★</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: PollChart**

`src/components/results/PollChart.tsx`:

```tsx
interface PollChartProps {
  prompt: string;
  counts: Record<string, number>;
}

export function PollChart({ prompt, counts }: PollChartProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const max = Math.max(...Object.values(counts), 1);

  return (
    <div className="bg-gray-800 rounded-2xl p-6">
      <p className="text-gray-300 text-sm mb-4">{prompt}</p>
      <div className="flex flex-col gap-3">
        {Object.entries(counts).map(([option, count]) => (
          <div key={option}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white">{option}</span>
              <span className="text-gray-400">{count} ({Math.round((count / total) * 100)}%)</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: WordCloud**

`src/components/results/WordCloud.tsx`:

```tsx
interface WordCloudProps {
  prompt: string;
  topWords: string[];
}

const sizes = ["text-4xl", "text-3xl", "text-2xl", "text-xl", "text-lg", "text-base"];
const colors = ["text-purple-400", "text-pink-400", "text-yellow-400", "text-green-400", "text-blue-400"];

export function WordCloud({ prompt, topWords }: WordCloudProps) {
  return (
    <div className="bg-gray-800 rounded-2xl p-6">
      <p className="text-gray-300 text-sm mb-4">{prompt}</p>
      {topWords.length === 0 ? (
        <p className="text-gray-500 italic">No responses yet</p>
      ) : (
        <div className="flex flex-wrap gap-3 justify-center">
          {topWords.map((word, i) => (
            <span
              key={word}
              className={`font-bold ${sizes[Math.min(i, sizes.length - 1)]} ${colors[i % colors.length]}`}
            >
              {word}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: ResultsScreen (SSE consumer)**

`src/components/results/ResultsScreen.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import type { Question, Survey } from "@prisma/client";
import type { AggregateResult } from "@/lib/aggregates";
import { ResponseCount } from "./ResponseCount";
import { StarChart } from "./StarChart";
import { PollChart } from "./PollChart";
import { WordCloud } from "./WordCloud";

interface ResultsPayload {
  responseCount: number;
  aggregates: Record<string, AggregateResult>;
}

interface ResultsScreenProps {
  survey: Survey & { questions: Question[] };
}

export function ResultsScreen({ survey }: ResultsScreenProps) {
  const [data, setData] = useState<ResultsPayload>({ responseCount: 0, aggregates: {} });

  useEffect(() => {
    const es = new EventSource(`/api/events/${survey.id}`);
    es.onmessage = (e) => setData(JSON.parse(e.data));
    return () => es.close();
  }, [survey.id]);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <ResponseCount count={data.responseCount} surveyName={survey.name} />
      <div className="grid gap-4 max-w-3xl mx-auto mt-4">
        {survey.questions.map((q) => {
          const agg = data.aggregates[q.id];
          if (!agg) return (
            <div key={q.id} className="bg-gray-800 rounded-2xl p-6 text-gray-500 italic">
              {q.prompt} — no responses yet
            </div>
          );
          if (agg.type === "star") return <StarChart key={q.id} prompt={q.prompt} average={agg.average} distribution={agg.distribution} />;
          if (agg.type === "poll") return <PollChart key={q.id} prompt={q.prompt} counts={agg.counts} />;
          return <WordCloud key={q.id} prompt={q.prompt} topWords={agg.topWords} />;
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Results page**

`src/app/results/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { ResultsScreen } from "@/components/results/ResultsScreen";

async function getSurvey(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/surveys/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const survey = await getSurvey(id);
  if (!survey) notFound();
  return <ResultsScreen survey={survey} />;
}
```

- [ ] **Step 7: Test live results**

1. Open `http://localhost:3000/results/<surveyId>` — should show dark screen with 0 responses
2. In another tab, open `http://localhost:3000/survey/<surveyId>` and submit a response
3. Without refreshing, confirm the results screen updates live

- [ ] **Step 8: Commit**

```bash
git add src/components/results/ src/app/results/
git commit -m "feat: add live results screen with SSE updates"
```

---

## Task 9: Admin Auth & Auth Helper

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/admin/login/page.tsx`
- Create: `src/middleware.ts`

**Interfaces:**
- Produces: middleware that redirects unauthenticated `/admin*` requests to `/admin/login`
- Produces: login page that sets `admin_token` cookie

- [ ] **Step 1: Auth helper**

`src/lib/auth.ts`:

```ts
import { cookies } from "next/headers";

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get("admin_token")?.value === process.env.ADMIN_PASSWORD;
}
```

- [ ] **Step 2: Login page**

`src/app/admin/login/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { isAuthenticated } from "@/lib/auth";

export default async function LoginPage() {
  const authed = await isAuthenticated();
  if (authed) redirect("/admin");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        className="bg-white rounded-2xl p-8 shadow-lg w-80 flex flex-col gap-4"
        action={async (formData: FormData) => {
          "use server";
          const password = formData.get("password") as string;
          if (password === process.env.ADMIN_PASSWORD) {
            const store = await cookies();
            store.set("admin_token", password, { httpOnly: true, path: "/" });
            redirect("/admin");
          } else {
            redirect("/admin/login?error=1");
          }
        }}
      >
        <h1 className="text-xl font-bold text-center">Admin Access</h1>
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-400"
        />
        <button type="submit" className="bg-purple-600 text-white py-2 rounded-xl font-semibold hover:bg-purple-700">
          Enter
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Middleware**

`src/middleware.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) return NextResponse.next();

  const token = req.cookies.get("admin_token")?.value;
  if (token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
```

- [ ] **Step 4: Test auth**

1. Visit `http://localhost:3000/admin` — should redirect to `/admin/login`
2. Enter wrong password — should stay on login
3. Enter `event2024` (from `.env.local`) — should redirect to `/admin` (404 ok for now)

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/app/admin/login/ src/middleware.ts
git commit -m "feat: add admin password auth with middleware"
```

---

## Task 10: Admin Panel — Survey Builder & List

**Files:**
- Create: `src/components/admin/SurveyList.tsx`
- Create: `src/components/admin/QuestionEditor.tsx`
- Create: `src/components/admin/SurveyBuilder.tsx`
- Create: `src/app/admin/page.tsx`

**Interfaces:**
- Consumes:
  - `GET /api/surveys` → surveys array with `_count.responses`
  - `POST /api/surveys` → create survey
- Produces: fully functional admin panel

- [ ] **Step 1: SurveyList**

`src/components/admin/SurveyList.tsx`:

```tsx
"use client";

interface Survey {
  id: string;
  name: string;
  eventDate: string | null;
  createdAt: string;
  _count: { responses: number };
}

interface SurveyListProps {
  surveys: Survey[];
}

export function SurveyList({ surveys }: SurveyListProps) {
  function copyLink(path: string) {
    navigator.clipboard.writeText(`${window.location.origin}${path}`);
    alert("Link copied!");
  }

  return (
    <div className="flex flex-col gap-3">
      {surveys.length === 0 && <p className="text-gray-400 italic">No surveys yet. Create one below.</p>}
      {surveys.map((s) => (
        <div key={s.id} className="bg-white rounded-xl border-2 border-gray-100 p-4 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{s.name}</h3>
              <p className="text-sm text-gray-400">{s._count.responses} responses</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => copyLink(`/survey/${s.id}`)}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
            >
              📋 Copy survey link
            </button>
            <button
              onClick={() => copyLink(`/results/${s.id}`)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              📺 Copy results link
            </button>
            <a
              href={`/results/${s.id}`}
              target="_blank"
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Open results ↗
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: QuestionEditor**

`src/components/admin/QuestionEditor.tsx`:

```tsx
"use client";

import { useState } from "react";

export interface QuestionDraft {
  type: "star" | "poll" | "text";
  prompt: string;
  options: string[];
  order: number;
}

interface QuestionEditorProps {
  questions: QuestionDraft[];
  onChange: (qs: QuestionDraft[]) => void;
}

const emptyQuestion = (): QuestionDraft => ({ type: "star", prompt: "", options: ["", ""], order: 0 });

export function QuestionEditor({ questions, onChange }: QuestionEditorProps) {
  function update(index: number, patch: Partial<QuestionDraft>) {
    onChange(questions.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }
  function remove(index: number) {
    onChange(questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, order: i })));
  }
  function add() {
    onChange([...questions, { ...emptyQuestion(), order: questions.length }]);
  }
  function addOption(qIdx: number) {
    update(qIdx, { options: [...questions[qIdx].options, ""] });
  }
  function updateOption(qIdx: number, oIdx: number, value: string) {
    const opts = [...questions[qIdx].options];
    opts[oIdx] = value;
    update(qIdx, { options: opts });
  }

  return (
    <div className="flex flex-col gap-4">
      {questions.map((q, i) => (
        <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex gap-2 mb-3">
            {(["star", "poll", "text"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => update(i, { type: t })}
                className={`px-3 py-1 rounded-lg text-sm capitalize ${q.type === t ? "bg-purple-600 text-white" : "bg-white border"}`}
              >
                {t}
              </button>
            ))}
            <button type="button" onClick={() => remove(i)} className="ml-auto text-red-400 text-sm hover:text-red-600">
              Remove
            </button>
          </div>
          <input
            value={q.prompt}
            onChange={(e) => update(i, { prompt: e.target.value })}
            placeholder="Question prompt..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
          />
          {q.type === "poll" && (
            <div className="mt-3 flex flex-col gap-2">
              {q.options.map((opt, oi) => (
                <input
                  key={oi}
                  value={opt}
                  onChange={(e) => updateOption(i, oi, e.target.value)}
                  placeholder={`Option ${oi + 1}`}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                />
              ))}
              <button type="button" onClick={() => addOption(i)} className="text-sm text-purple-600 hover:underline text-left">
                + Add option
              </button>
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="border-2 border-dashed border-gray-300 rounded-xl py-3 text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
      >
        + Add question
      </button>
    </div>
  );
}
```

- [ ] **Step 3: SurveyBuilder**

`src/components/admin/SurveyBuilder.tsx`:

```tsx
"use client";

import { useState } from "react";
import { QuestionEditor, type QuestionDraft } from "./QuestionEditor";

interface SurveyBuilderProps {
  onCreated: () => void;
}

export function SurveyBuilder({ onCreated }: SurveyBuilderProps) {
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || questions.length === 0) return;
    setSaving(true);
    await fetch("/api/surveys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        eventDate: eventDate || undefined,
        questions: questions.map((q, i) => ({
          type: q.type,
          prompt: q.prompt,
          options: q.type === "poll" ? q.options.filter(Boolean) : undefined,
          order: i,
        })),
      }),
    });
    setSaving(false);
    setName("");
    setEventDate("");
    setQuestions([]);
    setOpen(false);
    onCreated();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700"
      >
        + Create New Survey
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-purple-100 p-6 flex flex-col gap-4">
      <h2 className="text-lg font-bold">New Survey</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Survey name (e.g. Tech Conf 2024)"
        required
        className="border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-400"
      />
      <input
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
        type="date"
        className="border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-400"
      />
      <QuestionEditor questions={questions} onChange={setQuestions} />
      <div className="flex gap-3">
        <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2 border-2 border-gray-200 rounded-xl text-gray-600">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !name || questions.length === 0}
          className="flex-1 py-2 bg-purple-600 text-white rounded-xl font-semibold disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save Survey"}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Admin page**

`src/app/admin/page.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { SurveyList } from "@/components/admin/SurveyList";
import { SurveyBuilder } from "@/components/admin/SurveyBuilder";

export default function AdminPage() {
  const [surveys, setSurveys] = useState([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/surveys");
    setSurveys(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blob Survey Admin</h1>
        <form action={async () => {
          "use server";
          // handled via redirect
        }}>
          <a href="/admin/login" className="text-sm text-gray-400 hover:text-gray-600">Log out</a>
        </form>
      </div>
      <SurveyBuilder onCreated={load} />
      <h2 className="font-semibold text-gray-700">Your Surveys</h2>
      <SurveyList surveys={surveys} />
    </main>
  );
}
```

- [ ] **Step 5: Test full admin flow**

1. Log in at `/admin/login`
2. Create a survey with all 3 question types
3. Copy survey link, open it in a new tab, complete the survey
4. Copy results link, open it on another tab, confirm live updates

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/ src/app/admin/
git commit -m "feat: add admin panel with survey builder and list"
```

---

## Task 11: Polish & Deployment Prep

**Files:**
- Modify: `src/app/layout.tsx` (viewport meta)
- Create: `next.config.ts` (if needed)
- Create: `.env.production.local` (prod env template)

- [ ] **Step 1: Ensure mobile viewport**

Confirm `src/app/layout.tsx` has proper metadata (Next.js App Router adds viewport by default, but verify):

```tsx
export const viewport = {
  width: "device-width",
  initialScale: 1,
};
```

Add this export to `src/app/layout.tsx` alongside the existing `metadata` export.

- [ ] **Step 2: Add not-found page**

`src/app/not-found.tsx`:

```tsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-6xl">🫠</p>
      <h1 className="text-2xl font-bold">Survey not found</h1>
      <p className="text-gray-400">Double-check your link.</p>
    </div>
  );
}
```

- [ ] **Step 3: Production build check**

```bash
npm run build
```

Expected: build completes with no type errors. Fix any TypeScript errors before proceeding.

- [ ] **Step 4: Commit**

```bash
git add src/app/not-found.tsx src/app/layout.tsx
git commit -m "feat: polish - mobile viewport, not-found page, production build"
```

- [ ] **Step 5: Deploy to Vercel**

```bash
npm install -g vercel
vercel
```

When prompted:
- Link to existing project: No
- Project name: `blob-survey`
- Root directory: `.`

After deploy, set env vars in Vercel dashboard (or via CLI):

```bash
vercel env add ADMIN_PASSWORD
vercel env add DATABASE_URL
```

**Note on SQLite + Vercel:** Vercel's filesystem is ephemeral. For production, switch `DATABASE_URL` to a Turso (SQLite-compatible) or PlanetScale connection string, or use Vercel Postgres. For a single-event use, deploying with a pre-seeded SQLite file attached via Vercel's volume (or Railway with persistent disk) works fine.

---

## Verification Checklist

- [ ] `/admin/login` — wrong password stays on login; correct password sets cookie and redirects
- [ ] `/admin` — without cookie, redirects to login
- [ ] Create survey with all 3 question types
- [ ] `/survey/<id>` on mobile — one question at a time, blob reacts, quip appears, progress bar advances
- [ ] Complete survey → confetti + blob celebrating
- [ ] `/results/<id>` — dark screen, charts update live without refresh when a new response is submitted
- [ ] Open `/results/<id>` tab, close it, reopen — SSE reconnects and shows current totals
- [ ] Visit `/survey/doesnotexist` — shows not-found page
