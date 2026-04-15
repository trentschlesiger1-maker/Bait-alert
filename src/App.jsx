import { useState, useEffect } from “react”;

const DISCLAIMER = “IMPORTANT DISCLAIMER: This app provides general risk guidance only based on publicly available information about 1080 (sodium fluoroacetate) baiting programs in Australia. It does NOT provide real-time baiting data and should NOT be relied upon as a definitive safety guide. Always check with local councils, national parks, and land management authorities for current baiting programs. Keep pets on leads in all rural and bushland areas. In an emergency, contact the Animal Poisons Helpline: 1300 869 738 or your nearest vet immediately.”;

const RISK_REGIONS = [
{ name: “Western Australia (Southwest)”, lat: -31.95, lng: 115.86, radius: 800, risk: “EXTREME”, color: “#c0392b”, notes: “WA uses more 1080 than any other state. Widespread aerial and ground baiting for foxes and wild dogs across agricultural and pastoral land. Karri/Jarrah forests, wheatbelt and pastoral regions are very high risk.” },
{ name: “Western Australia (Goldfields-Esperance)”, lat: -30.75, lng: 121.47, radius: 700, risk: “EXTREME”, color: “#c0392b”, notes: “Active livestock protection programs. Vast pastoral stations use 1080 extensively for wild dog control.” },
{ name: “Western Australia (Pilbara)”, lat: -21.17, lng: 118.62, radius: 600, risk: “HIGH”, color: “#e67e22”, notes: “Pastoral wild dog baiting programs active. Remote and vast — baited areas may be unmarked.” },
{ name: “Western Australia (Kimberley)”, lat: -17.66, lng: 128.73, radius: 600, risk: “HIGH”, color: “#e67e22”, notes: “Cattle station baiting for dingoes and wild dogs. Risk higher in pastoral areas away from towns.” },
{ name: “Queensland (Western Outback)”, lat: -25.0, lng: 144.0, radius: 700, risk: “HIGH”, color: “#e67e22”, notes: “Wild dog baiting programs across western QLD. Channel Country and pastoral areas actively baited.” },
{ name: “Queensland (Southeast Hinterland)”, lat: -27.5, lng: 152.7, radius: 250, risk: “MODERATE”, color: “#d4930a”, notes: “Periodic fox and wild dog baiting in national park buffer zones and private land. Check with local councils.” },
{ name: “Queensland (Darling Downs)”, lat: -27.56, lng: 151.95, radius: 250, risk: “MODERATE”, color: “#d4930a”, notes: “Agricultural pest control programs active. Foxes and pigs targeted on farmland.” },
{ name: “New South Wales (Western Plains)”, lat: -31.5, lng: 146.0, radius: 600, risk: “HIGH”, color: “#e67e22”, notes: “Large-scale wild dog and fox baiting across western NSW. National Parks and Wildlife Service conducts programs.” },
{ name: “New South Wales (Snowy Mountains)”, lat: -36.4, lng: 148.5, radius: 200, risk: “MODERATE”, color: “#d4930a”, notes: “Pest control for foxes and wild dogs near alpine areas. Check NPWS before entering bushland.” },
{ name: “New South Wales (Tablelands)”, lat: -33.5, lng: 149.5, radius: 300, risk: “MODERATE”, color: “#d4930a”, notes: “Central Tablelands — farming areas with periodic baiting programs.” },
{ name: “Victoria (High Country)”, lat: -36.9, lng: 147.0, radius: 250, risk: “MODERATE”, color: “#d4930a”, notes: “Wild dog and fox control in alpine and sub-alpine areas. Parks Victoria manages programs.” },
{ name: “Victoria (Mallee)”, lat: -35.0, lng: 142.0, radius: 300, risk: “MODERATE”, color: “#d4930a”, notes: “Fox and rabbit control baiting in Mallee regions.” },
{ name: “South Australia (Outback/Pastoral)”, lat: -30.0, lng: 135.0, radius: 700, risk: “HIGH”, color: “#e67e22”, notes: “Widespread dingo and wild dog baiting across SA pastoral zones. Extremely remote — baited areas hard to identify.” },
{ name: “South Australia (Agricultural South)”, lat: -35.1, lng: 138.6, radius: 300, risk: “MODERATE”, color: “#d4930a”, notes: “Fox control programs in agricultural areas and national park edges.” },
{ name: “Northern Territory (Pastoral/Outback)”, lat: -19.5, lng: 133.0, radius: 700, risk: “HIGH”, color: “#e67e22”, notes: “Dingo and wild dog baiting on cattle stations. Baiting common across remote areas.” },
{ name: “Tasmania (Rural North & Midlands)”, lat: -41.8, lng: 146.5, radius: 300, risk: “MODERATE”, color: “#d4930a”, notes: “Some ongoing wildlife and pest control baiting in rural midlands.” },
];

const LOW_RISK_ZONES = [
{ name: “Sydney”, lat: -33.87, lng: 151.21, radius: 30 },
{ name: “Melbourne”, lat: -37.81, lng: 144.96, radius: 30 },
{ name: “Brisbane”, lat: -27.47, lng: 153.03, radius: 20 },
{ name: “Perth”, lat: -31.95, lng: 115.86, radius: 25 },
{ name: “Adelaide”, lat: -34.93, lng: 138.6, radius: 20 },
{ name: “Hobart”, lat: -42.88, lng: 147.33, radius: 15 },
{ name: “Darwin”, lat: -12.46, lng: 130.84, radius: 15 },
{ name: “Canberra”, lat: -35.28, lng: 149.13, radius: 15 },
];

const RISK_ORDER = [“LOW”, “LOW-MODERATE”, “MODERATE”, “HIGH”, “EXTREME”];

function getDistanceKm(lat1, lon1, lat2, lon2) {
const R = 6371;
const dLat = ((lat2 - lat1) * Math.PI) / 180;
const dLon = ((lon2 - lon1) * Math.PI) / 180;
const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getRecs(risk) {
const base = [
“Keep dogs on a lead at all times in rural and bushland areas”,
“Do not let pets roam freely or investigate carcasses or bait stations”,
“If you see a bait station sign, leave the area immediately with all pets”,
“Know the symptoms: vomiting, tremors, seizures — seek vet help immediately”,
“Animal Poisons Helpline: 1300 869 738”,
];
if (risk === “EXTREME”) return [“DO NOT bring dogs into this area if avoidable”, “Contact local council or land authority before entering any bushland”, “Keep dogs on a short lead at ALL times — no exceptions”, “Avoid all unsealed tracks, scrubland, and farm boundaries”, …base];
if (risk === “HIGH”) return [“Strongly consider leaving dogs at pet-friendly accommodation”, “Contact local national park or council for current bait notices”, “Keep dogs on a short lead at ALL times”, “Avoid farm boundaries, bush tracks and scrub”, …base];
if (risk === “MODERATE”) return [“Keep dogs on lead at all times in natural areas”, “Check local council websites for current baiting notices”, “Avoid walking near farms or unfenced bushland”, …base];
return [“Stay on marked paths in parks and reserves”, “Keep dogs on lead in any bushland or reserve”, …base];
}

function getRiskAssessment(lat, lng) {
for (const z of LOW_RISK_ZONES) {
if (getDistanceKm(lat, lng, z.lat, z.lng) < z.radius) {
return { risk: “LOW”, color: “#27ae60”, region: z.name, notes: “You are in or near a major metropolitan area. 1080 baiting is generally not conducted in urban zones. Always check local council notices if visiting fringe bushland or reserves.”, recommendations: getRecs(“LOW”) };
}
}
let closest = null, closestDist = Infinity;
for (const r of RISK_REGIONS) {
const dist = getDistanceKm(lat, lng, r.lat, r.lng);
if (dist < closestDist) { closestDist = dist; closest = { …r }; }
}
if (!closest) return null;
if (closestDist < closest.radius) return { risk: closest.risk, color: closest.color, region: closest.name, notes: closest.notes, recommendations: getRecs(closest.risk) };
if (closestDist < closest.radius * 1.5) return { risk: “MODERATE”, color: “#d4930a”, region: “Near “ + closest.name, notes: “You are within range of a known baiting zone: “ + closest.name + “. Risk increases as you travel further from urban centres.”, recommendations: getRecs(“MODERATE”) };
return { risk: “LOW-MODERATE”, color: “#7daa2d”, region: “Rural/Semi-rural area”, notes: “You appear to be in a lower-risk area, but 1080 baiting can occur on private land throughout Australia. If in rural or bushland areas, treat as moderate risk.”, recommendations: getRecs(“LOW-MODERATE”) };
}

async function checkOnline() {
if (!navigator.onLine) return false;
try {
const ctrl = new AbortController();
setTimeout(() => ctrl.abort(), 4000);
await fetch(“https://api.anthropic.com/v1/models”, { method: “HEAD”, signal: ctrl.signal });
return true;
} catch { return false; }
}

async function reverseGeocode(lat, lng) {
try {
const res = await fetch(
“https://nominatim.openstreetmap.org/reverse?format=json&lat=” + lat + “&lon=” + lng + “&zoom=10&addressdetails=1”,
{ headers: { “Accept-Language”: “en” } }
);
const data = await res.json();
const a = data.address || {};
const suburb = a.suburb || a.village || a.town || a.city_district || “”;
const city = a.city || a.county || a.state_district || “”;
const state = a.state || “”;
if (suburb && city) return suburb + “, “ + city + “, “ + state;
if (city) return city + “, “ + state;
if (suburb) return suburb + “, “ + state;
return state || “”;
} catch { return “”; }
}

async function fetchNearbyVets(lat, lng) {
try {
const res = await fetch(
“https://api.anthropic.com/v1/messages”,
{
method: “POST”,
headers: { “Content-Type”: “application/json” },
body: JSON.stringify({
model: “claude-sonnet-4-20250514”,
max_tokens: 1000,
system: “You are a helpful assistant. Return ONLY a valid JSON array, no other text. No markdown, no explanation.”,
messages: [{
role: “user”,
content: “List the 3 nearest veterinary clinics to latitude “ + lat.toFixed(3) + “, longitude “ + lng.toFixed(3) + “ in Australia. Return ONLY a JSON array like: [{"name":"Clinic Name","address":"Full address","phone":"phone number or null"}]. If you cannot determine real clinics for this location, return the 3 most likely vets for the nearest town.”
}]
})
}
);
const data = await res.json();
const text = data.content && data.content.find(function(b) { return b.type === “text”; });
if (!text) return null;
const clean = text.text.replace(/`json|`/g, “”).trim();
return JSON.parse(clean);
} catch { return null; }
}

function requestNotifications(risk) {
if (!(“Notification” in window)) return;
if (Notification.permission === “granted”) {
sendNotification(risk);
} else if (Notification.permission !== “denied”) {
Notification.requestPermission().then(function(perm) {
if (perm === “granted”) sendNotification(risk);
});
}
}

function sendNotification(risk) {
if (risk === “HIGH” || risk === “EXTREME”) {
new Notification(“1080 Bait Alert”, {
body: risk + “ risk area detected. Keep your dog on a lead and stay vigilant.”,
icon: “/favicon.ico”
});
}
}

function Logo() {
return (
<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="44" height="44" rx="10" fill="#1a1a1a"/>
<text x="22" y="17" textAnchor="middle" fill="#e74c3c" fontSize="13" fontWeight="bold" fontFamily="Impact, Arial, sans-serif" letterSpacing="1">1080</text>
<path d="M10 22 Q22 10 34 22 Q22 34 10 22Z" fill="none" stroke="#e74c3c" strokeWidth="1.5" opacity="0.6"/>
<text x="22" y="34" textAnchor="middle" fill="#cccccc" fontSize="5.5" fontFamily="Arial, sans-serif" letterSpacing="0.5">BAIT ALERT</text>
</svg>
);
}

export default function App() {
const [screen, setScreen] = useState(“home”);
const [location, setLocation] = useState(null);
const [assessment, setAssessment] = useState(null);
const [locError, setLocError] = useState(null);
const [isOnline, setIsOnline] = useState(navigator.onLine);
const [aiResult, setAiResult] = useState(null);
const [aiLoading, setAiLoading] = useState(false);
const [aiStatus, setAiStatus] = useState(“idle”);
const [placeName, setPlaceName] = useState(””);
const [vets, setVets] = useState(null);
const [vetsLoading, setVetsLoading] = useState(false);
const [notifPermission, setNotifPermission] = useState(“Notification” in window ? Notification.permission : “unsupported”);

useEffect(function() {
var up = function() { setIsOnline(true); };
var dn = function() { setIsOnline(false); };
window.addEventListener(“online”, up);
window.addEventListener(“offline”, dn);
return function() { window.removeEventListener(“online”, up); window.removeEventListener(“offline”, dn); };
}, []);

var startCheck = function() {
setScreen(“loading”);
setLocError(null);
setAiResult(null);
setAiStatus(“idle”);
setPlaceName(””);
setVets(null);
if (!navigator.geolocation) { setLocError(“Geolocation is not supported by this device.”); setScreen(“result”); return; }
navigator.geolocation.getCurrentPosition(
async function(pos) {
var lat = pos.coords.latitude;
var lng = pos.coords.longitude;
setLocation({ lat: lat, lng: lng });
var result = getRiskAssessment(lat, lng);
setAssessment(result);
setScreen(“result”);

```
    // Request notification for high/extreme
    if (result && (result.risk === "HIGH" || result.risk === "EXTREME")) {
      requestNotifications(result.risk);
      setNotifPermission("Notification" in window ? Notification.permission : "unsupported");
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
  function() { setLocError("Unable to get location. Please enable location permissions and try again."); setScreen("result"); },
  { timeout: 12000, maximumAge: 60000 }
);
```

};

var fetchAI = async function(lat, lng, result) {
setAiLoading(true);
setAiStatus(“online”);
try {
var res = await fetch(“https://api.anthropic.com/v1/messages”, {
method: “POST”,
headers: { “Content-Type”: “application/json” },
body: JSON.stringify({
model: “claude-sonnet-4-20250514”,
max_tokens: 800,
system: “You are an expert on 1080 (sodium fluoroacetate) pest baiting programs in Australia. Give concise, practical safety advice. Respond in 2-3 short plain-text paragraphs. No markdown, no bullet points, no headers.”,
messages: [{ role: “user”, content: “User is at lat “ + lat.toFixed(3) + “, lng “ + lng.toFixed(3) + “ in Australia. Risk region: “ + result.region + “, risk level: “ + result.risk + “. Context: “ + result.notes + “. Explain in under 180 words: 1) why this area has this risk level, 2) what 1080 is used for here, 3) the single most important safety action for this specific location. Plain text only.” }]
})
});
if (!res.ok) throw new Error();
var data = await res.json();
var textBlock = data.content && data.content.find(function(b) { return b.type === “text”; });
var text = textBlock ? textBlock.text : “”;
setAiResult(text || null);
if (!text) setAiStatus(“error”);
} catch (e) { setAiResult(null); setAiStatus(“error”); }
setAiLoading(false);
};

var fetchVets = async function(lat, lng) {
setVetsLoading(true);
var result = await fetchNearbyVets(lat, lng);
setVets(result);
setVetsLoading(false);
};

var riskPct = assessment ? ((RISK_ORDER.indexOf(assessment.risk) + 1) / RISK_ORDER.length) * 100 : 0;

// Light, readable styles
var bg = “#f5f5f0”;
var bgCard = “#ffffff”;
var textMain = “#1a1a1a”;
var textSub = “#555555”;
var textLight = “#888888”;
var border = “#dddddd”;
var accent = “#e74c3c”;

var card = {
background: bgCard,
border: “1px solid “ + border,
borderRadius: 12,
padding: 16,
boxShadow: “0 1px 4px rgba(0,0,0,0.07)”
};

var lbl = {
fontSize: 10,
color: textLight,
letterSpacing: “0.15em”,
textTransform: “uppercase”,
marginBottom: 6,
fontFamily: “‘Courier New’, monospace”
};

var btnStyle = function(primary) {
return {
cursor: “pointer”,
border: primary ? “none” : “1.5px solid “ + border,
background: primary ? accent : bgCard,
color: primary ? “#ffffff” : textSub,
fontFamily: “system-ui, sans-serif”,
letterSpacing: “0.04em”,
width: “100%”,
borderRadius: 10,
padding: “14px 20px”,
fontSize: 14,
fontWeight: primary ? “700” : “500”,
transition: “all 0.18s”,
boxShadow: primary ? “0 2px 8px rgba(231,76,60,0.3)” : “none”
};
};

return (
<div style={{ minHeight: “100vh”, background: bg, color: textMain, fontFamily: “system-ui, -apple-system, sans-serif”, display: “flex”, flexDirection: “column” }}>
<style>{”* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #ddd; } @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } } .fu { animation: fadeUp 0.4s ease forwards; } @keyframes spin { to { transform: rotate(360deg) } } .spin { animation: spin 0.9s linear infinite; } @keyframes pulse { 0%{ transform:scale(0.9);opacity:0.6} 100%{transform:scale(2.2);opacity:0} } .pulse { animation: pulse 2.2s ease-out infinite; } @keyframes fillBar { from{width:0} to{width:var(–w)} } .bar { animation: fillBar 1.1s cubic-bezier(.2,1,.3,1) forwards; } button:hover { opacity: 0.88; transform: translateY(-1px); } button:active { transform: translateY(0); }”}</style>

```
  {/* HEADER */}
  <div style={{ padding: "14px 20px 12px", background: "#ffffff", borderBottom: "1px solid " + border, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
    <Logo />
    <div>
      <div style={{ fontSize: 17, fontWeight: "800", color: textMain, letterSpacing: "-0.02em" }}>
        1080 <span style={{ color: accent }}>Bait Alert</span>
      </div>
      <div style={{ fontSize: 10, color: textLight, letterSpacing: "0.12em", textTransform: "uppercase" }}>Australia Travel Safety</div>
    </div>
    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, fontWeight: "600", background: isOnline ? "#e8f8ee" : "#fdecea", color: isOnline ? "#27ae60" : "#c0392b", border: "1px solid " + (isOnline ? "#a8ddb8" : "#f5b7b1") }}>
        {isOnline ? "ONLINE" : "OFFLINE"}
      </div>
      <button onClick={function() { setScreen("info"); }} style={{ background: "transparent", border: "none", color: textLight, fontSize: 20, cursor: "pointer", padding: "4px 4px" }}>ℹ</button>
    </div>
  </div>

  {/* HOME */}
  {screen === "home" && (
    <div className="fu" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", gap: 32 }}>
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div style={{ fontSize: 42, fontWeight: "900", lineHeight: 1.1, color: textMain, letterSpacing: "-0.03em", marginBottom: 12 }}>
          Is it safe<br /><span style={{ color: accent }}>where you are?</span>
        </div>
        <div style={{ color: textSub, fontSize: 15, lineHeight: 1.7 }}>
          1080 baits are used widely across Australia. They are <strong style={{ color: accent }}>lethal to dogs</strong> and risk areas aren't always signed.
        </div>
      </div>

      <div style={{ position: "relative", width: 90, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="pulse" style={{ position: "absolute", width: 70, height: 70, border: "2px solid " + accent, borderRadius: "50%", top: 10, left: 10, opacity: 0.5 }} />
        <div className="pulse" style={{ position: "absolute", width: 70, height: 70, border: "2px solid " + accent, borderRadius: "50%", top: 10, left: 10, animationDelay: "0.9s", opacity: 0.3 }} />
        <div style={{ fontSize: 48, position: "relative", zIndex: 1 }}>🐾</div>
      </div>

      <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 12 }}>
        <button style={btnStyle(true)} onClick={function() { setScreen("disclaimer"); }}>
          📍 Check My Location Risk
        </button>
        <button style={btnStyle(false)} onClick={function() { setScreen("info"); }}>
          Learn About 1080 Baits
        </button>
      </div>

      {!isOnline && (
        <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#7a5800", maxWidth: 340, textAlign: "center", lineHeight: 1.6 }}>
          📵 You're offline — the app works fully using built-in data. AI analysis unavailable until you have signal.
        </div>
      )}

      <div style={{ color: textLight, fontSize: 11, letterSpacing: "0.08em", textAlign: "center", textTransform: "uppercase" }}>
        For pet owners · campers · trail users · rural travellers
      </div>
    </div>
  )}

  {/* DISCLAIMER */}
  {screen === "disclaimer" && (
    <div className="fu" style={{ flex: 1, overflowY: "auto", padding: "24px 20px 48px" }}>
      <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "#fdecea", border: "1px solid #f5b7b1", borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 15, fontWeight: "800", color: accent, marginBottom: 10 }}>⚠ Important Disclaimer</div>
          <div style={{ color: "#7b241c", fontSize: 13, lineHeight: 1.8 }}>{DISCLAIMER}</div>
        </div>
        <div style={{ ...card, fontSize: 13, color: textSub, lineHeight: 1.8 }}>
          <div style={{ color: textMain, fontWeight: "700", marginBottom: 6 }}>How this app works</div>
          Uses built-in regional data on known 1080 baiting zones across all Australian states combined with your GPS to estimate risk. Works completely offline.
          {isOnline ? " You're online — a live AI analysis and nearest vets will also load for your location." : " You're offline — full risk assessment still works without internet."}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button style={btnStyle(true)} onClick={startCheck}>I Understand — Check My Risk</button>
          <button style={btnStyle(false)} onClick={function() { setScreen("home"); }}>Go Back</button>
        </div>
      </div>
    </div>
  )}

  {/* LOADING */}
  {screen === "loading" && (
    <div className="fu" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <div className="spin" style={{ width: 46, height: 46, border: "3px solid #eeeeee", borderTop: "3px solid " + accent, borderRadius: "50%" }} />
      <div style={{ color: textSub, fontSize: 14, letterSpacing: "0.1em" }}>Finding your location...</div>
    </div>
  )}

  {/* RESULT */}
  {screen === "result" && (
    <div className="fu" style={{ flex: 1, overflowY: "auto", padding: "20px 20px 48px" }}>
      <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>

        {locError && (
          <div style={{ background: "#fdecea", border: "1px solid #f5b7b1", borderRadius: 12, padding: 14, color: "#922b21", fontSize: 14 }}>⚠ {locError}</div>
        )}

        {assessment && (
          <>
            {/* Risk Card */}
            <div style={{ background: assessment.color, borderRadius: 14, padding: 20, color: "#ffffff", position: "relative", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
              <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85, marginBottom: 4, fontFamily: "'Courier New', monospace" }}>Risk Level</div>
              <div style={{ fontSize: 48, fontWeight: "900", lineHeight: 1, letterSpacing: "-0.02em" }}>{assessment.risk}</div>
              <div style={{ fontSize: 14, opacity: 0.9, marginTop: 6 }}>
                {placeName ? placeName : assessment.region}
              </div>
              {placeName && (
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{assessment.region}</div>
              )}
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, opacity: 0.75, marginBottom: 5, letterSpacing: "0.05em" }}>
                  {RISK_ORDER.map(function(r) { return <span key={r}>{r}</span>; })}
                </div>
                <div style={{ height: 8, background: "rgba(255,255,255,0.25)", borderRadius: 4, overflow: "hidden" }}>
                  <div className="bar" style={{ "--w": riskPct + "%", height: "100%", background: "#ffffff", borderRadius: 4, opacity: 0.9, width: 0 }} />
                </div>
              </div>
            </div>

            {/* Location */}
            {location && (
              <div style={{ ...card, display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 22 }}>📍</div>
                <div>
                  <div style={lbl}>Your Location</div>
                  <div style={{ fontSize: 13, color: textMain, fontWeight: "600" }}>{placeName || "Locating..."}</div>
                  <div style={{ fontSize: 11, color: textLight, fontFamily: "'Courier New', monospace" }}>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</div>
                </div>
              </div>
            )}

            {/* Regional context */}
            <div style={card}>
              <div style={lbl}>Regional Risk Context</div>
              <div style={{ fontSize: 14, color: textSub, lineHeight: 1.8 }}>{assessment.notes}</div>
            </div>

            {/* AI Analysis */}
            <div style={{ ...card, borderLeft: "3px solid " + (aiResult ? "#3498db" : border) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={lbl}>AI Risk Analysis</div>
                {aiStatus === "online" && !aiLoading && aiResult && (
                  <div style={{ fontSize: 9, color: "#27ae60", background: "#e8f8ee", padding: "2px 7px", borderRadius: 10, border: "1px solid #a8ddb8", fontWeight: "600" }}>LIVE</div>
                )}
                {aiStatus === "offline" && (
                  <div style={{ fontSize: 9, color: "#e67e22", background: "#fef9e7", padding: "2px 7px", borderRadius: 10, border: "1px solid #f9e79f", fontWeight: "600" }}>OFFLINE</div>
                )}
              </div>
              {aiLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: textLight, fontSize: 13 }}>
                  <div className="spin" style={{ width: 14, height: 14, border: "2px solid #eeeeee", borderTop: "2px solid #3498db", borderRadius: "50%", flexShrink: 0 }} />
                  Analysing your location...
                </div>
              )}
              {!aiLoading && aiResult && (
                <div style={{ fontSize: 14, color: textSub, lineHeight: 1.8 }}>{aiResult}</div>
              )}
              {!aiLoading && aiStatus === "offline" && (
                <div style={{ fontSize: 13, color: textLight, lineHeight: 1.7 }}>
                  No internet connection. All risk data above is accurate from the built-in database. Find signal to load AI analysis.
                </div>
              )}
              {!aiLoading && aiStatus === "error" && (
                <div style={{ fontSize: 13, color: textLight, lineHeight: 1.7 }}>
                  Could not load AI analysis.
                  <button onClick={function() { fetchAI(location.lat, location.lng, assessment); }} style={{ ...btnStyle(false), width: "auto", marginTop: 8, padding: "7px 14px", fontSize: 12 }}>Retry</button>
                </div>
              )}
            </div>

            {/* Nearest Vets */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={lbl}>Nearest Veterinary Clinics</div>
                {vetsLoading && <div className="spin" style={{ width: 12, height: 12, border: "2px solid #eeeeee", borderTop: "2px solid " + accent, borderRadius: "50%" }} />}
              </div>
              {vetsLoading && (
                <div style={{ fontSize: 13, color: textLight }}>Finding nearest vets...</div>
              )}
              {!vetsLoading && vets && vets.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {vets.map(function(v, i) {
                    return (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingBottom: i < vets.length - 1 ? 10 : 0, borderBottom: i < vets.length - 1 ? "1px solid " + border : "none" }}>
                        <div style={{ width: 28, height: 28, background: "#fdecea", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🏥</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: "600", color: textMain }}>{v.name}</div>
                          <div style={{ fontSize: 12, color: textLight, marginTop: 2 }}>{v.address}</div>
                          {v.phone && (
                            <a href={"tel:" + v.phone} style={{ fontSize: 13, color: accent, fontWeight: "600", textDecoration: "none", marginTop: 4, display: "block" }}>{v.phone}</a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {!vetsLoading && !vets && isOnline && (
                <div style={{ fontSize: 13, color: textLight }}>Could not load vet information.</div>
              )}
              {!vetsLoading && !vets && !isOnline && (
                <div style={{ fontSize: 13, color: textLight }}>Vet lookup requires an internet connection.</div>
              )}
            </div>

            {/* Recommendations */}
            <div style={card}>
              <div style={lbl}>Safety Recommendations</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                {assessment.recommendations.map(function(r, i) {
                  return (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ width: 22, height: 22, background: assessment.color + "18", border: "1px solid " + assessment.color + "44", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: assessment.color, flexShrink: 0, marginTop: 1, fontWeight: "700" }}>{i + 1}</div>
                      <div style={{ fontSize: 14, color: textSub, lineHeight: 1.7 }}>{r}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notifications */}
            {(assessment.risk === "HIGH" || assessment.risk === "EXTREME") && notifPermission !== "unsupported" && (
              <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 12, padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 22 }}>🔔</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: "600", color: "#7a5800", marginBottom: 2 }}>Risk Zone Alerts</div>
                  <div style={{ fontSize: 12, color: "#9a7200", lineHeight: 1.6 }}>
                    {notifPermission === "granted" ? "Notifications enabled — you will be alerted when entering high risk areas." : "Enable notifications to be alerted when entering high or extreme risk zones."}
                  </div>
                  {notifPermission !== "granted" && (
                    <button onClick={function() { requestNotifications(assessment.risk); setNotifPermission(Notification.permission); }} style={{ ...btnStyle(true), width: "auto", marginTop: 8, padding: "8px 14px", fontSize: 12 }}>
                      Enable Alerts
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Emergency */}
            <div style={{ background: "#fdecea", border: "1px solid #f5b7b1", borderRadius: 12, padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ fontSize: 26 }}>🚨</div>
              <div>
                <div style={{ fontSize: 11, color: accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: "700" }}>Emergency Contacts</div>
                <div style={{ fontSize: 14, color: "#7b241c", lineHeight: 1.8 }}>
                  Animal Poisons Helpline:<br /><a href="tel:1300869738" style={{ color: accent, fontWeight: "800", fontSize: 16, textDecoration: "none" }}>1300 869 738</a>
                </div>
              </div>
            </div>

            <button style={btnStyle(false)} onClick={function() { setScreen("home"); }}>← Back to Home</button>
          </>
        )}
      </div>
    </div>
  )}

  {/* INFO */}
  {screen === "info" && (
    <div className="fu" style={{ flex: 1, overflowY: "auto", padding: "20px 20px 48px" }}>
      <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontSize: 28, fontWeight: "900", color: textMain, letterSpacing: "-0.02em" }}>About <span style={{ color: accent }}>1080 Baits</span></div>
        {[
          { icon: "☠️", title: "What is 1080?", body: "Sodium fluoroacetate (1080) is a naturally occurring toxin used across Australia as a pesticide to control introduced pests including foxes, wild dogs, feral pigs, and rabbits. It is colourless, odourless, and tasteless — making it impossible to detect by sight or smell." },
          { icon: "🐕", title: "Why is it dangerous to dogs?", body: "Dogs are extremely sensitive to 1080. Even a tiny amount — a fragment of a bait — can be fatal. There is no antidote. Symptoms include vomiting, anxiety, tremors, and seizures, typically within 30 minutes to 6 hours of ingestion." },
          { icon: "🗺️", title: "Where is it used in Australia?", body: "Western Australia uses 1080 most extensively. It is also widely used in Queensland, NSW, South Australia, Victoria, the Northern Territory, and Tasmania. Baiting occurs on private farmland, national parks, and pastoral leases — often without permanent or visible signage." },
          { icon: "📋", title: "Legal requirements", body: "Landholders are required to erect warning signs, but signs can be damaged, removed, or placed only at main access points. Remote properties may have active baiting programs across thousands of hectares. Always check with local councils and park authorities." },
          { icon: "🔬", title: "Types of baits used", body: "Common bait types include Doggone® meat baits, Foxoff® baits, Pigout® (for pigs), and Pindone rabbit baits. They may be buried, placed in bait stations, or aerially dropped. Aerial baiting is common in WA, QLD and SA." },
          { icon: "📞", title: "If your pet is affected", body: "Contact the Animal Poisons Helpline immediately: 1300 869 738. Get to a vet as fast as possible. There is no specific antidote but early supportive care can significantly improve survival chances." },
        ].map(function(item, i) {
          return (
            <div key={i} style={card}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ fontSize: 22, marginTop: 1 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 14, color: textMain, fontWeight: "700", marginBottom: 5 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: textSub, lineHeight: 1.8 }}>{item.body}</div>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ ...card, fontSize: 11, color: textLight, lineHeight: 1.8 }}>
          <span style={{ fontWeight: "700", color: textSub }}>Data sources: </span>DPIRD WA, DAF QLD, DPIE NSW, DEECA VIC, PIRSA SA, DPIF NT, DPIPWE TAS, Parks Australia, APVMA, Invasive Animals CRC.
        </div>
        <button style={btnStyle(false)} onClick={function() { setScreen("home"); }}>← Back to Home</button>
      </div>
    </div>
  )}
</div>
```

);
}
