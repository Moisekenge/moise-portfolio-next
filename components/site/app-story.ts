import gsap from "gsap";

type Timeline = gsap.core.Timeline;

/** Scroll-driven values the render loop reads to pose the phones. */
export type PhoneRig = { enter: number; step: number; leave: number };

const ENTER = 0.9;
const HOLD = 0.42;
const SWAP = 0.36;
const LEAVE = 0.6;
const off = { immediateRender: false };

/** Adds the two-phone walkthrough to the timeline, and returns the end time. */
export function addAppStory(tl: Timeline, root: ParentNode, start: number, rig: PhoneRig) {
  const story = root.querySelector<HTMLElement>("[data-app-story]");
  if (!story) return start;

  const steps = gsap.utils.toArray<HTMLElement>(story.querySelectorAll(".app-step"));
  const chrome = gsap.utils.toArray<HTMLElement>(story.querySelectorAll(".app-kicker, .app-slot span, .app-link"));
  const pulse = story.querySelector<HTMLElement>(".app-link i");

  gsap.set(story, { autoAlpha: 0 });
  gsap.set(steps, { autoAlpha: 0, y: 44 });
  gsap.set(chrome, { autoAlpha: 0 });
  gsap.set(pulse, { left: "0%", autoAlpha: 0 });

  tl.set(story, { autoAlpha: 1 }, start);
  tl.to(rig, { enter: 1, duration: ENTER, ease: "power3.out" }, start);
  tl.to(chrome, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, start + ENTER * 0.55);
  tl.to(steps[0], { autoAlpha: 1, y: 0, duration: 0.34, ease: "power3.out" }, start + ENTER * 0.6);

  let at = start + ENTER;
  steps.forEach((step, index) => {
    at += HOLD;
    if (index === steps.length - 1) return;

    tl.to(step, { autoAlpha: 0, y: -36, duration: SWAP * 0.5, ease: "power2.in" }, at);
    tl.to(rig, { step: index + 1, duration: SWAP, ease: "power2.inOut" }, at);
    tl.fromTo(steps[index + 1], { autoAlpha: 0, y: 44 }, { autoAlpha: 1, y: 0, duration: SWAP * 0.6, ease: "power3.out", ...off }, at + SWAP * 0.45);

    // A signal runs between the phones on every change, and its direction alternates.
    const forward = index % 2 === 0;
    tl.fromTo(pulse, { left: forward ? "0%" : "100%" }, { left: forward ? "100%" : "0%", duration: SWAP, ease: "power1.inOut", ...off }, at);
    tl.fromTo(pulse, { autoAlpha: 0 }, { autoAlpha: 1, duration: SWAP * 0.2, ...off }, at);
    tl.to(pulse, { autoAlpha: 0, duration: SWAP * 0.2 }, at + SWAP * 0.8);
    at += SWAP;
  });

  tl.to(steps[steps.length - 1], { autoAlpha: 0, y: -36, duration: LEAVE * 0.4, ease: "power2.in" }, at);
  tl.to(chrome, { autoAlpha: 0, duration: LEAVE * 0.4 }, at);
  tl.to(rig, { leave: 1, duration: LEAVE, ease: "power2.in" }, at);
  at += LEAVE;
  tl.set(story, { autoAlpha: 0 }, at);
  return at;
}
