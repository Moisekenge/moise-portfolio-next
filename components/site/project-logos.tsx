import { logoArt } from "@/content/logo-art";

// Each logo stays split into its kit parts, so the director can animate them.

export function OtonmiLockup() {
  return (
    <div className="pj-lock" data-lock>
      <svg className="pj-mark" data-mark viewBox="0 0 1024 1024" role="img" aria-label="Otonmi">
        <path data-part="left" fill="currentColor" d="M160 124H323V215H251V808H323V899H160Z" />
        <path data-part="right" fill="currentColor" d="M700 124H863V899H700V808H772V215H700Z" />
        <circle data-part="dot" cx="512" cy="512" r="120" fill="#d92a2a" />
      </svg>
      <svg className="pj-word pj-word-otonmi" data-word viewBox={logoArt.otonmiWord.viewBox} aria-hidden="true">
        <path fill="currentColor" fillRule="evenodd" d={logoArt.otonmiWord.d} />
      </svg>
    </div>
  );
}

export function LezraLockup() {
  return (
    <div className="pj-lock" data-lock>
      <svg className="pj-mark pj-mark-lezra" data-mark viewBox="311 888 301 223" role="img" aria-label="Lezra">
        <g data-part="top">
          <path fill="currentColor" fillRule="evenodd" transform={logoArt.lezraTop.transform} d={logoArt.lezraTop.d} />
        </g>
        <g data-part="bottom">
          <path fill="currentColor" fillRule="evenodd" transform={logoArt.lezraBottom.transform} d={logoArt.lezraBottom.d} />
        </g>
        <path data-part="accent" fill="#ffffff" d="M396 958H428L412 991H381Z" />
      </svg>
      <svg className="pj-word pj-word-lezra" data-word viewBox={logoArt.lezraWord.viewBox} aria-hidden="true">
        <path fill="currentColor" fillRule="evenodd" d={logoArt.lezraWord.d} />
      </svg>
    </div>
  );
}
