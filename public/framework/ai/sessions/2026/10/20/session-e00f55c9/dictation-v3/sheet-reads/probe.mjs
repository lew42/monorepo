import { browser as get_browser } from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";
import fs from "node:fs";
const key_url = fs.readFileSync(process.env.LOCALAPPDATA + "/lew42/servex/site.url", "utf8").trim();
const base = process.env.BASE ?? "https://monorepo.lew42.com", out = process.env.TEMP + "/dv3/";
const b = await get_browser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
	userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36" });
await ctx.addInitScript(() => {
	window.__log = [];
	const L = (...a) => window.__log.push(new Date().toISOString().slice(11, 19) + " " + a.join(" "));
	const play = HTMLMediaElement.prototype.play;
	HTMLMediaElement.prototype.play = function(){ const src = String(this.src).slice(0, 40); const p = play.call(this); p.then(() => L("play ok", src), e => L("play REJECT", e.name, src)); return p; };
	const ES = window.EventSource;
	window.EventSource = function(u, o){ L("EventSource", String(u).replace(/site_key=[^&]+/, "k").slice(-70)); const s = new ES(u, o); s.addEventListener("message", e => { try { const d = JSON.parse(e.data); if (d.kind === "stream" || d.line?.chat) L("wire", d.kind, d.role ?? d.line?.chat?.from?.id ?? "", (d.text ?? d.line?.chat?.text ?? "").slice(0, 30)); } catch {} }); return s; };
	window.EventSource.prototype = ES.prototype; Object.assign(window.EventSource, { CLOSED: 2, OPEN: 1, CONNECTING: 0 });
});
const page = await ctx.newPage();
const net = [];
page.on("request", r => { if (/recite|session\/say|\/stream/.test(r.url())) net.push(new Date().toISOString().slice(11, 19) + " " + r.method() + " " + r.url().replace(/site_key=[^&]+/, "k").slice(-60)); });
page.on("response", r => { if (/recite/.test(r.url())) net.push("  -> " + r.status() + " " + r.url().slice(-30)); });
page.on("pageerror", e => net.push("PAGEERROR " + String(e).slice(0, 200)));
if (base.includes("lew42.com")) await page.goto(key_url, { waitUntil: "domcontentloaded" });
await page.goto(base + "/framework/", { waitUntil: "domcontentloaded", timeout: 45000 });
const key = await page.evaluate(() => Object.keys(sessionStorage));
await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (/session/i.test(k)) console.log(k); });
await page.evaluate(f => sessionStorage.setItem(f.k, JSON.stringify({ session: "v-u48msei", file: "/framework/ai/sessions/2026/11/01/v-u48msei/session.jsonl" })), { k: process.env.SKEY });
await page.reload({ waitUntil: "networkidle" });
/* no tap on ✦: the Sheet must start Recite by itself */
await page.waitForTimeout(4000);
const state = async tag => page.evaluate(async tag => {
	const R = window.__lew_recite ?? (await import("/framework/audio/Recite/Recite.js")).default.shared;
	const bar = document.querySelector(".audio-recite-wrap"); const r = bar?.getBoundingClientRect();
	return { tag, sheet_mode: document.querySelector(".drawer-rail-sheet")?.dataset?.mode ?? document.querySelector(".drawer-rail-sheet")?.className?.slice(0, 80),
		bar: !!bar, bar_box: r ? [Math.round(r.top), Math.round(r.height)] : null, bar_visible: !!bar && r.height > 0 && r.top < innerHeight && getComputedStyle(bar).visibility !== "hidden",
		recite: { auto: R.auto, state: R.state, error: R.error, server: R.server, chunks: R.chunks.length, unlocked: R.unlocked ?? null } };
}, tag);
console.log(JSON.stringify(await state("after ✦")));
await page.screenshot({ path: out + "real-1-strip.png" });
// type a message, as the owner would
await page.evaluate(async () => {
	const R = (await import("/framework/audio/Recite/Recite.js")).default.shared;
	const fw = R.from_wire.bind(R); R.from_wire = ev => { window.__log.push("from_wire " + ev?.kind + " " + (ev?.role ?? ev?.line?.chat?.from?.id ?? Object.keys(ev?.line ?? {})[0] ?? "")); return fw(ev); };
});
await page.tap("body").catch(()=>{});   // one tap, as the owner taps the mic: unlocks the audio
await page.waitForTimeout(Number(process.env.WAIT ?? 150000));
console.log(JSON.stringify(await state("after reply")));
await page.screenshot({ path: out + "real-2-reply.png" });
console.log((await page.evaluate(() => window.__log)).join("\n")); console.log(net.join("\n"));
await b.close?.();
