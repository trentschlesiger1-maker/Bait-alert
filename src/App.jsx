import { useState, useEffect } from "react";
const DISCLAIMER = `IMPORTANT DISCLAIMER: This app provides general risk guidance only based
const FONT_STACK = "'Courier New', Courier, monospace";
const DISPLAY_FONT = "Impact, 'Arial Narrow', Arial, sans-serif";
const RISK_REGIONS = [
{ name: "Western Australia (Southwest)", lat: -31.95, lng: 115.86, radius: 800, risk: "EXTR
{ name: "Western Australia (Goldfields-Esperance)", lat: -30.75, lng: 121.47, radius: 700,
{ name: "Western Australia (Pilbara)", lat: -21.17, lng: 118.62, radius: 600, risk: "HIGH",
{ name: "Western Australia (Kimberley)", lat: -17.66, lng: 128.73, radius: 600, risk: "HIGH
{ name: "Queensland (Western Outback)", lat: -25.0, lng: 144.0, radius: 700, risk: "HIGH",
{ name: "Queensland (Southeast Hinterland)", lat: -27.5, lng: 152.7, radius: 250, risk: "MO
{ name: "Queensland (Darling Downs)", lat: -27.56, lng: 151.95, radius: 250, risk: "MODERAT
{ name: "New South Wales (Western Plains)", lat: -31.5, lng: 146.0, radius: 600, risk: "HIG
{ name: "New South Wales (Snowy Mountains)", lat: -36.4, lng: 148.5, radius: 200, risk: "MO
{ name: "New South Wales (Tablelands)", lat: -33.5, lng: 149.5, radius: 300, risk: "MODERAT
{ name: "Victoria (High Country)", lat: -36.9, lng: 147.0, radius: 250, risk: "MODERATE", c
{ name: "Victoria (Mallee)", lat: -35.0, lng: 142.0, radius: 300, risk: "MODERATE", color:
{ name: "South Australia (Outback/Pastoral)", lat: -30.0, lng: 135.0, radius: 700, risk: "H
{ name: "South Australia (Agricultural South)", lat: -35.1, lng: 138.6, radius: 300, risk:
{ name: "Northern Territory (Pastoral/Outback)", lat: -19.5, lng: 133.0, radius: 700, risk:
{ name: "Tasmania (Rural North & Midlands)", lat: -41.8, lng: 146.5, radius: 300, risk: "MO
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
const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Mat
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
if (risk === "EXTREME") return [" DO NOT bring dogs into this area if avoidable", "Contac
if (risk === "HIGH") return ["Strongly consider leaving dogs at pet-friendly accommodation"
if (risk === "MODERATE") return ["Keep dogs on lead at all times in natural areas", "Check
return ["Stay on marked paths in parks and reserves", "Keep dogs on lead in any bushland or
}
function getRiskAssessment(lat, lng) {
for (const z of LOW_RISK_ZONES) {
if (getDistanceKm(lat, lng, z.lat, z.lng) < z.radius) {
return { risk: "LOW", color: "#00cc66", region: z.name, notes: "You are in or near a ma
}
}
let closest = null, closestDist = Infinity;
for (const r of RISK_REGIONS) {
const dist = getDistanceKm(lat, lng, r.lat, r.lng);
if (dist < closestDist) { closestDist = dist; closest = { ...r }; }
}
if (!closest) return null;
if (closestDist < closest.radius) return { risk: closest.risk, color: closest.color, if (closestDist < closest.radius * 1.5) return { risk: "MODERATE", color: "#ffaa00", return { risk: "LOW-MODERATE", color: "#88cc00", region: "Rural/Semi-rural area", notes: "Y
region
region
}
async function checkOnline() {
if (!navigator.onLine) return false;
try {
const ctrl = new AbortController();
setTimeout(() => ctrl.abort(), 4000);
await fetch("https://api.anthropic.com/v1/models", { method: "HEAD", signal: ctrl.signal
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
const [aiStatus, setAiStatus] = useState("idle"); // idle | checking | online | offline | e
useEffect(() => {
const up = () => setIsOnline(true);
const dn = () => setIsOnline(false);
window.addEventListener("online", up);
window.addEventListener("offline", dn);
return () => { window.removeEventListener("online", up); window.removeEventListener("offl
}, []);
const startCheck = () => {
setScreen("loading");
setLocError(null);
setAiResult(null);
setAiStatus("idle");
if (!navigator.geolocation) { setLocError("Geolocation is not supported by this device.")
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
() => { setLocError("Unable to get location. Please enable location permissions and try
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
system: "You are an expert on 1080 (sodium fluoroacetate) pest baiting programs in
messages: [{ role: "user", content: `User is at lat ${lat.toFixed(3)}, lng ${lng.to
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
const riskPct = assessment ? ((RISK_ORDER.indexOf(assessment.risk) + 1) / RISK_ORDER.length
const card = { background: "#0c1810", border: "1px solid #162b1e", borderRadius: 10, const lbl = { fontSize: 9, color: "#3a6a4a", letterSpacing: "0.18em", marginBottom: 6 };
const btn = (primary) => ({
cursor: "pointer", border: primary ? "none" : "1px solid #162b1e",
background: primary ? "#1a9e48" : "transparent",
color: primary ? "#040a06" : "#3a6a4a",
fontFamily: FONT_STACK, letterSpacing: "0.08em",
width: "100%", borderRadius: 8, padding: "13px 20px",
fontSize: 12, textTransform: "uppercase", fontWeight: primary ? "bold" : "normal",
transition: "all 0.18s",
paddin
});
return (
<div style={{ minHeight: "100vh", background: "#080e0a", color: "#ddeee3", fontFamily: FO
<style>{`
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1a3a24}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:tr
.fu{animation:fadeUp 0.45s ease forwards}
@keyframes spin{to{transform:rotate(360deg)}}.spin{animation:spin 0.9s linear infinit
@keyframes pulse{0%{transform:scale(0.9);opacity:0.7}100%{transform:scale(2.1);opacit
@keyframes fillBar{from{width:0}to{width:var(--w)}}.bar{animation:fillBar 1.1s cubic-
button:hover{opacity:0.82;transform:translateY(-1px)}button:active{transform:translat
`}</style>
{/* Header */}
<div style={{ padding: "16px 20px 12px", borderBottom: "1px solid #162b1e", display: "f
<div style={{ width: 34, height: 34, background: "#1a9e48", borderRadius: 6, display:
<div>
<div style={{ fontFamily: DISPLAY_FONT, fontSize: 20, letterSpacing: "0.1em", color
<div style={{ fontSize: 9, color: "#3a6a4a", letterSpacing: "0.18em" }}>AUSTRALIA T
</div>
<div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
<div style={{ fontSize: 10, letterSpacing: "0.1em", padding: "3px 8px", borderRadiu
{isOnline ? "● ONLINE" : "● OFFLINE"}
</div>
<button onClick={() => setScreen("info")} style={{ background: "transparent", borde
</div>
</div>
{/* HOME */}
{screen === "home" && (
<div className="fu" style={{ flex: 1, display: "flex", flexDirection: "column", align
<div style={{ textAlign: "center", maxWidth: 360 }}>
<div style={{ fontFamily: DISPLAY_FONT, fontSize: 52, lineHeight: 1.05, color: "#
<div style={{ color: "#3a6a4a", fontSize: 12, lineHeight: 1.8 }}>1080 baits are u
</div>
<div style={{ position: "relative", width: 90, height: 90, display: "flex", alignIt
<div className="pulse" style={{ position: "absolute", width: 70, height: 70, bord
<div className="pulse" style={{ position: "absolute", width: 70, height: 70, bord
<div style={{ fontSize: 46, position: "relative", zIndex: 1 }}> </div>
</div>
<div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column
<button style={btn(true)} onClick={() => setScreen("disclaimer")}> Check <button style={btn(false)} onClick={() => setScreen("info")}>Learn About 1080 Bai
</div>
{!isOnline && (
<div style={{ background: "#1a0e00", border: "1px solid #664400", borderRadius: 8
You're offline — the app works fully using built-in regional data. AI My Loc
analys
</div>
)}
</div>
<div style={{ color: "#1a3a24", fontSize: 9, letterSpacing: "0.12em", textAlign: "c
)}
{/* DISCLAIMER */}
{screen === "disclaimer" && (
<div className="fu" style={{ flex: 1, overflowY: "auto", padding: "24px 20px 48px" }}
<div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "col
<div style={{ background: "#150800", border: "1px solid #cc4400", borderRadius: 1
<div style={{ fontFamily: DISPLAY_FONT, fontSize: 18, color: "#cc4400", letterS
<div style={{ color: "#aa7744", fontSize: 11, lineHeight: 1.9 }}>{DISCLAIMER}</
</div>
<div style={{ ...card, fontSize: 11, color: "#3a6a4a", lineHeight: 1.9 }}>
<div style={{ color: "#1a9e48", fontWeight: "bold", marginBottom: 6 }}>HOW THIS
Uses built-in regional data on known 1080 baiting zones across all Australian s
{isOnline
? " You're online — a live AI analysis will also be generated for your specif
: " You're currently offline — full risk assessment still works. AI analysis
</div>
<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
<button style={btn(true)} onClick={startCheck}>I Understand — Check My Risk</bu
<button style={btn(false)} onClick={() => setScreen("home")}>Go Back</button>
</div>
</div>
</div>
)}
{/* LOADING */}
{screen === "loading" && (
<div className="fu" style={{ flex: 1, display: "flex", flexDirection: "column", align
<div className="spin" style={{ width: 44, height: 44, border: "3px solid #162b1e",
<div style={{ color: "#3a6a4a", fontSize: 11, letterSpacing: "0.18em" }}>LOCATING Y
</div>
)}
{/* RESULT */}
{screen === "result" && (
<div className="fu" style={{ flex: 1, overflowY: "auto", padding: "20px 20px 48px" }}
<div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "col
{locError && <div style={{ background: "#150000", border: "1px solid #cc2222", bo
{assessment && (
<>
{/* Risk card */}
<div style={{ background: "#0c1810", border: `2px solid ${assessment.color}`,
<div style={{ position: "absolute", top: 0, right: 0, width: 110, height: 1
<div style={lbl}>RISK LEVEL</div>
<div style={{ fontFamily: DISPLAY_FONT, fontSize: 50, color: assessment.col
<div style={{ fontSize: 11, color: "#6a9a7a", marginTop: 4 }}>{assessment.r
<div style={{ marginTop: 16 }}>
<div style={{ display: "flex", justifyContent: "space-between", fontSize:
{RISK_ORDER.map(r => <span key={r}>{r}</span>)}
</div>
<div style={{ height: 7, background: "#162b1e", borderRadius: 4, overflow
<div className="bar" style={{ "--w": `${riskPct}%`, height: "100%", bac
</div>
</div>
</div>
{/* Coordinates */}
{location && (
<div style={{ ...card, display: "flex", gap: 12, alignItems: "center" }}>
<div style={{ fontSize: 20 }}> </div>
<div>
<div style={lbl}>YOUR COORDINATES</div>
<div style={{ fontSize: 12, color: "#6a9a7a" }}>{location.lat.toFixed(4
</div>
</div>
)}
{/* Regional context */}
<div style={card}>
<div style={lbl}>REGIONAL RISK CONTEXT</div>
<div style={{ fontSize: 12, color: "#6a9a7a", lineHeight: 1.9 }}>{assessmen
</div>
{/* AI Panel — smart connectivity states */}
<div style={{ ...card, background: "#080e0a", borderColor: aiResult ? "#1a3a2
<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom:
<div style={lbl}>AI RISK ANALYSIS</div>
{aiStatus === "checking" && <div style={{ fontSize: 9, color: "#3a6a4a",
{(aiStatus === "online" || aiResult) && <div style={{ fontSize: 9, color:
{aiStatus === "offline" && <div style={{ fontSize: 9, color: "#cc4400", b
{aiStatus === "error" && <div style={{ fontSize: 9, color: "#aaaa00", bac
</div>
{aiLoading && (
<div style={{ display: "flex", alignItems: "center", gap: 10, color: "#3a
<div className="spin" style={{ width: 13, height: 13, border: "2px soli
Fetching live analysis for your location...
</div>
)}
{!aiLoading && aiResult && (
<div style={{ fontSize: 12, color: "#6a9a7a", lineHeight: 1.9 }}>{aiResul
)}
{!aiLoading && aiStatus === "offline" && (
<div style={{ fontSize: 11, color: "#3a5a3a", lineHeight: 1.8 }}>
No internet connection detected. AI analysis is unavailable right no
All risk data above is from the built-in offline database and is still
</div>
)}
fully
{!aiLoading && aiStatus === "error" && (
<div style={{ fontSize: 11, color: "#3a5a3a", lineHeight: 1.8 }}>
Could not load AI analysis. The offline risk data above is still <br />
<button onClick={() => fetchAI(location.lat, location.lng, assessment)}
</div>
)}
{!aiLoading && aiStatus === "checking" && (
<div style={{ fontSize: 11, color: "#3a5a3a" }}>Checking connectivity...<
)}
</div>
{/* Recommendations */}
<div style={card}>
<div style={lbl}>SAFETY RECOMMENDATIONS</div>
<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop:
{assessment.recommendations.map((r, i) => (
<div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start
<div style={{ width: 20, height: 20, background: `${assessment.color}
<div style={{ fontSize: 12, color: "#6a9a7a", lineHeight: 1.8 }}>{r}<
</div>
))}
</div>
</div>
{/* Emergency */}
<div style={{ background: "#150600", border: "1px solid #aa3300", borderRadiu
<div style={{ fontSize: 26 }}> </div>
<div>
<div style={{ fontSize: 9, color: "#aa3300", letterSpacing: "0.15em", mar
<div style={{ fontSize: 12, color: "#aa7744", lineHeight: 1.9 }}>
Animal Poisons Helpline: <strong style={{ color: "#ffaa00" }}>1300 869
Emergency Vet: <strong>seek nearest immediately</strong>
</div>
</div>
</div>
<button style={btn(false)} onClick={() => setScreen("home")}>← Back to Home</
</>
)}
</div>
</div>
)}
{/* INFO */}
{screen === "info" && (
<div className="fu" style={{ flex: 1, overflowY: "auto", padding: "20px 20px 48px" }}
<div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "col
<div style={{ fontFamily: DISPLAY_FONT, fontSize: 34, color: "#b8f0cc", letterSpa
{[
{ icon: " { icon: " { icon: " ", title: "What is 1080?", body: "Sodium fluoroacetate (1080) is a n
", title: "Why is it dangerous to dogs?", body: "Dogs are extremely
", title: "Where is it used in Australia?", body: "Western Australia
{ icon: " ", title: "Legal requirements", body: "Landholders are required to e
{ icon: " ", title: "Types of baits used", body: "Common bait types include Do
{ icon: " ", title: "If your pet is affected", body: "Contact the Animal Poiso
].map((item, i) => (
<div key={i} style={card}>
<div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
<div style={{ fontSize: 20, marginTop: 1 }}>{item.icon}</div>
<div>
<div style={{ fontSize: 11, color: "#1a9e48", fontWeight: "bold", letterS
<div style={{ fontSize: 12, color: "#6a9a7a", lineHeight: 1.8 }}>{item.bo
</div>
</div>
</div>
))}
</div>
</div>
</div>
<div style={{ ...card, fontSize: 10, color: "#1a3a24", lineHeight: 1.8 }}>
<span style={{ color: "#2a5a34" }}>DATA SOURCES: </span>DPIRD WA, DAF QLD, DPIE
<button style={btn(false)} onClick={() => setScreen("home")}>← Back to Home</butt
)}
</div>
);
}
