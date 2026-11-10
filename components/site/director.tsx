"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { useRef } from "react";
import { bindAutoplay } from "@/components/site/autoplay";
import { bindDiagramLinks } from "@/components/site/diagram-links";
import { addBeats } from "@/components/site/beat-fx";
import type { createFlipScene, FaceSpec } from "@/components/site/flip-scene";
import type { createPhones } from "@/components/site/phone-scene";
import { experience, type Job } from "@/content/portfolio";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const { clamp, interpolate } = gsap.utils;
const unit = clamp(0, 1);
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Scroll distance that belongs to one experience chapter, in svh. */
const SEGMENT_SVH = 60;
/** Share of each wheel step that scrolls the page inside the Experience section. */
const XP_WHEEL = 0.7;
/** Scroll distance a project stays pinned, in svh. */
const PROJECT_PIN_SVH = 26;
/** Playback rate of the points. A 1.2 second point lasts 1.5 seconds. */
const BEAT_RATE = 0.8;
/** Seconds each step of the phone walkthrough stays. */
const STEP_SECONDS = 2;
/** Seconds autoplay leaves a finished chapter on screen. */
const READ_SECONDS = 2.2;
/** Autoplay travel speed between chapters, in screens per second. */
const TRAVEL_SPEED = 0.4;
const INK = "#0c0c0d";
const TWO_PI = Math.PI * 2;
const PROJECT_TINT: Record<string, string> = { otonmi: "#d92a2a", lezra: "#0a0a0a" };

const luminance = (hex: string) => {
  const value = parseInt(hex.slice(1), 16);
  const [r, g, b] = [value >> 16, (value >> 8) & 255, value & 255].map((channel) => {
    const part = channel / 255;
    return part <= 0.03928 ? part / 12.92 : ((part + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
/** The brand accent when it reads on the card face, else the ink. */
const tintOf = (job: Job) => {
  const [light, dark] = [luminance(job.fxColor), luminance(job.face)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05) >= 3 ? job.fxColor : job.ink;
};

const PORTRAIT: FaceSpec = { photo: "/img/me.webp", style: 3 };
// The scroll only uses the portrait and the companies. The two project faces and the second
// portrait are there for the hero, where the visitor turns the card by hand to pick a section.
const FACES: FaceSpec[] = [
  PORTRAIT,
  ...experience.map((job) => ({ src: job.logo, style: job.style, ink: job.ink, accent: job.logoAccent })),
  { src: "/logos/otonmi.svg", style: 0, ink: "#f4f4f2", accent: "#d92a2a" },
  { src: "/logos/lezra.svg", style: 0, ink: "#d8ff1a", accent: "#ffffff" },
  PORTRAIT,
];
/** Page tone behind each face. */
const TONES = ["#e7e7e5", "#e7e7e5", "#c9c9c7", "#e7e7e5", "#cbcbc9", "#dde1ea", "#e7e7e5", "#e4e8d6", "#e7e7e5"];
/** The sections the card can jump to, in face order. Face 0 is the portrait. */
const PICKS = [...experience.map((job) => ({ key: job.short.toLowerCase(), label: job.short })), { key: "otonmi", label: "Otonmi" }, { key: "lezra", label: "Lezra" }];
/** Faces in one full round of the card. The last face is the portrait again. */
const LOOP = FACES.length - 1;
/** Share of the hero scroll where the card can still be turned by hand. The scroll turn starts there. */
const PICK_UNTIL = 0.3;
const wrapFace = gsap.utils.wrap(0, LOOP);

type Scene = ReturnType<typeof createFlipScene>;
type Phones = ReturnType<typeof createPhones>;

const APP_STEPS = experience.flatMap((job) => job.app ?? []);
const screenSet = (key: "patient" | "nurse", small: boolean) => APP_STEPS.map((step) => `/app/${small ? "sm/" : ""}${step[key]}.webp`);

function buildReveals() {
  gsap.set("[data-reveal]", { y: 28, autoAlpha: 0 });
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 92%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        y: 0,
        autoAlpha: 1,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.08,
        delay: Number((batch[0] as HTMLElement).dataset.revealDelay ?? 0),
      }),
  });
}

type ProjectHandle = {
  /** Plays the scene once. A scene already seen stays on its summary unless forced. */
  play: (force: boolean) => void;
  /** Seconds autoplay waits here: the rest of the scene, then time to read. */
  hold: () => number;
  destroy: () => void;
};

/** A project plays by itself: logo build, fly-through, the points, then a summary. */
function buildProject(section: HTMLElement): ProjectHandle {
  const kind = section.dataset.project;
  const q = gsap.utils.selector(section);
  const stage = q(".pj-stage")[0] as HTMLElement;
  const head = q("[data-head]")[0] as HTMLElement;
  const lock = q("[data-lock]")[0] as HTMLElement;
  const mark = q("[data-mark]")[0] as unknown as SVGSVGElement;
  const word = q("[data-word]")[0] as unknown as SVGSVGElement;
  const tagline = q("[data-tagline]")[0] as HTMLElement;
  const sum = q("[data-sum]")[0] as HTMLElement;
  const space = q("[data-logo-space]")[0] as HTMLElement;
  const sumParts = q(".sum-head, .sum-tagline, .sum-meta, .sum-points li");
  const replay = q("[data-replay]")[0] as HTMLElement;

  // Computed widths ignore transforms, so they stay correct at any scale.
  const widthOf = (element: Element) => parseFloat(getComputedStyle(element).width);
  const lockGap = () => parseFloat(getComputedStyle(lock).columnGap) || 0;
  const markCenter = () => {
    const total = widthOf(mark) + lockGap() + widthOf(word);
    return (lock.offsetWidth - total) / 2 + widthOf(mark) / 2;
  };
  const toCenterY = () => stage.clientHeight / 2 - (head.offsetTop + lock.offsetTop + lock.offsetHeight / 2);

  // In the summary the lockup rests small, in the space kept for it beside the link.
  const restScale = () => space.offsetHeight / lock.offsetHeight;
  const spaceAt = () => {
    let x = 0;
    let y = 0;
    for (let node: HTMLElement | null = space; node && node !== stage; node = node.offsetParent as HTMLElement | null) {
      x += node.offsetLeft;
      y += node.offsetTop;
    }
    return { x, y };
  };
  const restX = () => spaceAt().x + (restScale() * widthOf(mark)) / 2 - (head.offsetLeft + markCenter());
  const restY = () => spaceAt().y + space.offsetHeight / 2 - (head.offsetTop + lock.offsetTop + lock.offsetHeight / 2);

  const setOrigin = () => {
    const x = (markCenter() / head.offsetWidth) * 100;
    const y = ((lock.offsetTop + lock.offsetHeight / 2) / head.offsetHeight) * 100;
    gsap.set(head, { transformOrigin: `${x}% ${y}%` });
    space.style.width = `${restScale() * (widthOf(mark) + lockGap() + widthOf(word))}px`;
  };

  // Everything starts hidden, so the section is blank until the scene begins.
  gsap.set(head, { autoAlpha: 1 });
  gsap.set(word, { clipPath: "inset(-5% 100% -5% 0%)" });
  gsap.set(tagline, { autoAlpha: 0, y: 40 });
  gsap.set(sum, { autoAlpha: 0 });

  let seen = false;
  const tl = gsap.timeline({ defaults: { ease: "none" }, paused: true, onComplete: () => void (seen = true) });
  const startScale = () => (window.innerWidth < 900 ? 1.8 : 1.9);

  if (kind === "otonmi") {
    tl.fromTo(q('[data-part="left"]'), { x: -2400 }, { x: 0, duration: 1.1, ease: "power2.out" }, 0.1);
    tl.fromTo(q('[data-part="right"]'), { x: 2400 }, { x: 0, duration: 1.1, ease: "power2.out" }, 0.1);
    tl.fromTo(
      q('[data-part="dot"]'),
      { scale: 0, fill: "#f4f4f2", transformOrigin: "50% 50%" },
      { scale: 1, fill: "#d92a2a", duration: 0.9, ease: "back.out(1.6)" },
      0.6,
    );
  } else {
    tl.fromTo(q('[data-part="top"]'), { x: 400, y: -800, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 1.1, ease: "power2.out" }, 0.1);
    tl.fromTo(q('[data-part="bottom"]'), { x: -400, y: 800, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 1.1, ease: "power2.out" }, 0.1);
    tl.fromTo(
      q('[data-part="accent"]'),
      { scale: 0, rotation: 180, transformOrigin: "50% 50%" },
      { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2)" },
      0.9,
    );
  }

  tl.fromTo(
    mark,
    { x: () => lock.offsetWidth / 2 - markCenter(), y: toCenterY, scale: startScale },
    { x: 0, y: 0, scale: 1, duration: 0.9, ease: "power2.inOut" },
    1.5,
  );
  tl.to(word, { clipPath: "inset(-5% 0% -5% 0%)", duration: 0.8, ease: "power2.out" }, 1.75);
  tl.to(tagline, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, 2.4);

  // The logo build plays at double speed. The rest plays at the pace of the points.
  const BUILD_END = 3;
  const FLY_END = 4;
  tl.call(() => void tl.timeScale(1), undefined, BUILD_END);

  // The logo rushes at the viewer and opens into the points.
  tl.to(tagline, { autoAlpha: 0, duration: 0.14 }, 3.4);
  tl.to(
    head,
    {
      // The mark moves to the middle of the screen while it grows, so the viewer flies through it.
      x: () => stage.clientWidth / 2 - (head.offsetLeft + markCenter()),
      y: toCenterY,
      scale: kind === "otonmi" ? 40 : 34,
      duration: 0.62,
      ease: "power3.in",
    },
    3.4,
  );
  tl.to(head, { autoAlpha: 0, duration: 0.08 }, 3.94);
  tl.call(() => void tl.timeScale(BEAT_RATE), undefined, FLY_END);

  const end = addBeats(tl, stage, FLY_END + 0.05);

  // The lockup returns small, as the heading of the summary.
  tl.call(() => void tl.timeScale(1), undefined, end);
  tl.set(head, { x: restX, y: restY, scale: restScale }, end);
  tl.set(sum, { autoAlpha: 1 }, end);
  tl.to(head, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, end + 0.05);
  tl.fromTo(
    sumParts,
    { y: 28, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out", stagger: 0.06, immediateRender: false },
    end + 0.1,
  );

  section.style.height = `${100 + PROJECT_PIN_SVH}svh`;
  setOrigin();

  // The timeline is not tied to scroll, so a new layout has to be applied by hand.
  const relayout = () => {
    if (tl.isActive()) return;
    tl.progress(0, true);
    tl.invalidate();
    setOrigin();
    tl.progress(1, true);
    if (!seen) tl.progress(0, true);
  };
  ScrollTrigger.addEventListener("refresh", relayout);

  const restart = () => void tl.timeScale(2).play(0);
  replay.addEventListener("click", restart);

  const span = (from: number, to: number) => Math.max(0, to - Math.max(from, tl.time()));
  return {
    play: (force) => {
      if (tl.isActive() || (seen && !force)) return;
      restart();
    },
    hold: () => {
      const left = tl.isActive() ? span(0, BUILD_END) / 2 + span(BUILD_END, FLY_END) + span(FLY_END, end) / BEAT_RATE + span(end, tl.duration()) : 0;
      return left + READ_SECONDS;
    },
    destroy: () => {
      ScrollTrigger.removeEventListener("refresh", relayout);
      replay.removeEventListener("click", restart);
    },
  };
}

function buildAbout() {
  const statement = document.querySelector("[data-statement]");
  if (statement) {
    const split = SplitText.create(statement, { type: "words" });
    gsap.fromTo(
      split.words,
      { opacity: 0.14 },
      { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: statement, start: "top 82%", end: "bottom 66%", scrub: true } },
    );
  }

  gsap.to(".progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });

  const title = document.querySelector("[data-contact-title]");
  if (!title) return [] as HTMLElement[];
  const split = SplitText.create(title, { type: "chars", mask: "chars", charsClass: "ch" });
  gsap.fromTo(
    split.chars,
    { yPercent: 110 },
    { yPercent: 0, ease: "none", stagger: 0.08, scrollTrigger: { trigger: title, start: "top 96%", end: "clamp(top 45%)", scrub: true } },
  );
  return split.chars as HTMLElement[];
}

/** Letters stretch toward the pointer. */
function letterField(letters: HTMLElement[]) {
  gsap.set(letters, { transformOrigin: "50% 100%" });
  const stretch = letters.map((letter) => gsap.quickTo(letter, "scaleY", { duration: 0.5, ease: "power3" }));
  return (x: number, y: number) => {
    letters.forEach((letter, index) => {
      const box = letter.getBoundingClientRect();
      const distance = Math.hypot(x - (box.left + box.width / 2), y - (box.top + box.height / 2));
      stretch[index](1 + 0.2 * Math.max(0, 1 - distance / (window.innerWidth * 0.16)));
    });
  };
}

function bindPointer(pointer: { x: number; y: number }, nameLetters: HTMLElement[], contactLetters: HTMLElement[]) {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};

  const cursor = document.querySelector<HTMLElement>(".cursor")!;
  const label = cursor.querySelector("span")!;
  const cursorX = gsap.quickTo(cursor, "x", { duration: 0.28, ease: "power3" });
  const cursorY = gsap.quickTo(cursor, "y", { duration: 0.28, ease: "power3" });
  const glowX = gsap.quickTo(".glow", "x", { duration: 1.1, ease: "power3" });
  const glowY = gsap.quickTo(".glow", "y", { duration: 1.1, ease: "power3" });
  const tiltX = gsap.quickTo(pointer, "y", { duration: 0.8, ease: "power3" });
  const tiltY = gsap.quickTo(pointer, "x", { duration: 0.8, ease: "power3" });
  const nameField = letterField(nameLetters);
  const contactField = letterField(contactLetters);
  const contact = document.querySelector<HTMLElement>(".contact")!;

  // Big type drifts against the pointer, which gives it depth.
  const layers = gsap.utils.toArray<HTMLElement>(".xp-list, .pj .beats").map((element) => ({
    x: gsap.quickTo(element, "x", { duration: 0.9, ease: "power3" }),
    y: gsap.quickTo(element, "y", { duration: 0.9, ease: "power3" }),
  }));

  const onMove = (event: PointerEvent) => {
    const { clientX: x, clientY: y } = event;
    cursorX(x);
    cursorY(y);
    glowX(x);
    glowY(y);
    const offsetX = x / window.innerWidth - 0.5;
    const offsetY = y / window.innerHeight - 0.5;
    tiltX(offsetY * 0.34);
    tiltY(offsetX * 0.46);
    layers.forEach((layer) => {
      layer.x(offsetX * -26);
      layer.y(offsetY * -18);
    });
    if (window.scrollY < window.innerHeight) nameField(x, y);
    else if (contact.getBoundingClientRect().top < window.innerHeight) contactField(x, y);
  };

  const onOver = (event: PointerEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
    const on = Boolean(target);
    cursor.classList.toggle("is-on", on);
    if (target) label.textContent = target.dataset.cursor ?? "";
    gsap.to(cursor, { scale: on ? 6.4 : 1, duration: 0.3, ease: "power3.out", overwrite: "auto" });
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerover", onOver, { passive: true });

  const removers = gsap.utils.toArray<HTMLElement>(".magnetic").map((element) => {
    const moveX = gsap.quickTo(element, "x", { duration: 0.5, ease: "power3" });
    const moveY = gsap.quickTo(element, "y", { duration: 0.5, ease: "power3" });
    const onElementMove = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      moveX((event.clientX - box.left - box.width / 2) * 0.22);
      moveY((event.clientY - box.top - box.height / 2) * 0.22);
    };
    const onLeave = () => gsap.to(element, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
    element.addEventListener("pointermove", onElementMove);
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointermove", onElementMove);
      element.removeEventListener("pointerleave", onLeave);
    };
  });

  return () => {
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerover", onOver);
    removers.forEach((remove) => remove());
  };
}

/** Drag the card to spin it, or tap for a full turn. It always returns to its face. */
function bindSpin(state: { value: number }, skip: (slot: HTMLElement) => boolean) {
  const slots = gsap.utils.toArray<HTMLElement>("[data-slot]");
  let startX = 0;
  let startSpin = 0;
  let moved = 0;
  let active: HTMLElement | null = null;

  const onMove = (event: PointerEvent) => {
    if (!active) return;
    const delta = event.clientX - startX;
    moved = Math.max(moved, Math.abs(delta));
    state.value = startSpin + delta * 0.012;
  };
  const onUp = () => {
    if (!active) return;
    active.style.cursor = "";
    active = null;
    const target = moved < 5 ? state.value + TWO_PI : Math.round(state.value / TWO_PI) * TWO_PI;
    gsap.to(state, { value: target, duration: 1.1, ease: "elastic.out(1, 0.6)", overwrite: true });
  };
  const onDown = (event: PointerEvent) => {
    if (skip(event.currentTarget as HTMLElement)) return;
    active = event.currentTarget as HTMLElement;
    active.style.cursor = "grabbing";
    startX = event.clientX;
    startSpin = state.value;
    moved = 0;
    gsap.killTweensOf(state);
  };

  slots.forEach((slot) => slot.addEventListener("pointerdown", onDown));
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
  return () => {
    slots.forEach((slot) => slot.removeEventListener("pointerdown", onDown));
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
  };
}

export function Director() {
  const started = useRef(false);

  useGSAP((context) => {
    const root = document.documentElement;
    if (!context || !root.classList.contains("motion") || started.current) return;
    started.current = true;

    let dead = false;
    const cleanups: (() => void)[] = [];

    /** Share of each wheel step that scrolls the page. The Experience section lowers it. */
    let wheelPace = 1;
    const lenis = new Lenis({
      virtualScroll: (data) => {
        if (data.event.type === "wheel") data.deltaY *= wheelPace;
        return true;
      },
    });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const loading = root.classList.contains("is-loading");
    if (loading) lenis.stop();

    /** Set once the scene is built. Returns false for a key that is not a stop. */
    let navigate: ((key: string) => boolean) | null = null;

    const onAnchor = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      event.preventDefault();
      const key = (link.getAttribute("href") as string).slice(1);
      if (navigate?.(key)) return;
      lenis.scrollTo(key === "top" ? 0 : `#${key}`, { duration: 1.2 });
    };
    document.addEventListener("click", onAnchor);

    const fallBack = () => {
      root.classList.remove("motion", "is-loading");
      lenis.start();
      ScrollTrigger.refresh();
    };

    (async () => {
      const canvas = document.querySelector<HTMLCanvasElement>(".stage-canvas");
      if (!canvas) return fallBack();

      await document.fonts.ready;
      const [flip, phoneModule] = await Promise.all([import("@/components/site/flip-scene"), import("@/components/site/phone-scene")]);
      if (dead) return;

      let scene: Scene;
      let phones: Phones;
      try {
        scene = flip.createFlipScene(canvas, FACES);
        const small = window.innerWidth < 900;
        phones = phoneModule.createPhones(scene.renderer, [screenSet("patient", small), screenSet("nurse", small)]);
      } catch {
        return fallBack();
      }
      cleanups.push(phones.destroy, scene.destroy);
      phones.ready.catch(() => {});

      const minLoader = new Promise((resolve) => setTimeout(resolve, loading ? 1050 : 0));
      const timeLimit = new Promise((resolve) => setTimeout(resolve, 4000));
      await Promise.all([minLoader, Promise.race([scene.ready, timeLimit])]);
      if (dead) return;

      context.add(() => build(scene, phones, canvas));
    })();

    function build(scene: Scene, phones: Phones, canvas: HTMLCanvasElement) {
      const xp = document.querySelector<HTMLElement>(".xp")!;
      const stage = document.querySelector<HTMLElement>(".xp-stage")!;
      const heroSlot = document.querySelector<HTMLElement>('[data-slot="hero"]')!;
      const xpSlot = document.querySelector<HTMLElement>('[data-slot="xp"]')!;
      const heroSentence = document.querySelector<HTMLElement>(".hero-sentence")!;
      const tone = document.querySelector<HTMLElement>(".tone")!;
      const rail = document.querySelector<HTMLElement>(".xp-rail")!;
      const railButtons = gsap.utils.toArray<HTMLElement>("[data-rail]");
      const items = gsap.utils.toArray<HTMLElement>(".xp-item");
      const colorAt = interpolate(TONES);

      const state = { p: 1, expand: 0 };
      const spin = { value: 0 };
      /** Faces the visitor has turned the hero card by hand. Whole numbers rest on a face. */
      const pick = { value: 0 };
      const slots = gsap.utils.toArray<HTMLElement>(".app-slot").map((element) => ({ element, x: 0, y: 0, height: 0 }));
      const layout = { heroX: 0, heroY: 0, heroSize: 0, xpX: 0, xpY: 0, xpSize: 0, heroH: 1, xpStart: 0, xpEnd: 1, vh: 1, vw: 1, seg: 1 };
      const autoplay = document.querySelector<HTMLElement>(".autoplay");
      /** Autoplay replays every chapter it reaches, also one the visitor already saw. */
      const replaying = () => autoplay?.dataset.state === "playing";

      // The phone walkthrough plays by itself, and its dots jump to any step.
      const story = document.querySelector<HTMLElement>("[data-app-story]");
      const steps = gsap.utils.toArray<HTMLElement>(".app-step");
      const dots = gsap.utils.toArray<HTMLElement>("[data-app-dot]");
      const fills = dots.map((dot) => dot.querySelector("i"));
      const chrome = gsap.utils.toArray<HTMLElement>(".app-kicker, .app-slot span, .app-link, .app-dots");
      const pulse = document.querySelector<HTMLElement>(".app-link i");
      const phone = { enter: 0, from: 0, to: 0, mix: 0 };
      let step = -1;
      let stepTimer: gsap.core.Tween | null = null;
      let pulseRun: gsap.core.Timeline | null = null;

      const showStep = (next: number) => {
        const first = step < 0;
        const previous = step;
        step = next;
        stepTimer?.kill();
        gsap.set(fills, { scaleX: (index: number) => (index < next ? 1 : 0) });
        dots.forEach((dot, index) => dot.toggleAttribute("data-on", index === next));
        // The fill of the active dot is also the timer of the step.
        stepTimer = gsap.fromTo(
          fills[next],
          { scaleX: 0 },
          { scaleX: 1, duration: STEP_SECONDS + (first ? 0.6 : 0), ease: "none", onComplete: () => showStep((next + 1) % steps.length) },
        );
        if (previous === next) return;

        steps.forEach((element, index) => {
          if (index !== next) gsap.to(element, { autoAlpha: 0, y: -24, duration: 0.25, ease: "power2.in", overwrite: true });
        });
        gsap.fromTo(
          steps[next],
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.35, ease: "power3.out", delay: first ? 0.5 : 0.15, overwrite: true },
        );
        if (first) {
          phone.from = phone.to = next;
          phone.mix = 0;
          return;
        }

        gsap.killTweensOf(phone, "mix");
        phone.from = phone.mix > 0.5 ? phone.to : phone.from;
        phone.to = next;
        phone.mix = 0;
        gsap.to(phone, {
          mix: 1,
          duration: 0.7,
          ease: "power2.inOut",
          onComplete: () => {
            phone.from = next;
            phone.mix = 0;
          },
        });

        // A signal runs between the phones on every change, and its direction alternates.
        const forward = next % 2 === 1;
        pulseRun?.kill();
        pulseRun = gsap
          .timeline()
          .fromTo(pulse, { left: forward ? "0%" : "100%" }, { left: forward ? "100%" : "0%", duration: 0.7, ease: "power1.inOut" }, 0)
          .fromTo(pulse, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.14 }, 0)
          .to(pulse, { autoAlpha: 0, duration: 0.14 }, 0.56);
      };

      const closeApp = () => {
        stepTimer?.kill();
        stepTimer = null;
        pulseRun?.kill();
        gsap.killTweensOf(phone);
        gsap.killTweensOf([...steps, ...chrome]);
        gsap.set([...steps, ...chrome, pulse], { autoAlpha: 0 });
        gsap.set(fills, { scaleX: 0 });
        phone.enter = 0;
        phone.mix = 0;
        step = -1;
      };

      const openApp = () => {
        gsap.set(story, { autoAlpha: 1 });
        gsap.to(chrome, { autoAlpha: 1, duration: 0.4, delay: 0.45, ease: "power2.out" });
        gsap.to(phone, { enter: 1, duration: 0.9, ease: "power3.out" });
        showStep(0);
      };

      const onDot = (event: Event) => showStep(Number((event.currentTarget as HTMLElement).dataset.appDot));
      dots.forEach((dot) => dot.addEventListener("click", onDot));
      cleanups.push(() => dots.forEach((dot) => dot.removeEventListener("click", onDot)));

      // Each chapter is one screen. Its points play in turn, then rest together in a summary.
      type Chapter = {
        face: number;
        job: Job;
        kind: "points" | "app";
        layers: HTMLElement[];
        sum: HTMLElement;
        sumParts: HTMLElement[];
        beats: gsap.core.Timeline | null;
        seen: boolean;
      };
      const chapters: Chapter[] = [];
      items.forEach((item, index) => {
        const job = experience[index];
        const sum = item.querySelector<HTMLElement>("[data-sum]")!;
        const sumParts = gsap.utils.toArray<HTMLElement>(".sum-head, .sum-meta, .sum-points li", item);
        const beats = gsap.timeline({ defaults: { ease: "none" }, paused: true });
        addBeats(beats, item, 0.05);
        const base = { face: index + 1, job, sum, sumParts, seen: false };
        chapters.push({ ...base, kind: "points", beats, layers: [sum, item.querySelector<HTMLElement>(".beats")!] });
        const appStory = item.querySelector<HTMLElement>("[data-app-story]");
        if (appStory) chapters.push({ ...base, sumParts: [], kind: "app", beats: null, layers: [appStory] });
      });
      xp.style.height = `${100 + chapters.length * SEGMENT_SVH}svh`;

      let current = -1;
      let token = 0;
      let run: gsap.core.Timeline | null = null;
      /** True while a curtain jump lands, so the chapter is set without its transition. */
      let snap = false;

      const reset = (chapter: Chapter) => {
        gsap.killTweensOf([...chapter.layers, ...chapter.sumParts]);
        gsap.set(chapter.layers, { autoAlpha: 0 });
        chapter.beats?.pause(0);
        if (chapter.kind === "app") closeApp();
      };

      const showSummary = (chapter: Chapter) => {
        chapter.seen = true;
        gsap.set(chapter.sum, { autoAlpha: 1 });
        gsap.fromTo(
          chapter.sumParts,
          { y: 28, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out", stagger: 0.06, overwrite: true },
        );
      };

      const enter = (chapter: Chapter, force: boolean, mine: number) => {
        if (mine !== token) return;
        if (chapter.kind === "app" || !chapter.beats) return openApp();
        if (chapter.seen && !force) return showSummary(chapter);
        gsap.set(chapter.layers, { autoAlpha: 0 });
        gsap.set(chapter.layers[1], { autoAlpha: 1 });
        chapter.beats.eventCallback("onComplete", () => {
          if (mine === token) showSummary(chapter);
        });
        chapter.beats.timeScale(BEAT_RATE).play(0);
      };

      /** Turns the card to a chapter, opens it to full screen, then plays the chapter. */
      const setChapter = (next: number, force = false) => {
        if (next === current && !force) return;
        const leaving = next === current ? undefined : chapters[current];
        const target = chapters[next];
        current = next;
        const mine = ++token;
        run?.kill();
        chapters.forEach((chapter) => chapter !== leaving && reset(chapter));
        run = gsap.timeline();

        let at = 0;
        if (leaving && snap) reset(leaving);
        else if (leaving) {
          leaving.beats?.pause();
          run.to(leaving.layers, { autoAlpha: 0, duration: 0.2 }, 0);
          at = 0.2;
          if (leaving.kind === "app") {
            stepTimer?.kill();
            gsap.killTweensOf(phone, "enter");
            run.to(phone, { enter: 0, duration: 0.35, ease: "power2.in" }, 0);
            at = 0.35;
          }
          run.call(reset, [leaving], at);
        }

        if (!target) {
          // Back at the hero: the card closes, and the hero scroll drives its turn again.
          state.p = 1;
          run.to(state, { expand: 0, duration: snap ? 0 : 0.4, ease: "power2.out" }, 0);
          run.to(rail, { autoAlpha: 0, duration: 0.2 }, 0);
          return;
        }

        const { face, job } = target;
        if (snap) {
          state.p = face;
          state.expand = 1;
          gsap.set(rail, { autoAlpha: 1, color: job.ink });
          at = 0.3;
        } else {
          const turning = state.p !== face;
          run.to(rail, { autoAlpha: 1, duration: 0.25 }, 0);
          if (turning) {
            const turn = 0.5 + 0.1 * Math.min(3, Math.abs(face - state.p));
            run.to(state, { expand: 0, duration: 0.3, ease: "power2.out" }, 0);
            run.to(rail, { color: INK, duration: 0.1 }, 0.1);
            run.to(state, { p: face, duration: turn, ease: "sine.inOut" }, 0.24);
            at = 0.18 + turn;
          }
          if (turning || state.expand < 1) {
            run.to(state, { expand: 1, duration: 0.45, ease: "power2.in" }, at);
            run.to(rail, { color: job.ink, duration: 0.1 }, at + 0.36);
            at += 0.45;
          }
        }
        if (at > 0) run.call(enter, [target, force, mine], at);
        else enter(target, force, mine);
      };
      chapters.forEach(reset);
      gsap.set(rail, { autoAlpha: 0 });

      const projects = gsap.utils.toArray<HTMLElement>("[data-project]").map((section) => ({
        section,
        kind: section.dataset.project ?? "",
        label: section.dataset.chapter ?? "",
        handle: buildProject(section),
        top: 0,
        bottom: 0,
      }));
      cleanups.push(() => projects.forEach((project) => project.handle.destroy()));

      // Every place the visitor can land on, in page order.
      type Stop = {
        key: string;
        label: string;
        /** The stop is active from this scroll position on. */
        from: number;
        /** Where a jump lands, and where autoplay waits. */
        y: number;
        /** Header links to mark as current. */
        nav: string[];
        hold: () => number;
        place: (stop: Stop) => void;
        count?: number;
        chapter?: number;
        project?: ProjectHandle;
      };
      const pending = () => (run?.isActive() ? run.duration() - run.time() : 0);
      const holdFor = (chapter: Chapter) => {
        if (!chapter.beats) {
          if (step < 0) return pending() + 0.6 + steps.length * STEP_SECONDS;
          return (stepTimer ? stepTimer.duration() - stepTimer.time() : 0) + (steps.length - 1 - step) * STEP_SECONDS;
        }
        const playing = chapter === chapters[current] && (pending() > 0 || chapter.beats.isActive());
        return pending() + (playing ? (chapter.beats.duration() - chapter.beats.time()) / BEAT_RATE : 0) + READ_SECONDS;
      };

      const about = document.querySelector<HTMLElement>("#about")!;
      const contact = document.querySelector<HTMLElement>("#contact")!;
      const topOf = (element: HTMLElement) => element.getBoundingClientRect().top + window.scrollY;
      const stops: Stop[] = [];
      const addStop = (stop: Omit<Stop, "from" | "y">) => stops.push({ from: 0, y: 0, ...stop });
      addStop({
        key: "top",
        label: "Intro",
        nav: ["top"],
        hold: () => 0,
        place: (stop) => {
          stop.from = 0;
          stop.y = 0;
        },
      });
      chapters.forEach((chapter, index) => {
        const company = chapter.job.short.toLowerCase();
        const app = chapter.kind === "app";
        addStop({
          key: app ? `${company}-app` : company,
          label: app ? `${chapter.job.short} · App` : chapter.job.short,
          nav: [company, "experience"],
          count: chapter.face,
          chapter: index,
          hold: () => holdFor(chapter),
          place: (stop) => {
            stop.from = layout.xpStart + index * layout.seg;
            stop.y = stop.from + layout.seg * 0.5;
          },
        });
      });
      projects.forEach((project, index) => {
        addStop({
          key: project.kind,
          label: project.label,
          nav: [project.kind, "projects"],
          count: experience.length + index + 1,
          project: project.handle,
          hold: project.handle.hold,
          place: (stop) => {
            stop.from = project.top - layout.vh * 0.3;
            stop.y = project.top + layout.vh * 0.09;
          },
        });
      });
      addStop({
        key: "about",
        label: "About",
        nav: ["about"],
        hold: () => 2,
        place: (stop) => {
          stop.from = topOf(about) - layout.vh * 0.5;
          stop.y = topOf(about);
        },
      });
      addStop({
        key: "contact",
        label: "Contact",
        nav: ["contact"],
        hold: () => 0,
        place: (stop) => {
          stop.y = ScrollTrigger.maxScroll(window);
          stop.from = Math.min(topOf(contact) - layout.vh * 0.5, stop.y - 4);
        },
      });
      const chapterTotal = experience.length + projects.length;
      const alias: Record<string, string> = { experience: stops[1].key, projects: projects[0]?.kind ?? "" };

      // Ticks on the progress bar, one for each stop.
      const ticksBox = document.querySelector<HTMLElement>(".ticks")!;
      const ticks = stops.map((stop, index) => {
        const tick = document.createElement("button");
        tick.type = "button";
        tick.tabIndex = -1;
        tick.dataset.tick = String(index);
        tick.dataset.cursor = stop.label;
        ticksBox.append(tick);
        return tick;
      });
      cleanups.push(() => ticksBox.replaceChildren());

      const measure = () => {
        const scrollY = window.scrollY;
        const hero = heroSlot.getBoundingClientRect();
        const slot = xpSlot.getBoundingClientRect();
        const stageBox = stage.getBoundingClientRect();
        layout.heroX = hero.left + hero.width / 2;
        layout.heroY = hero.top + scrollY + hero.height / 2;
        layout.heroSize = hero.width;
        layout.xpX = slot.left + slot.width / 2;
        layout.xpY = slot.top - stageBox.top + slot.height / 2;
        layout.xpSize = slot.width;
        layout.vh = canvas.getBoundingClientRect().height;
        layout.vw = window.innerWidth;
        layout.xpStart = xp.offsetTop;
        layout.xpEnd = xp.offsetTop + xp.offsetHeight - layout.vh;
        layout.heroH = layout.xpStart;
        layout.seg = (xp.offsetHeight - stage.offsetHeight) / chapters.length;
        projects.forEach((project) => {
          project.top = topOf(project.section);
          project.bottom = project.top + project.section.offsetHeight;
        });
        const last = ScrollTrigger.maxScroll(window) || 1;
        stops.forEach((stop, index) => {
          stop.place(stop);
          ticks[index].style.left = `${clamp(0.4, 99.6, (stop.y / last) * 100)}%`;
        });
        slots.forEach((slot) => {
          const box = slot.element.getBoundingClientRect();
          slot.x = box.left + box.width / 2;
          slot.y = box.top - stageBox.top + box.height / 2;
          slot.height = box.height;
        });
        scene.resize();
        phones.resize(layout.vw, layout.vh);

        // Offsets ignore the scroll transforms, so this stays right at any scroll position.
        let sentenceTop = 0;
        for (let node: HTMLElement | null = heroSentence; node; node = node.offsetParent as HTMLElement | null) sentenceTop += node.offsetTop;
        autoplay?.style.setProperty("--play-bottom", `${window.innerHeight - sentenceTop + 16}px`);
      };
      ScrollTrigger.addEventListener("refresh", measure);
      cleanups.push(() => ScrollTrigger.removeEventListener("refresh", measure));
      measure();

      const pointer = { x: 0, y: 0 };
      let visible = true;
      let slotOpen = true;

      // Spin to pick: in the hero the card turns by hand through every section, and a tap opens the one it shows.
      const pickName = document.querySelector<HTMLElement>("[data-pick-name]");
      const pickGo = document.querySelector<HTMLElement>("[data-pick-go]");
      const pickSteps = gsap.utils.toArray<HTMLElement>("[data-pick-step]");
      const cursorLabel = document.querySelector<HTMLElement>(".cursor span");
      const pickable = () => window.scrollY / layout.heroH < PICK_UNTIL;
      let dragging = false;
      let returning = false;
      let shownFace = -1;

      const settle = (target: number) =>
        gsap.to(pick, {
          value: target,
          duration: 0.7,
          ease: "power3.out",
          overwrite: true,
          onComplete: () => void (pick.value = wrapFace(pick.value)),
        });
      const stepPick = (direction: number) => settle(Math.round(pick.value) + direction);
      const openPick = () => {
        const face = wrapFace(Math.round(pick.value));
        if (face === 0) stepPick(1);
        else navigate?.(PICKS[face - 1].key);
      };

      /** Keeps the label under the card current, and returns the card to the portrait once the scroll takes over. */
      const syncPick = (heroProgress: number) => {
        if (heroProgress >= PICK_UNTIL && pick.value !== 0 && !returning && !dragging) {
          returning = true;
          const done = () => void (returning = false);
          gsap.to(pick, {
            value: Math.round(pick.value / LOOP) * LOOP,
            duration: 0.45,
            ease: "power2.out",
            overwrite: true,
            onInterrupt: done,
            onComplete: () => {
              pick.value = 0;
              done();
            },
          });
        }
        const face = wrapFace(Math.round(pick.value));
        if (face === shownFace) return;
        shownFace = face;
        const section = face === 0 ? null : PICKS[face - 1];
        if (pickName) pickName.textContent = section ? `Go to ${section.label}` : "Spin to pick a section";
        pickGo?.toggleAttribute("data-on", Boolean(section));
        heroSlot.dataset.cursor = section ? "Open" : "Drag";
        if (cursorLabel && heroSlot.matches(":hover")) cursorLabel.textContent = heroSlot.dataset.cursor;
      };

      let pickStartX = 0;
      let pickStart = 0;
      let pickMoved = 0;
      const onPickDown = (event: PointerEvent) => {
        if (!pickable()) return;
        dragging = true;
        pickStartX = event.clientX;
        pickStart = pick.value;
        pickMoved = 0;
        gsap.killTweensOf(pick);
        heroSlot.style.cursor = "grabbing";
      };
      const onPickMove = (event: PointerEvent) => {
        if (!dragging) return;
        const delta = event.clientX - pickStartX;
        pickMoved = Math.max(pickMoved, Math.abs(delta));
        pick.value = pickStart - delta / Math.max(140, layout.heroSize * 0.6);
      };
      const onPickUp = (event: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        heroSlot.style.cursor = "";
        if (pickMoved < 5 && event.type === "pointerup") return openPick();
        // A short pull is enough to reach the next face.
        const travel = pick.value - pickStart;
        settle(Math.abs(travel) < 0.15 ? Math.round(pickStart) : travel > 0 ? Math.ceil(pick.value) : Math.floor(pick.value));
      };
      const onPickStep = (event: Event) => stepPick(Number((event.currentTarget as HTMLElement).dataset.pickStep));

      heroSlot.addEventListener("pointerdown", onPickDown);
      window.addEventListener("pointermove", onPickMove, { passive: true });
      window.addEventListener("pointerup", onPickUp);
      window.addEventListener("pointercancel", onPickUp);
      pickGo?.addEventListener("click", openPick);
      pickSteps.forEach((button) => button.addEventListener("click", onPickStep));
      cleanups.push(() => {
        gsap.killTweensOf(pick);
        heroSlot.removeEventListener("pointerdown", onPickDown);
        window.removeEventListener("pointermove", onPickMove);
        window.removeEventListener("pointerup", onPickUp);
        window.removeEventListener("pointercancel", onPickUp);
        pickGo?.removeEventListener("click", openPick);
        pickSteps.forEach((button) => button.removeEventListener("click", onPickStep));
      });

      const frame = (time: number) => {
        const scrollY = window.scrollY;
        const heroProgress = unit(scrollY / layout.heroH);
        syncPick(heroProgress);
        wheelPace = scrollY > layout.xpStart && scrollY < layout.xpEnd ? XP_WHEEL : 1;
        if (scrollY > layout.xpEnd + layout.vh * 1.05) {
          if (visible) {
            visible = false;
            canvas.style.visibility = "hidden";
            tone.style.backgroundColor = TONES[0];
          }
          return;
        }
        if (!visible) {
          visible = true;
          canvas.style.visibility = "";
        }

        const eased = smooth(heroProgress);
        // In the hero the scroll turns the card, and so does the hand of the visitor.
        const inHero = scrollY <= layout.xpStart;
        const scrollTurn = smooth(unit((heroProgress - PICK_UNTIL) / (1 - PICK_UNTIL)));
        const p = inHero ? scrollTurn + wrapFace(pick.value) : state.p;
        const expand = state.expand;
        const rest = (1 - Math.sin(Math.PI * (p - Math.floor(p)))) * (1 - expand);
        const cover = Math.hypot(layout.vw, layout.vh) * 1.3;

        const baseX = layout.heroX + (layout.xpX - layout.heroX) * eased;
        const baseY = layout.heroY - scrollY * (1 - eased) + (layout.xpY - layout.heroY) * eased;
        const baseSize = layout.heroSize + (layout.xpSize - layout.heroSize) * eased;

        const phonesOn = phone.enter > 0.001;
        if (phonesOn) {
          const { from, to, mix } = phone;
          const sway = Math.sin(Math.PI * mix) * (to % 2 ? -1 : 1);
          // The phones follow the same pointer drift as the labels above them.
          const driftX = (pointer.x / 0.46) * -26;
          const driftY = (pointer.y / 0.34) * -18;
          phones.draw(
            slots.map((slot, index) => {
              const side = index === 0 ? -1 : 1;
              // The second phone lands a moment after the first.
              const enter = unit((phone.enter - index * 0.1) / (1 - index * 0.1));
              const back = 1 - enter;
              return {
                x: slot.x + driftX,
                y: slot.y + driftY + back * layout.vh * 1.15,
                height: slot.height,
                rotX: back * 0.9,
                rotY: -side * 0.13 + side * back * Math.PI + sway * 0.2,
                rotZ: side * back * 0.2 + sway * side * 0.018,
                from,
                to,
                mix,
                shadow: enter * enter,
              };
            }),
            pointer.y * 0.5 + Math.cos(time * 0.55) * 0.018,
            pointer.x * 0.5 + Math.sin(time * 0.7) * 0.026,
          );
        }

        scene.draw(
          {
            x: baseX + (layout.vw / 2 - baseX) * expand,
            y: baseY + (layout.vh / 2 - baseY) * expand - Math.max(0, scrollY - layout.xpEnd),
            size: baseSize + (cover - baseSize) * expand,
            p,
            // A drag to the left brings the next face, so the card turns with the hand.
            rot: inHero ? scrollTurn - pick.value : p,
            expand,
            tiltX: (pointer.y + Math.cos(time * 0.55) * 0.045) * rest,
            tiltY: (pointer.x + Math.sin(time * 0.7) * 0.07) * rest + spin.value,
          },
          phonesOn ? phones.scene : undefined,
        );

        tone.style.backgroundColor = colorAt(p / (FACES.length - 1));

        const open = expand < 0.02;
        if (open !== slotOpen) {
          slotOpen = open;
          xpSlot.style.pointerEvents = open ? "" : "none";
        }
      };

      gsap.ticker.add(frame);
      cleanups.push(() => gsap.ticker.remove(frame));

      // The scroll position picks the active stop. The stop then plays by itself.
      const counter = document.querySelector<HTMLElement>(".chapter")!;
      const counterCount = counter.querySelector<HTMLElement>("[data-chapter-count]")!;
      const counterName = counter.querySelector<HTMLElement>("[data-chapter-name]")!;
      const navLinks = gsap.utils.toArray<HTMLElement>("[data-nav]");
      const twoDigits = (value: number) => String(value).padStart(2, "0");
      let activeStop = -1;
      let tint = "";

      const activate = (index: number) => {
        activeStop = index;
        const stop = stops[index];
        const force = replaying();
        if (stop.chapter !== undefined) setChapter(stop.chapter, force);
        else if (index === 0) setChapter(-1);
        stop.project?.play(force);

        counter.toggleAttribute("data-on", stop.count !== undefined);
        if (stop.count !== undefined) {
          counterCount.textContent = `${twoDigits(stop.count)} / ${twoDigits(chapterTotal)}`;
          counterName.textContent = stop.label;
        }
        navLinks.forEach((link) => {
          if (stop.nav.includes(link.dataset.nav ?? "")) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
        const face = stop.chapter === undefined ? 0 : chapters[stop.chapter].face;
        railButtons.forEach((button, order) => button.toggleAttribute("data-on", order + 1 === face));
        ticks.forEach((tick, order) => tick.toggleAttribute("data-on", order === index));
      };

      const track = () => {
        const y = lenis.scroll;
        let index = 0;
        stops.forEach((stop, order) => {
          if (stop.from <= y + 1) index = order;
        });
        if (index !== activeStop) activate(index);

        // The progress bar takes the color of the chapter that fills the screen.
        const project = projects.find((entry) => y >= entry.top - 2 && y < entry.bottom - 2);
        const chapter = chapters[current];
        const inside = y > layout.xpStart && y < layout.xpEnd + layout.vh;
        const next = project ? (PROJECT_TINT[project.kind] ?? "") : chapter && inside && state.expand > 0.9 ? tintOf(chapter.job) : "";
        if (next === tint) return;
        tint = next;
        if (next) {
          root.dataset.chapter = "on";
          root.style.setProperty("--chapter", next);
        } else delete root.dataset.chapter;
      };
      gsap.ticker.add(track);
      cleanups.push(() => {
        gsap.ticker.remove(track);
        delete root.dataset.chapter;
      });

      // A long jump hides behind a curtain. A short one scrolls.
      const curtain = document.querySelector<HTMLElement>(".curtain")!;
      let wipe: gsap.core.Timeline | null = null;
      const jump = (y: number, after?: () => void) => {
        const target = clamp(0, lenis.limit, y);
        if (Math.abs(target - lenis.scroll) < layout.vh * 1.2) {
          lenis.scrollTo(target, { duration: 0.9 });
          after?.();
          return;
        }
        wipe?.kill();
        wipe = gsap
          .timeline()
          .set(curtain, { transformOrigin: "50% 100%" })
          .to(curtain, { scaleY: 1, duration: 0.42, ease: "power3.inOut" })
          .call(() => {
            snap = true;
            lenis.scrollTo(target, { immediate: true, force: true });
            ScrollTrigger.update();
            track();
            snap = false;
            after?.();
          })
          .set(curtain, { transformOrigin: "50% 0%" })
          .to(curtain, { scaleY: 0, duration: 0.5, ease: "power3.inOut" }, "+=0.08");
      };

      navigate = (key) => {
        const stop = stops.find((entry) => entry.key === (alias[key] ?? key));
        if (stop) jump(stop.y);
        return Boolean(stop);
      };
      cleanups.push(() => void (navigate = null));

      const FORWARD = ["ArrowDown", "ArrowRight", "PageDown"];
      const BACKWARD = ["ArrowUp", "ArrowLeft", "PageUp"];
      // While a detail view is open, the keys belong to it: Escape closes it and the arrows scroll it.
      let detailsOpen = false;
      let closeDetails = () => {};
      const onKey = (event: KeyboardEvent) => {
        if (detailsOpen) {
          if (event.key === "Escape") closeDetails();
          return;
        }
        if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
        if ((event.target as HTMLElement).closest?.("input, textarea, select, [contenteditable]")) return;
        const forward = FORWARD.includes(event.key);
        if (!forward && !BACKWARD.includes(event.key)) return;
        event.preventDefault();
        const at = lenis.targetScroll;
        const stop = forward ? stops.find((entry) => entry.y > at + 4) : [...stops].reverse().find((entry) => entry.y < at - 4);
        if (stop) jump(stop.y);
      };
      window.addEventListener("keydown", onKey);

      const onTick = (event: Event) => jump(stops[Number((event.currentTarget as HTMLElement).dataset.tick)].y);
      ticks.forEach((tick) => tick.addEventListener("click", onTick));

      const onRail = (event: Event) => {
        const face = Number((event.currentTarget as HTMLElement).dataset.rail) + 1;
        const stop = stops.find((entry) => entry.chapter !== undefined && chapters[entry.chapter].face === face);
        if (stop) jump(stop.y);
      };
      railButtons.forEach((button) => button.addEventListener("click", onRail));

      const replays = items.map((item) => item.querySelector<HTMLElement>("[data-replay]"));
      const onReplay = (event: Event) => {
        const face = replays.indexOf(event.currentTarget as HTMLElement) + 1;
        setChapter(chapters.findIndex((chapter) => chapter.face === face && chapter.kind === "points"), true);
      };
      replays.forEach((button) => button?.addEventListener("click", onReplay));

      const watchAgain = document.querySelector<HTMLElement>("[data-watch-again]");
      const onWatchAgain = () =>
        jump(0, () => {
          if (!replaying()) autoplay?.querySelector("button")?.click();
        });
      watchAgain?.addEventListener("click", onWatchAgain);

      // Details: the full view of one section rises over the page, and the page waits under it.
      const sheet = document.querySelector<HTMLElement>(".sheet");
      const behind = gsap.utils.toArray<HTMLElement>("main, .site-header, .autoplay");
      const openers = gsap.utils.toArray<HTMLElement>("[data-details-open]");
      const closers = gsap.utils.toArray<HTMLElement>("[data-details-close]");
      let opener: HTMLElement | null = null;
      let sheetMove: gsap.core.Timeline | null = null;

      closeDetails = () => {
        if (!sheet || !detailsOpen) return;
        detailsOpen = false;
        behind.forEach((element) => (element.inert = false));
        lenis.start();
        opener?.focus({ preventScroll: true });
        sheetMove?.kill();
        sheetMove = gsap.timeline().to(sheet, { yPercent: 100, duration: 0.45, ease: "power3.in" }).set(sheet, { visibility: "hidden" });
      };
      const openDetails = (event: Event) => {
        opener = event.currentTarget as HTMLElement;
        const panel = sheet?.querySelector<HTMLElement>(`[data-details="${opener.dataset.detailsOpen}"]`);
        if (!sheet || !panel) return;
        sheet.querySelectorAll<HTMLElement>("[data-details]").forEach((entry) => (entry.hidden = entry !== panel));
        detailsOpen = true;
        lenis.stop();
        behind.forEach((element) => (element.inert = true));
        sheet.scrollTop = 0;
        sheetMove?.kill();
        // Visible before the focus call, since a hidden button cannot take focus.
        gsap.set(sheet, { visibility: "visible", yPercent: 100 });
        sheetMove = gsap
          .timeline()
          .to(sheet, { yPercent: 0, duration: 0.6, ease: "power3.inOut" })
          .fromTo(
            panel.querySelectorAll("[data-rise]"),
            { y: 28, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out", stagger: 0.06 },
            0.3,
          )
          // The map builds from its base up, one layer after the other. Its link lines come last.
          .fromTo(
            panel.querySelectorAll("[data-layer]"),
            { y: 36, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.55, ease: "power3.out", stagger: 0.16 },
            0.55,
          )
          .fromTo(panel.querySelectorAll(".map-links, .map-tags"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, ">-0.15");
        panel.querySelector<HTMLElement>("[data-details-close]")?.focus({ preventScroll: true });
      };
      openers.forEach((button) => button.addEventListener("click", openDetails));
      closers.forEach((button) => button.addEventListener("click", closeDetails));
      cleanups.push(bindDiagramLinks());

      cleanups.push(() => {
        sheetMove?.kill();
        openers.forEach((button) => button.removeEventListener("click", openDetails));
        closers.forEach((button) => button.removeEventListener("click", closeDetails));
        behind.forEach((element) => (element.inert = false));
        wipe?.kill();
        window.removeEventListener("keydown", onKey);
        railButtons.forEach((button) => button.removeEventListener("click", onRail));
        replays.forEach((button) => button?.removeEventListener("click", onReplay));
        watchAgain?.removeEventListener("click", onWatchAgain);
      });

      // Hero name opens to both sides as the card leaves.
      const words = gsap.utils.toArray<HTMLElement>(".hero-word");
      const wide = window.innerWidth >= 900;
      gsap.to(words[0], { xPercent: wide ? -70 : -60, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(words[1], { xPercent: wide ? 70 : 60, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero-sentence", { yPercent: -80, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "45% top", scrub: true } });
      // The pick row leaves before the scroll starts to turn the card.
      gsap.to(".hero-pick", { autoAlpha: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: `${PICK_UNTIL * 100}% top`, scrub: true } });

      ScrollTrigger.create({
        trigger: ".pj-lezra",
        start: "top 30px",
        end: "bottom 30px",
        toggleClass: { targets: ".site-header, .chapter", className: "on-lime" },
      });
      const contactLetters = buildAbout();
      buildReveals();

      // Entrance: runs under the loader, then the loader lifts off the card.
      const nameSplit = SplitText.create(".hero-name", { type: "chars", mask: "chars", charsClass: "ch" });
      const sentence = SplitText.create(".hero-sentence", { type: "lines", mask: "lines", linesClass: "ln" });

      cleanups.push(bindPointer(pointer, nameSplit.chars as HTMLElement[], contactLetters));
      cleanups.push(bindSpin(spin, (slot) => slot === heroSlot && pickable()));
      cleanups.push(
        bindAutoplay(
          lenis,
          () => layout.vh * TRAVEL_SPEED,
          () => stops,
        ),
      );

      const intro = gsap.timeline({
        onComplete: () => {
          root.classList.remove("is-loading");
          lenis.start();
          ScrollTrigger.refresh();
          try {
            sessionStorage.setItem("seen", "1");
          } catch {}
        },
      });
      intro.to(".loader", { backgroundColor: "rgba(231,231,229,0)", duration: 0.45, ease: "power2.out" }, 0);
      intro.to(".loader-card", { autoAlpha: 0, duration: 0.4, ease: "power2.out" }, 0);
      intro.from(nameSplit.chars, { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.028 }, 0.05);
      intro.from(sentence.lines, { yPercent: 110, duration: 1, ease: "expo.out", stagger: 0.09 }, 0.3);
      intro.from(".site-header > *", { autoAlpha: 0, duration: 0.8 }, 0.5);
      intro.to(".autoplay", { autoAlpha: 1, duration: 0.6, ease: "power2.out" }, 0.8);
      intro.fromTo(".hero-pick > *", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "power2.out" }, 0.8);
      intro.set(".loader", { display: "none" });

      ScrollTrigger.refresh();
      // A reload in the middle of the page lands on its chapter without the card turn.
      snap = true;
      track();
      snap = false;
    }

    return () => {
      dead = true;
      started.current = false;
      document.removeEventListener("click", onAnchor);
      gsap.ticker.remove(raf);
      cleanups.forEach((cleanup) => cleanup());
      lenis.destroy();
    };
  });

  return null;
}
