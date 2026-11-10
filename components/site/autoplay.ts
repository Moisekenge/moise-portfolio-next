import gsap from "gsap";
import type Lenis from "lenis";

type State = "idle" | "playing" | "paused" | "ended";

const LABEL: Record<State, string> = { idle: "Play", playing: "Pause", paused: "Resume", ended: "Replay" };
const DESCRIPTION: Record<State, string> = {
  idle: "Play automatic scroll",
  playing: "Pause automatic scroll",
  paused: "Resume automatic scroll",
  ended: "Replay from the top",
};
const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown", "Home", "End", " ", "Escape"]);
const NEAR_TOP = 40;
const LONGEST_STEP_MS = 100;

/** A scroll position where autoplay waits, so the chapter there can play to its end. */
export type AutoStop = { y: number; hold: () => number };

/**
 * Moves the page on its own while "playing". Chapters play on arrival, so autoplay
 * travels to each stop and waits there. Any manual input takes over at once.
 */
export function bindAutoplay(lenis: Lenis, speed: () => number, stops: () => AutoStop[]) {
  const root = document.querySelector<HTMLElement>(".autoplay");
  const button = root?.querySelector("button");
  const label = root?.querySelector(".autoplay-label");
  if (!root || !button || !label) return () => {};

  let state: State = "idle";
  let position = 0;
  /** Seconds left to wait at the current stop. */
  let wait = 0;

  const atEnd = () => lenis.scroll >= lenis.limit - 2;

  const place = () => root.toggleAttribute("data-compact", state !== "idle" || lenis.scroll > NEAR_TOP);

  const setState = (next: State) => {
    state = next;
    root.dataset.state = next;
    label.textContent = LABEL[next];
    button.setAttribute("aria-label", DESCRIPTION[next]);
    place();
  };

  const pause = () => {
    if (state === "playing") setState("paused");
  };

  const tick = (_time: number, deltaMs: number) => {
    if (state !== "playing") return;
    // The step is capped, so returning to a hidden tab never jumps the page.
    const seconds = Math.min(deltaMs, LONGEST_STEP_MS) / 1000;
    if (wait > 0) {
      wait -= seconds;
      return;
    }
    const next = stops().find((stop) => stop.y > position + 1);
    position = Math.min(lenis.limit, position + speed() * seconds);
    if (next && position >= next.y) {
      position = next.y;
      wait = next.hold();
    }
    lenis.scrollTo(position, { immediate: true, force: true });
    if (position >= lenis.limit) setState("ended");
  };

  const onScroll = () => {
    if (state !== "playing") {
      if (atEnd() && state !== "ended") setState("ended");
      else if (state === "ended" && !atEnd()) setState("paused");
    }
    place();
  };

  const onPress = () => {
    if (state === "playing") return setState("paused");
    if (atEnd()) lenis.scrollTo(0, { immediate: true, force: true });
    position = lenis.scroll;
    wait = 0;
    setState("playing");
  };

  const fromControl = (event: Event) => event.target instanceof Node && root.contains(event.target);
  const onTouch = (event: Event) => {
    if (!fromControl(event)) pause();
  };
  const onKey = (event: KeyboardEvent) => {
    if (SCROLL_KEYS.has(event.key) && !fromControl(event)) pause();
  };
  // A press to the right of the page content is a press on the scrollbar.
  const onMouseDown = (event: MouseEvent) => {
    if (event.clientX >= document.documentElement.clientWidth) pause();
  };
  const onClick = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest("a, [data-rail], [data-tick], [data-app-dot], [data-replay], [data-details-open]")) pause();
  };

  button.addEventListener("click", onPress);
  window.addEventListener("wheel", pause, { passive: true });
  window.addEventListener("touchstart", onTouch, { passive: true });
  window.addEventListener("keydown", onKey);
  window.addEventListener("mousedown", onMouseDown);
  document.addEventListener("click", onClick, true);
  const stopListening = lenis.on("scroll", onScroll);
  gsap.ticker.add(tick);
  place();

  return () => {
    gsap.ticker.remove(tick);
    stopListening();
    button.removeEventListener("click", onPress);
    window.removeEventListener("wheel", pause);
    window.removeEventListener("touchstart", onTouch);
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("mousedown", onMouseDown);
    document.removeEventListener("click", onClick, true);
  };
}
