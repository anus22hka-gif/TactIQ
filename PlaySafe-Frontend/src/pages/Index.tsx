import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Index = () => {
  const [video, setVideo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [playerId, setPlayerId] = useState<string>("player_001");

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!video) return alert("Upload a video first");

    const formData = new FormData();
    formData.append("player_id", playerId);
    formData.append("file", video);

    try {
      setLoading(true);
      const response = await fetch(
        "http://127.0.0.1:8000/analyze-match/",
        { method: "POST", body: formData }
      );
      const data = await response.json();
      setResult(data);
    } catch {
      alert("Backend error");
    } finally {
      setLoading(false);
    }
  };

  const teamA = result?.teamA;
  const teamB = result?.teamB;

  const goalA = teamA?.goal_probability
    ? teamA.goal_probability * 100
    : 0;

  const goalB = teamB?.goal_probability
    ? teamB.goal_probability * 100
    : 0;

  const confidence = result?.model_confidence
    ? result.model_confidence * 100
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Match Overview
          </p>
          <h1 className="mt-1.5 text-3xl font-bold font-display text-foreground tracking-tight">
            TactIQ Tactical Intelligence
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            Upload a match video to analyze formations, momentum, and risk in real time.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold font-display text-foreground">
                Upload match video
              </h2>
              <p className="text-xs text-muted-foreground">
                Attach the latest match and assign it to a player.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              placeholder="Enter Player ID"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50"
            />
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="block w-full text-xs text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
            />
          </div>

          {previewUrl && (
            <div className="mt-4 space-y-3">
              <video
                src={previewUrl}
                controls
                className="w-full rounded-xl shadow-lg"
              />
              <button
                onClick={handleAnalyze}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
              >
                {loading ? "Analyzing..." : "Analyze match"}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold font-display text-foreground mb-3">
              Session summary
            </h3>
            <p className="text-xs text-muted-foreground">
              After analysis, this panel surfaces formation, momentum, and risk
              highlights for the selected player and opponent.
            </p>
            {result && (
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-primary/10 px-3 py-2">
                  <p className="text-muted-foreground">Team A formation</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {teamA?.formation_label || teamA?.formation || "N/A"}
                  </p>
                </div>
                <div className="rounded-lg bg-primary/10 px-3 py-2">
                  <p className="text-muted-foreground">Team B formation</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {teamB?.formation_label || teamB?.formation || "N/A"}
                  </p>
                </div>
                <div className="rounded-lg bg-primary/10 px-3 py-2">
                  <p className="text-muted-foreground">Model confidence</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {confidence.toFixed(0)}%
                  </p>
                </div>
                <div className="rounded-lg bg-muted px-3 py-2">
                  <p className="text-muted-foreground">Team A goal %</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {goalA.toFixed(0)}%
                  </p>
                </div>
                <div className="rounded-lg bg-muted px-3 py-2">
                  <p className="text-muted-foreground">Team B goal %</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {goalB.toFixed(0)}%
                  </p>
                </div>
                {teamA?.strategy_label && (
                  <div className="rounded-lg bg-muted px-3 py-2 col-span-2">
                    <p className="text-muted-foreground">Strategy insight</p>
                    <p className="mt-1 text-xs font-medium text-foreground">
                      {teamA.strategy_label}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {result && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold font-display text-foreground mb-3">
              Team comparison
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={[
                  {
                    metric: "Goal %",
                    TeamA: goalA,
                    TeamB: goalB,
                  },
                  {
                    metric: "Tactical Score",
                    TeamA: teamA?.tactical_score * 100 || 0,
                    TeamB: teamB?.tactical_score * 100 || 0,
                  },
                  {
                    metric: "Possession",
                    TeamA: teamA?.possession_rate * 100 || 0,
                    TeamB: teamB?.possession_rate * 100 || 0,
                  },
                  {
                    metric: "Pressing",
                    TeamA: teamA?.pressing_intensity * 100 || 0,
                    TeamB: teamB?.pressing_intensity * 100 || 0,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="TeamA" fill="#22c55e" />
                <Bar dataKey="TeamB" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold font-display text-foreground">
              Tactical trend
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={[
                  { name: "Start", A: goalA * 0.6, B: goalB * 0.6 },
                  { name: "Mid", A: goalA * 0.8, B: goalB * 0.8 },
                  { name: "End", A: goalA, B: goalB },
                ]}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="A" stroke="#22c55e" strokeWidth={3} />
                <Line type="monotone" dataKey="B" stroke="#ec4899" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>

            {result?.processed_video_path && (
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                  Annotated match output
                </h4>
                <video
                  controls
                  className="w-full rounded-xl shadow-lg"
                  src={`http://127.0.0.1:8000/${result.processed_video_path}`}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
