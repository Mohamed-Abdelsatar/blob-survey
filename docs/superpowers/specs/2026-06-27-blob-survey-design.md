# Blob Survey — Design Spec

**Date:** 2026-06-27  
**Status:** Approved

---

## Context

Event organizers need a way to collect attendee feedback (session ratings, live polls, open text) that people actually want to fill out. Standard survey tools (Google Forms, Typeform) are functional but dry — attendance is low and responses drop off mid-survey. The goal is a survey experience that is funny, interactive, and memorable enough that attendees complete it in full. The key differentiator is a blob mascot character (Lottie animation) that reacts emotionally to every answer and cracks jokes, turning feedback into a mini entertainment moment.

---

## Who Uses It

- **Attendees** — fill out surveys on their phone during or after sessions
- **Organizers** — create surveys, share QR codes, watch results live on a projector

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js (App Router) | Single repo: frontend + API routes + SSE |
| Database | SQLite via Prisma | Zero infra, easy to move to Postgres later |
| Animations | Lottie (lottie-react) | Pre-made blob from LottieFiles, tiny JSON |
| Styling | Tailwind CSS | Fast, consistent |
| Charts | Recharts | Simple bar/star charts for results screen |
| Deployment | Vercel (frontend + API) + local SQLite | Free tier, one command deploy |

---

## Pages & Routes

```
/survey/[id]     Attendee survey flow
/results/[id]    Public live results screen (projector)
/admin           Password-protected survey builder
/api/surveys     CRUD — create/read surveys
/api/responses   POST — submit a response
/api/events/[id] GET — SSE stream for live results
```

---

## Attendee Survey Flow (`/survey/[id]`)

- One question displayed at a time; smooth slide-in/out transition between questions
- Question types:
  - **Star rating** (1–5 clickable stars)
  - **Quick poll** (2–6 multiple-choice buttons)
  - **Text input** (open textarea, optional)
- After each answer, the blob reacts before advancing to the next question
- Progress bar at the top shows how many questions remain
- Final screen: confetti + blob celebrating + "Thanks, you're amazing 🎉"

### Blob Mascot States

| State | Trigger | Lottie / CSS behavior |
|---|---|---|
| Idle | Page load / between questions | Gentle breathing pulse |
| Excited | 5 stars or top poll choice | Fast wiggle, warm color burst |
| Happy | 3–4 stars / neutral-positive | Soft bounce |
| Sad | 1–2 stars / negative | Droops, color shifts to blue |
| Celebrating | Survey complete | Full-screen confetti |

### Speech Bubbles

A comic-style speech bubble appears for ~2 seconds after each answer with a randomly selected quip from a pool keyed by answer sentiment. Examples:
- 1 star → *"Oof. That bad? I believe you."* / *"Should've stayed home, huh?"*
- 5 stars → *"YESSS. My faith in humanity: restored."* / *"Okay okay, who paid you to say that?"*
- Text submitted → *"Words! Actual words! I'm so proud."*
- Skipped → *"No judgment. (I'm judging a little.)"*

---

## Live Results Screen (`/results/[id]`)

Designed for a projector. Receives updates via SSE — no page refresh needed.

- **Star rating questions** → average star score displayed large + sparkline of distribution
- **Poll questions** → animated bar chart updating in real time
- **Text responses** → word cloud (most frequent words rendered large)
- Header shows survey name, response count ("47 responses so far")
- Dark mode by default (easier to read on projector)

---

## Admin Panel (`/admin`)

Protected by a single password in `ADMIN_PASSWORD` env var. No user accounts.

### Survey Builder

1. Enter survey name + optional event date
2. Add questions one at a time (choose type → fill in prompt + options)
3. Reorder questions via drag-and-drop
4. Save → generates survey ID
5. Copy attendee link (`/survey/[id]`) → show as QR code
6. Copy results screen link (`/results/[id]`)

### Survey List

- List of all created surveys
- Click any survey to see response count and a basic results summary
- No deletion in v1 (intentional — avoids accidental data loss)

---

## Data Model (Prisma)

```prisma
model Survey {
  id        String     @id @default(cuid())
  name      String
  eventDate DateTime?
  createdAt DateTime   @default(now())
  questions Question[]
  responses Response[]
}

model Question {
  id       String   @id @default(cuid())
  surveyId String
  survey   Survey   @relation(fields: [surveyId], references: [id])
  type     String   // "star" | "poll" | "text"
  prompt   String
  options  String?  // JSON array for poll options
  order    Int
}

model Response {
  id         String   @id @default(cuid())
  surveyId   String
  survey     Survey   @relation(fields: [surveyId], references: [id])
  answers    String   // JSON: { questionId: answer }
  submittedAt DateTime @default(now())
}
```

---

## SSE Live Updates

`GET /api/events/[id]` holds an open connection. On each new `Response` insert, the server pushes a summary payload:

```json
{
  "responseCount": 47,
  "aggregates": {
    "<questionId>": { "average": 4.2 } // for star
    "<questionId>": { "A": 12, "B": 30 } // for poll
    "<questionId>": ["word", "word", ...] // for text (top words)
  }
}
```

The results screen re-renders charts from this payload with a CSS transition.

---

## Blob Asset

Source: LottieFiles free library. Search term: "blob", "slime", or "jelly character." Pick one with at least idle + happy + sad states (or use a single blob and control color/scale via JS). Asset stored at `public/blob.json`.

---

## Environment Variables

```
ADMIN_PASSWORD=<secret>
DATABASE_URL=file:./dev.db
```

---

## Verification / Testing Plan

1. **Survey flow** — open `/survey/[id]` on mobile, answer all question types, confirm blob reacts, confirm confetti on completion
2. **Live results** — open `/results/[id]` on one tab, submit responses in another tab, confirm charts update without refresh
3. **Admin** — create a survey, add all 3 question types, copy links, verify QR code resolves
4. **SSE reconnect** — close and reopen the results tab, verify it reconnects and shows current totals
5. **Empty states** — visit results before any responses, confirm graceful empty UI
