"use client";

import { useEffect, useState } from "react";

export function CompletionScreen({ surveyName }: { surveyName: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen gap-6 transition-opacity duration-700 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="text-7xl animate-bounce">🎉</div>
      <h1 className="text-3xl font-bold text-center">You&apos;re done!</h1>
      <p className="text-gray-500 text-center max-w-sm">
        Thanks for your feedback on <strong>{surveyName}</strong>. The blob is very
        proud of you.
      </p>
    </div>
  );
}
