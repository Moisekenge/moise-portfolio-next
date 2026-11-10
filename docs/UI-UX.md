# Portfolio UI/UX Reference

Everything that shapes how this site looks, moves, and behaves, from first paint to the last link. Values in this file come from the code. When the two disagree, the code wins.

## 1. Direction

The site is a short film in chapters. It uses a pale grey page, very large black type, one 3D card that travels through the whole story, and a full-screen moment for each point.

The whole page is about 10 screens long at 1440x900. An earlier version was 43.9 screens. Nothing was removed to get there: each chapter now plays by itself on one screen instead of being spread over many screens of scroll.

Principles the design holds to:

- **One idea per screen.** Each achievement gets the full viewport. Nothing competes with it.
- **Scroll moves between chapters. Chapters play by themselves.** A visitor scrolls, presses a key, or presses a link to reach a company or project. Its points then play in turn and rest together in one summary frame.
- **Every chapter is one press away.** The 3D card in the hero, the header, the ticks on the progress bar, the company rail, and the arrow keys all jump straight to a chapter.
- **One object carries the story.** The portrait card flips into each company logo, then opens to become the section background.
- **Every section starts blank.** Content arrives after the section begins, never already on screen.
- **Name once.** The name appears large in the hero and not repeatedly elsewhere.
- **Real proof.** Logos come from the companies. App screens come from the real MobiSoins app.
- **Motion is optional.** No JavaScript, no WebGL, or reduced motion all get a complete, readable page.

Main reference: the United Carriers scroll site, for its sticky stages and large type. Mobbin and Pinterest were used for wider inspiration.

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

Icons: `simple-icons` supplies the brand marks and `lucide-react` the generic icons. Both are read on the server, so only the paths in use reach the page. `simple-icons` has no AWS or Twilio mark, so those two are drawn in `icon.tsx`. It also has no mark for OpenAI, Azure, C#, or Java, and those lines show without an icon.

Installed but not used by the live page: `@base-ui/react`, `class-variance-authority`, `shadcn`, `tw-animate-css`. `components/ui/button.tsx` and `lib/utils.ts` (with `clsx` and `tailwind-merge`) also remain from an earlier version, and nothing on the page imports them.

Not in the shipped site: the Motion library (replaced by GSAP and Lenis), Spline, and the earlier background music.

## 3. Visual system

### Color

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#e7e7e5` | Page background |
| `--ink` | `#0c0c0d` | Text; redefined per company and project |
| `--mute` | `#4f4f54` | Secondary text |

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
| Hero name, phone | `min(27vw, 21svh)`, two lines | 600 | -0.06em |
| Hero sentence | `clamp(1.625rem, min(3.3vw, 6svh), 3.25rem)` | 500 | -0.035em |
| Beat headline | `clamp(3rem, min(9.4vw, 17svh), 10.5rem)` | 600 | -0.05em |
| Beat figure (100+, 6x) | `clamp(7rem, min(31vw, 52svh), 32rem)` | 600 | -0.05em |
| Beat support line | `clamp(1.375rem, min(3vw, 5.4svh), 3rem)` | 500 | -0.025em |
| Summary company name | `clamp(3rem, min(10vw, 17svh), 10rem)` | 600 | -0.055em |
| Summary point | `clamp(1.375rem, min(2.5vw, 4.4svh), 2.5rem)` | 600 | -0.04em |
| Summary meta row, chip, counter | `0.8125rem` to `0.875rem`, Geist Mono | 400 | small |
| App step title | `clamp(3rem, min(8vw, 17svh), 8.5rem)` | 600 | -0.05em |
| About statement | `clamp(2.5rem, 7.4vw, 8.5rem)` | 500 | -0.05em |
| Stack column title | `clamp(1.375rem, 2vw, 1.875rem)` | 500 | -0.04em |
| Stack line | `clamp(0.9375rem, 1.15vw, 1.0625rem)` | 400 | -0.01em |
| Contact title | `24vw` | 600 | -0.065em |
| Mono labels | `0.8125rem` to `0.9375rem` | 400 | small |
| Body | `1.125rem`, line height 1.45 | 400 | none |

Sizes use both `vw` and `svh`, so wide but short screens stay within the viewport.

### Space and shape

- Page gutter: `clamp(16px, 3.4vw, 56px)`.
- Card and loader corner radius: 22.5% of width. The same shape repeats in the tunnel rings.
- Pills for primary actions: the email button, the Play control, and the link chip beside each company name.
- Hero card size: `min(34svh, 28vw)` on desktop, centered at 26svh. Under 900px it is `min(36svh, 62vw)`, capped by the free height above the hero text, and never under 96px. The cap keeps the card clear of the name on screens such as 800px wide. The free height also leaves 52px under the card for the pick row.
- Main breakpoint: `900px`.

## 4. Page structure

Fixed layers, bottom to top:

| Layer | z-index | Purpose |
| --- | --- | --- |
| `.tone` and `.glow` | 0 | Changing background and pointer glow |
| `canvas.stage-canvas` | 1 | The one WebGL renderer |
| `main` | 2 | All page content |
| `.site-header` | 40 | Navigation, blends against any color |
| `.chapter` | 44 | Chapter counter, bottom left |
| `.progress` | 45 | 3px scroll progress line |
| `.autoplay` | 46 | Play control |
| `.ticks` | 47 | One tick on the progress line for each stop |
| `.curtain` | 48 | Covers the screen during a long jump |
| `.sheet` | 49 | Details view of one section |
| `.loader` | 50 | First-visit loader |
| `.cursor` | 60 | Custom cursor |

Sections in order: Hero, Experience (AMD, Thales, Jonas Software, MobiSoins, the MobiSoins app walkthrough, Webacy), Otonmi, Lezra, About, Contact. A small "Nothing here." page handles 404s.

### Length

| Viewport | Page length | Note |
| --- | --- | --- |
| 1440x900 | 9086px, 10.1 screens | Was 43.9 screens, so 77% shorter |
| 800x900 | 9.57 screens | |
| 375x812 | 9.64 screens | |

The Experience section is `100svh + 6 × 60svh`, one 60svh segment for each of its six chapters. Each project section is `100svh + 26svh`.

The first compact build used 36svh segments and was 8.66 screens long (80.3% shorter). The Experience section then went by too fast under the wheel, so the segments grew to 60svh.

### Stops

The page has 11 stops, in this order: Intro, AMD, Thales, Jonas, MobiSoins, MobiSoins · App, Webacy, Otonmi, Lezra, About, Contact. Every navigation control and the Play control use the same list, so they always agree on where a chapter is.

All copy lives in `content/portfolio.ts`. Layout is in `app/page.tsx`. The motion is in `components/site/`.

## 5. Motion system

### Foundation

- Lenis drives scrolling and runs on the GSAP ticker, with `lagSmoothing(0)`.
- The scroll position only picks the active stop. On each frame the director finds the last stop the page has reached. When that stop changes, its chapter starts.
- A chapter is a time-based GSAP timeline, not a scrubbed one. It plays once on arrival and ends on its summary frame.
- A chapter the visitor has already seen opens straight on its summary. It plays again when the visitor presses Replay, or when the Play control is running.
- Chapter length in scroll is fixed: `SEGMENT_SVH = 60` for each Experience chapter and `PROJECT_PIN_SVH = 26` for each project.
- Inside the Experience section each wheel step scrolls 70% of its normal distance (`XP_WHEEL = 0.7`). With the longer segments, the same wheel movement covers about 2.4 times fewer chapters than in the first compact build. Touch, keys, and jumps are not slowed.
- The hero, the About statement, the Contact title, and the progress line still follow the scroll directly.
- Hidden starting states are set up front with `gsap.set` or CSS, so every chapter starts blank.
- A reload in the middle of the page lands on its chapter without the card turn.

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

One mesh shows every face by swapping textures while edge-on. The scroll uses six faces: the portrait and the five company logos. The hero adds the Otonmi and Lezra marks, and the portrait once more to close the round.

- Geometry: a 96-segment box with corners pulled onto a quarter circle.
- Vertex shader: the card bends and its far edges flare while turning.
- Fragment shader: a hand-built studio environment gives key light, fill light, a reflection strip, and fresnel edges.
- Face styles: black, white, Webacy navy with teal and blue corners, and photo.
- Logos are SVGs drawn to a 1024px canvas. The red channel marks the main shape and the green channel marks the accent, so brand colors stay exact.
- At rest it floats slightly and tilts toward the pointer.
- In the Experience section, a drag spins it at 0.012 radians per pixel and a tap gives one full turn. It always springs back to its face (`elastic.out(1, 0.6)`, 1.1s).
- A soft shadow plane narrows as the card turns.

### Spin to pick

In the hero the card is also a section picker.

- A drag to the left turns the card to the next face, and a drag to the right to the previous one. The order is: portrait, AMD, Thales, Jonas, MobiSoins, Webacy, Otonmi, Lezra, then the portrait again. The round has no end in either direction.
- One face takes a drag of 60% of the card width, and never less than 140px. A pull of 15% of that is enough to reach the next face. The card then settles on it (0.7s, `power3.out`).
- One round arrow button sits on each side of the card, at its middle height. Each press turns the card one face, for visitors who do not drag. The buttons are 52px (44px under 900px), with a thin ink ring and a line arrow. On hover they fill with ink.
- A mono label under the card names the face: "Spin to pick a section" on the portrait, an underlined "Go to Jonas" on a logo.
- A tap on the card, or a press on the label, jumps to the section the card shows. On the portrait, a tap turns the card to the first section.
- The pick works for the first 30% of the hero scroll. After that the scroll turns the card, the row has faded out, and the card returns to the portrait (0.45s).
- The cursor label on the card is "Drag" on the portrait and "Open" on a logo.
- About and Contact have no face. They stay in the header.

### Experience chapters

Each company is one chapter on one screen. When the visitor arrives:

1. The content of the previous chapter fades (0.2s). The card closes (0.3s), turns to the new logo (`sine.inOut`, 0.5s plus 0.1s for each face it passes, 0.8s at most), and opens to fill the screen (0.45s, `power2.in`) with a size of `hypot(viewport) × 1.3`.
2. The points play in turn on the company color, each with its own full-screen effect.
3. The summary frame arrives. Its parts rise in (0.5s, `power3.out`, 0.06s stagger).

The summary frame holds everything about the company at once:

- The company name in very large type.
- A link chip beside the name, with the company domain. It opens the company site in a new tab.
- A Replay link, which plays the points again.
- A mono row: role, dates, and place.
- Every point side by side, headline over support line. Three columns from 900px, one column under it.

Scrolling back to the hero closes the card (0.4s), and the hero scroll drives its turn again.

A company rail (AMD, Thales, Jonas, MobiSoins, Webacy) sits at the top left of the stage. It highlights the current company, takes on the company's ink color, and jumps to any company.

### Beats

Each point is one beat of 1.2 timeline seconds: 0.46 in, 0.38 hold, 0.36 out. Chapters play their beats at `BEAT_RATE = 0.8`, so a beat lasts 1.5 seconds on screen. Headlines start tiny at the center, reach full size, then fly past the viewer. Support lines rise under them. Figures count up from zero.

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

All 16 effects from the long version remain. The earlier closing beat, which showed the domain in very large type, is gone. The link chip in the summary frame does its job.

### MobiSoins walkthrough

Two 3D phones, patient and nurse, play one booking in sync. The walkthrough is its own chapter, "MobiSoins · App", right after the MobiSoins points. It takes one screen. Steps: Book, Dispatch, Accept, Track, Arrive, Care, Done.

It plays by itself:

- The phones enter over 0.9 seconds.
- Each step stays for `STEP_SECONDS = 2` seconds. The first step gets 0.6 seconds more, to cover the entrance.
- The step text leaves in 0.25 seconds and the next arrives in 0.35 seconds. The phone screens change over 0.7 seconds.
- After the last step it returns to the first, and loops for as long as the chapter is on screen.
- The phones leave in 0.35 seconds when the visitor moves on.

Seven step dots sit under the step text. The fill of the active dot is also the timer of its step. A press on any dot jumps to that step.

- Phones are built entirely in code, with no image or model file. Body is a beveled extrusion in glossy black, with side keys, 12 speaker holes, 2 screws, and a port.
- The notch, speaker slit, and blue-glint camera lens are drawn in the screen shader.
- Screen change: the next screen rises like an app sheet, while the current one zooms back 6% and darkens.
- Entrance: phones rise from below while flipping from the back. The second lands slightly after the first.
- During swaps the phones sway in alternating directions. A dot runs along the line between them (0.7s) to suggest a signal, and its direction alternates.
- Exit: phones drop and turn away.
- Phones share the card's WebGL renderer and draw in an overlay pass with fresh depth, so they always sit above the card.
- Screens load one at a time so no frame pays for all uploads at once. Phones under 900px get 420px-wide images, others 720px.

### Projects

Otonmi uses a black stage and Lezra a lime stage. Each plays as one timeline when the visitor arrives:

1. The logo assembles from its real parts at center. Otonmi's brackets slide in and the red dot pops. Lezra's two halves converge and the accent spins in.
2. The mark moves left while the wordmark wipes in, and the tagline appears. Steps 1 and 2 play at double speed, so the build takes about 1.5 seconds.
3. The logo rushes at the viewer and the viewer flies through it into the points.
4. The points play at the same pace as the company points.
5. The lockup returns small as the heading of the summary frame, with the link chip, Replay, the tagline, a mono row of dates and stack, and every point side by side.

The header and the chapter counter switch to solid dark text on Lezra, since blend mode reads poorly on lime.

### About and contact

- Statement words brighten from 14% opacity with scroll.
- The Stack list has four columns: AI / ML, Languages, Frameworks, Infra / Cloud. Each line has a one-color brand icon when the icon set has one. The icon slot stays when there is none, so every name starts at the same place. The columns fade up as they enter the screen. Under 900px the list has two columns.
- Contact title letters rise from masks. Email and links fade up.
- A closing row ends the page: "Watch again", "Back to top", and a mono line with location and year.

### Details view

The summary frame is short on purpose. A filled "Details +" pill beside the company name opens the full view of that section.

- Every section has a Details button: the five companies and the two projects. The walkthrough chapter has one too, beside its step dots, and it opens the MobiSoins view.
- The view has three blocks: Experience (or Project), Tech stack, and Architecture. From 900px the text sits on the left, the stack on the right, and the architecture map takes the full width under them. Under 900px they stack.
- Architecture is a map of boxes that reads from the bottom up. The base layer is drawn lowest and each layer above builds on it.
  - The map sits in a frame with rounded corners and a dot grid. The head of the frame holds the section name and a legend.
  - A box has an icon tile, a name, and a short note. Icons are one color and take the ink of the section.
  - A line leads from each layer to the layer above it. It can carry a label in a small pill, for example `REST` or `TypeORM`.
  - Outside services stand left and right of the layer they serve. A curved line joins each one to the box it links to. A solid line is a request and a dotted line is realtime. These lines can carry a label too, for example `Admin SDK`.
  - The director draws the side lines from the measured layout (`diagram-links.ts`) and redraws them when the map changes size. Lines that meet one edge of a box are spread along it so they do not cross.
  - Under 900px, and without motion, the boxes stack and no side lines are drawn. Each side box then names its links in words, for example "→ NestJS API · Admin SDK".
  - On open, the layers rise in one after the other from the base up (0.55s, `power3.out`, 0.16s stagger). The side lines fade in last.
  - In the site copy, a map is a list of layers, base first. A layer has its `nodes`, an optional `up` label, and optional `left` and `right` side nodes with their `links`.
- A block with nothing to show is left out. AMD and Thales are incoming roles, so their views hold the Experience block only, until there is a stack and an architecture to list.
- The text follows the LinkedIn profile. Lezra is not on the profile yet, so its text comes from the site copy. The MobiSoins map follows the system diagram supplied by the owner, box for box. In the other maps, every box is a fact from the profile or the site copy, but the grouping into layers and their order are an editorial reading, not a copy of a system design document.
- The view takes the colors of its section: the card face as background and the section ink as text.
- Open: the view rises from the bottom in 0.6 seconds (`power3.inOut`). Its parts then rise in (0.5s, `power3.out`, 0.06s stagger).
- Close: the Close button or Escape. The view drops in 0.45 seconds (`power3.in`).
- While the view is open, the page under it does not scroll and the Play control is paused. The view scrolls by itself when its content is taller than the screen.

### Pointer details

Fine pointers only:

- 14px white cursor with blend mode difference. Grows 6.4x with a label over `data-cursor` items: Drag, Open, Write, Replay, More, Close, Play, Top, and the name of a stop or walkthrough step.
- Magnetic pull on the link chips and the email button, strength 0.22, elastic return.
- Hero and contact letters stretch up to 1.2x near the pointer.
- Large text layers drift against the pointer for depth. Phones match this drift.
- Link underlines draw from left on hover.

## 6. Navigation

Every control below jumps to a stop from the list in section 4.

| Control | Where | What it does |
| --- | --- | --- |
| `MK` mark | Header, left | Back to top |
| Header links | Header, right | Experience, Projects, About, Contact. The link of the current section keeps its underline (`aria-current`). |
| Header lists | Under Experience and Projects | Experience lists the five companies. Projects lists Otonmi and Lezra. A list opens on hover or keyboard focus, on fine pointers only. |
| Progress ticks | On the progress line | One tick for each of the 11 stops, placed at its scroll position. The current tick is taller. A press jumps there, on fine pointers only. The cursor shows the stop name. |
| Company rail | Top left of the Experience stage | Jumps to a company |
| 3D card | Hero | Drag it, or use the arrows on its left and right, to turn to a company or project. Tap it to jump there. |
| Arrow keys | Keyboard | Down, Right, or Page Down goes to the next stop. Up, Left, or Page Up goes to the previous stop. |
| Step dots | Under the walkthrough text | Jumps to a walkthrough step |
| Replay | Summary frame | Plays the points of that chapter again |
| Details | Summary frame, and beside the step dots | Opens the full view of that section: experience, tech stack, architecture |
| Watch again | Closing row | Returns to the top and starts the Play control |
| Back to top | Closing row | Returns to the top |

### Jumps

- A jump shorter than 1.2 screens scrolls there over 0.9 seconds.
- A longer jump hides behind a curtain. A dark panel (`#0c0c0d`) rises from the bottom in 0.42 seconds, the page moves at once behind it, and after 0.08 seconds the panel leaves upward in 0.5 seconds. Both moves use `power3.inOut`.
- Behind the curtain the chapter is set without its card turn, so the visitor never sees the card spin through companies it skipped.

### Chapter counter

A mono counter sits at the bottom left: `03 / 07` and the chapter name. The count covers the five companies and two projects. The walkthrough shares the MobiSoins number and shows "MobiSoins · App". The counter is hidden at the top, About, and Contact.

### Chapter color

Inside a chapter the progress line takes one color from that chapter: the brand accent when it has enough contrast against the card face (a ratio of 3 or more), otherwise the chapter ink. Otonmi uses `#d92a2a` and Lezra uses `#0a0a0a`. Outside a chapter the line is white with blend mode difference.

The cursor, the ticks, and the counter do not take the chapter color. They stay white with blend mode difference, which reads on every background.

## 7. Play control

Lets visitors watch the site as a film without replacing manual scrolling. Code is in `components/site/autoplay.ts`.

Rules: it never starts by itself, there is no choice screen, and manual input always wins.

Chapters play on arrival, so the Play control only has to travel and wait. It moves the page to the next stop, waits there until the chapter has finished and the visitor has had time to read, then moves on.

| State | Label | Where | When |
| --- | --- | --- | --- |
| Idle | `▶ Play` with "or scroll" | Above the hero sentence | Page load at top |
| Idle, scrolled | `▶` | Bottom-right corner | Visitor scrolls without pressing Play |
| Playing | `❚❚ Pause` | Corner | After pressing Play or Resume |
| Paused | `▶ Resume` | Corner | Pause press, wheel, touch, scroll key, scrollbar, any link, rail, tick, step dot, Replay, or Details |
| Ended | `↺ Replay` | Corner | Bottom reached; restarts from top |

- Travel speed: `TRAVEL_SPEED = 0.4` screens per second, 360 px/s on a 900px-high screen.
- Wait at a company: the rest of the card turn, the points at 1.5 seconds each, then `READ_SECONDS = 2.2` on the summary.
- Wait at the walkthrough: all seven steps once, about 15 seconds.
- Wait at a project: the logo build, the points, then 2.2 seconds on the summary.
- Wait at About: 2 seconds. No wait at the top or at Contact.
- While Play runs, every chapter plays in full, also one the visitor already saw.
- The step per frame is capped at 100ms, so returning to a hidden tab never jumps the page.
- Under 900px the corner control shows its icon only.
- A full Play run takes about 1.5 minutes. This is the sum of the waits measured at each stop plus the travel time, not one timed run. The earlier version took about 2.4 minutes.
- Black pill with a thin white ring, so it reads on every section color.

## 8. Responsive behavior

| Area | Under 900px | 900px and up |
| --- | --- | --- |
| Hero name | Two lines | One line |
| Hero card | Sized to the free height above the text | `min(34svh, 28vw)` |
| Summary points | One column | Three columns |
| Details view | One column | Two columns |
| Play control in the corner | Icon only | Icon and label |
| App story | Stacked, copy above phones | Copy left, phones right |
| Phone height | `min(52svh, 84vw)` | `min(76svh, 760px)` |
| WebGL pixel ratio cap | 1.5 | 2 |
| Screen images | 420px wide | 720px wide |

Layout uses `svh` so mobile browser bars do not cause jumps. Touch devices have no custom cursor or pointer effects. The card allows `touch-action: pan-y`, so vertical swipes still scroll.

Touch devices also have no header lists and no pressable ticks, because both need hover or a fine pointer. On touch, visitors reach a chapter by scroll, the 3D card, the header links, the company rail, or the Play control.

Known limit: a phone in landscape (for example 812x375) is too short for the hero layout. This is not fixed.

## 9. Accessibility and fallbacks

- A script before first paint adds `html.motion` only if the visitor allows motion and WebGL exists. All hiding CSS is scoped under `.motion`.
- If the 3D scene fails to start, the class is removed and the static page shows.
- Without motion, the site is a normal document: experience list with logos, each company with its name, link chip, and role row, seven app steps with 14 images, the Stack list, and all links. The Play control, the ticks, the counter, the curtain, the step dots, Replay, and "Watch again" are not shown.
- The ticks, the counter, and the curtain are `aria-hidden`, and the ticks are out of the tab order. Keyboard visitors use the header links and the arrow keys.
- Each step dot has an `aria-label` with its step number and title.
- Each Details view is a `role="dialog"` panel with a label. On open, focus moves to its Close button and the page behind it is `inert`. On close, focus returns to the Details button.
- Without motion there is no Details button. The same three blocks sit in the page under their section.
- The side-by-side points in a summary frame are `aria-hidden`, because the beats above them already carry the same text.
- `prefers-reduced-motion` removes CSS animation.
- Semantic headings, ordered lists, `aria-label` on sections, and `aria-hidden` on decorative duplicates and the canvas.
- Alt text for portrait, logos, and app screens.
- Visible focus rings and 44px minimum targets on links and Play.
- `aria-label` on Play changes with state.
- JSON-LD `Person` data for search engines.

## 10. Performance

- One WebGL context, one render loop on the GSAP ticker.
- Three.js loads through dynamic import after fonts are ready.
- The canvas hides once the story has passed, so About and Contact pay no WebGL cost.
- Pointer motion uses `gsap.quickTo`.
- SplitText and effect pieces are created once.
- App screens are WebP. `public/app` is 1.3 MB in total.
- Measured in a local test browser before the compact rebuild: about 180 fps on the MobiSoins section, with a 5.6ms p95 frame. Not measured again since.

## 11. Assets

- **Portrait:** `public/img/me.webp`, also used as the card's photo face.
- **Company logos:** SVGs in `public/logos/`, marked with `data-l` so the shader can color each part.
- **Project logos:** vector traces of the Otonmi and Lezra kits in `content/logo-art.ts`, kept in separate parts for animation.
- **App screens:** 14 screens in `public/app/`, with smaller copies in `public/app/sm/`. They were captured from the real MobiSoins app on an Android emulator using a mock session. Retouching removed the developer tab and simulation links and replaced the simulated address line.

## 12. Design history

1. Static HTML portfolio ported to Next.js, Tailwind, and shadcn, with a music toggle.
2. A "Living Index" redesign was tried, then rejected: small top text, repeated name, and an unappealing globe.
3. New direction: scroll-motion site based on the United Carriers reference, with GSAP and Lenis replacing Motion. Static port files and music were removed.
4. Refinements from review: portrait treatment, Thales color, removal of a stray dot, blank section starts, burst effects for bullets, and links to company sites.
5. MobiSoins walkthrough added. Two synced phones were chosen, limited to patient and nurse. Magnific was the first choice for the phone image; the shipped phone is procedural Three.js.
6. Screens recaptured from the current app, with the developer tab removed.
7. Scroll slowed twice. Play control added.
8. Hero title changed to AI Engineer.
9. Compact rebuild. Feedback: no way to press a section, and each section took too long to scroll through. The page went from 43.9 screens to 8.66 at 1440x900, 80.3% shorter, with all content and all 16 effects kept. Chapters now play by themselves and rest on a summary frame. The phones play by themselves with seven step dots. Added: the `MK` mark, header lists with a current state, progress ticks, the chapter counter, curtain jumps, arrow keys, link chips, mono meta rows, chapter color on the progress line, and the closing row. The 800px hero layout was fixed.
10. Details view added. Feedback: the compact summary needed a way to expand each section. Every section now opens a full view with experience, tech stack, and architecture, with text from the LinkedIn profile. AMD and Thales show the experience block only, since those roles have not started.
11. Slower Experience scroll and spin to pick. Feedback: the Experience section went by too fast, and the 3D card should let visitors jump to a section. Experience segments grew from 36svh to 60svh and the wheel is damped to 70% there, so the page is now 10.1 screens at 1440x900 (77% shorter than the first version). The hero card now turns by hand through every company and project, and a tap opens the one it shows. Round arrow buttons sit on both sides of the card.
12. Architecture as UML. Feedback: architecture should be a UML diagram that goes from the bottom up. The numbered list became a component diagram of stacked packages with flow arrows that point up.
13. Architecture map and Stack list. Feedback: two reference screens, a four-column Stack list and a "How MobiSoins fits together" system map, to be matched in the site colors. The UML packages became a map of icon boxes with labeled lines, still read from the bottom up, and the MobiSoins map now follows the supplied system diagram. The three scrolling skill rows in About were replaced by the Stack list. Skills that were only in those rows left the site.

## 13. File map

| File | Responsibility |
| --- | --- |
| `app/layout.tsx` | Fonts, motion gate script, fixed layers (progress, ticks, counter, curtain, cursor), Play markup |
| `app/page.tsx` | Sections, beats, summary frames, app story with step dots, closing row, JSON-LD |
| `app/globals.css` | All design tokens and component styles |
| `app/not-found.tsx` | 404 page |
| `content/portfolio.ts` | All copy, company colors, beats, app steps |
| `content/logo-art.ts` | Project logo vector paths |
| `components/site/director.tsx` | Lenis, chapters, stops, jumps and curtain, counter, ticks, phone walkthrough, project timelines, render loop, pointer, drag spin, spin to pick |
| `components/site/beat-fx.ts` | 16 beat effects |
| `components/site/flip-scene.ts` | 3D card, shaders, renderer |
| `components/site/phone-scene.ts` | 3D phones and screen transitions |
| `components/site/autoplay.ts` | Play control: travels to each stop and waits there |
| `components/site/header.tsx` | `MK` mark, section links, company and project lists |
| `components/site/details.tsx` | Details button, the three detail blocks, the architecture map, the fixed Details layer, link chip |
| `components/site/diagram-links.ts` | Draws the side lines of an architecture map from its measured layout |
| `components/site/icon.tsx` | Brand and generic icons by name, in one color |
| `components/site/project-logos.tsx` | Otonmi and Lezra lockups |

## 14. Tuning

| To change | Edit |
| --- | --- |
| Scroll length of an Experience chapter, and so page length | `SEGMENT_SVH` in `director.tsx` |
| Wheel speed inside the Experience section | `XP_WHEEL` in `director.tsx` |
| How long the hero card can be turned by hand | `PICK_UNTIL` in `director.tsx` |
| Scroll length of a project | `PROJECT_PIN_SVH` in `director.tsx` |
| How fast points play | `BEAT_RATE` in `director.tsx` |
| Shape of one point | `IN`, `HOLD`, `OUT` in `beat-fx.ts` |
| Time for each walkthrough step | `STEP_SECONDS` in `director.tsx` |
| Play: reading time on a summary | `READ_SECONDS` in `director.tsx` |
| Play: travel speed between stops | `TRAVEL_SPEED` in `director.tsx` |
| Progress line color on a project | `PROJECT_TINT` in `director.tsx` |
| Any wording or company color | `content/portfolio.ts` |
| Background tones | `TONES` in `director.tsx` |

## 15. Build and deploy

`next build` writes a static site to `out/`, served by Cloudflare Pages with no Node runtime. Images are unoptimized at build, since assets are already sized.
