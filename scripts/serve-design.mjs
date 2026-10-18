// Serves design/src at http://localhost:4400 (no dependencies). Usage: pnpm dev
import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "design", "src");
const port = Number(process.env.PORT) || 4400;
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml" };

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const rel = url.pathname === "/" ? "prototype.html" : decodeURIComponent(url.pathname).slice(1);
  const file = path.join(root, rel);
  if (!file.startsWith(root)) return res.writeHead(403).end();
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`Prototype:    http://localhost:${port}/`);
  console.log(`Storyboards:  http://localhost:${port}/storyboards.html?b=01-discover`);
  console.log(`Wireframes:   http://localhost:${port}/wireframes.html?w=01-sitemap`);
  console.log("On your phone (same Wi-Fi): use this Mac's IP instead of localhost.");
});
