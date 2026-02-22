export async function uploadBaseline(file: File, playerId: string) {
  const formData = new FormData();
  formData.append("player_id", playerId);
  formData.append("file", file);

  const response = await fetch("http://127.0.0.1:8000/upload-baseline/", {
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

  const response = await fetch("http://127.0.0.1:8000/analyze-match/", {
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
