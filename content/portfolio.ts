// All site copy lives here. Facts come from the current résumé.

export const profile = {
  name: "Moïse Kenge",
  location: "Ottawa, Canada",
  sentence: "AI Engineer building production AI systems. Incoming at AMD and Thales.",
  email: "moisekenge03@gmail.com",
  github: "https://github.com/Moisekenge",
  linkedin: "https://linkedin.com/in/moise-kenge",
};

export type Fx =
  | "zoom"
  | "stretch"
  | "words"
  | "chars"
  | "split"
  | "rays"
  | "iris"
  | "tunnel"
  | "bracket"
  | "dots"
  | "shards"
  | "blinds"
  | "bars"
  | "gates"
  | "flip"
  | "ledger";

/** One point of a section. It takes a full screen. */
export type Beat = {
  big: string;
  small: string;
  fx: Fx;
  /** Shows `big` as a giant figure that counts up. */
  stat?: boolean;
};

/** One moment of a booking, shown on the patient and nurse phones at once. */
export type AppStep = {
  title: string;
  small: string;
  patient: string;
  nurse: string;
};

export type Job = {
  company: string;
  short: string;
  logo: string;
  /** Card face: 0 is black, 1 is white, 2 is the brand gradient. */
  style: 0 | 1 | 2;
  /** Logo and text color on the card face. */
  ink: string;
  /** Second logo color, when the logo has one. */
  logoAccent?: string;
  /** Color of the burst effects. */
  fxColor: string;
  fxInk: string;
  face: string;
  role: string;
  dates: string;
  place: string;
  url: string;
  domain: string;
  beats: Beat[];
  /** App walkthrough, played right after the second beat. */
  app?: AppStep[];
};

// Each company takes one face of the card, in this order.
export const experience: Job[] = [
  {
    company: "AMD",
    short: "AMD",
    logo: "/logos/amd.svg",
    style: 0,
    ink: "#ffffff",
    fxColor: "#d9a441",
    fxInk: "#0a0a0b",
    face: "#0a0a0b",
    role: "AI Engineer Intern, Incoming",
    dates: "From May 2027",
    place: "Markham, ON",
    url: "https://www.amd.com",
    domain: "amd.com",
    beats: [{ big: "AI agents for GPU validation.", small: "Joining the Instinct data center GPU team.", fx: "rays" }],
  },
  {
    company: "Thales",
    short: "Thales",
    logo: "/logos/thales.svg",
    style: 1,
    ink: "#2d2e75",
    logoAccent: "#5fc1d7",
    fxColor: "#5fc1d7",
    fxInk: "#2d2e75",
    face: "#f2f2f0",
    role: "Software Engineer Intern, Incoming",
    dates: "Jan 2027 — Apr 2027",
    place: "Ottawa, ON",
    url: "https://www.thalesgroup.com",
    domain: "thalesgroup.com",
    beats: [{ big: "Defence & Security software.", small: "Joining Thales Canada as a software developer.", fx: "stretch" }],
  },
  {
    company: "Jonas Software",
    short: "Jonas",
    logo: "/logos/jonas.svg",
    style: 0,
    ink: "#ffffff",
    fxColor: "#ffffff",
    fxInk: "#0a0a0b",
    face: "#0a0a0b",
    role: "AI Engineer Intern",
    dates: "Apr 2026 — Aug 2026",
    place: "Markham, ON",
    url: "https://www.jonassoftware.com",
    domain: "jonassoftware.com",
    beats: [
      { big: "100+", small: "Constellation subsidiaries using the LLM tooling I shipped.", fx: "zoom", stat: true },
      { big: "RAG and structured outputs.", small: "Grounded pipelines for source code and document analysis.", fx: "words" },
      { big: "6x", small: "Faster inference, deployed on AWS and Azure.", fx: "tunnel", stat: true },
    ],
  },
  {
    company: "MobiSoins",
    short: "MobiSoins",
    logo: "/logos/mobisoins.svg",
    style: 1,
    ink: "#203e80",
    logoAccent: "#82bf5a",
    fxColor: "#82bf5a",
    fxInk: "#10264f",
    face: "#f2f2f0",
    role: "Technical Co-founder",
    dates: "Oct 2024 — Present",
    place: "Remote",
    url: "https://mobisoins.com",
    domain: "mobisoins.com",
    beats: [
      { big: "0 to 1.", small: "A healthcare marketplace, live on the Play Store with close to 100 nurses onboarded.", fx: "chars" },
      { big: "Booking. Dispatch. Live GPS.", small: "Geospatial nurse matching on a real-time layer.", fx: "split" },
      { big: "900+", small: "Tests guarding Stripe payments against double charges.", fx: "iris", stat: true },
    ],
    app: [
      { title: "Book.", small: "A patient asks for a nurse while nurses nearby are online.", patient: "patient-1", nurse: "nurse-1" },
      { title: "Dispatch.", small: "The app looks for the closest nurse and sends the offer.", patient: "patient-2", nurse: "nurse-2" },
      { title: "Accept.", small: "One slide, and the patient sees who is coming.", patient: "patient-3", nurse: "nurse-3" },
      { title: "Track.", small: "Live GPS on both phones, all the way to the door.", patient: "patient-4", nurse: "nurse-4" },
      { title: "Arrive.", small: "The patient is told the nurse is outside. The nurse checks in.", patient: "patient-5", nurse: "nurse-5" },
      { title: "Care.", small: "The visit timer runs on both sides.", patient: "patient-6", nurse: "nurse-6" },
      { title: "Done.", small: "Each side rates the other, and the visit closes.", patient: "patient-7", nurse: "nurse-7" },
    ],
  },
  {
    company: "Webacy",
    short: "Webacy",
    logo: "/logos/webacy.svg",
    style: 2,
    ink: "#ffffff",
    fxColor: "#7fe9f2",
    fxInk: "#14163d",
    face: "#14163d",
    role: "Security Research Intern",
    dates: "Jun 2024 — Aug 2024",
    place: "Remote",
    url: "https://www.webacy.com",
    domain: "webacy.com",
    beats: [
      { big: "100+", small: "Web3 projects analyzed with ML, engineering 20+ risk indicators.", fx: "blinds", stat: true },
      { big: "+15%", small: "Scoring accuracy in the production trust-scoring model.", fx: "bars", stat: true },
    ],
  },
];

export type Project = {
  label: string;
  tagline: string;
  dates: string;
  url: string;
  domain: string;
  beats: Beat[];
  stack: string;
};

export const otonmi: Project = {
  label: "Otonmi",
  tagline: "Runtime security for AI agents.",
  dates: "Dec 2025 — Present",
  url: "https://otonmi.com",
  domain: "otonmi.com",
  beats: [
    {
      big: "Every message. Every tool call.",
      small: "Inspected for prompt injection, credential leakage, tool poisoning, and data exfiltration.",
      fx: "bracket",
    },
    { big: "6 detectors.", small: "Mapped to the OWASP LLM Top 10, in a cascade that cut latency 4x.", fx: "dots" },
    { big: "THE GAUNTLET", small: "An 8-level prompt-injection sandbox. 81 automated tests pin the detectors.", fx: "gates" },
  ],
  stack: "TypeScript · Next.js · Node.js · Claude API · PostgreSQL · Cloudflare Workers",
};

export const lezra: Project = {
  label: "Lezra",
  tagline: "Vertical payments infrastructure.",
  dates: "Jul 2026 — Present",
  url: "https://lezra.ca",
  domain: "lezra.ca",
  beats: [
    { big: "Hold. Capture. Split. Payout.", small: "A payments API for the full lifecycle after card collection.", fx: "flip" },
    { big: "Double-entry ledger.", small: "Append-only, with idempotency keys and a transactional outbox.", fx: "ledger" },
    { big: "Orchestrated in Temporal.", small: "For staffing, home-care, and field-service marketplaces.", fx: "shards" },
  ],
  stack: "TypeScript · NestJS · PostgreSQL · Temporal · Stripe Connect · AWS",
};

export const statement = "Less hype. More shipped. Production AI, payments, and security, built end to end.";

export const education = "University of Ottawa · B.A.Sc. Software Engineering, Co-op · Expected May 2028";

export const skillRows = [
  ["Python", "TypeScript", "SQL", "Java", "C++", "PyTorch", "scikit-learn", "RAG", "AI agents", "MCP", "LLM evals"],
  ["React", "React Native", "Next.js", "Node.js", "NestJS", "Flask", "PostgreSQL", "MongoDB", "Redis", "Supabase"],
  ["AWS", "Azure", "Docker", "Terraform", "Ansible", "GitHub Actions", "OpenTelemetry", "Grafana", "Linux", "OWASP"],
];
