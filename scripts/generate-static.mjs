import { writeFileSync, mkdirSync, cpSync } from "node:fs";
import { dirname, join } from "node:path";

async function generateStaticHtml() {
  console.log("Generating static HTML files for Firebase Hosting...");

  const ssrModule = await import("../node_modules/.nitro/vite/services/ssr/index.js");
  const fetchHandler = ssrModule.default.fetch;

  const routes = [
    { path: "/", file: ".output/public/index.html" },
    { path: "/", file: ".output/public/404.html" },
    { path: "/analytics", file: ".output/public/analytics/index.html" },
    { path: "/habits", file: ".output/public/habits/index.html" },
    { path: "/leaderboard", file: ".output/public/leaderboard/index.html" },
    { path: "/stickers", file: ".output/public/stickers/index.html" },
    { path: "/settings", file: ".output/public/settings/index.html" },
    { path: "/login", file: ".output/public/login/index.html" },
  ];

  for (const route of routes) {
    try {
      const res = await fetchHandler(new Request(`http://localhost${route.path}`));
      if (res.status === 200 || res.status === 304) {
        const html = await res.text();
        const targetPath = join(process.cwd(), route.file);
        mkdirSync(dirname(targetPath), { recursive: true });
        writeFileSync(targetPath, html, "utf-8");
        console.log(`✓ Generated ${route.file}`);
      } else {
        console.warn(`! Failed route ${route.path} with status ${res.status}`);
      }
    } catch (err) {
      console.error(`Error generating ${route.path}:`, err);
    }
  }

  const publicDir = join(process.cwd(), ".output/public");
  const distDir = join(process.cwd(), "dist");
  mkdirSync(distDir, { recursive: true });
  cpSync(publicDir, distDir, { recursive: true });
  console.log("✓ Copied static files to dist/");

  console.log("Static HTML generation complete!");
}

generateStaticHtml().catch((err) => {
  console.error("Static generation failed:", err);
  process.exit(1);
});
