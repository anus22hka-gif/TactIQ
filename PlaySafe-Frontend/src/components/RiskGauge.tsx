import { useRef, useEffect } from "react";
import gsap from "gsap";

interface RiskGaugeProps {
  score: number;
  label: string;
  size?: "sm" | "lg";
}

const getColor = (score: number) => {
  if (score < 35) return "hsl(152, 70%, 45%)";
  if (score < 65) return "hsl(36, 100%, 55%)";
  return "hsl(0, 72%, 55%)";
};

const getLabel = (score: number) => {
  if (score < 35) return "Low";
  if (score < 65) return "Moderate";
  return "High";
};

const RiskGauge = ({ score, label, size = "lg" }: RiskGaugeProps) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const color = getColor(score);
  const radius = size === "lg" ? 58 : 36;
  const strokeWidth = size === "lg" ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2;

  useEffect(() => {
    if (circleRef.current) {
      gsap.fromTo(circleRef.current,
        { strokeDashoffset: circumference },
        { strokeDashoffset: circumference - progress, duration: 1.4, delay: 0.3, ease: "power3.out" }
      );
    }
    if (valueRef.current) {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: score,
        duration: 1.4,
        delay: 0.3,
        ease: "power2.out",
        onUpdate: () => {
          if (valueRef.current) valueRef.current.textContent = String(Math.round(obj.val));
        },
      });
    }
  }, [score, circumference, progress]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke="hsl(220, 14%, 18%)"
            strokeWidth={strokeWidth}
          />
          <circle
            ref={circleRef}
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            ref={valueRef}
            className={`font-display font-bold ${size === "lg" ? "text-2xl" : "text-lg"}`}
            style={{ color }}
          >
            0
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{getLabel(score)}</span>
        </div>
      </div>
      <p className="mt-2 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
};

export default RiskGauge;
