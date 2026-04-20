import { useState, useEffect } from "react";
import { RISK_REGIONS, LOW_RISK_ZONES, FIRST_AID } from "./data/riskData.js";
import { CAMPSITE_RATINGS } from "./data/campsiteData.js";
import { SNAKE_REGIONS, SNAKE_SPECIES } from "./data/snakeData.js";
import { HAZARDS } from "./data/hazardData.js";

const DISCLAIMER = "This app provides general risk guidance only. It is based on publicly available information about 1080 baiting programs in Australia. It does NOT provide real-time baiting data. Always check with local councils and national parks. Emergency: Animal Poisons Helpline 1300 869 738.";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const HIGH_RISK_MONTHS = [2,3,4,8,9,10]; // Mar,Apr,May,Sep,Oct,Nov (0-indexed)

const RISK_ORDER = ["LOW", "LOW-MODERATE", "MODERATE", "HIGH", "EXTREME"];

const SNAKE_FIRST_AID = [
  { icon: "1", title: "Stay calm and move away", body: "Remove your dog from the snake's vicinity immediately. Do not attempt to kill or capture the snake. Note the colour and pattern if safe to do so — this helps the vet." },
  { icon: "2", title: "Keep your dog still", body: "Carry your dog if possible — do not let them walk. Movement speeds up venom absorption through the lymphatic system. Keep them as calm and still as possible." },
  { icon: "3", title: "Call a vet immediately", body: "Phone ahead to the nearest vet so they can prepare antivenom. Time is critical — some dogs can deteriorate within 30 minutes of a bite from eastern browns or taipans." },
  { icon: "4", title: "Do NOT apply a tourniquet", body: "Never apply a tourniquet, cut the bite, or try to suck out venom. These old methods cause additional injury and do not help. Pressure bandaging is for humans, not dogs." },
  { icon: "5", title: "Watch for these symptoms", body: "Sudden weakness or collapse, then apparent recovery (false recovery is common). Vomiting, trembling, dilated pupils, loss of bladder control, paralysis, blood in urine." },
  { icon: "6", title: "Antivenom is the only treatment", body: "Only antivenom administered by a vet can neutralise the venom. Most dogs survive with prompt treatment. The further from a vet you are, the faster you need to move." },
  { icon: "7", title: "After treatment", body: "Dogs need 24-48 hours monitoring after antivenom. Restrict exercise for several days. Follow up with your vet the next day even if your dog seems recovered." },
];


const SYMPTOM_STEPS_1080 = [
  {
    q: "Is your dog showing any of these RIGHT NOW?",
    opts: ["Seizures or convulsions", "Collapsed or unresponsive", "Cannot stand or severe trembling", "Vomiting repeatedly", "None of these yet"],
    emergency: [0,1,2,3],
    urgent: [3],
    next: [99,99,99,1,1]
  },
  {
    q: "How long ago did your dog possibly eat something or enter a baited area?",
    opts: ["Less than 30 minutes ago", "30 minutes to 2 hours ago", "2 to 6 hours ago", "More than 6 hours ago", "Not sure"],
    emergency: [],
    urgent: [0,1,2],
    next: [2,2,2,2,2]
  },
  {
    q: "What did your dog eat or come into contact with?",
    opts: ["Found a meat bait or sausage on ground", "Ate a dead or dying animal (carcass)", "Chewed or licked something unknown", "Was in baited area off lead", "Not sure what they ate"],
    emergency: [],
    urgent: [0,1],
    next: [3,3,3,3,3]
  },
  {
    q: "How big is your dog?",
    opts: ["Small — under 10kg (e.g. Maltese, Chihuahua)", "Medium — 10-25kg (e.g. Kelpie, Staffy)", "Large — 25-40kg (e.g. Labrador, Shepherd)", "Very large — over 40kg (e.g. Mastiff, Great Dane)"],
    emergency: [],
    urgent: [0,1],
    next: [4,4,4,4]
  },
  {
    q: "Is your dog showing ANY of these early signs?",
    opts: ["Restless or anxious behaviour", "Drooling or foaming at mouth", "Wobbly or uncoordinated walking", "Whining or crying", "Seems completely normal so far"],
    emergency: [],
    urgent: [0,1,2,3],
    next: [99,99,99,99,5]
  },
  {
    q: "How far are you from the nearest vet?",
    opts: ["Less than 30 minutes away", "30 minutes to 1 hour away", "1 to 2 hours away", "More than 2 hours away — very remote"],
    emergency: [],
    urgent: [2,3],
    next: [99,99,99,99]
  }
];

const SYMPTOM_STEPS_SNAKE = [
  {
    q: "Is your dog showing any of these RIGHT NOW?",
    opts: ["Collapsed or paralysed", "Cannot breathe properly", "Seizures or severe trembling", "Vomiting and wobbly", "None of these yet"],
    emergency: [0,1,2,3],
    urgent: [],
    next: [99,99,99,99,1]
  },
  {
    q: "Did you see or suspect a snake bite?",
    opts: ["Yes — I saw the snake bite my dog", "Yes — I found my dog near a snake", "Not sure — dog was in long grass or bush", "Dog suddenly became unwell outdoors"],
    emergency: [],
    urgent: [0,1],
    next: [2,2,2,2]
  },
  {
    q: "How long ago did this happen?",
    opts: ["Less than 30 minutes ago", "30 minutes to 1 hour ago", "1 to 3 hours ago", "More than 3 hours ago"],
    emergency: [],
    urgent: [0,1,2,3],
    next: [3,3,3,3]
  },
  {
    q: "What state are you in? (affects likely snake species)",
    opts: ["QLD or NSW — possible Eastern Brown or Taipan", "VIC or TAS — possible Tiger Snake or Copperhead", "WA — possible Dugite or King Brown", "NT or SA — possible King Brown or Desert species"],
    emergency: [],
    urgent: [0,2,3],
    next: [4,4,4,4]
  },
  {
    q: "Is your dog showing any of these warning signs?",
    opts: ["Sudden weakness then seems to recover (false recovery)", "Dilated or glazed eyes", "Drooling or vomiting", "Shaking or trembling", "Seems completely normal so far"],
    emergency: [],
    urgent: [0,1,2,3],
    next: [99,99,99,99,5]
  },
  {
    q: "How far are you from the nearest vet?",
    opts: ["Under 30 minutes away", "30 mins to 1 hour away", "1 to 2 hours away", "More than 2 hours — very remote"],
    emergency: [],
    urgent: [2,3],
    next: [99,99,99,99]
  }
];

const BAIT_REPORTS_KEY = "baitReports";

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
    new Notification("Safe Pets Australia", { body: risk + " risk zone detected. Keep your dog on a lead and stay alert." });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function(p) {
      if (p === "granted") new Notification("Safe Pets Australia", { body: risk + " risk zone. Keep your dog on a lead." });
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
    <img
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAIAAAAiOjnJAABj8UlEQVR42s29ebwlWVUmur4dcYY7D5k356yqrKy5oIpBQGlE7KfiQ1sRR3DgqbSNitJP5Ec7T9gOP/S1PpWmW/H5tEVBaQFRRGxEBFGpoua5sjKzKsd7887TOSdir/dHROx5x4lzs+D38ldi5r1niNix9xq+9a1vgZmp+MPExACI9A9A1T+ZiYiJzBc0+cNM+h1MxEzC+ATJBCLnM5mJQMTWz5nJ/+ry4vVlxi/DuTWC98MmbwxfwIhrMvrC1b6MQChuyLik4geNLyx8m0wEMj7auLBq4WN/wFKWH0GkHzkzsf3PYvmMXUhA8XDUR7lfI8tfMYpvKv+O0DZiYpjf2GhBjeUr1zf+esnlBVdXZa17cb+wb61a8eKHqL+22AXU7zzzt8EztoeNaD4jYTwyc7f431J8u/XQC8tCenuMcnnCeI+z5cy/o/xE9RfjKgkoDYx6QmTdDoolBxEQuCWgeA2PtqSo/geBC65/H4irtXJv0PwcZrUwgPMGCt1F/BVc8y5EFn3UPzC+yP1M434RvLxy8euvhcOmLvhzcC4tW+WYR6rMUsgNaT8EvaXCywf7bJlWofCPaHasG7oJw+IyMzw7ZNgtz8z4toerb/SXwjTtHNkY5tubGmPjxUUMYlqj4L1Le+eYxth1EQ02sPUaJhmxWKwuyXVZaZ2b1J+CwIIWntb8IZqfVO9wDI111Ds4tDSmyy8MDdi+Cw68MnyAEfgCeA8saKi8B18t0yguTnl2fYUwrXuNwaKIQ4j6ouACKvNXBF5c3aO/q4jD38sMZh45rOPa67NdSaN4P3YQzcNK8QzAsRySw3ZIH/phxmNYZFpnJmn0SPHq46qrTRQiTkPZWue3Q5+sjG2s6JNmfQzLs83uUePqHJsxaWhTV0/aMBNDIw2uNY0g9wNR+ySCXo8cT+S8hSIReu1mbbIDAj7LeArOOte7UXWtDS2CBwhUz8K6rzKoAIbfjmQR38KRE8nkph6sTWf05jn2d9bmdEh47Lw47lth73hmfR7YvkgOfE6dBS8iVfOTzUczauQ+5FXuhbDzXJiDD4iLJTJCXmU7OPxcvc3GaqlBwZzEPZyBe7AtVr0xL8JDATeY9TNSGbGrtEcwLOrgnmXoKHDKozhW0CM/i3+K+6URfWXQlsSADNNpMEejtLq43n246u1itHwWwYwPzXCOChDaczb9ed1VQd9RcwZAwdM8NGYdCT3w8Z3hgX8sG+G9W1PXbTb4k44QtFZwNZmWVZ8qI8aynDQFYim1+maizkaMoNBUFZLvLUrlIn2FAh3KMCEYqwJExJKBBtE97PStOv0oLVldqMhcQGlVCIMGW0S5i72H8H6qi+ZZecyDsYL9ATMOE3acGDGY1Z4oXwQPS4V3lEHhpD204AxWBgMqLYCVaEeyMB56gosPRAFFiuKfPOTMw77xISGJ/5CGWAIL221o4Wr2Oj7vljxswkHlehrbpsJ22CjpwMA5hV/rgAXTDS1FBRMNHeJXeylWRLKqCpE1Za478Qq/RQQX4WFmKWgkItc5OjahDRe+sDvjqmLQZpaRmdPSMqAWmGkCISozWH0gbB+hnqUq4QQSHK/gCY5fG4XKjvo8AexVl0xjAhoCl4ezNM8cDV3uoKuqoGoMAQ7482iQgpFPEKMairexVckAIIaARgXuqtLO4Wiq/Uys9Nj7lf8aRD0HO45vhETJ8ME+YoLQQWIOxOBlmsLeW9hK0muMXxME3AcnP48WiAP7rKawUe/e2YEbchmo8xNZpTGz+E8RtNP8YYxBYL7GzO0llygGak0m4MD6VrYc+EaKnvi6X+mdAkTqAUNNVJl8VNen1lBcBcjuwLZX82lmIdiBG9hbZ0WeQW3qYF+SiOGEoQ1Um53VFw0DmTNbAe/Qp1UDN6DmbNWABYgiwzoexciWRh2AKhR4dqzOcH7FqGgGwimICH2RSUvhBli6ZbEaFb3Z8M3RqFlnnsGafBCGZX0kdcDuZAkqJpCsmQuADy5Er3ykZ1wLG8aA0/DPqwsur5DpqqhXTSwW7wn2C73LX+SIr7DsnBjhIHIZMA9ZEZ15og5l8TAkdfUwATCE4iGf0xLaVUwODxF7NBUhbxirQgFxI8dc/hoNcOKrBVp5TygoNzLQCKFI9jcKvWd0Qc3Dh5iLCoMBMqFh5qnNWxERG6hYeZSZnVTVOBBccWBQxW1sBsIlKMWeuS6tsQ7GdYgdRL+cemLo0VpvRAGycrkykhXRNIy8qxiLFXjD4Yi+SXYiI5uOSa+wCl45Wh+0Fr/OosNagaCddgywgIljxYkrnpHU//LJAk7MpP9iWA//txqdMAyvSWk3YQvyqHagYXBqyIk0IQzWPGbzLqgZf6G6l2p/7bGc4CdPLqRnfldlKF1QsHT0xlKM5EDZCF+8GxE8xBea+blxmmIwT3E+OEyFBWmjwmqn21vFsjqFGwLZTLmQHWYihmf/IpZAYAQfwTQcf69JBcLoeQFYY2TXFLQZKm4L4j6oNlUJSnOoyGDwoEZxm4hnVBU1meyUktWeMqyLGb5YgXmojQIhnlOMX8vRzF+9UpOBRsIhKd4IFGGbBWJv3yAF75o9VGyoqRtqlkwn4EO1GJ5MDF+KYJnESNS4SqnchKm4tlDVlXXwDvtKdShVVeyc8MUAuANrJBBqzUAtljDkyIKHpjMY4bOBiMECIuBfOELwrXsTXLGJYYAJ7rCH+MIrKDf40JFS0eoCYLtI69FH3wqwlH6K7poH3jNlRTv4q8r8myOTpLhpVWg4Coron/sGNcUGNnjPC8j2XQS+SDM2mndZWmBKDLK24QPdTNjMgYjgCQLZcVVDfMs5t2y1dDmx+2j5r8M8rgmkYNI0YC1igwTeP/fYW9avIwoeNeP3PgccLXiUcauZrBIafGFJNIULa6sI2A2eKpikotjC5OGFN5aTpOtdjwaVQQ8sYWM3FX9X6JTeEAzfWcSo92W42syeO8EkFJerdqG5wRbZC9ZlFMKuDnxH8Hp89wS7k6X28dXHJkCc7+TUdk0GnvGFqRM0MDkZaFUookDibaZ4MFvrgvzmYJkIhgU2gAmVxTKGdbhbtgE20uE4DoST8yjR1o6a/T6LUa3faB4QtT1qwzysX64YIeSN4zDOirGFF/muUDdKwAWXYYEOPGQNNVXGPzGxBBteRV2nyh6SHszAncA5WDrESA6OOeA9+Vkt1g1D2ojrLDRXz4N5mKHlMP1piD3jRpAec2wlLc47q768YWUH1wk65ALsIQGxeko4nJwZabN5k5Ib1LBNiiKGVA5QEk5towtGsx7iq/+DeCeMkzM2WOTAZceYdhw5iFFiHgLVC3djwcMcEH22oFouQ+MWADbWkRULynMidtUvtOFDVSYmr62JDWMeZCPV3AIaObcmZq2+4YKDF2OGbfa6D23fQNDPDQF0PWs94i2n7oEIel+AQGZpwErsYbeq+ooMbBeF2DhJ+u3aPQFs4VLK3uo0gN0wLeQs4IssOGh19fOqI6C2maIhrmuRucylQEP5EihVHM/qw4FqJTfY7l7zrU+wq/ayAsP9Al4Ay2NPScQIQ1PipiALLJ2rANBjfY6J45soH6wNYTHpYBsxjioswAsH0ODqnUABkVg2WqaAR9QBookpIxrwPlv5YaGc0dCGuoG81//C5YFG8FmXdXPrIIHrPLjHIA0Gkgh1I+2JvsgF6SB40BWpMcSTbFSyoMAbG734KgXKnqUPHw4j12hoyUifldFYq5xm01sIlnoiH+7jWHu6awyDdCMOHG7ARB62Z/9KGOwubhy4AMOusAFSFWoeDwkcjBbhjGCdmkjHDP8qNiNjKHLR0BKZCiuZgkhVSaOJUBdE4XRrAkDtwGRFIWIT7QylwVFYwUg6gplO/SPHCLBRSRMJs6OIg+0Ssf0XvFk/xmZPG4FrEUsefUMW2J7J4zVP4FBCJRp/vUM+s2pkZuTlKenJknaGRuvrqLjEDjd73RNRYxDuOvKCTdKdCKOi4c8msDSKclrzsuCzJkJkL9GzUpllffzhq9U1YLOJ4ZGKo+ISCt/rSEtNj2NQL7Ugshg1naurvA0FBuuuFnu+taY5+tXpPsQcXMR3D7WXwbuGFQXVXPAwi1VDchJ7oieQWyevswrB1GGo6tWeA+Q6BtUev2LkYN9/Y7Ov1oqYIqi79ywRTCKPodL+Y0NtZsgpMXZek7ikAaCMmDQP9mgEOBjnNTqXTnm/hhC5V40cXzYtkOjU2xmMYChRBwGEM4Mab8MRI8cGkhghRwozMtXdAUbgVu5EZo1h1vujhnxfB7eMSBOzgBv2wrXA5hVWSQCijq++mgE7DH9WNInqRdk4snVQC6eGRLaHFjz08/U5stIWalOdL47CqmTr78VWkYrJoZddBI5G6PqYPNW8qw4yQjsRTh89mJvyLYMagiLS4T0kexq93DkEN8DVLtcwC9qUdIEIuRcuhARf7ke1CxR/MeIwONp/Wsao5osVzKofnhEMSWani0g21OWJWH0XKIIblnJ8Ec2eGZ/OO2J0z8Mrtb49GHaKpL0+wN6jQzdT9oJgD90ARxVKSuBasl5eU7Mj+BUhPpIJkKriEceNv60KaR/u6MiGqBuCleShxtMzBWgU7DQRBBjp3gMbgglasI0OV5gi6iCxcComhg8DbRJoFi3waBaa4rCWcmpx9Kekc4B8U13KrjIPj3oCndBmZ2nw/TG41mngMZurgjGjnY8ADQqzOvwKRCRoCC8BdQ8sGLYDCI7SeDac44jRwlUjJlw7XQfxMJ8jVDxm7S59CicTpJQ+K55ZCVMhjGQ+W/LiJhiHOMy4924OdS+w2Krmrzm6O2vBAtv67k17DY2hkFGxj70+Jr9LIjK/aYj4XooQnm7oKbLP+bqaXeUyIGJP7lnaVd6p8h9JIM50wYKo2eG976pGdusqsQ88K8Y0rH0CW4zHVwVlyeHQj4LTv2jkJsmadd8D6mi+xX+7f9lqApajwlM5dlMGodDUtIbDDHUvzGz0ahRv91rdrwoJa7Sk/vHfKzBrgNWVXa6yWvMzo2as+mHaVMCJ4wpVw6HwSHPeVen4NLg8J20pX1NermQWQGJfg2xCFGUikGQGILyXSgrYROJnmy3vKIoFBMYaT6kZtsgwbT/bvc3xj41M/1IelIeFdQJk2Dyu+HtwVGXMne5MC4MxRaOJ1mWw0ap4nxgeDzEziCUgCBuDwccuX3pga6uXy2u73VcsLNw4OUlEspjYIUJjBJmJSYIFBBF9bmXl0ysr53u9SZG8eG72y/bvT4UotqwX8eCq/GZs8U1r7esnst36JkI6A84bfQ/GxMLYScFDIsBmY4VWm/Gi+sCcnPCOtlkJ7LWVwm4Nq5+csxd5tJrJq2TL3ygVUhYQH7lw8ddPnTq1vSUlFztustv+2v0Lb73xhtlOR3IurOBLPzDJLIR4anPzV5988h+WrmxnmSjY0hAvmJn5uVtuvm1mWhIJfxLOF4aUERwHRA20Hv2nwDazJagsxEb4YZiSqhQYoybW6NYHt4IZjenBUYrEvScF7D3kPqzHg8KW65FEAvizc+d/7NGHOyw6AEsmARBy4vU8u2Nq5jefe9s1ExOScwFYHXJEOXMixL8sL/+fDz50udefFALF20HMtJXLuU77XXc8987ZGdPsFanWF0h5OzjKq4Z6GjuZZlFZhpU/tJh/oIO8LAzFhFyNFomGMTgbomoIURh8iN+Zq+vAHDVDjodOialAyuIjJbOAuGtl+fV33yOAlCi3Y+0UYi3Lb5sc//0XPH+u02aWAolaRClZJOKeleU33HP/NssxQmYIhjNTS4j1PL9xrPueF33RVKtNzBDN5neOmsfUyDQwR1u/m2tb+gcehuHnSKXE9I0VEhgpFDSpiMR4nkO6uJ1P4LphWjxKaYad8aBKQo8Bypl/6+zZXSlTQlasqXH9A+aZNLl/c/Ptjz4OU4KifDtW+/2ffPzxDZl3gYEL9tKA5XSSPLi9/Z7z54Go8l5wDc0SAje0TF493tM8VtDoiNQRr/9s1BlIwoKeOYBo6eJAxehlNorh9RN7qaqOKVNU1DQC3fcwMzuYJDJAV0KYrXKbU9nQumRl4d14WiyZQeLe1dV/XlqeFCJnKYSw4z4C8UDms2n6gYsXP3rxokCSs1SiIhB451OnH1hbnwRyyYlwyxEgylmOi+T95y9sDfqJEEx5mVyw7vNhkxrglxAkw9+R0rgjPYaNdVGrJDVx0/Nf83O/kZ257F9Wvb7wydCxhtWCGI+60kFV4/CIALWmjWMVhvDZAVNoLLkWMI5QSpRaKRmC2IBhwkFEn1hc7EkpILzxN1bqnibi3efO5zIXAJe8RvHU1tb7L12eTdJcvVnvbC1j0RXi6e2dB9Y2CCQZ5LaXAVQdMDdOqLEAxRO1ZtcoxT62ZpMadyL2VOSOVKnNx8n+03SaYMy4Bw7iMkQl0fgGRfQJ7ScAjvJ2pEvHyDLqnEhISk+puFqnDWqjMqNQxbxna6fInU09KbKCOCGJxkT6wNr6vWvrIFHl0firxcuLu9uiqtMWpsIRXS1y7B2W921tRVc9WHhV9iayG3wxI602XOwtdgaUhnhzQeViHr7VDAEYNruLta2y71J4MjIG00EgPs4Uw8bCGu3LjednFBpIqHmlowZW6Wewz8dXlI0yjiQI7Ob55UGvJSBL7W7D3NiyoIJ4W/JHFheL7xFAJuUnl5Y7QjDM5XZkryFQZpJnyo0F4uI/Cpx0tvvCa60LgiLkTkALT4XfcSnBVqiwloKt71KppIA8Oo3T/8JMzML7GgMsaA4Bh7VJOLwKtbJMcASx2Q6n4BSxXECMOSLXSUSEPvGudHsDFdxmfptk2RF098pqlucCAOHp7a3H1ze6ItFtn5ZRN3SbQUS0xnmx5IreVZpVNy9m4qF1yeHxNeso2+tcRTPZ3/ABRnWBrO/UUcqAq8jPZcOq/8VA00JEYTSqCEBtI5jDMslQsQoBu9a3mx8lwlUkn0JtEze4+kzDAGsbx0WCrYg4oIAcEAgtiPM7u1d6veKRP7q+sZHnSZG+oUpldLTDphlSlW12OjrBegvrpJJ1AFDHijMCeY9YqygJqGm5C4WUtgPl4ItLYy6gN24Aj1BxPQAIBgLxGEbgDMF8C3METQgYEY4ZetRmwz6DFKChMi8gIk4JqRDaA9lZsPNEBGiL5FJWViYuDjLZsKbKRETtRASuH0QRJRfmoXTE6lBRjSh/5EeohYcQmi1h4heh6DpwA8ZHCRRgiw8BOHi69DJkFa0DtttSmxfewPoy1inMIYqBDq4MFdlcZzfwZNN7+WojVZjGopKzMiiyY4mYTxNJIK4UJBCuFDNRAmRMGzIvfnI5qzaWDlPUhFSYvFOAJPGJsXHbgRQrDEMgtgQRygl/zCRjesy2/4+GYHb+pD7QdPbN3WsIdNDDmh23Lmxoifeg3cB2HxiGpKmx0Kt6HAHlJ1hkZbdeaaburCkF5T9zYll9oGSWyvcR5UQC4oZON5MSdh5W43P6ea6wU1P6nCOPpPhVSrip3bXjYJbMeZk1UM6UV4Gu4yXATURxhxTZrIADjR0QQgACcwBngG3WSol8PbhZUBP2LaouDpjWvgItpTuIkHXzUIhC6Jg6dRSYLU0FhITt7OQd1VMovhSERAghCpyo+LvgUk2gtEgvnJ0pYQkEy9Yqli5qHdSqrGnX1xgmU3tQr34maa7dvnVqUr2q2ODlJYHAlAgkRYIJkwBizKOrVH2ZmaUDCxv2mcn0JFwVg6HgaDjGxkMorSMNG7C0gmCwHYJDD71QQg4qPk5jtQK3ymt8Rrg30mxFDGKmujLtifJBN2uU/18M68OxtAVLxkGWyw9fuPDJtdWlfn8cuGly8lUHD9w0NU3EUpYVsZfumzs81l3rDZLgOHQ94xxE3AamRLlEMyIhqbAL30CUP0uAzTx//sTU0fFxZhYESSQSQUR3XVn++JUrj+/u9LPsSGfslQcWXr6w305k9dRJZc4rtW325xeZxXU7hGdy5iYDVroARFfV1AtmMubNRJXdofIP45dptOoc3Gf+T+Bh43atyrp5T+DLXZFqcF2kSwkVI1vrORR3LATO7+y85cEH/3VtTXAJF35k6cq7zz39usNHf/j668fTVLKUxIfHxl++f9+fPn1uJmlVMUiIYMucA1NCHGynxc+PddrCCGZi9UsBwZx97YEDQohcSmJKEnFue/tXHn/8b6+sDGSeEBFTTivvuXj+Ww4d/rlbbm4nCYeoe04IEBXujP+GHRHAsIKyU8ZAAGIPXoDhKeHpGAorUpMcbalWXyq8tnRzNoZwpeIgbPSsCNu51u0GupDLUBEG7gciSJKSCFjr9b//3vv+eWV1NkmnEjGRiMk0mUsSkeN3njrz3Xd97sL2toCQkonoGw8e6iQpoQjCwvVzCNGX8vrxifl2u3jXrdNT8512pj0S7MNYpEDYybKbZia/6tBBlsxMSSI+s7T02rvu+qvFxTHQTJJOJMlEksykyaxI/8e5cz/3yCPQoyDLFAocdFgcRpvYRiv8Fyhno1K0mtl6cN4bavq1F8CqUFUuW7BV/QiBn4FAaeSAMsRZsDTmAqeHbalt54WlfEA5r+Bdp0/fvbY2n7QGucyYJbFkyiQT88F2+7Pra//hnnuv7O4mEHkuv2h29usPLKxmeRLnhwkSfSlfPD+TJIlkYsnXTEw8d3pqR+Zlbger9KfCpG2Zv+HI0elWK2OZJuKetdUfeuThxf5gJmnlkjMpc2ZJlDPlLA+0Wu89f/HvL18WQM5cV03lZvM1Yk2s7rswhMWiMgBHDh2hGiKCgnnWbEtPeBgG4GTasz0R1rQkqShT1rCAm4DFquBSRIUNT83FKEmwEGKxt/uBy5dm0zRjCZCogsrCvPWlnEtb929u/eTDDxe1PSZ6640nb5ma3GFqQeSySNX0pDuA+jKf7yRfd+BgsUYFw/2bDx2WEKlIyp1bcecL65kCVwb9V+3f//VHjmRSpklysdf74fsf3OwPxoXIWAIQoqDJV2UXkSQifd+5c2VyYbCsAjwVBDT1ahgDDmQAMoDoemK/UzuOCUxyFdHr88+F6WIO6GOBPYnu8vlij2z8pjluDb4hiu4Xu3xTRVz/urp2qddrIVF5Ndt3MGDe10o/srz8x+eeSYTION/X6f7arbfOp+lWnrerRBKlrYIAbQyy7zt2/JrJSSnLzSqZv+Lgga/cN7+cDVpCKAZfcSRTYCkbvGh65hdvvxWiPBPvOPXk+d7upEgyZjvKhiq0dJPk7o3N89vbmgmNSuoSvm2gUEt6mYsxwMIT7asytUZT2EHh6D6KFYSlw0BFrdBNimAktzqhRRD1kRGxBlVykWwVIpw9J+KTLMjmmWhKDTljdh/f2sxzaQWT9s4C0UDyBInfPX12pbfbEknGfNvM9Luff8cNk5MreT6QxfcIAnaZr/QH33P8+Buuu15Khu5K5BT09ltu/uL9+5ZkzhCFWWVKtiUvyfyrF/a/687nzbY7WS4TgX9auvLBcxemkQyqlmAoMhZ0A38CrPYGp7Z2HKMDplLFpRgNrOYiVXgvm8L3fowVIFTBdKnM9ohTBwCS8RTSf/TVZGddGwREnL9gyIIbwFdgC8HfT/6mDgVwFr8KjYwfAp+wkmUIz/5mE+rrCvH07u6HLlwqEgQp+ZbpmT96/p0/eP2JI2NdyXkvy5j52onxt99040/ddmMpwVKtAAhS8v5u97/dfvv3HT8200qzPO/nWRv0vPm5X7n55v96553z3baUnAoQ0R8984wKSlDtKkfjpIBaM+aLuz0KSQZX8+7doZdBk2PASt6RNB8iscHrsp9FEPeOgORh9aHqUaZhJjuMbp5hrZvQ1VbYZX52s1cfpmdzWj1USQfBaM9CLnRc1C8nLiIiUlEmXJKoReIvryy+7prjRTuhzOVsp/OWk9d/3zXHn9ra2swGM2nrxNTEeNJiKZnKSE6VSgDKpZxMWz9+001vuOb4mc3tjOSBbvf68QkIQbJkmYLo7O7uv2xsjiVCMjtcHh0Fl3tLEvOuzMLITqwmCLIsEDwGC1eDFmpKI2brij9VID6tko2Qq9LrZmc3pCGcE5pxZqF39qgtTUAwIzu4iKhqlLD6qmGFonb9MmxDHQqR1C8bF4LKnmaOaNoVdR/uJnhsffPU5tZN01OSpRBglpJ4qtW6Y3ZWLdsglwlBJMZH6b9zlksCDnTHDnTH1A9zlgIodl4ixCeXlpZ7O7NJKydpJr9sNUEwICBSiMFsq2XfpNuCERhNWrFtSi8p2R2ezao8ZNDEye1VYcnwmVuoUxS0ZJTJ6ZosEd40HB4hOKS+mZGkoLSXE9tx3ehScNxMsiGaUK7aQrvN7nELsX6YhMBmP3tsa+um6amCWA5QQoJZlsVtRgK0EkFE6/3emZ3dy7s764NMALPt1uGxsWu6Y900JaKcmSUDRT80OR3VD25tWZ1wdjulkZ6DCeNJenx8nIL6viH4llW+JmyeTEDJ3BjbHCBZGMe5uQoLu9cRxM7TQJ4ZGSPDVhIQ6Vp2lB1MRqjr9TQb3OpQU7FGWIsE1oFjJqKT4+MtkZSmnwkC8W4jzokf29w02Da6yZeBVAhi/tjly3958dID6xuLWX93kMkiGgXGk/Rot/Ml87Nfd+jwc2dmKEEupTCCIyZKBIj4zOZ2UpgLM64iNggR5QVkUs61k+PdLgWbuSo8D8IAFWNzuC0A09jWwiH3V0ZjiLBZbfOFO03NrAUTCaShWg0CE7Y4MjByWH8XQnhrta9KAWWAGmkdmtQxEBGKnPaO6emFTnutn6XD+9cBprV+X0fGhvFIgE9fufKup576p7V1YuoIpISJJK1wJZbMp3d2Hnl6673PnH/lwsKbTl5/zcRELjmxSyL9PFvLBwlEoFhV2a/ip4Kon+e3zs3MdzpVNdMbwAlPuqyulctrXq+nn1CkhNSUborASB2YJR0TmYRNcCpCKxEhQQQ5r1KVJOE2N0pb04FZs0wdzCa6AMb5EMQkD3Q7z52a7kkpXIVitobRESAK+2JN96wyeX7HY499zz33fnpldQKYFCIpeAlEkjkvgnmiFtG0SATEn1+6/E13ffbDFy4kAjnZPYEMQDARSw0OVFrkrEBtyUwsczl4xf4FHUWRJ4VHHlVOclTxEbV7yGvf4CajsmNgkIqMQeat2bVCO0OHAXkjxmtEQBG1GRrKblkwUIsARUqlTjWzgHi+5dAhEoId7p81jqaaBUyYEIk2gMwg2s6yH7r/gd85c3Y8SabSlAkyVBUr1iNnZqLZNN3O8v/48MPvOn06EUIaoWwqaEygRPmZ/PCiOHFCJD2mY52xV+7bRzE+BzACKG0PyI032Dm1EARe7GsmDBvs4wDTIoxgmVAj4ow4RcGJCa067NBgVdufqBEpYzGzy0JjJCSY+BUHD7xsYX49zwVQROJBq00EIXDD1KTK0BiUSfmWBx74y4uX5pNU5rLKLtWgGLeMUoRmmZQtEpOEX338iXefOZMIUcT/kliI5FC3m5WWyRG1RlWnQ5qk2zL/zmNH5zqdPDcQFlUMRtjSBPt5mNlSETf+GzojgpmjTWC2AATbDSeBPgm1sThm5aSmpjNRuNlL21JEwH6HqG+DF6ZEtnDES9m1wAI67pVOgZUF8MPHr+mmCZNUnYRGZ3DxA5lzPp7SbZMTxddIYgH84qOP/fXlxYVWK7OOPJgNdMAce62tLRMwnaa/9OSTH7l4IRFCVvW+O6emcntOo7NHUqLNweAl8/OvPX5UMgvhMWYtVo7HwfCID0ZEb1DD/ezarGQb4gBR08hs7oeoApeblBelXR4Cc0OfCYepAK3CFRrCRj5tCU6tJQLKOyX9Ggtf0I6lfP7c3FuvP7GW5zAnEVRhimQWRNuDwR2TUzdNTRUHIhHiPc+c+4Nnnp5L0770u1jsflZ7CqSqQDPzGOOnHnnssY2NRBRdsfRVC/sXOu2MCTZFqAA1EsIu80Qr+ZmT14+lqTkCm/1cG0NDpQBJxsDZre4pi6XARuGkyRS+Guk8b1+G9TdZqEusdhNz2WyrTJRZB3D7h+wuQg6Km1fF8ErxRv8n2b5W2PGp4+8BhiBIKf+Pa6990/UnVuVAgBKRlJcmJTOnQhQCRj943fWJEFkuUyHuW139pccfn05SMlvmLXwDKtK04M3SJ5aX2BLYyPO3Pvjg1mCQCJGxPD42/h1Hj67LslxdtExLZgjREmKXZafd+vXbb715ZlpKKWAXR5jc4RFOV0ssKjfPodkhp32rCpjZokrZSBhzeLiDYQhdL2kiwAWRWoS3vgFX6AZhKDVwG6J1m128KQ/RfA8GnmpcdBDNqxxuWDmbCATJ/JaTJ3/+pptYJGuDQYH5CwKIdvJ8O5c/duMNX7ywL8tlK02Wdntve+ShjHNRZcxQ2IdLmITdIuX272dMEyJ5cGPr5x95tLiNnPmNJ078u4OHLg16mazOKSGTcnWQHZ2c+O1bb3n5/HzOUtgl2OHq4jWsBFMezZ6i7ZhAxB6QckAOLjRs9Kn1jEuuoikVWS8854+rU81A7Am+Uw1szk7GyrDhY2c4tqvtZhSUWJqV8JK4JfDg+trvnznzj8ur69mAmFtJcrw19uaTJ77y8MHCVu3m2Rvv/dynltem0zRnLXBJBplTszqNba2DGLLaV7jU1sp+8Nprf+SmGzIpU6DP/LtPPfW+ixcv93rMlCZiPm29+sDB15+4dq7VkiQF22obBSfA+ol9+6EHxFEyujYmvjpt+UCj/YnslnT9ap6q/gVnY5czodUnxtX0VFOvpb/IjSE4shkv/pDwWAcmnKCfQY6kloWWFaJ7RPT09tbpre2dPF/odm+bnOykaSbzBGKQ52976KEPLl6aFa3cFhIqFS+qZJisYjpUswe8mbRciS5vZPlP3XDDd524NpMyFSDClV7v0c3NzWww22rfODkx1+6U3R8gq49MlKCxiRqHyyk1UsLuTFcDVXbrjDCqMwj0RguESz2O5mcMn2dT3aXhgDxz26pdH7R2amc4QYM5nSAobWhOp1XM7uALCk8ibdtKTGxXkUlmzClELvltDz3w/vOXZ1stKXMKzEOzvF1JGyvm0BTQJ1GurZquj0ouwj9sS/mfTp787uuuLV7mlBFz5kpZUsLkwwm7qLYHjq7p/qQzfT4oXwv9aBw9CzKmJbJHe4dhGhAeHm8OGGZd3QRMExUsqntUheIKiNkri3rbtfpkY2OJiIC4fQSND0E1Ng+a8mHnisyWSmsixHaWve3+Bz9yZWk6SQuRSB7WEsr231HfQ1ouO7bz/EeuP/HGk9fnLGGkejonKjqgWVTcFtj5QVyIljAaj1eV+2H67pD8f0iS04wHlDFjVznU0fUEU6U2U+pbsJWL+kgE+woJnsIEwhVNd7KT2qNW7yh7jAf4TDYolBcxfmNJmkdCpdlKkGwNsjfdf99fLS3OpC2p0EsKl6ocYJS1rwxclhETQzIR8WQifu3Uqf/7yScTiCJ0SgREmUa6iCWMmjrYAs2Ct8bDJcTIDdXN5nIACN1BKHMKNIjCeNB+t3qpPQYtbqudLdx9BKulUsulw5hVMeSoGeg5vHonu0WGeHBm2052mBZKbkdUMFtBeCCxm2dvvve+v1tenktbmSVoy8xRO2S4Qh11KcfrCFUrOaLCHgtgPcvedsPJf3/iRC7zIuwrjCyjvAKwpxraRFs6FqvoCeERvVoHjjJ7bc0oiO1pWMFRIGyH8J45EYaN1iqQbPRymHVDnSV5OwDNZmUZghqw6lXqFNVMuXVmndkIrjYmgoigkmRJAPHbH33so8tXZtN25lKDQLYseqhlFNahChWuzIdQxP6SaSpNf/XJ0x84dz4RiVSbsVQIZN0O57ikZiTtGiQiLhwSMEGw32kZnaHkGYoNiIWwCgJSIfewculCucWg9aCSL3fHuTrwhPNfZf/AoWYyi+ij0Y0Sc/NhV6N9AmQOutf1BSkpgfjDZ8798bnz+9J2VknHKJkIZavZweptzStZ/UYSS3vEohpraGhmFVaNmXkM9AuPPvrE+poQkCxlmVgUi6CRMH+HuuSCeoCUArURp0DHQZICByRFFaaKQNnDUAtWO8ff+A5AquX8zDOoqCpeF5v7ofD67X26vjrzqC0RODqEkTk5pjPSu5TLsyaZhMBTW5u/cfr0ZJJIaxUM5A31ECScKN4sgcRHGReZAbWAtVz+5ydOZTKreATQEInZzuUVLayyuxkx1WhrB/s0bUlMn97gbi3dDmTjogYy4QrKDeFjOZ0bQ6K4+P4wuRaWoLcP2cddpkA9gcQoSMAstxWan5Blj81/P312eWe3VYbVBCr6tjRDv2Big+wKm/6XWcBS1SiX04sy24EJWwhCxjydpp9cXvnY5UUBwUyCIUoXUL0wNs9MTXUQqFvtWDzq85ACb/cttRXOIyinYPaiOSazUhsU0d5tk25hdkgqah4HS+8hxxtkQHhni+Nd3/GZhmwWi7goPKJsbRUiOb219beLi9NpKqvptBzmAPkKO2HkQVp1OZhBFRnmyLYILIjed+4CsyzEvcPaFZ5UHVA7F8ljmhjoFGL5ZEAM1lKTqxl3HaHWOMPhq1C5kmgK8fjg7yo/uUAIrPcJFRw+K1oPy1YKYUPlLC4eb5QpFT+xurXi3R+/srQ0GCQwj6updaNUStXoHWeeIaPsK7OpZCDF7IEdh7N2SlzMwpBEY0LcvbH+2OYGAAajPABFCtkE0BnewWJqz9bAbGEXqbQ2ucbDVrfvBXnse7ByvBB8Mftqe1oTKNhvaFRO3Qoc4SnMCH+Kjso54Yurwrzn8Kic0LFjTfwssotPLy+nrFqS2OnTsH2ZWj2L5GrbN4YWM9HjDykQeDFKkIKZKRVY6+efurJSJgJKpox9KVYQDaPmyZBWO2w98UiMz+STqMoKCgh1smRVIABv6AGIrR1SqM3UBWA+pycMP9f2QpQFGWf6QyiYa1jEiJ0rs+WVAIjtLDu7u5saQr9sIeQ10bd1RxGUATaOVW4yNxsqrQlSokfWN123joiSWf0CxAkOHGPFkY+Rky+52YhWEcSGzQ0oQCCht7/JFYSZGtirKqwmcSsORihOgnXb7IgLyKrt32QNDI1DOc7eKC9NEmi1P1jb7ad6wBAoZJZQ6SQ4CvxcKUEWjkL9Tuq3c5X9KVNZ2qOSVWVk5gJ0adB3pE2srWDRtVEvZhGQKGNfzTG4hnaDieKdCzQQZ/EuWDfuGf37pOXIEQALqNlB4nBg1iAMh3Vkm3SV6IwrKC4HR+c6I5ZBQNPLaUGInD87sPJSU4TtATxcgphIylB16+rHrfKwTuIobcQONoLpmnejAYDC1Jyp8g/hbVXYomchmC6WPNZvdxcXNWJzLX7iAIBsVDLrVlZB2SZaPCaSdprkZFFrYuM/EGo6EyXzvSLcW/AAVxCDpj6aM4zhaMUSd5LEMPasMz7WtxpAxTkih06hGB+2ZTLdkeQYcEOlBLrhCtgJmo3CWcxw2lMdBAVjfP89dkMfWZKNCCQosczWYknD0t8V/lATjQnWidkFGOIg5tlWa1/aylgFVW6ozByMWth/gc5hKl9iFnI5FLSx3fudMR/ptIthnJqXaRQMvKlqcIRbAzlWMFt3lw/uaoeMBex+FkWHIFP9OlKtDwCQzMKobBiJHkKwFKgBTFewu9UT4Gi5igNzO9xLtc/QSPGllNxKktunJvtF26jdaeRSc5nYPU1g1kmmieGYbZeGVQmP9CrBdskAvmTfvJUYsK2iiPoYIg5ER/MarisU+kC3u+wcnFzmoo9enVFHKzqF1jQua6gLhrZmO1ACENQ0tQ6KEXL6rs+mL3t6YtH9qvxLuSH/94WFVqGF7TgYZ5iFdYALNJ9TIVpCJEAiRJqIVCSJEIW0ppSsAibWNpVMdVKlViWIeixPzEz/m337ipENuhGOG81OAoYlNMbis7m8sHsMnTWE0cniLKYzxcgSdrP1I4mDkwBTc2XhetNm81oDyJuDQ9bGXg3IqnZYxPF3VdYWnBCY+d/sW/jy+fmPXbkyl6QDZVdMZVo2AE+jS3SQc4+k0hct2D2SOQV1IFLAQqHtYZtsgm1MgrAts+86eHC61Sp6coxd3WyV7H4YrbAddIvsyjeUb3FktoURhMcKG+yAGQYXxEFwPJFisFQQp25GKS6FsYdZZwYVJDpFSAs3mYy/4OtLjmw9W9qVfihxAAkWwDPb29/xuXsv7PSm02QgZSVGYUW5xY0mEAOWO7kE8aFO947piVsnpxbGui0kIN7J8wvb2/etrT22vXO5P0iBbpoK4lxa/Z/mTgFTKxGLWf8r5/b99vPuSISA127FRhPHszDjPsCO8oT7aybae4kZDEVPtuAMeyKEKqrq/aPsmOI1jDpR3dtYJtc2BJq7BLGrX1Or2A4NMEkmIcTDG2tvuf/BRze3p9KkaMkv9coq5ReW1GO5y7y/037J3MxX79//kvn5/Z1u8Jue2dn5u8XFjy4u3b++sZ3nXYF2IeNXdWArztqA5TrLr5qff8ftt0+32yXJEQ6Q8extLI5hgV6RLVzMQNRSCKMFTwmbmRsLWtxah6g1H+Qa4ZEJ11zX+aN2c8V5H9LJVAfGK1prwdDUmZ4kKURyZXfnN5889cGLlzaZEiESEgVlKpdyQHIcODE+/hUL+7724KGTU5MVlytXU3UIJT9egICk+O3dq+t/ceH8Py5fudQbZEypSAVIEEnmPjPABzrt1x45/O+vvbadJFKyQKWQKCwKeXPlj9JmCLidOSYwANsseRJWI+zIWnPodSewvbGktIUrY9s84rDqpN9ClxtUBhtFUCWSHKlhqxW0ZDCZJHMRwT+2vvaxy0v3bO9c2N0dSJ5Ik8Pdzo3d7otmpp8/NzuWtohIsixm4JiNdGSxxplL7ciEiJZ2d+9aXblrbePx3d7SYDDIs8mkdbjbfsHU5CsXFo6MjxfIqDD73WCELCP5B78VymyPYHY/PHi2Y2s49Fk4ftZ9MVdSkIUSv5SaZ1wRrj3Fy3jkZAqk+rVS+KvAbpMujbSxAivLbIvhFnzP8rDCLGQIUSaIu/kgZ+4gSZNEvSsrdUQBY+wchDERiCpjCHApaoNEJOqLd/M8k9xNRFr9ULIs2WKKPK8SU67CxxH9gPV0FFwmYh14Tv9WxEZanea16x/bwfbl2a6wPqyr2UNNrI7kwHuNPt0hzr4mXAtsvjA/ShIzlDUCEUtZjcEx6zpsEBxQkF/Y+E2RBFV6H1y1MQrSH8ulBo4BcMII1a1BaDE0fLToym4eNIJORMVczerkKI3H2gnarXtmQpruYYfQcPy18Va4ijxhFORHl2g0C6DYIoKE6rswATWLis4lNMZ2TZHVKDm9VYgkAXrSRWk0UbY1sTeje9jM4abrb6d+w2wPW6RCc4p4g4MNf+SRyesqmthcV0hOBwsHfmvqCLBRjfcjx+GWfLgj0K93fTwHt5EtBWDjOsIKBYpWLFsCg1h3VZc+xl57jf3ARCtMOweVmVYID3NRjtEIDhtPF82cvpNTB2MS5+kEzYbfD+zLQwSPqGYdsSlEDPL6pAGh0UKn51dZ/FA52YWlRii72IxiHv6uothZDkWyutPC0zLUXXptmazr2axMFCoSaFm2taF/hO6LK20sWRmxsvNI27kizAA59FkMn25cv5Zgk53HdZp6ziJyjasJsNeDwKld9+OQo9UYXi4dfQ7daK9uwbRYAiFfa9sSw2IFQIpqvytojZ39HOvvrjnQbNr2qqtbGMpiTFxU/0pZGVtb0Ft6UVgX3RrORv+1ol7pZ6xgsUrNzC62swWUN2ruHSmsrM+ZmkTJTmxuTjqy/ABcC0cBogQECrgh1IfPtpyImX1QpPnA5MWCPKW/UvJGX6Laj07BsR4sqRkW6orsGK+RZZBUGRVPX5BJr5yeTmxVMVRTjyoXGFF+McBZ987qxh52PRQTjY4INo1l64HWeJO0rUnkbR32px/WbvFyYwWGqDh+V4uiwErxmAK0ClWqVONW9BhZLwOyhF1qpbZ0lRABKDmQMBuTg6X9QaXGbGGmoNI7qyUuCoiUYRiThK5+s7EDbesHF7jRdbrRajU0IuKFEZIq5/nu7XOMFUrt0k9gonVlQqzSLxsd6RxWwNOBXpncsznajAIDPmAbjnCux1Gmq4qmKxkZaPlNtu1S2YQFvcnUzcAtuVoH2ookbNuGECML/q4a4TExW4vIPPLjpRCazZ5ZAnS92C0zlrWMITm8a1AZUkrEGiYDznvvJR1LMM2tq9ehHDV1HithtPVFTD0xzcwWXhsIIp/Jkbq+jl0RDbGhBgXBnQHTvLQfFNF7Nv7YkXEV2iuShzXiSSX+YBqtlOkDpKibzlMr+Rc8aiHXxp6oBwLlAoeYYaigEBOE7fvsilgRpEMJHrFJRpOFB2Rn1EpYorICniogt6rWGTEiB7AoHZM5RAZd2AxrtSMgjRn6p2mB/dqGAYtbEmohNZfQMKnqaQB7xDWtbiUOouJ2kj3SubFaCkLMIbjC+kOScBUGx/ovUI2TQtX2XO0+EyFBdStsS4k4Xo8BMqnscIdLKZke9iZ0GKw29o0jOAyzRO+LQ8CSmnvtNECYHdUwXgBE+HUwDK1anlpaK4fiMzahHK6Cd5+54Ss41ttki3+n9VtQaLZaaaaNxATGk5B7ytUVSoYJX0vWkZniowrSsgsW9arIH8yIW0LhWDpdLQOhUo8U9imvhAt1kdvI+Nib/FFdjA21+GMJHdwl6CicWnuYeOf05lmZVjSo8Gu4vr6SeZqcXnuLRlGucqrDqlAi6gzvHOLq4VYM4NYOqGq2051AQPxslAahkm5BOV1Nj+0SXgFGGAvj3pCbTxpq4D46ogeHIoCOQkdBcBvMqqs15RFZC8nDQNqcG492opa0VwMUNC6C7BMNkMnxImvCKDeYHWZP8LMNOmorxVB3yGloWqZJWkfjkiB0HsSVZpVWV6zSvSLOVhkIuOpXjW9qVGOEdFbJTguLbbjL55sTo8DqiGShsmfdkLTC8EBtIFRyQcSbsan2i6J2ZNcqjNCn3LNx3T3rNlWHLqPgWpDbCgLn1LizavUnAqHUBzrbCVq16qh4cygU2CTZGoZYSUWaMYoxCrpJhmiK2xpOEMbANq2GWsW9klkSp4AZ5DGxLMUkQtUrGKefPI0yZlZxdgmPI55IcsWG8dJD1g4YbsZqCznX5LJMObHQcjEGDuzCUWxrbQKwJe+0zhsnSthGzevySTih4EQfd24gMRJGnm1kGx76pY18uXlTCwPfIwpcgkOWUoh5PLUHEUSUMyfl4EC52O9t57IlxFSaTKVpUp55dsXFuArU9NU6IglcQg66UI8PX1r8m8XlK/1BV4iTE2Nfvm/+hbNTLZCGykozw2EHbPs3vcmYJPFmlumEwgjAUkETSZpU1USh+ztq7D7ITTBKBfBywqJTpuVaxoEDWpnlpoatMRG2CNiMXckFgZlMYW4reI/xBepwB11+YqeR15bNLneCZBIQz+zs/On5y/+0sn6p19uVMgXGRHJiovuS2ZlXHdh3bKyraiTlrvXorKF50lr3GUQ/+9ip//fpi51EtCCYuC95Mk0+/OI7Dne7ery27+Y4kNgbO6OwqeLMzs533/NwWcSxhwSmoH3t1pfum/2Oo4dnWmkZNzNbJr1Q6NQe1XZtxXg6kAA+cnnp3rXNbiIE8Ppjh6ZbKRNXPERqvFcsK2iRamq4FR4GpEu3Op8IwNTF69PARzdEVx0RDVPExVGtrlSoJLFA8qGLi29//PSVwWBcJC0BEA2YezL7zMr6P1xZ/b2z57/u0P7vPn74cKdtxQRsdIaEDy6KPuNEiPdfuPQHT1882Gkz0UaWg6gn5QsmJg91OyzZWVE2tYhgbVpWYDzrQIeIcqbl/kC9yanQXOz1/3V1/YMXl3799htvn5qUzMIcoaFtpKtJrWrmXEKT+Oji8h89c2kmTVoC33Bo/3SrVcVArIrrbozPRn3Mpi1EhIIiCCr74Rx8416SkBwhTaK0DH+KQwwMLyfBG9JENneZyEw7q03PuaQkST5xZflHH3piLEn2t1vrg7yXyVQgZ5ZMXSH2tVuS6beeeuaG8bFvPXool3lijklmLefs1M1LLwgIIJfyPecuTaYJE+3m+bceWXjR7PR965vHuh0QcpKJUmxjthJtJWYqjA0Hc1fpFpRWBR4OuHCLeunGE3Gw0zm7s/v99z36nhfcfqTb0eRZ1mJxbJzM4vorf67vbzJN9rdbU2mSougEYgv9L+vrcEBHfdlM1iAKFeuVJFtEeUo1KSorNEZXqDQTpAq/0gr343o+UH2aqmKVkjpXgQ0Ku2YmIdDP5a+ferol0EmwmeVftm/mqw/s29dq7cj8wY3tTy6vPrq53ZPypXMzrz68wMRCaLiqIAgLLY1COXEp31zZnEIP8nxv58xOb0yIzSx/2fzMz958koi+5uBCofiSVGc2ZybiRPXMMOeF+SFye/+tlTNoUMBOnt8+NfGtRw7mpRIGLQ+yv7i4eGZnd67VutDr/9qps79++01KwgDl0DhGOVGvhNMksSBUKH652SRTzpQx50X3EZcaSUUbEqNsRyrG8mg5c8pziXJsgLl/9Fwddse2W6wQh6pF7g8tSRQFfrimLHWn3JA9x8ZxjwhTfFAx+VH6jeLwFaWTIvNmAdy/vvHE1s5kkmwM8pfOTb/zjlvVx3zlAv3Qdcc+tbL2y0+c+e5jhzsiyVkmhby1LKbigIj6ed7LpQAmkqSQ5M9lLtStQoKSlUG2k8uJRPRZvmBmkogymSd6ClwxcIQSIQiQLLezHEQTSVIoSkqShe5yZZ0EWXQ9NlWPBszHup3XHD5gLsnXHdz/us89uNQfzLaSv7+y8tTW9omJcSmlEEU4TwkEgQYy281lC6KbJAkEEUuWqjE/FSCi1EBQu4kQ5TEopreisG5JAmLayAYDKbtJMp6WDSIyl5pfDyIB1loYpi9WB1MRts3aqB+ney1l/mBO5tTgKRiDAjzdJ9fWufCdqgTrqZGaM1P5nNM7OwMpRZr2pPziuWki2s4GLQEBEFNC4uX75r54bkoQiDkpgT6BBGe2dz66uHz32vq53f5OLgVoJk1vnRp/zaGFO2emJctyQh7TjsxXB1nVH0FMtJ3ngzxPBCaSBOW4XkHAPy2vfvjy0sOb25tZTkQzrfS5U5Nff2j/HdNTxXFBVDnPOp8D5pw5l4WH5UzSwW7nNYcW/q+nnh5P2quD/mfXNk5MjFdgStKX+YcuXfr40srZnd5OnrcEDrTbXzI/85pDCwudTs45CALiT85d/KvLVy73+uOJYKJM8lseeqIjBDP97E3XHRnrSslCYDeXf3L20t8trVzs9XKiNnCo03nR7NSrDy0cHeuylHDMjk9W0yMaDaCKbeEFCiBQgQzKOAYpVJnFpMFoYnUlekE24hfUbREw5jpVl68m9hD1i+fF3BXiH5ZXv+v44fG0VZxUSZSTJKZ2MbOPWEqCoLXB4LdOn/vQxaWVQZYzy8L9EXUSce/65vvOL77pxNEfuO5YnnOSiLPbW2+879GcqS3EgHkyTf/43KUPXlzKmMeT5Pefd8t8uy0Im1n+s4899eFLS2WQJJlAbYh71zbfe/7Stx899NYbrhEw/aEx+sT2ksUTSQACFUaRBTPRtWNdUb1usdcnolxSO00eWN/4yUdOPbi51YLImYtJYGd2ep9aWfvDpy/9+I3XvOrgQj/P2wmd2tr528Xlw91OWg1G+eeVjeLAbOZ58Ygu7fbf9MBjd61tdIUYsCwiudM7u59ZWfujcxd/8Lpjrz16UFRFS2idPTLprgGWlAaHOVqmhC4+lOxJuzyVlu+XmowDCyZmqCA2NsKZrBGGLn/ESESuGesUQcZYIu5a23z9PQ+97sihF89NH+x0VDSVSU5YoJzcIPqSP3BhcTXLxwROjI/fNDk+naYXe/3Prq4PBKfArz5xdqHd+uYjh4ioL+Xp7d22EN1EFBZrdZAv9gaSeCJJMmYm2snk99/3yKdW1hfarY0sP9xt3zQxljE9vLm1OsjGk+S/njm3kg1++dYbVHs1uUgSnEBUUjkkrsCuEqLNLJPVG8cTQUTtJLl/feN77nl4O5dzrdZ2lt8yNXG4214ZZA9vbHXSdCvP3vzg433Jrz58gIg6CabTpAVk1edMpuW2SEqpYP6Zx07dvbax0G7lzF80OzPfal3q9R/e3F7Psou9wSeWVl579FCJu1pNtwweBmWxjeWa7CPP6wVppqmDczjnMyqh1IzdUKbGBAFm5hfOTt86Of7wxvZcO51Act/61t2rTyy0W7dMTbxoduqlc7PPnR5PRVJ0ggpCLuWBTuf1xw/99eXlt5y85kvmZsaq/tJ719Z/6IHHN/N8ppX+3tkLX3Ng/3iatiFun5roS77Y7xdTBQ90WrNpmrEcT5KEAMJ/OXX2H1fWjnQ6y4PstUcOvOnE8fl2i4ie2dn9pSdOf3xp9Ui3897ziy+YnvrWo4fyXCaOmo+HNApAECmtpDalRPSxpZWWEMzcgrh5cpyItmT2E488uZ3LiTTJmX/+lhP/7uBCSwgi/ueVtZ945NRSfzCdpr/w+OnnzUxeNz7+7UcOff2hA791+pmPXF6eTEQC/MZzbjzQ6bCUR7ttIjyysfGp5bX97dZmlr/95hPfcORgcQFnd3b+8OmLH1ta+cVbTibQLHEzuR7hkYYmChm0H7b6YsxlKbX9hBLUU7MuKq8rEC09SiYHBVW1JQZJGOwLMMtuIn7plpNHu+3F3qAv5VSSzLfTbSk/tbz2jifPfsfnHvy2ux76iwuXC0PLTAnAzN99/PD7Xvicf7t/Xu0qknznzPS3HF7YyLKxRJzb7T22uU1Ex8c7f/6iO376puv6UqbAZp5/25ED7/2i5/7pC5/zB8+7bV+nfXZn+/0XF/e328uDwZfOz/z0zdfPt5OBzAd5fmys+2u33XDDxNhmns+kyf/zzIWdLBfCEn6TDhGASBBtZfnZnd2ntnZOb++c3t55dGPrFx479emV9ek02crz6ye6d85MEdFfXlx6aGN7ppWuDgZvvu7Yaw4fBNNA5n0pXzI3+6u3npRELWA9y/7g6QtEdLDduWFifCZNZKXZdeN49/rxsZOTE20BIjq90x8wM1FL4EWzU0QkZZ7L/JqxsZ+46bo//6LnHOh0iFkYJO2iYzcQJXtdHuV+KAICWWl5KkkTdvLE6vUGvS9V+BCMLolm9R0OVGeNkbAV9MDVM4CU8tapyT994XP/+5lzf7O0fHG3X7jF6TQRSAdS3r+++a+r6/9raeVXbjvZQRGZyYkkLQ7HSn+wNsgKPf7DY93nTE8WX9uTfLHXL90EYE40Lf4JFDAn/n5pdS3L9rdbTPTGa48U19WqiibdJP2uY4f+08NPLnRaZ7Z3713f+OL52ZzzBAhW0CTzeJLcvbbxjZ+9T/06k3JHyuk0ZaLtXH7/tUfHk5SYP7a03BZiJ5fXjnW/6/hhIkoNQbgXzM68bG7m41dWJ5Pk0yvrO3nWgWCmzPAkO4WqBMsCaBsTImdKgV3mH3/k1BuuPfq86cnpVqt4DPOtNOdcwOKOaelnT8xL6cdFH7XDzDHTSSNGQjXkLDU6UViR06ACr5jMlVZF8oym4smxShGV/hZyzhY6rR+/6cQbrzvymZX1Ty2v3b22cXanN2CeSpOJNJlC8oFLS/vb6U/ffDKXeaEo9eFLi//z4tJT2zurg2zA3BXihvGxqVYyniSF0eyV87nc2Z2sBbRZED28uQVCzjSeJH987tKHL1+RRoItgAu7vak0IUJO9PjmzhfPz0pwNWi+GDTIAR1NI4dPhZgWYjvPd3L55hPHvubgfpJyK89Pb++2BIg4Z/qFx59iu/AvIC71+h2BlhBX+oPzu72TE2PO0gtigYKmIZjlC2cnb5zoPrq5s6/dumd96wfuf/Rwp3P71PhL52deNj97pNtNUArHsfN42NZhVKIPbFfiHfpo1XdbGiCYsRrbKvBMhDRcHq3po7XYKUw1nESmAOBGyKUkwny79aqDC686uLCdZfdvbP7VpSsfunylL2UL2N9ufejSle+95sjRsW4vlz/96BN/dmGxLURfyrlWeqDd6km+a22jL+X+TstpmnWDCLaIJOtZrvTH/+zCYuZFoykwniZZlm9m+eVBnxQ3GWGWbaFa25eWNHULuGli/HuvOfI1B/cXIzC3+vmOlCBKgSuDwbvOnPfSdO4mSVtgkOU9KVf7GU0gsqwFJYWnW+lvP+emX3zizGdW1geS2wKX+/3zS72/vrw8106/av/8m08c29dpF1gMglU4YYg++tRnS3JMQ/K2KoQxuMRm5KTWdB6nNzVE6NSUBa42cZ3Sl80oBSdICJznhRCeJKLxJHnJ3OxL5mZfuTD/5gcfz4lSYCPLHt3aPjo29q4z5/7k/KXDnU5Pyjdcc+TVhw4caKc9yRf7gz87f+l95xenWgl5zL1Y0tMRQu32F89OjyXCeWUuCz6PWM+ya7odKoYNwRFdVrp82MnzF8xM/odrj+VSopwRjP3t1o0TEwLF+HFBRG2RtAAiyokmkuTOfZO+oc9kqRaXM0+3UmJXILxkPJXiNZBSnpiY+N07b7tnbf3jSyufWV1/cmtnN5fjSTKQ/IfPXLp/Y/Pdd94620qrskWo6lzHtKEh4ozggO1glRVyiKUqQlGF13ANX5zJjN9VXY00i//PLlx8+fzsgU6XiHMpizBCSpLEL90394LZqU9cWZ1NU1myx+QHLi3ta7dWs+zbjhx4y8nriIhYThHv73RW9w/++NxlWFw6RKpPpQO7bqwriRLQ2iB/04mjL983zyyh6xtMSIxyMJOsRIhQLSSrfvrSXC202y+bn/W+T2ZSJihZ99Ot5ECnvdgftICOwDvvuHEibXkNOaYCF2UsUwgTLmRiyTKXLKB+wZL5eTNTz5uZZpZPbO18cnn1fRcun9/tH+m271nf/MtLi995/GguZeI7rJgWcpE6SQ5AD8Imz8QcFhTiF2yGRHMNGWPEF1GAyEacMwPi0c2tH3v41OvufugPnzm/3B8kIkmTJBVJO0m6SbqZDZ7e6bWFkEQJcLDdXhsM1gZZCpEx3zY1TkQ7WTZg2Wcmoie3t5WZ6lgVWg5CH0T0pfMz7arf/f0XFos0aSDzgeRcMiH51PLyP6+s9KUkY4KcwTMTnn5eWcvr54NMZpnM8zzPOWeUhU5QgYKKL5mb3s1lV4jzu/2/ubxMhH4uB5IHslAL5w9fWnxia6u4fGmrYAMYSG4JEhCtqpYlhDizvV3c10BmOcsbJ8e/55qjv3vHLeOJ6EnZhjiz06tOPqu5rpGg2YCsOL4BrJEqsGRnbIJ8Whonc4YbhyRHYBUHqzpP9ckysP+hWWEAQTK/8/T5jhDLg+znHzv97rMXXjw7fefM5OFOJwXO7fY+cHHx7M7uRJLs5vJot33DxHgvl2NJsp3nXSE+cPHKqw4sTKZlh+3fLy2/68yFsURI5hboo0vLL52fnSjwCA6MOxWAlPJ5s9Mvm5/5+JXVfe3WRxeX33X66e+79lhSHf+/vXzlRx9+gojmWumbrzv+DUcO5CyFClPZoGCyFbQkAKH6mKISVYoeAVxSJb7l8IH3nLvck3IiTd5x6unD3e6XVHauJ+Vvnjr7O6fPHey0D3fb77jtxusnxrmcMozCUmzl8p2nz3/NwYVHNza7SfKNhw8s9wevv+eRG8bHfuDEsRfMTKkHu5PLjFkAkmi2lZqcopI5UeUfFjXZahBiQ6kiTiEWCKYwxaelFvLliGVorhCbAlAB3yg8+N+eA5AIXOr171rbKE7t/nZrLcv/4uLS/7y4VIxcyZnbQkwmSU60lmU/fuO1nSTpJOJFM1MfuLR0qNO+Z33z2+9+8BX75xKihza2/mF5tSPEXCtdz/LJNP3gxSvfeOjAy/bNkT0rGHacCaIfu/G6BzYeXBlk02n6G0+d+8Ty2otnpwXovrXNf1nd6CZiK8sHUj5vZrJSseZgKAB3HGvo3iu+cC75yNjY22649q0PPT7Xavck/8D9j7583+zNk+PrWf6ZlbXHNrcPdzvnd3svnJk6NtZV/T6zaVpcdleI955f/PMLi+tZ/uLZqW86cvA3Tj19antnZZB97z0PP3dq8s6ZyYV2e2Uw+PDlK5nklkAL9GXzs6Q6tuFWDBDj+sFQG0dj2QgbKU2tviXJZCmAs6W67BBEa/qnpdVvX/SWHmi3/8fzb/+d08/8ryurS/1BC2IiTVJDbHwg5fIgS0Bvuf74tx45mOdSCPzH64/fvb7xzG5vLk1P7+y+8/S5nHkg5XSa/sqtN3xyeeUPnrl0pNvuCGGw83jA5X9S8+uKXF1eNz723+645UceevyJrZ3JNLl3ffOzq+tESEAtIZYHg1smxv/L7TeemBiXuRRAWQarRP2UPR8wF35QQ03VVERAoR6SADAEIZfZaw4f6OXyl588s5vLsUT8zeLyX19eJuKWEAK43O9/8+EDv3jLyTYgK2DzKxfmfu/p81uZ7ApMpolknk7x0Ob2pZ3drzqw71/W1k9t7SbAP6+u/9PqWsGM6opEEq/1Bz96/fHnzkznUgoCgiE2G537ZmUQdlMXjFJWuRJmRdjmTFZbIvnZn/kZs+9d+03W/aEaWECIZO2zreGCICCA5Ey79RUL+165MH+40ylcwG4ue5Jz4oToQKf9in1zP3XTda8+fECWU255tp2+Yt/cpV7/fK8/kLINsa/d+rL9s//51pMvnZ9daKV3r22u5xmIXn1of8FpvtzrfWJ5daaVCtDL5mbvmJmSLEVl9KWUB8e6X3dwX1dgeTAoSDgpMJGIo2Pd7zx68O23XH+o281l+RZDG7/cUgJiPRt8bGllIklawC2TE//bwrzqZYA5PZxLtKKcR8d858z0l++f3cnlyiCTRILQEmIqTW+fnPjRk9f84IljSZlLFowQPjzWPTrWuX99cyOXAylbAifGx77p8P7nz07fPDnx6kMLx8e6PSmzUi0VLSHGEnHz5PiP3XDt644dlsVdlOroVQ8mzFY0jtZw7E5XZf8NQhHI4QuiIsJU7Ve2cpIqbpsd90M1M23FEg5UOpmJJSiBKKbdbAyyK/3BRpYDNJWkBzrtsTQtKVZV2xOzFCIpankXdnsAHe12Dne7BcsqFelOlp3e2RkX4ki3m4oCJ+PtXBYiJGOJaAlzwBeYWDInEAQxkNnZ7d5qNpBM+9qt491uK0mIZM4sStpMedQlqv8BCkRgK8+LxWhBjCXCaJrhciYxrLVA2Z4kU5EQYW3QO7fb38zylsDBdvvI2BgRSc6JileiKiBBQGxlgye3d3Lm+VbrWLeTiIQozyUnQhQF3Su9/qV+fzPLE+BAu3V8vEskpMwrZydLXgMjkBLC5iwr5RWTdGVuD8kOxcCFDouwvvIWRrutycFGRQAlWxUSbnevRbOHdgvWxgIrLgBQ9DMJLT7PVPIwYWGsFZinesVkzkxlfMpJMZfeGD3nNfiYxQso9lrZf1bu8rKwlRVsTJ0Dlt8v4UhN+O3NZoyhOY+mqlaBW+RMRJxWe0JVhwojHWRSJuZkGy5jc2UFBUHYo2+YZc66XQyK30A2OwswnhWXRyAo5sP2TrL6v20yvdulE2EkBxquEapohIW7DVFGIgMbMaqirIZyIyG3SdKoHTnT9qDU1MiQsBMhgBwOcGOgvLlJoaRicqPZJy1CbJmq0ansHmJPwwbm3TvN91ZfYDVdTACCIKseOru8osr9XLBwhdFlrU8ka6GVBN60TnNusgkKOBrdvtyLZLdW7Q0xdERHjI0VU11ibwYL20KDXElRmWqRzAGidPlVsoxmtaQsV/ujUq8oxyhVFX1bfc9JgbW8HnG8NQ7lx7MnOuJ3E7LFfgNTUIEVBhLOzsFiu1vM2hzS5Gx6srsw5IJMTNflnFfCF0ZrPSu179LyqMYQWRVtw90RDcTfbZqpbTsELIEPe2MJt2brPB4E59AamIXTdq2tGsgj2ZftSEUAY9ZG2MbX2P6QojmeFTUaxhzDahI6K68a1GP19HcZ9nsJgYm9wckc7FUfqsfGMD7aWD2jPQ/WRaJqJi15jXAQDLZXn6ED73JWtaiUdUBsPgAypHVhwfp+52qNvrDPWS6fhqVNEsSkwbkMxGVuSwaHOvtQN5qRzZCmODhSb+VyIi4LSzMDVE3tLnWrTSSNpRYwshyT1Neq5rtqd1Fw81Cd3vLpiyJD1D2DZL9egiAKnN0S+jDR18IhqssSZR6k+qi1bogjpCT1Viw9KmDMPuIy2LfcOBxIo2SPiCri4aptx2xHZy6aBhz+vrA7Th2XJRB2hdavODAg0zZ4wh2na3RPaPFnB/6q7fRmNW/UVnsqG3hIOjIrlQhoNUpeB76Sq5GRrC7VugQn0WAJyZAMNd6V2VgDY8aq+i5mG87kgEKPOhpgciSIivxH5dLCdSZqNIEVqYKMy7PdgM5AytyyOqPmzOvKJCrtAjYWWLGluQpkqiQCXjpDKrSM5Pgw2kgR8ma+fa/WLw0MVDY0sGGEz2ZkXDP4INK3oSoiKEthAkSizKdUna/8P+F4xPLlVbuPsZskUZFeyXLOSOXtmSz9B1MMlJkJxXA50vKSZfeNIGdYliHeDQjrEJuPzKxPmOg2WyG0egtrWB6mRI/SCyQtqGqw83RgZpRjS9yo3PdVN3/pAYVu7gZXhxuwW+zNLmqz6gJEOcwqbJPs9VmznjCqTZ+lX8B2I7pdMRTedCxL9hi6GQHmywojKNloBFLISYltlE3bJUdNBsF9WymGDf5a9SyFN4NbpQqKqBZooBRURdcUUulTBAe2+oLJUoInqpdWVdJ3IGkrssJu0ypFB2EN7daAuJclQadYogrFyLo2n67CHO5LbjrRyNA4N96RuiGRA1yQtKJ4P9ZjY2CYU1VzCpNs9S3COPMmbqTG0lSiJoWWP9jJ5XQQon2ngxvb5ASVoYs4b4wr+Uj4aaNpjpSXIVPRxYk2TG1PZqsCCxUOFiOiuerzVcusGumKelhVJjKdJ7OpsWt07JUvNUWy3JntcNWZtFsMDhmoEQPX/dtkSsXYFosNwJ1qp3FYM58Mkwh31o2z6GzUSBpK26hQ1DzGOu2yp34akWtz0o8d51TikAZz17hfeyK1p6ZcK0rLIZjDYM25ncM1vVlGzw0bzfNWeosQJs4e89cpRUuOkvsoMqKBAsMG00iSOayi7bB22IvgABVBeKLCRpNs8Og4RsRZL7I1o03uvYlugsHDrh9K4MKaZwKQizHVJMsxYMyX3TCbYK1bVsW8MuCIHgvYoTNbRxk1R8YQqyttWlip0O5Y9hy4AU47Qzsc2+Yj75GJF9EzZwUTsOj6wfFUzf+ARp23NoRFZAW/jf+I6IhQVsgGhSyW+Tycotvot7b3Pz6XDlpu0d0TbPRWEIboy5tDe6TdXCArrLLUpzbx05BCnDoxjNDgKNAeRcFjm6B+HGPDH8JEgUZq1rTp5kZ26f14yJMd8eua+u9RX6sgxbIii9AW5JgH8aDKIJSqg3dUmEJMfFKJq7N9jiteukGLYItr4cRkMGwG26au0rc0hKiMD4Q9m81EIWzM1iizwSoOcHAaCVmjQdkOROw1gAI3YCtiIm5+HERMcuARBmenmaVfkxbghjRK1d5LutRdFHXl6qthjJjXNtiKIGCZLvLCZfKUtCncDlh0QjurzhGCjhlUhU6rCvmDIQiRg/Oydwgs6JQV7QJMRkapGV6eb4ehru2MTDbG62lCkjvvT/X12tG8mV8ibmIxzAbDWL2QvGIAleUQXwpOgEZuSm/Er4hdm5F/Bg6GNcJRZ5jeK43KnDotlVSYV1VzM2cDQ6/a8FGWqgIn3okm2R5MrV8IoyGJK8RVV2WYDNA96hKNa4Pibruvhh5yB9IXTyFhJ+XsAO3xddOnPz7e+CjzqwtrJKBHbVZ3x0RhzXTJZhOe2VJaoqoCunhoV2GrHLl8AeAlhoBFH3dXyWtxYNKaxarZzanCiNBYLvXIFNxQxZhWhuyOUXDIDkzuoGm/79EZf+0yyNlqXgudHotAERs6F7De5E44doYLB62FqbTjI4e+fzfPt1HtZ2M+S2gStj84yOZRxoyZpl6yq8JtCejBugs2YhWiITN/rcqyrfnONu0iNkC64Le7Hs9JkJtHiZWqp654uR41NPqGhnsWoIFIMAcBYWb/h04pL6AjF2NE1F6n8JhrlkCjf7FuLyo3da+2Gqq71yuDwLHJZA2SCJg1jNjYUWbmuE6pslhShzEIHNaQZnwwWfWN5PCsJe7tXElCDgMi7AEc5hCrGGji1am0TXX4uFZwGqJ1KGCZvG5ysadskON6xjWbg1mPh3GJDCGcK7Q8JtnVtWoCJenaZzPDRSKcaaJ6vEjkWMNNrobumABq74VxPMqKO5GvKvC6kLcRBvsFDSA6kRKewTBGfZmlIg7K4nNtw+eohQAnOcHwAWyguJyna7xC6giFNA8QuxdraE/8YlJjlqQ5i8tMakNwaMh+uIm6Py2MQ4OfI6oSKm21vl4YBSUjxLFAdmMYAywRdzsqsrAPkH94nZ3KhgyYOREn2NBPMb2D0M26Vh+RFmS2phDWmC4gnLY3meVMBozM8XK11TbNThspEYky49FTk6piZB2EjWibJpwTj70cWZ1heYMA2Z/O6sAZpKyXRf4uSrjCH2ULQpyfXd0vAxFiKbzNakuZxYx00KIr5pP/Flv+Lmq6YIo7wkOwQVHgwLfZGFY09FyB8b60vEo/ICh/6A2fJY++46g2WIkyB4qyzMMCb7vyYJRQYNW9Iv5CBCaIFEonHvJZgqlDh9LWjIU3ZtYEBifDgV6Hekc3Wa5rtA6/13MU7hhKxBsaqlXWHYfmp2kYovqhisvNPFd3QuunaD97c5yl4i/ZsxXJ3GfkaitTeGybsTqRAmJgtDcz6ko5HHb5bACGbMqacxViGEtszHCwwEkf7HAKX3WztHVaDoQcVjBjjvkyv0gXOrFsL7sx4p0pqJlnrzvImyNERqcRbEMVxGCZhFFQQ7z85o0EFfDiXHMCDZNFrfTCUtTnuogO8uPawxqBD9wd6fuLkAFlz+EyiIOWH4gat6Ghdqwih8b1RS80hNO5ZHFBvJYN50OMyb+l6TJmLIZzC3hhCShVNgP+4gojiGN2TTRz9Mp8LMApGpJXaTc7kEKbIzprL0CWghUjw+ug8gMtox6nGGMIdJ7YeIqJL8SAGAfy9cLn8FjFkjXpqZz7ALIvmhebCV+YbWm3s1N4EAmbXCKp7IgfaMaOhTP1rykWSk5ln+PcaB4SI/BVKX6T7ZvY+0SzNBSEGJycFXE34TQaBudxUuxA22YjtHKBJUHUBrv/tE0mh9sD7Ql2qAM4jBKYg3uF0STWbR/VJ8hCtE56ACMsONFK260BpDaIIFCHP6EW3AvYdg4i12HYULPCIiQ1v5QBQ/FCUTN8sihH7YGugzllE44uhTG8A26MGP7XsD/1SKxpI/UtFw0ltcPeAoVR94dV5zH7tyNKlWaBwK6KHURRuVtmPase0YyH6xBUK0Bmx8myepYcwHt0R4IRffFwI2kBs2xUxdg1LQytEGDBCrZbZX2lrDkUTvVCF28QADecStpwMSoeUvlhilDr0OgbDNKADtGjWqFGuF85a7CUJrCvMiYL8zdzN7/LEV6xM1ZqIIqoPNgGIBy4kO4kZ7ObyB33ykH4QNot5GwPPTBNV30iFsIYjVqQd4O6IoQm2mUB5JMpMEx6qBK/tKW2h25YDvWQG3IvgZG2kq2NKi11BQ8btPlS7pQLsmEqsrvEgjIvwek/RNF2atUaaG5o2DgNM4tKS9Tr7AhMh3e+y0INQksWcUVhL+aQjx2kg+wB3fV1m4b1w2qTKRyuxpdZAzKJqAGU1mwx4qiHXzFxynkwJBjgD1bVeStipwE1kAEiCL75aQY2wbblt/YxvNyHQ1oBPrkPAQFForCIIVEUR0UM6XAns9Y6r2ZZigujOE1WNvZWibaUHDqvdS8QkvslgabRnu1zBTkNqy7UZGABVM3P4dA0Zh/UduqGkodUrf1qseKDOsiWi5o4EWVoOEyxXrqXIXAX5OgJxJyXL82s2gV88y8qdTuOPrnRt5ih1VFwxEMPRZ8EGasbcuS0oJyfIzkKbaoeQeerqzUUFD7fDizqDXxw38JevmpO6BxCz68+kEM06FrTzYa+gRpRbMAzrghb/VUIF+MN7wQMy0gchfNiTAj2YAQaRO5kMoPhMznr8qloDdsJ4GuKWf6sDuhaoY4ZS7tlD8MwIn4jtXE6E0JYDtuNpKhrOUdNNKrbaEMUVgvRdYwfOwAPUEdpMiJJuAbGHslBpggB16Y1Q+N0jhweWeiKBudTklZzjFWj2egfDsQMHA5GiVzYyF9GhYhxdWZC4ZiwQig/UtZ8ba90z8McHLxGv/jeYseXmuX9+vNddcXb0GU0PK4tJoWoqj4bzu+sRJzFRZE4ZmhBGnHmaZ28Avvltxj0M+QCuNbkOUCxp9MDF26pPJfON7h2QkE97OmnVJGMPcDHCnUghcjjHhophyCxzk5xsFNmxt5cFTfTDHAenhroF8Nl6izHsIuJDMTT6xDbXTIumlVjfclsWHUpXV65C+HdrghdTUMBS4qqFiF0FEp0/OR2dAUiCdN9m/+5GDJbh8w4dqAGC81+xMpMcb2ImjAFboACIFwmGrqryqGVjvwdhyqMTDUch/q8lU1tL236HBEFYRkt1DoMhMIojhhkdYdazLh229VkiPrbeAiWb5KKDLUymxUL3XsLQ1SY7JEy9dsiUAmmsgENaL6zEKOtXkVwz+RJtFNEQLNmpwJKwZNDjxf+7VsTMQHOpVsl5NCYlGAbE4UiXAvRdpqcONxL5A518tRUCRbjiyPib6ZAV31RMoaS1yDRjUDDPXjPkRHLqK/37kKXBAQ+L1cS/yOidSJl8EMdZw0OjRfAlnUnthyBM3Ca4SYypJSCrYawGryZh8bolt5rTSQ2rJR29X+w52eJEV7UpJT0bIuUFOwGhHFCv5ZC7DJIfVyfDcq82dNYVa/cUo9H3tLRK3M0G/czAzRtaogavGflj+Sr2C7DDKRDZKgxnCEP2KR7LNqB3NBwVptEIMKqZvuVNtDgkG8i9syT9SPdDY9YKaBh9b3R+Y1gPMDnY0ONZEr2ALWHYmpgGAY64qVh+OoNixzLGCIlZ4BY4ZukJpgb/Qs+I5T1CCezD0janX1aPZ+iVRRoqBAGFo/hyLsxjwMjSRNZQ0KYqNF+qyFxOA/7ahpWr94FOxGtVERr7NEMkyfOI4JZW0lDSQ1REm8Vgr3tunkGhhSL6itUcXcwiPYgPleMyUS/G5RqmZr02ESeUXCUmaIwxDY0QhlWaE+jcSpwVbF/s04eKDW/eJzu0c11gCFAXBsaVk5Z/TgtFoWV/L7ljyJQZDWYQxN5peX6dC8oEAojWYf3ApW1oC/on8j3MXH4wXCkDYSNEaEi2EbBURTj823AAnYBQ3Y5EN2cGIYNqfpSAQdKKUHRlrSALELIKbhRYSNgggI6M6GEQLOdKHR5IwZkfphf/oTZ6ceyVCFVwmE2bFlqdRENfhEpFdRQJ9DMVu1RKSMyjym4pOwPUPIEsnSFxlRGLrUbbM3gWIzmA7iWPQL58f4o4S4PjxRD86pHJKEg6hNdi2QMkCgm5iCQoDeLnsspE1w7fYYiZJ5G4dSIcSU3XEGOYDCa9+BosLNWqpEcYL7W459XHxnETluFdIGN3yqiJFfTvmBtYkiuoUSbn2POKwwHZ81pxKNCA3uLtyTvUamgISDCI1R79dudXhKhKVIw2A3cKBsdshzc/FTxEHuCUh3UmXmuA2dPwatehNjkwBj1JdQCqFd3cmo/5wscTdbfIIgw4jUJT0JCyXQasZChj0UG936Ipr+huSW8jnsKUBV00lCPHZDda+poWQU3hWFKNQdcda3BmJ9T3LhsUjsPdZximAiMY/B8AXTWg3nKTmNghHCQaZhy5ucj8Wwc89lBdroXpMSfPYnaU1n2fLMjBVC3y2ANRlVzdSJkG6ZgxzzsIUMKUhmpXANEqUl6FlLo1kOMX8AMd4e2YAWH+XzBzVvTlznxSS4Bikr+7y3aCEYGMQpoDW3NaKeJa/MNaVN5dk6tF4gEJFsjWefn0U78//jP/wc3lvNls2J8fAAAAABJRU5ErkJggg=="
      alt="Safe Pets Australia"
      style={{ width: 44, height: 44, borderRadius: 10, objectFit: "contain" }}
    />
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
  const [petForm, setPetForm] = useState({ name: "", breed: "", weight: "", age: "", color: "", microchip: "", vet: "", vetPhone: "", medicalNotes: "", vaccineDate: "", photo: "" });
  const [symptomStep, setSymptomStep] = useState(0);
  const [symptomAnswers, setSymptomAnswers] = useState([]);
  const [routeStart, setRouteStart] = useState("");
  const [campsiteSearch, setCampsiteSearch] = useState("");
  const [campsiteFilter, setCampsiteFilter] = useState("ALL");
  const [snakeFilter, setSnakeFilter] = useState("ALL");
  const [selectedSnake, setSelectedSnake] = useState(null);
  const [baitReports, setBaitReports] = useState(function() {
    try { return JSON.parse(localStorage.getItem(BAIT_REPORTS_KEY) || "[]"); } catch { return []; }
  });
  const [reportNote, setReportNote] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
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

  function getSnakeRiskForLocation(lat, lng) {
    for (const z of LOW_RISK_ZONES) {
      if (getDistanceKm(lat, lng, z.lat, z.lng) < z.radius) {
        var stateMap = {"Sydney":"NSW","Melbourne":"VIC","Brisbane":"QLD","Perth":"WA","Adelaide":"SA","Hobart":"TAS","Darwin":"NT","Canberra":"ACT"};
        var st = stateMap[z.name] || "";
        return SNAKE_REGIONS.find(function(r) { return r.states.includes(st); }) || null;
      }
    }
    return null;
  }

  function reportBait() {
    if (!location) return;
    var report = {
      lat: location.lat, lng: location.lng,
      place: placeName || assessment && assessment.region || "Unknown location",
      note: reportNote,
      time: new Date().toLocaleString("en-AU"),
      id: Date.now()
    };
    var updated = [report, ...baitReports].slice(0, 50);
    setBaitReports(updated);
    try { localStorage.setItem(BAIT_REPORTS_KEY, JSON.stringify(updated)); } catch {}
    var shareText = "BAIT SIGN REPORTED via Safe Pets Australia App: " + report.place + " (" + report.lat.toFixed(4) + ", " + report.lng.toFixed(4) + ")." + (reportNote ? " Note: " + reportNote : "") + " Reported: " + report.time + ". Keep dogs on lead in this area! Download Safe Pets Australia free app.";
    if (navigator.share) {
      navigator.share({ title: "1080 Bait Sign Reported", text: shareText });
    } else {
      navigator.clipboard && navigator.clipboard.writeText(shareText);
      alert("Report saved and copied to clipboard!");
    }
    setReportNote("");
    setReportSubmitted(true);
    setTimeout(function() { setReportSubmitted(false); }, 3000);
  }

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
    const text = "Safe Pets Australia Alert: " + assessment.risk + " 1080 bait risk area near " + (placeName || assessment.region) + ". Travelling with dogs? Download the free SafePaws app to stay safe!";
    if (navigator.share) {
      navigator.share({ title: "Safe Pets Australia", text: text });
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
      var padLat = Math.abs(endCoord.lat - startCoord.lat) * 0.2 + 1.5;
      var padLng = Math.abs(endCoord.lng - startCoord.lng) * 0.2 + 1.5;
      var minLat = Math.min(startCoord.lat, endCoord.lat) - padLat;
      var maxLat = Math.max(startCoord.lat, endCoord.lat) + padLat;
      var minLng = Math.min(startCoord.lng, endCoord.lng) - padLng;
      var maxLng = Math.max(startCoord.lng, endCoord.lng) + padLng;
      var bbox = minLng + "," + minLat + "," + maxLng + "," + maxLat;
      var mapUrl = "https://www.openstreetmap.org/export/embed.html?bbox=" + bbox + "&layer=mapnik";
      setRouteResult({ overall: overall, summary: summaryMap[overall] || "Route assessed.", segments: segments, mapUrl: mapUrl, startCoord: startCoord, endCoord: endCoord, bbox: bbox, pts: pts });
      setRouteLoading(false);
    }, 600);
  };

  var riskPct = assessment ? ((RISK_ORDER.indexOf(assessment.risk) + 1) / RISK_ORDER.length) * 100 : 0;

  var bg = "#f0faf9";
  var bgCard = "#ffffff";
  var textMain = "#1c1c1e";
  var textSub = "#4a4a4a";
  var textLight = "#8a8a8e";
  var border = "#e0e0e0";
  var accent = "#00B8A8";

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
      transition: "all 0.18s", boxShadow: primary ? "0 2px 8px rgba(0,184,168,0.3)" : "none",
      marginTop: props.mt || 0
    };
    return <button style={style} onClick={props.onClick}>{props.children}</button>;
  }

  function NavBar() {
    var tabs = [
      { id: "home", label: "Home", icon: "🏠" },
      { id: "symptom", label: "Emergency", icon: "🚨" },
      { id: "snakes", label: "Snakes", icon: "🐍" },
      { id: "hazards", label: "Hazards", icon: "⚠️" },
      { id: "more", label: "More", icon: "☰" },
    ];
    return (
      <div style={{ background: bgCard, borderTop: "1px solid " + border, display: "flex", padding: "8px 0 4px" }}>
        {tabs.map(function(t) {
          return (
            <button key={t.id} onClick={function() {
              if (t.id === "symptom") { setSymptomStep(0); setSymptomAnswers([]); }
              if (t.id === "hazards") { setSelectedHazard(null); }
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
        <button onClick={function() { setScreen("home"); }} style={{ display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <Logo />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 15, fontWeight: "800", color: textMain, letterSpacing: "-0.02em" }}>Safe Pets <span style={{ color: accent }}>Australia</span></div>
            <div style={{ fontSize: 10, color: textLight, letterSpacing: "0.08em", textTransform: "uppercase" }}>1080 Bait &amp; Snake Safety</div>
          </div>
        </button>
        <div style={{ marginLeft: "auto" }}>
          <div style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, fontWeight: "600", background: isOnline ? "#e0f5f3" : "#fdecea", color: isOnline ? "#00968A" : "#c0392b", border: "1px solid " + (isOnline ? "#00B8A8" : "#f5b7b1") }}>
            {isOnline ? "ONLINE" : "OFFLINE"}
          </div>
        </div>
      </div>

      {/* SEASONAL BANNER */}
      {seasonalWarning && screen === "home" && (
        <div style={{ background: "#fff8e1", borderBottom: "1px solid #ffe082", padding: "10px 20px", fontSize: 12, color: "#e65100", lineHeight: 1.6 }}>
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
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fff3e0", border: "2px solid " + accent, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {petProfile.photo ? <img src={petProfile.photo} alt="pet" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 24 }}>🐶</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: "700", color: textMain }}>{petProfile.name}</div>
                  <div style={{ fontSize: 12, color: textLight }}>{petProfile.breed}{petProfile.weight ? " · " + petProfile.weight + "kg" : ""}{petProfile.age ? " · " + petProfile.age : ""}</div>
                  {petProfile.microchip && <div style={{ fontSize: 10, color: textLight, fontFamily: "monospace", marginTop: 2 }}>Chip: {petProfile.microchip}</div>}
                </div>
                <button onClick={function() { setPetForm(petProfile); setScreen("petprofile"); }} style={{ background: "none", border: "none", color: textLight, fontSize: 18, cursor: "pointer" }}>✏️</button>
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
              <div className="pulse" style={{ position: "absolute", width: 70, height: 70, border: "2px solid " + accent, borderRadius: "50%", top: 10, left: 10, opacity: 0.5 }} />
              <div className="pulse" style={{ position: "absolute", width: 70, height: 70, border: "2px solid " + accent, borderRadius: "50%", top: 10, left: 10, animationDelay: "0.9s", opacity: 0.25 }} />
              <div style={{ fontSize: 48, position: "relative", zIndex: 1 }}>🐾</div>
            </div>

            <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 10 }}>
              <Btn primary onClick={function() { setScreen("disclaimer"); }}>📍 Check My Location Risk</Btn>
              <Btn onClick={function() { setScreen("route"); }}>🗺️ Check Route Risk</Btn>
              <Btn onClick={function() { setScreen("campsites"); }}>🏕️ Campsite Safety Ratings</Btn>
              <button onClick={function() { setScreen("hazards"); }} style={{ width: "100%", background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: 12, padding: "14px 16px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: "800", color: "#7a3800" }}>Beach &amp; Water Hazards</div>
                  <div style={{ fontSize: 12, color: "#a0522d" }}>Sea hares · Blue-green algae · Cane toads</div>
                </div>
                <span style={{ marginLeft: "auto", color: "#a0522d", fontSize: 18 }}>›</span>
              </button>
              {!petProfile && <Btn onClick={function() { setPetForm({ name: "", breed: "", weight: "", age: "", color: "", microchip: "", vet: "", vetPhone: "", medicalNotes: "", vaccineDate: "", photo: "" }); setScreen("petprofile"); }}>🐶 Add Pet Profile</Btn>}
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
                    {petProfile && <div style={{ fontSize: 12, opacity: 0.9, marginTop: 8 }}>Travelling with {petProfile.name}{petProfile.breed ? " · " + petProfile.breed : ""}{petProfile.weight ? " · " + petProfile.weight + "kg" : ""}</div>}
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

                  {/* Report bait sign */}
                  <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: "700", color: "#7a5800", marginBottom: 6 }}>🚩 See a bait station sign here?</div>
                    <div style={{ fontSize: 12, color: "#9a7200", marginBottom: 10, lineHeight: 1.6 }}>Report it to warn other dog owners in the area.</div>
                    <input value={reportNote} onChange={function(e) { setReportNote(e.target.value); }} placeholder="Optional note (e.g. on fence at north gate)" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #ffe082", fontSize: 13, background: "#fffdf0", outline: "none", marginBottom: 8, fontFamily: "system-ui" }} />
                    <Btn primary small onClick={reportBait}>{reportSubmitted ? "✓ Reported!" : "Report & Share Location"}</Btn>
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
        {screen === "symptom" && (function() {
          var steps = symptomType === "snake" ? SYMPTOM_STEPS_SNAKE : SYMPTOM_STEPS_1080;
          var isEmergencyState = symptomStep === 99;
          var currentStep = isEmergencyState ? null : (steps[symptomStep] || null);
          var isComplete = !isEmergencyState && symptomStep >= steps.length;
          return (
          <div className="fu" style={{ padding: "20px 16px 48px" }}>
            <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 22, fontWeight: "900", color: textMain }}>🚨 Symptom <span style={{ color: accent }}>Checker</span></div>

              {/* Type selector */}
              {symptomStep === 0 && !isEmergencyState && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={function() { setSymptomType("1080"); setSymptomStep(0); setSymptomAnswers([]); }}
                    style={{ flex: 1, padding: "10px", borderRadius: 10, border: "2px solid " + (symptomType === "1080" ? accent : border), background: symptomType === "1080" ? accent + "15" : bgCard, color: symptomType === "1080" ? accent : textSub, fontWeight: "700", fontSize: 13, cursor: "pointer", fontFamily: "system-ui" }}>
                    ☠️ 1080 Bait
                  </button>
                  <button onClick={function() { setSymptomType("snake"); setSymptomStep(0); setSymptomAnswers([]); }}
                    style={{ flex: 1, padding: "10px", borderRadius: 10, border: "2px solid " + (symptomType === "snake" ? accent : border), background: symptomType === "snake" ? accent + "15" : bgCard, color: symptomType === "snake" ? accent : textSub, fontWeight: "700", fontSize: 13, cursor: "pointer", fontFamily: "system-ui" }}>
                    🐍 Snake Bite
                  </button>
                </div>
              )}

              {/* Emergency banner always visible */}
              <div style={{ ...card, background: "#fdecea", border: "1px solid #f5b7b1" }}>
                <div style={{ fontSize: 13, color: "#922b21", fontWeight: "700", marginBottom: 8 }}>⚠️ Seizures or unconscious? Don't wait.</div>
                <a href="tel:1300869738" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#c0392b", color: "white", padding: "10px 14px", borderRadius: 10, textDecoration: "none" }}>
                  <div style={{ fontSize: 13, fontWeight: "800" }}>Animal Poisons Helpline</div>
                  <div style={{ fontSize: 14, fontWeight: "900" }}>1300 869 738</div>
                </a>
              </div>

              {/* Progress bar */}
              {!isEmergencyState && !isComplete && (
                <div style={{ display: "flex", gap: 4 }}>
                  {steps.map(function(_, i) {
                    return <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i < symptomStep ? accent : border }} />;
                  })}
                </div>
              )}

              {/* Current question */}
              {currentStep && !isEmergencyState && (
                <div style={card}>
                  <div style={{ fontSize: 11, color: textLight, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                    Question {symptomStep + 1} of {steps.length} — {symptomType === "snake" ? "Snake Bite" : "1080 Bait"}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: "800", color: textMain, marginBottom: 14, lineHeight: 1.5 }}>
                    {currentStep.q}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {currentStep.opts.map(function(opt, i) {
                      var isEmerg = currentStep.emergency && currentStep.emergency.includes(i);
                      var isUrgent = currentStep.urgent && currentStep.urgent.includes(i);
                      return (
                        <button key={i} onClick={function() {
                          setSymptomAnswers(function(prev) { return [...prev, opt]; });
                          var nextStep = currentStep.next[i];
                          setSymptomStep(nextStep);
                        }} style={{
                          background: isEmerg ? "#fdecea" : isUrgent ? "#fff8e1" : bgCard,
                          border: "1.5px solid " + (isEmerg ? "#f5b7b1" : isUrgent ? "#ffe082" : border),
                          borderRadius: 10, padding: "12px 14px", fontSize: 14,
                          color: isEmerg ? "#922b21" : isUrgent ? "#7a3800" : textMain,
                          cursor: "pointer", textAlign: "left", fontFamily: "system-ui",
                          fontWeight: isEmerg || isUrgent ? "600" : "400"
                        }}>
                          {isEmerg ? "🚨 " : isUrgent ? "⚠️ " : ""}{opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Emergency result */}
              {isEmergencyState && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ ...card, background: "#fdecea", border: "2px solid #c0392b" }}>
                    <div style={{ fontSize: 16, fontWeight: "900", color: "#c0392b", marginBottom: 8 }}>🚨 EMERGENCY — Act Now</div>
                    <div style={{ fontSize: 14, color: "#7b241c", lineHeight: 1.8 }}>
                      Based on your answers your dog needs immediate veterinary treatment.<br /><br />
                      {symptomType === "snake" ? "There is NO antidote for most snake venoms — only antivenom from a vet can help. Every minute matters." : "There is NO antidote for 1080 poison. Early vet treatment is the only chance of survival."}
                    </div>
                  </div>
                  <a href="tel:1300869738" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#c0392b", color: "white", padding: "14px 16px", borderRadius: 10, textDecoration: "none" }}>
                    <div><div style={{ fontSize: 14, fontWeight: "800" }}>Animal Poisons Helpline</div><div style={{ fontSize: 11, opacity: 0.85 }}>Free 24/7 — Call first</div></div>
                    <div style={{ fontSize: 15, fontWeight: "900" }}>1300 869 738</div>
                  </a>
                  {vets && vets[0] && (
                    <a href={"tel:" + (vets[0].phone || "")} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: accent, color: "white", padding: "14px 16px", borderRadius: 10, textDecoration: "none" }}>
                      <div><div style={{ fontSize: 14, fontWeight: "800" }}>{vets[0].name || "Nearest Vet"}</div><div style={{ fontSize: 11, opacity: 0.85 }}>{vets[0].vicinity || "Tap to call"}</div></div>
                      <div style={{ fontSize: 14, fontWeight: "900" }}>📞 Call</div>
                    </a>
                  )}
                  {petProfile && petProfile.vetPhone && (
                    <a href={"tel:" + petProfile.vetPhone} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#5d4e0a", color: "white", padding: "14px 16px", borderRadius: 10, textDecoration: "none" }}>
                      <div><div style={{ fontSize: 14, fontWeight: "800" }}>Your Home Vet — {petProfile.vet || "Saved Vet"}</div><div style={{ fontSize: 11, opacity: 0.85 }}>{petProfile.vetPhone}</div></div>
                      <div style={{ fontSize: 14, fontWeight: "900" }}>📞 Call</div>
                    </a>
                  )}
                  <div style={{ ...card, background: "#fff8e1", border: "1px solid #ffe082" }}>
                    <div style={{ fontSize: 12, fontWeight: "800", color: "#e65100", marginBottom: 8 }}>While you drive to the vet:</div>
                    {(symptomType === "snake" ? [
                      "Carry your dog — do not let them walk, movement spreads venom faster",
                      "Keep them as calm and still as possible",
                      "Do NOT apply a tourniquet or cut the bite",
                      "Note the time of the bite if known",
                      "If you saw the snake, describe it to the vet — colour, pattern, size"
                    ] : [
                      "Keep your dog as calm and still as possible",
                      "Do NOT induce vomiting unless told to by the helpline",
                      "If you have the bait packaging or a photo, bring it",
                      "Collect a sample of vomit if safe to do so — helps identify the toxin",
                      "Note the time you think they ate the bait"
                    ]).map(function(tip, i) {
                      return <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 18, height: 18, background: "#e65100", borderRadius: "50%", color: "white", fontSize: 10, fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i+1}</div>
                        <div style={{ fontSize: 13, color: "#7a3800", lineHeight: 1.5 }}>{tip}</div>
                      </div>;
                    })}
                  </div>
                  <Btn onClick={function() { setSymptomStep(0); setSymptomAnswers([]); }}>Start Again</Btn>
                </div>
              )}

              {/* Complete — monitor at home */}
              {isComplete && !isEmergencyState && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ ...card, background: "#e0f5f3", border: "1px solid " + accent }}>
                    <div style={{ fontSize: 15, fontWeight: "800", color: accent, marginBottom: 8 }}>✓ Monitor Closely</div>
                    <div style={{ fontSize: 13, color: textSub, lineHeight: 1.8 }}>
                      Your dog is not showing emergency symptoms right now. However symptoms from 1080 or snake venom can be delayed by up to 6 hours.<br /><br />
                      <strong>Watch closely for the next 6 hours.</strong> If anything changes — go to a vet immediately.
                    </div>
                  </div>
                  <div style={card}>
                    <div style={{ fontSize: 12, fontWeight: "800", color: textMain, marginBottom: 8 }}>Warning signs to watch for:</div>
                    {["Sudden trembling or muscle twitching", "Vomiting or excessive drooling", "Weakness or wobbly walking", "Dilated eyes or glazed look", "Collapse or loss of consciousness"].map(function(s, i) {
                      return <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#e67e22", marginTop: 5, flexShrink: 0 }} />
                        <div style={{ fontSize: 13, color: textSub }}>{s}</div>
                      </div>;
                    })}
                  </div>
                  <Btn primary onClick={function() { setScreen("firstaid"); }}>📋 View First Aid Guide</Btn>
                  <Btn onClick={function() { setSymptomStep(0); setSymptomAnswers([]); }}>Start Again</Btn>
                </div>
              )}

            </div>
          </div>
          );
        })()}

        {/* FIRST AID */}
        {screen === "firstaid" && (
          <div className="fu" style={{ padding: "24px 20px 48px" }}>
            <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 22, fontWeight: "900", color: textMain }}>💊 <span style={{ color: accent }}>1080 First Aid</span></div>
              <div style={{ background: "#fdecea", border: "1px solid #f5b7b1", borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 13, color: "#922b21", fontWeight: "700", marginBottom: 10 }}>⚠️ NO antidote exists. Every second counts. Call now.</div>
                <a href="tel:1300869738" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#c0392b", color: "white", padding: "11px 14px", borderRadius: 10, textDecoration: "none", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: "800" }}>Animal Poisons Helpline</div>
                    <div style={{ fontSize: 11, opacity: 0.85 }}>Free 24/7 — Call this first</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: "900" }}>1300 869 738</div>
                </a>
                {vets && vets[0] && (
                  <a href={"tel:" + (vets[0].phone || "")} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: accent, color: "white", padding: "11px 14px", borderRadius: 10, textDecoration: "none", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: "800" }}>{vets[0].name || "Nearest Vet"}</div>
                      <div style={{ fontSize: 11, opacity: 0.85 }}>{vets[0].vicinity || "Tap to call"}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: "900" }}>📞 Call</div>
                  </a>
                )}
                {petProfile && petProfile.vetPhone && (
                  <a href={"tel:" + petProfile.vetPhone} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#5d4e0a", color: "white", padding: "11px 14px", borderRadius: 10, textDecoration: "none", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: "800" }}>Your Vet — {petProfile.vet || "Home Vet"}</div>
                      <div style={{ fontSize: 11, opacity: 0.85 }}>{petProfile.vetPhone}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: "900" }}>📞 Call</div>
                  </a>
                )}
                <a href="https://www.greencrossvets.com.au/webvet/" target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#00796b", color: "white", padding: "11px 14px", borderRadius: 10, textDecoration: "none" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: "800" }}>Greencross WebVet</div>
                    <div style={{ fontSize: 11, opacity: 0.85 }}>24/7 video vet · ~$50-70 · Great if remote</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: "900" }}>🎥 Open</div>
                </a>
              </div>
              {petProfile && (
                <div style={{ ...card, display: "flex", gap: 12, alignItems: "center", background: "#e0f5f3", border: "1px solid " + accent + "40" }}>
                  {petProfile.photo && <img src={petProfile.photo} alt={petProfile.name} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />}
                  {!petProfile.photo && <div style={{ width: 44, height: 44, borderRadius: "50%", background: accent + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🐶</div>}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: "800", color: textMain }}>{petProfile.name}</div>
                    <div style={{ fontSize: 12, color: textLight }}>{petProfile.breed}{petProfile.weight ? " · " + petProfile.weight + "kg" : ""}</div>
                    {petProfile.microchip && <div style={{ fontSize: 10, color: textLight, fontFamily: "monospace" }}>Chip: {petProfile.microchip}</div>}
                    {petProfile.medicalNotes && <div style={{ fontSize: 11, color: "#e65100", marginTop: 2 }}>⚠️ {petProfile.medicalNotes}</div>}
                  </div>
                </div>
              )}
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
                { icon: "🐍", label: "Snake Risk & ID", sub: "Regional risk + species guide", action: function() { setScreen("snakes"); } },
                { icon: "📍", label: "Report a Bait Sign", sub: "Pin a location and share", action: function() { setScreen("report"); } },
                { icon: "💊", label: "First Aid Guide", sub: "1080 offline first aid", action: function() { setScreen("firstaid"); } },
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
          <div className="fu" style={{ padding: "20px 20px 48px" }}>
            <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 22, fontWeight: "900", color: textMain }}>🐶 Pet <span style={{ color: accent }}>Profile</span></div>

              {/* Photo upload */}
              <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 20 }}>
                <div style={{ width: 90, height: 90, borderRadius: "50%", background: petForm.photo ? "transparent" : "#fff3e0", border: "3px solid " + (petForm.photo ? accent : border), overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  onClick={function() { document.getElementById("photoInput").click(); }}>
                  {petForm.photo
                    ? <img src={petForm.photo} alt="pet" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 36 }}>🐶</span>}
                </div>
                <input id="photoInput" type="file" accept="image/*" style={{ display: "none" }} onChange={function(e) {
                  var file = e.target.files[0];
                  if (!file) return;
                  var reader = new FileReader();
                  reader.onload = function(ev) { setPetForm(function(prev) { return Object.assign({}, prev, { photo: ev.target.result }); }); };
                  reader.readAsDataURL(file);
                }} />
                <div style={{ fontSize: 12, color: textLight }}>Tap to add a photo</div>
              </div>

              {/* Basic info */}
              <div style={card}>
                <div style={{ fontSize: 12, fontWeight: "700", color: textMain, marginBottom: 10 }}>Basic Information</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Dog's Name *", key: "name", placeholder: "e.g. Buddy" },
                    { label: "Breed", key: "breed", placeholder: "e.g. Labrador" },
                    { label: "Colour / Markings", key: "color", placeholder: "e.g. Golden with white patch" },
                    { label: "Age", key: "age", placeholder: "e.g. 3 years" },
                    { label: "Weight (kg)", key: "weight", placeholder: "e.g. 25", type: "number" },
                  ].map(function(field) {
                    return (
                      <div key={field.key}>
                        <div style={{ ...lbl, marginBottom: 5 }}>{field.label}</div>
                        <input type={field.type || "text"} placeholder={field.placeholder} value={petForm[field.key] || ""}
                          onChange={function(e) { var v = e.target.value; setPetForm(function(prev) { var n = Object.assign({}, prev); n[field.key] = v; return n; }); }}
                          style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1.5px solid " + border, fontSize: 14, color: textMain, background: bg, outline: "none" }} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Medical */}
              <div style={card}>
                <div style={{ fontSize: 12, fontWeight: "700", color: textMain, marginBottom: 10 }}>Medical Information</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Microchip Number", key: "microchip", placeholder: "e.g. 956000012345678" },
                    { label: "Last Vaccination Date", key: "vaccineDate", placeholder: "e.g. March 2024", type: "text" },
                    { label: "Medical Notes / Allergies", key: "medicalNotes", placeholder: "e.g. Allergic to penicillin, on heart medication" },
                  ].map(function(field) {
                    return (
                      <div key={field.key}>
                        <div style={{ ...lbl, marginBottom: 5 }}>{field.label}</div>
                        <input type={field.type || "text"} placeholder={field.placeholder} value={petForm[field.key] || ""}
                          onChange={function(e) { var v = e.target.value; setPetForm(function(prev) { var n = Object.assign({}, prev); n[field.key] = v; return n; }); }}
                          style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1.5px solid " + border, fontSize: 14, color: textMain, background: bg, outline: "none" }} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vet info */}
              <div style={card}>
                <div style={{ fontSize: 12, fontWeight: "700", color: textMain, marginBottom: 10 }}>Your Home Vet</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Vet Clinic Name", key: "vet", placeholder: "e.g. Riverside Vet Clinic" },
                    { label: "Vet Phone Number", key: "vetPhone", placeholder: "e.g. 08 9123 4567" },
                  ].map(function(field) {
                    return (
                      <div key={field.key}>
                        <div style={{ ...lbl, marginBottom: 5 }}>{field.label}</div>
                        <input type="text" placeholder={field.placeholder} value={petForm[field.key] || ""}
                          onChange={function(e) { var v = e.target.value; setPetForm(function(prev) { var n = Object.assign({}, prev); n[field.key] = v; return n; }); }}
                          style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1.5px solid " + border, fontSize: 14, color: textMain, background: bg, outline: "none" }} />
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

                  {routeResult.mapUrl && routeResult.pts && (function() {
                    var allPts = routeResult.pts;
                    var minLat2 = Math.min.apply(null, allPts.map(function(p){return p.lat;}));
                    var maxLat2 = Math.max.apply(null, allPts.map(function(p){return p.lat;}));
                    var minLng2 = Math.min.apply(null, allPts.map(function(p){return p.lng;}));
                    var maxLng2 = Math.max.apply(null, allPts.map(function(p){return p.lng;}));
                    var W = 320; var H = 180;
                    var pad = 20;
                    function toX(lng) { return pad + ((lng - minLng2) / (maxLng2 - minLng2 || 1)) * (W - pad*2); }
                    function toY(lat) { return H - pad - ((lat - minLat2) / (maxLat2 - minLat2 || 1)) * (H - pad*2); }
                    var pathD = allPts.map(function(p, i) { return (i === 0 ? "M" : "L") + toX(p.lng).toFixed(1) + " " + toY(p.lat).toFixed(1); }).join(" ");
                    var riskColors = { EXTREME: "#c0392b", HIGH: "#e67e22", MODERATE: "#d4930a", "LOW-MODERATE": "#7daa2d", LOW: "#27ae60" };
                    return (
                      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid " + border, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                        <div style={{ background: "#1a1a1a", padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 12, color: "#fff", fontWeight: "600" }}>🗺️ Route Map</span>
                          <span style={{ fontSize: 10, color: "#888" }}>{routeStart} → {routeEnd}</span>
                        </div>
                        <div style={{ background: "#e8f0e8", padding: 8, position: "relative" }}>
                          <svg width={W} height={H} viewBox={"0 0 " + W + " " + H} style={{ display: "block", margin: "0 auto" }}>
                            <rect width={W} height={H} fill="#d4e8d4" rx="4"/>
                            <path d={pathD} fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
                            <path d={pathD} fill="none" stroke={riskColors[routeResult.overall] || "#e67e22"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0"/>
                            {allPts.map(function(p, i) {
                              if (i === 0 || i === allPts.length - 1) return null;
                              var seg = routeResult.segments && routeResult.segments.find(function(s) { return Math.abs(s.lat - p.lat) < 0.5 && Math.abs(s.lng - p.lng) < 0.5; });
                              if (!seg) return null;
                              var col = riskColors[seg.risk] || "#888";
                              return <circle key={i} cx={toX(p.lng)} cy={toY(p.lat)} r="5" fill={col} stroke="white" strokeWidth="1.5"/>;
                            })}
                            <circle cx={toX(allPts[0].lng)} cy={toY(allPts[0].lat)} r="7" fill="#27ae60" stroke="white" strokeWidth="2"/>
                            <text x={toX(allPts[0].lng) + 9} y={toY(allPts[0].lat) + 4} fontSize="9" fill="#1a1a1a" fontFamily="Arial" fontWeight="bold">Start</text>
                            <circle cx={toX(allPts[allPts.length-1].lng)} cy={toY(allPts[allPts.length-1].lat)} r="7" fill="#e74c3c" stroke="white" strokeWidth="2"/>
                            <text x={toX(allPts[allPts.length-1].lng) + 9} y={toY(allPts[allPts.length-1].lat) + 4} fontSize="9" fill="#1a1a1a" fontFamily="Arial" fontWeight="bold">End</text>
                          </svg>
                        </div>
                        <div style={{ padding: "8px 14px", background: "#f9f9f9", display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {["EXTREME","HIGH","MODERATE","LOW-MODERATE","LOW"].map(function(r) {
                            var col = riskColors[r];
                            return <span key={r} style={{ fontSize: 9, display: "flex", alignItems: "center", gap: 3, color: "#555" }}><span style={{ width: 8, height: 8, background: col, borderRadius: "50%", display: "inline-block" }}/>{r}</span>;
                          })}
                        </div>
                      </div>
                    );
                  })()}

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
        {screen === "campsites" && (function() {
          var states = ["ALL","WA","QLD","NSW","VIC","SA","NT","TAS"];
          var filtered = CAMPSITE_RATINGS.filter(function(c) {
            var matchState = campsiteFilter === "ALL" || c.state.includes(campsiteFilter);
            var matchSearch = !campsiteSearch || c.name.toLowerCase().includes(campsiteSearch.toLowerCase()) || c.region.toLowerCase().includes(campsiteSearch.toLowerCase()) || c.state.toLowerCase().includes(campsiteSearch.toLowerCase());
            return matchState && matchSearch;
          });
          return (
            <div className="fu" style={{ padding: "20px 20px 48px" }}>
              <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 22, fontWeight: "900", color: textMain }}>🏕️ Campsite <span style={{ color: accent }}>Safety Ratings</span></div>
              <div style={{ ...card, background: "#e0f5f3", border: "1px solid " + accent + "40", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 12, color: textSub, lineHeight: 1.5 }}>
                  <strong style={{ color: accent }}>{CAMPSITE_RATINGS.length} campsites</strong> with 1080 risk ratings, dog policies and safety notes.
                </div>
              </div>
                <input
                  value={campsiteSearch}
                  onChange={function(e) { setCampsiteSearch(e.target.value); }}
                  placeholder="Search by name, region or state..."
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid " + border, fontSize: 14, color: textMain, background: bgCard, outline: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                />
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {states.map(function(s) {
                    return (
                      <button key={s} onClick={function() { setCampsiteFilter(s); }} style={{ padding: "6px 12px", borderRadius: 20, border: "1.5px solid " + (campsiteFilter === s ? accent : border), background: campsiteFilter === s ? accent : bgCard, color: campsiteFilter === s ? "#fff" : textSub, fontSize: 12, fontWeight: "600", cursor: "pointer", fontFamily: "system-ui" }}>{s}</button>
                    );
                  })}
                </div>
                <div style={{ fontSize: 12, color: textLight }}>{filtered.length} campsite{filtered.length !== 1 ? "s" : ""} found</div>
                {filtered.length === 0 && (
                  <div style={{ ...card, textAlign: "center", color: textLight, fontSize: 13, padding: 32 }}>No campsites match your search.</div>
                )}
                {filtered.map(function(c, i) {
                  return (
                    <div key={i} style={card}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: "700", color: textMain }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: textLight, marginTop: 2 }}>{c.region} · {c.state}</div>
                        </div>
                        <RiskBadge risk={c.risk} />
                      </div>
                      {c.dog && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 7, fontSize: 11, color: "#555", background: "#f5f5f0", borderRadius: 6, padding: "4px 8px" }}>
                          <span>🐕</span><span>{c.dog}</span>
                        </div>
                      )}
                      <div style={{ fontSize: 13, color: textSub, lineHeight: 1.7 }}>{c.notes}</div>
                    </div>
                  );
                })}
                <Btn onClick={function() { setScreen("home"); }}>← Back</Btn>
              </div>
            </div>
          );
        })()}

        {/* SNAKES - Regional Risk */}
        {screen === "snakes" && (
          <div className="fu" style={{ padding: "20px 20px 48px" }}>
            <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 22, fontWeight: "900", color: textMain }}>🐍 Snake <span style={{ color: accent }}>Risk & ID</span></div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn primary={snakeFilter==="ALL"} small auto onClick={function(){setSnakeFilter("ALL");}}>All States</Btn>
                {["WA","QLD","NSW","VIC","SA","NT","TAS"].map(function(s){return(<Btn key={s} primary={snakeFilter===s} small auto onClick={function(){setSnakeFilter(s);}}>{s}</Btn>);})}
              </div>
              {SNAKE_REGIONS.filter(function(r){return snakeFilter==="ALL"||r.states.includes(snakeFilter);}).map(function(r,i){
                return(
                  <div key={i} style={{...card, borderLeft:"3px solid "+riskColor(r.risk)}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:"700",color:textMain}}>{r.name}</div>
                        <div style={{fontSize:11,color:textLight,marginTop:2}}>Season: {r.season}</div>
                      </div>
                      <RiskBadge risk={r.risk}/>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
                      {r.species.map(function(s,j){return(<span key={j} style={{fontSize:10,background:"#fff3e0",color:"#7a3800",padding:"2px 8px",borderRadius:10,border:"1px solid #ffe0b2",fontWeight:"500"}}>{s}</span>);})}
                    </div>
                    <div style={{fontSize:13,color:textSub,lineHeight:1.7}}>{r.notes}</div>
                  </div>
                );
              })}
              <div style={{...card,background:"#e8f5e9",border:"1px solid #a5d6a7"}}>
                <div style={{fontSize:13,fontWeight:"700",color:"#2e7d32",marginBottom:6}}>🐍 Snake ID Guide</div>
                <div style={{fontSize:13,color:"#388e3c",marginBottom:10,lineHeight:1.6}}>Identify common Australian snakes your dog might encounter.</div>
                <Btn primary onClick={function(){setScreen("snakeid");}}>Open Snake ID Guide</Btn>
              </div>
              <div style={{...card,background:"#fdecea",border:"1px solid #f5b7b1"}}>
                <div style={{fontSize:13,fontWeight:"700",color:accent,marginBottom:6}}>🐕 Dog Snake Bite First Aid</div>
                <div style={{fontSize:13,color:"#7b241c",marginBottom:10,lineHeight:1.6}}>Step-by-step guide if your dog is bitten. Works offline.</div>
                <Btn primary onClick={function(){setScreen("snakefirstaid");}}>Open Snake First Aid</Btn>
              </div>
              <Btn onClick={function(){setScreen("home");}}>← Back</Btn>
            </div>
          </div>
        )}

        {/* SNAKE ID */}
        {screen === "snakeid" && (
          <div className="fu" style={{ padding: "20px 20px 48px" }}>
            <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 22, fontWeight: "900", color: textMain }}>🐍 Snake <span style={{ color: accent }}>ID Guide</span></div>
              <div style={{ fontSize: 13, color: textSub, lineHeight: 1.6 }}>Tap any snake to see full details. Never approach a snake to identify it — observe from a safe distance.</div>
              {selectedSnake ? (
                <div>
                  <div style={{...card, borderLeft: "4px solid " + riskColor(selectedSnake.danger), marginBottom: 12, padding: 0, overflow: "hidden"}}>
                    {selectedSnake.img && <img src={selectedSnake.img} alt={selectedSnake.name} style={{width:"100%",height:160,objectFit:"cover",display:"block"}} onError={function(e){e.target.style.display="none";}} />}
                    <div style={{padding:16}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
                      <div>
                        <div style={{fontSize:18,fontWeight:"900",color:textMain}}>{selectedSnake.name}</div>
                        <div style={{fontSize:11,color:textLight,fontStyle:"italic",marginTop:2}}>{selectedSnake.scientific}</div>
                      </div>
                      <RiskBadge risk={selectedSnake.danger}/>
                    </div>
                    {[
                      {label:"Length",value:selectedSnake.length},
                      {label:"Found in",value:selectedSnake.found},
                    ].map(function(f,i){return(
                      <div key={i} style={{display:"flex",gap:8,marginBottom:6}}>
                        <div style={{fontSize:10,color:textLight,letterSpacing:"0.12em",textTransform:"uppercase",width:60,flexShrink:0,paddingTop:1}}>{f.label}</div>
                        <div style={{fontSize:13,color:textSub,flex:1}}>{f.value}</div>
                      </div>
                    );})}
                    <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid "+border}}>
                      <div style={{fontSize:10,color:textLight,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:5}}>Appearance</div>
                      <div style={{fontSize:13,color:textSub,lineHeight:1.7}}>{selectedSnake.appearance}</div>
                    </div>
                    <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid "+border}}>
                      <div style={{fontSize:10,color:textLight,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:5}}>Behaviour</div>
                      <div style={{fontSize:13,color:textSub,lineHeight:1.7}}>{selectedSnake.behaviour}</div>
                    </div>
                    <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid "+border,background:"#fdecea",borderRadius:8,padding:12,margin:"10px -4px -4px"}}>
                      <div style={{fontSize:10,color:accent,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:5,fontWeight:"700"}}>Risk to Dogs</div>
                      <div style={{fontSize:13,color:"#7b241c",lineHeight:1.7}}>{selectedSnake.dogRisk}</div>
                    </div>
                    </div>
                  </div>
                  <Btn onClick={function(){setSelectedSnake(null);}}>← Back to Snake List</Btn>
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {SNAKE_SPECIES.map(function(s,i){
                    return(
                      <button key={i} onClick={function(){setSelectedSnake(s);}} style={{...card,display:"flex",alignItems:"center",gap:12,cursor:"pointer",textAlign:"left",width:"100%",borderLeft:"3px solid "+riskColor(s.danger),padding:12,overflow:"hidden"}}>
                        <div style={{width:64,height:64,borderRadius:10,overflow:"hidden",flexShrink:0,background:"#f5f5f0",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          {s.img ? <img src={s.img} alt={s.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={function(e){e.target.style.display="none";}} /> : <span style={{fontSize:28}}>🐍</span>}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14,fontWeight:"700",color:textMain}}>{s.name}</div>
                          <div style={{fontSize:11,color:textLight,marginTop:2,fontStyle:"italic"}}>{s.scientific}</div>
                          <div style={{fontSize:11,color:textLight,marginTop:2}}>{s.found}</div>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                          <RiskBadge risk={s.danger}/>
                          <span style={{fontSize:10,color:textLight}}>›</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {!selectedSnake && <Btn onClick={function(){setScreen("snakes");}}>← Back</Btn>}
            </div>
          </div>
        )}

        {/* SNAKE FIRST AID */}
        {screen === "snakefirstaid" && (
          <div className="fu" style={{ padding: "20px 20px 48px" }}>
            <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 22, fontWeight: "900", color: textMain }}>🐍 Snake Bite <span style={{ color: accent }}>First Aid</span></div>
              <div style={{background:"#fdecea",border:"1px solid #f5b7b1",borderRadius:10,padding:12}}>
                <div style={{fontSize:13,color:"#922b21",fontWeight:"600",lineHeight:1.6}}>Works offline. Emergency Vet: call immediately. Animal Poisons Helpline: <a href="tel:1300869738" style={{color:accent}}>1300 869 738</a></div>
              </div>
              {[
                {icon:"🐍",title:"Dog snake bite symptoms",body:"Sudden weakness or collapse followed by apparent recovery (common false recovery). Vomiting, trembling, dilated pupils, loss of bladder/bowel control, paralysis, blood in urine or saliva, difficulty breathing. Symptoms may be delayed up to 24 hours."},
              ].concat(SNAKE_FIRST_AID.map(function(f){return{icon:f.icon,title:f.title,body:f.body};})).map(function(item,i){
                return(
                  <div key={i} style={card}>
                    <div style={{display:"flex",gap:12}}>
                      <div style={{width:28,height:28,background:i===0?"#fdecea":accent,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:i===0?"#922b21":"#fff",fontWeight:"900",fontSize:i===0?16:13,flexShrink:0}}>{item.icon}</div>
                      <div>
                        <div style={{fontSize:14,fontWeight:"700",color:textMain,marginBottom:5}}>{item.title}</div>
                        <div style={{fontSize:13,color:textSub,lineHeight:1.8}}>{item.body}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div style={{...card,fontSize:11,color:textLight,lineHeight:1.7}}>This guide is for reference only. Always contact a vet immediately. Antivenom is the only effective treatment for snake bite.</div>
              <Btn onClick={function(){setScreen("snakes");}}>← Back</Btn>
            </div>
          </div>
        )}

        {/* REPORT A BAIT SIGN */}
        {screen === "report" && (
          <div className="fu" style={{ padding: "20px 20px 48px" }}>
            <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 22, fontWeight: "900", color: textMain }}>📍 Report a <span style={{ color: accent }}>Bait Sign</span></div>
              <div style={{ fontSize: 13, color: textSub, lineHeight: 1.7 }}>Seen a 1080 bait warning sign? Report your GPS location to warn other dog owners. Your report will be shared directly to Facebook or WhatsApp.</div>
              {/* Community bait sign map */}
              <div style={card}>
                <div style={lbl}>Community Bait Sign Map</div>
                <div style={{fontSize:12,color:textLight,marginBottom:10,lineHeight:1.6}}>
                  {baitReports.length > 0 ? baitReports.length + " bait sign" + (baitReports.length > 1 ? "s" : "") + " reported by the community." : "No reports yet. Be the first to report a bait sign."}
                </div>
                {baitReports.length > 0 && (function() {
                  var W = 300; var H = 180;
                  var minLat = -43.5; var maxLat = -10.5;
                  var minLng = 113.0; var maxLng = 153.5;
                  function toX(lng) { return ((lng - minLng) / (maxLng - minLng)) * W; }
                  function toY(lat) { return ((maxLat - lat) / (maxLat - minLat)) * H; }
                  return (
                    <div style={{borderRadius:10,overflow:"hidden",border:"1px solid "+border}}>
                      <svg width="100%" viewBox={"0 0 " + W + " " + H} style={{display:"block",background:"#e8f4f0"}}>
                        <rect width={W} height={H} fill="#d4eae5"/>
                        <text x={W/2} y={H/2 - 10} textAnchor="middle" fill="#a0c8c0" fontSize="11" fontFamily="system-ui">Australia</text>
                        {baitReports.map(function(r, i) {
                          var x = toX(r.lng);
                          var y = toY(r.lat);
                          if (x < 0 || x > W || y < 0 || y > H) return null;
                          return (
                            <g key={i}>
                              <circle cx={x} cy={y} r="7" fill="#e74c3c" opacity="0.85" stroke="white" strokeWidth="1.5"/>
                              <text x={x} y={y+4} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">!</text>
                            </g>
                          );
                        })}
                      </svg>
                      <div style={{padding:"8px 12px",background:"#f5fafa",display:"flex",flexDirection:"column",gap:6,maxHeight:120,overflowY:"auto"}}>
                        {baitReports.map(function(r, i) {
                          return (
                            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",paddingBottom:i<baitReports.length-1?6:0,borderBottom:i<baitReports.length-1?"1px solid "+border:"none"}}>
                              <span style={{fontSize:14}}>📍</span>
                              <div style={{flex:1}}>
                                <div style={{fontSize:12,fontWeight:"600",color:textMain}}>{r.place}</div>
                                <div style={{fontSize:10,color:textLight}}>{r.time}</div>
                                {r.note&&<div style={{fontSize:11,color:textSub,fontStyle:"italic",marginTop:1}}>{r.note}</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {!location ? (
                <div style={{...card,background:"#e0faf7",border:"1px solid #a0ddd5"}}>
                  <div style={{fontSize:13,color:"#00796b",lineHeight:1.7,marginBottom:10}}>You need to check your location first before reporting a bait sign.</div>
                  <Btn primary onClick={function(){setScreen("disclaimer");}}>📍 Check My Location First</Btn>
                </div>
              ) : (
                <>
                  <div style={card}>
                    <div style={{fontSize:10,color:textLight,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:6}}>Your Current Location</div>
                    <div style={{fontSize:14,fontWeight:"600",color:textMain}}>{placeName || assessment && assessment.region || "Location detected"}</div>
                    <div style={{fontSize:11,color:textLight,fontFamily:"monospace",marginTop:2}}>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</div>
                  </div>
                  <div style={card}>
                    <div style={{fontSize:10,color:textLight,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:6}}>Add a Note (optional)</div>
                    <input value={reportNote} onChange={function(e){setReportNote(e.target.value);}} placeholder="e.g. Sign on fence at property entrance, north of highway" style={{width:"100%",padding:"11px 12px",borderRadius:10,border:"1.5px solid "+border,fontSize:13,color:textMain,background:bg,outline:"none",fontFamily:"system-ui"}}/>
                  </div>
                  <Btn primary onClick={reportBait}>{reportSubmitted?"✓ Reported!":"📍 Report Bait Sign"}</Btn>
                  {baitReports.length > 0 && (
                    <div style={card}>
                      <div style={{fontSize:10,color:textLight,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10}}>Your Recent Reports ({baitReports.length})</div>
                      {baitReports.slice(0,5).map(function(r,i){
                        return(
                          <div key={i} style={{paddingBottom:i<Math.min(baitReports.length,5)-1?10:0,marginBottom:i<Math.min(baitReports.length,5)-1?10:0,borderBottom:i<Math.min(baitReports.length,5)-1?"1px solid "+border:"none"}}>
                            <div style={{fontSize:13,fontWeight:"600",color:textMain}}>{r.place}</div>
                            <div style={{fontSize:11,color:textLight,marginTop:2}}>{r.time}</div>
                            {r.note&&<div style={{fontSize:12,color:textSub,marginTop:2,fontStyle:"italic"}}>{r.note}</div>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
              <Btn onClick={function(){setScreen("home");}}>← Back</Btn>
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

      {/* HAZARDS HUB */}
      {screen === "hazards" && (
        <div className="fu" style={{ padding: "20px 16px 48px" }}>
          <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 22, fontWeight: "900", color: textMain }}>⚠️ Pet <span style={{ color: accent }}>Hazards</span></div>
            <div style={{ fontSize: 13, color: textLight, lineHeight: 1.6 }}>These hazards kill Australian dogs every year. Tap each one to learn the signs, first aid and how to stay safe.</div>
            <button onClick={function() { setScreen("canetoad"); }} style={{ ...card, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left", width: "100%", borderLeft: "4px solid #e67e22" }}>
              <div style={{ fontSize: 40 }}>🐸</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: "800", color: textMain }}>Cane Toads</div>
                <div style={{ fontSize: 12, color: textLight, marginTop: 2 }}>QLD, NT, northern NSW and WA</div>
                <div style={{ marginTop: 6 }}><span style={{ fontSize: 10, fontWeight: "700", padding: "2px 8px", borderRadius: 10, background: "#e67e2220", color: "#e67e22", border: "1px solid #e67e2240" }}>HIGH RISK</span></div>
              </div>
              <div style={{ fontSize: 20, color: textLight }}>›</div>
            </button>
            <button onClick={function() { setScreen("seaanimals"); }} style={{ ...card, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left", width: "100%", borderLeft: "4px solid #8e44ad" }}>
              <div style={{ fontSize: 40 }}>🐌</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: "800", color: textMain }}>Sea Animals</div>
                <div style={{ fontSize: 12, color: textLight, marginTop: 2 }}>Sea hares · Jellyfish · Coastal hazards</div>
                <div style={{ marginTop: 6 }}><span style={{ fontSize: 10, fontWeight: "700", padding: "2px 8px", borderRadius: 10, background: "#8e44ad20", color: "#8e44ad", border: "1px solid #8e44ad40" }}>HIGH RISK</span></div>
              </div>
              <div style={{ fontSize: 20, color: textLight }}>›</div>
            </button>
            <button onClick={function() { setSelectedHazard(HAZARDS.find(function(h) { return h.id === "algae"; })); setScreen("hazarddetail"); }} style={{ ...card, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left", width: "100%", borderLeft: "4px solid #27ae60" }}>
              <div style={{ fontSize: 40 }}>🟢</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: "800", color: textMain }}>Blue-Green Algae</div>
                <div style={{ fontSize: 12, color: textLight, marginTop: 2 }}>Freshwater lakes, rivers and dams</div>
                <div style={{ marginTop: 6 }}><span style={{ fontSize: 10, fontWeight: "700", padding: "2px 8px", borderRadius: 10, background: "#c0392b20", color: "#c0392b", border: "1px solid #c0392b40" }}>EXTREME RISK</span></div>
              </div>
              <div style={{ fontSize: 20, color: textLight }}>›</div>
            </button>
            <div style={{ ...card, background: "#e0f5f3", border: "1px solid " + accent + "40" }}>
              <div style={{ fontSize: 12, color: "#00796b", lineHeight: 1.7 }}>
                🚨 <strong>Animal Poisons Helpline</strong> — free 24/7 for any hazard.<br />
                <a href="tel:1300869738" style={{ color: accent, fontWeight: "700", fontSize: 15 }}>1300 869 738</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CANE TOAD SCREEN */}
      {screen === "canetoad" && (
        <div className="fu" style={{ padding: "20px 16px 48px" }}>
          <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
            <button onClick={function() { setScreen("hazards"); }} style={{ background: "none", border: "none", color: accent, cursor: "pointer", fontSize: 14, fontWeight: "700", textAlign: "left", padding: 0 }}>← Back to Hazards</button>
            <div style={{ fontSize: 22, fontWeight: "900", color: textMain }}>🐸 Cane <span style={{ color: accent }}>Toads</span></div>
            <div style={{ ...card, background: "#fff3e0", border: "1.5px solid #e67e22" }}>
              <div style={{ fontSize: 13, fontWeight: "800", color: "#e65100", marginBottom: 4 }}>⚠️ HIGH RISK — Can kill a dog in 15 minutes</div>
              <div style={{ fontSize: 12, color: "#7a3800", lineHeight: 1.6 }}>Found across QLD, NT, northern NSW and parts of WA. Most active at night and after rain.</div>
            </div>
            {[
              { title: "Where Found", icon: "📍", body: "Queensland, Northern Territory, northern NSW and parts of northern WA. Common near water, gardens, compost heaps and outdoor lights at night. Expanding southward every year." },
              { title: "What They Look Like", icon: "👁️", body: "Large warty brown toad, 10-23cm long. Distinctive large bulging shoulder glands (parotid glands) behind the eyes — these contain the poison. Much larger than native frogs. They sit rather than hop. Do not confuse with native frogs." },
              { title: "Why They're Dangerous", icon: "☠️", body: "The parotid glands produce a milky white venom (bufotoxin) when the toad is bitten, licked or squeezed. Even brief mouth contact can cause rapid and severe poisoning. Dogs that pick up or mouth a cane toad can die within 15 minutes without treatment." },
              { title: "Symptoms", icon: "🚨", body: "Excessive drooling and foaming at the mouth · Pawing at mouth · Bright red or inflamed gums · Head shaking · Vomiting · Disorientation and wobbling · Seizures and muscle spasms · Collapse and heart failure" },
            ].map(function(s, i) {
              return <div key={i} style={card}>
                <div style={{ fontSize: 11, fontWeight: "800", color: accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{s.icon} {s.title}</div>
                <div style={{ fontSize: 13, color: textSub, lineHeight: 1.7 }}>{s.body}</div>
              </div>;
            })}
            <div style={{ ...card, background: "#fff8e1", border: "1px solid #ffe082" }}>
              <div style={{ fontSize: 11, fontWeight: "800", color: "#e65100", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>🚨 First Aid Steps</div>
              {["Wipe inside of mouth and gums firmly with a damp cloth — wipe outward not inward, removing as much toxin as possible", "Rinse mouth with water from a hose for 10 minutes if your dog will allow — aim water to flow OUT of the mouth not down the throat", "Call Animal Poisons Helpline 1300 869 738 immediately", "Drive to the nearest vet immediately — this is a genuine emergency, do not wait", "Keep your dog calm and as cool as possible during transport", "Do not let your dog eat or drink anything else"].map(function(s, i) {
                return <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#e65100", color: "white", fontSize: 11, fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i+1}</div>
                  <div style={{ fontSize: 13, color: "#7a3800", lineHeight: 1.6 }}>{s}</div>
                </div>;
              })}
            </div>
            <div style={{ ...card, background: "#e0f5f3", border: "1px solid " + accent + "40" }}>
              <div style={{ fontSize: 11, fontWeight: "800", color: accent, marginBottom: 6 }}>💡 Prevention Tips</div>
              <div style={{ fontSize: 13, color: textSub, lineHeight: 1.7 }}>In QLD and NT keep dogs inside or supervised after dark. Check your yard before letting dogs out at night — use a torch. Never let dogs play with or mouth toads. Consider muzzling dogs at night in high cane toad areas. Remove anything from yard that attracts toads — pet food bowls, water, compost. Teach your dog "leave it" — can be lifesaving.</div>
            </div>
            <a href="tel:1300869738" style={{ display: "block", background: "#c0392b", color: "white", textAlign: "center", padding: "14px", borderRadius: 10, fontSize: 16, fontWeight: "800", textDecoration: "none" }}>📞 Emergency: 1300 869 738</a>
          </div>
        </div>
      )}

      {/* SEA ANIMALS SCREEN */}
      {screen === "seaanimals" && (
        <div className="fu" style={{ padding: "20px 16px 48px" }}>
          <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
            <button onClick={function() { setScreen("hazards"); }} style={{ background: "none", border: "none", color: accent, cursor: "pointer", fontSize: 14, fontWeight: "700", textAlign: "left", padding: 0 }}>← Back to Hazards</button>
            <div style={{ fontSize: 22, fontWeight: "900", color: textMain }}>🐌 Sea <span style={{ color: accent }}>Animals</span></div>
            <div style={{ ...card, background: "#f3e5f5", border: "1.5px solid #8e44ad" }}>
              <div style={{ fontSize: 13, fontWeight: "800", color: "#6a1b9a", marginBottom: 4 }}>⚠️ HIGH RISK — Sea hares can kill dogs rapidly</div>
              <div style={{ fontSize: 12, color: "#4a148c", lineHeight: 1.6 }}>Sea hares wash up on Australian beaches in summer. Even a quick lick can cause severe poisoning. Keep dogs on lead near beaches.</div>
            </div>
            <div style={{ ...card, borderLeft: "4px solid #8e44ad" }}>
              <div style={{ fontSize: 14, fontWeight: "900", color: textMain, marginBottom: 10 }}>🐌 Sea Hares</div>
              {[
                { title: "Where Found", body: "Coastal beaches Australia-wide. Most common in WA, NSW, VIC and SA coasts. Mass beaching events happen in summer when thousands wash ashore at once at the end of their breeding cycle." },
                { title: "What They Look Like", body: "Large soft sea slug, 10-30cm long. Soft rounded body with ear-like tentacles on the head. Can be brown, grey, green or purple. Often have large wing-like flaps. Squirt pink or purple ink when threatened — this ink is also toxic." },
                { title: "Why Dangerous", body: "Toxins are found in their skin, slime and ink which they absorb from algae they eat. Even a quick lick or brief contact can cause severe poisoning. There have been documented cases of dogs dying after just playing with a sea hare on the beach." },
                { title: "Symptoms", body: "Excessive drooling and foaming · Vomiting · Muscle tremors and shaking · Seizures and convulsions · Loss of coordination · Collapse · Respiratory failure" },
              ].map(function(s, i) {
                return <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: "800", color: "#8e44ad", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: textSub, lineHeight: 1.7 }}>{s.body}</div>
                </div>;
              })}
            </div>
            <div style={{ ...card, background: "#fff8e1", border: "1px solid #ffe082" }}>
              <div style={{ fontSize: 11, fontWeight: "800", color: "#e65100", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>🚨 Sea Hare First Aid</div>
              {["Remove your dog from the beach immediately", "Rinse mouth with fresh water if safe to do so", "Call Animal Poisons Helpline 1300 869 738 immediately", "Drive to nearest vet — do not wait for symptoms to appear", "Note the time of contact and describe the animal to the vet", "Do NOT induce vomiting unless specifically instructed by the vet or helpline"].map(function(s, i) {
                return <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#8e44ad", color: "white", fontSize: 11, fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i+1}</div>
                  <div style={{ fontSize: 13, color: "#4a148c", lineHeight: 1.6 }}>{s}</div>
                </div>;
              })}
            </div>
            <div style={{ ...card, background: "#e0f5f3", border: "1px solid " + accent + "40" }}>
              <div style={{ fontSize: 11, fontWeight: "800", color: accent, marginBottom: 6 }}>💡 Prevention Tips</div>
              <div style={{ fontSize: 13, color: textSub, lineHeight: 1.7 }}>Keep dogs on lead near beaches in summer. If you see a mass beaching event — thousands of slug-like creatures on the sand — leave immediately and keep dogs away. Report to Animal Poisons Helpline so they can alert other pet owners in the area. Check local council beach reports before visiting coastal areas in summer.</div>
            </div>
            <a href="tel:1300869738" style={{ display: "block", background: "#c0392b", color: "white", textAlign: "center", padding: "14px", borderRadius: 10, fontSize: 16, fontWeight: "800", textDecoration: "none" }}>📞 Emergency: 1300 869 738</a>
          </div>
        </div>
      )}

      {/* HAZARD DETAIL — Blue-Green Algae */}
      {screen === "hazarddetail" && selectedHazard && (
        <div className="fu" style={{ padding: "20px 16px 48px" }}>
          <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
            <button onClick={function() { setSelectedHazard(null); setScreen("hazards"); }} style={{ background: "none", border: "none", color: accent, cursor: "pointer", fontSize: 14, fontWeight: "700", textAlign: "left", padding: 0 }}>← Back to Hazards</button>
            <div style={{ fontSize: 22, fontWeight: "900", color: textMain }}>{selectedHazard.icon} {selectedHazard.name}</div>
            <div style={{ ...card, borderLeft: "4px solid " + selectedHazard.color }}>
              <div style={{ fontSize: 11, color: textLight, fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Where Found</div>
              <div style={{ fontSize: 13, color: textSub, lineHeight: 1.6 }}>{selectedHazard.where}</div>
            </div>
            <div style={card}>
              <div style={{ fontSize: 11, color: textLight, fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Peak Season</div>
              <div style={{ fontSize: 13, color: textSub, lineHeight: 1.6 }}>{selectedHazard.season}</div>
            </div>
            <div style={card}>
              <div style={{ fontSize: 11, color: textLight, fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>What It Looks Like</div>
              <div style={{ fontSize: 13, color: textSub, lineHeight: 1.6 }}>{selectedHazard.appearance}</div>
            </div>
            <div style={card}>
              <div style={{ fontSize: 11, color: textLight, fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Why It Is Dangerous</div>
              <div style={{ fontSize: 13, color: textSub, lineHeight: 1.6 }}>{selectedHazard.danger}</div>
            </div>
            <div style={{ ...card, borderLeft: "4px solid #e74c3c" }}>
              <div style={{ fontSize: 11, fontWeight: "800", color: "#e74c3c", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>⚠️ Symptoms</div>
              {selectedHazard.symptoms.map(function(s, i) {
                return <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#e74c3c", marginTop: 5, flexShrink: 0 }} />
                  <div style={{ fontSize: 13, color: textSub, lineHeight: 1.5 }}>{s}</div>
                </div>;
              })}
            </div>
            <div style={{ ...card, background: "#fff8e1", border: "1px solid #ffe082" }}>
              <div style={{ fontSize: 11, fontWeight: "800", color: "#e65100", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>🚨 First Aid</div>
              {selectedHazard.firstAid.map(function(s, i) {
                return <div key={i} style={{ display: "flex", gap: 10, marginBottom: 7 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#e65100", color: "white", fontSize: 11, fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i+1}</div>
                  <div style={{ fontSize: 13, color: "#7a3800", lineHeight: 1.6 }}>{s}</div>
                </div>;
              })}
            </div>
            <div style={{ ...card, background: "#e0f5f3", border: "1px solid " + accent + "40" }}>
              <div style={{ fontSize: 11, fontWeight: "800", color: accent, marginBottom: 6 }}>💡 Prevention</div>
              <div style={{ fontSize: 13, color: textSub, lineHeight: 1.7 }}>{selectedHazard.tips}</div>
            </div>
            <a href="tel:1300869738" style={{ display: "block", background: "#c0392b", color: "white", textAlign: "center", padding: "14px", borderRadius: 10, fontSize: 16, fontWeight: "800", textDecoration: "none" }}>📞 Emergency: 1300 869 738</a>
          </div>
        </div>
      )}


      {/* PRO UPGRADE SCREEN */}
      {screen === "upgrade" && (
        <div className="fu" style={{ padding: "20px 16px 48px" }}>
          <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 22, fontWeight: "900", color: textMain }}>⭐ Safe Pets <span style={{ color: accent }}>Pro</span></div>
            <div style={{ ...card, background: "linear-gradient(135deg, " + accent + "15, " + accent + "05)", border: "2px solid " + accent }}>
              <div style={{ fontSize: 16, fontWeight: "900", color: accent, marginBottom: 4 }}>Upgrade to Pro</div>
              <div style={{ fontSize: 13, color: textSub, marginBottom: 16, lineHeight: 1.6 }}>For serious travellers and grey nomads who want full safety coverage for every trip.</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <button onClick={function() {
                  setIsPro(true);
                  try { localStorage.setItem("isPro", "true"); } catch {}
                  setScreen("home");
                  alert("Welcome to Pro! All features unlocked.");
                }} style={{ flex: 1, background: accent, color: "white", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: "800", cursor: "pointer" }}>
                  $2.99 / month
                </button>
                <button onClick={function() {
                  setIsPro(true);
                  try { localStorage.setItem("isPro", "true"); } catch {}
                  setScreen("home");
                  alert("Welcome to Pro! All features unlocked.");
                }} style={{ flex: 1, background: "#0d1117", color: "white", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: "800", cursor: "pointer" }}>
                  $19.99 / year
                </button>
              </div>
              <div style={{ fontSize: 10, color: textLight, textAlign: "center" }}>Best value — save 44% with annual plan</div>
            </div>
            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: "800", color: textMain, marginBottom: 10 }}>Pro includes everything in Free plus:</div>
              {[
                ["🔍", "AI Area Search", "Type any Australian location — get a full risk briefing, nearest vets, campsites and snake risk before you leave home"],
                ["🏕️", "Full Campsite Database", "All 118+ campsite safety ratings with dog policies, nearest town and remoteness ratings"],
                ["🗺️", "Offline Risk Maps", "Download risk zone maps for areas with no signal"],
                ["🔔", "Risk Zone Alerts", "Push notifications when you enter HIGH or EXTREME risk areas"],
                ["📄", "Trip Safety Report", "Export a PDF safety report for your trip"],
                ["🌦️", "Seasonal Overlays", "See how the current season affects risk in your area"],
              ].map(function(f, i) {
                return <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 20, flexShrink: 0 }}>{f[0]}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: "700", color: textMain }}>{f[1]}</div>
                    <div style={{ fontSize: 12, color: textLight, lineHeight: 1.5 }}>{f[2]}</div>
                  </div>
                </div>;
              })}
            </div>
            <Btn onClick={function() { setScreen("home"); }}>← Maybe later</Btn>
          </div>
        </div>
      )}

      {/* AREA SEARCH SCREEN — Pro feature */}
      {screen === "areasearch" && (
        <div className="fu" style={{ padding: "20px 16px 48px" }}>
          <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 22, fontWeight: "900", color: textMain }}>🔍 Area <span style={{ color: accent }}>Search</span></div>
            {!isPro ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ ...card, background: accent + "10", border: "2px solid " + accent, textAlign: "center", padding: 24 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>⭐</div>
                  <div style={{ fontSize: 17, fontWeight: "900", color: textMain, marginBottom: 8 }}>Pro Feature</div>
                  <div style={{ fontSize: 13, color: textSub, lineHeight: 1.7, marginBottom: 16 }}>
                    Area Search lets you research any Australian location before you leave home. Get a full AI-generated safety briefing — 1080 risk rating, baiting programs, nearest vets, campsites and snake risk.
                  </div>
                  <Btn primary onClick={function() { setScreen("upgrade"); }}>Upgrade to Pro — from $2.99/mo</Btn>
                </div>
                <Btn onClick={function() { setScreen("home"); }}>← Back</Btn>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ ...card }}>
                  <div style={{ fontSize: 13, color: textLight, marginBottom: 10, lineHeight: 1.6 }}>Type any Australian town, national park, station, or region to get a full safety briefing before your trip.</div>
                  <input
                    value={areaSearch}
                    onChange={function(e) { setAreaSearch(e.target.value); }}
                    placeholder="e.g. Karijini NP, Broken Hill, Gibb River Road..."
                    style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1.5px solid " + border, fontSize: 14, color: textMain, background: bg, outline: "none", marginBottom: 10 }}
                  />
                  <Btn primary onClick={function() {
                    if (!areaSearch.trim()) return;
                    setAreaLoading(true);
                    setAreaResult(null);
                    fetch("https://api.anthropic.com/v1/messages", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        model: "claude-sonnet-4-20250514",
                        max_tokens: 1000,
                        messages: [{
                          role: "user",
                          content: "You are Safe Pets Australia, a pet safety app for Australian dog owners. Give a safety briefing for travelling with a dog to: " + areaSearch + ". Include: (1) 1080 bait risk rating (LOW/MODERATE/HIGH/EXTREME) with explanation of what programs operate there, (2) best time of year to visit regarding bait risk, (3) snake risk level and species to watch for, (4) any other hazards (sea hares, blue-green algae, cane toads if relevant), (5) practical tips for keeping dogs safe there. Be specific, accurate and practical. Format with clear sections. Keep it concise but useful."
                        }]
                      })
                    }).then(function(r) { return r.json(); }).then(function(d) {
                      var text = d.content && d.content[0] && d.content[0].text;
                      setAreaResult(text || "Unable to get results. Please try again.");
                      setAreaLoading(false);
                    }).catch(function() {
                      setAreaResult("Unable to connect. Please check your connection and try again.");
                      setAreaLoading(false);
                    });
                  }}>
                    {areaLoading ? "Searching..." : "🔍 Get Safety Briefing"}
                  </Btn>
                </div>
                {areaLoading && (
                  <div style={{ ...card, textAlign: "center", padding: 24 }}>
                    <div style={{ fontSize: 13, color: textLight }}>Generating safety briefing for {areaSearch}...</div>
                  </div>
                )}
                {areaResult && !areaLoading && (
                  <div style={card}>
                    <div style={{ fontSize: 11, fontWeight: "800", color: accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Safety Briefing — {areaSearch}</div>
                    <div style={{ fontSize: 13, color: textSub, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{areaResult}</div>
                  </div>
                )}
                <Btn onClick={function() { setScreen("home"); }}>← Back</Btn>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOTTOM NAV — show on main screens */}
      {["home","symptom","firstaid","saved","more","snakes","snakeid","snakefirstaid","report","hazards","upgrade","areasearch","canetoad","seaanimals"].includes(screen) && <NavBar />}
    </div>
  );
}
