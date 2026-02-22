import { useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Activity, TrendingDown, Gauge, HeartPulse, ArrowLeft, Footprints, Timer, Zap } from "lucide-react";
import StatCard from "@/components/StatCard";
import RiskGauge from "@/components/RiskGauge";
import BodyHeatmap from "@/components/BodyHeatmap";
import BaselineChart from "@/components/BaselineChart";
import SkeletonModel from "@/components/webgl/SkeletonModel";

gsap.registerPlugin(ScrollTrigger);

const playersData: Record<string, {
  name: string; number: number; position: string; age: number;
  risk: number; fatigue: string; readiness: string; sessions: number;
  height: string; weight: string; foot: string;
  zones: { zone: string; risk: string; color: string; desc: string }[];
  insight: string;
}> = {
  martinez: {
    name: "J. Martinez", number: 10, position: "Forward", age: 26,
    risk: 72, fatigue: "68%", readiness: "54%", sessions: 48,
    height: "182cm", weight: "78kg", foot: "Right",
    zones: [
      { zone: "Left Knee", risk: "High", color: "bg-destructive", desc: "Valgus deviation +14%" },
      { zone: "Right Hip", risk: "High", color: "bg-destructive", desc: "Asymmetric load pattern" },
      { zone: "Right Knee", risk: "Medium", color: "bg-warning", desc: "Deceleration stress" },
      { zone: "Left Ankle", risk: "Medium", color: "bg-warning", desc: "Landing instability" },
      { zone: "Spine", risk: "Medium", color: "bg-warning", desc: "Rotation compensation" },
    ],
    insight: "Repeated high-speed deceleration during defensive pressing increased left knee load by 9.2% over the last 3 sessions. Recommend reducing press intensity or substituting after 65th minute.",
  },
  chen: {
    name: "L. Chen", number: 8, position: "Midfielder", age: 24,
    risk: 34, fatigue: "42%", readiness: "81%", sessions: 52,
    height: "175cm", weight: "72kg", foot: "Left",
    zones: [
      { zone: "Right Ankle", risk: "Medium", color: "bg-warning", desc: "Slight lateral instability" },
      { zone: "Left Hamstring", risk: "Low", color: "bg-success", desc: "Normal range" },
    ],
    insight: "L. Chen shows excellent recovery metrics. Slight right ankle instability detected — recommend proprioception drills. Safe for full match load.",
  },
  diallo: {
    name: "A. Diallo", number: 4, position: "Defender", age: 28,
    risk: 56, fatigue: "58%", readiness: "62%", sessions: 45,
    height: "190cm", weight: "85kg", foot: "Right",
    zones: [
      { zone: "Lower Back", risk: "High", color: "bg-destructive", desc: "Compression loading +18%" },
      { zone: "Right Knee", risk: "Medium", color: "bg-warning", desc: "Lateral stress" },
      { zone: "Left Groin", risk: "Medium", color: "bg-warning", desc: "Adductor tightness" },
    ],
    insight: "A. Diallo's aerial duel frequency is causing elevated spinal compression. Recommend reducing heading drills and focusing on core stabilization.",
  },
  kim: {
    name: "R. Kim", number: 1, position: "Goalkeeper", age: 30,
    risk: 18, fatigue: "28%", readiness: "92%", sessions: 50,
    height: "188cm", weight: "82kg", foot: "Right",
    zones: [
      { zone: "Right Shoulder", risk: "Low", color: "bg-success", desc: "Normal diving load" },
    ],
    insight: "R. Kim is in optimal condition. All biomechanical markers within safe thresholds. Clear for extended match play.",
  },
  silva: {
    name: "M. Silva", number: 7, position: "Winger", age: 22,
    risk: 45, fatigue: "51%", readiness: "70%", sessions: 38,
    height: "172cm", weight: "68kg", foot: "Left",
    zones: [
      { zone: "Right Hamstring", risk: "Medium", color: "bg-warning", desc: "Sprint load accumulation" },
      { zone: "Left Knee", risk: "Low", color: "bg-success", desc: "Stable" },
    ],
    insight: "M. Silva's sprint volume has increased 22% this week. Right hamstring showing early fatigue markers. Recommend managing sprint intensity in next training session.",
  },
  johnson: {
    name: "T. Johnson", number: 5, position: "Defender", age: 27,
    risk: 61, fatigue: "63%", readiness: "55%", sessions: 44,
    height: "186cm", weight: "83kg", foot: "Right",
    zones: [
      { zone: "Left Ankle", risk: "High", color: "bg-destructive", desc: "Previous injury site — elevated load" },
      { zone: "Right Hip", risk: "Medium", color: "bg-warning", desc: "Compensation pattern detected" },
    ],
    insight: "T. Johnson's left ankle (previous injury site) showing elevated stress markers. Right hip compensating — recommend targeted rehab and reduced match minutes.",
  },
  okafor: {
    name: "C. Okafor", number: 9, position: "Forward", age: 25,
    risk: 38, fatigue: "40%", readiness: "78%", sessions: 41,
    height: "184cm", weight: "80kg", foot: "Right",
    zones: [
      { zone: "Right Knee", risk: "Low", color: "bg-success", desc: "Normal load" },
      { zone: "Left Calf", risk: "Low", color: "bg-success", desc: "Minor tightness" },
    ],
    insight: "C. Okafor performing well within safe thresholds. Minor left calf tightness — standard post-match recovery protocol advised.",
  },
  mueller: {
    name: "F. Mueller", number: 6, position: "Midfielder", age: 29,
    risk: 52, fatigue: "55%", readiness: "64%", sessions: 46,
    height: "180cm", weight: "76kg", foot: "Left",
    zones: [
      { zone: "Right Groin", risk: "Medium", color: "bg-warning", desc: "Adductor strain risk" },
      { zone: "Lower Back", risk: "Medium", color: "bg-warning", desc: "Rotational load" },
    ],
    insight: "F. Mueller's passing volume causing rotational load on lower back. Right groin showing strain markers. Consider rotation in midfield during the second half.",
  },
};

const PlayerProfile = () => {
  const { playerId } = useParams();
  const player = playersData[playerId || "martinez"] || playersData.martinez;

  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const insightRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  const skeletonSectionRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
      }
      if (statsRef.current) {
        gsap.fromTo(statsRef.current.children,
          { opacity: 0, y: 30, scale: 0.93 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.6, ease: "power3.out", delay: 0.1 }
        );
      }
      if (bioRef.current) {
        gsap.fromTo(bioRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.3 });
      }
      if (chartsRef.current) {
        gsap.fromTo(chartsRef.current.children,
          { opacity: 0, y: 45, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1, stagger: 0.15, duration: 0.8, ease: "power3.out",
            scrollTrigger: { trigger: chartsRef.current, start: "top 85%" },
          }
        );
      }
      if (skeletonSectionRef.current) {
        gsap.fromTo(skeletonSectionRef.current,
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: skeletonSectionRef.current, start: "top 85%" },
          }
        );
      }
      if (insightRef.current) {
        gsap.fromTo(insightRef.current,
          { opacity: 0, x: -30 },
          {
            opacity: 1, x: 0, duration: 0.7, ease: "power3.out",
            scrollTrigger: { trigger: insightRef.current, start: "top 88%" },
          }
        );
      }
    });
    return () => ctx.revert();
  }, [playerId]);

  const riskVariant = player.risk >= 60 ? "danger" : player.risk >= 40 ? "warning" : "primary";

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 space-y-8">
      {/* Header */}
      <div ref={headerRef} style={{ opacity: 0 }}>
        <Link to="/players" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Players
        </Link>
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-primary-foreground font-bold font-display text-xl">
            {player.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Player Intelligence</p>
            <h1 className="text-3xl font-bold font-display text-foreground tracking-tight">{player.name} — #{player.number}</h1>
            <p className="text-sm text-muted-foreground">{player.position} · Age {player.age} · Last analyzed: Today</p>
          </div>
        </div>
      </div>

      {/* Bio strip */}
      <div ref={bioRef} className="glass-card rounded-xl p-4 flex flex-wrap gap-6" style={{ opacity: 0 }}>
        {[
          { label: "Height", val: player.height },
          { label: "Weight", val: player.weight },
          { label: "Preferred Foot", val: player.foot },
          { label: "Position", val: player.position },
          { label: "Sessions Tracked", val: String(player.sessions) },
        ].map((b) => (
          <div key={b.label} className="flex-1 min-w-[120px]">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{b.label}</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">{b.val}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div ref={statsRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Injury Risk" value={String(player.risk)} subtitle={player.risk >= 60 ? "High risk zone" : player.risk >= 40 ? "Moderate risk" : "Low risk"} icon={Activity} variant={riskVariant as any} />
        <StatCard title="Fatigue Index" value={player.fatigue} subtitle={parseInt(player.fatigue) > 50 ? "Above threshold" : "Within limits"} icon={TrendingDown} variant="warning" />
        <StatCard title="Readiness" value={player.readiness} subtitle={parseInt(player.readiness) > 70 ? "Good" : "Below optimal"} icon={Gauge} variant="default" />
        <StatCard title="Sessions Tracked" value={String(player.sessions)} subtitle="Since Jan 2026" icon={HeartPulse} variant="primary" />
      </div>

      {/* Charts + Risk */}
      <div ref={chartsRef} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6" style={{ opacity: 0 }}>
          <BaselineChart />
          <div ref={insightRef} className="glass-card rounded-xl p-5 border-l-4 border-l-warning" style={{ opacity: 0 }}>
            <h4 className="text-sm font-semibold font-display text-foreground mb-2">AI Insight</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">"{player.insight}"</p>
          </div>
        </div>
        <div className="space-y-6" style={{ opacity: 0 }}>
          <div className="glass-card rounded-xl p-6 flex flex-col items-center">
            <h3 className="text-sm font-semibold font-display text-foreground mb-4 self-start">Overall Risk</h3>
            <RiskGauge score={player.risk} label="Injury Risk Score" size="lg" />
          </div>
          <BodyHeatmap />
        </div>
      </div>

      {/* 3D Skeleton */}
      <div ref={skeletonSectionRef} className="glass-card rounded-xl p-6" style={{ opacity: 0 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="text-sm font-semibold font-display text-foreground mb-2">3D Biomechanical Model</h3>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
              Interactive skeleton visualization showing real-time stress distribution for {player.name}.
            </p>
            <div className="space-y-3">
              {player.zones.map((item) => (
                <div key={item.zone} className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <div>
                      <span className="text-xs font-semibold text-foreground">{item.zone}</span>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${item.risk === "High" ? "text-destructive" : item.risk === "Medium" ? "text-warning" : "text-success"}`}>
                    {item.risk}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-4">
              {(["Low", "Medium", "High"] as const).map((l) => (
                <div key={l} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${l === "Low" ? "bg-success" : l === "Medium" ? "bg-warning" : "bg-destructive"}`} />
                  <span className="text-[10px] text-muted-foreground">{l} Risk</span>
                </div>
              ))}
            </div>
          </div>
          <SkeletonModel className="h-[420px] w-full" />
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;
