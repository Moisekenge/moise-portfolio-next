import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: prerender to plain HTML/CSS/JS in /out so Cloudflare Pages
  // can serve the site without a Node runtime. The portfolio has no backend;
  // fs.readFileSync in page.tsx runs once at build time and is baked into the
  // prerendered HTML.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
