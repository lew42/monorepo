import fs from "node:fs";
import path from "node:path";
import System from "./System.js";

// The readme system: every readme is a short index whose links resolve (CLAUDE.md: under ~100 lines).
export default class ReadmeSystem extends System {
	name = "ReadmeSystem";
	icon = "menu_book";
	root = "public/framework";
	readme = "public/framework/ai/doc/readme.md";
	max_lines = 100;
	rules = [
		{ id: "short", text: "A readme is under about 100 lines.", enforced_by: "script" },
		{ id: "links", text: "Every relative link in a readme resolves to a file.", enforced_by: "script" },
	];
	repo = process.cwd();

	// readme.md files, skipping dependencies, dated task dirs and archives (not module readmes)
	readmes(dir = path.join(this.repo, this.root), out = []){
		for (const e of fs.readdirSync(dir, { withFileTypes: true })){
			if (e.name === "node_modules" || e.name === "archive" || /^\d{4}(-\d\d-\d\d)?$/.test(e.name)) continue;
			const p = path.join(dir, e.name);
			if (e.isDirectory()) this.readmes(p, out);
			else if (e.name.toLowerCase() === "readme.md") out.push(p);
		}
		return out;
	}

	check(){
		const found = [];
		for (const file of this.readmes()){
			const rel = path.relative(this.repo, file).replaceAll("\\", "/");
			const text = fs.readFileSync(file, "utf8"), n = text.split("\n").length;
			if (n > this.max_lines) found.push({ rule: "short", path: rel, text: `${n} lines (max ${this.max_lines})` });
			for (const m of text.matchAll(/\]\((?!https?:|#|\/|mailto:)([^)\s#]+)/g)){
				if (m[1].endsWith("/")) continue;   // a site route, not a file
				if (!fs.existsSync(path.resolve(path.dirname(file), decodeURI(m[1]))))
					found.push({ rule: "links", path: rel, text: `broken link ${m[1]}` });
			}
		}
		return found;
	}
}
