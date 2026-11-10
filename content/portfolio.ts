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

/** A line from a side node to a node of the map. Solid is a request, dotted is realtime. */
export type MapLink = { to: string; kind?: "request" | "realtime"; label?: string };

/** One box of an architecture map. `icon` names a brand mark or a generic icon. */
export type MapNode = { name: string; note?: string; icon?: string; links?: MapLink[] };

/** One layer of an architecture map: its own nodes, and outside services on its left and right. */
export type Layer = {
  nodes: MapNode[];
  /** Label on the line to the layer above. */
  up?: string;
  left?: MapNode[];
  right?: MapNode[];
};

/** The full view of a section, opened with its Details button. The text follows the LinkedIn profile. */
export type Detail = {
  about: string[];
  stack: string[];
  /** Layers from the bottom up: the first one is the base of the diagram. */
  architecture: Layer[];
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
  /** App walkthrough, played as its own chapter after the points. */
  app?: AppStep[];
  /** A role that has not started yet has no stack or architecture, so those lists stay empty. */
  detail: Detail;
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
    detail: {
      about: ["Incoming for summer 2027.", "Joining the Instinct data center GPU team to build AI agents for GPU validation."],
      stack: [],
      architecture: [],
    },
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
    detail: {
      about: ["Incoming for winter 2027.", "Joining Thales Canada as a software developer, on Defence & Security software."],
      stack: [],
      architecture: [],
    },
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
    detail: {
      about: [
        "AI engineering at Jonas Software, a Constellation Software company.",
        "Shipped production LLM tooling used across 100+ Constellation subsidiaries, including Strata, an M&A due-diligence platform. Built RAG and structured-output pipelines, deployed them on Azure, and cut inference latency 6x.",
      ],
      stack: ["Python", "TypeScript", "React", "Node.js", "RAG", "LLM APIs", "Azure", "CI/CD"],
      architecture: [
        { nodes: [{ name: "Azure", note: "Pipelines deployed here", icon: "cloud" }, { name: "LLM APIs", icon: "sparkles" }, { name: "CI/CD", icon: "workflow" }] },
        {
          nodes: [
            { name: "RAG pipelines", note: "Grounded in source code and documents", icon: "search" },
            { name: "Structured outputs", note: "Structured-output pipelines", icon: "braces" },
          ],
        },
        {
          nodes: [
            { name: "LLM tooling", note: "In production, inference latency cut 6x", icon: "wrench" },
            { name: "Strata", note: "M&A due-diligence platform", icon: "building" },
          ],
        },
        { nodes: [{ name: "Constellation subsidiaries", note: "100+ use the tooling", icon: "users" }] },
      ],
    },
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
    detail: {
      about: [
        "On-demand home nursing marketplace, live on the Play Store with close to 100 nurses onboarded.",
        "Built it 0→1: booking, real-time dispatch, live GPS tracking, geospatial nurse matching, and a Stripe payments layer guarded by 900+ tests.",
      ],
      // Follows the system diagram: no Redis, and Firebase carries the realtime layer.
      stack: ["React Native", "NestJS", "TypeORM", "PostgreSQL", "AWS", "Firebase", "Stripe", "Twilio", "Mapbox", "Claude Haiku"],
      architecture: [
        { nodes: [{ name: "AWS", note: "EC2 hosting · Cognito auth · S3, SES, SNS · ca-central-1 residency", icon: "aws" }], up: "self-hosted" },
        { nodes: [{ name: "PostgreSQL", note: "15 entities, 18 migrations, Law 25 audit", icon: "postgresql" }], up: "TypeORM" },
        {
          nodes: [{ name: "NestJS API", note: "18 modules, ~111 endpoints, system of record", icon: "nestjs" }],
          up: "REST",
          left: [
            { name: "Stripe", note: "Escrow + Connect", icon: "stripe", links: [{ to: "NestJS API" }] },
            { name: "Twilio", note: "Phone OTP", icon: "twilio", links: [{ to: "NestJS API" }] },
          ],
          right: [{ name: "Claude Haiku", note: "Support assistant, medical guardrail", icon: "claude", links: [{ to: "NestJS API" }] }],
        },
        {
          nodes: [
            { name: "Patient app", note: "Map, book, track, pay", icon: "expo" },
            { name: "Nurse app", note: "Go online, accept, navigate", icon: "react" },
          ],
          left: [{ name: "Mapbox", note: "Maps + directions", icon: "mapbox", links: [{ to: "Patient app" }] }],
          right: [
            {
              name: "Firebase",
              note: "GPS, offers, chat, FCM push",
              icon: "firebase",
              links: [
                { to: "Nurse app", kind: "realtime" },
                { to: "NestJS API", label: "Admin SDK" },
              ],
            },
          ],
        },
      ],
    },
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
    detail: {
      about: [
        "Web3 security platform.",
        "Researched smart contract and wallet threats and analyzed on-chain data to flag risky contracts and wallets.",
      ],
      stack: ["OSINT", "OWASP", "Data analysis", "Data modeling", "Smart contracts"],
      architecture: [
        { nodes: [{ name: "On-chain data", icon: "database" }, { name: "Smart contracts", icon: "braces" }, { name: "OSINT", icon: "search" }] },
        { nodes: [{ name: "Risk analysis", note: "Data modeling, 20+ risk indicators", icon: "chart" }] },
        { nodes: [{ name: "Trust-scoring model", note: "In production, +15% scoring accuracy", icon: "sparkles" }] },
        { nodes: [{ name: "Risk flags", note: "Risky contracts and wallets", icon: "shield" }] },
      ],
    },
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
  detail: Detail;
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
  detail: {
    about: [
      "Runtime security platform for AI agents, inspecting every LLM-agent message and tool call against the OWASP LLM Top 10.",
      "Built 6 detectors in a concurrent detection cascade that cut hot-path latency 4x, plus THE GAUNTLET, a prompt-injection sandbox that logs labeled attack data for detector tuning. 81 automated tests.",
    ],
    stack: ["TypeScript", "Next.js", "Node.js", "Claude API", "PostgreSQL", "Supabase", "Cloudflare Workers"],
    architecture: [
      {
        nodes: [
          { name: "Cloudflare Workers", icon: "cloudflareworkers" },
          { name: "PostgreSQL", icon: "postgresql" },
          { name: "Supabase", icon: "supabase" },
          { name: "Claude API", icon: "claude" },
        ],
      },
      { nodes: [{ name: "Agent traffic", note: "Every LLM-agent message and tool call", icon: "message" }], up: "inspected" },
      {
        nodes: [{ name: "Detection cascade", note: "6 concurrent detectors, mapped to the OWASP LLM Top 10", icon: "shield" }],
        left: [{ name: "THE GAUNTLET", note: "8-level prompt-injection sandbox", icon: "flask", links: [{ to: "Detection cascade", label: "attack data" }] }],
      },
      { nodes: [{ name: "Findings", note: "Prompt injection, credential leakage, tool poisoning, data exfiltration", icon: "alert" }] },
    ],
  },
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
  // Lezra is not on the LinkedIn profile yet, so this text comes from the site copy.
  detail: {
    about: [
      "Vertical payments infrastructure for staffing, home-care, and field-service marketplaces.",
      "A payments API for the full lifecycle after card collection: hold, capture, split, and payout.",
    ],
    stack: ["TypeScript", "NestJS", "PostgreSQL", "Temporal", "Stripe Connect", "AWS"],
    architecture: [
      { nodes: [{ name: "AWS", icon: "aws" }, { name: "PostgreSQL", icon: "postgresql" }, { name: "Stripe Connect", icon: "stripe" }] },
      {
        nodes: [
          { name: "Double-entry ledger", note: "Append-only", icon: "book" },
          { name: "Idempotency keys", icon: "key" },
          { name: "Transactional outbox", icon: "inbox" },
        ],
      },
      { nodes: [{ name: "Temporal workflows", note: "Hold, capture, split, payout", icon: "temporal" }] },
      { nodes: [{ name: "Payments API", note: "NestJS, full lifecycle after card collection", icon: "nestjs" }] },
      { nodes: [{ name: "Marketplaces", note: "Staffing, home care, field service", icon: "users" }] },
    ],
  },
};

export const statement = "Less hype. More shipped. Production AI, payments, and security, built end to end.";

export const education = "University of Ottawa · B.A.Sc. Software Engineering, Co-op · Expected May 2028";

/** One line of the Stack list. `icon` names a brand mark. Some brands have none. */
export type StackItem = { name: string; icon?: string };

export const stack: { title: string; items: StackItem[] }[] = [
  {
    title: "AI / ML",
    items: [
      { name: "Claude API", icon: "claude" },
      { name: "OpenAI / Azure OpenAI" },
      { name: "Amazon Bedrock", icon: "aws" },
      { name: "RAG" },
      { name: "pgvector" },
      { name: "Agentic workflows" },
      { name: "Prompt engineering" },
      { name: "Spec-driven dev" },
    ],
  },
  {
    title: "Languages",
    items: [
      { name: "TypeScript", icon: "typescript" },
      { name: "JavaScript", icon: "javascript" },
      { name: "Python", icon: "python" },
      { name: "C#" },
      { name: "Java" },
      { name: "C / C++", icon: "cplusplus" },
      { name: "SQL" },
      { name: "HTML / CSS", icon: "html5" },
    ],
  },
  {
    title: "Frameworks",
    items: [
      { name: "Next.js", icon: "nextdotjs" },
      { name: "React", icon: "react" },
      { name: "FastAPI", icon: "fastapi" },
      { name: "Express", icon: "express" },
      { name: "Spring Boot", icon: "springboot" },
      { name: ".NET Core", icon: "dotnet" },
      { name: "LangChain", icon: "langchain" },
      { name: "Tailwind", icon: "tailwindcss" },
    ],
  },
  {
    title: "Infra / Cloud",
    items: [
      { name: "Azure Container Apps" },
      { name: "AWS Bedrock", icon: "aws" },
      { name: "Docker", icon: "docker" },
      { name: "PostgreSQL", icon: "postgresql" },
      { name: "Supabase", icon: "supabase" },
      { name: "GitHub Actions", icon: "githubactions" },
      { name: "Firebase", icon: "firebase" },
      { name: "REST APIs" },
    ],
  },
];
