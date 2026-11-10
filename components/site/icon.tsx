import {
  BookOpen,
  Braces,
  Building2,
  ChartNoAxesColumn,
  Cloud,
  Database,
  FlaskConical,
  Inbox,
  KeyRound,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Users,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import {
  siClaude,
  siCloudflareworkers,
  siCplusplus,
  siDocker,
  siDotnet,
  siExpo,
  siExpress,
  siFastapi,
  siFirebase,
  siGithubactions,
  siHtml5,
  siJavascript,
  siLangchain,
  siMapbox,
  siNestjs,
  siNextdotjs,
  siPostgresql,
  siPython,
  siReact,
  siSpringboot,
  siStripe,
  siSupabase,
  siTailwindcss,
  siTemporal,
  siTypescript,
} from "simple-icons";

// Brand marks, drawn in one color so they take the ink of the section they sit in.
const BRANDS: Record<string, string> = {
  claude: siClaude.path,
  cloudflareworkers: siCloudflareworkers.path,
  cplusplus: siCplusplus.path,
  docker: siDocker.path,
  dotnet: siDotnet.path,
  expo: siExpo.path,
  express: siExpress.path,
  fastapi: siFastapi.path,
  firebase: siFirebase.path,
  githubactions: siGithubactions.path,
  html5: siHtml5.path,
  javascript: siJavascript.path,
  langchain: siLangchain.path,
  mapbox: siMapbox.path,
  nestjs: siNestjs.path,
  nextdotjs: siNextdotjs.path,
  postgresql: siPostgresql.path,
  python: siPython.path,
  react: siReact.path,
  springboot: siSpringboot.path,
  stripe: siStripe.path,
  supabase: siSupabase.path,
  tailwindcss: siTailwindcss.path,
  temporal: siTemporal.path,
  typescript: siTypescript.path,
};

// Icons for boxes that are not a brand.
const GENERIC: Record<string, LucideIcon> = {
  alert: TriangleAlert,
  book: BookOpen,
  braces: Braces,
  building: Building2,
  chart: ChartNoAxesColumn,
  cloud: Cloud,
  database: Database,
  flask: FlaskConical,
  inbox: Inbox,
  key: KeyRound,
  message: MessageSquare,
  search: Search,
  shield: ShieldCheck,
  sparkles: Sparkles,
  users: Users,
  workflow: Workflow,
  wrench: Wrench,
};

/** One icon by name. A name with no icon draws nothing, so the caller keeps its slot empty. */
export function Icon({ name }: { name?: string }) {
  if (!name) return null;

  // The icon set has no AWS or Twilio mark, so these two are drawn here.
  if (name === "aws") {
    return (
      <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
        <text x="12" y="13.5" textAnchor="middle" fontSize="11.5" fontWeight="700" letterSpacing="-0.4" fill="currentColor">
          aws
        </text>
        <path d="M3.5 17.2c5.2 3 11.8 3 17 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "twilio") {
    return (
      <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path fillRule="evenodd" d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm0 20.8a8.8 8.8 0 1 1 0-17.6 8.8 8.8 0 0 1 0 17.6Z" />
        <circle cx="9" cy="9" r="2.4" />
        <circle cx="15" cy="9" r="2.4" />
        <circle cx="9" cy="15" r="2.4" />
        <circle cx="15" cy="15" r="2.4" />
      </svg>
    );
  }

  const brand = BRANDS[name];
  if (brand) {
    return (
      <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d={brand} fill="currentColor" />
      </svg>
    );
  }

  const Generic = GENERIC[name];
  return Generic ? <Generic className="icon" aria-hidden="true" strokeWidth={1.5} /> : null;
}
