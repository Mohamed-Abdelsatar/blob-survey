"use client";

import { useEffect, useState } from "react";

const floatingEmojis = ["🎉", "🥳", "✨", "🎊", "💜", "🔥", "👑", "🫶"];

export function CompletionScreen({ surveyName }: { surveyName: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); }, []);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen gap-6 transition-opacity duration-700 relative overflow-hidden ${show ? "opacity-100" : "opacity-0"}`}>
      {/* floating background emojis */}
      {floatingEmojis.map((e, i) => (
        <span
          key={i}
          className="absolute text-4xl animate-bounce select-none pointer-events-none opacity-30"
          style={{
            left: `${(i * 13 + 5) % 90}%`,
            top: `${(i * 17 + 10) % 80}%`,
            animationDelay: `${i * 0.15}s`,
          }}
        >
          {e}
        </span>
      ))}

      <div className="text-8xl animate-bounce">🥳</div>
      <h1 className="text-3xl font-bold text-center">You legend! 👑</h1>
      <p className="text-gray-500 text-center max-w-sm">
        Thanks for your feedback on <strong>{surveyName}</strong>.
      </p>
      <p className="text-2xl">The blob is extremely proud of you 🫶</p>
    </div>
  );
}
