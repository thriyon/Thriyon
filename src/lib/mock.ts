export type Talent = {
  username: string;
  name: string;
  role: string;
  location: string;
  rate: number;
  rating: number;
  available: boolean;
  skills: string[];
  bio: string;
  projects: number;
};

export const talents: Talent[] = [
  { username: "iris.kano", name: "Iris Kano", role: "Creative Director", location: "Tokyo", rate: 280, rating: 4.98, available: true, skills: ["Brand", "Art Direction", "Motion"], bio: "Art directing brands at the intersection of cinema and code.", projects: 142 },
  { username: "leon.vasquez", name: "Leon Vasquez", role: "3D & Motion Designer", location: "Berlin", rate: 220, rating: 4.96, available: true, skills: ["Cinema4D", "Houdini", "Octane"], bio: "Crafting volumetric worlds for premium brands.", projects: 96 },
  { username: "amaru.sol", name: "Amaru Sol", role: "Product Designer", location: "Lisbon", rate: 190, rating: 4.92, available: false, skills: ["Figma", "Systems", "UX"], bio: "Designing operating systems for ambitious teams.", projects: 211 },
  { username: "noa.fontaine", name: "Noa Fontaine", role: "Brand Strategist", location: "Paris", rate: 240, rating: 4.99, available: true, skills: ["Strategy", "Naming", "Voice"], bio: "Building cultural gravity for category-defining brands.", projects: 73 },
  { username: "kai.osei", name: "Kai Osei", role: "Full-stack Engineer", location: "Accra", rate: 175, rating: 4.94, available: true, skills: ["TypeScript", "React", "Edge"], bio: "Shipping cinematic interfaces with brutal performance.", projects: 188 },
  { username: "mira.lund", name: "Mira Lund", role: "Type Designer", location: "Copenhagen", rate: 260, rating: 4.97, available: true, skills: ["Type", "Variable Fonts", "Brand"], bio: "Drawing letterforms for the next century.", projects: 41 },
  { username: "ren.hayashi", name: "Ren Hayashi", role: "Photographer", location: "Kyoto", rate: 320, rating: 5.0, available: false, skills: ["Editorial", "Campaign", "Film"], bio: "Stillness, light, and the architecture of memory.", projects: 64 },
  { username: "ada.morgan", name: "Ada Morgan", role: "Sound Designer", location: "London", rate: 200, rating: 4.95, available: true, skills: ["Score", "Sound Design", "Mix"], bio: "Composing emotional architecture for moving image.", projects: 88 },
];

export type Project = {
  slug: string;
  title: string;
  client: string;
  budget: string;
  duration: string;
  category: string;
  tags: string[];
  posted: string;
  proposals: number;
  summary: string;
};

export const projects: Project[] = [
  { slug: "atlas-rebrand", title: "Rebrand for a sovereign AI lab", client: "Atlas Research", budget: "$40k – $80k", duration: "10 weeks", category: "Brand", tags: ["Identity", "Strategy", "Web"], posted: "2 days ago", proposals: 24, summary: "Reposition a frontier AI lab as a cultural institution. Need a senior brand team with editorial fluency." },
  { slug: "monolith-os", title: "Design system for an OS launch", client: "Monolith", budget: "$120k+", duration: "16 weeks", category: "Product", tags: ["Systems", "Design Engineering"], posted: "5 hours ago", proposals: 51, summary: "Build the foundational design language for a new operating system. Tokens, motion, accessibility." },
  { slug: "nova-campaign", title: "Launch film & site for hardware", client: "Nova Audio", budget: "$60k", duration: "6 weeks", category: "Campaign", tags: ["3D", "Direction", "Web"], posted: "1 day ago", proposals: 18, summary: "Cinematic launch of a new flagship product. Direction, 3D, and an immersive launch microsite." },
  { slug: "obsidian-app", title: "Native iOS for a private bank", client: "Obsidian Capital", budget: "$200k+", duration: "20 weeks", category: "Product", tags: ["iOS", "Security", "UX"], posted: "3 days ago", proposals: 32, summary: "Luxury private banking app. Discretion, restraint, and uncompromising craft." },
  { slug: "halo-editorial", title: "Editorial direction for a quarterly", client: "Halo Quarterly", budget: "$25k", duration: "Ongoing", category: "Editorial", tags: ["Type", "Art Direction"], posted: "1 week ago", proposals: 12, summary: "Set the visual tone of a new quarterly print + digital publication." },
  { slug: "vector-identity", title: "Identity for an aerospace startup", client: "Vector Dynamics", budget: "$90k", duration: "12 weeks", category: "Brand", tags: ["Identity", "Naming"], posted: "4 days ago", proposals: 27, summary: "Build a sovereign visual identity for a next-gen aerospace company." },
];

export type Showcase = {
  slug: string;
  title: string;
  studio: string;
  year: number;
  discipline: string;
  hue: string;
};

export const showcases: Showcase[] = [
  { slug: "atlas-rebrand", title: "Atlas — A new sovereignty", studio: "Iris Kano", year: 2026, discipline: "Brand", hue: "from-violet-500/30 to-blue-500/10" },
  { slug: "nova-launch", title: "Nova — Sound of the void", studio: "Leon Vasquez", year: 2026, discipline: "3D / Film", hue: "from-fuchsia-500/30 to-indigo-500/10" },
  { slug: "monolith-os", title: "Monolith — Operating language", studio: "Amaru Sol", year: 2025, discipline: "Systems", hue: "from-sky-500/20 to-violet-500/10" },
  { slug: "halo-issue-01", title: "Halo — Issue 01", studio: "Mira Lund", year: 2025, discipline: "Editorial", hue: "from-amber-200/20 to-rose-500/10" },
  { slug: "obsidian-ios", title: "Obsidian — Private banking", studio: "Kai Osei", year: 2025, discipline: "Product", hue: "from-slate-300/20 to-violet-500/10" },
  { slug: "vector-identity", title: "Vector — Aerospace identity", studio: "Noa Fontaine", year: 2024, discipline: "Brand", hue: "from-emerald-300/20 to-cyan-500/10" },
];

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  reading: string;
  category: string;
};

export const posts: Post[] = [
  { slug: "manifesto", title: "A manifesto for the next decade of creative work", excerpt: "We are entering a renaissance disguised as a technology cycle.", date: "May 12, 2026", reading: "8 min", category: "Manifesto" },
  { slug: "post-portfolio", title: "After the portfolio: identity in the age of agents", excerpt: "Reputation is becoming a protocol, not a document.", date: "Apr 30, 2026", reading: "6 min", category: "Essay" },
  { slug: "rates", title: "Why elite freelancers will quietly raise their rates 3x", excerpt: "The math of scarcity in a post-noise economy.", date: "Apr 14, 2026", reading: "5 min", category: "Economics" },
  { slug: "studios", title: "The return of the small, sovereign studio", excerpt: "Five-person teams are outshipping fifty-person agencies.", date: "Mar 28, 2026", reading: "7 min", category: "Field notes" },
];
