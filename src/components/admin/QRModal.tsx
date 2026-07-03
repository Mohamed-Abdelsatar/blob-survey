"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface QRModalProps {
  surveyId: string;
  surveyName: string;
  onClose: () => void;
}

export function QRModal({ surveyId, surveyName, onClose }: QRModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const surveyUrl = `${window.location.origin}/survey/${surveyId}`;
    setUrl(surveyUrl);
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, surveyUrl, { width: 240, margin: 2 });
    }
  }, [surveyId]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `${surveyName}-qr.png`;
    a.href = canvas.toDataURL();
    a.click();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4 max-w-xs w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-lg text-center">{surveyName}</h3>
        <canvas ref={canvasRef} className="rounded-xl" />
        <p className="text-xs text-gray-400 text-center break-all">{url}</p>
        <div className="flex gap-2 w-full">
          <button onClick={download} className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
            ⬇ Download PNG
          </button>
          <button onClick={onClose} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
