type Box = { x: number; y: number; w: number; h: number };
type Link = { to: string; kind?: string; label?: string };
/** One end of a line: the box it meets, the edge it meets it on, and where on that edge. */
type End = { box: Box; side: "left" | "right"; toward: number; y: number };

const SVG = "http://www.w3.org/2000/svg";

/** Position inside `root`, from layout offsets. Transforms do not change it, so it stays right while a layer animates. */
function boxIn(element: HTMLElement, root: HTMLElement): Box {
  let x = 0;
  let y = 0;
  for (let node: HTMLElement | null = element; node && node !== root; node = node.offsetParent as HTMLElement | null) {
    x += node.offsetLeft;
    y += node.offsetTop;
  }
  return { x, y, w: element.offsetWidth, h: element.offsetHeight };
}

/** Draws the lines from the side boxes of one architecture map to the boxes they link to. */
function drawLinks(body: HTMLElement) {
  const svg = body.querySelector<SVGSVGElement>(".map-links");
  const tags = body.querySelector<HTMLElement>(".map-tags");
  if (!svg || !tags) return;
  svg.replaceChildren();
  tags.replaceChildren();
  // Narrow layouts stack the boxes and name each link in words instead.
  if (!body.offsetWidth || getComputedStyle(svg).display === "none") return;

  const cards = new Map<string, HTMLElement>();
  body.querySelectorAll<HTMLElement>("[data-node]").forEach((card) => cards.set(card.dataset.node as string, card));

  const lines: { from: End; to: End; link: Link }[] = [];
  body.querySelectorAll<HTMLElement>("[data-links]").forEach((card) => {
    const a = boxIn(card, body);
    (JSON.parse(card.dataset.links as string) as Link[]).forEach((link) => {
      const target = cards.get(link.to);
      if (!target) return;
      const b = boxIn(target, body);
      const leftOf = a.x + a.w / 2 < b.x + b.w / 2;
      lines.push({
        from: { box: a, side: leftOf ? "right" : "left", toward: b.y + b.h / 2, y: 0 },
        to: { box: b, side: leftOf ? "left" : "right", toward: a.y + a.h / 2, y: 0 },
        link,
      });
    });
  });

  // Lines that meet one edge of a box are spread along it, in the order of their other ends, so they do not cross.
  const edges = new Map<string, End[]>();
  lines.forEach((line) =>
    [line.from, line.to].forEach((end) => {
      const key = `${end.box.x}:${end.box.y}:${end.side}`;
      edges.set(key, [...(edges.get(key) ?? []), end]);
    }),
  );
  edges.forEach((ends) => {
    ends.sort((first, second) => first.toward - second.toward);
    ends.forEach((end, index) => {
      end.y = end.box.y + (end.box.h * (index + 1)) / (ends.length + 1);
    });
  });

  const edgeX = (end: End) => (end.side === "right" ? end.box.x + end.box.w : end.box.x);
  lines.forEach(({ from, to, link }) => {
    const startX = edgeX(from);
    const endX = edgeX(to);
    const middle = (startX + endX) / 2;

    const path = document.createElementNS(SVG, "path");
    path.setAttribute("d", `M${startX} ${from.y}C${middle} ${from.y} ${middle} ${to.y} ${endX} ${to.y}`);
    path.dataset.kind = link.kind ?? "request";
    svg.append(path);

    [
      [startX, from.y],
      [endX, to.y],
    ].forEach(([x, y]) => {
      const dot = document.createElementNS(SVG, "circle");
      dot.setAttribute("cx", String(x));
      dot.setAttribute("cy", String(y));
      dot.setAttribute("r", "2.5");
      svg.append(dot);
    });

    if (!link.label) return;
    const tag = document.createElement("span");
    tag.textContent = link.label;
    tag.style.left = `${middle}px`;
    tag.style.top = `${(from.y + to.y) / 2}px`;
    tags.append(tag);
  });
}

/**
 * Keeps the link lines of every architecture map in step with its layout. A map in a closed
 * detail view has no size, so its lines are drawn when the view opens and again on each resize.
 */
export function bindDiagramLinks() {
  const observer = new ResizeObserver((entries) => entries.forEach((entry) => drawLinks(entry.target as HTMLElement)));
  document.querySelectorAll<HTMLElement>(".map[data-sides] .map-body").forEach((body) => observer.observe(body));
  return () => observer.disconnect();
}
