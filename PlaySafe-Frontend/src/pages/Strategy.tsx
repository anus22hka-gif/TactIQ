import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Brain, ShieldAlert, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { useDemoUser } from "@/context/DemoUserContext";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

interface Scenario {
  id: string;
  label: string;
  description: string;
  riskChange: number;
  fatigueChange: number;
  recommendation: boolean;
}

const scenarios: Scenario[] = [
  { id: "reduce-press", label: "Reduce High Press", description: "Lower pressing intensity from 80% to 60% after 60th minute", riskChange: -18, fatigueChange: -22, recommendation: true },
  { id: "role-change", label: "Role Redistribution", description: "Shift Martinez to holding role, reduce sprint load by 35%", riskChange: -25, fatigueChange: -15, recommendation: true },
  { id: "increase-press", label: "Increase Full Press", description: "Maintain high press throughout the match", riskChange: 32, fatigueChange: 28, recommendation: false },
  { id: "sub-early", label: "Early Substitution (65')", description: "Replace high-risk player at 65th minute", riskChange: -40, fatigueChange: -10, recommendation: true },
];

const Strategy = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const { user } = useDemoUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role === "player" && user.id) {
      navigate(`/player/${user.id}`, { replace: true });
      return;
    }

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
      }
      if (cardsRef.current) {
        gsap.fromTo(cardsRef.current.children,
          { opacity: 0, y: 35, rotateX: 5 },
          {
            opacity: 1, y: 0, rotateX: 0, stagger: 0.12, duration: 0.6, ease: "power3.out",
            scrollTrigger: { trigger: cardsRef.current, start: "top 88%", toggleActions: "play none none none" },
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (selected && resultRef.current) {
      gsap.fromTo(resultRef.current,
        { opacity: 0, y: 20, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [selected]);

  const handleSelect = (id: string) => {
    setSelected(id === selected ? null : id);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-6 pt-24 pb-16">
      <div ref={headerRef} style={{ opacity: 0 }}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Tactical Intelligence</p>
        <h1 className="mt-1.5 text-3xl font-bold font-display text-foreground tracking-tight">Strategy Impact Simulator</h1>
        <p className="mt-1 text-sm text-muted-foreground">Explore how tactical changes affect injury risk and player load</p>
      </div>

      <div ref={cardsRef} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSelect(s.id)}
            className={`glass-card rounded-xl p-5 text-left transition-all duration-300 hover:scale-[1.02] ${
              selected === s.id ? "ring-2 ring-primary glow-primary" : "hover:ring-1 hover:ring-border"
            }`}
            style={{ opacity: 0 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.recommendation ? "gradient-primary" : "bg-destructive/20"}`}>
                  {s.recommendation ? <Brain className="h-4 w-4 text-primary-foreground" /> : <ShieldAlert className="h-4 w-4 text-destructive" />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold font-display text-foreground">{s.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                </div>
              </div>
              {s.recommendation && (
                <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                  <Check className="h-3 w-3" /> Recommended
                </span>
              )}
            </div>
            <div className="mt-4 flex gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Injury Risk</p>
                <p className={`text-lg font-bold font-display ${s.riskChange < 0 ? "text-success" : "text-destructive"}`}>
                  {s.riskChange > 0 ? "+" : ""}{s.riskChange}%
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Fatigue Impact</p>
                <p className={`text-lg font-bold font-display ${s.fatigueChange < 0 ? "text-success" : "text-destructive"}`}>
                  {s.fatigueChange > 0 ? "+" : ""}{s.fatigueChange}%
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div ref={resultRef} className="glass-card rounded-xl p-6 border-l-4 border-l-primary" style={{ opacity: 0 }}>
          <h3 className="text-sm font-semibold font-display text-foreground mb-2 flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            AI Recommendation
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {scenarios.find((s) => s.id === selected)?.recommendation
              ? `Applying "${scenarios.find((s) => s.id === selected)?.label}" would significantly reduce injury probability while maintaining competitive performance. The projected risk reduction aligns with historical outcomes from similar tactical adjustments.`
              : `This tactical approach would increase cumulative load beyond safe thresholds. Historical data shows a 2.3x higher injury rate when maintaining this intensity. Consider alternative strategies.`}
          </p>
          <button className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
            View detailed simulation <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Strategy;
