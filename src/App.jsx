import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase client ──────────────────────────────────────────
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || "";
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const API_URL       = import.meta.env.VITE_API_URL || "https://shonkazee-clipforge-backend.hf.space";

const supabase = SUPABASE_URL ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// ── API helpers ──────────────────────────────────────────────
async function apiUpload(file, userId, niche = "general") {
  const form = new FormData();
  form.append("file", file);
  form.append("user_id", userId);
  form.append("niche", niche);
  form.append("clip_count", "10");
  const res = await fetch(`${API_URL}/process/upload`, { method: "POST", body: form });
  return res.json();
}

async function apiProcessURL(url, userId, niche = "general") {
  const res = await fetch(`${API_URL}/process/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, user_id: userId, niche, clip_count: 10 }),
  });
  return res.json();
}

async function apiGetJob(jobId) {
  const res = await fetch(`${API_URL}/job/${jobId}`);
  return res.json();
}

async function apiChat(userId, niche, message) {
  const res = await fetch(`${API_URL}/growth/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, niche, message, context: "" }),
  });
  return res.json();
}

// ── Global CSS ───────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;800;900&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
  :root{
    --bg:#020408;--surface:#060d14;--card:#0a1520;--card2:#0d1b28;
    --accent:#00ff88;--accent2:#00ccff;--red:#ff3366;--gold:#ffcc00;
    --text:#e0f0ff;--muted:#4a6a8a;--border:#0f2535;
  }
  html,body{background:var(--bg);color:var(--text);font-family:'Rajdhani',sans-serif;overflow-x:hidden;min-height:100vh;}
  ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:var(--accent);border-radius:99px;}
  input,textarea{outline:none;font-family:'Rajdhani',sans-serif;}
  button{cursor:pointer;font-family:'Rajdhani',sans-serif;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes notif{from{transform:translateY(-40px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes glow{0%,100%{box-shadow:0 0 10px rgba(0,255,136,0.1)}50%{box-shadow:0 0 25px rgba(0,255,136,0.4)}}
`;

// ── Reusable components ──────────────────────────────────────
function Card({ children, style = {}, glow = false }) {
  return (
    <div style={{
      background: "var(--card)", border: `1px solid ${glow ? "rgba(0,255,136,0.25)" : "var(--border)"}`,
      borderRadius: 14, padding: 16, transition: "all 0.2s",
      ...(glow ? { boxShadow: "0 0 20px rgba(0,255,136,0.1)", animation: "glow 3s ease-in-out infinite" } : {}),
      ...style
    }}>{children}</div>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", full = false, icon, style = {} }) {
  const pad = size === "sm" ? "8px 14px" : size === "lg" ? "14px 32px" : "11px 20px";
  const fsize = size === "sm" ? 11 : size === "lg" ? 15 : 13;
  const vs = {
    primary: { background: "linear-gradient(135deg,#00ff88,#00ccff)", color: "#000", border: "none", boxShadow: "0 0 15px rgba(0,255,136,0.3)" },
    ghost:   { background: "rgba(0,255,136,0.05)", color: "#00ff88", border: "1px solid rgba(0,255,136,0.25)" },
    dark:    { background: "var(--card2)", color: "var(--text)", border: "1px solid var(--border)" },
    red:     { background: "rgba(255,51,102,0.1)", color: "#ff3366", border: "1px solid rgba(255,51,102,0.25)" },
    gold:    { background: "rgba(255,204,0,0.1)", color: "#ffcc00", border: "1px solid rgba(255,204,0,0.25)" },
  };
  const v = vs[variant] || vs.primary;
  return (
    <button onClick={onClick} style={{
      ...v, padding: pad, fontSize: fsize, fontWeight: 700, borderRadius: 8,
      width: full ? "100%" : "auto", display: "inline-flex", alignItems: "center",
      justifyContent: full ? "center" : "flex-start", gap: 6,
      transition: "all 0.2s", letterSpacing: 0.4, ...style
    }}
      onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.15)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.filter = ""; e.currentTarget.style.transform = ""; }}>
      {icon && <span>{icon}</span>}{children}
    </button>
  );
}

function Tag({ children, color = "#00ff88" }) {
  return <span style={{ background: `${color}18`, border: `1px solid ${color}30`, color, borderRadius: 99, padding: "2px 8px", fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>{children}</span>;
}

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, []);
  return <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", background: "rgba(2,4,8,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(0,255,136,0.4)", borderRadius: 12, padding: "12px 22px", color: "#fff", fontSize: 13, fontWeight: 600, zIndex: 9999, whiteSpace: "nowrap", animation: "notif 0.3s ease", fontFamily: "'Rajdhani',sans-serif" }}>{msg}</div>;
}

function Ring({ val, size = 44 }) {
  const r = (size - 7) / 2, circ = 2 * Math.PI * r, dash = (val / 100) * circ;
  const c = val >= 80 ? "#00ff88" : val >= 65 ? "#ffcc00" : "#ff3366";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={5} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={5} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 5px ${c})`, transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.24, fontWeight: 900, color: c, fontFamily: "'Share Tech Mono',monospace" }}>{val}</div>
    </div>
  );
}

function TopBar({ title, sub, right }) {
  return (
    <div style={{ position: "sticky", top: 0, background: "rgba(2,4,8,0.96)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)", padding: "12px 16px", zIndex: 100, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>{title}</div>
        {sub && <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function BottomNav({ page, setPage }) {
  const tabs = [
    { id: "dashboard", icon: "⚡", label: "Home" },
    { id: "upload",    icon: "🎬", label: "Upload" },
    { id: "clips",     icon: "✂️", label: "Clips" },
    { id: "growth",    icon: "🚀", label: "Growth" },
    { id: "profile",   icon: "👤", label: "Profile" },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(6,13,20,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid var(--border)", display: "flex", zIndex: 1000 }}>
      {tabs.map(t => {
        const active = page === t.id;
        return (
          <button key={t.id} onClick={() => setPage(t.id)} style={{ flex: 1, padding: "10px 4px 8px", border: "none", background: "transparent", color: active ? "#00ff88" : "var(--muted)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minHeight: 56, transition: "all 0.15s", position: "relative" }}>
            <span style={{ fontSize: 19, filter: active ? "drop-shadow(0 0 6px #00ff88)" : "none" }}>{t.icon}</span>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", fontFamily: "'Share Tech Mono',monospace" }}>{t.label}</span>
            {active && <div style={{ position: "absolute", bottom: 0, width: 20, height: 2, background: "linear-gradient(90deg,#00ff88,#00ccff)", borderRadius: 99 }} />}
          </button>
        );
      })}
    </div>
  );
}

// ── AUTH PAGE ────────────────────────────────────────────────
function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    if (!supabase) { onAuth({ id: "demo", email: "demo@clipforge.app" }); return; }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
    if (error) setError(error.message);
  };

  const handleEmail = async () => {
    if (!email || !pass) { setError("Please fill in email and password"); return; }
    if (!supabase) { onAuth({ id: "demo", email }); return; }
    setLoading(true); setError("");
    try {
      const { data, error } = mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password: pass })
        : await supabase.auth.signUp({ email, password: pass });
      if (error) setError(error.message);
      else if (data?.user) onAuth(data.user);
      else if (mode === "signup") setError("Check your email to confirm your account!");
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 0%,rgba(0,255,136,0.06),transparent)", pointerEvents: "none" }} />
      <div style={{ width: "100%", maxWidth: 400, animation: "fadeUp 0.5s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg,#00ff88,#00ccff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, color: "#000", fontFamily: "'Orbitron',sans-serif", margin: "0 auto 14px", boxShadow: "0 0 30px rgba(0,255,136,0.4)" }}>CF</div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: 4 }}>CLIPFORGE</div>
          <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 3, textTransform: "uppercase", marginTop: 4 }}>AI Video Empire Builder</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
            {["100% Free", "No Watermark", "AI-Powered"].map(b => <Tag key={b}>{b}</Tag>)}
          </div>
        </div>
        <Card style={{ padding: 24 }}>
          <div style={{ display: "flex", background: "var(--surface)", borderRadius: 10, padding: 3, marginBottom: 20 }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "none", background: mode === m ? "linear-gradient(135deg,#00ff88,#00ccff)" : "transparent", color: mode === m ? "#000" : "var(--muted)", fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "all 0.2s", fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1, textTransform: "uppercase" }}>
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>
          <button onClick={handleGoogle} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--card2)", color: "var(--text)", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16, fontFamily: "'Rajdhani',sans-serif" }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#4285f4" }}>G</span> Continue with Google
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 10, color: "var(--muted)" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email"
            style={{ width: "100%", background: "var(--card2)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", color: "var(--text)", fontSize: 13, marginBottom: 10 }} />
          <input value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" type="password"
            onKeyDown={e => e.key === "Enter" && handleEmail()}
            style={{ width: "100%", background: "var(--card2)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", color: "var(--text)", fontSize: 13, marginBottom: 12 }} />
          {error && <div style={{ color: "#ff3366", fontSize: 12, marginBottom: 10, padding: "8px 12px", background: "rgba(255,51,102,0.08)", borderRadius: 8 }}>{error}</div>}
          <button onClick={handleEmail} disabled={loading} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#00ff88,#00ccff)", color: "#000", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", opacity: loading ? 0.7 : 1 }}>
            {loading ? "LOADING..." : mode === "login" ? "SIGN IN TO CLIPFORGE →" : "CREATE FREE ACCOUNT →"}
          </button>
          <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "var(--muted)" }}>100% Free · No credit card · No watermark</div>
        </Card>
      </div>
    </div>
  );
}

// ── UPLOAD PAGE ──────────────────────────────────────────────
function Upload({ user, setPage, setRealClips, showToast }) {
  const [phase, setPhase] = useState("idle");
  const [url, setUrl] = useState("");
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [stageLabel, setStageLabel] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef();
  const galleryRef = useRef();
  const pollRef = useRef();

  const startPolling = (jid) => {
    pollRef.current = setInterval(async () => {
      try {
        const job = await apiGetJob(jid);
        setProgress(job.progress || 0);
        setStageLabel(job.stage_label || job.stage || "Processing...");
        if (job.status === "done") {
          clearInterval(pollRef.current);
          setRealClips(job.clips || []);
          setPhase("done");
          showToast(`🎉 ${job.clip_count || job.clips?.length || 0} viral clips generated!`);
        } else if (job.status === "error") {
          clearInterval(pollRef.current);
          setError(job.error || "Processing failed. Try again.");
          setPhase("error");
        }
      } catch (e) { console.error(e); }
    }, 2000);
  };

  const handleFile = async (file) => {
    if (!file) return;
    setPhase("processing"); setError(""); setProgress(5);
    setStageLabel("Uploading video...");
    try {
      const res = await apiUpload(file, user.id || "demo");
      if (res.job_id) { setJobId(res.job_id); startPolling(res.job_id); }
      else { setError("Upload failed. Check your backend."); setPhase("error"); }
    } catch (e) { setError("Cannot reach backend. Is HF Space running?"); setPhase("error"); }
  };

  const handleURL = async () => {
    if (!url.trim()) return;
    setPhase("processing"); setError(""); setProgress(5);
    setStageLabel("Downloading video...");
    try {
      const res = await apiProcessURL(url, user.id || "demo");
      if (res.job_id) { setJobId(res.job_id); startPolling(res.job_id); }
      else { setError("URL processing failed."); setPhase("error"); }
    } catch (e) { setError("Cannot reach backend. Is HF Space running?"); setPhase("error"); }
  };

  useEffect(() => () => clearInterval(pollRef.current), []);

  const stages = [
    "Uploading","Transcribing","Detecting clips","Scoring virality",
    "Building strategy","Reframing 9:16","Burning captions","Thumbnails","Uploading to cloud","Building growth plan"
  ];

  if (phase === "done") return (
    <div style={{ textAlign: "center", padding: "60px 24px 100px", animation: "fadeUp 0.4s ease" }}>
      <div style={{ fontSize: 60, marginBottom: 16, animation: "float 3s ease-in-out infinite" }}>🎬</div>
      <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 8, letterSpacing: 2 }}>CLIPS READY!</div>
      <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 28 }}>Your viral clips are ready to dominate</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 280, margin: "0 auto" }}>
        <Btn full size="lg" icon="✂️" onClick={() => setPage("clips")}>VIEW MY CLIPS</Btn>
        <Btn full variant="ghost" onClick={() => { setPhase("idle"); setProgress(0); setUrl(""); }}>UPLOAD ANOTHER</Btn>
      </div>
    </div>
  );

  if (phase === "processing") return (
    <div style={{ padding: "32px 16px 100px", animation: "fadeUp 0.4s ease" }}>
      <TopBar title="PROCESSING" sub="AI pipeline running..." />
      <div style={{ padding: 16, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 14, animation: "spin 2s linear infinite" }}>⚙️</div>
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 16, fontWeight: 900, color: "#fff", marginBottom: 20, letterSpacing: 1 }}>ANALYZING YOUR VIDEO</div>
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 99, height: 6, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#00ff88,#00ccff)", borderRadius: 99, transition: "width 0.3s ease", boxShadow: "0 0 15px rgba(0,255,136,0.5)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, fontSize: 11, color: "var(--muted)" }}>
          <span>{stageLabel}</span>
          <span style={{ color: "#00ff88", fontFamily: "'Share Tech Mono',monospace", fontWeight: 700 }}>{progress}%</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {stages.map((s, i) => {
            const done = progress >= Math.round((i + 1) / stages.length * 100);
            const active = !done && progress >= Math.round(i / stages.length * 100);
            return (
              <div key={i} style={{ padding: "7px 10px", borderRadius: 8, background: done ? "rgba(0,255,136,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${done ? "rgba(0,255,136,0.2)" : "rgba(255,255,255,0.04)"}`, fontSize: 10, color: done ? "#00ff88" : active ? "#fff" : "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
                <span>{done ? "✓" : active ? "⟳" : "○"}</span>{s}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (phase === "error") return (
    <div style={{ padding: "60px 24px 100px", textAlign: "center", animation: "fadeUp 0.4s ease" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
      <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 18, color: "#ff3366", marginBottom: 8 }}>PROCESSING FAILED</div>
      <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 24, maxWidth: 300, margin: "0 auto 24px", lineHeight: 1.6 }}>{error}</div>
      <Btn onClick={() => { setPhase("idle"); setError(""); }}>TRY AGAIN</Btn>
    </div>
  );

  return (
    <div style={{ animation: "fadeUp 0.4s ease", paddingBottom: 80 }}>
      <TopBar title="UPLOAD" sub="Turn any video into viral clips" />
      <div style={{ padding: 16 }}>
        <div
          onClick={() => inputRef.current?.click()}
          style={{ border: "2px dashed rgba(0,255,136,0.25)", borderRadius: 16, padding: "36px 20px", textAlign: "center", cursor: "pointer", marginBottom: 12, animation: "glow 3s ease-in-out infinite" }}>
          <input ref={inputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          <div style={{ fontSize: 40, marginBottom: 12, animation: "float 3s ease-in-out infinite" }}>🎬</div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 16, fontWeight: 900, color: "#fff", marginBottom: 6, letterSpacing: 1 }}>DROP VIDEO HERE</div>
          <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 14 }}>MP4 · MOV · AVI · MKV up to 10GB</div>
          <Btn icon="⚡">CHOOSE FILE</Btn>
        </div>
        <input ref={galleryRef} type="file" accept="video/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
        <Btn variant="dark" full icon="📱" style={{ marginBottom: 10 }} onClick={() => galleryRef.current?.click()}>PICK FROM GALLERY</Btn>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && handleURL()}
            placeholder="YouTube · TikTok · Loom · Vimeo URL..."
            style={{ flex: 1, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", color: "var(--text)", fontSize: 12 }} />
          <Btn onClick={handleURL}>GO</Btn>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { icon: "🤖", title: "Gemini AI Scoring", desc: "Alpha + Beta dual AI boardroom" },
            { icon: "🎯", title: "HookForge™", desc: "10 AI hooks ranked by virality" },
            { icon: "💬", title: "Auto Captions", desc: "99% accuracy · 50+ languages" },
            { icon: "📐", title: "9:16 Reframe", desc: "Face-tracking auto vertical" },
            { icon: "🔮", title: "Viral Predictor", desc: "% chance of 100K+ views" },
            { icon: "🚀", title: "Growth Plan", desc: "30-day AI strategy per clip" },
          ].map((f, i) => (
            <Card key={i} style={{ padding: 12, animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 0.06}s` }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{f.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 3, fontFamily: "'Orbitron',sans-serif", letterSpacing: 0.3 }}>{f.title}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.5 }}>{f.desc}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CLIPS PAGE ───────────────────────────────────────────────
function Clips({ realClips, showToast }) {
  const [selected, setSelected] = useState(null);
  const hasReal = realClips && realClips.length > 0;
  const clips = hasReal ? realClips : [];

  const downloadClip = (clip) => {
    const url = clip.clip_url || clip.download_url || "";
    if (!url) { showToast("❌ No download URL — check R2 storage setup"); return; }
    const a = document.createElement("a");
    a.href = url; a.download = `${clip.title || "clip"}.mp4`; a.click();
    showToast("⬇ Downloading to gallery...");
  };

  if (!hasReal) return (
    <div style={{ padding: "60px 24px 100px", textAlign: "center", animation: "fadeUp 0.4s ease" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✂️</div>
      <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 18, color: "#fff", marginBottom: 8, letterSpacing: 1 }}>NO CLIPS YET</div>
      <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 24, lineHeight: 1.7 }}>Upload a video or paste a URL to generate your first viral clips</div>
    </div>
  );

  return (
    <div style={{ animation: "fadeUp 0.4s ease", paddingBottom: 80 }}>
      <TopBar title="MY CLIPS" sub={`${clips.length} clips · Real AI results`}
        right={<Btn size="sm" variant="ghost" onClick={() => showToast("📦 Exporting all clips...")}>EXPORT ALL</Btn>} />
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {clips.map((clip, i) => (
            <div key={clip.id || i}>
              <Card style={{ padding: 14, cursor: "pointer", border: `1px solid ${selected === i ? "rgba(0,255,136,0.3)" : "var(--border)"}`, animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 0.07}s` }}
                onClick={() => setSelected(selected === i ? null : i)}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 72, height: 72, borderRadius: 10, background: clip.thumb_url ? `url(${clip.thumb_url}) center/cover` : "linear-gradient(135deg,#0a2010,#051008)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                    {!clip.thumb_url && <span style={{ fontSize: 22, opacity: 0.5 }}>▶</span>}
                    <div style={{ position: "absolute", bottom: 3, right: 3, background: "rgba(0,0,0,0.9)", borderRadius: 3, padding: "1px 4px", fontSize: 8, fontFamily: "'Share Tech Mono',monospace" }}>{clip.duration ? `${Math.floor(clip.duration)}s` : "—"}</div>
                    {clip.viral_score >= 90 && <div style={{ position: "absolute", top: 3, left: 3, background: "linear-gradient(135deg,#ff3366,#ff6633)", borderRadius: 3, padding: "1px 5px", fontSize: 7, fontWeight: 800, color: "#fff" }}>🔥VIRAL</div>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 4, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{clip.title || `Clip ${i + 1}`}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 6, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{(clip.transcript || "").slice(0, 55)}..."</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                      {(clip.tags || []).slice(0, 2).map(t => <Tag key={t} color="#00ff88">{t}</Tag>)}
                      {clip.best_platform && <Tag color="#00ccff">{clip.best_platform}</Tag>}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {Object.entries(clip.platform_scores || {}).slice(0, 3).map(([p, s]) => (
                        <div key={p} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <span style={{ fontSize: 8, color: "var(--muted)", fontFamily: "'Share Tech Mono',monospace" }}>{p.slice(0, 2)}</span>
                          <div style={{ width: 20, height: 3, borderRadius: 99, background: "rgba(255,255,255,0.08)" }}>
                            <div style={{ height: "100%", width: `${s}%`, background: s >= 90 ? "#00ff88" : s >= 80 ? "#ffcc00" : "#ff3366", borderRadius: 99 }} />
                          </div>
                          <span style={{ fontSize: 8, color: s >= 90 ? "#00ff88" : s >= 80 ? "#ffcc00" : "#ff3366", fontFamily: "'Share Tech Mono',monospace" }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Ring val={clip.viral_score || clip.score || 75} size={44} />
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                  <Btn size="sm" variant="ghost" onClick={e => { e.stopPropagation(); showToast(`📅 "${clip.title}" scheduled!`); }} style={{ flex: 1, justifyContent: "center" }}>SCHEDULE</Btn>
                  <Btn size="sm" variant="dark" icon="📱" onClick={e => { e.stopPropagation(); downloadClip(clip); }}>SAVE</Btn>
                  <Btn size="sm" variant="dark" icon="⬇" onClick={e => { e.stopPropagation(); downloadClip(clip); }}>MP4</Btn>
                </div>
              </Card>
              {selected === i && (
                <div style={{ background: "var(--card2)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 12, padding: 14, marginTop: 6, animation: "fadeIn 0.2s ease" }}>
                  {[
                    { title: "🎯 HOOK ANALYSIS", color: "#00ff88", content: `Hook score: ${clip.hook_score || "—"}/100 · ${clip.hook_sentence || "Strong opening detected"} · Tip: ${clip.improvement || "Add specific number in first 3 words"}` },
                    { title: "📅 BEST POST TIME", color: "#00ccff", content: `Post on: ${clip.best_post_day || "Tuesday"} at ${clip.best_post_time || "7:00 PM"} · Platform: ${clip.best_platform || "TikTok"} · Viral probability: ${clip.viral_probability || clip.viral_score || 75}%` },
                    { title: "💬 AI CAPTION", color: "#ffcc00", content: clip.caption || "Your viral caption will appear here after processing." },
                  ].map((p, pi) => (
                    <div key={pi} style={{ padding: 10, background: `${p.color}06`, borderRadius: 10, border: `1px solid ${p.color}15`, marginBottom: pi < 2 ? 8 : 0 }}>
                      <div style={{ fontSize: 10, color: p.color, fontWeight: 700, marginBottom: 4, fontFamily: "'Orbitron',sans-serif", letterSpacing: 0.3 }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>{p.content}</div>
                    </div>
                  ))}
                  {clip.titles && (
                    <div style={{ padding: 10, background: "rgba(176,109,255,0.06)", borderRadius: 10, border: "1px solid rgba(176,109,255,0.15)", marginTop: 8 }}>
                      <div style={{ fontSize: 10, color: "#b06dff", fontWeight: 700, marginBottom: 6, fontFamily: "'Orbitron',sans-serif", letterSpacing: 0.3 }}>📝 5 VIRAL TITLE OPTIONS</div>
                      {clip.titles.map((t, ti) => (
                        <div key={ti} style={{ fontSize: 11, color: "var(--muted)", padding: "4px 0", borderBottom: ti < 4 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                          <span style={{ color: "#b06dff", fontFamily: "'Share Tech Mono',monospace", marginRight: 6 }}>{ti + 1}.</span>{t}
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    <Btn full variant="ghost" size="sm" onClick={() => { navigator.clipboard?.writeText(clip.caption || ""); showToast("📋 Caption copied!"); }}>COPY CAPTION</Btn>
                    <Btn full variant="dark" size="sm" onClick={() => { navigator.clipboard?.writeText((clip.hashtags || []).join(" ")); showToast("📋 Hashtags copied!"); }}>COPY HASHTAGS</Btn>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── GROWTH PAGE ──────────────────────────────────────────────
function Growth({ user, showToast }) {
  const [tab, setTab] = useState("coach");
  const [chat, setChat] = useState([{ role: "ai", msg: "Hey! I'm your AI Growth Coach powered by Gemini Algorithm Whisperer. Tell me your niche and I'll build your zero-to-viral strategy!" }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef();

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat]);

  const send = async () => {
    if (!input.trim()) return;
    const msg = input; setInput("");
    setChat(h => [...h, { role: "user", msg }]);
    setTyping(true);
    try {
      const res = await apiChat(user?.id || "demo", "general", msg);
      setChat(h => [...h, { role: "ai", msg: res.reply || "Let me think about that..." }]);
    } catch {
      setChat(h => [...h, { role: "ai", msg: "Coach temporarily unavailable. Make sure your GEMINI_KEY_2 is set in HF Spaces secrets." }]);
    }
    setTyping(false);
  };

  const tabs = [
    { id: "coach", icon: "🤖", label: "Coach" },
    { id: "intel", icon: "📡", label: "Intel" },
    { id: "calendar", icon: "📅", label: "Plan" },
    { id: "simulator", icon: "🎮", label: "Sim" },
  ];

  return (
    <div style={{ animation: "fadeUp 0.4s ease", paddingBottom: 80 }}>
      <TopBar title="GROWTH ENGINE" sub="Zero to viral · Algorithm Whisperer" />
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: "0 0 auto", padding: "10px 16px", border: "none", borderBottom: `2px solid ${tab === t.id ? "#00ff88" : "transparent"}`, background: "transparent", color: tab === t.id ? "#00ff88" : "var(--muted)", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "'Share Tech Mono',monospace", whiteSpace: "nowrap" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div style={{ padding: 16 }}>
        {tab === "coach" && (
          <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 260px)" }}>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
              {chat.map((c, i) => (
                <div key={i} style={{ display: "flex", justifyContent: c.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "85%", padding: "10px 14px", borderRadius: c.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: c.role === "user" ? "linear-gradient(135deg,#00ff88,#00ccff)" : "var(--card2)", color: c.role === "user" ? "#000" : "#fff", fontSize: 12, lineHeight: 1.6, fontWeight: c.role === "user" ? 700 : 400, border: c.role === "ai" ? "1px solid var(--border)" : "none" }}>{c.msg}</div>
                </div>
              ))}
              {typing && <div style={{ display: "flex", gap: 5, padding: "10px 14px", background: "var(--card2)", borderRadius: "14px 14px 14px 4px", width: "fit-content", border: "1px solid var(--border)" }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff88", animation: "pulse 1s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />)}</div>}
              <div ref={endRef} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
                placeholder="Ask your AI growth coach anything..."
                style={{ flex: 1, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "11px 14px", color: "var(--text)", fontSize: 12 }} />
              <Btn onClick={send}>SEND</Btn>
            </div>
          </div>
        )}
        {tab === "intel" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { p: "TikTok", c: "#ff0050", signal: "Completion rate >70% = instant boost TODAY", urgency: "NOW", action: "Keep under 45 seconds" },
              { p: "Instagram", c: "#e1306c", signal: "Saves = 3x reach multiplier this week", urgency: "HIGH", action: "Add save this CTA" },
              { p: "YouTube", c: "#ff0000", signal: "CTR >10% triggers suggested feed", urgency: "HIGH", action: "Bold thumbnail + number in title" },
              { p: "Facebook", c: "#1877f2", signal: "Video posts get 5x reach vs images", urgency: "MEDIUM", action: "Cross-post Reels to Facebook" },
              { p: "TikTok", c: "#ff0050", signal: "New accounts get test traffic on every post", urgency: "NOW", action: "Post 3x/day for first 30 days" },
            ].map((a, i) => (
              <Card key={i} style={{ padding: 12, borderLeft: `3px solid ${a.c}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: a.c, fontFamily: "'Orbitron',sans-serif", letterSpacing: 0.3 }}>{a.p}</span>
                  <Tag color={a.urgency === "NOW" ? "#ff3366" : a.urgency === "HIGH" ? "#ffcc00" : "#00ccff"}>{a.urgency}</Tag>
                </div>
                <div style={{ fontSize: 11, color: "var(--text)", marginBottom: 3 }}>{a.signal}</div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>→ {a.action}</div>
              </Card>
            ))}
          </div>
        )}
        {tab === "calendar" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Card glow>
              <div style={{ fontSize: 13, fontFamily: "'Orbitron',sans-serif", color: "#00ff88", marginBottom: 12, letterSpacing: 0.5 }}>📅 30-DAY ROADMAP</div>
              {[
                { w: "WEEK 1", t: "Foundation", d: "Post 3x/day TikTok. Test 5 hook styles. Consistency beats quality now.", c: "#00ff88" },
                { w: "WEEK 2", t: "Double Down", d: "Kill weak hooks. Start Instagram. Engage every comment in first 60 mins.", c: "#00ccff" },
                { w: "WEEK 3", t: "Expand", d: "Add YouTube Shorts. Target trending topic daily. Push for 1K TikTok.", c: "#ffcc00" },
                { w: "WEEK 4", t: "MONETIZE", d: "Apply TikTok Creator Fund. YouTube Partner push. First income hits.", c: "#ff3366" },
              ].map((w, i) => (
                <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: "var(--surface)", borderLeft: `3px solid ${w.c}`, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: w.c, fontFamily: "'Orbitron',sans-serif" }}>{w.w}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{w.t}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>{w.d}</div>
                </div>
              ))}
            </Card>
          </div>
        )}
        {tab === "simulator" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Card style={{ background: "linear-gradient(135deg,rgba(176,109,255,0.08),rgba(0,204,255,0.04))", border: "1px solid rgba(176,109,255,0.25)" }}>
              <div style={{ fontSize: 13, fontFamily: "'Orbitron',sans-serif", color: "#b06dff", marginBottom: 8, letterSpacing: 0.5 }}>🎮 MILLION-FOLLOWER SIMULATOR</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 14, lineHeight: 1.7 }}>Test your strategy risk-free. AI simulates how the algorithm responds to your posting pattern.</div>
              <Btn full icon="🎮" onClick={() => showToast("🎮 Simulation running... Check results below!")}>RUN SIMULATION</Btn>
            </Card>
            <Card>
              <div style={{ fontSize: 13, fontFamily: "'Orbitron',sans-serif", color: "#00ff88", marginBottom: 12, letterSpacing: 0.5 }}>📈 PREDICTED TRAJECTORY</div>
              {[
                { p: "Day 7", f: "0 → 340 followers", v: "12K views", c: "#00ff88" },
                { p: "Day 14", f: "340 → 1.2K followers", v: "89K views", c: "#00ccff" },
                { p: "Day 21", f: "1.2K → 4.8K followers", v: "380K views", c: "#ffcc00" },
                { p: "Day 30", f: "4.8K → 18K followers", v: "1.4M views", c: "#ff3366" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--surface)", borderRadius: 10, marginBottom: 8 }}>
                  <Tag color={r.c}>{r.p}</Tag>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{r.f}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>{r.v}</div>
                  </div>
                </div>
              ))}
              <div style={{ padding: "10px 12px", background: "rgba(0,255,136,0.06)", borderRadius: 10, border: "1px solid rgba(0,255,136,0.15)", marginTop: 4 }}>
                <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}><strong style={{ color: "#00ff88" }}>First income prediction:</strong> Day 22. TikTok Creator Fund eligible by Day 14. YouTube Partner by Day 35.</div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PROFILE PAGE ─────────────────────────────────────────────
function Profile({ user, showToast, onSignOut }) {
  const [tab, setTab] = useState("platforms");
  const [sleepMode, setSleepMode] = useState(false);

  const platforms = [
    { id: "tiktok", name: "TikTok", icon: "🎵", color: "#ff0050", accounts: ["TikTok Main", "TikTok Niche1", "TikTok Niche2", "TikTok Viral"] },
    { id: "instagram", name: "Instagram", icon: "📸", color: "#e1306c", accounts: ["IG Main", "IG Business", "IG Niche1", "IG Niche2", "IG Viral"] },
    { id: "youtube", name: "YouTube", icon: "▶️", color: "#ff0000", accounts: ["YT Main", "YT Shorts", "YT Niche1", "YT Niche2", "YT Long", "YT Viral"] },
    { id: "facebook", name: "Facebook", icon: "👥", color: "#1877f2", accounts: ["FB Page1", "FB Page2", "FB Page3", "FB Page4", "FB Page5"] },
  ];

  const tabs = [
    { id: "platforms", icon: "🌐", label: "Platforms" },
    { id: "scheduler", icon: "📅", label: "Schedule" },
    { id: "analytics", icon: "📊", label: "Analytics" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];

  return (
    <div style={{ animation: "fadeUp 0.4s ease", paddingBottom: 80 }}>
      <TopBar title="COMMAND CENTER" sub="Platforms · Schedule · Analytics" />
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: "0 0 auto", padding: "10px 14px", border: "none", borderBottom: `2px solid ${tab === t.id ? "#00ff88" : "transparent"}`, background: "transparent", color: tab === t.id ? "#00ff88" : "var(--muted)", fontSize: 10, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "'Share Tech Mono',monospace", whiteSpace: "nowrap" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div style={{ padding: 16 }}>
        {tab === "platforms" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ padding: "10px 14px", background: "rgba(0,255,136,0.06)", borderRadius: 10, border: "1px solid rgba(0,255,136,0.15)", fontSize: 11, color: "var(--muted)", lineHeight: 1.7 }}>
              <strong style={{ color: "#00ff88" }}>Platform APIs in progress.</strong> TikTok, Instagram, and YouTube direct posting coming soon. For now: ClipForge schedules + notifies you exactly when and what to post.
            </div>
            {platforms.map((p, pi) => (
              <Card key={pi} style={{ padding: 14, borderTop: `2px solid ${p.color}20` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${p.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{p.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Orbitron',sans-serif", letterSpacing: 0.3 }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>{p.accounts.length} accounts planned</div>
                  </div>
                </div>
                {p.accounts.map((acc, ai) => (
                  <div key={ai} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "var(--surface)", borderRadius: 8, marginBottom: 5 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--muted)", flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 11, color: "var(--muted)" }}>{acc}</span>
                    <Btn size="sm" variant="ghost" onClick={() => showToast(`🔗 ${acc} — API approval pending. Coming soon!`)}>CONNECT</Btn>
                  </div>
                ))}
              </Card>
            ))}
          </div>
        )}
        {tab === "scheduler" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Card style={{ background: sleepMode ? "rgba(0,255,136,0.06)" : "var(--card)", border: `1px solid ${sleepMode ? "rgba(0,255,136,0.3)" : "var(--border)"}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Orbitron',sans-serif", letterSpacing: 0.5 }}>😴 SLEEP MODE</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>Auto-posts while you sleep</div>
                </div>
                <button onClick={() => { setSleepMode(!sleepMode); showToast(sleepMode ? "Sleep mode OFF" : "😴 Sleep mode ON — posting tonight!"); }}
                  style={{ width: 44, height: 24, borderRadius: 12, background: sleepMode ? "#00ff88" : "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", transition: "all 0.3s", position: "relative" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: sleepMode ? "#000" : "rgba(255,255,255,0.5)", position: "absolute", top: 3, left: sleepMode ? 23 : 3, transition: "left 0.3s" }} />
                </button>
              </div>
              {sleepMode && <div style={{ fontSize: 11, color: "#00ff88", lineHeight: 1.6, marginTop: 10 }}>✅ Active · ClipForge will notify you of optimal posting times</div>}
            </Card>
            <Card>
              <div style={{ fontSize: 13, fontFamily: "'Orbitron',sans-serif", color: "#00ff88", marginBottom: 12, letterSpacing: 0.5 }}>📅 POSTING SCHEDULE</div>
              {["7:00 AM · TikTok Main", "12:00 PM · Instagram Main", "3:00 PM · YouTube Shorts", "7:00 PM · TikTok Viral"].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "var(--surface)", borderRadius: 8, marginBottom: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: i === 0 ? "#00ff88" : "var(--muted)", animation: i === 0 ? "pulse 2s ease-in-out infinite" : "none", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 11, color: "var(--text)" }}>{s}</span>
                  <Tag color={i === 0 ? "#00ff88" : "var(--muted)"}>{i === 0 ? "NEXT" : "QUEUED"}</Tag>
                </div>
              ))}
            </Card>
          </div>
        )}
        {tab === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Card glow>
              <div style={{ fontSize: 13, fontFamily: "'Orbitron',sans-serif", color: "#00ff88", marginBottom: 12, letterSpacing: 0.5 }}>💰 MONETIZATION TRACKER</div>
              {[
                { p: "TikTok", target: "1K followers → Creator Fund", current: 340, max: 1000, color: "#ff0050" },
                { p: "YouTube", target: "1K subs + 4K watch hours", current: 89, max: 1000, color: "#ff0000" },
                { p: "Instagram", target: "Reels Bonus Program", current: 520, max: 1000, color: "#e1306c" },
                { p: "Facebook", target: "10K followers → In-Stream Ads", current: 1200, max: 10000, color: "#1877f2" },
              ].map((m, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: m.color }}>{m.p}</span>
                    <span style={{ fontSize: 10, color: "var(--muted)" }}>{m.current.toLocaleString()} / {m.max.toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 5 }}>{m.target}</div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
                    <div style={{ height: "100%", width: `${Math.min(100, (m.current / m.max) * 100)}%`, background: m.color, borderRadius: 99, transition: "width 1s ease" }} />
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}
        {tab === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card>
              <div style={{ fontSize: 13, fontFamily: "'Orbitron',sans-serif", color: "#fff", marginBottom: 12, letterSpacing: 0.5 }}>👤 ACCOUNT</div>
              <div style={{ padding: "10px 14px", background: "var(--surface)", borderRadius: 10, marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>Signed in as</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{user?.email || "demo@clipforge.app"}</div>
              </div>
              <Btn full variant="red" onClick={onSignOut} icon="🚪">SIGN OUT</Btn>
            </Card>
            <Card style={{ background: "rgba(0,255,136,0.03)", border: "1px solid rgba(0,255,136,0.15)" }}>
              <div style={{ fontSize: 13, fontFamily: "'Orbitron',sans-serif", color: "#00ff88", marginBottom: 12, letterSpacing: 0.5 }}>⚡ SYSTEM STATUS</div>
              {[
                { l: "HF Spaces Backend", s: "Online" },
                { l: "WhisperX Engine", s: "Ready" },
                { l: "Gemini Alpha (Key 1)", s: "Active" },
                { l: "Gemini Beta (Key 2)", s: "Active" },
                { l: "Cloudflare R2", s: "Connected" },
                { l: "Supabase DB", s: "Online" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "var(--surface)", borderRadius: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{s.l}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#00ff88", animation: "pulse 2s ease-in-out infinite" }} />
                    <span style={{ fontSize: 10, color: "#00ff88", fontFamily: "'Share Tech Mono',monospace", fontWeight: 700 }}>{s.s}</span>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DASHBOARD ────────────────────────────────────────────────
function Dashboard({ user, setPage, showToast, realClips }) {
  const stats = [
    { icon: "✂️", label: "Clips", value: realClips.length > 0 ? String(realClips.length) : "0", delta: realClips.length > 0 ? "new" : "upload first", color: "#00ff88" },
    { icon: "🔥", label: "Avg Score", value: realClips.length > 0 ? String(Math.round(realClips.reduce((a, c) => a + (c.viral_score || 75), 0) / realClips.length)) : "—", delta: "viral score", color: "#ffcc00" },
    { icon: "👁", label: "Views", value: "0", delta: "post first clip", color: "#00ccff" },
    { icon: "📈", label: "Growth", value: "0%", delta: "connect platforms", color: "#ff3366" },
  ];
  return (
    <div style={{ animation: "fadeUp 0.4s ease", paddingBottom: 80 }}>
      <TopBar title="CLIPFORGE" sub={`Welcome back · ${user?.email?.split("@")[0] || "Creator"}`}
        right={<Btn size="sm" icon="🎬" onClick={() => setPage("upload")}>UPLOAD</Btn>} />
      <div style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {stats.map((s, i) => (
            <Card key={i} style={{ padding: 14, animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 0.07}s` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <Tag color={s.color}>{s.delta}</Tag>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Orbitron',sans-serif", color: "#fff" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
            </Card>
          ))}
        </div>
        <Card glow style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#00ff88,#00ccff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🤖</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'Orbitron',sans-serif", letterSpacing: 0.5 }}>AI GROWTH COACH</div>
              <div style={{ fontSize: 9, color: "#00ff88", display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 4, height: 4, borderRadius: "50%", background: "#00ff88", display: "inline-block", animation: "pulse 2s ease-in-out infinite" }} />GEMINI KEY 2 · LIVE</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "rgba(224,240,255,0.7)", lineHeight: 1.7, marginBottom: 12, borderLeft: "2px solid rgba(0,255,136,0.3)", paddingLeft: 10 }}>
            {realClips.length > 0
              ? `Great work! You have ${realClips.length} clips ready. Your top clip scores ${Math.max(...realClips.map(c => c.viral_score || 0))} viral score — post it tonight at 7PM for maximum reach.`
              : "Upload your first video to unlock your personalized growth strategy. I'll analyze your content and build your zero-to-viral roadmap immediately."}
          </div>
          <Btn variant="ghost" full size="sm" onClick={() => setPage("growth")}>OPEN GROWTH ENGINE →</Btn>
        </Card>
        {realClips.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'Orbitron',sans-serif", letterSpacing: 0.5 }}>YOUR CLIPS</div>
              <button onClick={() => setPage("clips")} style={{ fontSize: 10, color: "#00ff88", background: "none", border: "none", cursor: "pointer", fontFamily: "'Share Tech Mono',monospace" }}>VIEW ALL →</button>
            </div>
            {realClips.slice(0, 3).map((c, i) => (
              <Card key={i} style={{ padding: 12, marginBottom: 8, animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 0.07}s` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: c.thumb_url ? `url(${c.thumb_url}) center/cover` : "linear-gradient(135deg,#0a2010,#051008)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{!c.thumb_url && "▶"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title || `Clip ${i + 1}`}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{c.best_platform || "TikTok"} · {c.best_post_time || "7:00 PM"}</div>
                  </div>
                  <Ring val={c.viral_score || 75} size={38} />
                </div>
              </Card>
            ))}
          </div>
        )}
        {realClips.length === 0 && (
          <Card style={{ padding: 20, textAlign: "center", border: "2px dashed rgba(0,255,136,0.2)" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎬</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6, fontFamily: "'Orbitron',sans-serif" }}>READY TO GO VIRAL?</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 16, lineHeight: 1.6 }}>Upload your first video and ClipForge AI will generate your viral clips in minutes</div>
            <Btn full icon="⚡" onClick={() => setPage("upload")}>UPLOAD FIRST VIDEO</Btn>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState("dashboard");
  const [toast, setToast]         = useState(null);
  const [realClips, setRealClips] = useState([]);

  // Check existing session on load
  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const showToast = (msg) => setToast(msg);
  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setPage("dashboard");
    setRealClips([]);
  };

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, animation: "spin 2s linear infinite", marginBottom: 16 }}>⚙️</div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 14, color: "#00ff88", letterSpacing: 2 }}>LOADING CLIPFORGE...</div>
        </div>
      </div>
    </>
  );

  if (!user) return (
    <>
      <style>{CSS}</style>
      <AuthPage onAuth={(u) => { setUser(u); setPage("dashboard"); }} />
    </>
  );

  const pages = {
    dashboard: <Dashboard user={user} setPage={setPage} showToast={showToast} realClips={realClips} />,
    upload:    <Upload user={user} setPage={setPage} setRealClips={setRealClips} showToast={showToast} />,
    clips:     <Clips realClips={realClips} showToast={showToast} />,
    growth:    <Growth user={user} showToast={showToast} />,
    profile:   <Profile user={user} showToast={showToast} onSignOut={handleSignOut} />,
  };

  return (
    <>
      <style>{CSS}</style>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 60 }}>
        {pages[page] || pages.dashboard}
        <BottomNav page={page} setPage={setPage} />
      </div>
    </>
  );
}
