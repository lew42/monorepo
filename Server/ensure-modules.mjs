/* A worktree's node_modules is complete only if npm finished: it writes node_modules/.package-lock.json
   last, and every dependency in package.json is a folder. A half-done `npm ci` (interrupted, or a copy
   that stopped) leaves neither, and the server then dies on `Cannot find package`. Redo it with npm ci. */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { refuse_links_into_main } from "./junction-guard.mjs";

export function modules_complete(dir){
	const nm = path.join(dir, "node_modules");
	if (!fs.existsSync(path.join(nm, ".package-lock.json"))) return false;
	try {
		const pkg = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
		return Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).every(d => fs.existsSync(path.join(nm, d, "package.json")));
	} catch { return false; }
}

/* Returns true when node_modules is complete afterwards. Runs npm ci only when it is not. */
export function ensure_modules(dir){
	if (modules_complete(dir)) return true;
	refuse_links_into_main(dir, "npm ci");
	console.log(`ensure-modules: ${dir}/node_modules is missing or incomplete; running npm ci…`);
	try { execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", ["ci"], { cwd: dir, stdio: "inherit", shell: true, windowsHide: true }); } catch {}
	return modules_complete(dir);
}
