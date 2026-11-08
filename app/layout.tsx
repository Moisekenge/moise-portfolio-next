import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Director } from "@/components/site/director";
import { Header } from "@/components/site/header";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Moïse Kenge · AI Engineer",
  description: "AI Engineer building production AI systems. Incoming at AMD and Thales.",
};

// Runs before first paint, so animated layouts never flash their static version.
const motionScript = `try{if(matchMedia("(prefers-reduced-motion: no-preference)").matches&&window.WebGLRenderingContext){var d=document.documentElement;d.classList.add("motion");if(!sessionStorage.getItem("seen"))d.classList.add("is-loading")}}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
      </head>
      <body>
        <div className="loader" aria-hidden="true">
          <svg className="loader-card" viewBox="0 0 100 100">
            <rect x="1" y="1" width="98" height="98" rx="22" pathLength="1" />
          </svg>
        </div>
        <div className="tone" aria-hidden="true">
          <div className="glow" />
        </div>
        <canvas className="stage-canvas" aria-hidden="true" />
        <div className="progress" aria-hidden="true" />
        <div className="cursor" aria-hidden="true">
          <span />
        </div>
        <Header />
        <div className="autoplay" data-state="idle">
          <button type="button" className="autoplay-button" aria-label="Play automatic scroll">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path className="autoplay-play" d="M4 2.3v11.4l9.4-5.7z" />
              <path className="autoplay-pause" d="M3.5 2.5h3.2v11H3.5zM9.3 2.5h3.2v11H9.3z" />
              <path className="autoplay-replay" d="M3.2 8a4.8 4.8 0 1 0 1.5-3.5M4.4 1.8v2.9h2.9" />
            </svg>
            <span className="autoplay-label">Play</span>
          </button>
          <span className="autoplay-hint">or scroll</span>
        </div>
        {children}
        <Director />
      </body>
    </html>
  );
}
