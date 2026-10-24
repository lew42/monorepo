// Narrower Page step 2: moves the listing and loading statics out of Page.class.js (pattern: split-extract-2.mjs). `--dry` prints the manifest only.
import fs from "node:fs";
const dry = process.argv.includes("--dry");
const dir = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const file = dir + "Page.class.js";
let src = fs.readFileSync(file, "utf8").split("\n");

const nums = src.map((_, i) => i + 1);
const GROUPS = [
	{ to: "Listing.js", cls: "Listing", methods: ["listing", "fetch_listing", "page_listing", "loaded_listing"] },
	{ to: "Load.js", cls: "Load", methods: ["file", "load", "read_json", "from", "props", "missing", "slug"] },
];

const manifest = [], moved = { Listing: [], Load: [] };
for (const { to, cls, methods } of GROUPS) for (const name of methods){
	const start = src.findIndex(l => new RegExp(`^\\tstatic (async )?${name}\\(`).test(l));
	if (start < 0) throw new Error("no static " + name);
	let from = start;
	while (/^\t\/\//.test(src[from - 1])) from--;
	let depth = 0, end = start, seen = false;
	for (; end < src.length; end++){
		for (const ch of src[end].replace(/\/\/.*$/, "")){ if (ch === "{") { depth++; seen = true; } else if (ch === "}") depth--; }
		if (seen && depth === 0) break;
	}
	const chunk = src.slice(from, end + 1);
	const head = chunk[start - from];
	const [, isAsync, params] = head.match(/^\tstatic (async )?\w+\(([^)]*)\)/);
	const body = chunk.slice(start - from).join("\n");
	const base = /\bPage\./.test(body) || /instanceof Page/.test(body) ? "Page" : /\bthis\b/.test(body) ? "this" : "Page";
	let text = chunk.join("\n")
		.replace(/\bPage\b/g, "P").replace(/\bthis\b/g, "P")
		.replace(new RegExp(`^\\tstatic (async )?${name}\\(`, "m"), `\tstatic $1${name}(P${params ? ", " : ""}`);
	text = text.replace(/\tstatic (async )?(\w+)\(P(?:, )?([^)]*)\)\{ *(.*)/, (m) => m);
	const forwarder = `\tstatic ${name}(${params}){ return ${base}.${cls}.${name}(${base}${params ? ", " + params : ""}); }`;
	manifest.push({ method: name, old_lines: `${nums[from]}-${nums[end]}`, new_file: to, binds: base === "this" ? "this" : "Page" });
	moved[cls].push({ text, comments: chunk.slice(0, start - from) });
	nums.splice(from, end - from + 1, ...nums.slice(from, start), nums[start]);
	src.splice(from, end - from + 1, ...chunk.slice(0, start - from), forwarder);
}
console.log(JSON.stringify(manifest, null, 1));
if (dry) process.exit(0);

const listing = fs.readFileSync(dir + "Listing.js", "utf8");
const listingOut = `import { names } from "../Router/listing.js";\n\n` +
	listing.replace(/\n}\n*$/, "\n\n" + moved.Listing.map(m => m.text).join("\n\n") + "\n}\n");
const loadOut = `import { is } from "../View/View.js";\n\n// The loading statics of Page: each takes the class (P) first; Page keeps one-line forwarders. (doc/architecture.md)\nexport default class PageLoad {\n\n${moved.Load.map(m => m.text).join("\n\n")}\n}\n`;
fs.writeFileSync(dir + "Listing.js", listingOut);
fs.writeFileSync(dir + "Load.js", loadOut);

let out = src.join("\n");
out = out.replace('import PageListing from "./Listing.js";', 'import PageListing from "./Listing.js";\nimport PageLoad from "./Load.js";')
	.replace("Page.Listing = PageListing;", "Page.Listing = PageListing;\nPage.Load = PageLoad;");
fs.writeFileSync(file, out);
