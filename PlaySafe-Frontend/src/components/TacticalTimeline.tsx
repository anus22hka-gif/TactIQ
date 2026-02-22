import { useRef, useEffect } from "react";
import gsap from "gsap";

interface Phase {
  label: string;
  startMin: number;
  endMin: number;
  type: "attack" | "defense" | "transition" | "set-piece";
  riskEvents?: number;
}

const phases: Phase[] = [
  { label: "High Press", startMin: 0, endMin: 12, type: "attack", riskEvents: 1 },
  { label: "Defensive Block", startMin: 12, endMin: 25, type: "defense" },
  { label: "Counter Attack", startMin: 25, endMin: 32, type: "transition", riskEvents: 2 },
  { label: "Build-Up Play", startMin: 32, endMin: 45, type: "attack" },
  { label: "Half Time", startMin: 45, endMin: 48, type: "set-piece" },
  { label: "Pressing Phase", startMin: 48, endMin: 60, type: "attack", riskEvents: 3 },
  { label: "Recovery Block", startMin: 60, endMin: 72, type: "defense" },
  { label: "Final Push", startMin: 72, endMin: 90, type: "attack", riskEvents: 1 },
];

const typeColorMap = {
  attack: "hsl(187, 100%, 50%)",
  defense: "hsl(36, 100%, 55%)",
  transition: "hsl(152, 70%, 45%)",
  "set-piece": "hsl(220, 14%, 25%)",
};

const typeColorClass = {
  attack: "bg-primary/80",
  defense: "bg-accent/80",
  transition: "bg-success/80",
  "set-piece": "bg-muted",
};

const TacticalTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });

    barsRef.current.forEach((bar, i) => {
      if (!bar) return;
      gsap.fromTo(bar,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.6, delay: 0.1 + i * 0.06, ease: "power3.out", transformOrigin: "left" }
      );
    });
  }, []);

  return (
    <div ref={containerRef} className="glass-card rounded-xl p-6" style={{ opacity: 0 }}>
      <h3 className="text-sm font-semibold font-display text-foreground mb-4">Tactical Timeline</h3>
      <div className="relative">
        <div className="flex justify-between text-[10px] text-muted-foreground mb-2 px-0.5">
          {[0, 15, 30, 45, 60, 75, 90].map((m) => (
            <span key={m}>{m}'</span>
          ))}
        </div>

        <div className="relative h-8 rounded-full bg-muted overflow-hidden">
          {phases.map((phase, i) => {
            const left = (phase.startMin / 90) * 100;
            const width = ((phase.endMin - phase.startMin) / 90) * 100;
            return (
              <div
                key={i}
                ref={(el) => { barsRef.current[i] = el; }}
                className={`absolute top-0 h-full ${typeColorClass[phase.type]} origin-left`}
                style={{ left: `${left}%`, width: `${width}%`, transform: "scaleX(0)" }}
                title={`${phase.label} (${phase.startMin}'-${phase.endMin}')`}
              >
                {phase.riskEvents && (
                  <div className="absolute -top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground">
                    {phase.riskEvents}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          {(["attack", "defense", "transition", "set-piece"] as const).map((type) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${typeColorClass[type]}`} />
              <span className="text-[10px] capitalize text-muted-foreground">{type}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[7px] font-bold text-destructive-foreground">!</span>
            <span className="text-[10px] text-muted-foreground">Risk Event</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TacticalTimeline;
