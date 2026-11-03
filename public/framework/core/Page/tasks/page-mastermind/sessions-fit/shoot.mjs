// usage: node shoot.mjs <baseUrl> <outDir>
import Browser from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";
import fs from "node:fs";
const BASE = process.argv[2], OUT = process.argv[3];
fs.mkdirSync(OUT, { recursive: true });
const S = "/framework/ai/sessions/2026/10/20/session-e00f55c9/";
const pages = [
"/framework/ai/sessions/","/framework/ai/sessions/2026/","/framework/ai/sessions/2026/10/","/framework/ai/sessions/2026/10/20/",S,
S+"sessions-and-tasks/",S+"sessions-and-tasks/deputy/",S+"sessions-and-tasks/process-system/",S+"sessions-and-tasks/deputy/roles/",S+"sessions-and-tasks/deputy/review-page/",
S+"sessions-and-tasks/session-record/",
"/framework/ai/sessions/2026/10/20/session-00324b25/","/framework/ai/sessions/2026/10/20/voice-20261020/","/framework/ai/sessions/2026/10/20/cloud-voice-task-system-and-voice-agent-exploration/"];
const widths = [400, 1200, 1920, 3440], out = [];
const b = await Browser.browser();
for (const p of pages) for (const w of widths) {
  const ctx = await b.newContext({ viewport: { width: w, height: 1000 } }); const pg = await ctx.newPage();
  const errs = [], f404 = [];
  pg.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  pg.on("pageerror", e => errs.push("pageerror: " + e.message));
  pg.on("response", r => { if (r.status() >= 400) f404.push(r.status() + " " + r.url().replace(BASE, "")); });
  pg.on("requestfailed", r => f404.push("FAILED " + r.url().replace(BASE, "")));
  let nav = "ok";
  try { await pg.goto(BASE + p, { waitUntil: "load", timeout: 30000 }); } catch (e) { nav = e.message.slice(0, 80); }
  await pg.waitForTimeout(2500);
  const m = await pg.evaluate(() => {
    const de = document.documentElement, body = document.body.innerText || "";
    const cut = [];
    for (const e of document.querySelectorAll("h1,h2,p,a,td,th,li,span")) {
      const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
      if (r.right > innerWidth + 1 || r.left < -1) cut.push((e.tagName + ":" + (e.innerText || "").slice(0, 30)).replace(/\s+/g, " "));
      if (cut.length > 4) break;
    }
    const trunc = [...document.querySelectorAll("td,th,a,span,div")].filter(e => e.children.length === 0 && e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== "visible").map(e => (e.innerText || "").slice(0, 24));
    return { sw: de.scrollWidth, cw: de.clientWidth, textLen: body.length, first: body.slice(0, 90).replace(/\s+/g, " "), cut, trunc: trunc.length, trunc1: trunc[0] };
  });
  const slug = p.replace(/^\/framework\/ai\/sessions\/?/, "").replace(/\/$/, "").replace(/\//g, "_") || "root";
  const file = `${OUT}/${slug}-${w}.png`;
  await pg.screenshot({ path: file, fullPage: false });
  out.push({ p, w, file, nav, errs: errs.length, f404: f404.length, f1: f404[0], ...m });
  await ctx.close();
}
fs.writeFileSync(OUT + "/results.json", JSON.stringify(out, null, 1));
await Browser.close();
