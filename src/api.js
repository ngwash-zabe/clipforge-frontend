// ============================================================
// ClipForge API Service — connects frontend to HF Spaces backend
// Add this file to your React project: src/api.js
// ============================================================

const API = import.meta.env.VITE_API_URL || "https://shonkazee-clipforge-backend.hf.space";

// ── Health check ────────────────────────────────────────────
export async function checkHealth() {
  const res = await fetch(`${API}/health`);
  return res.json();
}

// ── Upload a video file ──────────────────────────────────────
export async function uploadVideo(file, userId, niche = "general", clipCount = 10) {
  const form = new FormData();
  form.append("file", file);
  form.append("user_id", userId);
  form.append("niche", niche);
  form.append("clip_count", clipCount);
  const res = await fetch(`${API}/process/upload`, { method: "POST", body: form });
  return res.json(); // { job_id, status }
}

// ── Process a URL ────────────────────────────────────────────
export async function processURL(url, userId, niche = "general", clipCount = 10) {
  const res = await fetch(`${API}/process/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, user_id: userId, niche, clip_count: clipCount }),
  });
  return res.json(); // { job_id, status }
}

// ── Poll job status (call every 2 seconds) ───────────────────
export async function getJobStatus(jobId) {
  const res = await fetch(`${API}/job/${jobId}`);
  return res.json();
  // Returns: { status, stage, stage_label, progress, clips, growth }
  // status values: "queued" | "processing" | "done" | "error"
}

// ── Get growth strategy ──────────────────────────────────────
export async function getGrowthStrategy(userId, niche, platforms = ["TikTok", "Instagram", "YouTube"]) {
  const res = await fetch(`${API}/growth/strategy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, niche, platforms }),
  });
  return res.json();
}

// ── Chat with AI coach ───────────────────────────────────────
export async function chatWithCoach(userId, niche, message, context = "") {
  const res = await fetch(`${API}/growth/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, niche, message, context }),
  });
  return res.json(); // { reply }
}

// ── Get algorithm intel ──────────────────────────────────────
export async function getAlgorithmIntel() {
  const res = await fetch(`${API}/growth/algorithm-intel`);
  return res.json();
}

// ── Schedule a post ──────────────────────────────────────────
export async function schedulePost(userId, clipId, platform, scheduledTime, caption = "", hashtags = []) {
  const res = await fetch(`${API}/schedule/post`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, clip_id: clipId, platform, scheduled_time: scheduledTime, caption, hashtags }),
  });
  return res.json();
}

// ── Download clip URL ────────────────────────────────────────
export async function getDownloadURL(clipId) {
  const res = await fetch(`${API}/clip/download/${clipId}`);
  return res.json(); // { download_url }
}

// ── Polling helper — use this in your Upload component ───────
// Usage:
//   const job = await uploadVideo(file, userId);
//   const result = await pollUntilDone(job.job_id, (progress) => setProgress(progress));
//   setClips(result.clips);
export async function pollUntilDone(jobId, onProgress) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const job = await getJobStatus(jobId);
        if (onProgress) onProgress(job);
        if (job.status === "done") {
          clearInterval(interval);
          resolve(job);
        } else if (job.status === "error") {
          clearInterval(interval);
          reject(new Error(job.error || "Processing failed"));
        }
      } catch (e) {
        clearInterval(interval);
        reject(e);
      }
    }, 2000); // Poll every 2 seconds
  });
}
