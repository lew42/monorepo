// Tracks Figma files as JSONL. The Figma MCP only answers inside an agent session, so an
// agent hands this script a spec (screenshot URLs + node ids); everything after that
// (download, size cap, JSONL lines, timestamps) is computed here. Run:
//   node track.mjs <spec.json>
// spec: { key, name, pages: [{ id, name, shot, w, h, frames?: [{id,name,w,h,shot?}] }] }
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const CAP = 600 * 1024; // a shot over this is refused, never committed
const slug = id => id.replace(/[:;]/g, "-");

const spec = JSON.parse(readFileSync(process.argv[2], "utf8"));
const dir = join(here, "data", spec.key);
mkdirSync(join(dir, "shots"), { recursive: true });
const tracked = join(dir, "pages.jsonl");

const grab = (url, id) => {
	const rel = `shots/${slug(id)}.png`, out = join(dir, rel);
	execFileSync("curl", ["-sL", "-o", out, url]);
	if (statSync(out).size > CAP) { unlinkSync(out); throw new Error(`${id}: shot over ${CAP} bytes`); }
	return rel;
};

const at = new Date().toISOString();
const lines = [{ file: { key: spec.key, name: spec.name, url: `https://www.figma.com/design/${spec.key}`, fetched_at: at } }];
for (const p of spec.pages){
	const frames = (p.frames || []).map(f => ({ id: f.id, name: f.name, w: f.w, h: f.h, ...(f.shot ? { shot: grab(f.shot, f.id) } : {}) }));
	lines.push({ page: { id: p.id, name: p.name, w: p.w, h: p.h, shot: p.shot ? grab(p.shot, p.id) : null, frames, fetched_at: at } });
}
// Re-tracking appends a new generation; readers keep the latest line per id (nothing is overwritten).
const prev = existsSync(tracked) ? readFileSync(tracked, "utf8") : "";
writeFileSync(tracked, prev + lines.map(l => JSON.stringify(l)).join("\n") + "\n");
// The index lists every tracked file once (the browse page reads it first).
const index = join(here, "index.jsonl");
const have = existsSync(index) ? readFileSync(index, "utf8") : "";
if (!have.includes(`"${spec.key}"`)) writeFileSync(index, have + JSON.stringify({ key: spec.key, name: spec.name, url: `https://www.figma.com/design/${spec.key}` }) + "\n");
console.log(`tracked ${lines.length - 1} pages -> ${tracked}`);
