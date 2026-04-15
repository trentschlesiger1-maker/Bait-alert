import { useState, useEffect } from "react";
const DISCLAIMER = "IMPORTANT DISCLAIMER: This app provides general risk guidance only based
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
{ name: "Sydney", lat: -33.87, lng: 151.21, radius: 30 },
{ name: "Melbourne", lat: -37.81, lng: 144.96, radius: 30 },
{ name: "Brisbane", lat: -27.47, lng: 153.03, radius: 20 },
{ name: "Perth", lat: -31.95, lng: 115.86, radius: 25 },
{ name: "Adelaide", lat: -34.93, lng: 138.6, radius: 20 },
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
if (risk === "EXTREME") return ["DO NOT bring dogs into this area if avoidable", "Contact l
if (risk === "HIGH") return ["Strongly consider leaving dogs at pet-friendly accommodation"
if (risk === "MODERATE") return ["Keep dogs on lead at all times in natural areas", "Check
return ["Stay on marked paths in parks and reserves", "Keep dogs on lead in any bushland or
}
function getRiskAssessment(lat, lng) {
for (const z of LOW_RISK_ZONES) {
if (getDistanceKm(lat, lng, z.lat, z.lng) < z.radius) {
return { risk: "LOW", color: "#27ae60", region: z.name, notes: "You are in or near a ma
}
}
let closest = null, closestDist = Infinity;
for (const r of RISK_REGIONS) {
const dist = getDistanceKm(lat, lng, r.lat, r.lng);
if (dist < closestDist) { closestDist = dist; closest = { ...r }; }
}
region
region
if (!closest) return null;
if (closestDist < closest.radius) return { risk: closest.risk, color: closest.color, if (closestDist < closest.radius * 1.5) return { risk: "MODERATE", color: "#d4930a", return { risk: "LOW-MODERATE", color: "#7daa2d", region: "Rural/Semi-rural area", notes: "Y
}
async function checkOnline() {
return navigator.onLine;
}
async function reverseGeocode(lat, lng) {
try {
const res = await fetch(
"https://nominatim.openstreetmap.org/reverse?format=json&lat=" + lat + "&lon=" + { headers: { "Accept-Language": "en" } }
lng +
);
const data = await res.json();
const a = data.address || {};
const suburb = a.suburb || a.village || a.town || a.city_district || "";
const city = a.city || a.county || a.state_district || "";
const state = a.state || "";
if (suburb && city) return suburb + ", " + city + ", " + state;
if (city) return city + ", " + state;
if (suburb) return suburb + ", " + state;
return state || "";
} catch { return ""; }
}
async function fetchNearbyVets(lat, lng) {
try {
const res = await fetch(
"https://api.anthropic.com/v1/messages",
{
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
model: "claude-sonnet-4-20250514",
max_tokens: 1000,
system: "You are a helpful assistant. Return ONLY a valid JSON array, no other text
messages: [{
role: "user",
content: "List the 3 nearest veterinary clinics to latitude " + lat.toFixed(3) +
}]
})
}
);
const data = await res.json();
const text = data.content && data.content.find(function(b) { return b.type === "text"; })
if (!text) return null;
const clean = text.text.replace(/```json|```/g, "").trim();
return JSON.parse(clean);
} catch { return null; }
}
function requestNotifications(risk) {
if (!("Notification" in window)) return;
if (Notification.permission === "granted") {
sendNotification(risk);
} else if (Notification.permission !== "denied") {
Notification.requestPermission().then(function(perm) {
if (perm === "granted") sendNotification(risk);
});
}
}
function sendNotification(risk) {
if (risk === "HIGH" || risk === "EXTREME") {
new Notification("1080 Bait Alert", {
body: risk + " risk area detected. Keep your dog on a lead and stay vigilant.",
icon: "/favicon.ico"
});
}
}
function Logo() {
return (
<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000
<rect width="44" height="44" rx="10" fill="#1a1a1a"/>
<text x="22" y="17" textAnchor="middle" fill="#e74c3c" fontSize="13" fontWeight="bold"
<path d="M10 22 Q22 10 34 22 Q22 34 10 22Z" fill="none" stroke="#e74c3c" strokeWidth="1
<text x="22" y="34" textAnchor="middle" fill="#cccccc" fontSize="5.5" fontFamily="Arial
</svg>
);
}
export default function App() {
const [screen, setScreen] = useState("home");
const [location, setLocation] = useState(null);
const [assessment, setAssessment] = useState(null);
const [locError, setLocError] = useState(null);
const [isOnline, setIsOnline] = useState(navigator.onLine);
const [aiResult, setAiResult] = useState(null);
const [aiLoading, setAiLoading] = useState(false);
const [aiStatus, setAiStatus] = useState("idle");
const [placeName, setPlaceName] = useState("");
const [vets, setVets] = useState(null);
const [vetsLoading, setVetsLoading] = useState(false);
const [notifPermission, setNotifPermission] = useState("Notification" in window ? Notificat
useEffect(function() {
var up = function() { setIsOnline(true); };
var dn = function() { setIsOnline(false); };
window.addEventListener("online", up);
window.addEventListener("offline", dn);
return function() { window.removeEventListener("online", up); window.removeEventListener(
}, []);
var startCheck = function() {
setScreen("loading");
setLocError(null);
setAiResult(null);
setAiStatus("idle");
setPlaceName("");
setVets(null);
if (!navigator.geolocation) { setLocError("Geolocation is not supported by this device.")
navigator.geolocation.getCurrentPosition(
async function(pos) {
var lat = pos.coords.latitude;
var lng = pos.coords.longitude;
setLocation({ lat: lat, lng: lng });
var result = getRiskAssessment(lat, lng);
setAssessment(result);
setScreen("result");
// Request notification for high/extreme
if (result && (result.risk === "HIGH" || result.risk === "EXTREME")) {
requestNotifications(result.risk);
setNotifPermission("Notification" in window ? Notification.permission : "unsupporte
}
// Reverse geocode for specific place name
var online = await checkOnline();
setIsOnline(online);
if (online) {
var place = await reverseGeocode(lat, lng);
if (place) setPlaceName(place);
fetchAI(lat, lng, result);
fetchVets(lat, lng);
} else {
setAiStatus("offline");
}
},
function() { setLocError("Unable to get location. Please enable location permissions an
{ timeout: 12000, maximumAge: 60000 }
);
};
var fetchAI = async function(lat, lng, result) {
setAiLoading(true);
setAiStatus("online");
try {
var res = await fetch("https://api.anthropic.com/v1/messages", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
model: "claude-sonnet-4-20250514",
max_tokens: 800,
system: "You are an expert on 1080 (sodium fluoroacetate) pest baiting programs in
messages: [{ role: "user", content: "User is at lat " + lat.toFixed(3) + ", lng " +
})
});
if (!res.ok) throw new Error();
var data = await res.json();
var textBlock = data.content && data.content.find(function(b) { return b.type === "text
var text = textBlock ? textBlock.text : "";
setAiResult(text || null);
if (!text) setAiStatus("error");
} catch (e) { setAiResult(null); setAiStatus("error"); }
setAiLoading(false);
};
var fetchVets = async function(lat, lng) {
setVetsLoading(true);
var result = await fetchNearbyVets(lat, lng);
setVets(result);
setVetsLoading(false);
};
var riskPct = assessment ? ((RISK_ORDER.indexOf(assessment.risk) + 1) / RISK_ORDER.length)
// Light, readable styles
var bg = "#f5f5f0";
var bgCard = "#ffffff";
var textMain = "#1a1a1a";
var textSub = "#555555";
var textLight = "#888888";
var border = "#dddddd";
var accent = "#e74c3c";
var card = {
background: bgCard,
border: "1px solid " + border,
borderRadius: 12,
padding: 16,
boxShadow: "0 1px 4px rgba(0,0,0,0.07)"
};
var lbl = {
fontSize: 10,
color: textLight,
letterSpacing: "0.15em",
textTransform: "uppercase",
marginBottom: 6,
fontFamily: "'Courier New', monospace"
};
var btnStyle = function(primary) {
return {
cursor: "pointer",
border: primary ? "none" : "1.5px solid " + border,
background: primary ? accent : bgCard,
color: primary ? "#ffffff" : textSub,
fontFamily: "system-ui, sans-serif",
letterSpacing: "0.04em",
width: "100%",
borderRadius: 10,
padding: "14px 20px",
fontSize: 14,
fontWeight: primary ? "700" : "500",
transition: "all 0.18s",
boxShadow: primary ? "0 2px 8px rgba(231,76,60,0.3)" : "none"
};
};
return (
<div style={{ minHeight: "100vh", background: bg, color: textMain, fontFamily: "system-ui
<style>{"* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { wid
{/* HEADER */}
<div style={{ padding: "14px 20px 12px", background: "#ffffff", borderBottom: "1px soli
<Logo />
<div>
<div style={{ fontSize: 17, fontWeight: "800", color: textMain, letterSpacing: "-0.
1080 <span style={{ color: accent }}>Bait Alert</span>
</div>
<div style={{ fontSize: 10, color: textLight, letterSpacing: "0.12em", textTransfor
</div>
<div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
<div style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, fontWeight: "600"
{isOnline ? "ONLINE" : "OFFLINE"}
</div>
<button onClick={function() { setScreen("info"); }} style={{ background: "transpare
</div>
</div>
{/* HOME */}
{screen === "home" && (
<div className="fu" style={{ flex: 1, display: "flex", flexDirection: "column", align
<div style={{ textAlign: "center", maxWidth: 360 }}>
<div style={{ fontSize: 42, fontWeight: "900", lineHeight: 1.1, color: textMain,
Is it safe<br /><span style={{ color: accent }}>where you are?</span>
</div>
<div style={{ color: textSub, fontSize: 15, lineHeight: 1.7 }}>
1080 baits are used widely across Australia. They are <strong style={{ color: a
</div>
</div>
<div style={{ position: "relative", width: 90, height: 90, display: "flex", alignIt
<div className="pulse" style={{ position: "absolute", width: 70, height: 70, bord
<div className="pulse" style={{ position: "absolute", width: 70, height: 70, bord
<div style={{ fontSize: 48, position: "relative", zIndex: 1 }}> </div>
</div>
<div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column
<button style={btnStyle(true)} onClick={function() { setScreen("disclaimer"); }}>
Check My Location Risk
</button>
<button style={btnStyle(false)} onClick={function() { setScreen("info"); }}>
Learn About 1080 Baits
</button>
</div>
{!isOnline && (
<div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 1
You're offline — the app works fully using built-in data. AI analysis unavai
</div>
)}
<div style={{ color: textLight, fontSize: 11, letterSpacing: "0.08em", textAlign: "
For pet owners · campers · trail users · rural travellers
</div>
</div>
)}
{/* DISCLAIMER */}
{screen === "disclaimer" && (
<div className="fu" style={{ flex: 1, overflowY: "auto", padding: "24px 20px 48px" }}
<div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "col
<div style={{ background: "#fdecea", border: "1px solid #f5b7b1", borderRadius: 1
<div style={{ fontSize: 15, fontWeight: "800", color: accent, marginBottom: 10
<div style={{ color: "#7b241c", fontSize: 13, lineHeight: 1.8 }}>{DISCLAIMER}</
</div>
<div style={{ ...card, fontSize: 13, color: textSub, lineHeight: 1.8 }}>
<div style={{ color: textMain, fontWeight: "700", marginBottom: 6 }}>How this a
Uses built-in regional data on known 1080 baiting zones across all Australian s
{isOnline ? " You're online — a live AI analysis and nearest vets will also loa
</div>
<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
<button style={btnStyle(true)} onClick={startCheck}>I Understand — Check <button style={btnStyle(false)} onClick={function() { setScreen("home"); </div>
</div>
</div>
My Ris
}}>Go
)}
{/* LOADING */}
{screen === "loading" && (
<div className="fu" style={{ flex: 1, display: "flex", flexDirection: "column", align
<div className="spin" style={{ width: 46, height: 46, border: "3px solid #eeeeee",
<div style={{ color: textSub, fontSize: 14, letterSpacing: "0.1em" }}>Finding your
</div>
)}
{/* RESULT */}
{screen === "result" && (
<div className="fu" style={{ flex: 1, overflowY: "auto", padding: "20px 20px 48px" }}
<div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "col
{locError && (
<div style={{ background: "#fdecea", border: "1px solid #f5b7b1", borderRadius:
)}
{assessment && (
<>
{/* Risk Card */}
<div style={{ background: assessment.color, borderRadius: 14, padding: 20, co
<div style={{ position: "absolute", top: -20, right: -20, width: 120, heigh
<div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "upperc
<div style={{ fontSize: 48, fontWeight: "900", lineHeight: 1, letterSpacing
<div style={{ fontSize: 14, opacity: 0.9, marginTop: 6 }}>
{placeName ? placeName : assessment.region}
</div>
{placeName && (
<div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{assessment.reg
)}
<div style={{ marginTop: 16 }}>
<div style={{ display: "flex", justifyContent: "space-between", fontSize:
{RISK_ORDER.map(function(r) { return <span key={r}>{r}</span>; })}
</div>
<div style={{ height: 8, background: "rgba(255,255,255,0.25)", borderRadi
<div className="bar" style={{ "--w": riskPct + "%", height: "100%", bac
</div>
</div>
</div>
{/* Location */}
{location && (
<div style={{ ...card, display: "flex", gap: 12, alignItems: "center" }}>
<div style={{ fontSize: 22 }}> </div>
<div>
<div style={lbl}>Your Location</div>
<div style={{ fontSize: 13, color: textMain, fontWeight: "600" }}>{plac
<div style={{ fontSize: 11, color: textLight, fontFamily: "'Courier New
</div>
</div>
)}
{/* Regional context */}
<div style={card}>
<div style={lbl}>Regional Risk Context</div>
<div style={{ fontSize: 14, color: textSub, lineHeight: 1.8 }}>{assessment.
</div>
{/* AI Analysis */}
<div style={{ ...card, borderLeft: "3px solid " + (aiResult ? "#3498db" : bor
<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom:
<div style={lbl}>AI Risk Analysis</div>
{aiStatus === "online" && !aiLoading && aiResult && (
<div style={{ fontSize: 9, color: "#27ae60", background: "#e8f8ee", pad
)}
{aiStatus === "offline" && (
<div style={{ fontSize: 9, color: "#e67e22", background: "#fef9e7", pad
)}
</div>
{aiLoading && (
<div style={{ display: "flex", alignItems: "center", gap: 10, color: text
<div className="spin" style={{ width: 14, height: 14, border: "2px soli
Analysing your location...
</div>
)}
{!aiLoading && aiResult && (
<div style={{ fontSize: 14, color: textSub, lineHeight: 1.8 }}>{aiResult}
)}
{!aiLoading && aiStatus === "offline" && (
<div style={{ fontSize: 13, color: textLight, lineHeight: 1.7 }}>
No internet connection. All risk data above is accurate from the </div>
built-
)}
{!aiLoading && aiStatus === "error" && (
<div style={{ fontSize: 13, color: textLight, lineHeight: 1.7 }}>
Could not load AI analysis.
<button onClick={function() { fetchAI(location.lat, location.lng, asses
</div>
)}
</div>
{/* Nearest Vets */}
<div style={card}>
<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom:
<div style={lbl}>Nearest Veterinary Clinics</div>
{vetsLoading && <div className="spin" style={{ width: 12, height: 12, bor
</div>
{vetsLoading && (
<div style={{ fontSize: 13, color: textLight }}>Finding nearest vets...</
)}
{!vetsLoading && vets && vets.length > 0 && (
<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
{vets.map(function(v, i) {
return (
<div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-s
<div style={{ width: 28, height: 28, background: "#fdecea", borde
<div style={{ flex: 1 }}>
<div style={{ fontSize: 14, fontWeight: "600", color: textMain
<div style={{ fontSize: 12, color: textLight, marginTop: {v.phone && (
<a href={"tel:" + v.phone} style={{ fontSize: 13, color: acce
2 }}>{
)}
</div>
</div>
);
})}
</div>
)}
{!vetsLoading && !vets && isOnline && (
<div style={{ fontSize: 13, color: textLight }}>Could not load vet inform
)}
)}
</div>
{!vetsLoading && !vets && !isOnline && (
<div style={{ fontSize: 13, color: textLight }}>Vet lookup requires an in
{/* Recommendations */}
<div style={card}>
<div style={lbl}>Safety Recommendations</div>
<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop:
{assessment.recommendations.map(function(r, i) {
return (
<div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-sta
<div style={{ width: 22, height: 22, background: assessment.color +
<div style={{ fontSize: 14, color: textSub, lineHeight: 1.7 }}>{r}<
</div>
);
})}
</div>
</div>
{/* Notifications */}
{(assessment.risk === "HIGH" || assessment.risk === "EXTREME") && notifPermis
<div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRad
<div style={{ fontSize: 22 }}> </div>
<div style={{ flex: 1 }}>
<div style={{ fontSize: 13, fontWeight: "600", color: "#7a5800", <div style={{ fontSize: 12, color: "#9a7200", lineHeight: 1.6 }}>
margin
{notifPermission === "granted" ? "Notifications enabled — you will be
</div>
{notifPermission !== "granted" && (
<button onClick={function() { requestNotifications(assessment.risk);
Enable Alerts
</button>
)}
</div>
</div>
)}
{/* Emergency */}
<div style={{ background: "#fdecea", border: "1px solid #f5b7b1", borderRadiu
<div style={{ fontSize: 26 }}> </div>
<div>
<div style={{ fontSize: 11, color: accent, letterSpacing: "0.12em", textT
<div style={{ fontSize: 14, color: "#7b241c", lineHeight: 1.8 }}>
Animal Poisons Helpline:<br /><a href="tel:1300869738" style={{ color:
</div>
</div>
</div>
<button style={btnStyle(false)} onClick={function() { setScreen("home"); }}>←
</>
)}
</div>
</div>
)}
{/* INFO */}
{screen === "info" && (
<div className="fu" style={{ flex: 1, overflowY: "auto", padding: "20px 20px 48px" }}
<div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "col
<div style={{ fontSize: 28, fontWeight: "900", color: textMain, letterSpacing: "-
{[
{ icon: " { icon: " { icon: " { icon: " ", title: "What is 1080?", body: "Sodium fluoroacetate (1080) is a n
", title: "Why is it dangerous to dogs?", body: "Dogs are extremely
", title: "Where is it used in Australia?", body: "Western Australia
", title: "Legal requirements", body: "Landholders are required to e
{ icon: " ", title: "Types of baits used", body: "Common bait types include Do
{ icon: " ", title: "If your pet is affected", body: "Contact the Animal Poiso
].map(function(item, i) {
return (
<div key={i} style={card}>
<div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
<div style={{ fontSize: 22, marginTop: 1 }}>{item.icon}</div>
<div>
<div style={{ fontSize: 14, color: textMain, fontWeight: "700", marginB
<div style={{ fontSize: 13, color: textSub, lineHeight: 1.8 }}>{item.bo
</div>
</div>
</div>
);
})}
</div>
</div>
</div>
<div style={{ ...card, fontSize: 11, color: textLight, lineHeight: 1.8 }}>
<span style={{ fontWeight: "700", color: textSub }}>Data sources: </span>DPIRD
<button style={btnStyle(false)} onClick={function() { setScreen("home"); }}>← Bac
)}
</div>
);
}
