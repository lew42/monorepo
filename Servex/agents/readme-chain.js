/* README CHAIN — what a fresh agent starts already knowing about "where it is".
 *
 * `readme_chain(dir)` walks from the repo root down to `dir`, one path segment
 * at a time (root, then `public/`, then `public/framework/`, …), and collects
 * the `readme.md` (or `README.md`) at every level that has one. It never opens
 * the root `CLAUDE.md` — that file is already injected into every agent's
 * context separately (Agents.js / the SDK's own project-instructions load), so
 * repeating it here would just be the same words twice.
 *
 * Each readme is cut to its FIRST SCREEN: up to its own `## More` heading, or
 * its first 40 lines, whichever comes first. Below that a reader is expected
 * to open the file itself — this only tells it that file exists and where.
 *
 * `first_prompt(dir, extras)` is the seam another program (task-placement's
 * "Recent sessions" block, or anything else that wants to prepend context to a
 * fresh agent's first message) is meant to call: it formats the chain as one
 * block, applies a rough 3,000-token cap (cutting the MOST GENERAL readmes —
 * root, then `public/`, then … — first, so what's closest to `dir` survives
 * longest), then appends each of `extras` as its own `## <label>` section.
 *
 * Plain functions, no class, never throw: a readme this can't read (permissions,
 * a symlink loop, whatever) is just skipped, the same as a level with no readme
 * at all. Matches brief.js's own shape and promise. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(HERE, "../..");

const FIRST_SCREEN_LINES = 40;
const TOKEN_CAP = 3000;
const CHAR_CAP = TOKEN_CAP * 4;   // the brief's own rule of thumb: chars/4 ~= tokens

/* The readme at exactly this directory, or null. Case-insensitive on the two
 * spellings this codebase actually uses; never throws on a missing dir. */
function readme_file(dir){
	for (const name of ["readme.md", "README.md"]){
		const p = path.join(dir, name);
		try { if (fs.statSync(p).isFile()) return p; } catch {}
	}
	return null;
}

/* Cut a readme's text to its first screen. `truncated` is true whenever there
 * is more content below the cut, whether that's because `## More` fired or
 * because the file just ran past 40 lines. */
function first_screen(text){
	const lines = text.split(/\r?\n/);
	const more_at = lines.findIndex(l => /^##\s+More\b/i.test(l.trim()));
	const limit = more_at >= 0 ? Math.min(more_at, FIRST_SCREEN_LINES) : FIRST_SCREEN_LINES;
	return { text: lines.slice(0, limit).join("\n").replace(/\s+$/, ""), truncated: lines.length > limit };
}

/* `dir` -> its readme entry, or null if there is none / it can't be read. */
function level(dir){
	try {
		const file = readme_file(dir);
		if (!file) return null;
		const raw = fs.readFileSync(file, "utf8");
		const { text, truncated } = first_screen(raw);
		return { path: path.relative(REPO, file).split(path.sep).join("/"), text, truncated };
	} catch { return null; }
}

/* readme_chain(dir) — the raw data: [{path, text, truncated}], root to leaf,
 * for every level under and including `dir` that has a readme. `dir` may be
 * repo-relative or absolute; a `dir` outside the repo returns []. Skips the
 * root CLAUDE.md on purpose (never looked for) and skips any level with no
 * readme.md/README.md, rather than putting a gap in the list. */
export function readme_chain(dir){
	if (!dir) return [];
	try {
		const abs = path.isAbsolute(dir) ? dir : path.join(REPO, dir);
		const rel = path.relative(REPO, abs);
		if (rel.startsWith("..")) return [];
		const segments = rel === "" ? [] : rel.split(path.sep).filter(Boolean);
		const out = [];
		let cur = REPO;
		const add = d => { const l = level(d); if (l) out.push(l); };
		add(cur);
		for (const seg of segments){ cur = path.join(cur, seg); add(cur); }
		return out;
	} catch { return []; }
}

/* Cut the chain to roughly CHAR_CAP characters, dropping from the TOP (the most
 * general readme) first, and always keeping at least the last one — `dir`'s own
 * readme, when it has one — even if that alone is still over the cap. */
function within_cap(header, blocks){
	const size = list => (header + "\n\n" + list.join("\n\n")).length;
	let list = blocks.slice();
	while (list.length > 1 && size(list) > CHAR_CAP) list.shift();
	return list;
}

/* first_prompt(dir, extras) — the formatted block a fresh agent's first message
 * gets prepended with. `extras` is `[{label, text}]`, appended AFTER the capped
 * readme chain (so a caller like task-placement's "Recent sessions" list never
 * has to fight the cap or touch this file's formatting). Never throws: an
 * unreadable readme chain just yields the header and no readmes. */
export function first_prompt(dir, extras = []){
	const chain = readme_chain(dir);
	const header = `Where you are: readmes from the root down to ${dir}`;
	const blocks = chain.map(r => `${r.path}${r.truncated ? " (truncated — read the rest at this path)" : ""}\n${r.text}`);
	const kept = within_cap(header, blocks);
	let out = kept.length ? `${header}\n\n${kept.join("\n\n")}` : header;
	for (const e of (extras ?? [])) if (e?.label && e?.text != null) out += `\n\n## ${e.label}\n${e.text}`;
	return out;
}

export default { readme_chain, first_prompt };
