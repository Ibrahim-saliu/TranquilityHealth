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

  return (
    <div className="absolute inset-0 overflow-hidden bg-stone-950">
      {/* Active clip — fades out when a transition begins */}
      <video
        key={`active-${activeIdx}`}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: isFading ? 0 : 1, transition, zIndex: 1 }}
        autoPlay
        muted
        playsInline
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
        >
          <source src={CLIPS[nextIdx]} type="video/mp4" />
        </video>
      )}

      {/* Lightweight overlay — reveals the footage while keeping text readable.
          z-index 10 sits above both video layers. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 10,
          background:
            "linear-gradient(to bottom, rgba(12,20,28,0.52) 0%, rgba(12,20,28,0.18) 45%, rgba(12,20,28,0.52) 100%)",
        }}
      />
      {/* Brand teal tint — very subtle so footage colours read through */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-multiply"
        style={{ zIndex: 11, backgroundColor: "rgba(13,44,44,0.12)" }}
      />
    </div>
  );
}
