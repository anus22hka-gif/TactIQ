const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function uploadBaseline(file: File, playerId: string) {
  const formData = new FormData();
  formData.append("player_id", playerId);
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/upload-baseline/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Upload error:", errorText);
    throw new Error("Baseline upload failed");
  }

  return await response.json();
}


export async function analyzeMatch(file: File, playerId: string) {
  const formData = new FormData();
  formData.append("player_id", playerId);
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/analyze-match/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Analyze error:", errorText);
    throw new Error("Match analysis failed");
  }

  return await response.json();
}
