# Portfolio UI/UX Reference

Everything that shapes how this site looks, moves, and behaves, from first paint to the last link. Values in this file come from the code. When the two disagree, the code wins.

## 1. Direction

The site is one long scroll-driven film. It uses a pale grey page, very large black type, one 3D card that travels through the whole story, and a full-screen moment for each point.

Principles the design holds to:

- **One idea per screen.** Each achievement gets the full viewport. Nothing competes with it.
- **The scroll is the timeline.** Animations follow the scroll position, so visitors control pace and direction.
- **One object carries the story.** The portrait card flips into each company logo, then opens to become the section background.
- **Every section starts blank.** Content arrives after the section begins, never already on screen.
- **Name once.** The name appears large in the hero and not repeatedly elsewhere.
- **Real proof.** Logos come from the companies. App screens come from the real MobiSoins app.
- **Motion is optional.** No JavaScript, no WebGL, or reduced motion all get a complete, readable page.

Main reference: the United Carriers scroll site, for its sticky stages and scrubbed motion. Mobbin and Pinterest were used for wider inspiration.

## 2. Stack and libraries

| Library | Version | Role on this site |
| --- | --- | --- |
| Next.js | 16.2.6 | App Router, static export to `out/` |
| React / React DOM | 19.2.4 | Page markup |
| Tailwind CSS | 4.3.0 | Base layer, `@theme` font tokens, a few utility classes |
| GSAP | 3.15.1 | Timelines, `ScrollTrigger`, `SplitText`, `quickTo`, ticker |
| @gsap/react | 2.1.2 | `useGSAP` setup and cleanup |
| Lenis | 1.3.27 | Smooth scrolling, runs on the GSAP ticker |
| Three.js | 0.187.0 | The 3D card and phones, all with custom GLSL shaders |
| next/font | bundled | Geist and Geist Mono with `display: swap` |
| TypeScript, ESLint | 5, 9 | Types and lint |

Most styling is hand-written CSS in `app/globals.css`. Tailwind is a light base, not the main styling tool.

Installed but not used by the live page: `@base-ui/react`, `class-variance-authority`, `lucide-react`, `shadcn`, `tw-animate-css`. `components/ui/button.tsx` and `lib/utils.ts` (with `clsx` and `tailwind-merge`) also remain from an earlier version, and nothing on the page imports them.

Not in the shipped site: the Motion library (replaced by GSAP and Lenis), Spline, and the earlier background music.

## 3. Visual system

### Color

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#e7e7e5` | Page background |
| `--ink` | `#0c0c0d` | Text; redefined per company and project |
| `--mute` | `#4f4f54` | Secondary text |
| Skill grey | `#98989a` | Skill words before hover |

The fixed background changes tone as the card turns, through `#e7e7e5`, `#e7e7e5`, `#c9c9c7`, `#e7e7e5`, `#cbcbc9`, `#dde1ea`. A soft white radial glow follows the pointer.

Each company and project supplies its own palette.

| Section | Card face | Ink | Accent | Text on accent |
| --- | --- | --- | --- | --- |
| AMD | `#0a0a0b` black | `#ffffff` | `#d9a441` | `#0a0a0b` |
| Thales | `#f2f2f0` white | `#2d2e75` | `#5fc1d7` | `#2d2e75` |
| Jonas Software | `#0a0a0b` black | `#ffffff` | `#ffffff` | `#0a0a0b` |
| MobiSoins | `#f2f2f0` white | `#203e80` | `#82bf5a` | `#10264f` |
| Webacy | `#14163d` brand gradient | `#ffffff` | `#7fe9f2` | `#14163d` |
| Otonmi | `#0a0a0a` black | `#f4f4f2` | `#d92a2a` | `#ffffff` |
| Lezra | `#d8ff1a` lime | `#0a0a0a` | `#0a0a0a` | `#d8ff1a` |

### Typography

Geist for everything, Geist Mono for small labels. Big type is tight, with negative letter spacing.

| Element | Size | Weight | Tracking |
| --- | --- | --- | --- |
| Hero name, desktop | `min(16.2vw, 34svh)` | 600 | -0.06em |
| Hero name, phone | `27vw`, two lines | 600 | -0.06em |
| Hero sentence | `clamp(1.625rem, min(3.3vw, 6svh), 3.25rem)` | 500 | -0.035em |
| Beat headline | `clamp(3rem, min(9.4vw, 17svh), 10.5rem)` | 600 | -0.05em |
| Beat figure (100+, 6x) | `clamp(7rem, min(31vw, 52svh), 32rem)` | 600 | -0.05em |
| Beat support line | `clamp(1.375rem, min(3vw, 5.4svh), 3rem)` | 500 | -0.025em |
| Company title | `clamp(3rem, 5.4vw, 6rem)` | 500 | -0.05em |
| App step title | `clamp(3rem, min(8vw, 17svh), 8.5rem)` | 600 | -0.05em |
| About statement | `clamp(2.5rem, 7.4vw, 8.5rem)` | 500 | -0.05em |
| Skill row | `clamp(2.25rem, 6.4vw, 6.5rem)` | 500 | -0.05em |
| Contact title | `24vw` | 600 | -0.065em |
| Mono labels | `0.8125rem` to `0.9375rem` | 400 | small |
| Body | `1.125rem`, line height 1.45 | 400 | none |

Sizes use both `vw` and `svh`, so wide but short screens stay within the viewport.

### Space and shape

- Page gutter: `clamp(16px, 3.4vw, 56px)`.
- Card and loader corner radius: 22.5% of width. The same shape repeats in the tunnel rings.
- Pills for primary actions: the email button and the Play control.
- Hero card size: `min(36svh, 28vw)` on desktop, `min(36svh, 62vw)` on phones.
- Main breakpoint: `900px`.

## 4. Page structure

Fixed layers, bottom to top:

| Layer | z-index | Purpose |
| --- | --- | --- |
| `.tone` and `.glow` | 0 | Changing background and pointer glow |
| `canvas.stage-canvas` | 1 | The one WebGL renderer |
| `main` | 2 | All page content |
| `.site-header` | 40 | Navigation, blends against any color |
| `.progress` | 45 | 3px scroll progress line, blend mode difference |
| `.autoplay` | 46 | Play control |
| `.loader` | 50 | First-visit loader |
| `.cursor` | 60 | Custom cursor |

Sections in order: Hero, Experience (AMD, Thales, Jonas Software, MobiSoins, Webacy), Otonmi, Lezra, About, Contact. A small "Nothing here." page handles 404s.

All copy lives in `content/portfolio.ts`. Layout is in `app/page.tsx`. The motion is in `components/site/`.

## 5. Motion system

### Foundation

- Lenis drives scrolling and runs on the GSAP ticker, with `lagSmoothing(0)`.
- Each animated section is a sticky stage inside a tall section, tied to one paused GSAP timeline with `scrub: true`.
- Section height comes from timeline length: `100svh + duration × 66svh`.
- `UNIT_SVH = 66` sets scroll pace. It went from 40 to 54 to 66 in response to feedback that scrolling felt too fast.
- Nav links scroll with Lenis over 1.6 seconds.
- Hidden starting states are set up front with `gsap.set` or CSS, so scrubbing backward restores them correctly.

### Loader and entrance

First visit only, tracked in `sessionStorage`:

1. A rounded square, the same size and place as the hero card, draws its outline in 0.8 seconds, then fills black.
2. The loader stays at least 1.05 seconds and waits up to 4 seconds for textures. A CSS failsafe hides it after 6 seconds.
3. The loader fades, leaving the 3D card exactly where the square was.
4. Name letters rise out of masks (1.1s, `expo.out`, 0.028s stagger).
5. Sentence lines rise at 0.3s. The header fades in at 0.5s. Play fades in at 0.8s.

### Hero

- As the page scrolls, "Moïse" slides left and "Kenge" slides right (70% on desktop, 60% on phones).
- The sentence lifts and fades by 45% of the hero.
- The card travels from the hero position to the Experience position and starts turning.

### The 3D card

One mesh shows all six faces, the portrait and five logos, by swapping textures while edge-on.

- Geometry: a 96-segment box with corners pulled onto a quarter circle.
- Vertex shader: the card bends and its far edges flare while turning.
- Fragment shader: a hand-built studio environment gives key light, fill light, a reflection strip, and fresnel edges.
- Face styles: black, white, Webacy navy with teal and blue corners, and photo.
- Logos are SVGs drawn to a 1024px canvas. The red channel marks the main shape and the green channel marks the accent, so brand colors stay exact.
- At rest it floats slightly and tilts toward the pointer.
- Drag spins it at 0.012 radians per pixel. A tap gives one full turn. It always springs back to its face (`elastic.out(1, 0.6)`, 1.1s).
- A soft shadow plane narrows as the card turns.

### Experience timeline

The whole section is one timeline. For each company:

1. Company name, role, and dates rise in (0.34s, 0.06s stagger) and hold.
2. Title leaves and the card opens to fill the screen with a size of `hypot(viewport) × 1.3`.
3. Beats play on the company color.
4. A closing beat links to the company site.
5. The card shrinks, then turns to the next logo (0.8s, `sine.inOut`).

A company rail (AMD, Thales, Jonas, MobiSoins, Webacy) appears at the top. It highlights the current company, takes on the company's ink color, and jumps to any company over 1.4 seconds.

### Beats

Each beat is 1.2 timeline seconds: 0.46 in, 0.38 hold, 0.36 out. Headlines start tiny at the center, reach full size, then fly past the viewer. Support lines rise under them. Figures count up from zero.

| Effect | What happens | Used for |
| --- | --- | --- |
| `rays` | 44 streaks burst around the headline | AMD |
| `stretch` | Flat bright line opens, then tears sideways | Thales |
| `zoom` | Headline flies from a point past the viewer | Jonas "100+" |
| `words` | Words shoot from center, then blow outward | Jonas RAG |
| `tunnel` | 9 rounded squares rush past | Jonas "6x" |
| `chars` | Letters fall from all directions, then scatter | MobiSoins "0 to 1." |
| `split` | Words race in from opposite sides | MobiSoins booking |
| `iris` | A circle of color fills the screen | MobiSoins "900+" |
| `blinds` | 14 slats sweep from the center | Webacy "100+" |
| `bars` | 18 bars rise, then shoot upward | Webacy "+15%" |
| `bracket` | Otonmi brackets open around the sentence | Otonmi |
| `dots` | 6 dots burst into a ring, one per detector | Otonmi |
| `gates` | 8 pairs of doors open, one per level | Otonmi Gauntlet |
| `flip` | Words swing up in 3D | Lezra lifecycle |
| `ledger` | Debit and credit columns run opposite ways | Lezra ledger |
| `shards` | 20 slanted pieces of the Lezra mark explode | Lezra Temporal |

Each effect relates to its content where possible: six dots for six detectors, eight doors for eight levels, two columns for double-entry.

The closing beat shows the domain in very large type (font size based on character count), with a pulsing outline, a magnetic hover, and a color fill on hover.

### MobiSoins walkthrough

Two 3D phones, patient and nurse, play one booking in sync after the second MobiSoins beat. Steps: Book, Dispatch, Accept, Track, Arrive, Care, Done.

Timing in timeline seconds: enter 0.9, each step holds 0.42, each swap 0.36, leave 0.6.

- Phones are built entirely in code, with no image or model file. Body is a beveled extrusion in glossy black, with side keys, 12 speaker holes, 2 screws, and a port.
- The notch, speaker slit, and blue-glint camera lens are drawn in the screen shader.
- Screen change: the next screen rises like an app sheet, while the current one zooms back 6% and darkens.
- Entrance: phones rise from below while flipping from the back. The second lands slightly after the first.
- During swaps the phones sway in alternating directions. A dot runs along the line between them to suggest a signal.
- Exit: phones drop and turn away.
- Phones share the card's WebGL renderer and draw in an overlay pass with fresh depth, so they always sit above the card.
- Screens load one at a time so no frame pays for all uploads at once. Phones under 900px get 420px-wide images, others 720px.

### Projects

Otonmi uses a black stage and Lezra a lime stage. Each runs as one scrubbed timeline:

1. The logo assembles from its real parts at center. Otonmi's brackets slide in and the red dot pops. Lezra's two halves converge and the accent spins in.
2. The mark moves left while the wordmark wipes in.
3. The tagline appears, then the logo rushes at the viewer and the viewer flies through it into the beats.

The header switches to solid dark text on Lezra, since blend mode reads poorly on lime.

### About and contact

- Statement words brighten from 14% opacity with scroll.
- Skill rows move in opposite directions with scroll. Words darken on hover.
- Contact title letters rise from masks. Email and links fade up.

### Pointer details

Fine pointers only:

- 14px white cursor with blend mode difference. Grows 6.4x with a label over `data-cursor` items: Drag, Open, Write.
- Magnetic pull on CTAs and the email button, strength 0.22, elastic return.
- Hero and contact letters stretch up to 1.2x near the pointer.
- Large text layers drift against the pointer for depth. Phones match this drift.
- Link underlines draw from left on hover.

## 6. Play control

Lets visitors watch the site as a film without replacing manual scrolling. Code is in `components/site/autoplay.ts`.

Rules: it never starts by itself, there is no choice screen, and manual input always wins.

| State | Label | Where | When |
| --- | --- | --- | --- |
| Idle | `▶ Play` with "or scroll" | Above the hero sentence | Page load at top |
| Idle, scrolled | `▶` | Bottom-right corner | Visitor scrolls without pressing Play |
| Playing | `❚❚ Pause` | Corner | After pressing Play or Resume |
| Paused | `▶ Resume` | Corner | Pause press, wheel, touch, scroll key, scrollbar, nav, rail, or any link |
| Ended | `↺ Replay` | Corner | Bottom reached; restarts from top |

- Speed: `viewport height × 0.3168` per second, 285 px/s on a 900px-high screen. A beat takes about 2.5 seconds.
- Phone steps play at 62% speed, because they have more to read.
- The step per frame is capped at 100ms, so returning to a hidden tab never jumps the page.
- Under 900px the corner control shows its icon only and clears the nurse phone.
- Full Play run is about 2.4 minutes.
- Black pill with a thin white ring, so it reads on every section color.

## 7. Responsive behavior

| Area | Under 900px | 900px and up |
| --- | --- | --- |
| Hero name | Two lines | One line |
| Company title | Under the card | Bottom left |
| Company rail | Below header | In header row |
| App story | Stacked, copy above phones | Copy left, phones right |
| Phone height | `min(52svh, 84vw)` | `min(76svh, 760px)` |
| WebGL pixel ratio cap | 1.5 | 2 |
| Screen images | 420px wide | 720px wide |

Layout uses `svh` so mobile browser bars do not cause jumps. Touch devices have no custom cursor or pointer effects. The card allows `touch-action: pan-y`, so vertical swipes still scroll.

## 8. Accessibility and fallbacks

- A script before first paint adds `html.motion` only if the visitor allows motion and WebGL exists. All hiding CSS is scoped under `.motion`.
- If the 3D scene fails to start, the class is removed and the static page shows.
- Without motion, the site is a normal document: experience list with logos, seven app steps with 14 images, wrapped skills, and all links. The Play control is not rendered visibly.
- `prefers-reduced-motion` removes CSS animation.
- Semantic headings, ordered lists, `aria-label` on sections, and `aria-hidden` on decorative duplicates and the canvas.
- Alt text for portrait, logos, and app screens.
- Visible focus rings and 44px minimum targets on links and Play.
- `aria-label` on Play changes with state.
- JSON-LD `Person` data for search engines.

## 9. Performance

- One WebGL context, one render loop on the GSAP ticker.
- Three.js loads through dynamic import after fonts are ready.
- The canvas hides once the story has passed, so About and Contact pay no WebGL cost.
- Pointer motion uses `gsap.quickTo`.
- SplitText and effect pieces are created once.
- App screens are WebP. `public/app` is 1.3 MB in total.
- Measured in a local test browser: about 180 fps on the MobiSoins section, with a 5.6ms p95 frame.

## 10. Assets

- **Portrait:** `public/img/me.webp`, also used as the card's photo face.
- **Company logos:** SVGs in `public/logos/`, marked with `data-l` so the shader can color each part.
- **Project logos:** vector traces of the Otonmi and Lezra kits in `content/logo-art.ts`, kept in separate parts for animation.
- **App screens:** 14 screens in `public/app/`, with smaller copies in `public/app/sm/`. They were captured from the real MobiSoins app on an Android emulator using a mock session. Retouching removed the developer tab and simulation links and replaced the simulated address line.

## 11. Design history

1. Static HTML portfolio ported to Next.js, Tailwind, and shadcn, with a music toggle.
2. A "Living Index" redesign was tried, then rejected: small top text, repeated name, and an unappealing globe.
3. New direction: scroll-motion site based on the United Carriers reference, with GSAP and Lenis replacing Motion. Static port files and music were removed.
4. Refinements from review: portrait treatment, Thales color, removal of a stray dot, blank section starts, burst effects for bullets, and links to company sites.
5. MobiSoins walkthrough added. Two synced phones were chosen, limited to patient and nurse. Magnific was the first choice for the phone image; the shipped phone is procedural Three.js.
6. Screens recaptured from the current app, with the developer tab removed.
7. Scroll slowed twice. Play control added.
8. Hero title changed to AI Engineer.

## 12. File map

| File | Responsibility |
| --- | --- |
| `app/layout.tsx` | Fonts, motion gate script, fixed layers, Play markup |
| `app/page.tsx` | Sections, beats, app story, JSON-LD |
| `app/globals.css` | All design tokens and component styles |
| `app/not-found.tsx` | 404 page |
| `content/portfolio.ts` | All copy, company colors, beats, app steps |
| `content/logo-art.ts` | Project logo vector paths |
| `components/site/director.tsx` | Lenis, timelines, render loop, pointer, drag spin |
| `components/site/beat-fx.ts` | 16 beat effects and the closing CTA |
| `components/site/app-story.ts` | Two-phone timeline |
| `components/site/flip-scene.ts` | 3D card, shaders, renderer |
| `components/site/phone-scene.ts` | 3D phones and screen transitions |
| `components/site/autoplay.ts` | Play control |
| `components/site/header.tsx` | Navigation |
| `components/site/project-logos.tsx` | Otonmi and Lezra lockups |

## 13. Tuning

| To change | Edit |
| --- | --- |
| Scroll pace, also changes Play speed | `UNIT_SVH` in `director.tsx` |
| Play speed only | `AUTOPLAY_RATE` in `director.tsx` |
| Play speed on phones | `AUTOPLAY_PHONE_PACE` in `director.tsx` |
| Beat timing | `IN`, `HOLD`, `OUT` in `beat-fx.ts` |
| Phone step timing | `ENTER`, `HOLD`, `SWAP`, `LEAVE` in `app-story.ts` |
| Any wording or company color | `content/portfolio.ts` |
| Background tones | `TONES` in `director.tsx` |

## 14. Build and deploy

`next build` writes a static site to `out/`, served by Cloudflare Pages with no Node runtime. Images are unoptimized at build, since assets are already sized.
