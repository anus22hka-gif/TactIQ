import { useRef, useEffect } from "react";
import gsap from "gsap";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { session: "S1", baseline: 45, current: 44 },
  { session: "S2", baseline: 45, current: 46 },
  { session: "S3", baseline: 45, current: 48 },
  { session: "S4", baseline: 45, current: 50 },
  { session: "S5", baseline: 45, current: 52 },
  { session: "S6", baseline: 45, current: 49 },
  { session: "S7", baseline: 45, current: 55 },
  { session: "S8", baseline: 45, current: 58 },
  { session: "S9", baseline: 45, current: 62 },
  { session: "S10", baseline: 45, current: 60 },
];

const BaselineChart = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { opacity: 0, y: 30, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, delay: 0.15, ease: "power3.out" }
    );
  }, []);

  return (
    <div ref={ref} className="glass-card rounded-xl p-6" style={{ opacity: 0 }}>
      <h3 className="text-sm font-semibold font-display text-foreground mb-1">Baseline vs Current Motion</h3>
      <p className="text-xs text-muted-foreground mb-4">Left knee valgus angle (degrees) over recent sessions</p>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
          <XAxis dataKey="session" tick={{ fontSize: 10, fill: "hsl(215, 12%, 52%)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(215, 12%, 52%)" }} axisLine={false} tickLine={false} domain={[30, 70]} />
          <Tooltip
            contentStyle={{
              background: "hsl(220, 18%, 10%)",
              border: "1px solid hsl(220, 14%, 18%)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "hsl(210, 20%, 92%)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", color: "hsl(215, 12%, 52%)" }} />
          <Line type="monotone" dataKey="baseline" stroke="hsl(187, 100%, 50%)" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Healthy Baseline" />
          <Line type="monotone" dataKey="current" stroke="hsl(0, 72%, 55%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(0, 72%, 55%)" }} name="Current" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BaselineChart;
