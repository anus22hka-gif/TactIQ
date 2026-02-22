import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealOptions {
  direction?: "up" | "left" | "right" | "scale";
  delay?: number;
  duration?: number;
  stagger?: number;
  children?: boolean;
}

export function useScrollReveal<T extends HTMLElement>(options: ScrollRevealOptions = {}) {
  const ref = useRef<T>(null);
  const { direction = "up", delay = 0, duration = 0.8, stagger = 0, children = false } = options;

  useEffect(() => {
    if (!ref.current) return;

    const fromVars: gsap.TweenVars = { opacity: 0 };
    if (direction === "up") fromVars.y = 40;
    if (direction === "left") fromVars.x = -50;
    if (direction === "right") fromVars.x = 50;
    if (direction === "scale") { fromVars.scale = 0.92; fromVars.y = 20; }

    const toVars: gsap.TweenVars = {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      duration,
      delay,
      ease: "power3.out",
      stagger: stagger || undefined,
      scrollTrigger: {
        trigger: ref.current,
        start: "top 88%",
        end: "bottom 20%",
        toggleActions: "play none none none",
      },
    };

    const target = children ? ref.current.children : ref.current;
    gsap.fromTo(target, fromVars, toVars);

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [direction, delay, duration, stagger, children]);

  return ref;
}
