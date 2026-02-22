import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HeartPulse, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import StatCard from "@/components/StatCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useDemoUser } from "@/context/DemoUserContext";

gsap.registerPlugin(ScrollTrigger);

const weeklyLoad = [
  { day: "Mon", load: 85, limit: 90 },
  { day: "Tue", load: 72, limit: 90 },
  { day: "Wed", load: 45, limit: 90 },
  { day: "Thu", load: 92, limit: 90 },
  { day: "Fri", load: 68, limit: 90 },
  { day: "Sat", load: 95, limit: 90 },
  { day: "Sun", load: 30, limit: 90 },
];

const players = [
  { id: "martinez", name: "J. Martinez", recovery: 54, status: "caution", readiness: "Below optimal" },
  { id: "diallo", name: "A. Diallo", recovery: 72, status: "moderate", readiness: "Moderate" },
  { id: "chen", name: "L. Chen", recovery: 88, status: "good", readiness: "Match ready" },
  { id: "kim", name: "R. Kim", recovery: 95, status: "good", readiness: "Fully recovered" },
  { id: "santos", name: "M. Santos", recovery: 62, status: "caution", readiness: "Light training only" },
];

const statusStyle = {
  good: "text-success bg-success/10",
  moderate: "text-warning bg-warning/10",
  caution: "text-destructive bg-destructive/10",
};

const Recovery = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const readinessRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { user } = useDemoUser();

  const [postureFile, setPostureFile] = useState<File | null>(null);
  const [posturePreview, setPosturePreview] = useState<string | null>(null);
  const [injuryResult, setInjuryResult] = useState<any>(null);
  const [injuryLoading, setInjuryLoading] = useState(false);
  const [injuryError, setInjuryError] = useState<string | null>(null);

  const visiblePlayers =
    user.role === "player" && user.id
      ? players.filter((p) => p.id === user.id)
      : players;

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
    const formData = new FormData();
    formData.append("player_id", user.id || "player_demo");
    formData.append("file", postureFile);
    try {
      setInjuryLoading(true);
      setInjuryError(null);
      const res = await fetch("http://127.0.0.1:8000/analyze-posture/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setInjuryResult(data);
      if (data.status !== "success") {
        setInjuryError(data.message || "No pose detected in the uploaded media.");
      }
    } catch (e) {
      setInjuryError("Injury analysis backend error");
    } finally {
      setInjuryLoading(false);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
      }

      if (statsRef.current) {
        gsap.fromTo(statsRef.current.children,
          { opacity: 0, y: 30, scale: 0.93 },
          {
            opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.6, ease: "power3.out",
            scrollTrigger: { trigger: statsRef.current, start: "top 90%", toggleActions: "play none none none" },
          }
        );
      }

      if (chartRef.current) {
        gsap.fromTo(chartRef.current,
          { opacity: 0, y: 45, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out",
            scrollTrigger: { trigger: chartRef.current, start: "top 85%", toggleActions: "play none none none" },
          }
        );
      }

      if (readinessRef.current) {
        gsap.fromTo(readinessRef.current,
          { opacity: 0, x: 30, scale: 0.95 },
          {
            opacity: 1, x: 0, scale: 1, duration: 0.7, ease: "power3.out",
            scrollTrigger: { trigger: readinessRef.current, start: "top 85%", toggleActions: "play none none none" },
          }
        );
      }

      // Animate progress bars
      barsRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(el,
          { width: 0 },
          {
            width: `${visiblePlayers[i].recovery}%`, duration: 1.2, ease: "power3.out",
            scrollTrigger: { trigger: el.parentElement, start: "top 90%", toggleActions: "play none none none" },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-6 pt-24 pb-16">
      <div ref={headerRef} style={{ opacity: 0 }}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Load Management</p>
        <h1 className="mt-1.5 text-3xl font-bold font-display text-foreground tracking-tight">Recovery & Load Monitoring</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track training load, recovery progress, and overtraining warnings</p>
      </div>

      <div ref={statsRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Weekly Load" value="487" subtitle="Cumulative AU" icon={TrendingUp} variant="primary" />
        <StatCard title="Overtraining Risk" value="2" subtitle="Players flagged" icon={AlertTriangle} variant="danger" />
        <StatCard title="Avg Recovery" value="74%" subtitle="Team average" icon={HeartPulse} variant="default" />
        <StatCard title="Match Ready" value="3" subtitle="Players cleared" icon={CheckCircle2} variant="primary" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div ref={chartRef} className="lg:col-span-2 glass-card rounded-xl p-6" style={{ opacity: 0 }}>
          <h3 className="text-sm font-semibold font-display text-foreground mb-1">Weekly Training Load</h3>
          <p className="text-xs text-muted-foreground mb-4">Daily load vs recommended limit (AU)</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyLoad} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(215, 12%, 52%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215, 12%, 52%)" }} axisLine={false} tickLine={false} domain={[0, 110]} />
              <Tooltip
                contentStyle={{
                  background: "hsl(220, 18%, 10%)",
                  border: "1px solid hsl(220, 14%, 18%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(210, 20%, 92%)",
                }}
              />
              <Bar dataKey="load" radius={[4, 4, 0, 0]} name="Load">
                {weeklyLoad.map((entry, index) => (
                  <Cell key={index} fill={entry.load > entry.limit ? "hsl(0, 72%, 55%)" : "hsl(187, 100%, 50%)"} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div ref={readinessRef} className="glass-card rounded-xl p-6" style={{ opacity: 0 }}>
          <h3 className="text-sm font-semibold font-display text-foreground mb-4">Player Readiness</h3>
          <div className="space-y-3">
            {visiblePlayers.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold font-display text-foreground">
                    {p.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.readiness}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      ref={(el) => { barsRef.current[i] = el; }}
                      className="h-full rounded-full"
                      style={{
                        width: 0,
                        background:
                          p.recovery >= 80
                            ? "hsl(152, 70%, 45%)"
                            : p.recovery >= 65
                            ? "hsl(36, 100%, 55%)"
                            : "hsl(0, 72%, 55%)",
                      }}
                    />
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyle[p.status as keyof typeof statusStyle]}`}>
                    {p.recovery}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold font-display text-foreground mb-2">
            Upload posture or motion
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Player or coach can upload a posture image or short motion clip for injury-risk analysis.
          </p>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handlePostureUpload}
            className="block w-full text-xs text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
          />
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
              <button
                onClick={handleAnalyzePosture}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
              >
                {injuryLoading ? "Analyzing posture..." : "Analyze injury risk"}
              </button>
            </div>
          )}
        </div>

        {injuryError && (
          <div className="glass-card rounded-xl p-4 border border-destructive/40 bg-destructive/5">
            <p className="text-xs text-destructive">{injuryError}</p>
          </div>
        )}

        {injuryResult && injuryResult.status === "success" && (
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-sm font-semibold font-display text-foreground mb-2">
              Injury risk insights
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Analysis powered by vision metrics and meta/llama-3.3-70b-instruct via NVIDIA.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="rounded-lg bg-primary/10 px-3 py-2">
                <p className="text-muted-foreground">Risk score</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {Math.round((injuryResult.injury_analysis?.risk_score || 0) * 100)}%
                </p>
              </div>
              <div className="rounded-lg bg-muted px-3 py-2">
                <p className="text-muted-foreground">Risk level</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {injuryResult.injury_analysis?.risk_level || "n/a"}
                </p>
              </div>
            </div>
            {injuryResult.injury_analysis?.primary_risks?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-foreground mb-1">Primary risks</p>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                  {injuryResult.injury_analysis.primary_risks.map((r: string, idx: number) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {injuryResult.injury_analysis?.recommendations?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">Recommendations</p>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                  {injuryResult.injury_analysis.recommendations.map((r: string, idx: number) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recovery;
