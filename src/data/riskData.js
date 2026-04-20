// Safe Pets Australia — Risk & First Aid Data
export const RISK_REGIONS = [
  { name: "Western Australia (Southwest)", lat: -31.95, lng: 115.86, radius: 800, risk: "EXTREME", color: "#c0392b", notes: "WA uses more 1080 than any other state. ALL DBCA-managed parks must be treated as baited at all times — this includes every national park, nature reserve and state forest. The Western Shield program covers 3.8 million hectares from Karratha to Esperance. Two bait products are used: Probait (fox control, laid year-round) and Eradicat (feral cat control, laid when prey is scarce). Jarrah forest areas are baited 4-6 times per year aerially. Baiting peak in spring. High-risk specific sites: Kalbarri NP, Cape Arid NP, Dryandra Woodland, Perth Hills, Avon Valley NP, Swan Valley reserves. 1080 baits are extremely attractive to dogs — even well-trained dogs will take them. Do not let your dog roam off-lead anywhere in WA national parks or state forests." },
  { name: "Western Australia (Goldfields-Esperance)", lat: -30.75, lng: 121.47, radius: 700, risk: "EXTREME", color: "#c0392b", notes: "One of the most extensively baited regions in Australia. Vast pastoral stations conduct year-round wild dog and dingo baiting for livestock protection. Cape Arid NP east of Esperance is actively baited for fox and cat control. Treat all land — national park or pastoral — as potentially baited. Very limited vet access in this remote region." },
  { name: "Western Australia (Pilbara)", lat: -21.17, lng: 118.62, radius: 600, risk: "HIGH", color: "#e67e22", notes: "Pastoral wild dog and dingo baiting programs active across all station land. Karijini NP surrounds are baited by adjacent stations. DBCA winter aerial cat baiting program operates between Geraldton and Karratha corridor (commenced June 2025). Roads cross baited station land — do not let dogs roam at rest stops. Extremely remote with very limited vet access." },
  { name: "Western Australia (Kimberley)", lat: -17.66, lng: 128.73, radius: 600, risk: "HIGH", color: "#e67e22", notes: "Cattle station baiting for dingoes and wild dogs is active year-round. The Gibb River Road passes through multiple actively baited stations. Always confirm baiting status with station staff on arrival. El Questro, Home Valley and surrounding stations bait regularly. Purnululu (Bungle Bungles) surrounds are baited. Nearest vet often 300km+." },
  { name: "Queensland (Western Outback)", lat: -25.0, lng: 144.0, radius: 700, risk: "HIGH", color: "#e67e22", notes: "Two coordinated baiting programs per year across western QLD — targeting breeding adults in April or May and pups/juveniles in August or September. Channel Country (Diamantina region) is among the most extensively baited in Australia. Some councils bait 4 times per year. Neighbours within 1km notified 72 hours before baiting. No baits laid within 5km of towns. Treat all outback QLD pastoral land as potentially baited year-round." },
  { name: "Queensland (Southeast Hinterland)", lat: -27.5, lng: 152.7, radius: 250, risk: "MODERATE", color: "#d4930a", notes: "Coordinated wild dog baiting programs run twice yearly — autumn and spring — across Sunshine Coast, Scenic Rim and Darling Downs councils. Scenic Rim program runs September-October annually. Sunshine Coast spring program runs August-September. 1080 registered in QLD for wild dogs, feral pigs, feral cats, foxes and rabbits. National park buffer zones have periodic baiting." },
  { name: "Queensland (Darling Downs)", lat: -27.56, lng: 151.95, radius: 250, risk: "MODERATE", color: "#d4930a", notes: "Agricultural areas with coordinated council baiting programs. Toowoomba Regional Council runs baiting service 4 times per year. Wild dogs, foxes and feral pigs targeted. Neighbours within 1km must be notified 72 hours before baiting begins." },
  { name: "New South Wales (Western Plains)", lat: -31.5, lng: 146.0, radius: 600, risk: "HIGH", color: "#e67e22", notes: "Fox baiting in NSW is continuous and ongoing — peaking in late autumn and early winter to coincide with dingo and fox mating seasons. NSW runs a biannual aerial baiting program — in 2019 alone, 43,442 baits were dropped over nearly 8 million hectares in the Western Division. In addition 115,162 ground baits were used in the same region that year. NSW requires neighbours within 1km to be notified at least 72 hours before baiting. Warning signs must remain for a minimum of one month after the last bait was used. Treat all western NSW farmland as potentially baited year-round." },
  { name: "New South Wales (Snowy Mountains)", lat: -36.4, lng: 148.5, radius: 200, risk: "MODERATE", color: "#d4930a", notes: "NPWS conducts aerial and ground fox and wild dog baiting in alpine areas. When 1080 is used near alpine ski resorts it is intensified in winter when foxes move to resorts for food. Backcountry areas have active baiting programs — keep dogs on lead and check with NPWS before entering." },
  { name: "New South Wales (Tablelands)", lat: -33.5, lng: 149.5, radius: 300, risk: "MODERATE", color: "#d4930a", notes: "Central Tablelands farming areas have ongoing fox and wild dog baiting. Fox baiting is described as continuous and ongoing by NSW Government. Peak periods are late autumn and early winter. Dried meat baits can remain toxic for many months in dry conditions — old signs do not mean the risk has passed." },
  { name: "Victoria (High Country/East Gippsland)", lat: -36.9, lng: 147.0, radius: 350, risk: "HIGH", color: "#e67e22", notes: "DEECA runs large-scale 1080 ground baiting across eastern Victoria (Gippsland and Hume regions) from March to July annually. The 2026 program covers vast State Forests that are popular camping and hunting destinations. Aerial baiting conducted in spring and autumn at 6 sites in eastern VIC. Aerial baiting is NOT permitted in Victoria — ground baiting only. Most effective baiting times are autumn (mating season) and spring. Always check DEECA interactive baiting map before entering eastern VIC state forests with dogs." },
  { name: "Victoria (Mallee/Western)", lat: -35.0, lng: 142.0, radius: 300, risk: "MODERATE", color: "#d4930a", notes: "Fox and rabbit control baiting in Mallee and western Victorian farming regions. Parks Victoria runs fox baiting programs June-August annually in some areas. Ground baiting only — no aerial programs in VIC." },
  { name: "South Australia (Outback/Pastoral)", lat: -30.0, lng: 135.0, radius: 700, risk: "HIGH", color: "#e67e22", notes: "Widespread dingo and wild dog baiting across SA pastoral zones. SA baiting is best in spring, summer and autumn when wild dogs are most active but can occur year-round. Property must be at least 5 hectares to bait. Aerial baiting is NOT permitted in South Australia — ground baiting only. Cooper Creek, Innamincka and Channel Country surrounds are extensively baited. Extremely remote with very limited vet access." },
  { name: "South Australia (Agricultural South)", lat: -35.1, lng: 138.6, radius: 300, risk: "MODERATE", color: "#d4930a", notes: "Fox control programs in agricultural areas and national park edges. Landscape SA Boards coordinate baiting programs for landholders. Baiting most active in spring and autumn. Kangaroo Island has active predator control programs." },
  { name: "Northern Territory (Pastoral/Outback)", lat: -19.5, lng: 133.0, radius: 700, risk: "HIGH", color: "#e67e22", notes: "Dingo and wild dog baiting on cattle stations is extensive across NT. Aerial baiting IS permitted in NT. All pastoral station land should be treated as potentially baited. Kakadu surrounds, Katherine region and Daly River pastoral areas actively bait. Very remote — nearest vet often 200-300km." },
  { name: "Tasmania (Rural/Midlands)", lat: -41.8, lng: 146.5, radius: 300, risk: "LOW-MODERATE", color: "#7daa2d", notes: "IMPORTANT: Tasmania uses 1080 very differently to other states. It is NOT used for dingoes or foxes — it is used to control brushtail possums, Bennetts wallabies and pademelons which cause agricultural damage. Risk to dogs exists but is lower than mainland states. Secondary poisoning risk exists if dogs consume carcasses of poisoned animals. Some state forest areas adjacent to farmland have pest control programs. Generally one of the lower-risk states for travelling dog owners." },
];
 
export const LOW_RISK_ZONES = [
  { name: "Sydney", lat: -33.87, lng: 151.21, radius: 30 },
  { name: "Melbourne", lat: -37.81, lng: 144.96, radius: 30 },
  { name: "Brisbane", lat: -27.47, lng: 153.03, radius: 20 },
  { name: "Perth", lat: -31.95, lng: 115.86, radius: 25 },
  { name: "Adelaide", lat: -34.93, lng: 138.6, radius: 20 },
  { name: "Hobart", lat: -42.88, lng: 147.33, radius: 15 },
  { name: "Darwin", lat: -12.46, lng: 130.84, radius: 15 },
  { name: "Canberra", lat: -35.28, lng: 149.13, radius: 15 },
];
 
export const SYMPTOM_STEPS = [
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
 
export const FIRST_AID = [
  { icon: "1", title: "Call immediately", body: "Phone the Animal Poisons Helpline now: 1300 869 738. Do not wait for symptoms to worsen. Tell them your location and what you think your dog ate." },
  { icon: "2", title: "Get to a vet", body: "Drive to the nearest vet immediately. There is no antidote for 1080. Early supportive care — controlling seizures, maintaining breathing — is the only treatment and every minute counts." },
  { icon: "3", title: "Do NOT induce vomiting", body: "Do not attempt to make your dog vomit unless specifically instructed by a vet or the poisons helpline. Incorrect induction can make things worse." },
  { icon: "4", title: "Keep your dog calm", body: "Keep your dog as still and calm as possible. Excitement or movement can accelerate the spread of the toxin. Wrap them in a blanket and speak calmly." },
  { icon: "5", title: "Collect evidence", body: "If you can safely do so, take a photo of the bait or collect a small sample in a bag. This helps the vet identify the exact toxin and dose." },
  { icon: "6", title: "Watch for seizures", body: "If your dog has a seizure, move objects away to prevent injury. Time the seizure if you can. Do not put your hands near their mouth." },
  { icon: "7", title: "After treatment", body: "Even if your dog seems to recover, keep them quiet and rested for 48 hours. Delayed effects can occur. Follow up with your vet the next day." },
];
