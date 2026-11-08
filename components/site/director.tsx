"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { useRef } from "react";
import { addAppStory, type PhoneRig } from "@/components/site/app-story";
import { bindAutoplay } from "@/components/site/autoplay";
import { addBeats } from "@/components/site/beat-fx";
import type { createFlipScene, FaceSpec } from "@/components/site/flip-scene";
import type { createPhones } from "@/components/site/phone-scene";
import { experience } from "@/content/portfolio";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const { clamp, interpolate } = gsap.utils;
const unit = clamp(0, 1);
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Scroll distance of one timeline second, in svh. */
const UNIT_SVH = 66;
/** Timeline seconds per real second during autoplay. A 1.2 second beat stays about 2.5 seconds. */
const AUTOPLAY_RATE = 0.48;
/** The phone steps carry more to read, so autoplay slows down for them. */
const AUTOPLAY_PHONE_PACE = 0.62;
const lengthFor = (duration: number) => `${100 + duration * UNIT_SVH}svh`;
const TWO_PI = Math.PI * 2;

const FACES: FaceSpec[] = [
  { photo: "/img/me.webp", style: 3 },
  ...experience.map((job) => ({ src: job.logo, style: job.style, ink: job.ink, accent: job.logoAccent })),
];
const TONES = ["#e7e7e5", "#e7e7e5", "#c9c9c7", "#e7e7e5", "#cbcbc9", "#dde1ea"];

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

function buildProject(section: HTMLElement) {
  const kind = section.dataset.project;
  const q = gsap.utils.selector(section);
  const stage = q(".pj-stage")[0] as HTMLElement;
  const head = q("[data-head]")[0] as HTMLElement;
  const lock = q("[data-lock]")[0] as HTMLElement;
  const mark = q("[data-mark]")[0] as unknown as SVGSVGElement;
  const word = q("[data-word]")[0] as unknown as SVGSVGElement;
  const tagline = q("[data-tagline]")[0] as HTMLElement;

  // Computed widths ignore transforms, so they stay correct at any scale.
  const widthOf = (element: Element) => parseFloat(getComputedStyle(element).width);
  const markCenter = () => {
    const gap = parseFloat(getComputedStyle(lock).columnGap) || 0;
    const total = widthOf(mark) + gap + widthOf(word);
    return (lock.offsetWidth - total) / 2 + widthOf(mark) / 2;
  };
  const toCenterY = () => stage.clientHeight / 2 - (head.offsetTop + lock.offsetTop + lock.offsetHeight / 2);
  const setOrigin = () => {
    const x = (markCenter() / head.offsetWidth) * 100;
    const y = ((lock.offsetTop + lock.offsetHeight / 2) / head.offsetHeight) * 100;
    gsap.set(head, { transformOrigin: `${x}% ${y}%` });
  };

  // Everything starts hidden, so the section is blank until the scene begins.
  gsap.set(head, { autoAlpha: 1 });
  gsap.set(word, { clipPath: "inset(-5% 100% -5% 0%)" });
  gsap.set(tagline, { autoAlpha: 0, y: 40 });

  const tl = gsap.timeline({ defaults: { ease: "none" }, paused: true });
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

  // The logo rushes at the viewer and opens into the points.
  tl.to(tagline, { autoAlpha: 0, duration: 0.14 }, 3.5);
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
    3.5,
  );
  tl.to(head, { autoAlpha: 0, duration: 0.08 }, 4.04);

  const end = addBeats(tl, stage, 4.1);
  tl.to({}, { duration: 0.2 }, end);

  section.style.height = lengthFor(tl.duration());
  setOrigin();
  ScrollTrigger.create({
    animation: tl,
    trigger: section,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    invalidateOnRefresh: true,
    onRefresh: setOrigin,
  });
}

function buildAbout() {
  const statement = document.querySelector("[data-statement]");
  if (statement) {
    const split = SplitText.create(statement, { type: "words" });
    gsap.fromTo(
      split.words,
      { opacity: 0.14 },
      { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: statement, start: "top 82%", end: "bottom 48%", scrub: true } },
    );
  }

  gsap.utils.toArray<HTMLElement>("[data-marquee]").forEach((row) => {
    const left = row.dataset.marquee === "left";
    gsap.fromTo(
      row,
      { xPercent: left ? 0 : -30 },
      { xPercent: left ? -30 : 0, ease: "none", scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: true } },
    );
  });

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
function bindSpin(state: { value: number }) {
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

    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const loading = root.classList.contains("is-loading");
    if (loading) lenis.stop();

    const onAnchor = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      event.preventDefault();
      lenis.scrollTo(link.getAttribute("href") === "#top" ? 0 : (link.getAttribute("href") as string), { duration: 1.6 });
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
      const rig: PhoneRig = { enter: 0, step: 0, leave: 0 };
      const slots = gsap.utils.toArray<HTMLElement>(".app-slot").map((element) => ({ element, x: 0, y: 0, height: 0 }));
      const layout = { heroX: 0, heroY: 0, heroSize: 0, xpX: 0, xpY: 0, xpSize: 0, heroH: 1, xpStart: 0, xpEnd: 1, vh: 1, vw: 1 };

      // The whole experience section is one scrubbed timeline.
      const tl = gsap.timeline({ defaults: { ease: "none" }, paused: true });
      const stops: number[] = [];
      gsap.set(rail, { autoAlpha: 0 });
      tl.to(rail, { autoAlpha: 1, duration: 0.25 }, 0.05);

      let t = 0.1;
      items.forEach((item, index) => {
        const job = experience[index];
        const parts = gsap.utils.toArray<HTMLElement>("[data-title]", item);
        stops.push(t);

        gsap.set(parts, { autoAlpha: 0, y: 46 });
        tl.to(parts, { autoAlpha: 1, y: 0, duration: 0.34, ease: "power3.out", stagger: 0.06 }, t);
        t += 0.95;

        // The card opens up to fill the screen.
        tl.to(parts, { autoAlpha: 0, y: -30, duration: 0.2 }, t);
        tl.to(state, { expand: 1, duration: 0.5, ease: "power2.in" }, t);
        tl.to(rail, { color: job.ink, duration: 0.1 }, t + 0.36);
        t += 0.46;

        t = addBeats(tl, item, t, job.app ? (beat, at) => (beat === 1 ? addAppStory(tl, item, at, rig) : at) : undefined);

        tl.to(rail, { color: "#0c0c0d", duration: 0.1 }, t + 0.05);
        tl.to(state, { expand: 0, duration: 0.46, ease: "power2.out" }, t);
        t += 0.46;

        if (index < items.length - 1) {
          tl.to(state, { p: index + 2, duration: 0.8, ease: "sine.inOut" }, t);
          t += 0.8;
        }
      });
      tl.to({}, { duration: 0.3 }, t);

      xp.style.height = lengthFor(tl.duration());
      const trigger = ScrollTrigger.create({ animation: tl, trigger: xp, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true });

      const onRail = (event: Event) => {
        const index = Number((event.currentTarget as HTMLElement).dataset.rail);
        // Land just after the title has fully appeared.
        const position = trigger.start + ((stops[index] + 0.55) / tl.duration()) * (trigger.end - trigger.start);
        lenis.scrollTo(position, { duration: 1.4 });
      };
      railButtons.forEach((button) => button.addEventListener("click", onRail));
      cleanups.push(() => railButtons.forEach((button) => button.removeEventListener("click", onRail)));

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
        document.querySelector<HTMLElement>(".autoplay")?.style.setProperty("--play-bottom", `${window.innerHeight - sentenceTop + 16}px`);
      };
      ScrollTrigger.addEventListener("refresh", measure);
      cleanups.push(() => ScrollTrigger.removeEventListener("refresh", measure));
      measure();

      const pointer = { x: 0, y: 0 };
      let visible = true;
      let lastActive = -1;
      let slotOpen = true;

      const frame = (time: number) => {
        const scrollY = window.scrollY;
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

        const heroProgress = unit(scrollY / layout.heroH);
        const eased = smooth(heroProgress);
        const p = scrollY <= layout.xpStart ? smooth(unit((heroProgress - 0.3) / 0.7)) : state.p;
        const expand = scrollY <= layout.xpStart ? 0 : state.expand;
        const rest = (1 - Math.sin(Math.PI * (p - Math.floor(p)))) * (1 - expand);
        const cover = Math.hypot(layout.vw, layout.vh) * 1.3;

        const baseX = layout.heroX + (layout.xpX - layout.heroX) * eased;
        const baseY = layout.heroY - scrollY * (1 - eased) + (layout.xpY - layout.heroY) * eased;
        const baseSize = layout.heroSize + (layout.xpSize - layout.heroSize) * eased;

        const phonesOn = rig.enter > 0.001 && rig.leave < 0.999;
        if (phonesOn) {
          const from = Math.min(Math.floor(rig.step), APP_STEPS.length - 1);
          const to = Math.min(from + 1, APP_STEPS.length - 1);
          const mix = rig.step - from;
          const sway = Math.sin(Math.PI * mix) * (from % 2 === 0 ? 1 : -1);
          // The phones follow the same pointer drift as the labels above them.
          const driftX = (pointer.x / 0.46) * -26;
          const driftY = (pointer.y / 0.34) * -18;
          phones.draw(
            slots.map((slot, index) => {
              const side = index === 0 ? -1 : 1;
              // The second phone lands a moment after the first.
              const enter = unit((rig.enter - index * 0.1) / (1 - index * 0.1));
              const back = 1 - enter;
              return {
                x: slot.x + driftX,
                y: slot.y + driftY + back * layout.vh * 1.15 + rig.leave * rig.leave * layout.vh * 1.25,
                height: slot.height,
                rotX: back * 0.9 + rig.leave * -0.5,
                rotY: -side * 0.13 + side * back * Math.PI + sway * 0.2 + side * rig.leave * Math.PI,
                rotZ: side * back * 0.2 + sway * side * 0.018,
                from,
                to,
                mix,
                shadow: enter * enter * (1 - rig.leave),
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

        const now = tl.time();
        let active = 0;
        stops.forEach((stop, index) => {
          if (now >= stop) active = index;
        });
        if (active !== lastActive) {
          lastActive = active;
          railButtons.forEach((button, index) => button.toggleAttribute("data-on", index === active));
        }
      };

      gsap.ticker.add(frame);
      cleanups.push(() => gsap.ticker.remove(frame));

      // Hero name opens to both sides as the card leaves.
      const words = gsap.utils.toArray<HTMLElement>(".hero-word");
      const wide = window.innerWidth >= 900;
      gsap.to(words[0], { xPercent: wide ? -70 : -60, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(words[1], { xPercent: wide ? 70 : 60, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero-sentence", { yPercent: -80, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "45% top", scrub: true } });

      gsap.utils.toArray<HTMLElement>("[data-project]").forEach(buildProject);
      ScrollTrigger.create({
        trigger: ".pj-lezra",
        start: "top 30px",
        end: "bottom 30px",
        toggleClass: { targets: ".site-header", className: "on-lime" },
      });
      const contactLetters = buildAbout();
      buildReveals();

      // Entrance: runs under the loader, then the loader lifts off the card.
      const nameSplit = SplitText.create(".hero-name", { type: "chars", mask: "chars", charsClass: "ch" });
      const sentence = SplitText.create(".hero-sentence", { type: "lines", mask: "lines", linesClass: "ln" });

      cleanups.push(bindPointer(pointer, nameSplit.chars as HTMLElement[], contactLetters));
      cleanups.push(bindSpin(spin));
      cleanups.push(
        bindAutoplay(lenis, () => {
          const onPhones = rig.enter > 0.001 && rig.leave < 0.999;
          return (layout.vh * UNIT_SVH * AUTOPLAY_RATE * (onPhones ? AUTOPLAY_PHONE_PACE : 1)) / 100;
        }),
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
      intro.set(".loader", { display: "none" });

      ScrollTrigger.refresh();
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
