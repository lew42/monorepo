// Counts the callers behind the deprecation plan in content.md. Run from the repo root:
//   node public/framework/core/Page/doc/content-census.mjs
import { spawnSync } from "node:child_process";

// git grep without a shell, so a quote inside a regex is just a character; exit 1 = no match.
const grep = (re, ...globs) => {
	const r = spawnSync("git", ["grep", "-lE", re, "--", ...globs, ":!public/framework/ai/20*", ":!public/framework/ai/2026"], { encoding: "utf8", maxBuffer: 1e8 });
	return r.stdout.split("\n").filter(Boolean).length;
};
const rows = {
	"files reading `.children` (the Map wrapper)":        grep(String.raw`\.children\b`, "*.js", "*.mjs"),
	"files reading `.pages` (the List)":                  grep(String.raw`\.pages\b`, "*.js", "*.mjs"),
	"page.js files with `content(){...}` (function form)": grep(String.raw`^\s+content\s*\(`, "*/page.js"),
	"files with `content: \"...\"` (string / address form)": grep(String.raw`content:\s*["'\`]`, "*.js", "*.mjs"),
	"page.jsonl files with a `{\"content\":...}` line":     grep(String.raw`^\{\"content\"`, "*.jsonl"),
	"files with `children: \"a b\"` (string form)":        grep(String.raw`children:\s*["'\`]`, "*.js", "*.mjs"),
};
for (const [k, v] of Object.entries(rows)) console.log(String(v).padStart(5), k);
