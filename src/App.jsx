import { useState, useEffect } from "react";

const DISCLAIMER = "IMPORTANT DISCLAIMER: This app provides general risk guidance only based on publicly available information about 1080 (sodium fluoroacetate) baiting programs in Australia. It does NOT provide real-time baiting data and should NOT be relied upon as a definitive safety guide. Always check with local councils, national parks, and land management authorities for current baiting programs. Keep pets on leads in all rural and bushland areas. In an emergency, contact the Animal Poisons Helpline: 1300 869 738 or your nearest vet immediately.";

const FONT_STACK = "'Courier New', Courier, monospace";
const DISPLAY_FONT = "Impact, 'Arial Narrow', Arial, sans-serif";

const RISK_REGIONS = [
  { name: "Western Australia (Southwest)", lat: -31.95, lng: 115.86, radius: 800, risk: "EXTREME", color: "#ff2020", notes: "WA uses more 1080 than any other state. Widespread aerial and ground baiting for foxes and wild dogs across agricultural and pastoral land. Karri/Jarrah forests, wheatbelt and pastoral regions are very high risk." },
  { name: "Western Australia (Goldfields-Esperance)", lat: -30.75, lng: 121.47, radius: 700, risk: "EXTREME", color: "#ff2020", notes: "Active livestock protection programs. Vast pastoral stations use 1080 extensively for wild dog control." },
  { name: "Western Australia (Pilbara)", lat: -21.17, lng: 118.62, radius: 600, risk: "HIGH", color: "#ff6600", notes: "Pastoral wild dog baiting programs active. Remote and vast — baited areas may be unmarked." },
  { name: "Western Australia (Kimberley)", lat: -17.66, lng: 128.73, radius: 600, risk: "HIGH", color: "#ff6600", notes: "Cattle station baiting for dingoes and wild dogs. Risk higher in pastoral areas away from towns." },
  { name: "Queensland (Western Outback)", lat: -25.0, lng: 144.0, radius: 700, risk: "HIGH", color: "#ff6600", notes: "Wild dog baiting programs across western QLD. Channel Country and pastoral areas actively baited." },
  { name: "Queensland (Southeast Hinterland)", lat: -27.5, lng: 152.7, radius: 250, risk: "MODERATE", color: "#ffaa00", notes: "Periodic fox and wild dog baiting in national park buffer zones and private land. Check with local councils." },
  { name: "Queensland (Darling Downs)", lat: -27.56, lng: 151.95, radius: 250, risk: "MODERATE", color: "#ffaa00", notes: "Agricultural pest control programs active. Foxes and pigs targeted on farmland." },
  { name: "New South Wales (Western Plains)", lat: -31.5, lng: 146.0, radius: 600, risk: "HIGH", color: "#ff6600", notes: "Large-scale wild dog and fox baiting across western NSW. National Parks and Wildlife Service conducts programs." },
  { name: "New South Wales (Snowy Mountains)", lat: -36.4, lng: 148.5, radius: 200, risk: "MODERATE", color: "#ffaa00", notes: "Pest control for foxes and wild dogs near alpine areas. Check NPWS before entering bushland." },
  { name: "New South Wales (Tablelands)", lat: -33.5, lng: 149.5, radius: 300, risk: "MODERATE", color: "#ffaa00", notes: "Central Tablelands — farming areas with periodic baiting programs." },
  { name: "Victoria (High Country)", lat: -36.9, lng: 147.0, radius: 250, risk: "MODERATE", color: "#ffaa00", notes: "Wild dog and fox control in alpine and sub-alpine areas. Parks Victoria manages programs." },
  { name: "Victoria (Mallee)", lat: -35.0, lng: 142.0, radius: 300, risk: "MODERATE", color: "#ffaa00", notes: "Fox and rabbit control baiting in Mallee regions." },
  { name: "South Australia (Outback/Pastoral)", lat: -30.0, lng: 135.0, radius: 700, risk: "HIGH", color: "#ff6600", notes: "Widespread dingo and wild dog baiting across SA pastoral zones. Extremely remote — baited areas hard to identify." },
  { name: "South Australia (Agricultural South)", lat: -35.1, lng: 138.6, radius: 300, risk: "MODERATE", color: "#ffaa00", notes: "Fox control programs in agricultural areas and national park edges." },
  { name: "Northern Territory (Pastoral/Outback)", lat: -19.5, lng: 133.0, radius: 700, risk: "HIGH", color: "#ff6600", notes: "Dingo and wild dog baiting on cattle stations. Baiting common across remote areas." },
  { name: "Tasmania (Rural North & Midlands)", lat: -41.8, lng: 146.5, radius: 300, risk: "MODERATE", color: "#ffaa00", notes: "Some ongoing wildlife and pest control baiting in rural midlands." },
];

const LOW_RISK_ZONES = [
  { name: "Sydney Metro", lat: -33.87, lng: 151.21, radius: 30 },
  { name: "Melbourne Metro", lat: -37.81, lng: 144.96, radius: 30 },
  { name: "Brisbane Metro", lat: -27.47, lng: 153.03, radius: 20 },
  { name: "Perth Metro", lat: -31.95, lng: 115.86, radius: 25 },
  { name: "Adelaide Metro", lat: -34.93, lng: 138.6, radius: 20 },
  { name: "Hobart", lat: -42.88, lng: 147.33, radius: 15 },
  { name: "Darwin", lat: -12.46, lng: 130.84, radius: 15 },
  { name: "Canberra", lat: -35.28, lng: 149.13, radius: 15 },
];

const RISK_ORDER = ["LOW", "LOW-MODERATE", "MODERATE", "HIGH", "EXTREME"];

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getRecs(risk) {
  const base = [
    "Keep dogs on a lead at all times in rural and bushland areas",
    "Do not let pets roam freely or investigate carcasses or bait stations",
    "If you see a bait station sign, leave the area immediately with all pets",
    "Know the symptoms: vomiting, tremors, seizures — seek vet help immediately",
    "Animal Poisons Helpline: 1300 869 738",
  ];
  if (risk === "EXTREME") return ["⚠️ DO NOT bring dogs into this area if avoidable", "Contact local council or land authority before entering any bushland", "Keep dogs on a short lead at ALL times — no exceptions", "Avoid all unsealed tracks, scrubland, and farm boundaries", ...base];
  if (risk === "HIGH") return ["Strongly consider leaving dogs at pet-friendly accommodation", "Contact local national park or council for current bait notices", "Keep dogs on a short lead at ALL times", "Avoid farm boundaries, bush tracks and scrub", ...base];
  if (risk === "MODERATE") return ["Keep dogs on lead at all times in natural areas", "Check local council websites for current baiting notices", "Avoid walking near farms or unfenced bushland", ...base];
  return ["Stay on marked paths in parks and reserves", "Keep dogs on lead in any bushland or reserve", ...base];
}

function getRiskAssessment(lat, lng) {
  for (const z of LOW_RISK_ZONES) {
    if (getDistanceKm(lat, lng, z.lat, z.lng) < z.radius) {
      return { risk: "LOW", color: "#00cc66", region: z.name, notes: "You are in or near a major metropolitan area. 1080 baiting is generally not conducted in urban zones. Always check local council notices if visiting fringe bushland or reserves.", recommendations: getRecs("LOW") };
    }
  }
  let closest = null, closestDist = Infinity;
  for (const r of RISK_REGIONS) {
    const dist = getDistanceKm(lat, lng, r.lat, r.lng);
    if (dist < closestDist) { closestDist = dist; closest = { ...r }; }
  }
  if (!closest) return null;
  if (closestDist < closest.radius) return { risk: closest.risk, color: closest.color, region: closest.name, notes: closest.notes, recommendations: getRecs(closest.risk) };
  if (closestDist < closest.radius * 1.5) return { risk: "MODERATE", color: "#ffaa00", region: `Near ${closest.name}`, notes: `You are within range of a known baiting zone: ${closest.name}. Risk increases as you travel further from urban centres.`, recommendations: getRecs("MODERATE") };
  return { risk: "LOW-MODERATE", color: "#88cc00", region: "Rural/Semi-rural area", notes: "You appear to be in a lower-risk area, but 1080 baiting can occur on private land throughout Australia. If in rural or bushland areas, treat as moderate risk.", recommendations: getRecs("LOW-MODERATE") };
}

async function checkOnline() {
  if (!navigator.onLine) return false;
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 4000);
    await fetch("https://api.anthropic.com/v1/models", { method: "HEAD", signal: ctrl.signal });
    return true;
  } catch { return false; }
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [location, setLocation] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [locError, setLocError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState("idle"); // idle | checking | online | offline | error

  useEffect(() => {
    const up = () => setIsOnline(true);
    const dn = () => setIsOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", dn);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", dn); };
  }, []);

  const startCheck = () => {
    setScreen("loading");
    setLocError(null);
    setAiResult(null);
    setAiStatus("idle");
    if (!navigator.geolocation) { setLocError("Geolocation is not supported by this device."); setScreen("result"); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        const result = getRiskAssessment(latitude, longitude);
        setAssessment(result);
        setScreen("result");
        setAiStatus("checking");
        const online = await checkOnline();
        setIsOnline(online);
        if (online && result) { fetchAI(latitude, longitude, result); }
        else { setAiStatus("offline"); }
      },
      () => { setLocError("Unable to get location. Please enable location permissions and try again."); setScreen("result"); },
      { timeout: 12000, maximumAge: 60000 }
    );
  };

  const fetchAI = async (lat, lng, result) => {
    setAiLoading(true);
    setAiStatus("online");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are an expert on 1080 (sodium fluoroacetate) pest baiting programs in Australia. Give concise, practical safety advice. Respond in 2-3 short plain-text paragraphs. No markdown, no bullet points, no headers.",
          messages: [{ role: "user", content: "User is at lat " + lat.toFixed(3) + ", lng " + lng.toFixed(3) + " in Australia. Risk region: " + result.region + ", risk level: " + result.risk + ". Context: " + result.notes + ". Explain in under 200 words: 1) why this area has this risk level, 2) what 1080 is used for here, 3) the single most important safety action for this specific location. Plain text only." }]
        })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      setAiResult(text || null);
      if (!text) setAiStatus("error");
    } catch { setAiResult(null); setAiStatus("error"); }
    setAiLoading(false);
  };

  const riskPct = assessment ? ((RISK_ORDER.indexOf(assessment.risk) + 1) / RISK_ORDER.length) * 100 : 0;

  const card = { background: "#0c1810", border: "1px solid #162b1e", borderRadius: 10, padding: 16 };
  const lbl = { fontSize: 9, color: "#3a6a4a", letterSpacing: "0.18em", marginBottom: 6 };
  const btn = (primary) => ({
    cursor: "pointer", border: primary ? "none" : "1px solid #162b1e",
    background: primary ? "#1a9e48" : "transparent",
    color: primary ? "#040a06" : "#3a6a4a",
    fontFamily: FONT_STACK, letterSpacing: "0.08em",
    width: "100%", borderRadius: 8, padding: "13px 20px",
    fontSize: 12, textTransform: "uppercase", fontWeight: primary ? "bold" : "normal",
    transition: "all 0.18s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#080e0a", color: "#ddeee3", fontFamily: FONT_STACK, display: "flex", flexDirection: "column" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1a3a24}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp 0.45s ease forwards}
        @keyframes spin{to{transform:rotate(360deg)}}.spin{animation:spin 0.9s linear infinite}
        @keyframes pulse{0%{transform:scale(0.9);opacity:0.7}100%{transform:scale(2.1);opacity:0}}.pulse{animation:pulse 2s ease-out infinite}
        @keyframes fillBar{from{width:0}to{width:var(--w)}}.bar{animation:fillBar 1.1s cubic-bezier(.2,1,.3,1) forwards}
        button:hover{opacity:0.82;transform:translateY(-1px)}button:active{transform:translateY(0)}
      `}</style>

      {/* Header */}
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid #162b1e", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, background: "#1a9e48", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚠</div>
        <div>
          <div style={{ fontFamily: DISPLAY_FONT, fontSize: 20, letterSpacing: "0.1em", color: "#b8f0cc" }}>1080 BAIT ALERT</div>
          <div style={{ fontSize: 9, color: "#3a6a4a", letterSpacing: "0.18em" }}>AUSTRALIA TRAVEL SAFETY</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.1em", padding: "3px 8px", borderRadius: 20, fontWeight: "bold", background: isOnline ? "#0a2e16" : "#1a0800", color: isOnline ? "#1a9e48" : "#cc4400", border: `1px solid ${isOnline ? "#1a9e48" : "#cc4400"}` }}>
            {isOnline ? "● ONLINE" : "● OFFLINE"}
          </div>
          <button onClick={() => setScreen("info")} style={{ background: "transparent", border: "none", color: "#3a6a4a", fontSize: 18, cursor: "pointer", padding: "4px 6px" }}>ℹ</button>
        </div>
      </div>

      {/* HOME */}
      {screen === "home" && (
        <div className="fu" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, gap: 28 }}>
          <div style={{ textAlign: "center", maxWidth: 360 }}>
            <div style={{ fontFamily: DISPLAY_FONT, fontSize: 52, lineHeight: 1.05, color: "#b8f0cc", letterSpacing: "0.05em", marginBottom: 14 }}>IS IT SAFE<br />WHERE YOU<br />ARE?</div>
            <div style={{ color: "#3a6a4a", fontSize: 12, lineHeight: 1.8 }}>1080 baits are used widely across Australia for pest control. They are <span style={{ color: "#ffaa00", fontWeight: "bold" }}>lethal to dogs</span> — and risk areas aren't always signed.</div>
          </div>
          <div style={{ position: "relative", width: 90, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="pulse" style={{ position: "absolute", width: 70, height: 70, border: "2px solid #1a9e48", borderRadius: "50%", top: 10, left: 10 }} />
            <div className="pulse" style={{ position: "absolute", width: 70, height: 70, border: "2px solid #1a9e48", borderRadius: "50%", top: 10, left: 10, animationDelay: "0.8s" }} />
            <div style={{ fontSize: 46, position: "relative", zIndex: 1 }}>🐾</div>
          </div>
          <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 10 }}>
            <button style={btn(true)} onClick={() => setScreen("disclaimer")}>📍 Check My Location Risk</button>
            <button style={btn(false)} onClick={() => setScreen("info")}>Learn About 1080 Baits</button>
          </div>
          {!isOnline && (
            <div style={{ background: "#1a0e00", border: "1px solid #664400", borderRadius: 8, padding: "10px 14px", fontSize: 11, color: "#cc8833", maxWidth: 340, textAlign: "center", lineHeight: 1.7 }}>
              📵 You're offline — the app works fully using built-in regional data. AI analysis will be unavailable until you have signal.
            </div>
          )}
          <div style={{ color: "#1a3a24", fontSize: 9, letterSpacing: "0.12em", textAlign: "center" }}>FOR PET OWNERS · CAMPERS · TRAIL USERS · RURAL TRAVELLERS</div>
        </div>
      )}

      {/* DISCLAIMER */}
      {screen === "disclaimer" && (
        <div className="fu" style={{ flex: 1, overflowY: "auto", padding: "24px 20px 48px" }}>
          <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#150800", border: "1px solid #cc4400", borderRadius: 10, padding: 18 }}>
              <div style={{ fontFamily: DISPLAY_FONT, fontSize: 18, color: "#cc4400", letterSpacing: "0.1em", marginBottom: 10 }}>⚠ IMPORTANT DISCLAIMER</div>
              <div style={{ color: "#aa7744", fontSize: 11, lineHeight: 1.9 }}>{DISCLAIMER}</div>
            </div>
            <div style={{ ...card, fontSize: 11, color: "#3a6a4a", lineHeight: 1.9 }}>
              <div style={{ color: "#1a9e48", fontWeight: "bold", marginBottom: 6 }}>HOW THIS APP WORKS</div>
              Uses built-in regional data on known 1080 baiting zones across all Australian states and territories combined with your GPS to estimate risk. This works completely offline.
              {isOnline
                ? " You're online — a live AI analysis will also be generated for your specific location."
                : " You're currently offline — full risk assessment still works. AI analysis will be skipped until you have signal."}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button style={btn(true)} onClick={startCheck}>I Understand — Check My Risk</button>
              <button style={btn(false)} onClick={() => setScreen("home")}>Go Back</button>
            </div>
          </div>
        </div>
      )}

      {/* LOADING */}
      {screen === "loading" && (
        <div className="fu" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <div className="spin" style={{ width: 44, height: 44, border: "3px solid #162b1e", borderTop: "3px solid #1a9e48", borderRadius: "50%" }} />
          <div style={{ color: "#3a6a4a", fontSize: 11, letterSpacing: "0.18em" }}>LOCATING YOU...</div>
        </div>
      )}

      {/* RESULT */}
      {screen === "result" && (
        <div className="fu" style={{ flex: 1, overflowY: "auto", padding: "20px 20px 48px" }}>
          <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
            {locError && <div style={{ background: "#150000", border: "1px solid #cc2222", borderRadius: 10, padding: 14, color: "#ff8888", fontSize: 12 }}>⚠ {locError}</div>}
            {assessment && (
              <>
                {/* Risk card */}
                <div style={{ background: "#0c1810", border: `2px solid ${assessment.color}`, borderRadius: 12, padding: 20, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, right: 0, width: 110, height: 110, background: assessment.color, opacity: 0.07, borderRadius: "0 0 0 100%" }} />
                  <div style={lbl}>RISK LEVEL</div>
                  <div style={{ fontFamily: DISPLAY_FONT, fontSize: 50, color: assessment.color, letterSpacing: "0.06em", lineHeight: 1 }}>{assessment.risk}</div>
                  <div style={{ fontSize: 11, color: "#6a9a7a", marginTop: 4 }}>{assessment.region}</div>
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#1a3a24", letterSpacing: "0.06em", marginBottom: 5 }}>
                      {RISK_ORDER.map(r => <span key={r}>{r}</span>)}
                    </div>
                    <div style={{ height: 7, background: "#162b1e", borderRadius: 4, overflow: "hidden" }}>
                      <div className="bar" style={{ "--w": `${riskPct}%`, height: "100%", background: `linear-gradient(90deg,#00cc66,${assessment.color})`, borderRadius: 4, width: 0 }} />
                    </div>
                  </div>
                </div>

                {/* Coordinates */}
                {location && (
                  <div style={{ ...card, display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ fontSize: 20 }}>📍</div>
                    <div>
                      <div style={lbl}>YOUR COORDINATES</div>
                      <div style={{ fontSize: 12, color: "#6a9a7a" }}>{location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°</div>
                    </div>
                  </div>
                )}

                {/* Regional context */}
                <div style={card}>
                  <div style={lbl}>REGIONAL RISK CONTEXT</div>
                  <div style={{ fontSize: 12, color: "#6a9a7a", lineHeight: 1.9 }}>{assessment.notes}</div>
                </div>

                {/* AI Panel — smart connectivity states */}
                <div style={{ ...card, background: "#080e0a", borderColor: aiResult ? "#1a3a24" : "#0e1e14" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={lbl}>AI RISK ANALYSIS</div>
                    {aiStatus === "checking" && <div style={{ fontSize: 9, color: "#3a6a4a", background: "#0c1810", padding: "2px 7px", borderRadius: 4 }}>CHECKING CONNECTION...</div>}
                    {(aiStatus === "online" || aiResult) && <div style={{ fontSize: 9, color: "#1a9e48", background: "#0a1e10", padding: "2px 7px", borderRadius: 4, border: "1px solid #1a3a24" }}>● ONLINE</div>}
                    {aiStatus === "offline" && <div style={{ fontSize: 9, color: "#cc4400", background: "#1a0800", padding: "2px 7px", borderRadius: 4, border: "1px solid #662200" }}>● OFFLINE</div>}
                    {aiStatus === "error" && <div style={{ fontSize: 9, color: "#aaaa00", background: "#1a1800", padding: "2px 7px", borderRadius: 4, border: "1px solid #555500" }}>● ERROR</div>}
                  </div>

                  {aiLoading && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#3a6a4a", fontSize: 11 }}>
                      <div className="spin" style={{ width: 13, height: 13, border: "2px solid #162b1e", borderTop: "2px solid #1a9e48", borderRadius: "50%", flexShrink: 0 }} />
                      Fetching live analysis for your location...
                    </div>
                  )}

                  {!aiLoading && aiResult && (
                    <div style={{ fontSize: 12, color: "#6a9a7a", lineHeight: 1.9 }}>{aiResult}</div>
                  )}

                  {!aiLoading && aiStatus === "offline" && (
                    <div style={{ fontSize: 11, color: "#3a5a3a", lineHeight: 1.8 }}>
                      📵 No internet connection detected. AI analysis is unavailable right now.<br /><br />
                      All risk data above is from the built-in offline database and is still accurate. Find signal or Wi-Fi to load an AI analysis.
                    </div>
                  )}

                  {!aiLoading && aiStatus === "error" && (
                    <div style={{ fontSize: 11, color: "#3a5a3a", lineHeight: 1.8 }}>
                      Could not load AI analysis. The offline risk data above is still fully accurate.
                      <br />
                      <button onClick={() => fetchAI(location.lat, location.lng, assessment)} style={{ ...btn(false), width: "auto", marginTop: 10, padding: "7px 14px", fontSize: 10 }}>Retry</button>
                    </div>
                  )}

                  {!aiLoading && aiStatus === "checking" && (
                    <div style={{ fontSize: 11, color: "#3a5a3a" }}>Checking connectivity...</div>
                  )}
                </div>

                {/* Recommendations */}
                <div style={card}>
                  <div style={lbl}>SAFETY RECOMMENDATIONS</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                    {assessment.recommendations.map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div style={{ width: 20, height: 20, background: `${assessment.color}18`, border: `1px solid ${assessment.color}44`, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: assessment.color, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                        <div style={{ fontSize: 12, color: "#6a9a7a", lineHeight: 1.8 }}>{r}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency */}
                <div style={{ background: "#150600", border: "1px solid #aa3300", borderRadius: 10, padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ fontSize: 26 }}>🚨</div>
                  <div>
                    <div style={{ fontSize: 9, color: "#aa3300", letterSpacing: "0.15em", marginBottom: 4 }}>EMERGENCY CONTACTS</div>
                    <div style={{ fontSize: 12, color: "#aa7744", lineHeight: 1.9 }}>
                      Animal Poisons Helpline: <strong style={{ color: "#ffaa00" }}>1300 869 738</strong><br />
                      Emergency Vet: <strong>seek nearest immediately</strong>
                    </div>
                  </div>
                </div>

                <button style={btn(false)} onClick={() => setScreen("home")}>← Back to Home</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* INFO */}
      {screen === "info" && (
        <div className="fu" style={{ flex: 1, overflowY: "auto", padding: "20px 20px 48px" }}>
          <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontFamily: DISPLAY_FONT, fontSize: 34, color: "#b8f0cc", letterSpacing: "0.08em" }}>ABOUT 1080 BAITS</div>
            {[
              { icon: "☠️", title: "What is 1080?", body: "Sodium fluoroacetate (1080) is a naturally occurring toxin used across Australia as a pesticide to control introduced pests including foxes, wild dogs, feral pigs, and rabbits. It is colourless, odourless, and tasteless — making it impossible to detect by sight or smell." },
              { icon: "🐕", title: "Why is it dangerous to dogs?", body: "Dogs are extremely sensitive to 1080. Even a tiny amount — a fragment of a bait — can be fatal. There is no antidote. Symptoms include vomiting, anxiety, tremors, and seizures, typically within 30 minutes to 6 hours of ingestion." },
              { icon: "🗺️", title: "Where is it used in Australia?", body: "Western Australia uses 1080 most extensively — more than any other state. It is also widely used in Queensland, NSW, South Australia, Victoria, the Northern Territory, and Tasmania. Baiting occurs on private farmland, national parks, and pastoral leases — often without permanent or visible signage." },
              { icon: "📋", title: "Legal requirements", body: "Landholders are required to erect warning signs, but signs can be damaged, removed, or placed only at main access points. Remote properties may have active baiting programs across thousands of hectares. Always check with local councils and park authorities before entering rural or bushland areas." },
              { icon: "🔬", title: "Types of baits used", body: "Common bait types include Doggone® meat baits, Foxoff® baits, Pigout® (for pigs), and Pindone rabbit baits. They may be buried, placed in bait stations, or aerially dropped in remote areas. Aerial baiting is common in WA, QLD and SA." },
              { icon: "📞", title: "If your pet is affected", body: "Contact the Animal Poisons Helpline immediately: 1300 869 738. Get to a vet as fast as possible — do not wait for symptoms to worsen. There is no specific antidote but early supportive care can significantly improve survival chances." },
            ].map((item, i) => (
              <div key={i} style={card}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 20, marginTop: 1 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, color: "#1a9e48", fontWeight: "bold", letterSpacing: "0.06em", marginBottom: 6 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: "#6a9a7a", lineHeight: 1.8 }}>{item.body}</div>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ ...card, fontSize: 10, color: "#1a3a24", lineHeight: 1.8 }}>
              <span style={{ color: "#2a5a34" }}>DATA SOURCES: </span>DPIRD WA, DAF QLD, DPIE NSW, DEECA VIC, PIRSA SA, DPIF NT, DPIPWE TAS, Parks Australia, APVMA, Invasive Animals CRC.
            </div>
            <button style={btn(false)} onClick={() => setScreen("home")}>← Back to Home</button>
          </div>
        </div>
      )}
    </div>
  );
}
