import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

type Timeline = gsap.core.Timeline;
type Effect = (ctx: Ctx) => void;
type Ctx = { tl: Timeline; beat: HTMLElement; big: HTMLElement; layer: HTMLElement | null; at: number };

const IN = 0.46;
const HOLD = 0.38;
const OUT = 0.36;
export const BEAT_LENGTH = IN + HOLD + OUT;

const off = { immediateRender: false };
const outAt = (at: number) => at + IN + HOLD;

function spawn(layer: HTMLElement | null, className: string, count: number) {
  return Array.from({ length: count }, () => {
    const element = document.createElement("i");
    element.className = className;
    layer?.append(element);
    return element;
  });
}

/** The main move: from a point at the center, then past the viewer. */
function zoomBig({ tl, big, at }: Ctx, from = 0.02, to = 7) {
  tl.fromTo(big, { scale: from, opacity: 0 }, { scale: 1, opacity: 1, duration: IN, ease: "power3.out", ...off }, at);
  tl.to(big, { scale: to, opacity: 0, duration: OUT, ease: "power2.in" }, outAt(at));
}

function countUp({ tl, beat, big, at }: Ctx) {
  if (!("stat" in beat.dataset)) return;
  const match = big.textContent?.match(/^(\D*)(\d+)(.*)$/);
  if (!match) return;
  const [, before, target, after] = match;
  const counter = { value: 0 };
  tl.to(
    counter,
    {
      value: Number(target),
      duration: IN,
      ease: "power1.out",
      onUpdate: () => {
        big.textContent = `${before}${Math.round(counter.value)}${after}`;
      },
    },
    at,
  );
}

/** Distance of each piece from the center of its heading. */
function fromCenter(piece: HTMLElement, big: HTMLElement) {
  return {
    x: piece.offsetLeft + piece.offsetWidth / 2 - big.clientWidth / 2,
    y: piece.offsetTop + piece.offsetHeight / 2 - big.clientHeight / 2,
  };
}

const FX: Record<string, Effect> = {
  zoom: (ctx) => {
    zoomBig(ctx);
    countUp(ctx);
  },

  // Flat bright line that opens up, then tears away sideways.
  stretch: (ctx) => {
    const { tl, big, at } = ctx;
    tl.fromTo(big, { scaleX: 5, scaleY: 0.01, opacity: 1 }, { scaleX: 1, scaleY: 1, duration: IN, ease: "expo.out", ...off }, at);
    tl.to(big, { scaleX: 10, scaleY: 0.02, opacity: 0, duration: OUT, ease: "power3.in" }, outAt(at));
    countUp(ctx);
  },

  // Words shoot out of the center to their places, then blow outward.
  words: ({ tl, big, at }) => {
    const { words } = SplitText.create(big, { type: "words" });
    const pieces = words as HTMLElement[];
    gsap.set(big, { position: "relative" });
    gsap.set(pieces, { opacity: 0 });
    tl.fromTo(
      pieces,
      {
        x: (_, piece) => -fromCenter(piece, big).x,
        y: (_, piece) => -fromCenter(piece, big).y,
        scale: 0,
        opacity: 0,
      },
      { x: 0, y: 0, scale: 1, opacity: 1, duration: IN * 0.8, ease: "power3.out", stagger: IN * 0.05, ...off },
      at,
    );
    tl.to(
      pieces,
      {
        x: (_, piece) => fromCenter(piece, big).x * 5,
        y: (_, piece) => fromCenter(piece, big).y * 7,
        scale: 3.4,
        opacity: 0,
        duration: OUT,
        ease: "power2.in",
      },
      outAt(at),
    );
  },

  // Letters fall in from every direction, then scatter.
  chars: ({ tl, big, at }) => {
    const { chars } = SplitText.create(big, { type: "chars" });
    const random = gsap.utils.random(0, Math.PI * 2, true);
    const angles = chars.map(() => random());
    gsap.set(chars, { opacity: 0 });
    const far = () => Math.max(window.innerWidth, window.innerHeight) * 0.85;
    tl.fromTo(
      chars,
      {
        x: (i) => Math.cos(angles[i]) * far(),
        y: (i) => Math.sin(angles[i]) * far(),
        rotation: (i) => (i % 2 ? 200 : -200),
        scale: 4,
        opacity: 0,
      },
      { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: IN, ease: "power3.out", stagger: 0.012, ...off },
      at,
    );
    tl.to(
      chars,
      {
        x: (i) => Math.cos(angles[i]) * far(),
        y: (i) => Math.sin(angles[i]) * far(),
        rotation: (i) => (i % 2 ? -140 : 140),
        scale: 5,
        opacity: 0,
        duration: OUT,
        ease: "power2.in",
      },
      outAt(at),
    );
  },

  // Words race in from opposite sides, and carry on through.
  split: ({ tl, big, at }) => {
    const { words } = SplitText.create(big, { type: "words" });
    const side = (i: number) => (i % 2 ? 1 : -1) * window.innerWidth * 1.1;
    tl.fromTo(
      words,
      { x: (i) => side(i), skewX: (i) => (i % 2 ? 30 : -30), opacity: 1 },
      { x: 0, skewX: 0, duration: IN, ease: "expo.out", ...off },
      at,
    );
    tl.to(words, { x: (i) => -side(i), skewX: (i) => (i % 2 ? -30 : 30), scale: 1.6, duration: OUT, ease: "power3.in" }, outAt(at));
  },

  // A sunburst of streaks behind a zooming headline.
  rays: (ctx) => {
    const { tl, layer, at } = ctx;
    const rays = spawn(layer, "ray", 44);
    const angles = rays.map((_, i) => (i / rays.length) * Math.PI * 2 + gsap.utils.random(-0.05, 0.05));
    // Each ray stops on an ellipse around the text, then flies off along its own angle.
    const edgeX = (i: number, factor: number) => Math.cos(angles[i]) * window.innerWidth * 0.42 * factor;
    const edgeY = (i: number, factor: number) => Math.sin(angles[i]) * window.innerHeight * 0.44 * factor;
    gsap.set(rays, { rotation: (i) => (angles[i] * 180) / Math.PI, scaleX: 0 });
    tl.fromTo(
      rays,
      { x: 0, y: 0, scaleX: 0.05 },
      { x: (i) => edgeX(i, 1), y: (i) => edgeY(i, 1), scaleX: 1, duration: IN, ease: "power3.out", stagger: { each: 0.003, from: "random" }, ...off },
      at,
    );
    tl.to(rays, { x: (i) => edgeX(i, 3), y: (i) => edgeY(i, 3), scaleX: 2, duration: OUT, ease: "power2.in" }, outAt(at));
    zoomBig(ctx);
    countUp(ctx);
  },

  // A circle of color fills the screen from the center.
  iris: (ctx) => {
    const { tl, layer, at } = ctx;
    const [panel] = spawn(layer, "panel", 1);
    tl.fromTo(
      panel,
      { clipPath: "circle(0% at 50% 50%)", opacity: 1 },
      { clipPath: "circle(120% at 50% 50%)", duration: IN, ease: "power2.inOut", ...off },
      at,
    );
    tl.to(panel, { opacity: 0, duration: OUT, ease: "power1.in" }, outAt(at));
    zoomBig(ctx, 0.3);
    countUp(ctx);
  },

  // Rounded squares rush past the viewer, like a tunnel.
  tunnel: (ctx) => {
    const { tl, layer, at } = ctx;
    const rings = spawn(layer, "ring", 9);
    gsap.set(rings, { scale: 0 });
    tl.fromTo(
      rings,
      { scale: 0, opacity: 1 },
      { scale: 11, opacity: 0.15, duration: IN + HOLD, ease: "power1.in", stagger: 0.035, ...off },
      at,
    );
    zoomBig(ctx, 0.04, 9);
    countUp(ctx);
  },

  // Otonmi's brackets open around the sentence.
  bracket: (ctx) => {
    const { tl, layer, at } = ctx;
    const [left] = spawn(layer, "brk brk-l", 1);
    const [right] = spawn(layer, "brk brk-r", 1);
    const open = () => window.innerWidth / 2 - Math.min(window.innerWidth * 0.06, 60) / 2 - 8;
    tl.fromTo(left, { x: 0, scaleY: 0.1 }, { x: () => -open(), scaleY: 1, duration: IN, ease: "expo.out", ...off }, at);
    tl.fromTo(right, { x: 0, scaleY: 0.1 }, { x: () => open(), scaleY: 1, duration: IN, ease: "expo.out", ...off }, at);
    tl.to(left, { x: () => -window.innerWidth, duration: OUT, ease: "power3.in" }, outAt(at));
    tl.to(right, { x: () => window.innerWidth, duration: OUT, ease: "power3.in" }, outAt(at));
    zoomBig(ctx, 0.2);
  },

  // Six detector dots burst into a ring.
  dots: (ctx) => {
    const { tl, layer, at } = ctx;
    const dots = spawn(layer, "dot", 6);
    gsap.set(dots, { scale: 0 });
    const radius = () => Math.min(window.innerWidth * 0.44, window.innerHeight * 0.4);
    const angle = (i: number) => (i / 6) * Math.PI * 2 - Math.PI / 2;
    tl.fromTo(
      dots,
      { x: 0, y: 0, scale: 0 },
      {
        x: (i) => Math.cos(angle(i)) * radius(),
        y: (i) => Math.sin(angle(i)) * radius(),
        scale: 1,
        duration: IN,
        ease: "back.out(1.6)",
        stagger: 0.02,
        ...off,
      },
      at,
    );
    tl.to(
      dots,
      { x: (i) => Math.cos(angle(i)) * radius() * 3.4, y: (i) => Math.sin(angle(i)) * radius() * 3.4, scale: 4, duration: OUT, ease: "power2.in" },
      outAt(at),
    );
    zoomBig(ctx);
  },

  // Slanted pieces of the Lezra mark explode outward.
  shards: (ctx) => {
    const { tl, layer, at } = ctx;
    const shards = spawn(layer, "shard", 20);
    const vmin = () => Math.min(window.innerWidth, window.innerHeight) / 100;
    const reach = () => Math.max(window.innerWidth, window.innerHeight) * 0.56;
    const angles = shards.map((_, i) => (i / shards.length) * Math.PI * 2 + gsap.utils.random(-0.14, 0.14));
    const sizes = shards.map(() => gsap.utils.random(5, 13));
    shards.forEach((shard, i) => {
      shard.style.width = `${sizes[i] * vmin()}px`;
      shard.style.height = `${sizes[i] * 0.74 * vmin()}px`;
      shard.style.margin = `${(-sizes[i] * 0.37 * vmin()).toFixed(1)}px 0 0 ${(-sizes[i] * 0.5 * vmin()).toFixed(1)}px`;
    });
    gsap.set(shards, { skewX: -27, scale: 0 });
    tl.fromTo(
      shards,
      { x: 0, y: 0, scale: 0 },
      {
        x: (i) => Math.cos(angles[i]) * reach(),
        y: (i) => Math.sin(angles[i]) * reach() * 0.86,
        scale: 1,
        duration: IN,
        ease: "power3.out",
        stagger: { each: 0.008, from: "random" },
        ...off,
      },
      at,
    );
    tl.to(
      shards,
      { x: (i) => Math.cos(angles[i]) * reach() * 2.4, y: (i) => Math.sin(angles[i]) * reach() * 2.4, scale: 2, duration: OUT, ease: "power2.in" },
      outAt(at),
    );
    zoomBig(ctx);
  },

  // Slats sweep down the screen from the center, and the figure lands behind them.
  blinds: (ctx) => {
    const { tl, layer, at } = ctx;
    const count = 14;
    const slats = spawn(layer, "slat", count);
    slats.forEach((slat, i) => {
      slat.style.left = `${(i * 100) / count}%`;
      slat.style.width = `${100 / count + 0.2}%`;
    });
    const sweep = { each: 0.012, from: "center" as const };
    gsap.set(slats, { scaleY: 0, transformOrigin: "50% 0%" });
    tl.to(slats, { scaleY: 1, duration: IN * 0.55, ease: "power2.inOut", stagger: sweep }, at);
    tl.set(slats, { transformOrigin: "50% 100%" }, at + IN * 0.75);
    tl.to(slats, { scaleY: 0, duration: IN * 0.5, ease: "power2.inOut", stagger: sweep }, at + IN * 0.75);
    zoomBig(ctx);
    countUp(ctx);
  },

  // A rising bar chart, which then shoots off the top of the screen.
  bars: (ctx) => {
    const { tl, layer, at } = ctx;
    const count = 18;
    const bars = spawn(layer, "bar", count);
    bars.forEach((bar, i) => {
      bar.style.left = `${(i * 100) / count}%`;
      bar.style.width = `${100 / count - 0.5}%`;
      bar.style.height = `${((i + 3) / (count + 3)) * 78}%`;
    });
    gsap.set(bars, { scaleY: 0 });
    tl.to(bars, { scaleY: 1, duration: IN, ease: "power3.out", stagger: 0.012 }, at);
    tl.to(bars, { y: () => -window.innerHeight * 1.2, duration: OUT, ease: "power2.in", stagger: 0.008 }, outAt(at));
    zoomBig(ctx);
    countUp(ctx);
  },

  // Eight pairs of doors open one after another, one for each level.
  gates: (ctx) => {
    const { tl, layer, at } = ctx;
    const levels = 8;
    const doors = spawn(layer, "door", levels * 2);
    doors.forEach((door, i) => {
      door.style.left = i % 2 ? "50%" : "-0.5%";
    });
    const side = (i: number) => (i % 2 ? 104 : -104);
    tl.fromTo(
      doors,
      { xPercent: 0 },
      { xPercent: (i) => side(i), duration: IN * 0.7, ease: "power3.inOut", stagger: (i) => Math.floor(i / 2) * 0.05, ...off },
      at,
    );
    zoomBig(ctx, 0.2, 9);
  },

  // Words swing up one at a time, in 3D.
  flip: ({ tl, big, at }) => {
    const { words } = SplitText.create(big, { type: "words" });
    gsap.set(words, { opacity: 0, transformPerspective: 900, transformOrigin: "50% 50% -120px" });
    tl.fromTo(
      words,
      { rotationX: -100, z: -600, opacity: 0 },
      { rotationX: 0, z: 0, opacity: 1, duration: IN * 0.6, ease: "power3.out", stagger: IN * 0.13, ...off },
      at,
    );
    tl.to(words, { rotationX: 100, z: 500, opacity: 0, duration: OUT, ease: "power2.in", stagger: 0.02 }, outAt(at));
  },

  // Two columns of entries, debits and credits, which run in opposite directions.
  ledger: (ctx) => {
    const { tl, layer, at } = ctx;
    const perColumn = 14;
    const rows = spawn(layer, "ledger-row", perColumn * 2);
    rows.forEach((row, i) => {
      const line = Math.floor(i / 2);
      row.style.left = i % 2 ? "92%" : "8%";
      row.style.top = `${((line + 0.5) * 100) / perColumn}%`;
    });
    gsap.set(rows, { xPercent: -50, scaleX: 0 });
    tl.to(rows, { scaleX: 1, duration: IN, ease: "power3.out", stagger: 0.01 }, at);
    tl.to(
      rows,
      { y: (i) => (i % 2 ? 1 : -1) * window.innerHeight * 1.1, scaleX: 2, duration: OUT, ease: "power2.in" },
      outAt(at),
    );
    zoomBig(ctx);
  },
};

/** Adds every beat of a container in order, and returns the end time. */
export function addBeats(tl: Timeline, root: ParentNode, start: number) {
  let at = start;
  gsap.utils.toArray<HTMLElement>(root.querySelectorAll(".beat")).forEach((beat) => {
    gsap.set(beat, { autoAlpha: 0 });
    const fx = beat.dataset.fx ?? "zoom";
    const big = beat.querySelector<HTMLElement>(".beat-big")!;
    const small = beat.querySelector<HTMLElement>(".beat-small");
    const layer = beat.querySelector<HTMLElement>(".beat-fx");

    tl.set(beat, { autoAlpha: 1 }, at);
    (FX[fx] ?? FX.zoom)({ tl, beat, big, layer, at });
    tl.fromTo(small, { yPercent: 90, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.22, ease: "power2.out", ...off }, at + IN * 0.7);
    tl.to(small, { scale: 1.8, opacity: 0, duration: OUT * 0.7, ease: "power2.in" }, outAt(at));
    tl.set(beat, { autoAlpha: 0 }, at + BEAT_LENGTH);
    at += BEAT_LENGTH;
  });
  return at;
}
