/**
 * VideoHero — cinematic full-bleed video background behind the hero text.
 *
 * Two video slots (A and B) are permanently mounted — neither is ever remounted.
 * Cross-fading works by transitioning their opacity while both elements stay in the DOM.
 * This eliminates the flash/restart glitch that occurs when React unmounts and remounts
 * a video element during clip transitions.
 *
 * Desktop lifecycle:
 *   Slot A  → plays clip 0, fades out → loads clip 2 (hidden)
 *   Slot B  → preloaded with clip 1, fades in when A ends → loads clip 0 (hidden) → ...
 *
 * Mobile: only slot A, looping clip 0 (saves bandwidth, no cycling).
 *
 * Overlay is ~55 % opaque so the footage reads clearly through it while
 * white text stays sharp without needing text-shadow.
 */

import { useEffect, useRef, useState } from "react";

const CLIPS = [
  "/videos/hero-1.mp4",
  "/videos/hero-2.mp4",
  "/videos/hero-3.mp4",
];

const FADE_MS = 1500;

export function VideoHero() {
  const [isMobile, setIsMobile] = useState(false);

  // Src for each permanent slot (changed only when the slot is hidden)
  const [aSrc, setASrc] = useState(CLIPS[0]);
  const [bSrc, setBSrc] = useState(CLIPS[1]);

  // Opacity for cross-fading
  const [aOpacity, setAOpacity] = useState(1);
  const [bOpacity, setBOpacity] = useState(0);

  const videoA = useRef<HTMLVideoElement>(null);
  const videoB = useRef<HTMLVideoElement>(null);

  // Which slot is currently the "active" (visible) primary
  const activeSlot = useRef<"a" | "b">("a");
  // Next clip index to assign to the hidden slot after each transition
  const nextClipIdx = useRef(2);
  // Guard against double-triggering a transition
  const isFading = useRef(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mobile detection
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => {
      mq.removeEventListener("change", handler);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, []);

  // Called when a slot's clip finishes playing
  function handleEnded(slot: "a" | "b") {
    // Only the active slot drives transitions; ignore events from the hidden slot
    if (slot !== activeSlot.current || isFading.current || isMobile) return;
    isFading.current = true;

    // Bring the standby slot to the beginning and start it playing
    const standby = slot === "a" ? videoB.current : videoA.current;
    if (standby) {
      standby.currentTime = 0;
      standby.play().catch(() => {/* autoplay policy — muted video should always pass */});
    }

    // Kick off the opacity cross-fade
    if (slot === "a") {
      setAOpacity(0);
      setBOpacity(1);
    } else {
      setBOpacity(0);
      setAOpacity(1);
    }

    // After the CSS transition completes: swap active slot and queue next clip
    fadeTimer.current = setTimeout(() => {
      activeSlot.current = slot === "a" ? "b" : "a";

      const ni = nextClipIdx.current;
      nextClipIdx.current = (ni + 1) % CLIPS.length;

      // Load the queued clip into the now-hidden slot.
      // Because the slot has no autoPlay, changing src only preloads — it does not play.
      if (slot === "a") setASrc(CLIPS[ni]);
      else setBSrc(CLIPS[ni]);

      isFading.current = false;
    }, FADE_MS + 120);
  }

  const transition = `opacity ${FADE_MS}ms ease-in-out`;

  return (
    // Dark teal gradient: the placeholder colour shown during the first video frame load.
    // Matches the video palette so there is no jarring black flash on page load or refresh.
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(135deg,#0c1c2b 0%,#0e3030 50%,#18102c 100%)" }}
    >
      {isMobile ? (
        // Mobile: single looping clip, no cycling
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={CLIPS[0]}
          autoPlay
          muted
          playsInline
          loop
        />
      ) : (
        // Desktop: two permanent slots, cross-fade on clip end
        <>
          {/* Slot A — starts as the active/visible clip */}
          <video
            ref={videoA}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: aOpacity, transition, zIndex: 1 }}
            src={aSrc}
            autoPlay          // starts playing clip 0 on mount
            muted
            playsInline
            preload="auto"
            onEnded={() => handleEnded("a")}
          />

          {/* Slot B — preloaded and waiting; played explicitly when A ends */}
          <video
            ref={videoB}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: bOpacity, transition, zIndex: 1 }}
            src={bSrc}
            muted
            playsInline
            preload="auto"    // buffers clip 1 while A is playing
            onEnded={() => handleEnded("b")}
          />
        </>
      )}

      {/* Overlay — ~55 % opaque so footage is clearly visible and white text
          stays sharp without needing any text-shadow on the headline */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 10,
          background:
            "linear-gradient(to bottom, rgba(8,14,22,0.68) 0%, rgba(8,14,22,0.52) 35%, rgba(8,14,22,0.52) 65%, rgba(8,14,22,0.68) 100%)",
        }}
      />
    </div>
  );
}
