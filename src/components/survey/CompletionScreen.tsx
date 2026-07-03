"use client";

import { useEffect, useState } from "react";

const floatingEmojis = ["🎉", "🥳", "✨", "🎊", "💜", "🔥", "👑", "🫶"];

const cards = [
  { emoji: "🔥", title: "LEGENDARY response", color: "from-orange-400 to-red-500" },
  { emoji: "👑", title: "Absolute legend", color: "from-yellow-400 to-orange-400" },
  { emoji: "💜", title: "10/10 human being", color: "from-purple-400 to-pink-500" },
  { emoji: "🚀", title: "Feedback MVP", color: "from-blue-400 to-purple-500" },
];

export function CompletionScreen({ surveyName }: { surveyName: string }) {
  const [show, setShow] = useState(false);
  const [card] = useState(() => cards[Math.floor(Math.random() * cards.length)]);
  const [copied, setCopied] = useState(false);

  useEffect(() => { setShow(true); }, []);

  function share() {
    const text = `Just filled out "${surveyName}" and got the ${card.emoji} ${card.title} card! Try it yourself 👇`;
    if (navigator.share) {
      navigator.share({ text, url: window.location.origin });
    } else {
      navigator.clipboard.writeText(text + " " + window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen gap-6 px-4 transition-opacity duration-700 relative overflow-hidden ${show ? "opacity-100" : "opacity-0"}`}>
      {floatingEmojis.map((e, i) => (
        <span
          key={i}
          className="absolute text-4xl animate-bounce select-none pointer-events-none opacity-20"
          style={{ left: `${(i * 13 + 5) % 90}%`, top: `${(i * 17 + 10) % 80}%`, animationDelay: `${i * 0.15}s` }}
        >
          {e}
        </span>
      ))}

      {/* Shareable card */}
      <div className={`bg-gradient-to-br ${card.color} rounded-3xl p-8 text-white text-center shadow-2xl w-full max-w-sm flex flex-col items-center gap-3`}>
        <span className="text-7xl">{card.emoji}</span>
        <h2 className="text-2xl font-extrabold">{card.title}</h2>
        <p className="text-white/80 text-sm">for filling out</p>
        <p className="font-bold text-lg">"{surveyName}"</p>
      </div>

      <p className="text-gray-500 text-center text-sm max-w-xs">
        Screenshot this card and flex on your friends 😤
      </p>

      <button
        onClick={share}
        className="px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
      >
        {copied ? "✅ Copied!" : "📤 Share this"}
      </button>

      <p className="text-gray-400 text-xs">The blob is extremely proud of you 🫧</p>
    </div>
  );
}
