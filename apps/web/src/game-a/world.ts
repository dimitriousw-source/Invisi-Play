export type RegionId =
  | "insectoid"
  | "beast"
  | "reptile"
  | "aerie"
  | "tidewild"
  | "bloomwild";

export type ChampionModel =
  | "mantis"
  | "spider"
  | "pillbug"
  | "bear"
  | "wolf"
  | "ram"
  | "gecko"
  | "turtle"
  | "serpent"
  | "falcon"
  | "owl"
  | "songbird";

export interface AbilityDefinition {
  name: string;
  description: string;
}

export interface ChampionDefinition {
  id: string;
  regionId: RegionId;
  name: string;
  archetype: string;
  personality: string;
  description: string;
  model: ChampionModel;
  abilities: AbilityDefinition[];
  evolutionPaths: string[];
  palette: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface RegionDefinition {
  id: RegionId;
  name: string;
  subtitle: string;
  description: string;
  mood: string;
  landmarks: string[];
  unlocked: boolean;
  starterIds: string[];
  map: {
    x: number;
    y: number;
    scale: number;
  };
  relic: {
    name: string;
    description: string;
  };
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    sky: string;
    ground: string;
    path: string;
  };
}

export const CHAMPIONS: ChampionDefinition[] = [
  {
    id: "mantari",
    regionId: "insectoid",
    name: "Mantari",
    archetype: "Mantis Vanguard",
    personality: "Focused · fearless · precise",
    description:
      "A quick-striking hunter that turns timing and movement into devastating precision.",
    model: "mantis",
    abilities: [
      { name: "Blade Rush", description: "A fast two-part cutting strike." },
      { name: "Spring Leap", description: "Launch farther than most Champions." },
      { name: "Perfect Cut", description: "Rewards well-timed attacks with bonus force." },
    ],
    evolutionPaths: ["Tempest Blade", "Thorn Warden", "Sunpiercer"],
    palette: { primary: "#7ed957", secondary: "#365f37", accent: "#f2df72" },
  },
  {
    id: "silkryn",
    regionId: "insectoid",
    name: "Silkryn",
    archetype: "Web Weaver",
    personality: "Curious · clever · patient",
    description:
      "A nimble web-spinner built around traps, traversal, and turning the environment into an advantage.",
    model: "spider",
    abilities: [
      { name: "Silk Tether", description: "Latch onto distant anchors and objects." },
      { name: "Threadstep", description: "Move safely across narrow or unstable paths." },
      { name: "Snare", description: "Temporarily bind a target or mechanism." },
    ],
    evolutionPaths: ["Webrunner", "Night Weaver", "Crystal Spinner"],
    palette: { primary: "#9e78d8", secondary: "#45375f", accent: "#6fe7e0" },
  },
  {
    id: "rumbli",
    regionId: "insectoid",
    name: "Rumbli",
    archetype: "Rolling Guardian",
    personality: "Playful · loyal · stubborn",
    description:
      "A compact armored Champion that can curl, roll, protect, and smash through danger.",
    model: "pillbug",
    abilities: [
      { name: "Guard Curl", description: "Roll into a shell to absorb impact." },
      { name: "Rumble Roll", description: "Build speed and bowl through obstacles." },
      { name: "Shell Pulse", description: "Release stored impact in a short shockwave." },
    ],
    evolutionPaths: ["Iron Roller", "Moss Bastion", "Volcanic Core"],
    palette: { primary: "#63b6a6", secondary: "#294f4b", accent: "#f3a95d" },
  },
  {
    id: "bramblecub",
    regionId: "beast",
    name: "Bramblecub",
    archetype: "Forest Bruiser",
    personality: "Warm · brave · determined",
    description:
      "A young bear-like Champion with raw strength, protective instincts, and room to grow into a powerhouse.",
    model: "bear",
    abilities: [
      { name: "Paw Slam", description: "Strike the ground with heavy force." },
      { name: "Rootbreaker", description: "Move heavy natural obstacles." },
      { name: "Guardian Roar", description: "Briefly harden against incoming danger." },
    ],
    evolutionPaths: ["Mountain Heart", "Briar King", "Frostback"],
    palette: { primary: "#9a6b45", secondary: "#4e382c", accent: "#f3c76d" },
  },
  {
    id: "fleetpaw",
    regionId: "beast",
    name: "Fleetpaw",
    archetype: "Trail Runner",
    personality: "Bright · alert · adventurous",
    description:
      "A fox-wolf Champion that specializes in speed, tracking, evasive movement, and discovering hidden routes.",
    model: "wolf",
    abilities: [
      { name: "Trail Burst", description: "Accelerate into a short high-speed sprint." },
      { name: "Scentline", description: "Reveal nearby hidden trails and secrets." },
      { name: "Quickstep", description: "Dodge rapidly to either side." },
    ],
    evolutionPaths: ["Stormrunner", "Moon Tracker", "Emberfang"],
    palette: { primary: "#d97f4d", secondary: "#6d3f31", accent: "#f6e5ad" },
  },
  {
    id: "stonehorn",
    regionId: "beast",
    name: "Stonehorn",
    archetype: "Cliff Charger",
    personality: "Bold · steady · competitive",
    description:
      "A ram-like Champion built to charge, climb rough country, and crash through barriers.",
    model: "ram",
    abilities: [
      { name: "Horn Charge", description: "Rush forward and break weak barriers." },
      { name: "Cliff Grip", description: "Stay stable on steep and rugged terrain." },
      { name: "Rebound", description: "Turn blocked momentum into a counter-burst." },
    ],
    evolutionPaths: ["Granite Crown", "Thunder Ram", "Golden Ridge"],
    palette: { primary: "#8f918e", secondary: "#454946", accent: "#e8c77f" },
  },
  {
    id: "scalix",
    regionId: "reptile",
    name: "Scalix",
    archetype: "Wall Skitter",
    personality: "Mischievous · adaptable · quick",
    description:
      "A gecko-like Champion that thrives on vertical routes, clever grabs, and rapid repositioning.",
    model: "gecko",
    abilities: [
      { name: "Wall Cling", description: "Hold to special climbable surfaces." },
      { name: "Snap Tongue", description: "Grab switches, fruit, and light objects at range." },
      { name: "Sun Dash", description: "Burst forward after basking or standing still." },
    ],
    evolutionPaths: ["Prism Gecko", "Dune Skipper", "Cavern Gleam"],
    palette: { primary: "#67c98c", secondary: "#2f634f", accent: "#f0ce56" },
  },
  {
    id: "shelvora",
    regionId: "reptile",
    name: "Shelvora",
    archetype: "Ancient Shell",
    personality: "Calm · thoughtful · unshakeable",
    description:
      "A turtle-like Champion with unmatched defense and the strength to carry momentum through dangerous terrain.",
    model: "turtle",
    abilities: [
      { name: "Shell Guard", description: "Brace against hazards and heavy impacts." },
      { name: "Stone Push", description: "Move objects other Champions cannot." },
      { name: "Safe Passage", description: "Cross certain damaging surfaces safely." },
    ],
    evolutionPaths: ["Temple Shell", "River Fortress", "Magma Carapace"],
    palette: { primary: "#5c9a74", secondary: "#3f503a", accent: "#d6a65d" },
  },
  {
    id: "virel",
    regionId: "reptile",
    name: "Virel",
    archetype: "Coil Striker",
    personality: "Quiet · intense · observant",
    description:
      "A serpent Champion that uses reach, tight-space traversal, and sudden bursts of control.",
    model: "serpent",
    abilities: [
      { name: "Coil Lash", description: "Strike targets from farther away." },
      { name: "Slipway", description: "Move through narrow passages and low tunnels." },
      { name: "Stun Snap", description: "Interrupt certain enemies and mechanisms." },
    ],
    evolutionPaths: ["Stormcoil", "Glass Viper", "Jungle Crown"],
    palette: { primary: "#54a87a", secondary: "#234d3d", accent: "#d8eb63" },
  },
  {
    id: "aeri",
    regionId: "aerie",
    name: "Aeri",
    archetype: "Sky Diver",
    personality: "Proud · daring · focused",
    description:
      "A falcon-like Champion built around speed, gliding, and turning height into momentum.",
    model: "falcon",
    abilities: [
      { name: "Glide", description: "Stretch a jump into controlled air travel." },
      { name: "Dive Rush", description: "Convert height into a high-speed descent." },
      { name: "Updraft Sense", description: "Reveal nearby currents and lift points." },
    ],
    evolutionPaths: ["Sun Falcon", "Stormwing", "Cloud Lance"],
    palette: { primary: "#b77b4f", secondary: "#5c4232", accent: "#f1df9a" },
  },
  {
    id: "hushwing",
    regionId: "aerie",
    name: "Hushwing",
    archetype: "Night Seer",
    personality: "Gentle · wise · mysterious",
    description:
      "An owl-like Champion that uncovers hidden things, moves quietly, and reads what others miss.",
    model: "owl",
    abilities: [
      { name: "Spirit Sight", description: "Reveal hidden marks, paths, and echoes." },
      { name: "Silent Wing", description: "Move without disturbing certain creatures." },
      { name: "Moon Pulse", description: "Send out a short-range revealing wave." },
    ],
    evolutionPaths: ["Star Seer", "Moon Sentinel", "Echo Owl"],
    palette: { primary: "#9d91b8", secondary: "#4f4a63", accent: "#c9f0ef" },
  },
  {
    id: "peppik",
    regionId: "aerie",
    name: "Peppik",
    archetype: "Wind Singer",
    personality: "Cheerful · fearless · restless",
    description:
      "A tiny songbird Champion whose voice and agility can activate ancient sky mechanisms.",
    model: "songbird",
    abilities: [
      { name: "Chirp Burst", description: "Trigger resonant objects and wind devices." },
      { name: "Feather Dash", description: "Perform a quick aerial hop-dash." },
      { name: "Tailwind", description: "Temporarily move faster after chaining movement." },
    ],
    evolutionPaths: ["Aurora Singer", "Galecrest", "Spark Finch"],
    palette: { primary: "#4fa8d8", secondary: "#31576e", accent: "#f5cc62" },
  },
];

export const REGIONS: RegionDefinition[] = [
  {
    id: "insectoid",
    name: "Verdant Veil",
    subtitle: "Realm of the Insectoids",
    description:
      "Beneath enormous leaves and glowing canopy roots, insectoid clans have built bridges, hives, silk roads, and forgotten shrines.",
    mood: "Layered · luminous · clever",
    landmarks: ["Dewglass Grove", "Silkwood", "The Hollow Hive"],
    unlocked: true,
    starterIds: ["mantari", "silkryn", "rumbli"],
    map: { x: 26, y: 28, scale: 1.08 },
    relic: {
      name: "Dewheart Shard",
      description: "A living crystal that reacts to movement and brightens a Champion's markings.",
    },
    palette: {
      primary: "#65b95e",
      secondary: "#2d6844",
      accent: "#d8e86d",
      sky: "#183e45",
      ground: "#234b37",
      path: "#8d7650",
    },
  },
  {
    id: "beast",
    name: "Goldenwild",
    subtitle: "Realm of the Beasts",
    description:
      "Warm forests open into rolling grasslands, river valleys, ancient dens, and stone roads carved by generations of mammal-like guardians.",
    mood: "Warm · courageous · expansive",
    landmarks: ["Amber Meadow", "Howling Pass", "Oldroot Den"],
    unlocked: true,
    starterIds: ["bramblecub", "fleetpaw", "stonehorn"],
    map: { x: 57, y: 37, scale: 1.16 },
    relic: {
      name: "Heartwood Crest",
      description: "A relic of old growth that strengthens a Champion's connection to living terrain.",
    },
    palette: {
      primary: "#c9874f",
      secondary: "#704936",
      accent: "#efd06e",
      sky: "#3f6f82",
      ground: "#50623b",
      path: "#ae8a5c",
    },
  },
  {
    id: "reptile",
    name: "Sunscale Reach",
    subtitle: "Realm of the Reptiles",
    description:
      "Sun-baked mesas, jungle ruins, glowing caverns, and heat-split canyons hide some of the oldest pathways in the world.",
    mood: "Ancient · resilient · primal",
    landmarks: ["Glass Canyon", "Jade Steps", "Ember Hollow"],
    unlocked: true,
    starterIds: ["scalix", "shelvora", "virel"],
    map: { x: 72, y: 68, scale: 1.02 },
    relic: {
      name: "Sunscale Ember",
      description: "A warm mineral core that awakens heat-reactive markings and dormant strength.",
    },
    palette: {
      primary: "#d77943",
      secondary: "#7b4032",
      accent: "#f2c75b",
      sky: "#6d5360",
      ground: "#6a4a35",
      path: "#c29263",
    },
  },
  {
    id: "aerie",
    name: "High Aerie",
    subtitle: "Realm of the Winged",
    description:
      "Cloud forests, floating bridges, wind-carved cliffs, and sky temples rise above the rest of the map.",
    mood: "Free · bright · vertical",
    landmarks: ["Cloudstep", "Whisper Spires", "The First Nest"],
    unlocked: true,
    starterIds: ["aeri", "hushwing", "peppik"],
    map: { x: 43, y: 67, scale: 0.98 },
    relic: {
      name: "Skyglass Feather",
      description: "A feather-shaped crystal that stores wind and changes how a Champion moves through the air.",
    },
    palette: {
      primary: "#5fa7c8",
      secondary: "#45637d",
      accent: "#e9db8c",
      sky: "#5685a7",
      ground: "#64706a",
      path: "#b8a77d",
    },
  },
  {
    id: "tidewild",
    name: "Tidewild",
    subtitle: "Realm of Fins & Amphibians",
    description:
      "A future region of lagoons, mangroves, submerged ruins, reefs, and mist-covered wetlands.",
    mood: "Fluid · strange · hidden",
    landmarks: ["Moon Lagoon", "Reefgate", "Mirelight"],
    unlocked: false,
    starterIds: [],
    map: { x: 16, y: 70, scale: 0.82 },
    relic: {
      name: "Tide Pearl",
      description: "A dormant relic tied to water movement and amphibious traits.",
    },
    palette: {
      primary: "#4ea9a5",
      secondary: "#315d67",
      accent: "#9ee7d8",
      sky: "#366878",
      ground: "#335b54",
      path: "#78948a",
    },
  },
  {
    id: "bloomwild",
    name: "Bloomwild",
    subtitle: "Realm of Flora & Fungal Kin",
    description:
      "A future region where root cities, mushroom towers, and living flower-creatures grow around ancient buried power.",
    mood: "Dreamlike · organic · strange",
    landmarks: ["Sporelight", "Root Cathedral", "Petal Deep"],
    unlocked: false,
    starterIds: [],
    map: { x: 84, y: 28, scale: 0.84 },
    relic: {
      name: "Bloomseed",
      description: "A dormant seed relic tied to regenerative and plant-like traits.",
    },
    palette: {
      primary: "#b278b7",
      secondary: "#674a6b",
      accent: "#d9ec8c",
      sky: "#504866",
      ground: "#4f5740",
      path: "#9b826b",
    },
  },
];

export function getRegion(id: RegionId) {
  return REGIONS.find((region) => region.id === id)!;
}

export function getChampion(id: string) {
  return CHAMPIONS.find((champion) => champion.id === id)!;
}

export function getChampionsForRegion(regionId: RegionId) {
  return CHAMPIONS.filter((champion) => champion.regionId === regionId);
}
