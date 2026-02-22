import { useRef, useEffect } from "react";
import gsap from "gsap";
import { AlertTriangle, Info, Shield } from "lucide-react";

interface Alert {
  id: number;
  type: "warning" | "danger" | "info";
  message: string;
  time: string;
  player: string;
}

const alerts: Alert[] = [
  { id: 1, type: "danger", message: "Left knee valgus deviation +14% during defensive sprints. Recommend substitution evaluation.", time: "78'", player: "J. Martinez" },
  { id: 2, type: "warning", message: "Asymmetric deceleration pattern detected. Right ankle load 9.2% above baseline.", time: "65'", player: "A. Diallo" },
  { id: 3, type: "info", message: "Movement baseline updated. Sprint recovery improved 0.4s over last 3 sessions.", time: "52'", player: "R. Kim" },
  { id: 4, type: "warning", message: "High-speed deceleration events during pressing phase exceeded session limit.", time: "55'", player: "L. Chen" },
];

const iconMap = { danger: AlertTriangle, warning: Shield, info: Info };
const colorMap = { danger: "border-destructive/40 bg-destructive/5", warning: "border-warning/40 bg-warning/5", info: "border-primary/40 bg-primary/5" };
const iconColor = { danger: "text-destructive", warning: "text-warning", info: "text-primary" };

const AlertsFeed = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });

    itemsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(el,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.5, delay: 0.3 + i * 0.12, ease: "power3.out" }
      );
    });
  }, []);

  return (
    <div ref={containerRef} className="glass-card rounded-xl p-6" style={{ opacity: 0 }}>
      <h3 className="text-sm font-semibold font-display text-foreground mb-4">Risk Alerts</h3>
      <div className="space-y-3">
        {alerts.map((alert, i) => {
          const Icon = iconMap[alert.type];
          return (
            <div
              key={alert.id}
              ref={(el) => { itemsRef.current[i] = el; }}
              className={`flex gap-3 rounded-lg border p-3 ${colorMap[alert.type]}`}
              style={{ opacity: 0 }}
            >
              <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${iconColor[alert.type]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-foreground">{alert.player}</span>
                  <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{alert.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertsFeed;
