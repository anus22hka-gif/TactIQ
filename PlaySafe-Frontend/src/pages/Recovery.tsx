import { useRef, useEffect } from "react";
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

  const visiblePlayers =
    user.role === "player" && user.id
      ? players.filter((p) => p.id === user.id)
      : players;

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
    </div>
  );
};

export default Recovery;
