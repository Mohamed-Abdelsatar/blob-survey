"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export type BlobState = "idle" | "excited" | "happy" | "sad" | "celebrating";

interface BlobMascotProps {
  state: BlobState;
  quip: string | null;
  meme?: { url: string; alt: string } | null;
}

const stateStyles: Record<BlobState, string> = {
  idle: "scale-100",
  excited: "scale-110 animate-bounce",
  happy: "scale-105",
  sad: "scale-90 opacity-70",
  celebrating: "scale-125 animate-spin",
};

const stateFilters: Record<BlobState, string> = {
  idle: "hue-rotate(0deg)",
  excited: "hue-rotate(30deg) saturate(1.5)",
  happy: "hue-rotate(15deg)",
  sad: "hue-rotate(180deg) saturate(0.7)",
  celebrating: "hue-rotate(270deg) saturate(2)",
};

export function BlobMascot({ state, quip, meme }: BlobMascotProps) {
  const [blobData, setBlobData] = useState<unknown>(null);

  useEffect(() => {
    fetch("/blob.json").then((r) => r.json()).then(setBlobData);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-2 z-50 max-w-[220px]">
      {meme && (
        <div className="animate-fade-in rounded-xl overflow-hidden shadow-xl border-2 border-gray-800 w-44">
          <Image
            src={meme.url}
            alt={meme.alt}
            width={176}
            height={130}
            className="object-cover w-full"
            unoptimized
          />
        </div>
      )}
      {quip && (
        <div className="bg-white border-2 border-gray-800 rounded-2xl rounded-br-none px-4 py-2 max-w-[200px] text-sm font-medium shadow-lg animate-fade-in">
          {quip}
        </div>
      )}
      <div
        className={`w-24 h-24 transition-all duration-500 ${stateStyles[state]}`}
        style={{ filter: stateFilters[state] }}
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
