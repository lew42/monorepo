/* Regression test for the drawer that didn't give the page its space back (2026-10-02).
 * Run: SITE=http://localhost:<port> node regression.mjs   (default: the live site)
 * Every case opens the ☰ drawer some way, closes it, and checks the page is whole again:
 * `.app` has no right padding, no `--drawer` is left on <html>/<body>/.app, and the ☰ is back
 * in its corner. Headless only; Servex is stubbed. */
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
const SITE = process.env.SITE ?? "http://monorepo.localhost", PAGE = process.env.PAGE ?? "/framework/ux/Dictate/";
const SHOTS = process.env.SHOTS;
const b = await chromium.launch();
const state = p => p.evaluate(() => {
	const app = document.querySelector(".app"), m = document.querySelector(".drawer-menu");
	const left = [document.documentElement, document.body, app].filter(el => el?.style.getPropertyValue("--drawer"));
	return { pad: parseFloat(getComputedStyle(app).paddingInlineEnd), left: left.length, menu: m ? Math.round(m.getBoundingClientRect().right) : null, vw: innerWidth };
});
let pass = 0, fail = 0;
const check = (name, s, base) => {
	const ok = s.pad === 0 && s.left === 0 && s.menu === base.menu;
	ok ? pass++ : fail++;
	console.log(ok ? "PASS" : "FAIL", name, JSON.stringify(s));
};
const stub = p => p.route(/127\.0\.0\.1:8090|servex\.localhost/, r => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ ok: true, sessions: [], cards: [], agents: [] }) }));
const W = 1920;   // the ☰ drawer pushes the page only on wide screens; below 52em it is the bottom sheet
async function fresh(url){ const p = await b.newPage({ viewport: { width: W, height: 900 } }); await stub(p); await p.goto(url, { waitUntil: "networkidle" }); await p.waitForTimeout(600); return p; }
const base = await state(await fresh(SITE + PAGE));
const close_x = p => p.click(".drawer-x"), close_menu = p => p.click(".drawer-menu");
const cases = {
	"☰ open → ☰ close": async p => { await close_menu(p); await p.waitForTimeout(300); await close_menu(p); },
	"☰ open → ✕ close": async p => { await close_menu(p); await p.waitForTimeout(300); await close_x(p); },
	"?drawer=ai on load → ✕ close": null,
	"?drawer=ai on load → ☰ close": null,
	"☰ open → reload → ✕ close": async p => { await close_menu(p); await p.waitForTimeout(300); await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(600); await close_x(p); },
	"?drawer=ai → drag resizer → ✕ close": null,
	"☰ open → drag resizer → ☰ close": async p => { await close_menu(p); await p.waitForTimeout(300); await drag(p); await close_menu(p); },
};
async function drag(p){
	const r = await p.locator(".drawer").boundingBox();
	await p.mouse.move(r.x + 2, r.y + 300); await p.mouse.down(); await p.mouse.move(r.x - 150, r.y + 300, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(300);
}
for (const [name, fn] of Object.entries(cases)){
	const routed = name.startsWith("?drawer=ai");
	const p = await fresh(SITE + PAGE + (routed ? "?drawer=ai" : ""));
	if (routed){ if (name.includes("drag")) await drag(p); await (name.includes("☰ close") ? close_menu(p) : close_x(p)); }
	else await fn(p);
	await p.waitForTimeout(400);
	check(name, await state(p), base);
	if (SHOTS && routed && !name.includes("drag")) await p.screenshot({ path: `${SHOTS}/after-close-${W}.png` });
	await p.close();
}
// 400: the page never takes the push at all, open or shut.
{ const p = await b.newPage({ viewport: { width: 400, height: 800 } }); await stub(p); await p.goto(SITE + PAGE + "?drawer=ai", { waitUntil: "networkidle" }); await p.waitForTimeout(600);
  const s = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".app")).paddingInlineEnd)); (s === 0 ? pass++ : fail++); console.log(s === 0 ? "PASS" : "FAIL", "400 ?drawer=ai: no push", s);
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/drawer-open-400.png` }); await p.close(); }
console.log(`${pass} passed, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);
