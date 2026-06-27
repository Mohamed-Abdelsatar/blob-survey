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

export type QuipMood = keyof typeof quipsByMood;

export function getQuip(mood: QuipMood): string {
  const pool = quipsByMood[mood];
  return pool[Math.floor(Math.random() * pool.length)];
}
