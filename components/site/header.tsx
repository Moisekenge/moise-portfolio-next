import { experience, lezra, otonmi } from "@/content/portfolio";

const slug = (label: string) => label.toLowerCase();

const groups = [
  { label: "Experience", items: experience.map((job) => job.short) },
  { label: "Projects", items: [otonmi.label, lezra.label] },
  { label: "About", items: [] },
  { label: "Contact", items: [] },
];

/** Every link carries data-nav, which the director uses for the active state and the jumps. */
export function Header() {
  return (
    <header className="site-header">
      <a href="#top" className="site-mark" data-nav="top" aria-label="Back to top">
        MK
      </a>
      <nav aria-label="Primary" className="site-nav">
        {groups.map((group) => (
          <div className="nav-group" key={group.label}>
            <a href={`#${slug(group.label)}`} className="link-line" data-nav={slug(group.label)}>
              {group.label}
            </a>
            {group.items.length ? (
              <ul className="nav-sub">
                {group.items.map((item) => (
                  <li key={item}>
                    <a href={`#${slug(item)}`} data-nav={slug(item)}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </nav>
    </header>
  );
}
