/* `node Server/layout-check.mjs <url...> [--widths 1280,1920,2560,3440] [--out dir] [--height 1000]`
 * Is the screen space used properly? One headless browser, one context per width. Per width it
 * writes a screenshot; per url one contact sheet (all widths side by side) and one small JSON:
 *   empty        fraction of the viewport with no text, image or control under it (40x25 samples)
 *   widest_text  widest single line of text, px (compare with --measure)
 *   overflow_x   true if anything pokes past the viewport's right edge (scrollers excluded)
 *   narrow_share share of repeated items (4+ look-alike siblings) narrower than 15% of the width
 *   errors       console + page errors
 * Read the contact sheet first; the numbers say where to look. Exit code 1 if any url has errors
 * or overflow. Output: <out>/<slug>/<width>.png, sheet.png, layout.json (default: ./layout-check-out). */
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf("--" + name); if (i < 0) return def; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const widths = opt("widths", "1280,1920,2560,3440").split(",").map(Number);
const out = path.resolve(opt("out", "layout-check-out"));
const height = Number(opt("height", 1000));
const urls = argv.filter(a => !a.startsWith("--"));
if (!urls.length){ console.error("usage: node Server/layout-check.mjs <url...> [--widths 1280,1920,2560,3440]"); process.exit(2); }

const measure = () => {
	const W = innerWidth, H = innerHeight, vis = el => el.checkVisibility?.() ?? true;
	const cols = 40, rows = 25, grid = new Uint8Array(cols * rows);
	const mark = r => {
		const x0 = Math.max(0, Math.floor(r.left / W * cols)), x1 = Math.min(cols - 1, Math.floor((r.right - 0.01) / W * cols));
		const y0 = Math.max(0, Math.floor(r.top / H * rows)), y1 = Math.min(rows - 1, Math.floor((r.bottom - 0.01) / H * rows));
		for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) grid[y * cols + x] = 1;
	};
	let widest = 0, widest_text = "";
	const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	for (let n; (n = walker.nextNode());){
		if (!n.textContent.trim() || !vis(n.parentElement)) continue;
		if (n.parentElement.closest("script,style,.dev-bar")) continue;
		const rg = document.createRange(); rg.selectNodeContents(n);
		for (const r of rg.getClientRects()){
			if (r.width < 1 || r.right < 0 || r.left > W) continue;
			mark(r);
			const pe = n.parentElement, cs = getComputedStyle(pe);
			const shown = cs.textOverflow === "ellipsis" && pe.scrollWidth > pe.clientWidth ? pe.clientWidth : r.width;   // a clipped line is only as wide as its box
			if (shown > widest && r.top < H * 3){ widest = shown; widest_text = n.textContent.trim().slice(0, 40); }
		}
	}
	document.querySelectorAll("img,canvas,svg,video,input,textarea,button,select").forEach(el => { if (vis(el)) mark(el.getBoundingClientRect()); });
	const empty = 1 - grid.reduce((a, b) => a + b, 0) / grid.length;
	// overflow: an element past the right edge whose scrolling ancestor does not scroll x
	let overflow = document.documentElement.scrollWidth > W + 1;
	const scrolls = el => { for (let p = el.parentElement; p; p = p.parentElement){ const o = getComputedStyle(p).overflowX; if (o === "auto" || o === "scroll" || o === "hidden") return true; } return false; };
	if (!overflow) for (const el of document.body.querySelectorAll("*")){
		if (el.closest(".dev-bar") || !vis(el)) continue;
		const r = el.getBoundingClientRect();
		if (r.width && r.right > W + 2 && !scrolls(el)){ overflow = true; break; }
	}
	// items: 4+ look-alike siblings; how many are narrower than 15% of the width
	let items = 0, narrow = 0;
	document.body.querySelectorAll("*").forEach(par => {
		const by = {};
		[...par.children].forEach(c => { if (vis(c) && c.getBoundingClientRect().width) (by[c.tagName + "." + c.className] ??= []).push(c); });
		Object.values(by).forEach(g => { if (g.length >= 4){ items += g.length; narrow += g.filter(c => c.getBoundingClientRect().width < W * 0.15).length; } });
	});
	return { empty: +empty.toFixed(3), widest_text: Math.round(widest), widest_text_sample: widest_text, overflow_x: overflow, items, narrow_share: items ? +(narrow / items).toFixed(3) : 0 };
};

const slug = u => u.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "page";
const b = await chromium.launch();
const t0 = Date.now();
const contexts = await Promise.all(widths.map(w => b.newContext({ viewport: { width: w, height } })));
let bad = 0;
for (const url of urls){
	const dir = path.join(out, slug(url)); fs.mkdirSync(dir, { recursive: true });
	const res = { url, widths: {}, errors: [] };
	await Promise.all(widths.map(async (w, i) => {
		const page = await contexts[i].newPage();
		const errs = [];
		page.on("console", m => { if (m.type() === "error") errs.push(w + ": " + m.text().slice(0, 200)); });
		page.on("pageerror", e => errs.push(w + ": " + String(e).slice(0, 200)));
		await page.addInitScript(() => { window.$BLOCKRELOAD = true; });
		await page.goto(url, { waitUntil: "load", timeout: 15000 }).catch(e => errs.push(w + ": goto " + e.message.slice(0, 100)));
		await page.waitForLoadState("networkidle", { timeout: 4000 }).catch(() => {});
		await page.waitForTimeout(1200);
		res.widths[w] = await page.evaluate(measure);
		await page.screenshot({ path: path.join(dir, w + ".png") });
		res.errors.push(...errs);
		await page.close();
	}));
	// contact sheet: every width scaled to the same height, side by side
	const sheet = await b.newPage({ viewport: { width: 2400, height: 700 } });
	const total = widths.reduce((a, w) => a + w, 0), scale = (2400 - 20 * widths.length) / total;
	const html = `<body style="margin:0;background:#222;font:14px sans-serif;color:#fff"><div style="display:flex;gap:20px;padding:10px;align-items:flex-start">` +
		widths.map(w => `<figure style="margin:0"><img style="display:block;width:${Math.round(w * scale)}px;border:1px solid #666" src="data:image/png;base64,${fs.readFileSync(path.join(dir, w + ".png")).toString("base64")}"><figcaption>${w}px · empty ${Math.round(res.widths[w].empty * 100)}% · widest ${res.widths[w].widest_text}px</figcaption></figure>`).join("") + `</div></body>`;
	await sheet.setContent(html); await sheet.screenshot({ path: path.join(dir, "sheet.png"), fullPage: true }); await sheet.close();
	res.errors = [...new Set(res.errors)];
	fs.writeFileSync(path.join(dir, "layout.json"), JSON.stringify(res, null, 1));
	const flags = (res.errors.length || Object.values(res.widths).some(m => m.overflow_x)) ? 1 : 0; bad += flags;
	console.log(url, flags ? "PROBLEMS" : "ok", "→", path.join(dir, "sheet.png"));
	widths.forEach(w => { const m = res.widths[w]; console.log(`  ${w}: empty ${m.empty} · widest ${m.widest_text}px · overflow ${m.overflow_x} · narrow ${m.narrow_share} of ${m.items}`); });
	if (res.errors.length) console.log("  errors:", res.errors.slice(0, 3));
}
await b.close();
console.log(`${((Date.now() - t0) / 1000).toFixed(1)}s`);
process.exit(bad ? 1 : 0);
