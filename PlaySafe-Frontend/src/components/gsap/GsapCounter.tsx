import { useRef, useEffect } from "react";
import gsap from "gsap";

interface GsapCounterProps {
  target: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}

const GsapCounter = ({ target, duration = 1.5, delay = 0.3, suffix = "", prefix = "", decimals = 0, className = "" }: GsapCounterProps) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration,
      delay,
      ease: "power2.out",
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = `${prefix}${obj.val.toFixed(decimals)}${suffix}`;
        }
      },
    });
  }, [target, duration, delay, suffix, prefix, decimals]);

  return <span ref={ref} className={className}>{prefix}0{suffix}</span>;
};

export default GsapCounter;
