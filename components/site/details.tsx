import { Icon } from "@/components/site/icon";
import { experience, lezra, otonmi, type Detail, type Layer, type MapNode } from "@/content/portfolio";

type Vars = React.CSSProperties & Record<`--${string}`, string>;

type Entry = {
  id: string;
  name: string;
  /** Label of the first block. */
  kind: "Experience" | "Project";
  meta: string;
  url: string;
  domain: string;
  /** Jobs carry their colors here. Projects take theirs from the stylesheet. */
  colors?: Vars;
  detail: Detail;
};

/** Key of a section's detail view. The Details button and its panel share it. */
export const detailId = (name: string) => name.toLowerCase();

const entries: Entry[] = [
  ...experience.map((job) => ({
    id: detailId(job.short),
    name: job.company,
    kind: "Experience" as const,
    meta: `${job.role} · ${job.dates} · ${job.place}`,
    url: job.url,
    domain: job.domain,
    colors: { "--ink": job.ink, "--acc": job.fxColor, "--face": job.face },
    detail: job.detail,
  })),
  ...[otonmi, lezra].map((project) => ({
    id: detailId(project.label),
    name: project.label,
    kind: "Project" as const,
    meta: `${project.tagline} · ${project.dates}`,
    url: project.url,
    domain: project.domain,
    detail: project.detail,
  })),
];

export function Chip({ url, domain }: { url: string; domain: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="chip magnetic" data-cursor="Open">
      {domain}
      <span aria-hidden="true"> ↗</span>
    </a>
  );
}

/** Opens the full view of a section. Shown only when the site runs with motion. */
export function DetailsButton({ id }: { id: string }) {
  return (
    <button type="button" className="sum-more" data-details-open={id} data-cursor="More" aria-haspopup="dialog">
      Details
      <span aria-hidden="true"> +</span>
    </button>
  );
}

/**
 * The blocks of a detail view: what it was, the tech stack, and the architecture diagram.
 * A block with nothing to show is left out.
 */
export function DetailBlocks({ detail, kind, name }: { detail: Detail; kind: Entry["kind"]; name: string }) {
  return (
    <>
      <section className="dt-about" data-rise>
        <h3 className="dt-label">{kind}</h3>
        {detail.about.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>
      {detail.stack.length ? (
        <section className="dt-stack-block" data-rise>
          <h3 className="dt-label">Tech stack</h3>
          <ul className="dt-stack">
            {detail.stack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {detail.architecture.length ? (
        <section className="dt-arch-block">
          <h3 className="dt-label" data-rise>
            Architecture
          </h3>
          <Diagram layers={detail.architecture} name={name} />
        </section>
      ) : null}
    </>
  );
}

/** One box of the map. A side box also says what it links to, for layouts that draw no lines. */
function MapCard({ node }: { node: MapNode }) {
  return (
    <div className="map-card" data-node={node.name} data-links={node.links ? JSON.stringify(node.links) : undefined}>
      <span className="map-icon">
        <Icon name={node.icon} />
      </span>
      <span className="map-text">
        <strong>{node.name}</strong>
        {node.note ? <span>{node.note}</span> : null}
        {node.links?.map((link) => (
          <span className="map-to" key={link.to}>
            → {link.to}
            {link.label ? ` · ${link.label}` : ""}
            {link.kind === "realtime" ? " · realtime" : ""}
          </span>
        ))}
      </span>
    </div>
  );
}

/**
 * The architecture map. It reads from the bottom up: the first layer is drawn lowest, and a line
 * leads from each layer to the one above it. Outside services sit left and right of the layer
 * they serve. The director draws their link lines, since those depend on the measured layout.
 */
function Diagram({ layers, name }: { layers: Layer[]; name: string }) {
  const sides = layers.some((layer) => layer.left || layer.right);
  const realtime = layers.some((layer) => [...(layer.left ?? []), ...(layer.right ?? [])].some((node) => node.links?.some((link) => link.kind === "realtime")));
  return (
    <div className="map" data-map data-sides={sides ? "" : undefined}>
      <div className="map-head">
        <span>{name}</span>
        {sides ? <span className="map-legend">{realtime ? "Solid: request · Dotted: realtime" : "Line: request"}</span> : null}
      </div>
      <div className="map-body">
        <ol className="map-rows" aria-label="Architecture layers, from the bottom up">
          {layers.map((layer, index) => (
            <li className="map-row" data-layer data-wide={layer.left || layer.right ? undefined : ""} key={layer.nodes[0].name}>
              {layer.left ? (
                <div className="map-side">
                  {layer.left.map((node) => (
                    <MapCard node={node} key={node.name} />
                  ))}
                </div>
              ) : null}
              <div className="map-center">
                {layer.nodes.map((node) => (
                  <MapCard node={node} key={node.name} />
                ))}
              </div>
              {layer.right ? (
                <div className="map-side map-right">
                  {layer.right.map((node) => (
                    <MapCard node={node} key={node.name} />
                  ))}
                </div>
              ) : null}
              {index < layers.length - 1 ? (
                <span className="map-up" aria-hidden="true">
                  {layer.up ? <i>{layer.up}</i> : null}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
        <svg className="map-links" aria-hidden="true" />
        <div className="map-tags" aria-hidden="true" />
      </div>
    </div>
  );
}

/** Fixed layer that holds one panel for each section. The director opens and closes it. */
export function Sheet() {
  return (
    <div className="sheet" data-lenis-prevent>
      {entries.map((entry) => (
        <article
          key={entry.id}
          className="sheet-panel"
          data-details={entry.id}
          role="dialog"
          aria-modal="true"
          aria-label={`${entry.name} details`}
          style={entry.colors}
          hidden
        >
          <div className="sheet-top">
            <p className="meta">{entry.name} · Details</p>
            <button type="button" className="sheet-close" data-details-close data-cursor="Close">
              Close
              <span aria-hidden="true"> ✕</span>
            </button>
          </div>
          <div className="sheet-head" data-rise>
            <h2>{entry.name}</h2>
            <Chip url={entry.url} domain={entry.domain} />
          </div>
          <p className="meta sheet-meta" data-rise>
            {entry.meta}
          </p>
          <div className="sheet-grid">
            <DetailBlocks detail={entry.detail} kind={entry.kind} name={entry.name} />
          </div>
        </article>
      ))}
    </div>
  );
}
