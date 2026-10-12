/* Proof that widthsFor's pick really becomes ONE real screenshot, not four — the owner's own
 * sentence this whole task exists to make true: "it doesn't make sense to take three extra
 * screenshots when one would do." quick-proof.mjs (beside this file) proves merge.mjs --quick's
 * GATE and JSON line on scratch repos; this proof is the other half — the actual pixels, taken
 * read-only against THIS worktree's own live dev server (no file in the repo is touched).
 * `node shot-proof.mjs [base url]` — base defaults to this worktree's own server. */
import { widthsFor } from "../../../../../../../Server/review.mjs";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const base = process.argv[2] || "http://localhost:51748";
const out = path.join(here, "shot-proof-out");
fs.rmSync(out, { recursive: true, force: true });

const layoutCheck = path.resolve(here, "../../../../../../../Server/layout-check.mjs");
const slug = u => u.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "page";

// Two of widthsFor's own rules, each checked the same way: compute the width(s), hand them
// straight to layout-check.mjs (exactly what review.mjs's main() and merge.mjs --quick both do),
// and prove on a REAL page that exactly that many real .png files come out — never four by habit.
const cases = [
	{ label: "a 1-line, max-width-capped component css change", files: [{ status: "M", f: "public/framework/ux/Thing/Thing.css", patch: "+ .card { max-width: 40em; }" }], numstat: [{ added: 1, deleted: 0, f: "public/framework/ux/Thing/Thing.css" }], pages: ["/framework/"] },
	{ label: "a page.js text-only edit, no css (review.mjs's own .md-only-shaped case)", files: [{ status: "M", f: "public/framework/ux/Thing/page.js" }], numstat: [{ added: 3, deleted: 1, f: "public/framework/ux/Thing/page.js" }], pages: ["/framework/"] },
];

const allChecks = [];
for (const [i, c] of cases.entries()) {
	const widths = widthsFor(c.files, c.numstat, c.pages);
	console.log(`\nwidthsFor() on ${c.label} -> [${widths.join(",")}]`);
	if (widths.length !== 1) { console.error(`FAIL: expected exactly one width, got ${widths.length}`); allChecks.push([`${c.label}: one width`, false]); continue; }
	const [width] = widths;
	const url = `${base}/framework/`;
	const caseOut = path.join(out, `case-${i}`);   // own dir per case — two cases share the same url, so their pngs would otherwise land in one folder together
	const r = spawnSync("node", [layoutCheck, url, "--widths", String(width), "--out", caseOut], { encoding: "utf8", windowsHide: true });
	console.log(r.stdout + r.stderr);
	const dir = path.join(caseOut, slug(url));
	const pngs = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /^\d+\.png$/.test(f)) : [];
	allChecks.push(
		[`${c.label}: layout-check.mjs exited 0 (the real page loaded, no console/page errors)`, r.status === 0],
		[`${c.label}: exactly one ${width}.png was written, not four`, pngs.length === 1 && pngs[0] === `${width}.png`],
		[`${c.label}: that png is a real, non-empty file`, pngs.length === 1 && fs.statSync(path.join(dir, pngs[0])).size > 1000],
	);
	console.log(`one real screenshot: ${path.join(dir, pngs[0] || "(none)")}`);
}
console.log("");
for (const [what, ok] of allChecks) console.log(`  ${ok ? "PASS" : "FAIL"}  ${what}`);
process.exit(allChecks.every(c => c[1]) ? 0 : 1);
