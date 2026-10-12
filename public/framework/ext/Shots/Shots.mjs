/* Shots.mjs — the system class (plan.md): picks a page's widths, loads it, writes one round of
 * screenshots, diffs it against the round before, and appends the log. `Server/shots.mjs` is
 * the CLI; `ShotsView` (browser, built in step 2 of the slice) only reads what this writes.
 *
 * Format of `public/framework/ext/Shots/runs.jsonl` (plan.md "The log"); the "dir" on a `run`
 * line is the ROUND's own folder, repo-relative, posix, starting `public/` — not the page's
 * general screenshots folder — so a reader can join it straight onto a shot's bare filename.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { browser as launch } from "../../../../Server/browser.mjs";
import { PNG } from "./PNG.mjs";
import { Diff } from "./Diff.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../..");                 // repo root, four up from public/framework/ext/Shots
const RUNS_LOG = path.join(HERE, "runs.jsonl");

const STANDARD = [400, 1200, 1920, 3440];
const DEFAULT_BASE = "http://monorepo.localhost";
const MAX_HEIGHT = 4000;

export class Shots {

	static STANDARD = STANDARD;

	/** Shots.widths({resolutions, optimalWidth}) → number[] — plan.md "Widths (decided)".
	 * 1. a template's own `resolutions` list wins outright.
	 * 2. else `optimalWidth` W: the standard widths below W, then W itself; a W ≤ 400 (a
	 *    mobile-only button) gets only 400 — nothing above a capped layout's own cap.
	 * 3. else the four standard widths. */
	static widths({ resolutions, optimalWidth } = {}){
		if (Array.isArray(resolutions) && resolutions.length) return [...new Set(resolutions)].sort((a, b) => a - b);
		if (typeof optimalWidth === "number" && Number.isFinite(optimalWidth)){
			if (optimalWidth <= 400) return [400];
			return [...STANDARD.filter(w => w < optimalWidth), optimalWidth];
		}
		return STANDARD;
	}

	/** Shots.dir(url) → absolute path to this url's SCREENSHOTS ROOT (round folders live
	 * directly under it, one per round id) — the page's own folder's `screenshots/`, or, for a
	 * page with no folder of its own (declared inside a parent's page.js), the nearest ancestor
	 * that has a `page.js`, with `screenshots/<rest of the url>/` (plan.md "Where the files go"). */
	static dir(url){
		const clean = String(url).replace(/^\/+|\/+$/g, "");
		const segments = clean ? clean.split("/") : [];
		for (let i = segments.length; i >= 0; i--){
			const prefix = segments.slice(0, i);
			const pageDir = path.join(ROOT, "public", ...prefix);
			if (fs.existsSync(path.join(pageDir, "page.js"))){
				const rest = segments.slice(i);
				return path.join(pageDir, "screenshots", ...rest);
			}
		}
		throw new Error(`Shots.dir: no page.js found for "${url}" or any ancestor under public/`);
	}

	/** Run one round: load `url`, shoot every width, diff against `opts.vs` (or the url's
	 * latest round if there is one and `opts.vs` isn't given), write the pngs, append the log.
	 * Returns the round's log line plus its diffs, for the CLI to print. */
	static async run(url, opts = {}){
		const base = opts.base || DEFAULT_BASE;
		const full = new URL(url, base).toString();
		const screenshotsRoot = Shots.dir(url);
		const id = round_id();
		const roundDir = path.join(screenshotsRoot, id);
		fs.mkdirSync(roundDir, { recursive: true });

		const b = await launch();
		const context = await b.newContext();
		const page = await context.newPage();
		await page.goto(full, { waitUntil: "load", timeout: 20000 });
		if (opts.css) await page.addStyleTag({ content: opts.css });

		const info = await page.evaluate(() => {
			const active = window.app?.router?.active;
			if (!active) return {};
			return {
				resolutions: active.resolutions ?? active.constructor?.resolutions ?? null,
				optimalWidth: active.optimalWidth ?? active.constructor?.optimalWidth ?? null,
			};
		}).catch(() => ({}));
		const widths = opts.widths?.length ? opts.widths : Shots.widths(info);

		const shots = {};
		for (const w of widths){
			const height = w <= 400 ? 860 : 1080;
			// Review fix 1: keep the NORMAL viewport height — resizing it to the doc's full
			// height before shooting stretches every `vh`-sized section, so the picture isn't
			// what a user sees. Shoot full-page instead, then crop to MAX_HEIGHT afterwards.
			await page.setViewportSize({ width: w, height });
			await settle(page);
			const file = `${w}.png`;
			const buf = await page.screenshot({ fullPage: true });
			const img = PNG.decode(buf);
			const cut = img.height > MAX_HEIGHT;
			const shotHeight = cut ? MAX_HEIGHT : img.height;
			if (cut) fs.writeFileSync(path.join(roundDir, file), PNG.encode({ width: img.width, height: MAX_HEIGHT, data: img.data.subarray(0, img.width * MAX_HEIGHT * 4) }));
			else fs.writeFileSync(path.join(roundDir, file), buf);
			shots[w] = { file, height: shotHeight, cut };
		}
		await context.close();

		// Diff against --vs, or this url's own latest earlier round, when one exists — found
		// BEFORE the run line is written, so `parent` is right the first time (a run line is
		// appended once; it is never rewritten after the fact).
		const vsId = opts.vs ?? latest_round_id(url, id);
		const vsRun = vsId ? find_run(vsId) : null;

		const run = {
			id, url: as_url(url), dir: repo_rel(roundDir), widths, parent: vsRun ? vsId : null,
			note: opts.note ?? null, css: opts.css ?? null, task: opts.task ?? null, by: opts.by ?? null,
			at: now_iso(), shots,
		};
		append_line({ run });

		const diffs = [];
		if (vsRun){
			for (const w of widths){
				const vsShot = vsRun.shots?.[String(w)];
				if (!vsShot) continue;
				const beforePath = path.join(ROOT, vsRun.dir, vsShot.file);
				const afterPath = path.join(roundDir, shots[w].file);
				if (!fs.existsSync(beforePath)) continue;
				const before = PNG.decode(fs.readFileSync(beforePath));
				const after = PNG.decode(fs.readFileSync(afterPath));
				const result = Diff.compare(before, after);
				const overlay = `diff-${w}.png`;
				fs.writeFileSync(path.join(roundDir, overlay), PNG.encode(result.overlay));
				const diff = {
					id, vs: vsId, width: w, changed: result.changed,
					regions: result.regions, regionsMore: result.regionsMore,
					moved: result.moved, movedMore: result.movedMore,
					overlay, height: result.height,
				};
				append_line({ diff });
				diffs.push(diff);
			}
		}

		return { run, diffs };
	}

	/** Shots.judge(id, verdict, why, by) → appends a `judge` line. `vs` is read back off the
	 * round's own `run` line (its `parent`) so a caller never has to look it up by hand. */
	static judge(id, verdict, why, by){
		if (!["better", "worse", "same"].includes(verdict))
			throw new Error(`Shots.judge: verdict must be better|worse|same, got "${verdict}"`);
		const run = find_run(id);
		const vs = run?.parent ?? null;
		const judge = { id, vs, verdict, by: by ?? null, why: why ?? null, at: now_iso() };
		append_line({ judge });
		return judge;
	}

	/** Shots.rounds(url) → every run/diff/judge line for this url's rounds, as a flat list in
	 * log order (oldest first) — a caller builds the parent/child tree from each run's `parent`. */
	static rounds(url){
		const want = as_url(url);
		const lines = read_lines();   // review fix 6: one read for the whole call, not one per line
		const runsById = new Map();
		for (const l of lines) if (l.run) runsById.set(l.run.id, l.run);
		return lines.filter(l => (l.run && l.run.url === want) || (l.diff && runsById.get(l.diff.id)?.url === want) || (l.judge && runsById.get(l.judge.id)?.url === want));
	}
}

function settle(page){
	return page.waitForLoadState("networkidle", { timeout: 4000 }).catch(() => {}).then(() => page.waitForTimeout(300));
}

// Review fix 6: ids have one-second resolution, so two rounds in the same second would share a
// folder — a repeat gets a `-2`, `-3`, ... suffix instead of silently colliding.
function round_id(){
	const d = new Date();
	const pad = n => String(n).padStart(2, "0");
	const base = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
	const existing = new Set(read_lines().filter(l => l.run).map(l => l.run.id));
	if (!existing.has(base)) return base;
	let n = 2;
	while (existing.has(`${base}-${n}`)) n++;
	return `${base}-${n}`;
}

function now_iso(){ return new Date().toISOString(); }

// Review fix 6: drop `?query`/`#hash` so such urls join the SAME round history as the bare path.
function as_url(url){
	let u = String(url).replace(/^https?:\/\/[^/]+/, "");
	u = u.split("?")[0].split("#")[0];
	if (!u.startsWith("/")) u = "/" + u;
	if (!u.endsWith("/")) u += "/";
	return u;
}

function repo_rel(absPath){
	return path.relative(ROOT, absPath).split(path.sep).join("/");
}

function read_lines(){
	if (!fs.existsSync(RUNS_LOG)) return [];
	return fs.readFileSync(RUNS_LOG, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
}

function append_line(obj){
	fs.mkdirSync(path.dirname(RUNS_LOG), { recursive: true });
	fs.appendFileSync(RUNS_LOG, JSON.stringify(obj) + "\n");
}

function find_run(id){
	return read_lines().find(l => l.run?.id === id)?.run ?? null;
}

// The latest round for this url strictly before `excludeId` (the one just written) — so a
// fresh `run()` call with no `--vs` diffs against whatever came before it, never itself.
function latest_round_id(url, excludeId){
	const want = as_url(url);
	const runs = read_lines().map(l => l.run).filter(r => r && r.url === want && r.id !== excludeId);
	runs.sort((a, b) => a.id.localeCompare(b.id));
	return runs.length ? runs[runs.length - 1].id : null;
}


export default Shots;
