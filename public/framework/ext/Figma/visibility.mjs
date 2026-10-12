// Visibility check for ext/Figma: lists every page.js under it that no parent declares in `children:`,
// so a built page cannot exist and still be unreachable by clicking. Exit code 1 if any is hidden.
//   node public/framework/ext/Figma/visibility.mjs
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ext = dirname(here);
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() && e.name !== "data" ? walk(join(dir, e.name)) : e.name === "page.js" ? [join(dir, e.name)] : []);
const children = dir => {
	const f = join(dir, "page.js");
	if (!existsSync(f)) return [];
	const m = /children:\s*(?:"([^"]*)"|\[([^\]]*)\])/.exec(readFileSync(f, "utf8"));
	return (m?.[1] ?? m?.[2] ?? "").split(/[\s,"']+/).filter(Boolean);
};

const hidden = [];
for (const f of walk(here)){
	const dir = dirname(f), parent = dirname(dir);
	if (dir === here) { if (!children(ext).includes("Figma")) hidden.push([dir, "ext/page.js does not name Figma"]); continue; }
	if (!children(parent).includes(dir.split(/[\\/]/).pop())) hidden.push([dir, `${relative(ext, join(parent, "page.js"))} does not declare it`]);
}
hidden.forEach(([d, why]) => console.log("HIDDEN", relative(ext, d), "-", why));
console.log(hidden.length ? `${hidden.length} hidden` : "all ext/Figma pages are declared by a parent");
process.exit(hidden.length ? 1 : 0);
