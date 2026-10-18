// End-to-end smoke test against a running build. Usage: pnpm build && pnpm preview --port 4455 & pnpm e2e [screenshot-dir]
import { chromium } from "playwright";
const out = process.argv[2] ?? "e2e-shots";
await import("node:fs").then((fs) => fs.mkdirSync(out, { recursive: true }));
const base = process.env.BASE_URL ?? "http://localhost:4455/";
const browser = await chromium.launch();
const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });
const step = async (name, fn) => { try { await fn(); console.log("✓", name); } catch (e) { console.log("✗", name, e.message.split("\n")[0]); errors.push(name + ": " + e.message.split("\n")[0]); } };

await page.goto(base); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForLoadState("networkidle");
await step("home renders", async () => { await page.getByText("Who's around").waitFor(); await page.getByText("Project of the Month").first().waitFor(); await shot("01-home"); });
await step("settings opens from avatar", async () => { await page.getByRole("button", { name: "Open settings" }).first().click(); await page.getByRole("dialog", { name: "Settings" }).waitFor(); await page.getByText("Danger zone").waitFor(); await shot("02-settings"); });
await step("delete all data", async () => {
  await page.getByLabel("Type DELETE to confirm").fill("DELETE");
  await page.getByRole("button", { name: "Delete all" }).click();
  await page.getByRole("button", { name: "Close settings" }).click();
  await page.getByText("No Project of the Month yet").waitFor();
  await shot("03-empty-home");
});
await step("empty pages render", async () => {
  for (const r of ["builders", "projects", "learn", "snippets", "leaderboard"]) { await page.goto(base + "#/" + r); await page.waitForTimeout(150); }
  await page.getByText("No points yet").waitFor();
});
await step("reset demo data", async () => {
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Open settings" }).first().click();
  await page.getByRole("button", { name: "Reset demo" }).click();
  await page.getByRole("button", { name: "Close settings" }).click();
  await page.goto(base); await page.getByText("Salah Buddy").first().waitFor();
});
await step("share a link with take", async () => {
  await page.getByRole("button", { name: "Add", exact: true }).first().click();
  await page.getByRole("button", { name: /Share a link/ }).click();
  await page.getByLabel(/^Link/).fill("https://www.youtube.com/watch?v=jNQXAC9IVRw");
  await page.getByLabel("Title").fill("Convex crash course");
  await page.getByPlaceholder(/One or two lines/).fill("Short and clear, perfect before the next hackathon.");
  await shot("04-share");
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await page.getByText("Convex crash course").first().waitFor();
  await page.locator("iframe.embed").waitFor();
});
await step("add insight as sharer + comment", async () => {
  await page.getByRole("button", { name: /Add an insight/ }).click();
  await page.getByPlaceholder("What did you find out since sharing?").fill("Watched it again, the auth part is at 1:20.");
  await page.getByRole("button", { name: /Add insight/ }).click();
  await page.getByPlaceholder(/Add a comment/).fill("Testing the comments");
  await page.getByRole("button", { name: /Post · \+2/ }).click();
  await page.getByText("Testing the comments").waitFor();
  await shot("05-post");
});
await step("article comments page", async () => { await page.goto(base + "#/post/p-agents"); await page.getByText("Insights from Ahmed").waitFor(); await page.getByRole("button", { name: "Reply" }).first().click(); await page.getByPlaceholder(/Reply to/).fill("Nice"); await page.getByRole("button", { name: "Reply", exact: true }).last().click(); });
await step("learn grid shows 8 above the fold", async () => {
  await page.goto(base + "#/learn"); await page.locator(".lc").first().waitFor();
  const visible = await page.$$eval(".lc", (els) => els.filter((e) => e.getBoundingClientRect().bottom <= innerHeight).length);
  if (visible < 8) throw new Error(`only ${visible} cards above fold`);
  await page.getByRole("button", { name: /^Videos/ }).click(); await shot("06-learn-videos");
});
await step("write learning with paste nudge + pledge", async () => {
  await page.goto(base + "#/write");
  await page.getByLabel("Title").fill("Testing Emerald end to end");
  const ta = page.getByPlaceholder(/One or two sentences/);
  await ta.focus();
  await page.evaluate(() => { const t = document.activeElement; const dt = new DataTransfer(); dt.setData("text/plain", "x ".repeat(150)); t.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true })); });
  await page.getByText("That's a big paste").waitFor();
  await page.getByRole("button", { name: "Yes, it's mine" }).click();
  await ta.fill("Playwright drives the real app, and the points engine is tested on its own so the leaderboard can be trusted by everyone.");
  await page.getByPlaceholder("Libraries, patterns, tools…").fill("Vite, React, Vitest and Playwright together.");
  await page.getByRole("checkbox").check();
  await shot("07-write");
  await page.getByRole("button", { name: "Publish" }).click();
  await page.getByText("Testing Emerald end to end").first().waitFor();
});
await step("AMA answer + helpful as asker", async () => {
  await page.goto(base + "#/p/rota/ama");
  await page.getByRole("button", { name: "Answer · +5" }).first().click();
  await page.getByPlaceholder("Your answer").fill("Use middleware with a role check");
  await page.getByPlaceholder("Optional code block").fill("export function middleware() {}");
  await page.getByRole("button", { name: "Post answer" }).click();
  await page.getByRole("button", { name: "Open settings" }).first().click();
  await page.getByLabel("View the site as (demo)").selectOption("bi");
  await page.getByRole("button", { name: "Close settings" }).click();
  await page.getByRole("button", { name: "Mark helpful" }).first().click();
  await page.getByRole("button", { name: "Helpful", exact: true }).first().waitFor();
  await page.getByRole("button", { name: /Save as snippet/ }).first().waitFor();
  await shot("08-ama");
  await page.getByRole("button", { name: "Open settings" }).first().click();
  // Bilal isn't admin, so the switcher is gone: restore via reset-free path by importing state change
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem("emerald:state")); s.currentUserId = "mo"; localStorage.setItem("emerald:state", JSON.stringify(s)); });
  await page.reload();
});
await step("snippet copy counts", async () => {
  await page.goto(base + "#/snippets");
  const before = await page.locator(".snip").first().innerText();
  await page.getByRole("button", { name: "Copy" }).first().click();
  await page.getByRole("button", { name: "Copied" }).first().waitFor();
  const after = await page.locator(".snip").first().innerText();
  if (before === after) throw new Error("copy count didn't change");
});
await step("new project manual launch", async () => {
  await page.getByRole("button", { name: "Add", exact: true }).first().click();
  await page.getByRole("button", { name: /New project/ }).click();
  await page.getByRole("button", { name: "Add manually" }).click();
  await page.getByLabel("Name").fill("Emerald");
  await page.getByRole("button", { name: /Launched \(live app\)/ }).click();
  await page.getByLabel(/App link/).fill("https://emerald.example");
  await page.getByRole("button", { name: "Launch 🚀" }).click();
  await page.getByRole("heading", { name: "Emerald" }).waitFor();
  await page.getByText("What I learned").first().waitFor();
});
await step("search", async () => { await page.getByLabel("Search").fill("salah"); await page.locator(".res").first().click(); await page.getByRole("heading", { name: "Salah Buddy" }).waitFor(); });
await step("notifications", async () => { await page.getByRole("button", { name: /Notifications/ }).first().click(); await page.getByText("Mark all read").click().catch(() => {}); });
await step("leaderboard + profile", async () => { await page.goto(base + "#/leaderboard"); await page.getByText("How points work").waitFor(); await shot("09-leaderboard"); await page.goto(base + "#/u/yu"); await page.getByText("Badges").first().waitFor(); await page.getByRole("button", { name: /^Posts/ }).click(); });
await step("hide presence", async () => {
  await page.getByRole("button", { name: "Open settings" }).first().click();
  await page.getByLabel(/Show when I'm online/).uncheck();
  await page.getByRole("button", { name: "Close settings" }).click();
});
await step("no horizontal overflow on mobile", async () => {
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  m.on("pageerror", (e) => errors.push(String(e)));
  for (const r of ["", "builders", "projects", "p/salah", "p/salah/ama", "learn", "post/p-agents", "snippets", "leaderboard", "write", "u/yu"]) {
    await m.goto(base + "#/" + r); await m.waitForTimeout(250);
    const w = await m.evaluate(() => document.documentElement.scrollWidth);
    if (w > 392) throw new Error(`#/${r} is ${w}px wide`);
  }
  await m.goto(base + "#/learn"); await m.waitForTimeout(200); await m.screenshot({ path: `${out}/10-mobile-learn.png` });
  await m.goto(base); await m.waitForTimeout(200); await m.getByRole("link", { name: "Add" }).click(); await m.waitForTimeout(200); await m.screenshot({ path: `${out}/11-mobile-add.png` });
  await m.getByRole("button", { name: /Share a link/ }).click(); await m.waitForTimeout(200); await m.screenshot({ path: `${out}/12-mobile-share.png` });
  await m.goto(base); await m.getByRole("button", { name: "Open settings" }).last().click(); await m.waitForTimeout(200); await m.screenshot({ path: `${out}/13-mobile-settings.png` });
});
console.log(errors.length ? "ERRORS:\n" + errors.join("\n") : "no console errors");
process.exitCode = errors.length ? 1 : 0;
await browser.close();
