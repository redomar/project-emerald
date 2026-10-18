// Renders design/src/*.html to PNGs under design/. Usage: pnpm design:render [storyboards|wireframes|preview]
import { chromium } from "playwright";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "design");
const src = (file, query = "") => pathToFileURL(path.join(root, "src", file)).href + query;

const storyboards = ["01-discover", "02-ship-and-share", "03-non-tech", "04-help-a-bro"];
const wireframes = ["01-sitemap", "02-flows", "03-home", "04-project", "05-builders-profile", "06-learn-snippets", "07-mobile"];
const previews = [
  ["01-home", "home"], ["02-builders", "builders"], ["03-profile", "profile"], ["04-project", "project"], ["05-project-ama", "ama"],
  ["06-learn", "learn"], ["07-article", "article"], ["08-snippets", "snippets"], ["09-leaderboard", "leaderboard"], ["10-share", "share"], ["11-write-learning", "write"],
];
// Mobile = the same website in a phone browser (responsive), not a native app.
const mobile = [
  ["12-mobile-home", "home"], ["13-mobile-project", "project"], ["14-mobile-learn", "learn"], ["15-mobile-article", "article"],
  ["16-mobile-leaderboard", "leaderboard"], ["17-mobile-share", "share"],
];
const jobs = {
  storyboards: storyboards.map((b) => ({ url: src("storyboards.html", `?b=${b}`), out: `storyboards/${b}.png`, width: 1600 })),
  wireframes: wireframes.map((w) => ({ url: src("wireframes.html", `?w=${w}`), out: `wireframes/${w}.png`, width: 1600 })),
  preview: [
    ...previews.map(([out, r]) => ({ url: src("prototype.html", `#${r}`), out: `preview/${out}.png`, width: 1440, height: 900 })),
    ...mobile.map(([out, r]) => ({ url: src("prototype.html", `#${r}`), out: `preview/${out}.png`, width: 390, height: 844, scale: 3, viewportOnly: true })),
  ],
};

const only = process.argv[2];
const browser = await chromium.launch();
for (const [group, list] of Object.entries(jobs)) {
  if (only && only !== group) continue;
  for (const job of list) {
    const page = await browser.newPage({ viewport: { width: job.width, height: job.height ?? 900 }, deviceScaleFactor: job.scale ?? 2 });
    await page.goto(job.url, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(root, job.out), fullPage: !job.viewportOnly && !job.url.endsWith("#share") });
    await page.close();
    console.log("✓", job.out);
  }
}
await browser.close();
