import { useRef, useEffect } from "react";
import gsap from "gsap";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { min: "0'", fatigue: 10, risk: 5 },
  { min: "10'", fatigue: 18, risk: 8 },
  { min: "20'", fatigue: 25, risk: 14 },
  { min: "30'", fatigue: 35, risk: 22 },
  { min: "40'", fatigue: 42, risk: 30 },
  { min: "HT", fatigue: 30, risk: 20 },
  { min: "50'", fatigue: 38, risk: 25 },
  { min: "60'", fatigue: 52, risk: 40 },
  { min: "70'", fatigue: 65, risk: 55 },
  { min: "80'", fatigue: 78, risk: 68 },
  { min: "90'", fatigue: 85, risk: 72 },
];

const FatigueChart = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { opacity: 0, y: 30, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, delay: 0.2, ease: "power3.out" }
    );
  }, []);

  return (
    <div ref={ref} className="glass-card rounded-xl p-6" style={{ opacity: 0 }}>
      <h3 className="text-sm font-semibold font-display text-foreground mb-1">Fatigue & Injury Risk Over Time</h3>
      <p className="text-xs text-muted-foreground mb-4">Team aggregate load progression</p>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="fatigueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
          <XAxis dataKey="min" tick={{ fontSize: 10, fill: "hsl(215, 12%, 52%)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(215, 12%, 52%)" }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              background: "hsl(220, 18%, 10%)",
              border: "1px solid hsl(220, 14%, 18%)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "hsl(210, 20%, 92%)",
            }}
          />
          <Area type="monotone" dataKey="fatigue" stroke="hsl(187, 100%, 50%)" fill="url(#fatigueGrad)" strokeWidth={2} name="Fatigue" />
          <Area type="monotone" dataKey="risk" stroke="hsl(0, 72%, 55%)" fill="url(#riskGrad)" strokeWidth={2} name="Injury Risk" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FatigueChart;
