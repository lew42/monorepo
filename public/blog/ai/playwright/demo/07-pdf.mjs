// LESSON: a browser can also be a printer. Chrome (which Playwright drives) has a
// built-in "print this page to PDF" feature — the same one behind Ctrl+P — and
// Playwright can call it directly, with no print dialog and no person clicking
// anything. This turns any web page into a real, openable PDF file, useful for a
// downloadable report, an invoice, or an offline copy of a page.
// The PDF itself is a scratch file, not something this task keeps — only its size
// and page count are printed. Run it from the repo root:
// node public/blog/ai/playwright/demo/07-pdf.mjs
import pw from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.js";
import { statSync } from "node:fs";

const out = "C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/080bcce3-f367-4e60-9a6b-dc6f0a5d45ff/scratchpad/playwright-demos-page.pdf";

const browser = await pw.chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:8123/blog/framework/hello-lew42/", { waitUntil: "load" }); // a real blog post, plain prose
await page.waitForTimeout(500);

// page.pdf() only works in headless mode, and only for Chromium — not every engine
// Playwright drives can print. It returns once the whole PDF has been written.
await page.pdf({ path: out, format: "A4", printBackground: true });

const bytes = statSync(out).size;

// A PDF is a text-ish file with page objects inside it — counting "/Type /Page"
// entries (not "/Pages", the one node that lists them) gives the page count without
// needing a PDF-parsing library.
const text = await import("node:fs").then(fs => fs.readFileSync(out, "latin1"));
const pageCount = (text.match(/\/Type\s*\/Page[^s]/g) ?? []).length;

console.log("PDF written:", out);
console.log("size:", bytes, "bytes");
console.log("pages:", pageCount);

await browser.close();
