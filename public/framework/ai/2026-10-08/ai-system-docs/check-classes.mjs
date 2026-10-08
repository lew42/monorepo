// Law 7: does each core-API member on a class card still exist in its source file?
// Run: node public/framework/ai/2026-10-08/ai-system-docs/check-classes.mjs
import fs from "fs";
const root = new URL("../../../../../", import.meta.url);
const src = fs.readFileSync(new URL("public/framework/ai/system-classes.js", root), "utf8");
const list = src.slice(src.indexOf("export const CLASSES = ["), src.indexOf("\n];"));
let bad = 0;
for (const m of list.matchAll(/file: "([^"]+)"[\s\S]*?api: \[([^\]]*)\]/g)){
	const code = fs.readFileSync(new URL(m[1], root), "utf8");
	for (const member of [...m[2].matchAll(/"([^"]+)"/g)].map(x => x[1].replace(/\(.*$/, ""))){
		if (!new RegExp(String.raw`\b${member}\b`).test(code)){ console.log("MISSING", m[1], member); bad++; }
	}
}
console.log(bad ? bad + " missing" : "all members found");
