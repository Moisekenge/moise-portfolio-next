import fs from "node:fs";
import path from "node:path";
import Script from "next/script";

export default function Page() {
  const bodyHtml = fs.readFileSync(
    path.join(process.cwd(), "app", "portfolio-body.html"),
    "utf-8",
  );

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <Script src="/portfolio-v2.js" strategy="afterInteractive" />
    </>
  );
}
