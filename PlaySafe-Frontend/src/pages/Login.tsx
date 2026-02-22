import { useDemoUser } from "@/context/DemoUserContext";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const { user, setCoachDemo, setPlayerDemo } = useDemoUser();
  const navigate = useNavigate();

  const handleCoach = () => {
    setCoachDemo();
    navigate("/match");
  };

  const handlePlayer = () => {
    setPlayerDemo();
    navigate("/player/martinez");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#020817] to-[#020617] text-white flex items-center justify-center px-6">
      <div className="max-w-4xl w-full mx-auto grid gap-10 md:grid-cols-[1.1fr_1fr] items-center">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/Logo.png" alt="TactIQ" className="h-9 w-9 rounded-lg" />
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-green-400">
                TactIQ
              </p>
              <p className="text-lg font-bold leading-tight">Sports Intelligence</p>
            </div>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-display leading-tight">
            Choose how you want to explore TactIQ.
          </h1>
          <p className="mt-3 text-sm text-gray-400 max-w-md">
            Jump into a coach view with full team oversight or experience TactIQ
            as an individual player tracking their own risk and recovery.
          </p>
          {user.role && (
            <p className="mt-4 text-xs text-gray-400">
              Current demo role:{" "}
              <span className="font-semibold text-green-400">
                {user.role === "coach" ? "Coach" : "Player"}
              </span>
            </p>
          )}
        </div>
        <div className="space-y-4">
          <button
            className="w-full rounded-2xl bg-green-500 px-4 py-4 text-left text-sm font-semibold text-black shadow-[0_18px_45px_rgba(22,163,74,0.45)] transition-transform hover:scale-[1.01]"
            onClick={handleCoach}
          >
            <div className="flex items-center justify-between">
              <span>Coach demo</span>
              <span className="text-xs bg-black/10 rounded-full px-3 py-1">
                Full squad + match insights
              </span>
            </div>
            <p className="mt-2 text-xs text-black/80">
              View all players, process match videos, and explore tactical and
              injury risk analytics for the entire team.
            </p>
          </button>
          <button
            className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-4 text-left text-sm font-semibold text-white hover:border-green-400/60 transition-all"
            onClick={handlePlayer}
          >
            <div className="flex items-center justify-between">
              <span>Player demo</span>
              <span className="text-xs bg-white/5 rounded-full px-3 py-1">
                Personal risk and recovery
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-300">
              Experience TactIQ as a single player, with focused insights on
              injury risk, workload, and recovery guidance.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

