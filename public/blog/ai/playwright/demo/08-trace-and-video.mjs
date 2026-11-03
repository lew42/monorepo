// LESSON: every Playwright run can be RECORDED and played back later, two ways. A
// "trace" is a step-by-step replay — every action, every screenshot, every network
// request, scrubbable like a video editor's timeline, opened with one command. A
// "video" is a literal video file of what the browser showed, start to finish. Both
// are how you debug a run you weren't watching live — this overnight run, for one.
// Both files are scratch, not something this task keeps — only their sizes are
// printed. Run it from the repo root:
// node public/blog/ai/playwright/demo/08-trace-and-video.mjs
import pw from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.js";
import { statSync } from "node:fs";

const dir = "C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/080bcce3-f367-4e60-9a6b-dc6f0a5d45ff/scratchpad";
const tracePath = `${dir}/playwright-demos-trace.zip`;

const browser = await pw.chromium.launch();
// recordVideo is set on the CONTEXT, before any page opens — it can't be turned on mid-run.
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir } });
await context.tracing.start({ screenshots: true, snapshots: true }); // start recording every action

const page = await context.newPage();
await page.goto("http://localhost:8123/", { waitUntil: "load" });
await page.click(".sidebar-link:has-text('Framework')"); // one real click, to give the trace/video something to show
await page.waitForTimeout(800);

await context.tracing.stop({ path: tracePath }); // writes the trace .zip
const video = await page.video(); // the recording tied to this page
await context.close(); // the video file only finishes writing once its context closes
const videoPath = await video.path();

console.log("trace:", tracePath, "-", statSync(tracePath).size, "bytes");
console.log("video:", videoPath, "-", statSync(videoPath).size, "bytes");
console.log("open the trace with: npx playwright show-trace", tracePath);

await browser.close();
