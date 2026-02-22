import { useRef, useEffect } from "react";
import gsap from "gsap";

interface GsapStaggerProps {
  children: React.ReactNode[];
  stagger?: number;
  delay?: number;
  className?: string;
}

const GsapStagger = ({ children, stagger = 0.1, delay = 0.1, className = "" }: GsapStaggerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const items = containerRef.current.children;
    gsap.fromTo(
      items,
      { opacity: 0, y: 24, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger,
        delay,
        ease: "power3.out",
      }
    );
  }, [stagger, delay]);

  return (
    <div ref={containerRef} className={className}>
      {children.map((child, i) => (
        <div key={i} style={{ opacity: 0 }}>
          {child}
        </div>
      ))}
    </div>
  );
};

export default GsapStagger;
