import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useDemoUser } from "@/context/DemoUserContext";

const Navbar = () => {
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useDemoUser();

  const navItems =
    user.role === "player"
      ? [
          { to: "/", label: "Home" },
          { to: "/match", label: "Match Overview" },
          { to: user.id ? `/player/${user.id}` : "/login", label: "My Profile" },
          { to: "/recovery", label: "Recovery" },
        ]
      : [
          { to: "/", label: "Home" },
          { to: "/match", label: "Match Overview" },
          { to: "/players", label: "Players" },
          { to: "/strategy", label: "Strategy" },
          { to: "/recovery", label: "Recovery" },
        ];

  useEffect(() => {
    if (!navRef.current) return;
    gsap.fromTo(navRef.current, { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isLanding = location.pathname === "/";

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isLanding ? "bg-transparent" : "bg-background/80 backdrop-blur-xl border-b border-border"
      }`}
      style={{ opacity: 0 }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <NavLink to="/" className="flex items-center gap-2.5">
          <img src="/Logo.png" alt="TactIQ" className="h-8 w-8 rounded-lg" />
          <span className="text-lg font-bold font-display text-foreground">TactIQ</span>
        </NavLink>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </div>
          {user.role && (
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${
                user.role === "coach"
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-400/30"
              }`}
            >
              {user.role === "coach" ? "Coach view" : "Player view"}
            </span>
          )}
        </div>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-6 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
