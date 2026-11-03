// Shoot the ✦ sheet at 400 wide on a worktree URL. node sheet-shot.mjs <url> <out.png>
import { browser as launch } from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";
const [url, out] = process.argv.slice(2);
const b = await launch(); const p = await b.newPage({ viewport: { width: 400, height: 820 } });
await p.goto(url + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
await p.locator(".drawer-rail-ai").click(); await p.waitForTimeout(800); await p.locator(".drawer-rail-sheet-up").click().catch(() => {}); await p.waitForTimeout(1200);
const m = await p.evaluate(() => { const q = s => document.querySelector(s); const box = e => e && (r => ({ top: Math.round(r.top), h: Math.round(r.height), l: Math.round(r.left), w: Math.round(r.width) }))(e.getBoundingClientRect());
	const cs = s => { const e = q(s); if (!e) return null; const c = getComputedStyle(e); return { pad: c.padding, margin: c.margin, ...box(e) }; };
	return { sheet: cs(".drawer-rail-sheet"), head: cs(".drawer-rail-sheet-head"), card: cs(".drawer-rail-sheet .ux-dictate-widget-card"), thread: cs(".drawer-rail-sheet .ux-dictate-widget-thread"), log: cs(".drawer-rail-sheet .chatbox-log"), bar: cs(".drawer-rail-sheet .dictation-bar"), mic: cs(".drawer-rail-sheet .dictation-bar-mic") }; });
console.log(JSON.stringify(m, null, 1));
await p.screenshot({ path: out }); await b.close();
