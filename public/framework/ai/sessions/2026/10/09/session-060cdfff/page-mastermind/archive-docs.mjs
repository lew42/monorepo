// archive-docs.mjs — move superseded core/Page docs to doc/archive/ (git mv), note each in archive/moved.md,
// and point every inbound link at the archived copy so nothing 404s. Verdicts: doc-audit/*/recs.md.
// Usage: node archive-docs.mjs --dry | --run   (run from the repo root)
import fs from "node:fs";
import { execSync } from "node:child_process";

const D = "public/framework/core/Page/doc";
const moves = {
	"page-jsonl.md": "a three-line stub; the log format is jsonl.md, its size is core/Page/jsonl/doc/size.md",
	"layout-overview.md": "replaced by core/Page/layout/readme.md (the Layout tab)",
	"more-features.md": "a list of links; the readme now links jsonl.md, markdown.md, data-children.md and related.md directly",
	"findings.md": "the column-page lab findings; their verdicts live in columns.md and decisions.md",
};
// files that link to the moved docs, and how their links are written
const linkers = [
	[`${D}/streaming.md`, n => [`(${n})`, `(archive/${n})`]],
	["public/framework/core/Page/expert.json", n => [`"doc/${n}"`, `"doc/archive/${n}"`]],
	["public/framework/core/Page/layout/doc/prior-work.md", n => [`/doc/${n}`, `/doc/archive/${n}`]],
	["public/framework/core/Page/old/readme-v1.md", n => [`./doc/${n}`, `./doc/archive/${n}`]],
];
const run = process.argv.includes("--run");
const manifest = [];
for (const [name, why] of Object.entries(moves)) {
	const from = `${D}/${name}`, to = `${D}/archive/${name}`;
	if (!fs.existsSync(from)) throw new Error("missing " + from);
	manifest.push(`mv ${from} -> ${to}`);
	if (run) { fs.mkdirSync(`${D}/archive`, { recursive: true }); execSync(`git mv "${from}" "${to}"`); }
}
for (const [file, pair] of linkers) {
	let text = fs.readFileSync(file, "utf8"), n = 0;
	for (const name of Object.keys(moves)) {
		const [a, b] = pair(name);
		const parts = text.split(a); n += parts.length - 1; text = parts.join(b);
	}
	if (n) manifest.push(`links ${file}: ${n}`);
	if (run && n) fs.writeFileSync(file, text);
}
const note = Object.entries(moves).map(([n, why]) => `- \`${n}\` (2026-10-09, doc audit \`ai/sessions/2026/10/09/session-060cdfff/page-mastermind/doc-audit/\`): ${why}.`).join("\n");
if (run) {
	const m = `${D}/archive/moved.md`;
	const head = fs.existsSync(m) ? fs.readFileSync(m, "utf8") : "# Archived page docs\n\nSuperseded docs, kept unchanged. Each line says what replaced it.\n\n";
	fs.writeFileSync(m, head + note + "\n");
}
console.log(manifest.join("\n") + (run ? "\n(done)" : "\n(dry run)"));
