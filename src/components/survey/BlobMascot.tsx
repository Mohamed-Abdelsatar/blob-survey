"use client";

export type BlobState = "idle" | "excited" | "happy" | "sad" | "celebrating";

interface BlobMascotProps {
  state: BlobState;
  quip: string | null;
  meme?: { url: string; alt: string } | null;
}

export function BlobMascot(_props: BlobMascotProps) {
  return null;
}
