// Headless proof that Dictate saves each raw Whisper reply. Serves the worktree's Dictate.js into the live Dictate page,
// talks into the fake mic (jfk.wav), then reads the Servex whisper-raw log back.
//   PWENTRY=<playwright/index.mjs> node raw-log-proof.mjs <site url> <Dictate.js path> <jfk.wav> <out.json>
import { pathToFileURL } from "url";
import fs from "fs";
const [base, dictate, wav, out] = process.argv.slice(2);
const { chromium } = await import(pathToFileURL(process.env.PWENTRY).href);
const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-audio-capture=${wav}`] });
const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, permissions: ["microphone"] });
const page = await ctx.newPage();
await page.route("**/framework/ux/Dictate/Dictate.js", r => r.fulfill({ contentType: "text/javascript", body: fs.readFileSync(dictate, "utf8") }));
const posts = [];
page.on("request", r => { if (r.url().includes("/log/whisper-raw") && r.method() === "POST") posts.push(r.postData()); });
const t0 = Date.now();
await page.goto(base + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
await page.locator(".ux-dictate-btn:visible").first().click();
while (Date.now() - t0 < 40000 && !posts.some(p => JSON.parse(p).kind === "final")) await page.waitForTimeout(500);
await page.locator(".ux-dictate-btn:visible").first().click().catch(() => {});
await page.waitForTimeout(1500);
await browser.close();
const lines = posts.map(p => JSON.parse(p));
const interim = lines.find(l => l.kind !== "final"), fin = lines.find(l => l.kind === "final");
console.log(`posts ${lines.length}; interim ${!!interim}; final ${!!fin}; final segments ${fin?.segments?.length ?? 0}`);
const back = await fetch("http://127.0.0.1:8090/log/whisper-raw?n=50").then(r => r.json());
console.log(`log now holds ${back.length} line(s); last type ${back.at(-1)?.type}`);
fs.writeFileSync(out, JSON.stringify([interim, fin].filter(Boolean), null, 1) + "\n");
process.exit(fin && fin.segments?.length && back.some(b => b.type === "whisper") ? 0 : 1);
