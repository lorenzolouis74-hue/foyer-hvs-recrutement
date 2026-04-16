import { useState, useEffect, useRef } from "react";

const WEBHOOK_URL = "https://discord.com/api/webhooks/1494444022738190496/eZBQLRT3-6Knk7p-Qb9ZVeUIpsenHN3VQ1m7n-6iIUHe6nt7qRo2deVR_bgpQNLw5rfP"; // ← à remplacer

const QUESTIONS = [
  { id: "age",        label: "Quel âge as-tu ?",                                                                          type: "short", placeholder: "Ex: 17 ans",              icon: "👤" },
  { id: "presence",   label: "Combien d'heures par semaine peux-tu être actif sur le serveur ?",                          type: "short", placeholder: "Ex: 15h/semaine",          icon: "⏱️" },
  { id: "experience", label: "As-tu déjà été modérateur sur un autre serveur ? Si oui, lequel et pendant combien de temps ?", type: "long",  placeholder: "Décris ton expérience...", icon: "🛡️" },
  { id: "situation",  label: "Un membre spam dans plusieurs salons. Que fais-tu étape par étape ?",                       type: "long",  placeholder: "Explique ta réaction...",    icon: "⚠️" },
  { id: "conflit",    label: "Deux membres se disputent agressivement. Comment tu gères ça ?",                            type: "long",  placeholder: "Décris ta façon de gérer...",icon: "⚖️" },
  { id: "motivation", label: "Pourquoi tu veux devenir modérateur sur foyer_HVS ?",                                       type: "long",  placeholder: "Sois sincère...",             icon: "🔥" },
  { id: "extra",      label: "Autre chose à nous dire sur toi ?",                                                         type: "long",  placeholder: "Optionnel — pseudo Discord, dispo...", icon: "✨" },
];

function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = canvas.offsetWidth);
    let H = (canvas.height = canvas.offsetHeight);
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.alpha})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

function ProgressBar({ current, total }) {
  const pct = (current / total) * 100;
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#6366f1", letterSpacing: 2, textTransform: "uppercase" }}>
        <span>Progression</span><span>{current}/{total}</span>
      </div>
      <div style={{ height: 3, background: "rgba(99,102,241,0.15)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #6366f1, #a855f7)", borderRadius: 99, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
}

function QuestionStep({ q, value, onChange, onNext, onPrev, index, total, isLast }) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80); }, [q.id]);
  const canProceed = q.id === "extra" || value.trim().length >= 2;
  const handleKey = (e) => { if (e.key === "Enter" && q.type === "short" && canProceed) { e.preventDefault(); onNext(); } };
  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    background: focused ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${focused ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
    borderRadius: 12, padding: "14px 18px", color: "#e2e8f0", fontSize: 15,
    fontFamily: "'Sora', sans-serif", outline: "none", transition: "all 0.2s",
    boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
  };
  return (
    <div style={{ animation: "slideUp 0.45s cubic-bezier(0.4,0,0.2,1) both" }}>
      <ProgressBar current={index} total={total} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{q.icon}</div>
        <div>
          <div style={{ fontSize: 11, color: "#6366f1", fontFamily: "'Space Mono', monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Question {index + 1}</div>
          <div style={{ fontSize: 16, color: "#e2e8f0", fontWeight: 600, lineHeight: 1.4, fontFamily: "'Sora', sans-serif" }}>{q.label}</div>
        </div>
      </div>
      {q.type === "short"
        ? <input ref={inputRef} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={handleKey} placeholder={q.placeholder} style={inputStyle} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
        : <textarea ref={inputRef} value={value} onChange={(e) => onChange(e.target.value)} placeholder={q.placeholder} rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      }
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, gap: 12 }}>
        {index > 0
          ? <button onClick={onPrev} style={{ padding: "11px 22px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#94a3b8", cursor: "pointer", fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 1 }}>← RETOUR</button>
          : <div />
        }
        <button onClick={onNext} disabled={!canProceed} style={{ padding: "11px 28px", borderRadius: 10, background: canProceed ? "linear-gradient(135deg, #6366f1, #a855f7)" : "rgba(255,255,255,0.05)", border: "none", color: canProceed ? "#fff" : "#475569", cursor: canProceed ? "pointer" : "not-allowed", fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 1, fontWeight: 700, boxShadow: canProceed ? "0 4px 20px rgba(99,102,241,0.35)" : "none" }}>
          {isLast ? "ENVOYER ✦" : "SUIVANT →"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [step, setStep] = useState(0);
  const [pseudo, setPseudo] = useState("");
  const [answers, setAnswers] = useState({});
  const [sending, setSending] = useState(false);

  const sendToDiscord = async (pseudo, answers) => {
    if (!WEBHOOK_URL || WEBHOOK_URL === "METS_TON_WEBHOOK_ICI") return;
    const fields = QUESTIONS.map(q => ({
      name: `${q.icon} ${q.label}`,
      value: answers[q.id] || "—",
      inline: false,
    }));
    const payload = {
      content: "🔔 **Nouvelle candidature modérateur !**",
      embeds: [{
        title: `📋 Candidature — ${pseudo}`,
        color: 0x6366f1,
        fields,
        footer: { text: "foyer_HVS 🏫 · Recrutement Modérateur" },
        timestamp: new Date().toISOString(),
      }]
    };
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  const handleSubmit = async () => {
    setSending(true);
    try { await sendToDiscord(pseudo, answers); } catch(e) {}
    setSending(false);
    setView("success");
  };

  const resetForm = () => { setStep(0); setPseudo(""); setAnswers({}); setView("form"); };

  const S = {
    page: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", position: "relative" },
    card: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "36px 40px", backdropFilter: "blur(12px)" },
    btn: (active) => ({ padding: "16px 44px", borderRadius: 14, background: active ? "linear-gradient(135deg, #6366f1, #a855f7)" : "rgba(255,255,255,0.05)", border: "none", color: active ? "#fff" : "#475569", fontSize: 15, fontFamily: "'Space Mono', monospace", letterSpacing: 1.5, fontWeight: 700, cursor: active ? "pointer" : "not-allowed", boxShadow: active ? "0 8px 32px rgba(99,102,241,0.4)" : "none", width: "100%", maxWidth: 320 }),
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background: #080a12; }
        @keyframes slideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.3); border-radius:99px; }
        input::placeholder, textarea::placeholder { color:#334155; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#080a12", fontFamily: "'Sora', sans-serif", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "fixed", top: -200, left: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "fixed", bottom: -150, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* HOME */}
        {view === "home" && (
          <div style={{ ...S.page }}>
            <Particles />
            <div style={{ maxWidth: 520, width: "100%", textAlign: "center", animation: "slideUp 0.6s ease both", position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 99, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)", marginBottom: 32, fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#818cf8", letterSpacing: 2 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", animation: "pulse 2s infinite" }} />
                RECRUTEMENT OUVERT
              </div>
              <h1 style={{ fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16, letterSpacing: -1 }}>
                <span style={{ color: "#e2e8f0" }}>Deviens</span><br />
                <span style={{ background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Modérateur</span><br />
                <span style={{ color: "#94a3b8", fontWeight: 300, fontSize: "0.6em" }}>foyer_HVS</span>
              </h1>
              <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.7, maxWidth: 420, margin: "0 auto 40px", fontWeight: 300 }}>
                Tu veux rejoindre l'équipe et contribuer à garder le serveur safe et actif ? Remplis ce formulaire, on lit toutes les candidatures.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 48 }}>
                {[["7", "questions"], ["~5min", "durée"], ["📬", "réponse en DM"]].map(([val, lbl]) => (
                  <div key={lbl} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#a5b4fc", fontFamily: "'Space Mono', monospace" }}>{val}</div>
                    <div style={{ fontSize: 10, color: "#475569", fontFamily: "'Space Mono', monospace", letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{lbl}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setView("form")} style={S.btn(true)}>POSTULER MAINTENANT ✦</button>
            </div>
          </div>
        )}

        {/* FORM */}
        {view === "form" && (
          <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
            <div style={{ maxWidth: 580, width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
                <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 12, fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>← ACCUEIL</button>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#334155", letterSpacing: 2 }}>foyer_HVS · Recrutement</div>
              </div>
              <div style={S.card}>
                {!pseudo ? (
                  <div style={{ animation: "slideUp 0.4s ease both" }}>
                    <ProgressBar current={0} total={QUESTIONS.length} />
                    <div style={{ marginBottom: 28 }}>
                      <div style={{ fontSize: 11, color: "#6366f1", fontFamily: "'Space Mono', monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Avant de commencer</div>
                      <h2 style={{ fontSize: 20, color: "#e2e8f0", fontWeight: 700 }}>C'est quoi ton pseudo Discord ?</h2>
                    </div>
                    <input autoFocus value={pseudo} onChange={(e) => setPseudo(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && pseudo.trim().length > 1) setStep(0); }}
                      placeholder="Ex: Lorenzo#4521"
                      style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 18px", color: "#e2e8f0", fontSize: 15, fontFamily: "'Sora', sans-serif", outline: "none" }}
                    />
                    <button onClick={() => { if (pseudo.trim().length > 1) setStep(0); }} disabled={pseudo.trim().length < 2}
                      style={{ marginTop: 20, width: "100%", padding: "13px", borderRadius: 10, border: "none", background: pseudo.trim().length > 1 ? "linear-gradient(135deg, #6366f1, #a855f7)" : "rgba(255,255,255,0.05)", color: pseudo.trim().length > 1 ? "#fff" : "#475569", cursor: pseudo.trim().length > 1 ? "pointer" : "not-allowed", fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 1, fontWeight: 700 }}>
                      COMMENCER →
                    </button>
                  </div>
                ) : (
                  <QuestionStep key={step} q={QUESTIONS[step]}
                    value={answers[QUESTIONS[step].id] || ""}
                    onChange={(v) => setAnswers(prev => ({ ...prev, [QUESTIONS[step].id]: v }))}
                    onNext={() => { if (step < QUESTIONS.length - 1) setStep(step + 1); else handleSubmit(); }}
                    onPrev={() => { if (step > 0) setStep(step - 1); else setPseudo(""); }}
                    index={step} total={QUESTIONS.length} isLast={step === QUESTIONS.length - 1}
                  />
                )}
              </div>
              {sending && <div style={{ textAlign: "center", color: "#6366f1", fontFamily: "'Space Mono', monospace", fontSize: 12, marginTop: 16, letterSpacing: 1 }}>ENVOI EN COURS...</div>}
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {view === "success" && (
          <div style={{ ...S.page }}>
            <div style={{ maxWidth: 480, width: "100%", textAlign: "center", animation: "slideUp 0.5s ease both" }}>
              <div style={{ fontSize: 64, marginBottom: 24 }}>🎯</div>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: "#e2e8f0", marginBottom: 12 }}>Candidature envoyée !</h2>
              <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
                On a bien reçu ta demande, <strong style={{ color: "#a5b4fc" }}>{pseudo}</strong>.<br />
                L'équipe va l'examiner et te répondre en DM Discord. 📬
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button onClick={() => setView("home")} style={{ padding: "12px 28px", borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #a855f7)", border: "none", color: "#fff", cursor: "pointer", fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 1 }}>← ACCUEIL</button>
                <button onClick={resetForm} style={{ padding: "12px 28px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#64748b", cursor: "pointer", fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 1 }}>NOUVELLE CANDIDATURE</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
