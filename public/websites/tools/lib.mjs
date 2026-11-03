/**
 * The three tools' shared bits: where the records live, how a record is read and
 * written, and how a browser is launched.
 *
 * Node only. Nothing in `public/` imports this — the browser never runs a tool.
 */
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const here = dirname(fileURLToPath(import.meta.url));   // public/websites/tools/
export const websites = join(here, "..");                      // public/websites/
export const site_dir = join(websites, "site");                // public/websites/site/

/* Playwright is a GLOBAL npm install, not a dependency of this repo (CLAUDE.md: no
 * new npm dependency). This absolute file: url is the verified way in — do not
 * replace it with a bare `import "playwright"`, which resolves against the repo and
 * fails. Override with PLAYWRIGHT_PATH if the global install ever moves. */
export const playwright_path = process.env.PLAYWRIGHT_PATH
	?? "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.js";

/* The four viewports every site is shot and scanned at — a phone, a laptop, a desktop
 * and an ultrawide. The keys are the strings a json's `shots` and `layout` are keyed by,
 * so this array is the only place the widths are written down. */
export const widths = [
	{ key: "400", width: 400, height: 844 },
	{ key: "1280", width: 1280, height: 800 },
	{ key: "1920", width: 1920, height: 1080 },
	{ key: "3440", width: 3440, height: 1440 },
];

// The order a record's keys are written in, so a hand-edit and a tool-write produce
// the same file and a diff shows only what actually changed.
const key_order = [
	"name", "url", "title", "category", "captured_at", "embed", "embed_note",
	"shots", "layout", "sections", "tags", "responsive", "scan", "notes",
];

export const record_path = name => join(site_dir, name + ".json");
export const shots_dir = name => join(site_dir, name);

export async function read_record(name){
	try { return JSON.parse(await readFile(record_path(name), "utf8")); }
	catch { return null; }
}

/* Merge `patch` over the record on disk and write it back. Top-level keys the patch
 * names are REPLACED, never deep-merged: a tool owns whole keys (`shots`, `scan`) and a
 * human owns others (`layout`, `sections`, `tags`, `notes`), so a re-run refreshes the
 * machine's half and cannot touch the hand-written half. */
export async function write_record(name, patch){
	const merged = { name, ...(await read_record(name) ?? {}), ...patch };
	const ordered = {};
	for (const k of key_order) if (k in merged) ordered[k] = merged[k];
	for (const k of Object.keys(merged)) if (!(k in ordered)) ordered[k] = merged[k];
	await mkdir(site_dir, { recursive: true });
	await writeFile(record_path(name), JSON.stringify(ordered, null, "\t") + "\n");
	return ordered;
}

export async function record_names(){
	const files = await readdir(site_dir).catch(() => []);
	return files.filter(f => f.endsWith(".json") && f !== "index.json").map(f => f.slice(0, -5)).sort();
}

export async function launch(){
	const pw = await import(playwright_path);
	return (pw.default ?? pw).chromium.launch();
}

/* One load, the same way every time: `load` then a fixed settle. `networkidle` hangs
 * forever on any site that long-polls or runs an analytics heartbeat (measured on
 * stripe.com), so it is never used here. Returns the response, or null if the load
 * failed — the caller logs and moves on rather than retrying in a loop. */
export async function visit(page, url, settle = 1500){
	const res = await page.goto(url, { waitUntil: "load", timeout: 45000 }).catch(e => {
		console.error("  load failed:", e.message.split("\n")[0]);
		return null;
	});
	if (res) await page.waitForTimeout(settle);
	return res;
}

export function usage(line){
	console.error(line);
	process.exit(1);
}
