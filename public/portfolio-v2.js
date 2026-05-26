/* ─────────────────────────────────────────────────────────────────────
   moise kenge · portfolio v2 — interactive behavior
   vanilla js, no deps.
   ───────────────────────────────────────────────────────────────────── */

/* ── data for command palette listings (was inline <script> in original HTML) ── */
window.__FEATURED = [
  { name: "otonmi", tagline: "genai cybersecurity platform (rag-powered)", status: "active" },
  { name: "kenge consulting", tagline: "secure backend api & site", status: "shipped" },
  { name: "mobisoins", tagline: "on-demand healthcare marketplace", status: "active" },
];
window.__OTHER = [
  { name: "webacy_audit", desc: "100+ web3 audits" },
  { name: "trust_scoring_framework", desc: "risk-assessment models" },
  { name: "repo_scanner_cli", desc: "claude-powered owasp checker" },
];
window.__EXP = [
  { dates: "may 2026 — present", company: "jonas software (constellation)", role: "ai engineer intern" },
  { dates: "oct 2024 — present", company: "mobisoins", role: "cto / ai engineer" },
  { dates: "jan 2025 — apr 2026", company: "kyeto logistics group", role: "technical co-founder" },
  { dates: "jun 2024 — aug 2024", company: "webacy", role: "security research intern" },
];
window.__SKILLS = [
  { cat: "languages", items: [{name:"typescript"},{name:"javascript"},{name:"python"},{name:"sql"},{name:"java/kotlin"}] },
  { cat: "frameworks", items: [{name:"react"},{name:"node.js"},{name:"next.js"},{name:"react native"},{name:"nestjs"}] },
  { cat: "cloud/devops", items: [{name:"aws"},{name:"docker"},{name:"github actions"},{name:"linux"},{name:"ansible"}] },
  { cat: "data", items: [{name:"postgresql"},{name:"mysql"},{name:"dynamodb"},{name:"sqlite"},{name:"kafka"}] },
  { cat: "security/ai", items: [{name:"owasp"},{name:"jwt/oauth"},{name:"llm apis"},{name:"web3 audit"}] },
];
{
  const yrEl = document.getElementById("yr");
  if (yrEl) yrEl.textContent = new Date().getFullYear();
}

(() => {
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── clock + uptime (top bar) ──────────────────────────────────────── */
  const startTs = Date.now();
  function pad(n) { return String(n).padStart(2, "0"); }
  function fmtClock() {
    const d = new Date();
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  function fmtUptime() {
    const s = Math.floor((Date.now() - startTs) / 1000);
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  }
  function fmtRelative(deltaSec) {
    if (deltaSec < 60) return `${deltaSec}s ago`;
    if (deltaSec < 3600) return `${Math.floor(deltaSec / 60)}m ago`;
    if (deltaSec < 86400) return `${Math.floor(deltaSec / 3600)}h ago`;
    return `${Math.floor(deltaSec / 86400)}d ago`;
  }
  function tickClock() {
    const c = $("#clock"); if (c) c.textContent = fmtClock();
    const u = $("#uptime"); if (u) u.textContent = `↑ ${fmtUptime()}`;
    const ld = $("#lastDeploy"); if (ld) ld.textContent = fmtRelative(Math.floor((Date.now() - startTs) / 1000) + 3 * 3600 + 17 * 60);
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ── boot sequence ─────────────────────────────────────────────────── */
  const BOOT_KEY = "moise.bootSeen";
  const bootEl = $("#boot");
  const bootSeen = sessionStorage.getItem(BOOT_KEY);
  if (bootEl && !bootSeen && !reduceMotion) {
    runBoot();
  } else if (bootEl) {
    bootEl.style.display = "none";
  }

  function runBoot() {
    const lines = $$("#boot .line");
    let i = 0;
    let cancelled = false;
    function step() {
      if (cancelled) return;
      if (i >= lines.length) {
        setTimeout(finish, 280);
        return;
      }
      lines[i].classList.add("show");
      i++;
      setTimeout(step, 140 + Math.random() * 80);
    }
    function finish() {
      sessionStorage.setItem(BOOT_KEY, "1");
      bootEl.classList.add("done");
      setTimeout(() => bootEl.remove(), 400);
    }
    function skip() {
      cancelled = true;
      lines.forEach((l) => l.classList.add("show"));
      finish();
    }
    bootEl.addEventListener("click", skip, { once: true });
    window.addEventListener("scroll", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    setTimeout(step, 220);
  }

  /* ── identity line (one-time typewriter — no role cycling) ─────────── */
  const ROLE_TEXT = "AI Engineer · Software Engineer";
  const roleEl = $("#typedRole");
  if (roleEl && !reduceMotion) {
    let i = 0;
    function typeOnce() {
      if (i <= ROLE_TEXT.length) {
        roleEl.textContent = ROLE_TEXT.slice(0, i);
        i++;
        setTimeout(typeOnce, 55 + Math.random() * 35);
      }
    }
    setTimeout(typeOnce, 500);
  } else if (roleEl) {
    roleEl.textContent = ROLE_TEXT;
  }

  /* ── decryption reveal on scroll ───────────────────────────────────── */
  const CHARS = "!<>-_\\/[]{}—=+*^?#$&%@01ABCDEF";
  function decryptReveal(el) {
    const target = el.dataset.decryptText || el.textContent;
    el.dataset.decryptText = target;
    if (reduceMotion) { el.textContent = target; return; }
    const queue = [];
    for (let i = 0; i < target.length; i++) {
      queue.push({
        from: "",
        to: target[i],
        start: Math.floor(Math.random() * 8),
        end: 10 + Math.floor(Math.random() * 14),
        ch: "",
      });
    }
    let frame = 0;
    function tick() {
      let out = "";
      let done = 0;
      for (const q of queue) {
        if (frame >= q.end) { out += q.to; done++; }
        else if (frame >= q.start) {
          if (!q.ch || Math.random() < 0.3) {
            q.ch = CHARS[Math.floor(Math.random() * CHARS.length)];
          }
          out += q.ch;
        } else { out += " "; }
      }
      el.textContent = out;
      if (done < queue.length) { frame++; requestAnimationFrame(tick); }
    }
    tick();
  }

  const decryptObserver = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        decryptReveal(e.target);
        decryptObserver.unobserve(e.target);
      }
    }
  }, { threshold: 0.4 });
  $$("[data-decrypt]").forEach((el) => decryptObserver.observe(el));

  /* ── htop bar animation on scroll ──────────────────────────────────── */
  const barsObserver = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        $$(".bar-row .fill", e.target).forEach((f, i) => {
          setTimeout(() => { f.style.width = f.dataset.pct + "%"; }, i * 70);
        });
        barsObserver.unobserve(e.target);
      }
    }
  }, { threshold: 0.25 });
  $$("[data-bars]").forEach((el) => barsObserver.observe(el));

  /* ── project card expand ───────────────────────────────────────────── */
  $$(".project-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      card.classList.toggle("open");
    });
    const view = $(".view", card);
    if (view) view.addEventListener("click", (e) => {
      e.stopPropagation();
      card.classList.toggle("open");
    });
  });

  /* ── command palette ───────────────────────────────────────────────── */
  const palette = $("#palette-backdrop");
  const palBody = $("#pal-body");
  const palInput = $("#pal-input");
  const opener = $("#palette-opener");

  const COMMANDS = {
    help: {
      desc: "list commands",
      run: () => print(
        "available commands:\n" +
        "  help              · this list\n" +
        "  whoami            · print about\n" +
        "  ls projects       · list projects\n" +
        "  ls experience     · list work history\n" +
        "  ls skills         · list skills\n" +
        "  ls contact        · list contact channels\n" +
        "  cat resume.pdf    · download resume\n" +
        "  contact           · open mailto\n" +
        "  goto <section>    · jump (hero|about|experience|projects|skills|education|contact)\n" +
        "  theme <name>      · crimson | amber | cyan | green\n" +
        "  matrix            · run matrix rain (3s)\n" +
        "  date              · current time\n" +
        "  clear             · clear terminal\n" +
        "  sudo hire-me      · ?\n" +
        "  exit              · close terminal", "out"
      ),
    },
    whoami: {
      desc: "print about",
      run: () => print(
        "moise kenge — software engineer · ai engineer\n" +
        "ottawa, on · b.a.sc. software engineering co-op @ uottawa (exp. 2027)\n" +
        "currently building internal ai tooling at jonas software (constellation).\n" +
        "co-founder of mobisoins (healthcare marketplace · cto/ai engineer) and klg (fleet platform).\n" +
        "open to: ai engineering or software engineering roles. ship calm.", "out"
      ),
    },
    "ls projects": {
      desc: "list projects",
      run: () => {
        const lines = ["projects/"];
        window.__FEATURED.forEach((p, i) => {
          lines.push(`  ${String(i+1).padStart(2,"0")}  ${p.name.padEnd(20)} ${p.tagline}  [${p.status.toUpperCase()}]`);
        });
        window.__OTHER.forEach((p, i) => {
          lines.push(`  ${String(i+1+window.__FEATURED.length).padStart(2,"0")}  ${p.name.padEnd(20)} ${p.desc}`);
        });
        print(lines.join("\n"), "out");
        setTimeout(() => goto("projects"), 200);
      },
    },
    "ls experience": {
      desc: "list experience",
      run: () => {
        const lines = ["experience/"];
        window.__EXP.forEach((j, i) => {
          lines.push(`  ${String(i+1).padStart(2,"0")}  ${j.dates.padEnd(22)} ${j.company.padEnd(28)} ${j.role}`);
        });
        print(lines.join("\n"), "out");
        setTimeout(() => goto("experience"), 200);
      },
    },
    "ls skills": {
      desc: "list skills",
      run: () => {
        const lines = ["skills/"];
        window.__SKILLS.forEach((g) => {
          lines.push(`  ${g.cat.padEnd(18)}  ${g.items.map((s) => s.name).join(", ")}`);
        });
        print(lines.join("\n"), "out");
        setTimeout(() => goto("skills"), 200);
      },
    },
    "ls contact": {
      desc: "list contact channels",
      run: () => print(
        "channels/\n" +
        "  email      moisekenge03@gmail.com\n" +
        "  github     github.com/Moisekenge\n" +
        "  linkedin   linkedin.com/in/moise-kenge\n" +
        "  phone      613-415-5325", "out"
      ),
    },
    contact: {
      desc: "open mailto",
      run: () => {
        print("opening mail client...", "ok");
        window.location.href = "mailto:moisekenge03@gmail.com";
      },
    },
    "cat resume.pdf": {
      desc: "download resume",
      run: () => print("resume.pdf not yet attached — drop a PDF in the project root and update the link. for now: visit linkedin.com/in/moise-kenge", "err"),
    },
    "cat about": { run: () => COMMANDS.whoami.run() },
    date: {
      desc: "current time",
      run: () => print(new Date().toString(), "out"),
    },
    matrix: {
      desc: "run matrix rain",
      run: () => { print("engaging matrix rain (3s)...", "ok"); startMatrix(3000); },
    },
    clear: {
      desc: "clear terminal",
      run: () => { palBody.innerHTML = '<div class="log" id="pal-log"></div>'; },
    },
    exit: {
      desc: "close terminal",
      run: () => closePalette(),
    },
    "sudo hire-me": {
      desc: "?",
      run: () => {
        print("[sudo] password: ********", "out");
        setTimeout(() => print("authentication: bypassed.\nrouting to /contact...\n→ moisekenge03@gmail.com", "ok"), 400);
        setTimeout(() => goto("contact"), 1200);
      },
    },
  };

  // theme dynamic
  const THEMES = {
    crimson: { color: "#E24B4A", dark: "#A32D2D", deep: "#501313" },
    amber:   { color: "#d4a14a", dark: "#8e6a26", deep: "#241c10" },
    cyan:    { color: "#4ab4d4", dark: "#2d748e", deep: "#0e2026" },
    green:   { color: "#97C459", dark: "#5e7d36", deep: "#15200d" },
  };
  function applyTheme(t) {
    const root = document.documentElement;
    root.style.setProperty("--accent", t.color);
    root.style.setProperty("--red", t.color);
    root.style.setProperty("--red-dark", t.dark);
    root.style.setProperty("--red-deep", t.deep);
  }

  function handleCommand(raw) {
    const input = raw.trim();
    if (!input) return;
    printCmd(input);
    if (input.startsWith("theme ")) {
      const name = input.slice(6).trim();
      if (THEMES[name]) { applyTheme(THEMES[name]); print(`theme set to ${name}.`, "ok"); }
      else print(`unknown theme: ${name}\navailable: crimson, amber, cyan, green`, "err");
      return;
    }
    if (input.startsWith("goto ")) {
      const id = input.slice(5).trim();
      if (goto(id)) { print(`jumping to #${id}...`, "ok"); closePalette(150); }
      else print(`section not found: ${id}`, "err");
      return;
    }
    const cmd = COMMANDS[input];
    if (cmd) return cmd.run();
    print(`command not found: ${input}\nrun 'help' for available commands.`, "err");
  }

  function print(text, cls = "out") {
    const log = $("#pal-log");
    if (!log) return;
    const div = document.createElement("div");
    div.className = cls;
    div.textContent = text;
    log.appendChild(div);
    palBody.scrollTop = palBody.scrollHeight;
  }
  function printCmd(text) {
    const log = $("#pal-log");
    const div = document.createElement("div");
    div.className = "cmd-line";
    div.innerHTML = `<span class="pmt">moise@portfolio:~$</span> <span>${escapeHTML(text)}</span>`;
    log.appendChild(div);
  }
  function escapeHTML(s) { return s.replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }

  function goto(id) {
    const el = document.getElementById(id);
    if (!el) return false;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  }

  // command history
  const history = [];
  let histIdx = -1;

  function openPalette() {
    palette.classList.add("open");
    setTimeout(() => palInput.focus(), 30);
  }
  function closePalette(delay = 0) {
    setTimeout(() => palette.classList.remove("open"), delay);
  }

  if (opener) opener.addEventListener("click", openPalette);
  if (palette) palette.addEventListener("click", (e) => {
    if (e.target === palette) closePalette();
  });
  if (palInput) palInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const v = palInput.value;
      if (v.trim()) { history.push(v); histIdx = history.length; }
      palInput.value = "";
      handleCommand(v);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length) { histIdx = Math.max(0, histIdx - 1); palInput.value = history[histIdx] || ""; }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length) {
        histIdx = Math.min(history.length, histIdx + 1);
        palInput.value = history[histIdx] || "";
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const v = palInput.value;
      const match = Object.keys(COMMANDS).find((c) => c.startsWith(v));
      if (match) palInput.value = match;
    }
  });

  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      palette.classList.contains("open") ? closePalette() : openPalette();
    } else if (e.key === "Escape" && palette.classList.contains("open")) {
      closePalette();
    } else if (e.key === "/" && !palette.classList.contains("open") && document.activeElement === document.body) {
      e.preventDefault();
      openPalette();
    }
  });

  /* ── konami code → matrix rain ─────────────────────────────────────── */
  const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let konamiBuf = [];
  window.addEventListener("keydown", (e) => {
    konamiBuf.push(e.key);
    if (konamiBuf.length > KONAMI.length) konamiBuf.shift();
    if (konamiBuf.length === KONAMI.length &&
        konamiBuf.every((k, i) => k.toLowerCase() === KONAMI[i].toLowerCase())) {
      konamiBuf = [];
      startMatrix(3000);
      flash();
    }
  });

  function flash() {
    const el = document.createElement("div");
    el.style.cssText = "position:fixed;inset:0;z-index:95;pointer-events:none;background:rgba(151,196,89,0.08);";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 400);
  }

  /* ── matrix rain ───────────────────────────────────────────────────── */
  let matrixCleanup = null;
  function startMatrix(durationMs = 3000) {
    const canvas = $("#matrixRain");
    if (!canvas) return;
    if (matrixCleanup) matrixCleanup();
    const ctx = canvas.getContext("2d");
    function size() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    size();
    window.addEventListener("resize", size);
    canvas.classList.add("on");
    const fontSize = 14;
    const cols = Math.floor(canvas.width / fontSize);
    const drops = new Array(cols).fill(0).map(() => Math.random() * -canvas.height);
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789!@#$%&*<>{}[]/\\|=+-";
    let raf = 0;
    let stopped = false;
    const startTime = performance.now();
    function frame(t) {
      if (stopped) return;
      ctx.fillStyle = "rgba(10,10,10,0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px JetBrains Mono, monospace`;
      const cssAccent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#E24B4A";
      for (let i = 0; i < cols; i++) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        const c = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() < 0.04 ? "#97C459" : cssAccent;
        ctx.fillText(c, x, y);
        if (y > canvas.height && Math.random() > 0.97) drops[i] = 0;
        drops[i] += 1;
      }
      const elapsed = t - startTime;
      if (elapsed >= durationMs) {
        canvas.classList.remove("on");
        setTimeout(() => {
          stopped = true;
          cancelAnimationFrame(raf);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 500);
        return;
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    matrixCleanup = () => { stopped = true; cancelAnimationFrame(raf); canvas.classList.remove("on"); };
  }

  /* ── preview safety timeout: if a .shot hasn't loaded in 20s, swap to its fallback ── */
  $$(".preview img.shot").forEach((img) => {
    setTimeout(() => {
      if (!img.classList.contains("loaded") && img.dataset.fallback) {
        img.src = img.dataset.fallback;
        img.dataset.fallback = "";
      }
    }, 20000);
  });

  /* ── ai agent (window.claude) ──────────────────────────────────────── */
  const agentLog = $("#agentLog");
  const agentForm = $("#agentForm");
  const agentInput = $("#agentInput");
  const agentSend = $("#agentSend");
  const agentChips = $("#agentChips");

  const AGENT_SYSTEM = `You are an AI agent representing Moïse Kenge on his portfolio site. Visitors ask you questions; you answer about him in his voice. Mention you're an AI representation if asked directly.

CORE FACTS:
- Name: Moïse Kenge. 22yo. Based in Ottawa, ON, Canada. Languages: English, French.
- Education: B.A.Sc. Software Engineering Co-op at University of Ottawa, expected May 2027.
- Currently: AI Engineer Intern at Jonas Software (Constellation Software Inc., Markham ON, May 2026 — present). Building internal AI-powered tooling with TypeScript, React, Node.js, Python — integrating LLM APIs into enterprise workflows across Constellation's 100+ subsidiary companies.
- CTO / AI Engineer at MobiSoins (Oct 2024 — present, Quebec): mobile-first healthcare marketplace, React Native + NestJS + PostgreSQL + Stripe Connect + Clerk, Law 25 / PIPEDA compliant.
- Technical Co-founder of Kyeto Logistics Group / KLG (Jan 2025 — Apr 2026, remote): GPS fleet management on AWS, led 5-person engineering team, Node.js + PostgreSQL + AWS (EC2/ELB/RDS/S3/VPC/Route53/IAM).
- Former Security Research Intern at Webacy (Jun 2024 — Aug 2024): 100+ web3 protocols audited, 20+ risk indicators surfaced, authored technical reports feeding into platform trust scoring.

PROJECTS:
- OTONMI (otonmi.com, Dec 2024 — present): GenAI cybersecurity platform. RAG-powered chatbot ingests scanned code into vector embeddings, retrieves relevant chunks per query, feeds them to Claude for OWASP Top 10 grounded analysis. Python + Flask + Claude API + pgvector + PostgreSQL + Docker + Ansible + AWS. Status: active.
- MobiSoins (mobisoins.com, Oct 2024 — present): mobile-first healthcare marketplace connecting patients with OIIQ-licensed nurses. React Native + NestJS + PostgreSQL + Stripe Connect + Clerk. Law 25 / PIPEDA compliant.
- Kenge Consulting (kengeconsulting.com, Jul-Aug 2024): Secure backend API in Express.js with rate limiting, input sanitization, parameterized queries. Sub-200ms p95. Node.js + Express + SQLite.

AI / GENAI CAPABILITIES (genuine, not marketing fluff):
- LLM API integration — Claude, day-to-day at Jonas and on OTONMI
- Prompt engineering — production system prompts at Jonas + OTONMI
- RAG pipelines — built end-to-end for OTONMI's repo-scanning chatbot (ingestion → embeddings → retrieval → grounded generation)
- Function calling / structured outputs — internal Jonas tooling
- Agentic workflows — POCs for Jonas business units
- Vector embeddings / pgvector — RAG storage layer for OTONMI
- LLM evals — basic golden-set + rubric evaluation, less mature than the above

STACK: TypeScript, JavaScript, Python, Ruby, Java, Kotlin, SQL, C/C++. React, React Native (Expo), Next.js, Node.js, Express, NestJS, Flask, Spring Boot, Ruby on Rails, GraphQL, gRPC (basic). PostgreSQL, pgvector, MySQL, Aurora, DynamoDB, SQLite, Redis (caching), Kafka, SQS, SNS. AWS (EC2/RDS/S3/VPC/Route53/IAM), Docker, Kubernetes (basic), Ansible, GitHub Actions, Linux. OAuth 2.0, JWT, OWASP Top 10.

PRINCIPLES:
1. Ship clean, ship calm, ship often.
2. Assume hostile input. Read the source.
3. Automate the boring; document the rest.
4. Measure before optimizing.
5. Own the deploy; own the rollback.

PERSONALITY: lifts weights, plays basketball, reads mangas, currently reading The Pragmatic Programmer. Learning Rust and LLM internals.

STATUS: open for summer 2027 internships in AI Engineering or Software Engineering roles. Up for sharp contract work in between. Contact: moisekenge03@gmail.com (fastest), linkedin.com/in/moise-kenge, github.com/Moisekenge.

VOICE RULES:
- Lowercase, conversational, direct, technical. No corporate fluff. No hype.
- Short responses: 2-4 sentences, max ~70 words. Never longer.
- No markdown — plain text only.
- If asked something off-topic (politics, etc), redirect: "i'd stick to engineering topics — ask me about projects, stack, or shipping discipline."
- If asked about hiring or how to reach him, give email: moisekenge03@gmail.com.
- If you don't know something specific, say so honestly.

VISITOR QUESTION: `;

  function escHTML(s) { return s.replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }

  function appendTurn(question) {
    const turn = document.createElement("div");
    turn.className = "turn";
    turn.innerHTML = `<div class="q">${escHTML(question)}</div><div class="a thinking">thinking</div>`;
    agentLog.appendChild(turn);
    agentLog.scrollTop = agentLog.scrollHeight;
    return turn.querySelector(".a");
  }

  function renderAnswer(el, text) {
    el.classList.remove("thinking");
    el.innerHTML = `<span class="who">moïse:</span> `;
    // typewriter effect
    const TECH_TERMS = ["typescript","javascript","python","react","node.js","nextjs","next.js","postgresql","aws","docker","ansible","claude api","claude","flask","nestjs","express","mongodb","kafka","jwt","oauth","rust","llm","ai","security","owasp","ec2","s3","rds","stripe","clerk","react native","github actions","linux","sql","sqlite"];
    let i = 0;
    const speed = 12;
    function tick() {
      if (i > text.length) return;
      const chunk = text.slice(0, i);
      let html = `<span class="who">moïse:</span> ` + escHTML(chunk);
      // light keyword highlighting
      for (const term of TECH_TERMS) {
        const re = new RegExp(`\\b(${term.replace(/[.+]/g, "\\$&")})\\b`, "gi");
        html = html.replace(re, '<span class="tech">$1</span>');
      }
      // numbers / percentages
      html = html.replace(/\b(\d+(\.\d+)?(%|ms|s|y|x|\+|k|m)?)\b/g, '<span class="num">$1</span>');
      el.innerHTML = html;
      i++;
      agentLog.scrollTop = agentLog.scrollHeight;
      if (i <= text.length) setTimeout(tick, speed);
    }
    tick();
  }

  async function ask(question) {
    if (!question.trim()) return;
    agentSend.classList.add("busy");
    agentInput.disabled = true;
    const aEl = appendTurn(question);

    try {
      if (!window.claude || !window.claude.complete) {
        throw new Error("agent unavailable");
      }
      const prompt = AGENT_SYSTEM + question + "\n\nYour response (lowercase, 2-4 sentences, plain text only, in moïse's voice):";
      const raw = await window.claude.complete(prompt);
      const cleaned = (raw || "").trim().replace(/^["'`]+|["'`]+$/g, "");
      renderAnswer(aEl, cleaned || "i didn't get a response there — try again or email me: moisekenge03@gmail.com.");
    } catch (e) {
      aEl.classList.remove("thinking");
      aEl.classList.add("err");
      aEl.innerHTML = `<span class="who">system:</span> agent offline. reach me directly at moisekenge03@gmail.com.`;
    } finally {
      agentSend.classList.remove("busy");
      agentInput.disabled = false;
      agentInput.focus();
    }
  }

  if (agentForm) {
    agentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = agentInput.value;
      agentInput.value = "";
      ask(q);
    });
  }
  if (agentChips) {
    agentChips.querySelectorAll(".chip").forEach((c) => {
      c.addEventListener("click", () => ask(c.dataset.q));
    });
  }

  /* ── theme toggle (dark/light) ─────────────────────────────────────── */
  const THEME_KEY = "moise.theme";
  function applyThemeUI(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    $$(".theme-toggle button").forEach((b) => {
      b.classList.toggle("active", b.dataset.theme === theme);
    });
  }
  function setStoredTheme(theme) {
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
    applyThemeUI(theme);
  }
  // init
  let initialTheme = "dark";
  try { initialTheme = localStorage.getItem(THEME_KEY) || "dark"; } catch (_) {}
  applyThemeUI(initialTheme);
  $$(".theme-toggle button").forEach((b) => {
    b.addEventListener("click", () => setStoredTheme(b.dataset.theme));
  });

  /* ── topbar mobile nav placeholder ─────────────────────────────────── */
  // nothing fancy — links smooth-scroll via html { scroll-behavior: smooth; }

})();
