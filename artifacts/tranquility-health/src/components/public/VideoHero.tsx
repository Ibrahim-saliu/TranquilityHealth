/**
 * VideoHero — three AI-generated cinematic telehealth clips as a full-bleed
 * background behind the hero text.
 *
 * Clip 1: patient at home, South Asian male doctor on laptop screen
 * Clip 2: patient in a park, African American female doctor on tablet
 * Clip 3: patient walking a dog with earbuds, African American male doctor
 *         visible as a picture-in-picture inset in the scene
 *
 * Desktop: clips cycle with a 1.5 s opacity cross-fade between them.
 * Mobile:  only Clip 1 plays, looping, to avoid excess bandwidth.
 *
 * Overlay is intentionally light so the footage shows through clearly while
 * white hero text stays legible.
 */

import { useEffect, useRef, useState } from "react";

const CLIPS = [
  "/videos/hero-1.mp4",
  "/videos/hero-2.mp4",
  "/videos/hero-3.mp4",
];

const FADE_DURATION_MS = 1500;

export function VideoHero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [nextIdx, setNextIdx] = useState<number | null>(null);
  const [isFading, setIsFading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const transitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect mobile breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // When nextIdx is set: give DOM one frame to mount the next video at opacity 0,
  // then trigger the cross-fade. After FADE_DURATION_MS, swap active ↔ next.
  useEffect(() => {
    if (nextIdx === null) return;

    const raf = requestAnimationFrame(() => {
      setIsFading(true);
    });

    transitionRef.current = setTimeout(() => {
      setActiveIdx(nextIdx);
      setNextIdx(null);
      setIsFading(false);
    }, FADE_DURATION_MS + 50); // small buffer so CSS transition finishes first

    return () => {
      cancelAnimationFrame(raf);
      if (transitionRef.current) clearTimeout(transitionRef.current);
    };
  }, [nextIdx]);

  function handleEnded() {
    // Ignore if mobile (loops) or mid-transition
    if (isMobile || nextIdx !== null) return;
    setNextIdx((activeIdx + 1) % CLIPS.length);
  }

  const transition = `opacity ${FADE_DURATION_MS}ms ease-in-out`;

  // Pre-load background: dark teal gradient so the frame before the video renders
  // looks intentional rather than a plain black flash.
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(135deg,#0d1f2d 0%,#0f3433 45%,#1a1030 100%)" }}
    >
      {/* Active clip — fades out when a transition begins */}
      <video
        key={`active-${activeIdx}`}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: isFading ? 0 : 1, transition, zIndex: 1 }}
        autoPlay
        muted
        playsInline
        preload="auto"
        loop={isMobile}
        onEnded={handleEnded}
      >
        <source src={CLIPS[isMobile ? 0 : activeIdx]} type="video/mp4" />
      </video>

      {/* Incoming clip — fades in during the transition, then becomes active */}
      {nextIdx !== null && (
        <video
          key={`next-${nextIdx}`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: isFading ? 1 : 0, transition, zIndex: 2 }}
          autoPlay
          muted
          playsInline
          preload="auto"
        >
          <source src={CLIPS[nextIdx]} type="video/mp4" />
        </video>
      )}

      {/* Overlay: stronger at top/bottom edges, lighter in the middle so the
          footage reads through. Text legibility comes from text-shadow on the
          headline rather than a heavy blanket opacity here. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 10,
          background:
            "linear-gradient(to bottom, rgba(10,18,26,0.60) 0%, rgba(10,18,26,0.30) 40%, rgba(10,18,26,0.30) 60%, rgba(10,18,26,0.60) 100%)",
        }}
      />
    </div>
  );
}
