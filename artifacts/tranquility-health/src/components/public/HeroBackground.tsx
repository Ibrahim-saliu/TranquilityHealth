/**
 * HeroBackground — three looping canvas animations that cycle automatically.
 *
 * Scene 1: Neural Particle Field  — calm drifting particles with faint neural
 *   connections; suggests mindfulness and interconnectedness.
 * Scene 2: Breathing Wave Layers  — stacked sine-wave fills that shift slowly;
 *   evokes gentle, rhythmic breathing.
 * Scene 3: Aurora Orbs            — large soft radial lights drifting across the
 *   frame like aurora borealis through deep water.
 *
 * Scenes cross-fade every ~13 seconds via Framer Motion AnimatePresence.
 * A fixed dark overlay sits above all scenes to keep white hero text legible.
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ─── Scene 1: Neural Particle Field ────────────────────────────────────────

function NeuralParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Fewer particles on small screens
    const count = () => Math.min(90, Math.max(40, Math.floor((canvas.width * canvas.height) / 11000)));

    type Particle = { x: number; y: number; vx: number; vy: number; r: number; phase: number };
    let particles: Particle[] = [];

    const seed = () => {
      particles = Array.from({ length: count() }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.8 + 0.8,
        phase: Math.random() * Math.PI * 2,
      }));
    };
    seed();

    let t = 0;
    const MAX_DIST = 130;

    const draw = () => {
      t += 0.006;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update + draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -2) p.x = canvas.width + 2;
        if (p.x > canvas.width + 2) p.x = -2;
        if (p.y < -2) p.y = canvas.height + 2;
        if (p.y > canvas.height + 2) p.y = -2;

        const pulse = 0.55 + 0.45 * Math.sin(t * 1.8 + p.phase);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(94,234,212,${0.5 * pulse})`; // teal-300
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MAX_DIST * MAX_DIST) {
            const alpha = (1 - Math.sqrt(d2) / MAX_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(129,140,248,${alpha})`; // indigo-400
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// ─── Scene 2: Breathing Wave Layers ────────────────────────────────────────

function BreathingWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Each wave: primary freq, secondary freq, amplitude, drift speed, y-anchor (0-1), fill color
    const waves = [
      { f1: 0.0055, f2: 0.009, amp: 70,  spd: 0.0035, ya: 0.82, color: "20,184,166",  a: 0.13 }, // teal-500
      { f1: 0.0040, f2: 0.007, amp: 90,  spd: 0.0025, ya: 0.70, color: "99,102,241",  a: 0.10 }, // indigo-500
      { f1: 0.0070, f2: 0.011, amp: 55,  spd: 0.0045, ya: 0.58, color: "16,185,129",  a: 0.09 }, // emerald-500
      { f1: 0.0050, f2: 0.008, amp: 80,  spd: 0.0020, ya: 0.45, color: "139,92,246",  a: 0.08 }, // violet-500
      { f1: 0.0065, f2: 0.010, amp: 50,  spd: 0.0055, ya: 0.35, color: "56,189,248",  a: 0.07 }, // sky-400
    ];

    let t = 0;

    const draw = () => {
      t++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const w of waves) {
        const y0 = w.ya * canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, y0);
        for (let x = 0; x <= canvas.width; x += 4) {
          const y =
            y0 +
            Math.sin(x * w.f1 + t * w.spd) * w.amp +
            Math.sin(x * w.f2 + t * w.spd * 0.6 + 1.3) * w.amp * 0.35;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fillStyle = `rgba(${w.color},${w.a})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// ─── Scene 3: Aurora Orbs ──────────────────────────────────────────────────

function AuroraOrbs() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Orbs: normalized center, radius (relative to min dimension), drift params
    const orbs = [
      { cx: 0.72, cy: 0.22, nr: 0.55, rgb: [20, 184, 166],  spd: 0.00032, px: 0.0, py: 1.5 }, // teal
      { cx: 0.18, cy: 0.72, nr: 0.50, rgb: [99, 102, 241],  spd: 0.00025, px: 2.1, py: 0.6 }, // indigo
      { cx: 0.52, cy: 0.48, nr: 0.42, rgb: [16, 185, 129],  spd: 0.00042, px: 4.2, py: 3.1 }, // emerald
      { cx: 0.85, cy: 0.65, nr: 0.38, rgb: [139, 92, 246],  spd: 0.00018, px: 1.1, py: 4.8 }, // violet
    ];

    // Horizontal aurora streak
    const streaks = [
      { y: 0.30, hue: [56, 189, 248], spd: 0.0003, phase: 0 },   // sky
      { y: 0.55, hue: [20, 184, 166], spd: 0.0002, phase: 2.5 }, // teal
    ];

    let t = 0;

    const draw = () => {
      t++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const minDim = Math.min(canvas.width, canvas.height);

      // Aurora streaks
      for (const s of streaks) {
        const y = (s.y + Math.sin(t * s.spd + s.phase) * 0.08) * canvas.height;
        const grad = ctx.createLinearGradient(0, y - 80, 0, y + 80);
        grad.addColorStop(0,   `rgba(${s.hue},0)`);
        grad.addColorStop(0.5, `rgba(${s.hue},0.07)`);
        grad.addColorStop(1,   `rgba(${s.hue},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, y - 80, canvas.width, 160);
      }

      // Radial orbs
      for (const orb of orbs) {
        const x = (orb.cx + Math.sin(t * orb.spd + orb.px) * 0.28) * canvas.width;
        const y = (orb.cy + Math.cos(t * orb.spd + orb.py) * 0.22) * canvas.height;
        const r = orb.nr * minDim;
        const [R, G, B] = orb.rgb;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0,   `rgba(${R},${G},${B},0.22)`);
        grad.addColorStop(0.45,`rgba(${R},${G},${B},0.09)`);
        grad.addColorStop(1,   `rgba(${R},${G},${B},0)`);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// ─── Cycling controller ─────────────────────────────────────────────────────

const SCENES = [NeuralParticles, BreathingWaves, AuroraOrbs] as const;
const CYCLE_MS = 13000;  // how long each scene shows before cross-fading

export function HeroBackground() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % SCENES.length), CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  const Scene = SCENES[idx];

  return (
    // Fills the parent section absolutely; overflow-hidden clips canvas edges
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={idx}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          <Scene />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay: darkens edges so text over the centre stays legible */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-950/70 via-stone-950/40 to-violet-950/60 pointer-events-none" />
    </div>
  );
}
