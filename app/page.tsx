import Image from "next/image";
import { Chip, DetailBlocks, DetailsButton, detailId } from "@/components/site/details";
import { Icon } from "@/components/site/icon";
import { LezraLockup, OtonmiLockup } from "@/components/site/project-logos";
import { education, experience, lezra, otonmi, profile, stack, statement, type AppStep, type Beat, type Project } from "@/content/portfolio";

const personJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: "AI Engineer",
  sameAs: [profile.github, profile.linkedin],
});

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

function AppStory({ steps, details }: { steps: AppStep[]; details: string }) {
  return (
    <div className="app-story" data-app-story>
      <div className="app-copy">
        <p className="app-kicker">One booking, two phones</p>
        <ol className="app-steps">
          {steps.map((step, index) => (
            <li className="app-step" key={step.title}>
              <span className="app-num">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="app-title">{step.title}</h3>
              <p className="app-small">{step.small}</p>
              <div className="app-shots">
                <Image src={`/app/${step.patient}.webp`} alt={`Patient app: ${step.title}`} width={720} height={1600} unoptimized />
                <Image src={`/app/${step.nurse}.webp`} alt={`Nurse app: ${step.title}`} width={720} height={1600} unoptimized />
              </div>
            </li>
          ))}
        </ol>
        <div className="app-actions">
          <div className="app-dots" role="group" aria-label="Walkthrough steps">
            {steps.map((step, index) => (
              <button type="button" key={step.title} data-app-dot={index} data-cursor={step.title} aria-label={`Step ${index + 1}: ${step.title}`}>
                <i />
              </button>
            ))}
          </div>
          <DetailsButton id={details} />
        </div>
      </div>
      <div className="app-phones" aria-hidden="true">
        <div className="app-slot" data-phone="patient">
          <span>Patient</span>
        </div>
        <div className="app-link">
          <i />
        </div>
        <div className="app-slot" data-phone="nurse">
          <span>Nurse</span>
        </div>
      </div>
    </div>
  );
}

function Beats({ beats }: { beats: Beat[] }) {
  return (
    <div className="beats">
      {beats.map((beat) => (
        <div className="beat" data-fx={beat.fx} data-stat={beat.stat ? "" : undefined} key={beat.big}>
          <div className="beat-fx" aria-hidden="true" />
          <div className="beat-inner">
            <h3 className={beat.stat ? "beat-big is-stat" : "beat-big"}>{beat.big}</h3>
            <p className="beat-small">{beat.small}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Every point of a chapter side by side. The animated chapters rest on this. */
function Points({ beats }: { beats: Beat[] }) {
  return (
    <ul className="sum-points" aria-hidden="true">
      {beats.map((beat) => (
        <li key={beat.big}>
          <strong>{beat.big}</strong>
          <span>{beat.small}</span>
        </li>
      ))}
    </ul>
  );
}

function Replay() {
  return (
    <button type="button" className="sum-replay" data-replay data-cursor="Replay">
      Replay
    </button>
  );
}

function ProjectScene({ project, id, children }: { project: Project; id?: string; children: React.ReactNode }) {
  const kind = project.label.toLowerCase();
  return (
    <section id={id} className={`pj pj-${kind}`} aria-label={project.label} data-project={kind} data-chapter={project.label}>
      <div className="pj-stage" id={id === kind ? undefined : kind}>
        <div className="pj-head" data-head>
          {children}
          <p className="pj-tagline" data-tagline>
            {project.tagline}
          </p>
        </div>
        <Beats beats={project.beats} />
        <div className="sum" data-sum>
          <div className="sum-head">
            <div className="sum-logo" data-logo-space />
            <DetailsButton id={kind} />
            <Chip url={project.url} domain={project.domain} />
            <Replay />
          </div>
          <p className="sum-tagline">{project.tagline}</p>
          <p className="meta sum-meta">
            {project.dates} · {project.stack}
          </p>
          <Points beats={project.beats} />
          <div className="more">
            <DetailBlocks detail={project.detail} kind="Project" name={project.label} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <main className="relative z-[2]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJsonLd }} />

      <section id="top" className="hero">
        <div className="hero-slot" data-slot="hero" data-cursor="Drag">
          <Image src="/img/me.webp" alt="Portrait of Moïse Kenge" fill sizes="40vw" className="object-cover" priority />
        </div>
        <div className="hero-pick">
          <button type="button" className="hero-arrow" data-pick-step="-1" aria-label="Previous section">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M17 10H3M8.5 4.5 3 10l5.5 5.5" />
            </svg>
          </button>
          <button type="button" className="hero-pick-go" data-pick-go data-cursor="Open">
            <span data-pick-name aria-live="polite">
              Spin to pick a section
            </span>
          </button>
          <button type="button" className="hero-arrow" data-pick-step="1" aria-label="Next section">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M3 10h14M11.5 4.5 17 10l-5.5 5.5" />
            </svg>
          </button>
        </div>
        <div className="wrap">
          <p className="hero-sentence">{profile.sentence}</p>
          <h1 className="hero-name">
            <span className="hero-word">Moïse</span> <span className="hero-word">Kenge</span>
          </h1>
        </div>
      </section>

      <section id="experience" className="xp" aria-label="Experience">
        <div className="xp-stage">
          <div className="xp-slot" data-slot="xp" data-cursor="Drag" />
          <div className="xp-rail" aria-hidden="true">
            {experience.map((job, index) => (
              <button type="button" key={job.short} data-rail={index} tabIndex={-1}>
                {job.short}
              </button>
            ))}
          </div>
          <ol className="xp-list">
            {experience.map((job) => (
              <li
                key={job.company}
                id={job.short.toLowerCase()}
                className="xp-item"
                data-chapter={job.short}
                style={{ "--ink": job.ink, "--acc": job.fxColor, "--acc-ink": job.fxInk, "--face": job.face } as Vars}
              >
                <Image src={job.logo} alt={`${job.company} logo`} width={320} height={120} className="xp-logo" unoptimized />
                <div className="sum" data-sum>
                  <div className="sum-head">
                    <h2>{job.company}</h2>
                    <DetailsButton id={detailId(job.short)} />
                    <Chip url={job.url} domain={job.domain} />
                    <Replay />
                  </div>
                  <p className="meta sum-meta">
                    {job.role} · {job.dates} · {job.place}
                  </p>
                  <Points beats={job.beats} />
                  <div className="more">
                    <DetailBlocks detail={job.detail} kind="Experience" name={job.company} />
                  </div>
                </div>
                <Beats beats={job.beats} />
                {job.app ? <AppStory steps={job.app} details={detailId(job.short)} /> : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ProjectScene project={otonmi} id="projects">
        <OtonmiLockup />
      </ProjectScene>

      <ProjectScene project={lezra}>
        <LezraLockup />
      </ProjectScene>

      <section id="about" className="about">
        <div className="wrap">
          <p className="statement" data-statement>
            {statement}
          </p>
          <p className="edu mt-12" data-reveal="up">
            {education}
          </p>
        </div>
        <div className="wrap stack">
          <h2 className="meta stack-label" data-reveal="up">
            Stack
          </h2>
          <div className="stack-grid">
            {stack.map((group, index) => (
              <section key={group.title} data-reveal="up" data-reveal-delay={index * 0.08}>
                <h3>{group.title}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.name}>
                      <span className="stack-icon">
                        <Icon name={item.icon} />
                      </span>
                      {item.name}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="contact">
        <div className="wrap">
          <h2 className="contact-title" data-contact-title>
            Say hi.
          </h2>
          <div className="contact-row">
            <a href={`mailto:${profile.email}`} className="contact-mail magnetic" data-reveal="up" data-cursor="Write">
              {profile.email}
            </a>
            <div className="flex gap-8 text-[clamp(1.125rem,1.6vw,1.5rem)]" data-reveal="up" data-reveal-delay="0.1">
              <a href={profile.github} target="_blank" rel="noreferrer" className="link-line" data-cursor="Open">
                GitHub ↗
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="link-line" data-cursor="Open">
                LinkedIn ↗
              </a>
            </div>
          </div>
          <div className="closing" data-reveal="up">
            <button type="button" className="link-line" data-watch-again data-cursor="Play">
              Watch again ↺
            </button>
            <a href="#top" className="link-line" data-cursor="Top">
              Back to top ↑
            </a>
            <p className="meta">
              {profile.location} · {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
