"use client";

import { useState } from "react";

export default function VideoAccueil({ onIgnorer }: { onIgnorer: () => void }) {
  const [lecture, setLecture] = useState(false);

  return (
    <div className="flex flex-col gap-2 px-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-foreground/10">
        {lecture ? (
          <video
            src="/video-accueil.mp4"
            controls
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <button
            onClick={() => setLecture(true)}
            className="relative h-full w-full"
            aria-label="Lire la vidéo de présentation"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/poster-accueil.jpg"
              alt=""
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-background/90 text-xl">
                ▶
              </span>
            </span>
          </button>
        )}
      </div>

      <button
        onClick={onIgnorer}
        className="self-end text-xs font-medium text-foreground/50 underline underline-offset-2"
      >
        Passer →
      </button>
    </div>
  );
}