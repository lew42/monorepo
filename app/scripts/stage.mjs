// Builds app/.stage, the assets directory: app/web as is, plus every framework file those pages import
// (the View class and what it imports), copied from public/ by following import paths. No bundler: the files are unchanged.
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";

const app = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(app, "..", "public");
const out = join(app, ".stage");

rmSync(out, { recursive: true, force: true });
cpSync(join(app, "web"), out, { recursive: true });

const seen = new Set();
const specs = src => [...src.matchAll(/(?:from\s*|import\s*\(\s*|import\s+)["']([^"']+)["']/g)].map(m => m[1]);

function copy(url){   // url: absolute path like /framework/core/View/View.js
	if (seen.has(url)) return;
	seen.add(url);
	const from = join(pub, url);
	if (!existsSync(from)) throw new Error("staging: " + url + " is imported but does not exist under public/");
	mkdirSync(dirname(join(out, url)), { recursive: true });
	cpSync(from, join(out, url));
	for (const s of specs(readFileSync(from, "utf8")))
		if (s.startsWith("/")) copy(s);
		else if (s.startsWith(".")) copy(posix.normalize(posix.join(posix.dirname(url), s)));
}

copy("/framework/core/View/View.js");
copy("/framework/core/Item/Item.js");   // the document store extends Item.Store
const sw = join(out, "sw.js");
writeFileSync(sw, readFileSync(sw, "utf8").replace("__BUILD__", Date.now().toString(36)));
console.log("staged", seen.size, "framework files into", out);
