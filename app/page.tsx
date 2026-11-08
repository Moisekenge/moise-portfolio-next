import Image from "next/image";
import { LezraLockup, OtonmiLockup } from "@/components/site/project-logos";
import { education, experience, lezra, otonmi, profile, skillRows, statement, type AppStep, type Beat, type Project } from "@/content/portfolio";

const personJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: "AI / Software Engineer",
  sameAs: [profile.github, profile.linkedin],
});

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

function AppStory({ steps }: { steps: AppStep[] }) {
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

function Beats({ beats, url, domain, note }: { beats: Beat[]; url: string; domain: string; note?: string }) {
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
      <div className="beat beat-cta" data-fx="cta">
        <div className="beat-inner">
          <p className="beat-small">Take a look</p>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="cta magnetic"
            data-cursor="Open"
            style={{ "--len": domain.length } as Vars}
          >
            {domain}
            <span aria-hidden="true"> ↗</span>
          </a>
          {note ? <p className="beat-note">{note}</p> : null}
        </div>
      </div>
    </div>
  );
}

function ProjectScene({ project, id, children }: { project: Project; id?: string; children: React.ReactNode }) {
  const kind = project.label.toLowerCase();
  return (
    <section id={id} className={`pj pj-${kind}`} aria-label={project.label} data-project={kind}>
      <div className="pj-stage">
        <div className="pj-head" data-head>
          {children}
          <p className="pj-tagline" data-tagline>
            {project.tagline}
          </p>
        </div>
        <Beats beats={project.beats} url={project.url} domain={project.domain} note={project.stack} />
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
                className="xp-item"
                style={{ "--ink": job.ink, "--acc": job.fxColor, "--acc-ink": job.fxInk, "--face": job.face } as Vars}
              >
                <Image src={job.logo} alt={`${job.company} logo`} width={320} height={120} className="xp-logo" unoptimized />
                <div className="xp-title">
                  <h2 data-title>{job.company}</h2>
                  <p data-title>{job.role}</p>
                  <p className="meta" data-title>
                    {job.dates} · {job.place}
                  </p>
                </div>
                <Beats beats={job.beats} url={job.url} domain={job.domain} note="Or keep scrolling" />
                {job.app ? <AppStory steps={job.app} /> : null}
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
        <div className="skills" aria-label="Skills">
          {skillRows.map((row, index) => (
            <div className="skill-row" data-marquee={index % 2 ? "right" : "left"} key={row[0]}>
              <ul>
                {row.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
              <ul aria-hidden="true" className="skill-copy">
                {row.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
          ))}
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
          <p className="meta mt-16">
            {profile.location} · {new Date().getFullYear()}
          </p>
        </div>
      </section>
    </main>
  );
}
