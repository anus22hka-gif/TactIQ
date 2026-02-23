import { useRef, useEffect, useState } from "react";
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

const CHHETRI_PHOTO_URL =
  "https://i.postimg.cc/52d7xSfC/2a4bbbfa-2022.jpg";

const CHHETRI_STRESS_PHOTO_URL =
  "https://i.postimg.cc/Pr2W7bPk/3441843.jpg";

const playersMeta: Record<
  string,
  {
    name: string;
    number: number;
    position: string;
    age: number;
    height: string;
    weight: string;
    foot: string;
  }
> = {
  chhetri: {
    name: "S. Chhetri",
    number: 11,
    position: "Forward",
    age: 39,
    height: "170cm",
    weight: "70kg",
    foot: "Right",
  },
  martinez: {
    name: "J. Martinez",
    number: 10,
    position: "Forward",
    age: 26,
    height: "182cm",
    weight: "78kg",
    foot: "Right",
  },
};

const PlayerProfile = () => {
  const { playerId } = useParams();
  const player = playersMeta[playerId || "martinez"] || playersMeta.martinez;

  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const insightRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  const skeletonSectionRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);

  const [postureFile, setPostureFile] = useState<File | null>(null);
  const [posturePreview, setPosturePreview] = useState<string | null>(null);
  const [injuryResult, setInjuryResult] = useState<any>(null);
  const [injuryLoading, setInjuryLoading] = useState(false);
  const [injuryError, setInjuryError] = useState<string | null>(null);
   const [treatAsBaseline, setTreatAsBaseline] = useState(false);
  const apiBase =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

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

  const riskScore =
    injuryResult && injuryResult.status === "success"
      ? Math.round((injuryResult.injury_analysis?.risk_score || 0) * 100)
      : null;

  const riskLevel = injuryResult?.injury_analysis?.risk_level || "unknown";

  const fatigueValue =
    riskScore !== null ? `${Math.min(100, Math.max(0, riskScore + 10))}%` : "—";

  const readinessValue =
    riskScore !== null ? `${Math.max(0, 100 - riskScore)}%` : "—";

  const sessionsValue =
    injuryResult?.joint_metrics?.frames_analyzed != null
      ? String(injuryResult.joint_metrics.frames_analyzed)
      : "—";

  const riskVariant =
    riskScore !== null && riskScore >= 60
      ? "danger"
      : riskScore !== null && riskScore >= 40
      ? "warning"
      : "primary";

  const insightText =
    injuryResult && injuryResult.status === "success"
      ? (injuryResult.injury_analysis?.explanations?.[0] ||
          injuryResult.injury_analysis?.recommendations?.[0] ||
          "")
      : "";

  const zoneRisks: { id: string; level: "low" | "medium" | "high"; description: string }[] =
    injuryResult && injuryResult.status === "success"
      ? (injuryResult.injury_analysis?.zone_risks || []).map(
          (z: any) => ({
            id: String(z.zone),
            level:
              String(z.level) === "high" || String(z.level) === "medium"
                ? (String(z.level) as "low" | "medium" | "high")
                : "low",
            description: String(z.description || ""),
          })
        )
      : [];

  const handlePostureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPostureFile(file);
    setPosturePreview(URL.createObjectURL(file));
    setInjuryResult(null);
    setInjuryError(null);
  };

  const handleAnalyzePosture = async () => {
    if (!postureFile) return;
    const id = playerId || "chhetri";
    const formData = new FormData();
    formData.append("player_id", id);
    formData.append("file", postureFile);
    const heightNum = parseFloat(player.height.replace("cm", ""));
    const weightNum = parseFloat(player.weight.replace("kg", ""));
    if (!Number.isNaN(heightNum)) {
      formData.append("height_cm", String(heightNum));
    }
    if (!Number.isNaN(weightNum)) {
      formData.append("weight_kg", String(weightNum));
    }
    formData.append("position", player.position);
    formData.append("preferred_foot", player.foot);
    formData.append("mode", treatAsBaseline ? "baseline" : "analysis");
    try {
      setInjuryLoading(true);
      setInjuryError(null);
      const res = await fetch(`${apiBase}/analyze-posture/`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setInjuryResult(data);
      if (data.status !== "success") {
        setInjuryError(data.message || "No pose detected in the uploaded media.");
      }
    } catch {
      setInjuryError("Injury analysis backend error");
    } finally {
      setInjuryLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 space-y-8">
      {/* Header */}
      <div ref={headerRef} style={{ opacity: 0 }}>
        <Link to="/players" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Players
        </Link>
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl overflow-hidden border border-border/60 bg-muted flex items-center justify-center">
            {playerId === "chhetri" ? (
              <img
                src={CHHETRI_PHOTO_URL}
                alt={player.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center gradient-primary text-primary-foreground font-bold font-display text-xl">
                {player.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            )}
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
          { label: "Sessions Tracked", val: sessionsValue },
        ].map((b) => (
          <div key={b.label} className="flex-1 min-w-[120px]">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{b.label}</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">{b.val}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div ref={statsRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Injury Risk"
          value={riskScore !== null ? String(riskScore) : "—"}
          subtitle={
            riskScore === null
              ? "Awaiting posture analysis"
              : riskScore >= 60
              ? "High risk zone"
              : riskScore >= 40
              ? "Moderate risk"
              : "Low risk"
          }
          icon={Activity}
          variant={riskVariant as any}
        />
        <StatCard
          title="Fatigue Index"
          value={fatigueValue}
          subtitle={
            fatigueValue !== "—" && parseInt(fatigueValue) > 50
              ? "Above threshold"
              : "Within limits"
          }
          icon={TrendingDown}
          variant="warning"
        />
        <StatCard
          title="Readiness"
          value={readinessValue}
          subtitle={
            readinessValue !== "—" && parseInt(readinessValue) > 70
              ? "Good"
              : "Below optimal"
          }
          icon={Gauge}
          variant="default"
        />
        <StatCard
          title="Sessions Tracked"
          value={sessionsValue}
          subtitle="Frames analyzed from latest session"
          icon={HeartPulse}
          variant="primary"
        />
      </div>

      {/* Charts + Risk */}
      <div ref={chartsRef} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6" style={{ opacity: 0 }}>
          <BaselineChart />
          <div
            ref={insightRef}
            className="glass-card rounded-xl p-5 border-l-4 border-l-warning"
            style={{ opacity: 0 }}
          >
            <h4 className="text-sm font-semibold font-display text-foreground mb-2">
              AI Insight
            </h4>
            {insightText ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                "{insightText}"
              </p>
            ) : (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload a posture or motion clip below to generate a personalized injury-risk
                insight for this player.
              </p>
            )}
          </div>
        </div>
        <div className="space-y-6" style={{ opacity: 0 }}>
          <div className="glass-card rounded-xl p-6 flex flex-col items-center">
            <h3 className="text-sm font-semibold font-display text-foreground mb-4 self-start">Overall Risk</h3>
            <RiskGauge score={riskScore || 0} label="Injury Risk Score" size="lg" />
          </div>
          <BodyHeatmap
            zones={zoneRisks.map((z) => ({
              id: z.id,
              level: z.level,
            }))}
            photoUrl={playerId === "chhetri" ? CHHETRI_STRESS_PHOTO_URL : undefined}
          />
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
              {zoneRisks.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        item.level === "high"
                          ? "bg-destructive"
                          : item.level === "medium"
                          ? "bg-warning"
                          : "bg-success"
                      }`}
                    />
                    <div>
                      <span className="text-xs font-semibold text-foreground">
                        {item.id.replace("_", " ")}
                      </span>
                      <p className="text-[10px] text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      item.level === "high"
                        ? "text-destructive"
                        : item.level === "medium"
                        ? "text-warning"
                        : "text-success"
                    }`}
                  >
                    {item.level}
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
          <div className="relative h-[420px] w-full rounded-xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.45),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(239,68,68,0.45),_transparent_55%)]" />
            <div className="absolute inset-0">
              <SkeletonModel
                className="h-full w-full"
                zones={zoneRisks.map((z) => ({
                  id: z.id,
                  level: z.level,
                }))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold font-display text-foreground mb-2">
          Upload posture or motion for this player
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Upload a side or front view image, or a short motion clip, to run a fresh injury-risk
          analysis for this player using OpenCV + NVIDIA meta/llama-3.3-70b-instruct.
        </p>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handlePostureUpload}
          className="block w-full text-xs text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
        />
        {injuryError && (
          <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2">
            <p className="text-[11px] text-destructive">{injuryError}</p>
          </div>
        )}
        {posturePreview && (
          <div className="mt-4 space-y-3">
            {postureFile && postureFile.type.startsWith("image/") ? (
              <img
                src={posturePreview}
                className="w-full max-h-72 object-contain rounded-xl border border-border/60"
              />
            ) : (
              <video
                src={posturePreview}
                controls
                className="w-full max-h-72 rounded-xl border border-border/60"
              />
            )}
              <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={treatAsBaseline}
                  onChange={(e) => setTreatAsBaseline(e.target.checked)}
                  className="h-3 w-3 rounded border border-input"
                />
                Treat this upload as baseline training (healthy normal movement)
              </label>
            <button
              onClick={handleAnalyzePosture}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
            >
              {injuryLoading ? "Analyzing posture..." : "Analyze injury risk"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerProfile;
