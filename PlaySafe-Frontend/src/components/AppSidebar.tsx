import { useRef, useEffect } from "react";
import gsap from "gsap";
import { NavLink, useLocation } from "react-router-dom";
import { User, Brain, HeartPulse, LayoutDashboard } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Match Overview" },
  { to: "/player", icon: User, label: "Player Profile" },
  { to: "/strategy", icon: Brain, label: "Strategy Simulator" },
  { to: "/recovery", icon: HeartPulse, label: "Recovery & Load" },
];

const AppSidebar = () => {
  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sidebarRef.current || !logoRef.current || !navRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(sidebarRef.current, { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6 })
      .fromTo(logoRef.current, { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3")
      .fromTo(navRef.current.children, { opacity: 0, x: -20 }, { opacity: 1, x: 0, stagger: 0.08, duration: 0.4 }, "-=0.2");
  }, []);

  return (
    <aside ref={sidebarRef} className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-sidebar" style={{ opacity: 0 }}>
      <div ref={logoRef} className="flex items-center gap-3 px-6 py-6">
        <img src="/Logo.png" alt="TactIQ" className="h-9 w-9 rounded-lg" />
        <div>
          <h1 className="text-lg font-bold font-display text-foreground">TactIQ</h1>
          <p className="text-[10px] font-medium uppercase tracking-widest text-primary">Sports Intelligence</p>
        </div>
      </div>

      <nav ref={navRef} className="mt-4 flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink key={item.to} to={item.to}>
              <div
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-sidebar-accent text-primary glow-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground hover:translate-x-1"
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                {item.label}
              </div>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="glass-card rounded-lg p-3">
          <p className="text-xs font-medium text-muted-foreground">System Status</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
            <span className="text-xs text-success">All systems operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
