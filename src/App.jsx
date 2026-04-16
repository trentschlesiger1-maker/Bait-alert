import { useState, useEffect } from "react";

const DISCLAIMER = "This app provides general risk guidance only. " +
  "It is based on publicly available information about 1080 baiting programs in Australia. " +
  "It does NOT provide real-time baiting data and should NOT be relied upon as a definitive safety guide. " +
  "Always check with local councils and national parks for current baiting programs. " +
  "Keep pets on leads in all rural and bushland areas. " +
  "Emergency: Animal Poisons Helpline 1300 869 738.";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const HIGH_RISK_MONTHS = [2,3,4,8,9,10]; // Mar,Apr,May,Sep,Oct,Nov (0-indexed)

const RISK_REGIONS = [
  { name: "Western Australia (Southwest)", lat: -31.95, lng: 115.86, radius: 800, risk: "EXTREME", color: "#c0392b", notes: "WA uses more 1080 than any other state. Widespread aerial and ground baiting for foxes and wild dogs across agricultural and pastoral land." },
  { name: "Western Australia (Goldfields-Esperance)", lat: -30.75, lng: 121.47, radius: 700, risk: "EXTREME", color: "#c0392b", notes: "Active livestock protection programs. Vast pastoral stations use 1080 extensively for wild dog control." },
  { name: "Western Australia (Pilbara)", lat: -21.17, lng: 118.62, radius: 600, risk: "HIGH", color: "#e67e22", notes: "Pastoral wild dog baiting programs active. Remote and vast — baited areas may be unmarked." },
  { name: "Western Australia (Kimberley)", lat: -17.66, lng: 128.73, radius: 600, risk: "HIGH", color: "#e67e22", notes: "Cattle station baiting for dingoes and wild dogs. Risk higher in pastoral areas away from towns." },
  { name: "Queensland (Western Outback)", lat: -25.0, lng: 144.0, radius: 700, risk: "HIGH", color: "#e67e22", notes: "Wild dog baiting programs across western QLD. Channel Country and pastoral areas actively baited." },
  { name: "Queensland (Southeast Hinterland)", lat: -27.5, lng: 152.7, radius: 250, risk: "MODERATE", color: "#d4930a", notes: "Periodic fox and wild dog baiting in national park buffer zones and private land." },
  { name: "Queensland (Darling Downs)", lat: -27.56, lng: 151.95, radius: 250, risk: "MODERATE", color: "#d4930a", notes: "Agricultural pest control programs active. Foxes and pigs targeted on farmland." },
  { name: "New South Wales (Western Plains)", lat: -31.5, lng: 146.0, radius: 600, risk: "HIGH", color: "#e67e22", notes: "Large-scale wild dog and fox baiting across western NSW. National Parks and Wildlife Service conducts programs." },
  { name: "New South Wales (Snowy Mountains)", lat: -36.4, lng: 148.5, radius: 200, risk: "MODERATE", color: "#d4930a", notes: "Pest control for foxes and wild dogs near alpine areas. Check NPWS before entering bushland." },
  { name: "New South Wales (Tablelands)", lat: -33.5, lng: 149.5, radius: 300, risk: "MODERATE", color: "#d4930a", notes: "Central Tablelands — farming areas with periodic baiting programs." },
  { name: "Victoria (High Country)", lat: -36.9, lng: 147.0, radius: 250, risk: "MODERATE", color: "#d4930a", notes: "Wild dog and fox control in alpine and sub-alpine areas. Parks Victoria manages programs." },
  { name: "Victoria (Mallee)", lat: -35.0, lng: 142.0, radius: 300, risk: "MODERATE", color: "#d4930a", notes: "Fox and rabbit control baiting in Mallee regions." },
  { name: "South Australia (Outback/Pastoral)", lat: -30.0, lng: 135.0, radius: 700, risk: "HIGH", color: "#e67e22", notes: "Widespread dingo and wild dog baiting across SA pastoral zones. Extremely remote." },
  { name: "South Australia (Agricultural South)", lat: -35.1, lng: 138.6, radius: 300, risk: "MODERATE", color: "#d4930a", notes: "Fox control programs in agricultural areas and national park edges." },
  { name: "Northern Territory (Pastoral/Outback)", lat: -19.5, lng: 133.0, radius: 700, risk: "HIGH", color: "#e67e22", notes: "Dingo and wild dog baiting on cattle stations. Baiting common across remote areas." },
  { name: "Tasmania (Rural North and Midlands)", lat: -41.8, lng: 146.5, radius: 300, risk: "MODERATE", color: "#d4930a", notes: "Some ongoing wildlife and pest control baiting in rural midlands." },
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

const SYMPTOM_STEPS = [
  {
    q: "Is your dog showing any of these signs?",
    opts: ["Vomiting or retching", "Trembling or shaking", "Seizures or convulsions", "Collapse or unresponsive", "None of these yet"],
    emergency: [0,1,2,3],
    next: [1,1,1,1,1]
  },
  {
    q: "Did your dog eat something unusual in the last 6 hours?",
    opts: ["Yes — possibly a bait or meat chunk", "Yes — something else", "Not sure", "No"],
    emergency: [0],
    next: [2,2,2,2]
  },
  {
    q: "How long ago did you notice symptoms or the possible ingestion?",
    opts: ["Less than 30 minutes ago", "30 minutes to 2 hours ago", "More than 2 hours ago"],
    emergency: [0,1,2],
    next: [3,3,3]
  },
  { final: true }
];

const FIRST_AID = [
  { icon: "1", title: "Call immediately", body: "Phone the Animal Poisons Helpline now: 1300 869 738. Do not wait for symptoms to worsen. Tell them your location and what you think your dog ate." },
  { icon: "2", title: "Get to a vet", body: "Drive to the nearest vet immediately. There is no antidote for 1080. Early supportive care — controlling seizures, maintaining breathing — is the only treatment and every minute counts." },
  { icon: "3", title: "Do NOT induce vomiting", body: "Do not attempt to make your dog vomit unless specifically instructed by a vet or the poisons helpline. Incorrect induction can make things worse." },
  { icon: "4", title: "Keep your dog calm", body: "Keep your dog as still and calm as possible. Excitement or movement can accelerate the spread of the toxin. Wrap them in a blanket and speak calmly." },
  { icon: "5", title: "Collect evidence", body: "If you can safely do so, take a photo of the bait or collect a small sample in a bag. This helps the vet identify the exact toxin and dose." },
  { icon: "6", title: "Watch for seizures", body: "If your dog has a seizure, move objects away to prevent injury. Time the seizure if you can. Do not put your hands near their mouth." },
  { icon: "7", title: "After treatment", body: "Even if your dog seems to recover, keep them quiet and rested for 48 hours. Delayed effects can occur. Follow up with your vet the next day." },
];

const CAMPSITE_RATINGS = [
  { name: "Karijini NP Campgrounds", state: "WA", risk: "EXTREME", notes: "Deep in WA Pilbara. Aerial baiting conducted in surrounding stations. Keep dogs on lead at all times, check for bait station signs on entry." },
  { name: "Gibb River Road Stations", state: "WA", risk: "HIGH", notes: "Cattle stations along Gibb River Road actively bait for wild dogs. Most stations allow dogs but enforce lead rules strictly." },
  { name: "Flinders Ranges Campgrounds", state: "SA", risk: "MODERATE", notes: "Pastoral edges of Flinders Ranges have periodic baiting. National park interior is lower risk but always keep dogs leashed." },
  { name: "Outback NSW Stations", state: "NSW", risk: "HIGH", notes: "Station stays in western NSW — baiting programs active particularly in autumn and spring. Confirm current status with station owner on arrival." },
  { name: "High Country Victoria Camps", state: "VIC", risk: "MODERATE", notes: "Alpine and sub-alpine campgrounds in Victoria. Parks Victoria conducts fox and wild dog control. Stick to designated camping areas." },
  { name: "Channel Country QLD", state: "QLD", risk: "HIGH", notes: "Remote outback QLD. Wild dog baiting extensive across this region. Campers should treat all surrounding land as potentially baited." },
  { name: "Coastal NSW and QLD", state: "NSW/QLD", risk: "LOW", notes: "Coastal campgrounds generally low risk. Hinterland areas nearby may have higher risk — check before venturing inland with dogs." },
  { name: "Tasmania State Forests", state: "TAS", risk: "MODERATE", notes: "Some forest areas have pest control programs. Check with Forestry Tasmania before camping with dogs in remote areas." },
];

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
  if (risk === "EXTREME") return ["DO NOT bring dogs into this area if avoidable", "Contact local council before entering any bushland", "Keep dogs on a short lead at ALL times", "Avoid all unsealed tracks, scrubland, and farm boundaries", ...base];
  if (risk === "HIGH") return ["Strongly consider leaving dogs at pet-friendly accommodation", "Contact local national park or council for current bait notices", "Keep dogs on a short lead at ALL times", "Avoid farm boundaries, bush tracks and scrub", ...base];
  if (risk === "MODERATE") return ["Keep dogs on lead at all times in natural areas", "Check local council websites for current baiting notices", "Avoid walking near farms or unfenced bushland", ...base];
  return ["Stay on marked paths in parks and reserves", "Keep dogs on lead in any bushland or reserve", ...base];
}

function getRiskAssessment(lat, lng) {
  for (const z of LOW_RISK_ZONES) {
    if (getDistanceKm(lat, lng, z.lat, z.lng) < z.radius) {
      return { risk: "LOW", color: "#27ae60", region: z.name, notes: "You are in or near a major metropolitan area. 1080 baiting is generally not conducted in urban zones.", recommendations: getRecs("LOW") };
    }
  }
  let closest = null, closestDist = Infinity;
  for (const r of RISK_REGIONS) {
    const dist = getDistanceKm(lat, lng, r.lat, r.lng);
    if (dist < closestDist) { closestDist = dist; closest = { ...r }; }
  }
  if (!closest) return null;
  if (closestDist < closest.radius) return { risk: closest.risk, color: closest.color, region: closest.name, notes: closest.notes, recommendations: getRecs(closest.risk) };
  if (closestDist < closest.radius * 1.5) return { risk: "MODERATE", color: "#d4930a", region: "Near " + closest.name, notes: "You are within range of a known baiting zone. Risk increases further from urban centres.", recommendations: getRecs("MODERATE") };
  return { risk: "LOW-MODERATE", color: "#7daa2d", region: "Rural/Semi-rural area", notes: "Lower-risk area, but 1080 baiting can occur on private land throughout Australia. Treat as moderate risk in rural areas.", recommendations: getRecs("LOW-MODERATE") };
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch("https://nominatim.openstreetmap.org/reverse?format=json&lat=" + lat + "&lon=" + lng + "&zoom=10&addressdetails=1", { headers: { "Accept-Language": "en" } });
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
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        system: "Return ONLY a valid JSON array, no other text or markdown.",
        messages: [{ role: "user", content: "List the 3 nearest veterinary clinics to lat " + lat.toFixed(3) + " lng " + lng.toFixed(3) + " Australia. Return ONLY JSON array: [{\"name\":\"string\",\"address\":\"string\",\"phone\":\"string or null\",\"hours\":\"string or null\"}]" }]
      })
    });
    const data = await res.json();
    const block = data.content && data.content.find(function(b) { return b.type === "text"; });
    if (!block) return null;
    const clean = block.text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch { return null; }
}

function requestNotification(risk) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification("1080 Bait Alert", { body: risk + " risk zone detected. Keep your dog on a lead and stay alert." });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function(p) {
      if (p === "granted") new Notification("1080 Bait Alert", { body: risk + " risk zone. Keep your dog on a lead." });
    });
  }
}

function getSeasonalWarning() {
  const month = new Date().getMonth();
  if (HIGH_RISK_MONTHS.includes(month)) {
    const season = month >= 2 && month <= 4 ? "autumn" : "spring";
    return "Seasonal alert: It is currently " + season + " — one of the peak periods for 1080 baiting programs across Australia. Extra caution advised.";
  }
  return null;
}

function riskColor(risk) {
  if (risk === "EXTREME") return "#c0392b";
  if (risk === "HIGH") return "#e67e22";
  if (risk === "MODERATE") return "#d4930a";
  if (risk === "LOW-MODERATE") return "#7daa2d";
  return "#27ae60";
}

function Logo() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="10" fill="#1a1a1a"/>
      <text x="22" y="18" textAnchor="middle" fill="#e74c3c" fontSize="13" fontWeight="bold" fontFamily="Impact, Arial, sans-serif" letterSpacing="1">1080</text>
      <path d="M10 24 Q22 14 34 24 Q22 34 10 24Z" fill="none" stroke="#e74c3c" strokeWidth="1.5" opacity="0.5"/>
      <text x="22" y="36" textAnchor="middle" fill="#aaaaaa" fontSize="5" fontFamily="Arial, sans-serif" letterSpacing="0.5">BAIT ALERT</text>
    </svg>
  );
}

function RiskBadge({ risk }) {
  return (
    <span style={{ fontSize: 10, fontWeight: "700", padding: "2px 8px", borderRadius: 10, background: riskColor(risk) + "20", color: riskColor(risk), border: "1px solid " + riskColor(risk) + "50" }}>
      {risk}
    </span>
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
  const [notifPerm, setNotifPerm] = useState("Notification" in window ? Notification.permission : "unsupported");
  const [savedLocations, setSavedLocations] = useState(function() {
    try { return JSON.parse(localStorage.getItem("savedLocs") || "[]"); } catch { return []; }
  });
  const [petProfile, setPetProfile] = useState(function() {
    try { return JSON.parse(localStorage.getItem("petProfile") || "null"); } catch { return null; }
  });
  const [petForm, setPetForm] = useState({ name: "", breed: "", weight: "" });
  const [symptomStep, setSymptomStep] = useState(0);
  const [symptomAnswers, setSymptomAnswers] = useState([]);
  const [routeStart, setRouteStart] = useState("");
  const [routeEnd, setRouteEnd] = useState("");
  const [routeResult, setRouteResult] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const seasonalWarning = getSeasonalWarning();

  useEffect(function() {
    var up = function() { setIsOnline(true); };
    var dn = function() { setIsOnline(false); };
    window.addEventListener("online", up);
    window.addEventListener("offline", dn);
    return function() { window.removeEventListener("online", up); window.removeEventListener("offline", dn); };
  }, []);

  function saveLocation() {
    if (!location || !assessment) return;
    const newLoc = { name: placeName || assessment.region, lat: location.lat, lng: location.lng, risk: assessment.risk, saved: new Date().toLocaleDateString("en-AU") };
    const updated = [newLoc, ...savedLocations.filter(function(l) { return l.name !== newLoc.name; })].slice(0, 10);
    setSavedLocations(updated);
    try { localStorage.setItem("savedLocs", JSON.stringify(updated)); } catch {}
    alert("Location saved!");
  }

  function savePetProfile() {
    if (!petForm.name) return;
    setPetProfile(petForm);
    try { localStorage.setItem("petProfile", JSON.stringify(petForm)); } catch {}
    setScreen("home");
  }

  function shareRisk() {
    if (!assessment) return;
    const text = "1080 Bait Alert: " + assessment.risk + " risk area near " + (placeName || assessment.region) + ". Travelling with dogs? Stay safe! Check the 1080 Bait Alert app.";
    if (navigator.share) {
      navigator.share({ title: "1080 Bait Alert", text: text });
    } else {
      navigator.clipboard && navigator.clipboard.writeText(text);
      alert("Risk report copied to clipboard — paste into Facebook or any app!");
    }
  }

  var startCheck = function(savedLoc) {
    setScreen("loading");
    setLocError(null);
    setAiResult(null);
    setAiStatus("idle");
    setPlaceName("");
    setVets(null);

    if (savedLoc) {
      var result = getRiskAssessment(savedLoc.lat, savedLoc.lng);
      setLocation({ lat: savedLoc.lat, lng: savedLoc.lng });
      setAssessment(result);
      setPlaceName(savedLoc.name);
      setScreen("result");
      if (isOnline && result) { fetchAI(savedLoc.lat, savedLoc.lng, result); fetchVets(savedLoc.lat, savedLoc.lng); }
      else setAiStatus("offline");
      return;
    }

    if (!navigator.geolocation) { setLocError("Geolocation is not supported by this device."); setScreen("result"); return; }
    navigator.geolocation.getCurrentPosition(
      async function(pos) {
        var lat = pos.coords.latitude;
        var lng = pos.coords.longitude;
        setLocation({ lat: lat, lng: lng });
        var result = getRiskAssessment(lat, lng);
        setAssessment(result);
        setScreen("result");
        if (result && (result.risk === "HIGH" || result.risk === "EXTREME")) {
          requestNotification(result.risk);
          setNotifPerm("Notification" in window ? Notification.permission : "unsupported");
        }
        if (navigator.onLine) {
          setIsOnline(true);
          var place = await reverseGeocode(lat, lng);
          if (place) setPlaceName(place);
          fetchAI(lat, lng, result);
          fetchVets(lat, lng);
        } else {
          setIsOnline(false);
          setAiStatus("offline");
        }
      },
      function() { setLocError("Unable to get location. Please enable location permissions."); setScreen("result"); },
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
          max_tokens: 700,
          system: "You are an expert on 1080 baiting programs in Australia. Give concise practical safety advice in 2-3 plain text paragraphs. No markdown.",
          messages: [{ role: "user", content: "User at lat " + lat.toFixed(3) + " lng " + lng.toFixed(3) + " Australia. Region: " + result.region + " Risk: " + result.risk + ". Context: " + result.notes + ". Explain in under 160 words: why this risk level, what 1080 is used for here, most important safety action. Plain text only." }]
        })
      });
      if (!res.ok) throw new Error();
      var data = await res.json();
      var block = data.content && data.content.find(function(b) { return b.type === "text"; });
      setAiResult(block ? block.text : null);
      if (!block || !block.text) setAiStatus("error");
    } catch { setAiResult(null); setAiStatus("error"); }
    setAiLoading(false);
  };

  var fetchVets = async function(lat, lng) {
    setVetsLoading(true);
    var result = await fetchNearbyVets(lat, lng);
    setVets(result);
    setVetsLoading(false);
  };

  var CITY_COORDS = {
    "perth": { lat: -31.95, lng: 115.86 }, "broome": { lat: -17.96, lng: 122.24 },
    "darwin": { lat: -12.46, lng: 130.84 }, "alice springs": { lat: -23.7, lng: 133.87 },
    "adelaide": { lat: -34.93, lng: 138.6 }, "melbourne": { lat: -37.81, lng: 144.96 },
    "sydney": { lat: -33.87, lng: 151.21 }, "brisbane": { lat: -27.47, lng: 153.03 },
    "cairns": { lat: -16.92, lng: 145.77 }, "townsville": { lat: -19.26, lng: 146.82 },
    "hobart": { lat: -42.88, lng: 147.33 }, "canberra": { lat: -35.28, lng: 149.13 },
    "kalgoorlie": { lat: -30.75, lng: 121.47 }, "geraldton": { lat: -28.78, lng: 114.61 },
    "port hedland": { lat: -20.31, lng: 118.58 }, "karratha": { lat: -20.74, lng: 116.85 },
    "newman": { lat: -23.36, lng: 119.73 }, "carnarvon": { lat: -24.88, lng: 113.66 },
    "esperance": { lat: -33.86, lng: 121.89 }, "albany": { lat: -35.02, lng: 117.88 },
    "bunbury": { lat: -33.33, lng: 115.64 }, "mandurah": { lat: -32.52, lng: 115.72 },
    "katherine": { lat: -14.47, lng: 132.26 }, "tennant creek": { lat: -19.65, lng: 134.19 },
    "mount isa": { lat: -20.73, lng: 139.5 }, "longreach": { lat: -23.44, lng: 144.25 },
    "charleville": { lat: -26.4, lng: 146.24 }, "rockhampton": { lat: -23.38, lng: 150.51 },
    "mackay": { lat: -21.14, lng: 149.19 }, "toowoomba": { lat: -27.56, lng: 151.95 },
    "gold coast": { lat: -28.02, lng: 153.43 }, "sunshine coast": { lat: -26.65, lng: 153.07 },
    "dubbo": { lat: -32.24, lng: 148.6 }, "broken hill": { lat: -31.95, lng: 141.47 },
    "wagga wagga": { lat: -35.12, lng: 147.37 }, "albury": { lat: -36.08, lng: 146.92 },
    "newcastle": { lat: -32.93, lng: 151.78 }, "wollongong": { lat: -34.43, lng: 150.89 },
    "ballarat": { lat: -37.56, lng: 143.86 }, "bendigo": { lat: -36.76, lng: 144.28 },
    "geelong": { lat: -38.15, lng: 144.35 }, "launceston": { lat: -41.43, lng: 147.14 },
    "port augusta": { lat: -32.49, lng: 137.77 }, "whyalla": { lat: -33.03, lng: 137.58 },
    "coober pedy": { lat: -29.01, lng: 134.75 }
  };

  function geocodeCity(name) {
    var key = name.toLowerCase().replace(/\s+wa$|\s+qld$|\s+nsw$|\s+vic$|\s+sa$|\s+nt$|\s+tas$|\s+act$/i, "").trim();
    return CITY_COORDS[key] || null;
  }

  function interpolatePoints(start, end, steps) {
    var pts = [];
    for (var i = 0; i <= steps; i++) {
      pts.push({
        lat: start.lat + (end.lat - start.lat) * (i / steps),
        lng: start.lng + (end.lng - start.lng) * (i / steps)
      });
    }
    return pts;
  }

  var checkRouteRisk = function() {
    if (!routeStart || !routeEnd) return;
    setRouteLoading(true);
    setRouteResult(null);
    setTimeout(function() {
      var startCoord = geocodeCity(routeStart);
      var endCoord = geocodeCity(routeEnd);
      if (!startCoord || !endCoord) {
        setRouteResult({ overall: "UNKNOWN", summary: "Could not find one or both locations. Try major town names like Perth, Broome, Darwin, Alice Springs.", segments: [], mapUrl: null });
        setRouteLoading(false);
        return;
      }
      var pts = interpolatePoints(startCoord, endCoord, 8);
      var segments = [];
      var highestIdx = 0;
      pts.forEach(function(pt, i) {
        if (i === 0 || i === pts.length - 1) return;
        var assessment = getRiskAssessment(pt.lat, pt.lng);
        if (assessment) {
          var idx = RISK_ORDER.indexOf(assessment.risk);
          if (idx > highestIdx) highestIdx = idx;
          var last = segments[segments.length - 1];
          if (last && last.risk === assessment.risk) {
            last.note = assessment.notes;
          } else {
            segments.push({ name: assessment.region, risk: assessment.risk, note: assessment.notes, lat: pt.lat, lng: pt.lng });
          }
        }
      });
      var overall = RISK_ORDER[highestIdx];
      var summaryMap = {
        "EXTREME": "This route passes through extreme 1080 baiting zones. Strongly consider alternative routes or leave dogs at home.",
        "HIGH": "This route passes through high-risk baiting areas. Keep dogs on short leads at all stops and avoid scrubland.",
        "MODERATE": "Moderate risk along parts of this route. Stay on sealed roads and keep dogs on leads at all stops.",
        "LOW-MODERATE": "Mostly lower risk but rural sections may have baiting activity. Stay cautious at all stops.",
        "LOW": "This route stays mostly in low-risk areas. Standard precautions apply in any bushland."
      };
      var minLat = Math.min(startCoord.lat, endCoord.lat) - 2;
      var maxLat = Math.max(startCoord.lat, endCoord.lat) + 2;
      var minLng = Math.min(startCoord.lng, endCoord.lng) - 2;
      var maxLng = Math.max(startCoord.lng, endCoord.lng) + 2;
      var bbox = minLng + "," + minLat + "," + maxLng + "," + maxLat;
      var mapUrl = "https://www.openstreetmap.org/export/embed.html?bbox=" + bbox + "&layer=mapnik&marker=" + startCoord.lat + "," + startCoord.lng;
      setRouteResult({ overall: overall, summary: summaryMap[overall] || "Route assessed.", segments: segments, mapUrl: mapUrl, startCoord: startCoord, endCoord: endCoord, bbox: bbox });
      setRouteLoading(false);
    }, 600);
  };

  var riskPct = assessment ? ((RISK_ORDER.indexOf(assessment.risk) + 1) / RISK_ORDER.length) * 100 : 0;

  var bg = "#f4f4f0";
  var bgCard = "#ffffff";
  var textMain = "#1c1c1e";
  var textSub = "#4a4a4a";
  var textLight = "#8a8a8e";
  var border = "#e0e0e0";
  var accent = "#e74c3c";

  var card = { background: bgCard, border: "1px solid " + border, borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" };
  var lbl = { fontSize: 10, color: textLight, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6, fontFamily: "monospace" };

  function Btn(props) {
    var primary = props.primary;
    var style = {
      cursor: "pointer", border: primary ? "none" : "1.5px solid " + border,
      background: primary ? accent : bgCard, color: primary ? "#fff" : textSub,
      fontFamily: "system-ui, sans-serif", letterSpacing: "0.03em",
      width: props.auto ? "auto" : "100%", borderRadius: 10,
      padding: props.small ? "9px 14px" : "14px 20px",
      fontSize: props.small ? 12 : 14, fontWeight: primary ? "700" : "500",
      transition: "all 0.18s", boxShadow: primary ? "0 2px 8px rgba(231,76,60,0.25)" : "none",
      marginTop: props.mt || 0
    };
    return <button style={style} onClick={props.onClick}>{props.children}</button>;
  }

  function NavBar() {
    var tabs = [
      { id: "home", label: "Home", icon: "🏠" },
      { id: "symptom", label: "Emergency", icon: "🚨" },
      { id: "firstaid", label: "First Aid", icon: "💊" },
      { id: "saved", label: "Saved", icon: "📍" },
      { id: "more", label: "More", icon: "☰" },
    ];
    return (
      <div style={{ background: bgCard, borderTop: "1px solid " + border, display: "flex", padding: "8px 0 4px" }}>
        {tabs.map(function(t) {
          return (
            <button key={t.id} onClick={function() {
              if (t.id === "symptom") { setSymptomStep(0); setSymptomAnswers([]); }
              setScreen(t.id);
            }} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 0" }}>
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <span style={{ fontSize: 9, color: screen === t.id ? accent : textLight, fontWeight: screen === t.id ? "700" : "400", fontFamily: "system-ui" }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, color: textMain, fontFamily: "system-ui, -apple-system, sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{"* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #ddd; } @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } } .fu { animation: fadeUp 0.4s ease forwards; } @keyframes spin { to { transform: rotate(360deg) } } .spin { animation: spin 0.9s linear infinite; } @keyframes pulse { 0%{transform:scale(0.9);opacity:0.6} 100%{transform:scale(2.2);opacity:0} } .pulse { animation: pulse 2.2s ease-out infinite; } @keyframes fillBar { from{width:0} to{width:var(--w)} } .bar { animation: fillBar 1.1s cubic-bezier(.2,1,.3,1) forwards; } button:hover { opacity:0.88; } input { font-family: system-ui, sans-serif; }"}</style>

      {/* HEADER */}
      <div style={{ padding: "14px 20px 12px", background: bgCard, borderBottom: "1px solid " + border, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", flexShrink: 0 }}>
        <Logo />
        <div>
          <div style={{ fontSize: 17, fontWeight: "800", color: textMain, letterSpacing: "-0.02em" }}>1080 <span style={{ color: accent }}>Bait Alert</span></div>
          <div style={{ fontSize: 10, color: textLight, letterSpacing: "0.1em", textTransform: "uppercase" }}>Australia Travel Safety</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <div style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, fontWeight: "600", background: isOnline ? "#e8f8ee" : "#fdecea", color: isOnline ? "#27ae60" : "#c0392b", border: "1px solid " + (isOnline ? "#a8ddb8" : "#f5b7b1") }}>
            {isOnline ? "ONLINE" : "OFFLINE"}
          </div>
        </div>
      </div>

      {/* SEASONAL BANNER */}
      {seasonalWarning && screen === "home" && (
        <div style={{ background: "#fff3e0", borderBottom: "1px solid #ffe0b2", padding: "10px 20px", fontSize: 12, color: "#e65100", lineHeight: 1.6 }}>
          🍂 {seasonalWarning}
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* HOME */}
        {screen === "home" && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 24px 24px", gap: 28 }}>
            {petProfile && (
              <div style={{ ...card, width: "100%", maxWidth: 400, display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 28 }}>🐶</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: "700", color: textMain }}>{petProfile.name}</div>
                  <div style={{ fontSize: 12, color: textLight }}>{petProfile.breed}{petProfile.weight ? " · " + petProfile.weight + "kg" : ""}</div>
                </div>
                <button onClick={function() { setPetForm(petProfile); setScreen("petprofile"); }} style={{ marginLeft: "auto", background: "none", border: "none", color: textLight, fontSize: 18, cursor: "pointer" }}>✏️</button>
              </div>
            )}

            <div style={{ textAlign: "center", maxWidth: 360 }}>
              <div style={{ fontSize: 40, fontWeight: "900", lineHeight: 1.1, color: textMain, letterSpacing: "-0.03em", marginBottom: 10 }}>
                Is it safe<br /><span style={{ color: accent }}>where you are?</span>
              </div>
              <div style={{ color: textSub, fontSize: 14, lineHeight: 1.7 }}>
                1080 baits are used widely across Australia. They are <strong style={{ color: accent }}>lethal to dogs</strong> and risk areas aren't always signed.
              </div>
            </div>

            <div style={{ position: "relative", width: 90, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="pulse" style={{ position: "absolute", width: 70, height: 70, border: "2px solid " + accent, borderRadius: "50%", top: 10, left: 10, opacity: 0.4 }} />
              <div className="pulse" style={{ position: "absolute", width: 70, height: 70, border: "2px solid " + accent, borderRadius: "50%", top: 10, left: 10, animationDelay: "0.9s", opacity: 0.25 }} />
              <div style={{ fontSize: 48, position: "relative", zIndex: 1 }}>🐾</div>
            </div>

            <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 10 }}>
              <Btn primary onClick={function() { setScreen("disclaimer"); }}>📍 Check My Location Risk</Btn>
              <Btn onClick={function() { setScreen("route"); }}>🗺️ Check Route Risk</Btn>
              <Btn onClick={function() { setScreen("campsites"); }}>🏕️ Campsite Safety Ratings</Btn>
              {!petProfile && <Btn onClick={function() { setPetForm({ name: "", breed: "", weight: "" }); setScreen("petprofile"); }}>🐶 Add Pet Profile</Btn>}
            </div>

            {!isOnline && (
              <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 10, padding: "10px 16px", fontSize: 12, color: "#7a5800", maxWidth: 360, textAlign: "center", lineHeight: 1.6 }}>
                📵 Offline — core risk assessment still works. AI analysis needs signal.
              </div>
            )}
          </div>
        )}

        {/* DISCLAIMER */}
        {screen === "disclaimer" && (
          <div className="fu" style={{ padding: "24px 20px 48px" }}>
            <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "#fdecea", border: "1px solid #f5b7b1", borderRadius: 12, padding: 18 }}>
                <div style={{ fontSize: 15, fontWeight: "800", color: accent, marginBottom: 10 }}>⚠ Important Disclaimer</div>
                <div style={{ color: "#7b241c", fontSize: 13, lineHeight: 1.8 }}>{DISCLAIMER}</div>
              </div>
              <div style={{ ...card, fontSize: 13, color: textSub, lineHeight: 1.8 }}>
                <div style={{ color: textMain, fontWeight: "700", marginBottom: 6 }}>How this app works</div>
                Uses built-in regional data on known 1080 zones combined with your GPS. Works offline.
                {isOnline ? " AI analysis and nearest vets will also load." : " Offline mode — AI and vets unavailable."}
              </div>
              <Btn primary onClick={function() { startCheck(null); }}>I Understand — Check My Risk</Btn>
              <Btn onClick={function() { setScreen("home"); }}>Go Back</Btn>
            </div>
          </div>
        )}

        {/* LOADING */}
        {screen === "loading" && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 20 }}>
            <div className="spin" style={{ width: 46, height: 46, border: "3px solid #eee", borderTop: "3px solid " + accent, borderRadius: "50%" }} />
            <div style={{ color: textSub, fontSize: 14 }}>Finding your location...</div>
          </div>
        )}

        {/* RESULT */}
        {screen === "result" && (
          <div className="fu" style={{ padding: "20px 20px 24px" }}>
            <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
              {locError && <div style={{ background: "#fdecea", border: "1px solid #f5b7b1", borderRadius: 12, padding: 14, color: "#922b21", fontSize: 14 }}>⚠ {locError}</div>}
              {assessment && (
                <>
                  {/* Risk card */}
                  <div style={{ background: assessment.color, borderRadius: 14, padding: 20, color: "#fff", position: "relative", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
                    <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }} />
                    <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.8, marginBottom: 4, fontFamily: "monospace" }}>Risk Level</div>
                    <div style={{ fontSize: 46, fontWeight: "900", lineHeight: 1, letterSpacing: "-0.02em" }}>{assessment.risk}</div>
                    <div style={{ fontSize: 14, opacity: 0.92, marginTop: 6 }}>{placeName || assessment.region}</div>
                    {placeName && <div style={{ fontSize: 11, opacity: 0.65, marginTop: 2 }}>{assessment.region}</div>}
                    {petProfile && <div style={{ fontSize: 12, opacity: 0.85, marginTop: 8 }}>Travelling with {petProfile.name} ({petProfile.breed})</div>}
                    <div style={{ marginTop: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, opacity: 0.7, marginBottom: 4 }}>
                        {RISK_ORDER.map(function(r) { return <span key={r}>{r}</span>; })}
                      </div>
                      <div style={{ height: 7, background: "rgba(255,255,255,0.2)", borderRadius: 4, overflow: "hidden" }}>
                        <div className="bar" style={{ "--w": riskPct + "%", height: "100%", background: "#fff", borderRadius: 4, opacity: 0.9, width: 0 }} />
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={saveLocation} style={{ flex: 1, background: bgCard, border: "1px solid " + border, borderRadius: 10, padding: "10px", fontSize: 12, color: textSub, cursor: "pointer", fontFamily: "system-ui" }}>📍 Save Location</button>
                    <button onClick={shareRisk} style={{ flex: 1, background: bgCard, border: "1px solid " + border, borderRadius: 10, padding: "10px", fontSize: 12, color: textSub, cursor: "pointer", fontFamily: "system-ui" }}>📤 Share Risk</button>
                  </div>

                  {/* Location */}
                  {location && (
                    <div style={{ ...card, display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ fontSize: 20 }}>📍</div>
                      <div>
                        <div style={lbl}>Your Location</div>
                        <div style={{ fontSize: 13, fontWeight: "600", color: textMain }}>{placeName || "Detected"}</div>
                        <div style={{ fontSize: 11, color: textLight, fontFamily: "monospace" }}>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</div>
                      </div>
                    </div>
                  )}

                  {/* Seasonal warning */}
                  {seasonalWarning && (
                    <div style={{ background: "#fff3e0", border: "1px solid #ffe0b2", borderRadius: 10, padding: 12, fontSize: 13, color: "#e65100", lineHeight: 1.6 }}>
                      🍂 {seasonalWarning}
                    </div>
                  )}

                  {/* Regional context */}
                  <div style={card}>
                    <div style={lbl}>Regional Risk Context</div>
                    <div style={{ fontSize: 14, color: textSub, lineHeight: 1.8 }}>{assessment.notes}</div>
                  </div>

                  {/* AI */}
                  <div style={{ ...card, borderLeft: "3px solid " + (aiResult ? "#3498db" : border) }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={lbl}>AI Risk Analysis</div>
                      {aiStatus === "online" && aiResult && <span style={{ fontSize: 9, color: "#27ae60", background: "#e8f8ee", padding: "2px 7px", borderRadius: 10, fontWeight: "600" }}>LIVE</span>}
                      {aiStatus === "offline" && <span style={{ fontSize: 9, color: "#e67e22", background: "#fef3e2", padding: "2px 7px", borderRadius: 10, fontWeight: "600" }}>OFFLINE</span>}
                    </div>
                    {aiLoading && <div style={{ display: "flex", alignItems: "center", gap: 10, color: textLight, fontSize: 13 }}><div className="spin" style={{ width: 13, height: 13, border: "2px solid #eee", borderTop: "2px solid #3498db", borderRadius: "50%", flexShrink: 0 }} />Analysing your location...</div>}
                    {!aiLoading && aiResult && <div style={{ fontSize: 14, color: textSub, lineHeight: 1.8 }}>{aiResult}</div>}
                    {!aiLoading && aiStatus === "offline" && <div style={{ fontSize: 13, color: textLight }}>No connection. Built-in risk data above is still accurate.</div>}
                    {!aiLoading && aiStatus === "error" && <div style={{ fontSize: 13, color: textLight }}>Could not load. <button onClick={function() { fetchAI(location.lat, location.lng, assessment); }} style={{ background: "none", border: "none", color: accent, cursor: "pointer", fontFamily: "system-ui", fontSize: 13 }}>Retry</button></div>}
                  </div>

                  {/* Nearest vets */}
                  <div style={card}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <div style={lbl}>Nearest Vets</div>
                      {vetsLoading && <div className="spin" style={{ width: 11, height: 11, border: "2px solid #eee", borderTop: "2px solid " + accent, borderRadius: "50%" }} />}
                    </div>
                    {vetsLoading && <div style={{ fontSize: 13, color: textLight }}>Finding nearest vets...</div>}
                    {!vetsLoading && vets && vets.map(function(v, i) {
                      return (
                        <div key={i} style={{ display: "flex", gap: 12, paddingBottom: i < vets.length - 1 ? 12 : 0, marginBottom: i < vets.length - 1 ? 12 : 0, borderBottom: i < vets.length - 1 ? "1px solid " + border : "none" }}>
                          <div style={{ width: 28, height: 28, background: "#fdecea", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🏥</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: "600", color: textMain }}>{v.name}</div>
                            <div style={{ fontSize: 12, color: textLight, marginTop: 2 }}>{v.address}</div>
                            {v.hours && <div style={{ fontSize: 11, color: textLight, marginTop: 2 }}>{v.hours}</div>}
                            {v.phone && <a href={"tel:" + v.phone} style={{ fontSize: 14, color: accent, fontWeight: "700", textDecoration: "none", marginTop: 4, display: "block" }}>{v.phone}</a>}
                          </div>
                        </div>
                      );
                    })}
                    {!vetsLoading && !vets && <div style={{ fontSize: 13, color: textLight }}>{isOnline ? "Could not load vet info." : "Vet lookup requires internet."}</div>}
                  </div>

                  {/* Recs */}
                  <div style={card}>
                    <div style={lbl}>Safety Recommendations</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                      {assessment.recommendations.map(function(r, i) {
                        return (
                          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                            <div style={{ width: 22, height: 22, background: assessment.color + "18", border: "1px solid " + assessment.color + "40", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: assessment.color, flexShrink: 0, fontWeight: "700" }}>{i + 1}</div>
                            <div style={{ fontSize: 14, color: textSub, lineHeight: 1.7 }}>{r}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notifications */}
                  {(assessment.risk === "HIGH" || assessment.risk === "EXTREME") && notifPerm !== "unsupported" && notifPerm !== "granted" && (
                    <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 12, padding: 14 }}>
                      <div style={{ fontSize: 14, fontWeight: "600", color: "#7a5800", marginBottom: 6 }}>🔔 Enable Risk Alerts</div>
                      <div style={{ fontSize: 13, color: "#9a7200", lineHeight: 1.6, marginBottom: 10 }}>Get notified when entering high or extreme risk zones.</div>
                      <Btn primary small auto onClick={function() { requestNotification(assessment.risk); setNotifPerm("Notification" in window ? Notification.permission : "unsupported"); }}>Enable Alerts</Btn>
                    </div>
                  )}

                  {/* Emergency */}
                  <div style={{ background: "#fdecea", border: "1px solid #f5b7b1", borderRadius: 12, padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ fontSize: 24 }}>🚨</div>
                    <div>
                      <div style={{ fontSize: 11, color: accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: "700" }}>Emergency</div>
                      <div style={{ fontSize: 14, color: "#7b241c", lineHeight: 1.7 }}>
                        Animal Poisons Helpline<br /><a href="tel:1300869738" style={{ color: accent, fontWeight: "800", fontSize: 17, textDecoration: "none" }}>1300 869 738</a>
                      </div>
                    </div>
                  </div>

                  <Btn onClick={function() { setScreen("home"); }}>← Back to Home</Btn>
                </>
              )}
            </div>
          </div>
        )}

        {/* SYMPTOM CHECKER */}
        {screen === "symptom" && (
          <div className="fu" style={{ padding: "24px 20px 48px" }}>
            <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 22, fontWeight: "900", color: accent }}>🚨 Symptom Checker</div>
              <div style={{ ...card, background: "#fdecea", border: "1px solid #f5b7b1" }}>
                <div style={{ fontSize: 14, color: "#922b21", lineHeight: 1.7 }}>If your dog is having seizures or is unresponsive — stop and call <strong>1300 869 738</strong> or drive to a vet immediately. Do not wait.</div>
                <a href="tel:1300869738" style={{ display: "block", marginTop: 10, background: accent, color: "#fff", textAlign: "center", padding: "12px", borderRadius: 10, fontWeight: "700", fontSize: 15, textDecoration: "none" }}>Call 1300 869 738 Now</a>
              </div>

              {symptomStep < SYMPTOM_STEPS.length - 1 && (
                <div style={card}>
                  <div style={{ fontSize: 15, fontWeight: "700", color: textMain, marginBottom: 14, lineHeight: 1.5 }}>
                    Step {symptomStep + 1}: {SYMPTOM_STEPS[symptomStep].q}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {SYMPTOM_STEPS[symptomStep].opts.map(function(opt, i) {
                      var isEmergency = SYMPTOM_STEPS[symptomStep].emergency.includes(i);
                      return (
                        <button key={i} onClick={function() {
                          setSymptomAnswers(function(prev) { return [...prev, opt]; });
                          setSymptomStep(SYMPTOM_STEPS[symptomStep].next[i]);
                        }} style={{ background: isEmergency ? "#fdecea" : bgCard, border: "1.5px solid " + (isEmergency ? "#f5b7b1" : border), borderRadius: 10, padding: "12px 14px", fontSize: 14, color: isEmergency ? "#922b21" : textMain, cursor: "pointer", textAlign: "left", fontFamily: "system-ui", fontWeight: isEmergency ? "600" : "400" }}>
                          {isEmergency ? "⚠️ " : ""}{opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {symptomStep >= SYMPTOM_STEPS.length - 1 && (
                <div style={card}>
                  <div style={{ fontSize: 15, fontWeight: "700", color: textMain, marginBottom: 12 }}>Based on your answers:</div>
                  <div style={{ background: "#fdecea", borderRadius: 10, padding: 14, marginBottom: 12 }}>
                    <div style={{ fontSize: 14, color: "#922b21", lineHeight: 1.8, fontWeight: "600" }}>This is a medical emergency. Get to a vet immediately.</div>
                  </div>
                  <div style={{ fontSize: 14, color: textSub, lineHeight: 1.8, marginBottom: 14 }}>
                    1. Call Animal Poisons Helpline: <strong>1300 869 738</strong><br />
                    2. Drive to the nearest vet — do not wait<br />
                    3. Keep your dog calm and still<br />
                    4. Read the offline first aid guide below while travelling
                  </div>
                  <Btn primary onClick={function() { setScreen("firstaid"); }}>📋 View First Aid Guide</Btn>
                  <Btn mt={8} onClick={function() { setSymptomStep(0); setSymptomAnswers([]); }}>Start Again</Btn>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FIRST AID */}
        {screen === "firstaid" && (
          <div className="fu" style={{ padding: "24px 20px 48px" }}>
            <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 22, fontWeight: "900", color: textMain }}>💊 <span style={{ color: accent }}>1080 First Aid</span></div>
              <div style={{ background: "#fdecea", border: "1px solid #f5b7b1", borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 13, color: "#922b21", fontWeight: "600", lineHeight: 1.6 }}>Works offline. Animal Poisons Helpline: <a href="tel:1300869738" style={{ color: accent }}>1300 869 738</a></div>
              </div>
              {FIRST_AID.map(function(item, i) {
                return (
                  <div key={i} style={card}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ width: 28, height: 28, background: accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "900", fontSize: 13, flexShrink: 0 }}>{item.icon}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: "700", color: textMain, marginBottom: 5 }}>{item.title}</div>
                        <div style={{ fontSize: 13, color: textSub, lineHeight: 1.8 }}>{item.body}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div style={{ ...card, fontSize: 11, color: textLight, lineHeight: 1.7 }}>This guide is for reference only and does not replace veterinary advice. Always contact a vet or the Animal Poisons Helpline immediately.</div>
            </div>
          </div>
        )}

        {/* SAVED LOCATIONS */}
        {screen === "saved" && (
          <div className="fu" style={{ padding: "24px 20px 48px" }}>
            <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 22, fontWeight: "900", color: textMain }}>📍 Saved <span style={{ color: accent }}>Locations</span></div>
              {savedLocations.length === 0 && (
                <div style={{ ...card, fontSize: 14, color: textLight, textAlign: "center", padding: 32 }}>
                  No saved locations yet.<br />Check your location and tap Save.
                </div>
              )}
              {savedLocations.map(function(loc, i) {
                return (
                  <div key={i} style={{ ...card, display: "flex", gap: 12, alignItems: "center" }}>
                    <RiskBadge risk={loc.risk} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: "600", color: textMain }}>{loc.name}</div>
                      <div style={{ fontSize: 11, color: textLight }}>{loc.saved}</div>
                    </div>
                    <button onClick={function() { startCheck(loc); }} style={{ background: accent, border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#fff", cursor: "pointer", fontFamily: "system-ui", fontWeight: "600" }}>Check</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MORE */}
        {screen === "more" && (
          <div className="fu" style={{ padding: "24px 20px 48px" }}>
            <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 22, fontWeight: "900", color: textMain }}>More</div>
              {[
                { icon: "🐶", label: "Pet Profile", sub: petProfile ? petProfile.name : "Add your dog", action: function() { setPetForm(petProfile || { name: "", breed: "", weight: "" }); setScreen("petprofile"); } },
                { icon: "🗺️", label: "Route Risk Checker", sub: "Check risk along your drive", action: function() { setScreen("route"); } },
                { icon: "🏕️", label: "Campsite Ratings", sub: "Known campsite risk levels", action: function() { setScreen("campsites"); } },
                { icon: "ℹ️", label: "About 1080 Baits", sub: "What it is, why it's used", action: function() { setScreen("info"); } },
              ].map(function(item, i) {
                return (
                  <button key={i} onClick={item.action} style={{ ...card, display: "flex", gap: 14, alignItems: "center", cursor: "pointer", textAlign: "left", width: "100%" }}>
                    <div style={{ fontSize: 26 }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: "600", color: textMain }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: textLight, marginTop: 2 }}>{item.sub}</div>
                    </div>
                    <div style={{ color: textLight, fontSize: 18 }}>›</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PET PROFILE */}
        {screen === "petprofile" && (
          <div className="fu" style={{ padding: "24px 20px 48px" }}>
            <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 22, fontWeight: "900", color: textMain }}>🐶 Pet Profile</div>
              <div style={card}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Dog's Name", key: "name", placeholder: "e.g. Buddy" },
                    { label: "Breed", key: "breed", placeholder: "e.g. Labrador" },
                    { label: "Weight (kg)", key: "weight", placeholder: "e.g. 25", type: "number" },
                  ].map(function(field) {
                    return (
                      <div key={field.key}>
                        <div style={{ ...lbl, marginBottom: 6 }}>{field.label}</div>
                        <input
                          type={field.type || "text"}
                          placeholder={field.placeholder}
                          value={petForm[field.key]}
                          onChange={function(e) { setPetForm(function(prev) { var next = Object.assign({}, prev); next[field.key] = e.target.value; return next; }); }}
                          style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1.5px solid " + border, fontSize: 14, color: textMain, background: bg, outline: "none" }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              <Btn primary onClick={savePetProfile}>Save Profile</Btn>
              <Btn onClick={function() { setScreen("home"); }}>Cancel</Btn>
            </div>
          </div>
        )}

        {/* ROUTE RISK */}
        {screen === "route" && (
          <div className="fu" style={{ padding: "24px 20px 48px" }}>
            <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 22, fontWeight: "900", color: textMain }}>🗺️ Route <span style={{ color: accent }}>Risk Checker</span></div>
              <div style={{ ...card, fontSize: 12, color: textLight, lineHeight: 1.6 }}>Works offline. Enter major Australian town names — e.g. Perth, Broome, Darwin, Alice Springs, Cairns.</div>
              <div style={card}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={lbl}>Starting Point</div>
                    <input value={routeStart} onChange={function(e) { setRouteStart(e.target.value); }} placeholder="e.g. Perth" style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1.5px solid " + border, fontSize: 14, color: textMain, background: bg, outline: "none" }} />
                  </div>
                  <div>
                    <div style={lbl}>Destination</div>
                    <input value={routeEnd} onChange={function(e) { setRouteEnd(e.target.value); }} placeholder="e.g. Broome" style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1.5px solid " + border, fontSize: 14, color: textMain, background: bg, outline: "none" }} />
                  </div>
                  <Btn primary onClick={checkRouteRisk}>Check Route Risk</Btn>
                </div>
              </div>

              {routeLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: textLight, fontSize: 13, padding: 16 }}>
                  <div className="spin" style={{ width: 16, height: 16, border: "2px solid #eee", borderTop: "2px solid " + accent, borderRadius: "50%" }} />
                  Analysing route...
                </div>
              )}

              {routeResult && (
                <>
                  <div style={{ background: riskColor(routeResult.overall), borderRadius: 12, padding: 16, color: "#fff" }}>
                    <div style={{ fontSize: 10, opacity: 0.8, letterSpacing: "0.15em", marginBottom: 4, fontFamily: "monospace" }}>OVERALL ROUTE RISK</div>
                    <div style={{ fontSize: 36, fontWeight: "900", lineHeight: 1 }}>{routeResult.overall}</div>
                    <div style={{ fontSize: 13, opacity: 0.9, marginTop: 8, lineHeight: 1.6 }}>{routeResult.summary}</div>
                  </div>

                  {routeResult.mapUrl && (
                    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid " + border, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                      <div style={{ background: textMain, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: "#fff", fontWeight: "600" }}>🗺️ Route Map</span>
                        <span style={{ fontSize: 10, color: "#aaa" }}>via OpenStreetMap</span>
                      </div>
                      <iframe
                        src={routeResult.mapUrl}
                        width="100%"
                        height="240"
                        style={{ border: "none", display: "block" }}
                        title="Route Map"
                      />
                      <div style={{ padding: "8px 14px", background: "#f9f9f9", display: "flex", gap: 16, fontSize: 11, color: textLight }}>
                        <span>📍 Start: {routeStart}</span>
                        <span>🏁 End: {routeEnd}</span>
                      </div>
                    </div>
                  )}

                  {routeResult.segments && routeResult.segments.length > 0 && (
                    <div style={card}>
                      <div style={lbl}>Risk Zones Along Route</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
                        {routeResult.segments.map(function(seg, i) {
                          return (
                            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", paddingBottom: i < routeResult.segments.length - 1 ? 12 : 0, borderBottom: i < routeResult.segments.length - 1 ? "1px solid " + border : "none" }}>
                              <RiskBadge risk={seg.risk} />
                              <div>
                                <div style={{ fontSize: 14, fontWeight: "600", color: textMain, marginBottom: 3 }}>{seg.name}</div>
                                <div style={{ fontSize: 12, color: textSub, lineHeight: 1.6 }}>{seg.note}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {routeResult.overall === "UNKNOWN" && (
                    <div style={{ ...card, background: "#fff8e1", border: "1px solid #ffe082" }}>
                      <div style={{ fontSize: 13, color: "#7a5800", lineHeight: 1.7 }}>
                        Try these town names: Perth, Broome, Darwin, Alice Springs, Cairns, Townsville, Brisbane, Sydney, Melbourne, Adelaide, Hobart, Kalgoorlie, Port Hedland, Karratha, Newman, Katherine, Mount Isa, Longreach, Dubbo, Broken Hill.
                      </div>
                    </div>
                  )}
                </>
              )}
              <Btn onClick={function() { setScreen("home"); }}>← Back</Btn>
            </div>
          </div>
        )}

        {/* CAMPSITES */}
        {screen === "campsites" && (
          <div className="fu" style={{ padding: "24px 20px 48px" }}>
            <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 22, fontWeight: "900", color: textMain }}>🏕️ Campsite <span style={{ color: accent }}>Safety Ratings</span></div>
              <div style={{ fontSize: 13, color: textSub, lineHeight: 1.6 }}>Known risk levels for popular Australian camping areas. Always verify with local authorities before arrival.</div>
              {CAMPSITE_RATINGS.map(function(c, i) {
                return (
                  <div key={i} style={card}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: "700", color: textMain }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: textLight }}>{c.state}</div>
                      </div>
                      <RiskBadge risk={c.risk} />
                    </div>
                    <div style={{ fontSize: 13, color: textSub, lineHeight: 1.7 }}>{c.notes}</div>
                  </div>
                );
              })}
              <Btn onClick={function() { setScreen("home"); }}>← Back</Btn>
            </div>
          </div>
        )}

        {/* INFO */}
        {screen === "info" && (
          <div className="fu" style={{ padding: "24px 20px 48px" }}>
            <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 22, fontWeight: "900", color: textMain }}>About <span style={{ color: accent }}>1080 Baits</span></div>
              {[
                { icon: "☠️", title: "What is 1080?", body: "Sodium fluoroacetate (1080) is a naturally occurring toxin used across Australia as a pesticide to control introduced pests including foxes, wild dogs, feral pigs, and rabbits. It is colourless, odourless, and tasteless." },
                { icon: "🐕", title: "Why is it dangerous to dogs?", body: "Dogs are extremely sensitive to 1080. Even a tiny amount can be fatal. There is no antidote. Symptoms include vomiting, anxiety, tremors, and seizures within 30 minutes to 6 hours of ingestion." },
                { icon: "🗺️", title: "Where is it used?", body: "Western Australia uses 1080 most extensively. It is also widely used in QLD, NSW, SA, VIC, NT and TAS. Baiting occurs on private farmland, national parks and pastoral leases — often without visible signage." },
                { icon: "📋", title: "Legal requirements", body: "Landholders must erect warning signs, but signs can be damaged or placed only at main access points. Remote properties may have baiting programs across thousands of hectares." },
                { icon: "🔬", title: "Types of baits", body: "Common baits include Doggone meat baits, Foxoff baits, Pigout for pigs, and Pindone rabbit baits. They may be buried, in bait stations, or aerially dropped in remote areas." },
                { icon: "📞", title: "If your pet is affected", body: "Call 1300 869 738 immediately. Get to a vet fast. There is no antidote but early supportive care can improve survival chances significantly." },
              ].map(function(item, i) {
                return (
                  <div key={i} style={card}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ fontSize: 20 }}>{item.icon}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: "700", color: textMain, marginBottom: 5 }}>{item.title}</div>
                        <div style={{ fontSize: 13, color: textSub, lineHeight: 1.8 }}>{item.body}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div style={{ ...card, fontSize: 11, color: textLight }}>Data sources: DPIRD WA, DAF QLD, DPIE NSW, DEECA VIC, PIRSA SA, DPIF NT, DPIPWE TAS, Parks Australia, APVMA, Invasive Animals CRC.</div>
              <Btn onClick={function() { setScreen("home"); }}>← Back</Btn>
            </div>
          </div>
        )}

      </div>

      {/* BOTTOM NAV — show on main screens */}
      {["home","symptom","firstaid","saved","more"].includes(screen) && <NavBar />}
    </div>
  );
}
