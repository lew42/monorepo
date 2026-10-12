import fs from "node:fs";
import path from "node:path";
import System from "./System.js";

// The navigation system: a page that nothing links to will never be found (CLAUDE.md "Everything is linked").
// A module's directory counts as linked when its parent's page.js, page.jsonl or readme.md names it.
export default class NavigationSystem extends System {
	name = "NavigationSystem";
	icon = "route";
	root = "public/framework";
	readme = "public/framework/readme.md";
	rules = [
		{ id: "orphan", text: "Every directory with a page.js is named by its parent (children: or a readme link).", enforced_by: "script" },
	];
	repo = process.cwd();

	read(file){ try { return fs.readFileSync(file, "utf8"); } catch { return ""; } }

	pages(dir = path.join(this.repo, this.root), out = []){
		for (const e of fs.readdirSync(dir, { withFileTypes: true })){
			if (!e.isDirectory() || e.name === "node_modules" || e.name === "archive" || /^\d{4}(-\d\d-\d\d)?$/.test(e.name)) continue;
			const p = path.join(dir, e.name);
			if (fs.existsSync(path.join(p, "page.js"))) out.push(p);
			this.pages(p, out);
		}
		return out;
	}

	check(){
		const found = [];
		for (const dir of this.pages()){
			const parent = path.dirname(dir), name = path.basename(dir);
			const named = fs.readdirSync(parent).filter(f => /\.(js|jsonl|md)$/.test(f)).some(f => this.read(path.join(parent, f)).includes(name));
			if (!named) found.push({ rule: "orphan", path: path.relative(this.repo, dir).replaceAll("\\", "/"), text: `no link from ${path.basename(parent)}/` });
		}
		return found;
	}
}
