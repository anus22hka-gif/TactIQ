import { useRef, useEffect } from "react";
import gsap from "gsap";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  variant?: "default" | "primary" | "warning" | "danger";
}

const variantStyles = {
  default: "glass-card",
  primary: "glass-card glow-primary",
  warning: "glass-card glow-accent",
  danger: "glass-card border-destructive/30",
};

const iconVariant = {
  default: "bg-secondary text-foreground",
  primary: "gradient-primary text-primary-foreground",
  warning: "gradient-accent text-accent-foreground",
  danger: "bg-destructive/20 text-destructive",
};

const StatCard = ({ title, value, subtitle, icon: Icon, trend, variant = "default" }: StatCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" }
    );

    // Hover glow effect
    const el = cardRef.current;
    const onEnter = () => gsap.to(el, { scale: 1.02, duration: 0.3, ease: "power2.out" });
    const onLeave = () => gsap.to(el, { scale: 1, duration: 0.3, ease: "power2.out" });
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  useEffect(() => {
    if (!valueRef.current) return;
    const num = parseFloat(value);
    if (isNaN(num)) {
      gsap.fromTo(valueRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.3 });
      return;
    }
    const suffix = value.replace(/[\d.]/g, "");
    const obj = { val: 0 };
    gsap.to(obj, {
      val: num,
      duration: 1.4,
      delay: 0.2,
      ease: "power2.out",
      onUpdate: () => {
        if (valueRef.current) {
          valueRef.current.textContent = `${Number.isInteger(num) ? Math.round(obj.val) : obj.val.toFixed(1)}${suffix}`;
        }
      },
    });
  }, [value]);

  return (
    <div ref={cardRef} className={`rounded-xl p-5 cursor-default ${variantStyles[variant]}`} style={{ opacity: 0 }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p ref={valueRef} className="mt-2 text-3xl font-bold font-display text-foreground">0</p>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          {trend && (
            <p className={`mt-2 text-xs font-medium ${trend.positive ? "text-success" : "text-destructive"}`}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconVariant[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
