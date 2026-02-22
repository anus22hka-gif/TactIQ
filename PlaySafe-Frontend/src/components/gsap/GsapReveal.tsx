import { useRef, useEffect, ReactNode } from "react";
import gsap from "gsap";

interface GsapRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
  duration?: number;
  className?: string;
}

const GsapReveal = ({ children, delay = 0, direction = "up", duration = 0.7, className = "" }: GsapRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const from: gsap.TweenVars = { opacity: 0, duration, delay, ease: "power3.out" };
    if (direction === "up") { from.y = 30; }
    if (direction === "left") { from.x = -40; }
    if (direction === "right") { from.x = 40; }
    if (direction === "scale") { from.scale = 0.9; }

    gsap.fromTo(el, from, {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      duration,
      delay,
      ease: "power3.out",
    });
  }, [delay, direction, duration]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
};

export default GsapReveal;
