import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Activity,
  Brain,
  HeartPulse,
  Shield,
  Zap,
  BarChart3,
  Sparkles,
} from "lucide-react";
import ParticleField from "@/components/webgl/ParticleField";
import soccarImg from "./soccar.png";
import shoes from "./shoes.png";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Activity,
    title: "Real-Time Tracking",
    desc: "Monitor player biomechanics, sprint loads, and fatigue in real-time during matches.",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    desc: "Machine learning models predict injury risk and suggest tactical adjustments.",
  },
  {
    icon: Shield,
    title: "Injury Prevention",
    desc: "Identify stress patterns before they lead to injuries with 3D biomechanical analysis.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    desc: "Detailed dashboards for match analysis, player comparisons, and trend tracking.",
  },
  {
    icon: HeartPulse,
    title: "Recovery Optimization",
    desc: "Personalized recovery protocols based on workload data and physiological markers.",
  },
  {
    icon: Zap,
    title: "Strategy Simulator",
    desc: "Test tactical formations and predict outcomes before stepping on the pitch.",
  },
];

const steps = [
  {
    num: "01",
    title: "Connect Sensors",
    desc: "Wearable GPS and IMU sensors capture movement data during training and matches.",
  },
  {
    num: "02",
    title: "AI Processes Data",
    desc: "Our models analyze biomechanics, fatigue patterns, and tactical positioning in real-time.",
  },
  {
    num: "03",
    title: "Get Actionable Insights",
    desc: "Coaches receive alerts, risk scores, and recommendations directly on the dashboard.",
  },
];

const Landing = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroRef.current) {
        const els = heroRef.current.querySelectorAll("[data-anim]");
        gsap.fromTo(
          els,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.2,
          }
        );
      }

      if (featuresRef.current) {
        gsap.fromTo(
          featuresRef.current.querySelectorAll("[data-card]"),
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: featuresRef.current,
              start: "top 80%",
            },
          }
        );
      }

      if (stepsRef.current) {
        gsap.fromTo(
          stepsRef.current.querySelectorAll("[data-step]"),
          { opacity: 0, x: -40 },
          {
            opacity: 1,
            x: 0,
            stagger: 0.2,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: stepsRef.current,
              start: "top 80%",
            },
          }
        );
      }

      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ctaRef.current,
              start: "top 85%",
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative landing-gradient text-white">

      {/* ================= HERO ================= */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

        {/* Background Glow */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-green-500/20 blur-[180px] rounded-full"></div>
        </div>

        {/* Particle Layer */}
        <div className="absolute inset-0 opacity-20">
          <ParticleField />
        </div>

        {/* Hanging Stars */}
        <div className="absolute top-0 right-24 flex flex-col gap-10 z-20">
          <div className="relative w-[2px] h-24 bg-white/20">
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-green-400 rounded-full shadow-[0_0_20px_rgba(74,222,128,0.8)] animate-pulse"></div>
          </div>
          <div className="relative w-[2px] h-28 bg-white/20 ml-6">
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-green-400 rounded-full shadow-[0_0_25px_rgba(74,222,128,0.8)] animate-pulse"></div>
          </div>
        </div>

        <div
          ref={heroRef}
          className="relative z-30 max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-12 items-center pt-24"
        >

          {/* LEFT CONTENT */}
          <div>

            <div
              data-anim
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 mb-6"
            >
              <Sparkles className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs font-semibold tracking-wide text-green-300">
                AI-POWERED SPORTS ANALYTICS
              </span>
            </div>

            <h1
              data-anim
              className="text-5xl lg:text-6xl font-bold leading-tight"
            >
              Smarter Decisions.
              <br />
              <span className="text-green-400 drop-shadow-[0_0_12px_rgba(74,222,128,0.8)]">
                Safer Athletes.
              </span>
            </h1>

            <p
              data-anim
              className="mt-6 text-lg text-white/80 max-w-lg leading-relaxed"
            >
              TactIQ uses AI and biomechanical analysis to predict injuries,
              optimize performance, and provide real-time tactical intelligence.
            </p>

            <div data-anim className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/login"
                className="group relative inline-flex items-center gap-2 bg-green-500 px-8 py-3.5 rounded-lg text-sm font-semibold transition-all hover:scale-105"
              >
                <span className="absolute inset-0 rounded-lg bg-green-400 blur-md opacity-40 group-hover:opacity-70 transition-all"></span>
                <span className="relative z-10 flex items-center gap-2">
                  Explore Dashboard
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                to="/players"
                className="inline-flex items-center gap-2 border border-white/30 px-8 py-3.5 rounded-lg text-sm font-semibold hover:bg-white/10 transition-all"
              >
                View Players
              </Link>
            </div>

            {/* Stats */}
            <div data-anim className="mt-16 flex gap-10">
              {[
                { val: "99.2%", label: "Accuracy" },
                { val: "50ms", label: "Latency" },
                { val: "2.4K+", label: "Athletes" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-green-400 drop-shadow-[0_0_12px_rgba(74,222,128,0.7)]">
                    {s.val}
                  </p>
                  <p className="text-sm text-white/70 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE IMAGES */}
          <div className="relative flex justify-center items-center">

            {/* Glow Aura */}
            <div className="absolute w-[400px] h-[400px] bg-green-400/30 blur-[120px] rounded-full animate-pulse"></div>

            <img
              src={soccarImg}
              alt="football"
              className="relative w-[320px] object-contain drop-shadow-2xl z-10 animate-[float_6s_ease-in-out_infinite]"
            />

            <img
              src={shoes}
              alt="boots"
              className="absolute bottom-0 left-10 w-[280px] object-contain drop-shadow-2xl z-10"
            />
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section
        ref={featuresRef}
        className="py-24 px-6"
      >
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-white/70 max-w-lg mx-auto">
              Comprehensive tools for performance analysis, injury prevention, and tactical optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                data-card
                className="rounded-xl p-6 bg-white/5 border border-white/10 hover:border-green-400/40 transition-all"
              >
                <f.icon className="h-6 w-6 text-green-400 mb-4" />
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-white/70">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STEPS ================= */}
      <section ref={stepsRef} className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">Three Simple Steps</h2>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {steps.map((s) => (
            <div
              key={s.num}
              data-step
              className="flex items-start gap-6 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-green-400/40 transition-all"
            >
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-green-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(74,222,128,0.7)]">
                {s.num}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-white/70">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section ref={ctaRef} className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-12">

            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Transform Your Team?
            </h2>

            <p className="text-white/70 mb-8">
              Start using AI-powered analytics to keep your athletes safe and performing at their best.
            </p>

            <Link
              to="/login"
              className="group relative inline-flex items-center gap-2 bg-green-500 px-8 py-3.5 rounded-lg text-sm font-semibold transition-all hover:scale-105"
            >
              <span className="absolute inset-0 rounded-lg bg-green-400 blur-md opacity-40 group-hover:opacity-70 transition-all"></span>
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

          </div>
        </div>

      </section>

      {/* ================= FOOTER ================= */}
      <footer className="relative text-gray-300 pt-16 pb-8 overflow-hidden">

        {/* Background Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-green-500/10 blur-[180px] rounded-full"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">

          {/* Logo Section */}
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wide">
              Tact
              <span className="text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.7)]">
                {" "}IQ
              </span>
            </h2>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              Real-time football performance analytics powered by artificial intelligence.
              Smarter decisions. Better performance. Winning insights.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-green-400 transition-all">Dashboard</a></li>
              <li><a href="#" className="hover:text-green-400 transition-all">Match Analysis</a></li>
              <li><a href="#" className="hover:text-green-400 transition-all">Team Insights</a></li>
              <li><a href="#" className="hover:text-green-400 transition-all">Pricing</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-green-400 transition-all">Documentation</a></li>
              <li><a href="#" className="hover:text-green-400 transition-all">API Access</a></li>
              <li><a href="#" className="hover:text-green-400 transition-all">Support</a></li>
              <li><a href="#" className="hover:text-green-400 transition-all">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-green-500/20 transition-all shadow-[0_0_15px_rgba(74,222,128,0.3)] hover:shadow-[0_0_25px_rgba(74,222,128,0.6)]">
                <span className="text-sm">X</span>
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-green-500/20 transition-all shadow-[0_0_15px_rgba(74,222,128,0.3)] hover:shadow-[0_0_25px_rgba(74,222,128,0.6)]">
                <span className="text-sm">IG</span>
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-green-500/20 transition-all shadow-[0_0_15px_rgba(74,222,128,0.3)] hover:shadow-[0_0_25px_rgba(74,222,128,0.6)]">
                <span className="text-sm">LN</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="relative mt-12 border-t border-white/10 pt-6 text-center text-sm text-gray-500">
          ©️ {new Date().getFullYear()} TactIQ. All rights reserved.
        </div>

      </footer>
      {/* ================= END FOOTER ================= */}

    </div>
  );
};

export default Landing;
