// Safe Pets Australia — Snake Data
export const SNAKE_REGIONS = [
  { name: "Eastern Australia (Coast)", states: ["NSW","QLD","VIC"], risk: "EXTREME", season: "Sep-Apr", species: ["Eastern Brown","Red-bellied Black","Tiger Snake","Death Adder"], notes: "Highest snake density in Australia. Eastern Brown responsible for most dog fatalities nationally. Peak activity spring through summer. Keep dogs on lead in all bushland." },
  { name: "Queensland (North & Tropical)", states: ["QLD"], risk: "EXTREME", season: "Year-round", species: ["Coastal Taipan","Eastern Brown","Death Adder","Rough-scaled Snake"], notes: "Year-round risk due to tropical climate. Coastal Taipan is the most venomous land snake in the world. Highly active near water and long grass. No cool season to reduce activity." },
  { name: "Western Australia", states: ["WA"], risk: "HIGH", season: "Sep-Apr", species: ["Dugite","Tiger Snake","Western Brown","Mulga Snake"], notes: "Dugite is WA most dangerous snake and very common in suburban and rural areas. Mulga Snake (King Brown) has the largest venom yield of any Australian snake." },
  { name: "Northern Territory", states: ["NT"], risk: "EXTREME", season: "Year-round", species: ["Inland Taipan","King Brown","Death Adder","Western Brown"], notes: "NT has some of the world most venomous snakes. Inland Taipan has the most toxic venom of any land snake on earth. High year-round activity in warm tropical climate." },
  { name: "South Australia", states: ["SA"], risk: "HIGH", season: "Oct-Mar", species: ["Eastern Brown","Tiger Snake","Western Brown","Death Adder"], notes: "Eastern Brown extremely common across SA. Tiger snakes prevalent in Flinders Ranges and coastal areas. Peak summer risk. Cooler months lower but not zero risk." },
  { name: "Victoria", states: ["VIC"], risk: "HIGH", season: "Oct-Apr", species: ["Eastern Brown","Tiger Snake","Lowland Copperhead","Red-bellied Black"], notes: "Tiger snakes prolific in Alpine regions and coastal wetlands. Eastern Brown common in agricultural areas. Copperhead snakes active even in cool weather." },
  { name: "Tasmania", states: ["TAS"], risk: "MODERATE", season: "Nov-Mar", species: ["Tiger Snake","Lowland Copperhead","White-lipped Snake"], notes: "Only three snake species but Tiger Snake is very common and aggressive when threatened. Short but active summer season. No Eastern Brown in Tasmania." },
  { name: "Australian Capital Territory", states: ["ACT"], risk: "MODERATE", season: "Oct-Mar", species: ["Eastern Brown","Red-bellied Black","Tiger Snake"], notes: "Moderate risk around bushland and waterways. Eastern Brown active in warmer months around Canberra suburbs and surrounding farmland." },
];
 
export const SNAKE_SPECIES = [
  {
    name: "Eastern Brown Snake",
    scientific: "Pseudonaja textilis",
    danger: "EXTREME",
    color: "#c0392b",
    length: "Up to 2m",
    found: "Eastern and central Australia",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Eastern_Brown_Snake.jpg/320px-Eastern_Brown_Snake.jpg",
    appearance: "Slender, brown to near-black body, cream or yellow belly. Head barely distinct from neck. Highly variable colour — can be uniform brown, banded or almost black.",
    behaviour: "Extremely fast and aggressive when threatened. Will chase if cornered. Holds ground and strikes repeatedly. Active during day especially in warm weather.",
    dogRisk: "Most common cause of snake bite death in Australian dogs. Venom causes rapid blood clotting failure. Fatal within 1 hour without treatment. Even small doses can kill a large dog."
  },
  {
    name: "Inland Taipan",
    scientific: "Oxyuranus microlepidotus",
    danger: "EXTREME",
    color: "#c0392b",
    length: "Up to 1.8m",
    found: "Remote outback QLD and SA",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Oxyuranus_microlepidotus.jpg/320px-Oxyuranus_microlepidotus.jpg",
    appearance: "Light brown to olive green, darkening in winter. Rounded head. Relatively slender body.",
    behaviour: "Generally shy and avoids confrontation. Rarely encountered due to remote habitat. Will strike rapidly if cornered or handled.",
    dogRisk: "Most toxic venom of any land snake on earth — one bite contains enough venom to kill 100 humans. Rarely encountered but any contact is potentially fatal."
  },
  {
    name: "Coastal Taipan",
    scientific: "Oxyuranus scutellatus",
    danger: "EXTREME",
    color: "#c0392b",
    length: "Up to 2.9m",
    found: "Northern coastal Australia and QLD",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Oxyuranus_scutellatus.jpg/320px-Oxyuranus_scutellatus.jpg",
    appearance: "Light to dark brown above, cream or yellow belly. Rectangular head distinct from neck. Large eyes.",
    behaviour: "Extremely fast and aggressive. Will actively defend itself. One of Australia most dangerous and unpredictable snakes.",
    dogRisk: "Third most venomous land snake in the world. Venom causes paralysis and clotting disorders. Fatal to dogs very rapidly — get to a vet immediately."
  },
  {
    name: "Tiger Snake",
    scientific: "Notechis scutatus",
    danger: "EXTREME",
    color: "#c0392b",
    length: "Up to 1.5m",
    found: "Southern Australia, Tasmania, coastal areas",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Tiger_snake.jpg/320px-Tiger_snake.jpg",
    appearance: "Banded yellow and dark brown or olive. Broad flat head. Stocky body. Distinctive banding pattern though can be uniform in some areas.",
    behaviour: "Aggressive when threatened. Flattens body and hisses loudly as warning. Strikes quickly. Active in cooler conditions than most snakes.",
    dogRisk: "Responsible for many dog deaths in southern Australia. Venom causes paralysis, blood clotting failure and muscle damage. Very common in coastal wetlands where dogs swim."
  },
  {
    name: "Red-bellied Black Snake",
    scientific: "Pseudechis porphyriacus",
    danger: "HIGH",
    color: "#e74c3c",
    length: "Up to 2m",
    found: "Eastern Australia near water",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Red-bellied_black_snake.jpg/320px-Red-bellied_black_snake.jpg",
    appearance: "Glossy black above, bright red or pink belly visible along lower sides. Moderately robust body. Distinctive and unmistakable coloring.",
    behaviour: "Less aggressive than brown snakes. Usually retreats if given opportunity. Will defend if cornered. Common near creeks and dams — dogs at risk when swimming.",
    dogRisk: "Common cause of snake bite in dogs near waterways. Venom causes muscle damage, kidney failure and blood disorders. Rarely fatal to humans but can be fatal to dogs — always treat as emergency."
  },
  {
    name: "King Brown (Mulga Snake)",
    scientific: "Pseudechis australis",
    danger: "HIGH",
    color: "#e74c3c",
    length: "Up to 2.5m",
    found: "Most of Australia except southeast coast and Tasmania",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Pseudechis_australis.jpg/320px-Pseudechis_australis.jpg",
    appearance: "Brown to reddish-brown above, cream or orange belly. Large robust body. Broad head. Despite the name, belongs to black snake family not brown snake family.",
    behaviour: "Not particularly aggressive but will defend vigorously when cornered. Very large and powerful. Active at night in hot weather.",
    dogRisk: "Produces more venom per bite than any other Australian snake. Venom causes severe muscle breakdown and kidney failure. Fatal without antivenom. Common across outback Australia."
  },
  {
    name: "Death Adder",
    scientific: "Acanthophis antarcticus",
    danger: "EXTREME",
    color: "#c0392b",
    length: "Up to 1m",
    found: "Most of Australia except southeast Victoria and Tasmania",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/DeathAdder.jpg/320px-DeathAdder.jpg",
    appearance: "Triangular head, stocky body with narrow neck, thin rat-like tail tip. Banded brown, grey or reddish. Often partially buried in leaf litter.",
    behaviour: "Ambush predator — lies motionless and camouflaged waiting for prey. Will not move when approached which means dogs often step on or near them. Fastest strike of any Australian snake.",
    dogRisk: "Causes rapid paralysis — symptoms appear within 1-6 hours. Extremely easy to accidentally step on due to camouflage. Dogs are very vulnerable. Without antivenom death follows rapidly from respiratory failure."
  },
  {
    name: "Dugite",
    scientific: "Pseudonaja affinis",
    danger: "HIGH",
    color: "#e74c3c",
    length: "Up to 1.5m",
    found: "Western Australia",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Dugite.jpg/320px-Dugite.jpg",
    appearance: "Olive to dark brown above, pale belly. Similar in appearance to Eastern Brown. Head barely distinct from neck.",
    behaviour: "Aggressive when threatened. WA most dangerous snake in suburban areas. Very common in Perth suburbs, farmland and coastal areas.",
    dogRisk: "Most common cause of snake bite in WA dogs. Venom causes blood clotting failure same as Eastern Brown. Fatal without treatment. Extremely common across southwestern WA."
  },
  {
    name: "Copperhead Snake",
    scientific: "Austrelaps superbus",
    danger: "HIGH",
    color: "#e74c3c",
    length: "Up to 1.5m",
    found: "Southeast Australia and Tasmania",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Lowland_copperhead.jpg/320px-Lowland_copperhead.jpg",
    appearance: "Copper-brown to dark brown or almost black. Pale belly. Broad flat head. Copper coloring on the sides of the head.",
    behaviour: "Active in cooler temperatures than most snakes — remains active at lower temperatures than other species. Found near wetlands and damp areas.",
    dogRisk: "Causes neurotoxic paralysis and blood clotting problems. Common in areas where dogs walk near wetlands and creeks. Fatal without treatment. Particularly common in Tasmania and alpine VIC."
  },
  {
    name: "Rough-scaled Snake",
    scientific: "Tropidechis carinatus",
    danger: "HIGH",
    color: "#e74c3c",
    length: "Up to 1m",
    found: "Eastern coastal Queensland and northern NSW",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Tropidechis_carinatus.jpg/320px-Tropidechis_carinatus.jpg",
    appearance: "Strongly keeled scales giving a rough texture. Olive to dark brown with darker banding. Broad head distinct from neck.",
    behaviour: "Highly aggressive when encountered. Strikes without much warning. Found in rainforest and wet forest — often encountered on walking tracks.",
    dogRisk: "Highly neurotoxic venom. Aggressive nature means dogs are frequently bitten. Rapidly fatal without antivenom. Relatively small but extremely dangerous."
  }
];
