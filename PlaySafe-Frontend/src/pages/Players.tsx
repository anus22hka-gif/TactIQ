import { useRef, useEffect } from "react";
import gsap from "gsap";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useDemoUser } from "@/context/DemoUserContext";

const players = [
  { id: "martinez", name: "J. Martinez", number: 10, position: "Forward", age: 26, risk: 72, riskLevel: "High", image: "JM" },
  { id: "chen", name: "L. Chen", number: 8, position: "Midfielder", age: 24, risk: 34, riskLevel: "Low", image: "LC" },
  { id: "diallo", name: "A. Diallo", number: 4, position: "Defender", age: 28, risk: 56, riskLevel: "Medium", image: "AD" },
  { id: "kim", name: "R. Kim", number: 1, position: "Goalkeeper", age: 30, risk: 18, riskLevel: "Low", image: "RK" },
  { id: "silva", name: "M. Silva", number: 7, position: "Winger", age: 22, risk: 45, riskLevel: "Medium", image: "MS" },
  { id: "johnson", name: "T. Johnson", number: 5, position: "Defender", age: 27, risk: 61, riskLevel: "High", image: "TJ" },
  { id: "okafor", name: "C. Okafor", number: 9, position: "Forward", age: 25, risk: 38, riskLevel: "Low", image: "CO" },
  { id: "mueller", name: "F. Mueller", number: 6, position: "Midfielder", age: 29, risk: 52, riskLevel: "Medium", image: "FM" },
];

const riskColor = (level: string) => {
  if (level === "High") return "text-destructive bg-destructive/10 border-destructive/20";
  if (level === "Medium") return "text-warning bg-warning/10 border-warning/20";
  return "text-success bg-success/10 border-success/20";
};

const riskBarColor = (level: string) => {
  if (level === "High") return "bg-destructive";
  if (level === "Medium") return "bg-warning";
  return "bg-success";
};

const Players = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useDemoUser();

  useEffect(() => {
    if (user.role === "player" && user.id) {
      navigate(`/player/${user.id}`, { replace: true });
      return;
    }

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
      }
      if (gridRef.current) {
        gsap.fromTo(gridRef.current.children,
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.08, duration: 0.5, ease: "power3.out", delay: 0.2 }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
      <div ref={headerRef} style={{ opacity: 0 }}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Squad</p>
        <h1 className="mt-1.5 text-3xl font-bold font-display text-foreground tracking-tight">Player Profiles</h1>
        <p className="mt-1 text-sm text-muted-foreground">Select a player to view their detailed analysis and biomechanical data.</p>
      </div>

      <div ref={gridRef} className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {players.map((p) => (
          <Link
            key={p.id}
            to={`/player/${p.id}`}
            className="glass-card rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group block"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-primary-foreground font-bold font-display text-sm">
                {p.image}
              </div>
              <div>
                <h3 className="text-sm font-semibold font-display text-foreground">{p.name}</h3>
                <p className="text-xs text-muted-foreground">#{p.number} · {p.position}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Age: {p.age}</span>
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${riskColor(p.riskLevel)}`}>
                  {p.riskLevel} Risk
                </span>
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-muted-foreground">Injury Risk</span>
                  <span className="font-semibold text-foreground">{p.risk}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${riskBarColor(p.riskLevel)} transition-all`} style={{ width: `${p.risk}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              View Profile <ArrowRight className="h-3 w-3 ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Players;
