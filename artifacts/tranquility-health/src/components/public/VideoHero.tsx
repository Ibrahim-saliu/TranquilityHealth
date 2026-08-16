/**
 * VideoHero — three AI-generated telehealth clips looping as a full-bleed
 * background behind the hero text.
 *
 * Clip 1: person at home on a couch, laptop open on a telehealth call
 * Clip 2: person in a park on a bench, tablet showing a video session
 * Clip 3: person walking a dog, phone raised with provider video inset
 *
 * Desktop: clips cycle automatically; each plays to completion then the next begins.
 * Mobile: only Clip 1 plays to save bandwidth.
 *
 * A dark gradient overlay keeps white hero text legible over any clip.
 */

import { useEffect, useRef, useState } from "react";

const CLIPS = [
  "/videos/hero-1.mp4",
  "/videos/hero-2.mp4",
  "/videos/hero-3.mp4",
];

export function VideoHero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile — videos cycle on desktop only
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  function handleEnded() {
    if (!isMobile) {
      setActiveIdx((i) => (i + 1) % CLIPS.length);
    }
  }

  // Using key={clipSrc} on <video> forces a remount whenever the active clip
  // changes, which is the cleanest way to trigger load + autoplay in React.
  const clipSrc = CLIPS[isMobile ? 0 : activeIdx];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        key={clipSrc}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        loop={isMobile}
        onEnded={handleEnded}
      >
        <source src={clipSrc} type="video/mp4" />
      </video>

      {/* Gradient overlay: enough to keep white text legible without hiding the video */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-950/55 via-stone-950/25 to-stone-950/55 pointer-events-none" />
      {/* Subtle teal tint reinforcing the brand palette */}
      <div className="absolute inset-0 bg-teal-950/20 pointer-events-none mix-blend-multiply" />
    </div>
  );
}
