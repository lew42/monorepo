/**
 * shoot.mjs — photograph one site at four widths and write its record.
 *
 *     node public/websites/tools/shoot.mjs <url> <name>
 *
 * Writes `site/<name>/400.jpg 1280.jpg 1920.jpg 3440.jpg long.jpg` and creates or
 * merges `site/<name>.json` with `url`, `title`, `captured_at`, `shots` and `embed`.
 * Everything a human writes — `layout`, `sections`, `tags`, `notes` — is left alone.
 *
 * ⚠ jpeg, quality 70: a site costs ~1.5 MB, so forty sites stay under 60 MB in git.
 * ⚠ Never `fullPage: true` at 3440 — a tall ultrawide page is a 100 MB image. The
 *   whole-page shot is one 1280x4000 viewport instead, named `long`.
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { launch, shots_dir, usage, visit, widths, write_record } from "./lib.mjs";

const [url, name] = process.argv.slice(2);
if (!url || !name) usage("usage: node public/websites/tools/shoot.mjs <url> <name>");

/* Can this site be shown in an iframe? Two headers say no, and they say it in two
 * different vocabularies:
 *   x-frame-options: DENY | SAMEORIGIN        — the old one, still the common one
 *   content-security-policy: frame-ancestors  — the current one; 'none' or a list of
 *                                               origins that will never include ours
 * Anything else, including no header at all, means the browser will render the frame.
 * This is a HEADER READ, not an experiment: the site's own answer, before we try. */
function embedding(res){
	if (!res) return { embed: "unknown", embed_note: "the page did not load, so its headers were never read" };
	const h = res.headers();
	const xfo = (h["x-frame-options"] ?? "").trim();
	if (xfo) return { embed: "blocked", embed_note: `x-frame-options: ${xfo}` };

	const csp = h["content-security-policy"] ?? "";
	const fa = csp.match(/frame-ancestors([^;]*)/i)?.[1]?.trim();
	if (fa && !/(^|\s)\*(\s|$)/.test(fa)) return { embed: "blocked", embed_note: `content-security-policy: frame-ancestors ${fa}` };

	return { embed: "allowed", embed_note: "no x-frame-options and no restrictive frame-ancestors" };
}

const browser = await launch();
const dir = shots_dir(name);
await mkdir(dir, { recursive: true });

const shots = {};
let title = null, first = null;

for (const { key, width, height } of widths){
	const page = await browser.newPage({ viewport: { width, height } });
	console.log(`  ${key} …`);
	const res = await visit(page, url);
	first ??= res;
	title ??= await page.title().catch(() => null);
	await page.screenshot({ path: join(dir, key + ".jpg"), type: "jpeg", quality: 70 });
	shots[key] = `site/${name}/${key}.jpg`;
	await page.close();
}

// The long shot: one tall laptop-width viewport, so the whole story of the page —
// hero, sections, footer — reads in a single picture beside the four widths.
const tall = await browser.newPage({ viewport: { width: 1280, height: 4000 } });
console.log("  long …");
await visit(tall, url);
await tall.screenshot({ path: join(dir, "long.jpg"), type: "jpeg", quality: 70 });
shots.long = `site/${name}/long.jpg`;
await tall.close();

await browser.close();

const record = await write_record(name, {
	url, title: title || name,
	captured_at: new Date().toISOString(),
	shots, ...embedding(first),
});

console.log(`shot ${name}: ${Object.keys(shots).join(" ")} — embed ${record.embed} (${record.embed_note})`);
