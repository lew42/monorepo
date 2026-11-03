// node public/framework/code/patterns/class-census.mjs: every exported class in public/framework (skipping ai/<date> task dirs): does dir/File/Class match?
import fs from "node:fs";
import path from "node:path";
const root = "c:/Code/lew42/monorepo/public/framework";
const out = [];
function walk(d){
	for (const e of fs.readdirSync(d, { withFileTypes: true })){
		const p = path.join(d, e.name);
		if (e.isDirectory()){
			if (/^(\d{4}(-\d\d-\d\d)?|node_modules|shots|runs|worktrees)$/.test(e.name)) continue;
			walk(p);
		} else if (e.name.endsWith(".js")){
			const src = fs.readFileSync(p, "utf8");
			for (const m of src.matchAll(/^export (?:default )?class (\w+)/gm)){
				const cls = m[1], file = e.name.replace(/\.js$/, ""), dir = path.basename(d);
				const ok = cls === file && (cls === dir);
				const sub = !ok && file === dir; // a second class inside the main file: allowed
				const sibling = !ok && /^[A-Z]/.test(file) && cls === file && /^[A-Z]/.test(dir); // Thing/Part.js: allowed
				if (!ok && !sub && !sibling) out.push(`${path.relative(root, p).replace(/\\/g, "/")}  class ${cls}`);
			}
		}
	}
}
walk(root);
console.log(out.length + " mismatches");
console.log(out.join("\n"));
