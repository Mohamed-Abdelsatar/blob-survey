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

// Meme images mapped to mood — shown alongside speech bubble
export const memesByMood: Record<QuipMood, { url: string; alt: string }[]> = {
  excited: [
    { url: "https://i.imgflip.com/23ls.jpg", alt: "Disaster Girl smiling" },
    { url: "https://i.imgflip.com/30b1gx.jpg", alt: "Drake approves" },
  ],
  happy: [
    { url: "https://i.imgflip.com/1g8my4.jpg", alt: "Two Buttons" },
    { url: "https://i.imgflip.com/26jxvz.jpg", alt: "Gru's Plan" },
  ],
  sad: [
    { url: "https://i.imgflip.com/2fm6x.jpg", alt: "Waiting Skeleton" },
    { url: "https://i.imgflip.com/1c1uej.jpg", alt: "Sad Pablo Escobar" },
  ],
  submitted: [
    { url: "https://i.imgflip.com/345v97.jpg", alt: "Woman Yelling At Cat" },
    { url: "https://i.imgflip.com/24y43o.jpg", alt: "Change My Mind" },
  ],
  skipped: [
    { url: "https://i.imgflip.com/1otk96.jpg", alt: "Mocking Spongebob" },
    { url: "https://i.imgflip.com/9ehk.jpg", alt: "Batman Slapping Robin" },
  ],
  idle: [
    { url: "https://i.imgflip.com/26am.jpg", alt: "Ancient Aliens" },
    { url: "https://i.imgflip.com/261o3j.jpg", alt: "Running Away Balloon" },
  ],
};

export function getQuip(mood: QuipMood): string {
  const pool = quipsByMood[mood];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getMeme(mood: QuipMood): { url: string; alt: string } {
  const pool = memesByMood[mood];
  return pool[Math.floor(Math.random() * pool.length)];
}
