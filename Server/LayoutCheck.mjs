/* Server/LayoutCheck.mjs — class LayoutCheck: a numeric layout check at merge time, no screenshots.
 *
 *   node Server/LayoutCheck.mjs <base url> <page url>... [--widths 400,1200] [--json] [--baseline]
 *     /live/plan/ui-kit/    400   BROKEN 1  OFF 3    text overflows its card (.live-card > p)
 *     /live/plan/ui-kit/   1200   GOOD
 *
 * Opens each `<page url>` headless, at each width, through `Server/Browser.mjs` (the one launcher
 * every script shares — `Server/smoke.mjs` uses the same one). Once `.page.active-page` (or the
 * body, for a page with no such wrapper) has appeared and settled 350ms — the same wait `frame()`
 * in `/framework/ext/DesignTool/DesignTool.js` gives a layout before reading it — it runs
 * `analyze(root)` from that module and `PaddingContract.check(root)` from
 * `/framework/library/PaddingContract.js` INSIDE the page (both are browser-only: they read
 * `getComputedStyle`/`getBoundingClientRect`, so there is no Node-side way to call them).
 *
 * BROKEN vs OFF: `analyze()`'s own high-severity findings (`sev: "high"`) plus every
 * `PaddingContract` misuse (text or a box touching an unpadded parent edge — always a real bug,
 * never a matter of taste) count as BROKEN. `analyze()`'s `med`/`low` findings are OFF — alignment,
 * proportion, the softer tier `ext/DesignTool/readme.md` calls "polish", never why a merge pauses.
 * GOOD is neither.
 *
 * Baseline: `--baseline` WRITES `layout-baseline.jsonl` (beside this file), one line per
 * url+width with its counts and finding keys — the current state, taken as "already known about".
 * Without `--baseline` (the merge's own run), each url+width is compared against its last written
 * baseline line (by url+width) and the table also says how many of today's BROKEN findings are
 * NOT in that baseline ("new BROKEN: N") — a BROKEN finding nobody has seen before, not just a
 * BROKEN count that was already there yesterday. A url+width with no baseline line yet counts
 * every one of its BROKEN findings as new.
 *
 * A page that fails to load (timeout, a thrown navigation error) is one line saying so — this
 * script never throws out of `check()`, so one bad page cannot stop the rest of the run.
 *
 * The browser context is recycled every RECYCLE_EVERY navigations (`ext/DesignTool/readme.md`,
 * "Watch out": Chrome wedges after 85-110 navigations in one context).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { browser as launch } from "./Browser.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = path.join(HERE, "layout-baseline.jsonl");

export default class LayoutCheck {
	static RECYCLE_EVERY = 40;
	static ROOT_SELECTOR = ".page.active-page";
	static SETTLE_MS = 350;

	/* Runs INSIDE the page — self-contained, no closure over anything out here (same shape as
	 * `ext/DesignTool/vision/run.mjs`'s own `pick()`). Both modules are browser-only (DOM reads),
	 * so this can't run in Node even with a probe model. */
	static async measure_in_page(){
		const root = document.querySelector(".page.active-page") ?? document.body;
		const { analyze } = await import("/framework/ext/DesignTool/DesignTool.js");
		const { default: PaddingContract } = await import("/framework/library/PaddingContract.js");
		const report = analyze(root);
		const pad = PaddingContract.check(root).map(el => ({
			sev: "high", title: "padding contract", sel: el.className || el.tagName.toLowerCase(),
			detail: "needs_parent_padding inside an unpadded box (no padding, no border, on the side it touches)",
		}));
		return {
			counts: report.counts,
			issues: report.issues.map(i => ({ sev: i.sev, title: i.title, detail: i.detail, sel: i.sel })),
			pad,
		};
	}

	/* One finding → one stable key, for comparing against the baseline (`sev:title:selector` — the
	 * same finding on the same element, whatever its wording changed to). */
	static key(f){ return `${f.sev}:${f.title}:${f.sel}`; }

	/* `raw` is what `measure_in_page()` returned (or null on a load failure). Classifies it into
	 * BROKEN/OFF, a flat finding list (worst first), and the baseline keys this url+width earns. */
	static classify(raw){
		const all = [...raw.pad, ...raw.issues];
		const RANK = { high: 3, med: 2, low: 1 };
		all.sort((a, b) => RANK[b.sev] - RANK[a.sev]);
		const broken = all.filter(f => f.sev === "high");
		const off = all.filter(f => f.sev !== "high");
		return {
			broken: broken.length, off: off.length,
			findings: all.slice(0, 3),
			keys: { broken: broken.map(this.key), off: off.map(this.key) },
		};
	}

	/* How many of `keys.broken` are not in `baseEntry`'s own broken keys (absent baseline: every one is new). */
	static new_broken(keys, baseEntry){
		const known = new Set(baseEntry?.broken ?? []);
		return keys.broken.filter(k => !known.has(k)).length;
	}

	/* One result object for a url at a width: `{url, width, ok, error?, broken, off, findings, keys, newBroken}`.
	 * `newBroken` is only set when `baseline` (the read map) is given. Never throws. */
	static async check_one(context, base, url, width, { baseline = null } = {}){
		const page = await context.newPage();
		try {
			await page.setViewportSize({ width, height: Math.max(800, Math.round(width * 0.65)) });
			let res;
			try { res = await page.goto(base + url, { waitUntil: "load", timeout: 30000 }); }
			catch (e) { return { url, width, ok: false, error: "load failed: " + e.message.split("\n")[0] }; }
			if (!res) return { url, width, ok: false, error: "no response" };
			await page.waitForSelector(this.ROOT_SELECTOR, { timeout: 15000 }).catch(() => {});
			await page.waitForTimeout(this.SETTLE_MS);
			const raw = await page.evaluate(this.measure_in_page).catch(e => ({ error: String(e?.message ?? e) }));
			if (raw.error) return { url, width, ok: false, error: "analyze failed: " + raw.error };
			const { broken, off, findings, keys } = this.classify(raw);
			const out = { url, width, ok: true, broken, off, findings, keys };
			if (baseline) out.newBroken = this.new_broken(keys, baseline.get(`${url}@${width}`));
			return out;
		} finally { await page.close(); }
	}

	/* Baseline file: one JSON object per line, `{url, width, broken, off, keys}`. Read as a
	 * `Map` keyed `url@width`, keeping only the LAST line for a given key (a later run replaces
	 * an earlier one, same as every other append-only store here). */
	static read_baseline(){
		const map = new Map();
		if (!fs.existsSync(BASELINE_PATH)) return map;
		for (const line of fs.readFileSync(BASELINE_PATH, "utf8").split("\n")) {
			if (!line.trim()) continue;
			try { const e = JSON.parse(line); map.set(`${e.url}@${e.width}`, e.keys); } catch {}
		}
		return map;
	}

	/* Rewrites the file: every url+width checked now replaces its old line; lines for pages this
	 * run did not check are kept, so a baseline of five pages never wipes the rest. */
	static write_baseline(results){
		const rows = new Map();
		if (fs.existsSync(BASELINE_PATH)) for (const line of fs.readFileSync(BASELINE_PATH, "utf8").split("\n")) {
			try { const e = JSON.parse(line); rows.set(`${e.url}@${e.width}`, e); } catch {}
		}
		for (const r of results.filter(r => r.ok)) rows.set(`${r.url}@${r.width}`, { url: r.url, width: r.width, broken: r.broken, off: r.off, keys: r.keys });
		fs.writeFileSync(BASELINE_PATH, [...rows.values()].map(e => JSON.stringify(e) + "\n").join(""));
	}

	/* One line of the table — the whole formatting contract in one place, so a test can check it
	 * without a browser. */
	static format_line(r){
		if (!r.ok) return `FAIL ${r.url}  ${r.width}  ${r.error}`;
		const head = `  ${r.url.padEnd(28)} ${String(r.width).padStart(5)}   `;
		if (!r.broken && !r.off) return head + "GOOD";
		const counts = `BROKEN ${r.broken}  OFF ${r.off}`;
		const top = r.findings[0];
		const msg = top ? `    ${top.detail || top.title} (${top.sel})` : "";
		const newBroken = typeof r.newBroken === "number" ? `  — new BROKEN: ${r.newBroken}` : "";
		return head + counts + newBroken + msg;
	}

	/* Runs `urls × widths`, recycling the context every RECYCLE_EVERY navigations. Never throws:
	 * one url+width's own failure is a result with `ok:false`, not a rejection. */
	static async run(base, urls, widths, { baseline = null, browserInstance = null } = {}){
		const browser = browserInstance ?? (await launch());
		let context = await browser.newContext();
		let navs = 0;
		const results = [];
		for (const url of urls) {
			for (const width of widths) {
				if (navs > 0 && navs % this.RECYCLE_EVERY === 0) { await context.close(); context = await browser.newContext(); }
				navs++;
				results.push(await this.check_one(context, base, url, width, { baseline }));
			}
		}
		await context.close();
		return results;
	}

	/* The one line `Server/merge.mjs` echoes after the table — totals across every url+width
	 * actually checked (a FAIL line counts as checked, not as broken). */
	static summary_line(results){
		const checked = results.length;
		const newBroken = results.reduce((s, r) => s + (r.newBroken ?? 0), 0);
		return `layout check: ${checked} page${checked === 1 ? "" : "s"}, ${newBroken} new BROKEN (report only)`;
	}
}

// ── CLI ──────────────────────────────────────────────────────────────────
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` || process.argv[1]?.endsWith("LayoutCheck.mjs")) {
	const argv = process.argv.slice(2);
	const opt = name => { const i = argv.indexOf("--" + name); if (i < 0) return null; const v = argv[i + 1]; argv.splice(i, 2); return v; };
	const flag = name => { const i = argv.indexOf("--" + name); if (i < 0) return false; argv.splice(i, 1); return true; };
	const widthsOpt = opt("widths");
	const asJson = flag("json");
	const doBaseline = flag("baseline");
	const [base, ...rest] = argv;
	// Git Bash (MSYS) rewrites "/x/" into "C:/Program Files/Git/x/" when this is run directly from a
	// git-bash shell (never from merge.mjs's own spawnSync, which passes argv with no shell in between) —
	// same fix as Server/smoke.mjs.
	const urls = rest.map(p => { const m = /^[A-Za-z]:[\\/].*?[\\/]Git([\\/].*)$/i.exec(p); p = (m ? m[1] : p).replace(/\\/g, "/"); return p.startsWith("/") ? p : "/" + p; });
	if (!base || !urls.length) {
		console.error("usage: node Server/LayoutCheck.mjs <base url> <page url>... [--widths 400,1200] [--json] [--baseline]");
		process.exit(2);
	}
	const widths = (widthsOpt ? widthsOpt.split(",") : ["400", "1200"]).map(Number).filter(Boolean);
	const baseUrl = base.replace(/\/$/, "");
	const baselineMap = doBaseline ? null : LayoutCheck.read_baseline();

	const results = await LayoutCheck.run(baseUrl, urls, widths, { baseline: baselineMap });
	if (doBaseline) LayoutCheck.write_baseline(results);

	if (asJson) console.log(JSON.stringify(results, null, 2));
	else {
		for (const r of results) console.log(LayoutCheck.format_line(r));
		console.log(LayoutCheck.summary_line(results));
	}
	const { close } = await import("./Browser.mjs");
	await close();
	process.exit(0);   // report only — never fails the run itself; a caller that wants a gate reads the result
}
