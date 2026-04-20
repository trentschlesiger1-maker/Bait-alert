// Safe Pets Australia — Beach & Water Hazard Data
export const HAZARDS = [
  {
    id: "seahare",
    name: "Sea Hares",
    icon: "🐌",
    risk: "HIGH",
    color: "#8e44ad",
    where: "Coastal beaches Australia-wide. Most common in WA, NSW, VIC and SA coasts. Summer mass beaching events.",
    season: "Summer (Dec-Mar). Mass beachings occur at end of life cycle.",
    appearance: "Large soft sea slug 10-30cm. Soft rounded body with ear-like tentacles. Brown, grey, green or purple. Squirt pink or purple ink when threatened.",
    danger: "Toxins in skin, slime and ink absorbed from algae they eat. Even a quick lick can cause severe poisoning. Potentially fatal. Extremely attractive to curious dogs.",
    symptoms: ["Excessive drooling and foaming", "Vomiting", "Muscle tremors and shaking", "Seizures and convulsions", "Loss of coordination", "Collapse", "Respiratory failure"],
    firstAid: ["Remove dog from beach immediately", "Rinse mouth with fresh water if safe", "Call Animal Poisons Helpline 1300 869 738 immediately", "Drive to nearest vet — do not wait for symptoms", "Note time of contact and describe animal to vet", "Do NOT induce vomiting unless instructed by vet"],
    tips: "Keep dogs on lead near beaches in summer. If you see a mass beaching event leave immediately. Report to Animal Poisons Helpline so alerts can be issued to other pet owners in the area."
  },
  {
    id: "algae",
    name: "Blue-Green Algae",
    icon: "🟢",
    risk: "EXTREME",
    color: "#27ae60",
    where: "Freshwater lakes, ponds, rivers and dams Australia-wide. Most common in warm inland waterways. Any slow-moving or stagnant freshwater body.",
    season: "Peak late summer and autumn (Feb-May). Year-round in tropical north. Warm water and low rainfall triggers blooms.",
    appearance: "Looks like pea-green paint or slime on water surface. Can appear blue-green, green, brown or red. May smell bad. Forms thick mats near shoreline. Dead fish nearby is a warning sign.",
    danger: "Produces toxins (microcystins and anatoxins) causing severe liver damage and neurological damage. NO antidote. Death can occur within 15 minutes to 24 hours. Cannot tell toxic from non-toxic by looking.",
    symptoms: ["Vomiting and diarrhoea", "Weakness and lethargy", "Seizures", "Difficulty breathing", "Pale or yellow gums", "Collapse", "Death within hours in severe cases"],
    firstAid: ["Remove dog from water immediately", "Rinse thoroughly with clean fresh water — do not let dog lick fur", "Call vet immediately — do not wait for symptoms", "Call Animal Poisons Helpline 1300 869 738", "Time is critical — early treatment is the only chance", "Take a photo of the water if safe to do so"],
    tips: "Never let your dog drink from or swim in water that looks green, slimy or has surface scum. Always carry fresh water for your dog. Check local council websites for algae alerts before visiting lakes or dams."
  },
  {
    id: "canetoad",
    name: "Cane Toads",
    icon: "🐸",
    risk: "HIGH",
    color: "#e67e22",
    where: "Queensland, Northern Territory, northern NSW and parts of northern WA. Common near water, gardens, outdoor lights at night.",
    season: "Year-round in tropical north. Most active at night and after rain.",
    appearance: "Large warty brown toad 10-23cm. Large shoulder glands (parotid glands) behind eyes contain poison. Much larger than native frogs. Sit rather than hop.",
    danger: "Parotid glands produce milky white venom (bufotoxin) when toad is bitten, licked or squeezed. Brief mouth contact can cause rapid poisoning. Dogs can die within 15 minutes without treatment.",
    symptoms: ["Excessive drooling and foaming at mouth", "Pawing at mouth", "Red or inflamed gums", "Vomiting", "Disorientation and wobbliness", "Seizures", "Collapse and heart failure"],
    firstAid: ["Wipe inside of mouth and gums with damp cloth — wipe outward not inward", "Rinse mouth with water from hose for 10 minutes if dog will allow", "Call vet immediately — this is a genuine emergency", "Call Animal Poisons Helpline 1300 869 738", "Keep dog calm and cool", "Drive to vet immediately — do not wait"],
    tips: "In QLD and NT keep dogs inside or supervised after dark. Check yard before letting dogs out at night. Never let dogs play with toads. Consider muzzling dogs at night in high cane toad areas."
  }
];
