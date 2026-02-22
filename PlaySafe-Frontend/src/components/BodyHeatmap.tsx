import { useRef, useEffect } from "react";
import gsap from "gsap";

interface StressZone {
  id: string;
  label: string;
  level: "low" | "medium" | "high";
  x: number;
  y: number;
}

const zones: StressZone[] = [
  { id: "left-shoulder", label: "L. Shoulder", level: "low", x: 35, y: 18 },
  { id: "right-shoulder", label: "R. Shoulder", level: "low", x: 65, y: 18 },
  { id: "left-knee", label: "L. Knee", level: "high", x: 38, y: 58 },
  { id: "right-knee", label: "R. Knee", level: "medium", x: 62, y: 58 },
  { id: "left-ankle", label: "L. Ankle", level: "medium", x: 38, y: 78 },
  { id: "right-ankle", label: "R. Ankle", level: "low", x: 62, y: 78 },
  { id: "lower-back", label: "Lower Back", level: "medium", x: 50, y: 35 },
  { id: "left-hip", label: "L. Hip", level: "low", x: 40, y: 44 },
  { id: "right-hip", label: "R. Hip", level: "high", x: 60, y: 44 },
];

const levelColorHex = {
  low: "hsl(152, 70%, 45%)",
  medium: "hsl(36, 100%, 55%)",
  high: "hsl(0, 72%, 55%)",
};

const levelColor = { low: "bg-success", medium: "bg-warning", high: "bg-destructive" };
const levelGlow = {
  low: "shadow-[0_0_8px_hsla(152,70%,45%,0.4)]",
  medium: "shadow-[0_0_8px_hsla(36,100%,55%,0.4)]",
  high: "shadow-[0_0_12px_hsla(0,72%,55%,0.5)]",
};

const BodyHeatmap = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });

    dotsRef.current.forEach((dot, i) => {
      if (!dot) return;
      gsap.fromTo(dot,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, delay: 0.4 + i * 0.08, ease: "back.out(2)" }
      );
      // Pulse animation for high-risk zones
      if (zones[i].level === "high") {
        gsap.to(dot, {
          scale: 1.3,
          opacity: 0.6,
          duration: 0.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 1 + i * 0.1,
        });
      }
    });
  }, []);

  return (
    <div ref={containerRef} className="glass-card rounded-xl p-6" style={{ opacity: 0 }}>
      <h3 className="text-sm font-semibold font-display text-foreground mb-4">Stress Zones</h3>
      <div className="relative mx-auto" style={{ width: 200, height: 320 }}>
        <svg viewBox="0 0 100 160" className="w-full h-full opacity-20 text-foreground">
          <circle cx="50" cy="12" r="8" fill="currentColor" />
          <rect x="38" y="22" width="24" height="35" rx="6" fill="currentColor" />
          <rect x="26" y="24" width="10" height="28" rx="4" fill="currentColor" />
          <rect x="64" y="24" width="10" height="28" rx="4" fill="currentColor" />
          <rect x="38" y="58" width="10" height="40" rx="4" fill="currentColor" />
          <rect x="52" y="58" width="10" height="40" rx="4" fill="currentColor" />
          <ellipse cx="43" cy="100" rx="6" ry="3" fill="currentColor" />
          <ellipse cx="57" cy="100" rx="6" ry="3" fill="currentColor" />
        </svg>

        {zones.map((zone, i) => (
          <div
            key={zone.id}
            ref={(el) => { dotsRef.current[i] = el; }}
            className={`absolute h-3.5 w-3.5 rounded-full ${levelColor[zone.level]} ${levelGlow[zone.level]}`}
            style={{ left: `${zone.x}%`, top: `${zone.y}%`, transform: "translate(-50%, -50%) scale(0)", opacity: 0 }}
            title={`${zone.label}: ${zone.level} risk`}
          />
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-4">
        {(["low", "medium", "high"] as const).map((level) => (
          <div key={level} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${levelColor[level]}`} />
            <span className="text-[10px] capitalize text-muted-foreground">{level}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BodyHeatmap;
