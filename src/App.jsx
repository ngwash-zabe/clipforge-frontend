import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Config ───────────────────────────────────────────────────
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || "";
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const API_URL       = import.meta.env.VITE_API_URL || "https://shonkazee-clipforge-backend.hf.space";
const SITE_URL      = "https://clip-forge.site";

const supabase = SUPABASE_URL ? createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { redirectTo: SITE_URL }
}) : null;

// ── API calls ────────────────────────────────────────────────
const api = {
  upload: async (file, userId, niche = "general") => {
    const form = new FormData();
    form.append("file", file);
    form.append("user_id", userId);
    form.append("niche", niche);
    form.append("clip_count", "10");
    const r = await fetch(`${API_URL}/process/upload`, { method: "POST", body: form });
    return r.json();
  },
  processURL: async (url, userId, niche = "general") => {
    const r = await fetch(`${API_URL}/process/url`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, user_id: userId, niche, clip_count: 10 }),
    });
    return r.json();
  },
  getJob: async (jobId) => {
    const r = await fetch(`${API_URL}/job/${jobId}`);
    return r.json();
  },
  getClips: async (userId) => {
    const r = await fetch(`${API_URL}/clips/${userId}`);
    return r.json();
  },
  chat: async (userId, niche, message) => {
    const r = await fetch(`${API_URL}/growth/chat`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, niche, message, context: "" }),
    });
    return r.json();
  },
  postTo: async (platform, clipUrl, caption, hashtags, accessToken = "") => {
    const r = await fetch(`${API_URL}/post/${platform}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "me", clip_url: clipUrl, caption, hashtags, account_id: accessToken }),
    });
    return r.json();
  },
  schedule: async (userId, clipId, platform, time, caption, hashtags) => {
    const r = await fetch(`${API_URL}/schedule/post`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, clip_id: clipId, platform, scheduled_time: time, caption, hashtags }),
    });
    return r.json();
  },
};

// ── CSS ──────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;800;900&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
  :root{
    --bg:#020408;--surface:#060d14;--card:#0a1520;--card2:#0d1b28;
    --accent:#00ff88;--blue:#00ccff;--red:#ff3366;--gold:#ffcc00;
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
  @keyframes glow{0%,100%{box-shadow:0 0 10px rgba(0,255,136,0.1)}50%{box-shadow:0 0 25px rgba(0,255,136,0.35)}}
`;

// ── Base components ──────────────────────────────────────────
function Card({ children, style = {}, glow = false }) {
  return <div style={{ background:"var(--card)", border:`1px solid ${glow?"rgba(0,255,136,0.25)":"var(--border)"}`, borderRadius:14, padding:16, transition:"all 0.2s", ...(glow?{animation:"glow 3s ease-in-out infinite"}:{}), ...style }}>{children}</div>;
}

function Btn({ children, onClick, variant="primary", size="md", full=false, icon, disabled=false, style={} }) {
  const pad={sm:"7px 13px",md:"10px 19px",lg:"13px 30px"}[size];
  const fs={sm:11,md:13,lg:15}[size];
  const vs={
    primary:{background:"linear-gradient(135deg,#00ff88,#00ccff)",color:"#000",border:"none",boxShadow:"0 0 12px rgba(0,255,136,0.25)"},
    ghost:{background:"rgba(0,255,136,0.05)",color:"#00ff88",border:"1px solid rgba(0,255,136,0.25)"},
    dark:{background:"var(--card2)",color:"var(--text)",border:"1px solid var(--border)"},
    red:{background:"rgba(255,51,102,0.1)",color:"#ff3366",border:"1px solid rgba(255,51,102,0.25)"},
    gold:{background:"rgba(255,204,0,0.1)",color:"#ffcc00",border:"1px solid rgba(255,204,0,0.25)"},
  };
  const v=vs[variant]||vs.primary;
  return <button onClick={onClick} disabled={disabled} style={{...v,padding:pad,fontSize:fs,fontWeight:700,borderRadius:8,width:full?"100%":"auto",display:"inline-flex",alignItems:"center",justifyContent:full?"center":"flex-start",gap:6,transition:"all 0.2s",letterSpacing:0.4,opacity:disabled?0.5:1,...style}}
    onMouseEnter={e=>{if(!disabled){e.currentTarget.style.filter="brightness(1.12)";e.currentTarget.style.transform="translateY(-1px)";}}}
    onMouseLeave={e=>{e.currentTarget.style.filter="";e.currentTarget.style.transform="";}}>
    {icon&&<span>{icon}</span>}{children}
  </button>;
}

function Tag({ children, color="#00ff88" }) {
  return <span style={{background:`${color}18`,border:`1px solid ${color}30`,color,borderRadius:99,padding:"2px 8px",fontSize:9,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",whiteSpace:"nowrap"}}>{children}</span>;
}

function Toast({ msg, onClose }) {
  useEffect(()=>{const t=setTimeout(onClose,4000);return()=>clearTimeout(t);},[]);
  return <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"rgba(2,4,8,0.97)",backdropFilter:"blur(20px)",border:"1px solid rgba(0,255,136,0.4)",borderRadius:12,padding:"11px 20px",color:"#fff",fontSize:13,fontWeight:600,zIndex:9999,whiteSpace:"nowrap",animation:"notif 0.3s ease"}}>{msg}</div>;
}

function Ring({ val=75, size=44 }) {
  const r=(size-7)/2,circ=2*Math.PI*r,dash=(val/100)*circ;
  const c=val>=80?"#00ff88":val>=65?"#ffcc00":"#ff3366";
  return <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={5}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={5} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{filter:`drop-shadow(0 0 5px ${c})`,transition:"stroke-dasharray 1s ease"}}/>
    </svg>
    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.24,fontWeight:900,color:c,fontFamily:"'Share Tech Mono',monospace"}}>{val}</div>
  </div>;
}

function TopBar({ title, sub, right }) {
  return <div style={{position:"sticky",top:0,background:"rgba(2,4,8,0.96)",backdropFilter:"blur(20px)",borderBottom:"1px solid var(--border)",padding:"11px 16px",zIndex:100,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    <div>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:800,color:"#fff",letterSpacing:1}}>{title}</div>
      {sub&&<div style={{fontSize:10,color:"var(--muted)",marginTop:1}}>{sub}</div>}
    </div>
    {right}
  </div>;
}

function BottomNav({ page, setPage }) {
  const tabs=[{id:"dashboard",icon:"⚡",label:"Home"},{id:"upload",icon:"🎬",label:"Upload"},{id:"clips",icon:"✂️",label:"Clips"},{id:"growth",icon:"🚀",label:"Growth"},{id:"profile",icon:"👤",label:"Profile"}];
  return <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(6,13,20,0.97)",backdropFilter:"blur(20px)",borderTop:"1px solid var(--border)",display:"flex",zIndex:1000}}>
    {tabs.map(t=>{
      const active=page===t.id;
      return <button key={t.id} onClick={()=>setPage(t.id)} style={{flex:1,padding:"10px 4px 8px",border:"none",background:"transparent",color:active?"#00ff88":"var(--muted)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,minHeight:56,transition:"all 0.15s",position:"relative"}}>
        <span style={{fontSize:19,filter:active?"drop-shadow(0 0 6px #00ff88)":"none"}}>{t.icon}</span>
        <span style={{fontSize:8,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",fontFamily:"'Share Tech Mono',monospace"}}>{t.label}</span>
        {active&&<div style={{position:"absolute",bottom:0,width:20,height:2,background:"linear-gradient(90deg,#00ff88,#00ccff)",borderRadius:99}}/>}
      </button>;
    })}
  </div>;
}

// ── AUTH PAGE ────────────────────────────────────────────────
function AuthPage({ onAuth }) {
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const handleGoogle=async()=>{
    if(!supabase){onAuth({id:"demo",email:"demo@clip-forge.site"});return;}
    setLoading(true);setError("");
    const{error}=await supabase.auth.signInWithOAuth({
      provider:"google",
      options:{redirectTo:SITE_URL,queryParams:{access_type:"offline",prompt:"consent"}}
    });
    if(error)setError(error.message);
    setLoading(false);
  };

  const handleEmail=async()=>{
    if(!email||!pass){setError("Enter email and password");return;}
    if(!supabase){onAuth({id:"demo",email});return;}
    setLoading(true);setError("");
    try{
      const{data,error}=mode==="login"
        ?await supabase.auth.signInWithPassword({email,password:pass})
        :await supabase.auth.signUp({email,password:pass,options:{emailRedirectTo:SITE_URL}});
      if(error)setError(error.message);
      else if(data?.user)onAuth(data.user);
      else if(mode==="signup")setError("✅ Check your email to confirm your account!");
    }catch(e){setError(e.message);}
    setLoading(false);
  };

  return <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 60% 40% at 50% 0%,rgba(0,255,136,0.05),transparent)",pointerEvents:"none"}}/>
    <div style={{width:"100%",maxWidth:400,animation:"fadeUp 0.5s ease"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{width:56,height:56,borderRadius:14,background:"linear-gradient(135deg,#00ff88,#00ccff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,color:"#000",fontFamily:"'Orbitron',sans-serif",margin:"0 auto 12px",boxShadow:"0 0 28px rgba(0,255,136,0.4)"}}>CF</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:24,fontWeight:900,color:"#fff",letterSpacing:4}}>CLIPFORGE</div>
        <div style={{fontSize:9,color:"var(--muted)",letterSpacing:3,textTransform:"uppercase",marginTop:3}}>AI Video Empire · clip-forge.site</div>
        <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:10}}>
          {["100% Free","No Watermark","Real AI"].map(b=><Tag key={b}>{b}</Tag>)}
        </div>
      </div>
      <Card style={{padding:22}}>
        <div style={{display:"flex",background:"var(--surface)",borderRadius:10,padding:3,marginBottom:18}}>
          {["login","signup"].map(m=><button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"9px",borderRadius:8,border:"none",background:mode===m?"linear-gradient(135deg,#00ff88,#00ccff)":"transparent",color:mode===m?"#000":"var(--muted)",fontWeight:700,fontSize:12,cursor:"pointer",transition:"all 0.2s",fontFamily:"'Rajdhani',sans-serif",letterSpacing:1,textTransform:"uppercase"}}>{m==="login"?"Sign In":"Sign Up"}</button>)}
        </div>
        <button onClick={handleGoogle} style={{width:"100%",padding:"12px",borderRadius:12,border:"1px solid var(--border)",background:"var(--card2)",color:"var(--text)",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:14,fontFamily:"'Rajdhani',sans-serif",transition:"all 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,255,136,0.3)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";}}>
          <span style={{fontSize:18,fontWeight:900,color:"#4285f4"}}>G</span> Continue with Google
        </button>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <div style={{flex:1,height:1,background:"var(--border)"}}/>
          <span style={{fontSize:10,color:"var(--muted)"}}>OR</span>
          <div style={{flex:1,height:1,background:"var(--border)"}}/>
        </div>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email"
          style={{width:"100%",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:10,padding:"11px 13px",color:"var(--text)",fontSize:13,marginBottom:8}}/>
        <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password"
          onKeyDown={e=>e.key==="Enter"&&handleEmail()}
          style={{width:"100%",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:10,padding:"11px 13px",color:"var(--text)",fontSize:13,marginBottom:10}}/>
        {error&&<div style={{color:"#ff3366",fontSize:11,marginBottom:10,padding:"7px 11px",background:"rgba(255,51,102,0.08)",borderRadius:8}}>{error}</div>}
        <button onClick={handleEmail} disabled={loading} style={{width:"100%",padding:"12px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#00ff88,#00ccff)",color:"#000",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",opacity:loading?0.7:1,letterSpacing:0.5}}>
          {loading?"LOADING...":(mode==="login"?"SIGN IN TO CLIPFORGE →":"CREATE FREE ACCOUNT →")}
        </button>
        <div style={{textAlign:"center",marginTop:10,fontSize:10,color:"var(--muted)"}}>100% Free · No credit card · No watermark</div>
      </Card>
    </div>
  </div>;
}

// ── UPLOAD PAGE ──────────────────────────────────────────────
function Upload({ user, setPage, setRealClips, showToast }) {
  const [phase,setPhase]=useState("idle");
  const [url,setUrl]=useState("");
  const [progress,setProgress]=useState(0);
  const [stageLabel,setStageLabel]=useState("");
  const [error,setError]=useState("");
  const inputRef=useRef();
  const galleryRef=useRef();
  const pollRef=useRef();

  const startPolling=(jid)=>{
    pollRef.current=setInterval(async()=>{
      try{
        const job=await api.getJob(jid);
        setProgress(job.progress||0);
        setStageLabel(job.stage_label||job.stage||"Processing...");
        if(job.status==="done"){
          clearInterval(pollRef.current);
          setRealClips(job.clips||[]);
          setPhase("done");
          showToast("🎉 "+(job.clip_count||job.clips?.length||0)+" viral clips generated!");
        }else if(job.status==="error"){
          clearInterval(pollRef.current);
          setError(job.error||"Processing failed");
          setPhase("error");
        }
      }catch(e){console.error(e);}
    },2000);
  };

  const handleFile=async(file)=>{
    if(!file)return;
    setPhase("processing");setError("");setProgress(5);setStageLabel("Uploading...");
    try{
      const res=await api.upload(file,user?.id||"demo");
      if(res.job_id){startPolling(res.job_id);}
      else{setError("Upload failed: "+(res.detail||"Check HF Spaces is running"));setPhase("error");}
    }catch(e){setError("Cannot reach backend: "+e.message);setPhase("error");}
  };

  const handleURL=async()=>{
    if(!url.trim())return;
    setPhase("processing");setError("");setProgress(5);setStageLabel("Downloading...");
    try{
      const res=await api.processURL(url,user?.id||"demo");
      if(res.job_id){startPolling(res.job_id);}
      else{setError("URL failed: "+(res.detail||"Check backend"));setPhase("error");}
    }catch(e){setError("Cannot reach backend: "+e.message);setPhase("error");}
  };

  useEffect(()=>()=>clearInterval(pollRef.current),[]);

  const stages=["Uploading","Transcribing","Detecting clips","Gemini Alpha scoring","Gemini Beta strategy","Reframing 9:16","Burning captions","Thumbnails","Uploading to R2","Growth plan"];

  if(phase==="done")return(
    <div style={{textAlign:"center",padding:"60px 24px 100px",animation:"fadeUp 0.4s ease"}}>
      <div style={{fontSize:56,marginBottom:14,animation:"float 3s ease-in-out infinite"}}>🎬</div>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:20,fontWeight:900,color:"#fff",marginBottom:8,letterSpacing:2}}>CLIPS READY!</div>
      <div style={{color:"var(--muted)",fontSize:12,marginBottom:24}}>Your viral clips are ready to dominate</div>
      <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:260,margin:"0 auto"}}>
        <Btn full size="lg" icon="✂️" onClick={()=>setPage("clips")}>VIEW MY CLIPS</Btn>
        <Btn full variant="ghost" onClick={()=>{setPhase("idle");setProgress(0);setUrl("");}}>UPLOAD ANOTHER</Btn>
      </div>
    </div>
  );

  if(phase==="processing")return(
    <div style={{padding:"24px 16px 100px",animation:"fadeUp 0.4s ease"}}>
      <TopBar title="PROCESSING" sub="AI pipeline running..."/>
      <div style={{padding:16,textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:12,animation:"spin 2s linear infinite"}}>⚙️</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,color:"#fff",marginBottom:18,letterSpacing:1}}>ANALYZING YOUR VIDEO</div>
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:99,height:6,overflow:"hidden",marginBottom:8}}>
          <div style={{height:"100%",width:`${progress}%`,background:"linear-gradient(90deg,#00ff88,#00ccff)",borderRadius:99,transition:"width 0.3s ease",boxShadow:"0 0 12px rgba(0,255,136,0.5)"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:22,fontSize:11,color:"var(--muted)"}}>
          <span>{stageLabel}</span>
          <span style={{color:"#00ff88",fontFamily:"'Share Tech Mono',monospace",fontWeight:700}}>{progress}%</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {stages.map((s,i)=>{
            const done=progress>=Math.round((i+1)/stages.length*100);
            const active=!done&&progress>=Math.round(i/stages.length*100);
            return <div key={i} style={{padding:"6px 9px",borderRadius:8,background:done?"rgba(0,255,136,0.08)":"rgba(255,255,255,0.02)",border:`1px solid ${done?"rgba(0,255,136,0.2)":"rgba(255,255,255,0.04)"}`,fontSize:9,color:done?"#00ff88":active?"#fff":"var(--muted)",display:"flex",alignItems:"center",gap:4}}>
              <span>{done?"✓":active?"⟳":"○"}</span>{s}
            </div>;
          })}
        </div>
      </div>
    </div>
  );

  if(phase==="error")return(
    <div style={{padding:"60px 24px 100px",textAlign:"center",animation:"fadeUp 0.4s ease"}}>
      <div style={{fontSize:44,marginBottom:14}}>❌</div>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,color:"#ff3366",marginBottom:8}}>PROCESSING FAILED</div>
      <div style={{color:"var(--muted)",fontSize:11,marginBottom:22,maxWidth:280,margin:"0 auto 22px",lineHeight:1.7}}>{error}</div>
      <Btn onClick={()=>{setPhase("idle");setError("");}}>TRY AGAIN</Btn>
    </div>
  );

  return(
    <div style={{animation:"fadeUp 0.4s ease",paddingBottom:80}}>
      <TopBar title="UPLOAD" sub="Turn any video into viral clips"/>
      <div style={{padding:16}}>
        <div onClick={()=>inputRef.current?.click()} style={{border:"2px dashed rgba(0,255,136,0.2)",borderRadius:16,padding:"36px 20px",textAlign:"center",cursor:"pointer",marginBottom:10,animation:"glow 3s ease-in-out infinite"}}>
          <input ref={inputRef} type="file" accept="video/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
          <div style={{fontSize:40,marginBottom:10,animation:"float 3s ease-in-out infinite"}}>🎬</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,color:"#fff",marginBottom:5,letterSpacing:1}}>DROP VIDEO HERE</div>
          <div style={{color:"var(--muted)",fontSize:11,marginBottom:12}}>MP4 · MOV · AVI · MKV up to 10GB</div>
          <Btn icon="⚡">CHOOSE FILE</Btn>
        </div>
        <input ref={galleryRef} type="file" accept="video/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
        <Btn variant="dark" full icon="📱" style={{marginBottom:10}} onClick={()=>galleryRef.current?.click()}>PICK FROM GALLERY</Btn>
        <div style={{display:"flex",gap:8,marginBottom:18}}>
          <input value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleURL()}
            placeholder="YouTube · TikTok · Loom · Vimeo URL..."
            style={{flex:1,background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,padding:"11px 13px",color:"var(--text)",fontSize:12}}/>
          <Btn onClick={handleURL}>GO</Btn>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[
            {icon:"🤖",title:"Dual AI Boardroom",desc:"Gemini Alpha + Beta scoring"},
            {icon:"🎯",title:"HookForge™",desc:"10 AI hooks ranked by virality"},
            {icon:"💬",title:"Auto Captions",desc:"99% accuracy · 50+ languages"},
            {icon:"📐",title:"9:16 Reframe",desc:"Face-tracking auto vertical"},
            {icon:"🔮",title:"Viral Predictor",desc:"% chance of 100K+ views"},
            {icon:"🚀",title:"30-Day Plan",desc:"AI growth strategy per clip"},
          ].map((f,i)=>(
            <Card key={i} style={{padding:11,animation:`fadeUp 0.4s ease both`,animationDelay:`${i*0.05}s`}}>
              <div style={{fontSize:18,marginBottom:5}}>{f.icon}</div>
              <div style={{fontSize:10,fontWeight:700,color:"#fff",marginBottom:2,fontFamily:"'Orbitron',sans-serif",letterSpacing:0.3}}>{f.title}</div>
              <div style={{fontSize:9,color:"var(--muted)",lineHeight:1.5}}>{f.desc}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CLIPS PAGE ───────────────────────────────────────────────
function Clips({ user, realClips, showToast }) {
  const [selected,setSelected]=useState(null);
  const [posting,setPosting]=useState(null);

  const downloadClip=(clip)=>{
    const url=clip.clip_url||"";
    if(!url){showToast("❌ No download URL — check R2 storage");return;}
    const a=document.createElement("a");
    a.href=url;a.download=(clip.title||"clip")+".mp4";a.target="_blank";a.click();
    showToast("⬇ Downloading to gallery...");
  };

  const saveToGallery=(clip)=>{
    const url=clip.clip_url||"";
    if(!url){showToast("❌ No clip URL available");return;}
    window.open(url,"_blank");
    showToast("📱 Opening clip — long press to save to gallery");
  };

  const handlePost=async(clip,platform)=>{
    setPosting(clip.id+platform);
    try{
      const res=await api.postTo(platform,clip.clip_url||"",clip.caption||clip.title||"","",clip.hashtags||[]);
      if(res.success)showToast("✅ Posted to "+platform+"!");
      else showToast("❌ "+platform+" error: "+(res.detail||"Check API keys"));
    }catch(e){showToast("❌ "+e.message);}
    setPosting(null);
  };

  if(!realClips||realClips.length===0)return(
    <div style={{padding:"60px 24px 100px",textAlign:"center",animation:"fadeUp 0.4s ease"}}>
      <div style={{fontSize:44,marginBottom:14}}>✂️</div>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,color:"#fff",marginBottom:8,letterSpacing:1}}>NO CLIPS YET</div>
      <div style={{color:"var(--muted)",fontSize:11,marginBottom:22,lineHeight:1.7,maxWidth:260,margin:"0 auto 22px"}}>Upload a video or paste a URL to generate your first viral clips</div>
    </div>
  );

  return(
    <div style={{animation:"fadeUp 0.4s ease",paddingBottom:80}}>
      <TopBar title="MY CLIPS" sub={realClips.length+" clips · Real AI results"}
        right={<Btn size="sm" variant="ghost" onClick={()=>showToast("📦 Downloading all clips...")}>EXPORT ALL</Btn>}/>
      <div style={{padding:"12px 16px 0"}}>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {realClips.map((clip,i)=>(
            <div key={clip.id||i}>
              <Card style={{padding:13,cursor:"pointer",border:`1px solid ${selected===i?"rgba(0,255,136,0.3)":"var(--border)"}`,animation:`fadeUp 0.4s ease both`,animationDelay:`${i*0.07}s`}}
                onClick={()=>setSelected(selected===i?null:i)}>
                <div style={{display:"flex",gap:11,alignItems:"flex-start"}}>
                  <div style={{width:68,height:68,borderRadius:10,background:clip.thumb_url?`url(${clip.thumb_url}) center/cover`:"linear-gradient(135deg,#0a2010,#051008)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",backgroundSize:"cover"}}>
                    {!clip.thumb_url&&<span style={{fontSize:20,opacity:0.5}}>▶</span>}
                    <div style={{position:"absolute",bottom:3,right:3,background:"rgba(0,0,0,0.9)",borderRadius:3,padding:"1px 4px",fontSize:7,fontFamily:"'Share Tech Mono',monospace"}}>{clip.duration?Math.floor(clip.duration)+"s":"—"}</div>
                    {(clip.viral_score||0)>=90&&<div style={{position:"absolute",top:3,left:3,background:"linear-gradient(135deg,#ff3366,#ff6633)",borderRadius:3,padding:"1px 5px",fontSize:6,fontWeight:800,color:"#fff"}}>🔥VIRAL</div>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#fff",marginBottom:3,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{clip.title||"Clip "+(i+1)}</div>
                    <div style={{fontSize:9,color:"var(--muted)",marginBottom:5,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>"{(clip.transcript||"").slice(0,52)}..."</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:5}}>
                      {(clip.tags||[]).slice(0,2).map(t=><Tag key={t} color="#00ff88">{t}</Tag>)}
                      {clip.best_platform&&<Tag color="#00ccff">{clip.best_platform}</Tag>}
                    </div>
                    <div style={{display:"flex",gap:7}}>
                      {Object.entries(clip.platform_scores||{}).slice(0,3).map(([p,s])=>(
                        <div key={p} style={{display:"flex",alignItems:"center",gap:2}}>
                          <span style={{fontSize:7,color:"var(--muted)",fontFamily:"'Share Tech Mono',monospace"}}>{p.slice(0,2)}</span>
                          <div style={{width:18,height:3,borderRadius:99,background:"rgba(255,255,255,0.08)"}}>
                            <div style={{height:"100%",width:`${s}%`,background:s>=90?"#00ff88":s>=80?"#ffcc00":"#ff3366",borderRadius:99}}/>
                          </div>
                          <span style={{fontSize:7,color:s>=90?"#00ff88":s>=80?"#ffcc00":"#ff3366",fontFamily:"'Share Tech Mono',monospace"}}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Ring val={clip.viral_score||clip.score||75} size={42}/>
                </div>
                <div style={{display:"flex",gap:5,marginTop:10}}>
                  <Btn size="sm" variant="ghost" onClick={e=>{e.stopPropagation();showToast("📅 Opening schedule...");}} style={{flex:1,justifyContent:"center"}}>SCHEDULE</Btn>
                  <Btn size="sm" variant="dark" icon="📱" onClick={e=>{e.stopPropagation();saveToGallery(clip);}}>SAVE</Btn>
                  <Btn size="sm" variant="dark" icon="⬇" onClick={e=>{e.stopPropagation();downloadClip(clip);}}>MP4</Btn>
                </div>
              </Card>
              {selected===i&&(
                <div style={{background:"var(--card2)",border:"1px solid rgba(0,255,136,0.15)",borderRadius:12,padding:13,marginTop:5,animation:"fadeIn 0.2s ease"}}>
                  {[
                    {t:"🎯 HOOK ANALYSIS",c:"#00ff88",d:`Hook score: ${clip.hook_score||"—"}/100 · ${clip.hook_sentence||"Strong opening detected"} · Improvement: ${clip.improvement||"Add specific number in first 3 words"}`},
                    {t:"📅 BEST POST TIME",c:"#00ccff",d:`Post on: ${clip.best_post_day||"Tuesday"} at ${clip.best_post_time||"7:00 PM"} · Platform: ${clip.best_platform||"TikTok"} · Viral probability: ${clip.viral_probability||clip.viral_score||75}%`},
                    {t:"💬 AI CAPTION",c:"#ffcc00",d:clip.caption||"Your viral caption appears here after processing."},
                  ].map((p,pi)=>(
                    <div key={pi} style={{padding:9,background:`${p.c}06`,borderRadius:9,border:`1px solid ${p.c}15`,marginBottom:pi<2?7:0}}>
                      <div style={{fontSize:9,color:p.c,fontWeight:700,marginBottom:3,fontFamily:"'Orbitron',sans-serif",letterSpacing:0.3}}>{p.t}</div>
                      <div style={{fontSize:10,color:"var(--muted)",lineHeight:1.6}}>{p.d}</div>
                    </div>
                  ))}
                  {clip.titles&&(
                    <div style={{padding:9,background:"rgba(176,109,255,0.06)",borderRadius:9,border:"1px solid rgba(176,109,255,0.15)",marginTop:7}}>
                      <div style={{fontSize:9,color:"#b06dff",fontWeight:700,marginBottom:5,fontFamily:"'Orbitron',sans-serif",letterSpacing:0.3}}>📝 5 VIRAL TITLE OPTIONS</div>
                      {clip.titles.map((t,ti)=>(
                        <div key={ti} style={{fontSize:10,color:"var(--muted)",padding:"3px 0",borderBottom:ti<4?"1px solid rgba(255,255,255,0.04)":"none"}}>
                          <span style={{color:"#b06dff",fontFamily:"'Share Tech Mono',monospace",marginRight:5}}>{ti+1}.</span>{t}
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
                    <Btn size="sm" variant="ghost" onClick={()=>{navigator.clipboard?.writeText(clip.caption||"");showToast("📋 Caption copied!");}}>COPY CAPTION</Btn>
                    <Btn size="sm" variant="dark" onClick={()=>{navigator.clipboard?.writeText((clip.hashtags||[]).join(" "));showToast("📋 Hashtags copied!");}}>COPY HASHTAGS</Btn>
                  </div>
                  <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--border)"}}>
                    <div style={{fontSize:9,color:"var(--muted)",marginBottom:7,fontFamily:"'Orbitron',sans-serif",letterSpacing:0.3}}>⚡ QUICK POST</div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {[{p:"instagram",icon:"📸",c:"#e1306c"},{p:"facebook",icon:"👥",c:"#1877f2"},{p:"tiktok",icon:"🎵",c:"#ff0050"},{p:"youtube",icon:"▶️",c:"#ff0000"},{p:"x",icon:"𝕏",c:"#1da1f2"}].map(({p,icon,c})=>(
                        <button key={p} onClick={()=>handlePost(clip,p)} disabled={posting===clip.id+p}
                          style={{padding:"6px 11px",borderRadius:8,border:`1px solid ${c}30`,background:`${c}12`,color:c,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",opacity:posting===clip.id+p?0.5:1,display:"flex",alignItems:"center",gap:4}}>
                          <span>{icon}</span>{posting===clip.id+p?"...":p.charAt(0).toUpperCase()+p.slice(1)}
                        </button>
                      ))}
                    </div>
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
  const [tab,setTab]=useState("coach");
  const [chat,setChat]=useState([{role:"ai",msg:"Hey! I'm your AI Growth Coach powered by Gemini Algorithm Whisperer. Tell me your niche and I'll build your zero-to-viral strategy for clip-forge.site!"}]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const endRef=useRef();

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[chat]);

  const send=async()=>{
    if(!input.trim())return;
    const msg=input;setInput("");
    setChat(h=>[...h,{role:"user",msg}]);
    setTyping(true);
    try{
      const res=await api.chat(user?.id||"demo","general",msg);
      setChat(h=>[...h,{role:"ai",msg:res.reply||"Let me think about that..."}]);
    }catch{
      setChat(h=>[...h,{role:"ai",msg:"Coach unavailable. Check GEMINI_KEY_2 in HF Spaces secrets."}]);
    }
    setTyping(false);
  };

  const tabs=[{id:"coach",icon:"🤖",label:"Coach"},{id:"intel",icon:"📡",label:"Intel"},{id:"calendar",icon:"📅",label:"Plan"},{id:"simulator",icon:"🎮",label:"Sim"}];

  return(
    <div style={{animation:"fadeUp 0.4s ease",paddingBottom:80}}>
      <TopBar title="GROWTH ENGINE" sub="Zero to viral · Algorithm Whisperer"/>
      <div style={{display:"flex",borderBottom:"1px solid var(--border)",overflowX:"auto"}}>
        {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:"0 0 auto",padding:"10px 16px",border:"none",borderBottom:`2px solid ${tab===t.id?"#00ff88":"transparent"}`,background:"transparent",color:tab===t.id?"#00ff88":"var(--muted)",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:"'Share Tech Mono',monospace",whiteSpace:"nowrap"}}>{t.icon} {t.label}</button>)}
      </div>
      <div style={{padding:16}}>
        {tab==="coach"&&(
          <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 260px)"}}>
            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,marginBottom:10}}>
              {chat.map((c,i)=>(
                <div key={i} style={{display:"flex",justifyContent:c.role==="user"?"flex-end":"flex-start"}}>
                  <div style={{maxWidth:"85%",padding:"9px 13px",borderRadius:c.role==="user"?"13px 13px 4px 13px":"13px 13px 13px 4px",background:c.role==="user"?"linear-gradient(135deg,#00ff88,#00ccff)":"var(--card2)",color:c.role==="user"?"#000":"#fff",fontSize:12,lineHeight:1.6,fontWeight:c.role==="user"?700:400,border:c.role==="ai"?"1px solid var(--border)":"none"}}>{c.msg}</div>
                </div>
              ))}
              {typing&&<div style={{display:"flex",gap:5,padding:"9px 13px",background:"var(--card2)",borderRadius:"13px 13px 13px 4px",width:"fit-content",border:"1px solid var(--border)"}}>
                {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#00ff88",animation:"pulse 1s ease-in-out infinite",animationDelay:`${i*0.2}s`}}/>)}
              </div>}
              <div ref={endRef}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
                placeholder="Ask your AI growth coach anything..."
                style={{flex:1,background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 13px",color:"var(--text)",fontSize:12}}/>
              <Btn onClick={send}>SEND</Btn>
            </div>
          </div>
        )}
        {tab==="intel"&&(
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {[
              {p:"TikTok",c:"#ff0050",s:"Completion rate >70% triggers instant boost TODAY",u:"NOW",a:"Keep under 45 seconds"},
              {p:"Instagram",c:"#e1306c",s:"Saves = 3x reach multiplier this week",u:"HIGH",a:"Add save this CTA"},
              {p:"YouTube",c:"#ff0000",s:"CTR >10% triggers suggested feed",u:"HIGH",a:"Bold thumbnail + number"},
              {p:"Facebook",c:"#1877f2",s:"Video posts get 5x reach vs images",u:"MEDIUM",a:"Cross-post Reels to FB"},
              {p:"X/Twitter",c:"#1da1f2",s:"Video tweets get 10x impressions vs text",u:"MEDIUM",a:"Always attach clip to tweets"},
            ].map((a,i)=>(
              <Card key={i} style={{padding:11,borderLeft:`3px solid ${a.c}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                  <span style={{fontSize:11,fontWeight:700,color:a.c,fontFamily:"'Orbitron',sans-serif",letterSpacing:0.3}}>{a.p}</span>
                  <Tag color={a.u==="NOW"?"#ff3366":a.u==="HIGH"?"#ffcc00":"#00ccff"}>{a.u}</Tag>
                </div>
                <div style={{fontSize:10,color:"var(--text)",marginBottom:2}}>{a.s}</div>
                <div style={{fontSize:9,color:"var(--muted)"}}>→ {a.a}</div>
              </Card>
            ))}
          </div>
        )}
        {tab==="calendar"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Card glow>
              <div style={{fontSize:12,fontFamily:"'Orbitron',sans-serif",color:"#00ff88",marginBottom:12,letterSpacing:0.5}}>📅 30-DAY ZERO TO VIRAL</div>
              {[
                {w:"WEEK 1",t:"Foundation",d:"Post 3x/day TikTok. Test 5 hook styles. Consistency beats quality now.",c:"#00ff88"},
                {w:"WEEK 2",t:"Double Down",d:"Kill weak hooks. Start Instagram. Engage every comment first 60 mins.",c:"#00ccff"},
                {w:"WEEK 3",t:"Expand",d:"Add YouTube Shorts. Target trending topic daily. Push for 1K TikTok.",c:"#ffcc00"},
                {w:"WEEK 4",t:"MONETIZE",d:"Apply TikTok Creator Fund. YouTube Partner push. First income hits.",c:"#ff3366"},
              ].map((w,i)=>(
                <div key={i} style={{padding:"11px 13px",borderRadius:10,background:"var(--surface)",borderLeft:`3px solid ${w.c}`,marginBottom:7}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:9,color:w.c,fontFamily:"'Orbitron',sans-serif"}}>{w.w}</span>
                    <span style={{fontSize:11,fontWeight:700,color:"#fff"}}>{w.t}</span>
                  </div>
                  <div style={{fontSize:10,color:"var(--muted)",lineHeight:1.6}}>{w.d}</div>
                </div>
              ))}
            </Card>
          </div>
        )}
        {tab==="simulator"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Card style={{background:"linear-gradient(135deg,rgba(176,109,255,0.08),rgba(0,204,255,0.04))",border:"1px solid rgba(176,109,255,0.25)"}}>
              <div style={{fontSize:12,fontFamily:"'Orbitron',sans-serif",color:"#b06dff",marginBottom:8,letterSpacing:0.5}}>🎮 MILLION-FOLLOWER SIMULATOR</div>
              <div style={{fontSize:10,color:"var(--muted)",marginBottom:12,lineHeight:1.7}}>Test your 30-day strategy risk-free. AI simulates algorithm response to your posting pattern.</div>
              <Btn full icon="🎮" onClick={()=>showToast("🎮 Simulation running!")}>RUN SIMULATION</Btn>
            </Card>
            <Card>
              <div style={{fontSize:12,fontFamily:"'Orbitron',sans-serif",color:"#00ff88",marginBottom:10,letterSpacing:0.5}}>📈 PREDICTED TRAJECTORY</div>
              {[
                {p:"Day 7",f:"0 → 340 followers",v:"12K views",c:"#00ff88"},
                {p:"Day 14",f:"340 → 1.2K",v:"89K views",c:"#00ccff"},
                {p:"Day 21",f:"1.2K → 4.8K",v:"380K views",c:"#ffcc00"},
                {p:"Day 30",f:"4.8K → 18K",v:"1.4M views",c:"#ff3366"},
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 11px",background:"var(--surface)",borderRadius:9,marginBottom:7}}>
                  <Tag color={r.c}>{r.p}</Tag>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#fff"}}>{r.f}</div>
                    <div style={{fontSize:9,color:"var(--muted)"}}>{r.v}</div>
                  </div>
                </div>
              ))}
              <div style={{padding:"9px 11px",background:"rgba(0,255,136,0.06)",borderRadius:9,border:"1px solid rgba(0,255,136,0.15)"}}>
                <div style={{fontSize:10,color:"var(--muted)",lineHeight:1.6}}><strong style={{color:"#00ff88"}}>First income:</strong> Day 22. TikTok Creator Fund Day 14. YouTube Partner Day 35.</div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PROFILE / COMMAND CENTER ─────────────────────────────────
function Profile({ user, showToast, onSignOut }) {
  const [tab,setTab]=useState("platforms");
  const [sleepMode,setSleepMode]=useState(false);

  const platforms=[
    {id:"tiktok",name:"TikTok",icon:"🎵",color:"#ff0050",accounts:["TikTok Main","TikTok Niche1","TikTok Niche2","TikTok Viral"],status:"Sandbox"},
    {id:"instagram",name:"Instagram",icon:"📸",color:"#e1306c",accounts:["IG Main","IG Business","IG Niche1","IG Niche2","IG Viral"],status:"Development"},
    {id:"youtube",name:"YouTube",icon:"▶️",color:"#ff0000",accounts:["YT Main","YT Shorts","YT Niche1","YT Niche2","YT Long","YT Viral"],status:"Testing"},
    {id:"facebook",name:"Facebook",icon:"👥",color:"#1877f2",accounts:["FB Page1","FB Page2","FB Page3","FB Page4","FB Page5"],status:"Development"},
    {id:"x",name:"X/Twitter",icon:"𝕏",color:"#1da1f2",accounts:["X Main"],status:"Active"},
  ];

  const tabs=[{id:"platforms",icon:"🌐",label:"Platforms"},{id:"scheduler",icon:"📅",label:"Schedule"},{id:"analytics",icon:"📊",label:"Analytics"},{id:"settings",icon:"⚙️",label:"Settings"}];

  return(
    <div style={{animation:"fadeUp 0.4s ease",paddingBottom:80}}>
      <TopBar title="COMMAND CENTER" sub="clip-forge.site · All platforms"/>
      <div style={{display:"flex",borderBottom:"1px solid var(--border)",overflowX:"auto"}}>
        {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:"0 0 auto",padding:"10px 13px",border:"none",borderBottom:`2px solid ${tab===t.id?"#00ff88":"transparent"}`,background:"transparent",color:tab===t.id?"#00ff88":"var(--muted)",fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontFamily:"'Share Tech Mono',monospace",whiteSpace:"nowrap"}}>{t.icon} {t.label}</button>)}
      </div>
      <div style={{padding:16}}>
        {tab==="platforms"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{padding:"9px 13px",background:"rgba(0,255,136,0.06)",borderRadius:9,border:"1px solid rgba(0,255,136,0.15)",fontSize:10,color:"var(--muted)",lineHeight:1.7}}>
              <strong style={{color:"#00ff88"}}>API keys collected ✅</strong> All platform tokens added to HF Spaces. Connect each account below to enable direct posting to clip-forge.site.
            </div>
            {platforms.map((p,pi)=>(
              <Card key={pi} style={{padding:13,borderTop:`2px solid ${p.color}20`}}>
                <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:9}}>
                  <div style={{width:34,height:34,borderRadius:9,background:`${p.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{p.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#fff",fontFamily:"'Orbitron',sans-serif",letterSpacing:0.3}}>{p.name}</div>
                    <div style={{fontSize:9,color:"var(--muted)"}}>{p.accounts.length} accounts · <span style={{color:p.status==="Active"?"#00ff88":"#ffcc00"}}>{p.status}</span></div>
                  </div>
                </div>
                {p.accounts.map((acc,ai)=>(
                  <div key={ai} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 9px",background:"var(--surface)",borderRadius:7,marginBottom:4}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:"var(--muted)",flexShrink:0}}/>
                    <span style={{flex:1,fontSize:10,color:"var(--muted)"}}>{acc}</span>
                    <Btn size="sm" variant="ghost" onClick={()=>showToast("🔗 "+acc+" — OAuth flow coming once app approved!")} style={{fontSize:9,padding:"4px 9px"}}>CONNECT</Btn>
                  </div>
                ))}
              </Card>
            ))}
          </div>
        )}
        {tab==="scheduler"&&(
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            <Card style={{background:sleepMode?"rgba(0,255,136,0.06)":"var(--card)",border:`1px solid ${sleepMode?"rgba(0,255,136,0.3)":"var(--border)"}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:"#fff",fontFamily:"'Orbitron',sans-serif",letterSpacing:0.5}}>😴 SLEEP MODE</div>
                  <div style={{fontSize:9,color:"var(--muted)",marginTop:2}}>Auto-posts while you sleep</div>
                </div>
                <button onClick={()=>{setSleepMode(!sleepMode);showToast(sleepMode?"Sleep mode OFF":"😴 Sleep mode ON — posts tonight!");}}
                  style={{width:44,height:24,borderRadius:12,background:sleepMode?"#00ff88":"rgba(255,255,255,0.1)",border:"none",cursor:"pointer",transition:"all 0.3s",position:"relative"}}>
                  <div style={{width:18,height:18,borderRadius:"50%",background:sleepMode?"#000":"rgba(255,255,255,0.5)",position:"absolute",top:3,left:sleepMode?23:3,transition:"left 0.3s"}}/>
                </button>
              </div>
              {sleepMode&&<div style={{fontSize:10,color:"#00ff88",lineHeight:1.6,marginTop:9}}>✅ Active · ClipForge will post at optimal times tonight</div>}
            </Card>
            <Card>
              <div style={{fontSize:12,fontFamily:"'Orbitron',sans-serif",color:"#00ff88",marginBottom:10,letterSpacing:0.5}}>📅 POSTING SCHEDULE</div>
              {["7:00 AM · TikTok Main","12:00 PM · Instagram Main","3:00 PM · YouTube Shorts","7:00 PM · TikTok Viral","9:00 AM · Facebook Page1"].map((s,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",background:"var(--surface)",borderRadius:7,marginBottom:5}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:i===0?"#00ff88":"var(--muted)",animation:i===0?"pulse 2s ease-in-out infinite":"none",flexShrink:0}}/>
                  <span style={{flex:1,fontSize:10,color:"var(--text)"}}>{s}</span>
                  <Tag color={i===0?"#00ff88":"var(--muted)"}>{i===0?"NEXT":"QUEUED"}</Tag>
                </div>
              ))}
            </Card>
          </div>
        )}
        {tab==="analytics"&&(
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            <Card glow>
              <div style={{fontSize:12,fontFamily:"'Orbitron',sans-serif",color:"#ffcc00",marginBottom:10,letterSpacing:0.5}}>💰 MONETIZATION TRACKER</div>
              {[
                {p:"TikTok",t:"1K followers → Creator Fund",cur:340,max:1000,c:"#ff0050"},
                {p:"YouTube",t:"1K subs + 4K watch hours",cur:89,max:1000,c:"#ff0000"},
                {p:"Instagram",t:"Reels Bonus Program",cur:520,max:1000,c:"#e1306c"},
                {p:"Facebook",t:"10K followers → In-Stream Ads",cur:1200,max:10000,c:"#1877f2"},
              ].map((m,i)=>(
                <div key={i} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                    <span style={{fontSize:10,fontWeight:700,color:m.c}}>{m.p}</span>
                    <span style={{fontSize:9,color:"var(--muted)"}}>{m.cur.toLocaleString()} / {m.max.toLocaleString()}</span>
                  </div>
                  <div style={{fontSize:9,color:"var(--muted)",marginBottom:4}}>{m.t}</div>
                  <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:99}}>
                    <div style={{height:"100%",width:`${Math.min(100,(m.cur/m.max)*100)}%`,background:m.c,borderRadius:99,transition:"width 1s ease"}}/>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}
        {tab==="settings"&&(
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            <Card>
              <div style={{fontSize:12,fontFamily:"'Orbitron',sans-serif",color:"#fff",marginBottom:10,letterSpacing:0.5}}>👤 ACCOUNT</div>
              <div style={{padding:"9px 12px",background:"var(--surface)",borderRadius:9,marginBottom:10}}>
                <div style={{fontSize:10,color:"var(--muted)",marginBottom:2}}>Signed in as</div>
                <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{user?.email||"demo@clip-forge.site"}</div>
                <div style={{fontSize:9,color:"#00ff88",marginTop:2}}>clip-forge.site · Free Plan · Unlimited clips</div>
              </div>
              <Btn full variant="red" onClick={onSignOut} icon="🚪">SIGN OUT</Btn>
            </Card>
            <Card style={{background:"rgba(0,255,136,0.03)",border:"1px solid rgba(0,255,136,0.15)"}}>
              <div style={{fontSize:12,fontFamily:"'Orbitron',sans-serif",color:"#00ff88",marginBottom:10,letterSpacing:0.5}}>⚡ SYSTEM STATUS</div>
              {[
                {l:"HF Spaces Backend",s:"Online"},{l:"WhisperX Engine",s:"Ready"},
                {l:"Gemini Alpha (Key 1)",s:"Active"},{l:"Gemini Beta (Key 2)",s:"Active"},
                {l:"Cloudflare R2",s:"Connected"},{l:"Supabase DB",s:"Online"},
                {l:"Instagram API",s:"Development"},{l:"Facebook API",s:"Development"},
                {l:"TikTok API",s:"Sandbox"},{l:"YouTube API",s:"Testing"},
                {l:"X API",s:"Active"},
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 9px",background:"var(--surface)",borderRadius:7,marginBottom:4}}>
                  <span style={{fontSize:10,color:"var(--muted)"}}>{s.l}</span>
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:s.s==="Active"||s.s==="Online"||s.s==="Connected"||s.s==="Ready"?"#00ff88":"#ffcc00",animation:"pulse 2s ease-in-out infinite"}}/>
                    <span style={{fontSize:9,color:s.s==="Active"||s.s==="Online"||s.s==="Connected"||s.s==="Ready"?"#00ff88":"#ffcc00",fontFamily:"'Share Tech Mono',monospace",fontWeight:700}}>{s.s}</span>
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
  const avgScore=realClips.length>0?Math.round(realClips.reduce((a,c)=>a+(c.viral_score||75),0)/realClips.length):0;
  const stats=[
    {icon:"✂️",label:"Clips",value:realClips.length>0?String(realClips.length):"0",delta:realClips.length>0?"generated":"upload first",color:"#00ff88"},
    {icon:"🔥",label:"Avg Score",value:avgScore>0?String(avgScore):"—",delta:"viral score",color:"#ffcc00"},
    {icon:"👁",label:"Views",value:"0",delta:"post to track",color:"#00ccff"},
    {icon:"📈",label:"Income",value:"$0",delta:"monetize soon",color:"#ff3366"},
  ];
  return(
    <div style={{animation:"fadeUp 0.4s ease",paddingBottom:80}}>
      <TopBar title="CLIPFORGE" sub={user?.email?.split("@")[0]||"Creator"}
        right={<Btn size="sm" icon="🎬" onClick={()=>setPage("upload")}>UPLOAD</Btn>}/>
      <div style={{padding:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:12}}>
          {stats.map((s,i)=>(
            <Card key={i} style={{padding:12,animation:`fadeUp 0.4s ease both`,animationDelay:`${i*0.07}s`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
                <span style={{fontSize:18}}>{s.icon}</span>
                <Tag color={s.color}>{s.delta}</Tag>
              </div>
              <div style={{fontSize:20,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:"#fff"}}>{s.value}</div>
              <div style={{fontSize:9,color:"var(--muted)",marginTop:2,textTransform:"uppercase",letterSpacing:0.5}}>{s.label}</div>
            </Card>
          ))}
        </div>
        <Card glow style={{marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
            <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#00ff88,#00ccff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🤖</div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:"#fff",fontFamily:"'Orbitron',sans-serif",letterSpacing:0.5}}>AI GROWTH COACH</div>
              <div style={{fontSize:8,color:"#00ff88",display:"flex",alignItems:"center",gap:3}}><span style={{width:4,height:4,borderRadius:"50%",background:"#00ff88",display:"inline-block",animation:"pulse 2s ease-in-out infinite"}}/>GEMINI BETA · LIVE</div>
            </div>
          </div>
          <div style={{fontSize:11,color:"rgba(224,240,255,0.7)",lineHeight:1.7,marginBottom:10,borderLeft:"2px solid rgba(0,255,136,0.3)",paddingLeft:9}}>
            {realClips.length>0
              ?`Great work! You have ${realClips.length} clips ready. Top score: ${Math.max(...realClips.map(c=>c.viral_score||0))}. Post tonight at 7PM for maximum reach.`
              :"Upload your first video to unlock your personalized zero-to-viral strategy. I'll analyze your content and build a 30-day monetization roadmap immediately."}
          </div>
          <Btn variant="ghost" full size="sm" onClick={()=>setPage("growth")}>OPEN GROWTH ENGINE →</Btn>
        </Card>
        {realClips.length>0?(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
              <div style={{fontSize:11,fontWeight:700,color:"#fff",fontFamily:"'Orbitron',sans-serif",letterSpacing:0.5}}>YOUR CLIPS</div>
              <button onClick={()=>setPage("clips")} style={{fontSize:9,color:"#00ff88",background:"none",border:"none",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace"}}>VIEW ALL →</button>
            </div>
            {realClips.slice(0,3).map((c,i)=>(
              <Card key={i} style={{padding:11,marginBottom:7,animation:`fadeUp 0.4s ease both`,animationDelay:`${i*0.07}s`}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <div style={{width:40,height:40,borderRadius:7,background:c.thumb_url?`url(${c.thumb_url}) center/cover`:"linear-gradient(135deg,#0a2010,#051008)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,backgroundSize:"cover"}}>{!c.thumb_url&&"▶"}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:600,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title||"Clip "+(i+1)}</div>
                    <div style={{fontSize:9,color:"var(--muted)",marginTop:1}}>{c.best_platform||"TikTok"} · {c.best_post_time||"7:00 PM"}</div>
                  </div>
                  <Ring val={c.viral_score||75} size={36}/>
                </div>
              </Card>
            ))}
          </div>
        ):(
          <Card style={{padding:18,textAlign:"center",border:"2px dashed rgba(0,255,136,0.18)"}}>
            <div style={{fontSize:32,marginBottom:8}}>🎬</div>
            <div style={{fontSize:12,fontWeight:700,color:"#fff",marginBottom:5,fontFamily:"'Orbitron',sans-serif"}}>READY TO GO VIRAL?</div>
            <div style={{fontSize:10,color:"var(--muted)",marginBottom:14,lineHeight:1.6}}>Upload your first video and ClipForge AI will generate viral clips in minutes</div>
            <Btn full icon="⚡" onClick={()=>setPage("upload")}>UPLOAD FIRST VIDEO</Btn>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [user,setUser]         =useState(null);
  const [loading,setLoading]   =useState(true);
  const [page,setPage]         =useState("dashboard");
  const [toast,setToast]       =useState(null);
  const [realClips,setRealClips]=useState([]);

  useEffect(()=>{
    if(!supabase){setLoading(false);return;}
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session?.user)setUser(session.user);
      setLoading(false);
    });
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      setUser(session?.user||null);
      if(session?.user&&realClips.length===0){
        api.getClips(session.user.id).then(r=>{if(r.clips?.length>0)setRealClips(r.clips);}).catch(()=>{});
      }
    });
    return()=>subscription.unsubscribe();
  },[]);

  // Load existing clips on login
  useEffect(()=>{
    if(user&&realClips.length===0){
      api.getClips(user.id).then(r=>{if(r.clips?.length>0)setRealClips(r.clips);}).catch(()=>{});
    }
  },[user]);

  const showToast=(msg)=>setToast(msg);
  const handleSignOut=async()=>{
    if(supabase)await supabase.auth.signOut();
    setUser(null);setPage("dashboard");setRealClips([]);
  };

  if(loading)return(
    <>
      <style>{CSS}</style>
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:44,animation:"spin 2s linear infinite",marginBottom:14}}>⚙️</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:"#00ff88",letterSpacing:2}}>LOADING CLIPFORGE...</div>
        </div>
      </div>
    </>
  );

  // Auth gate removed for testing - auto-login as demo user
  const activeUser = user || {id:"demo-user", email:"demo@clip-forge.site"};

  const pages={
    dashboard:<Dashboard user={activeUser} setPage={setPage} showToast={showToast} realClips={realClips}/>,
    upload:   <Upload user={activeUser} setPage={setPage} setRealClips={setRealClips} showToast={showToast}/>,
    clips:    <Clips user={activeUser} realClips={realClips} showToast={showToast}/>,
    growth:   <Growth user={activeUser} showToast={showToast}/>,
    profile:  <Profile user={activeUser} showToast={showToast} onSignOut={handleSignOut}/>,
  };

  return(
    <>
      <style>{CSS}</style>
      {toast&&<Toast msg={toast} onClose={()=>setToast(null)}/>}
      <div style={{minHeight:"100vh",background:"var(--bg)",paddingBottom:60}}>
        {pages[page]||pages.dashboard}
        <BottomNav page={page} setPage={setPage}/>
      </div>
    </>
  );
}
