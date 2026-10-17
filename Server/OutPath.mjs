/* OutPath.resolve(arg) — turns a path argument into a real absolute path, or refuses it.
 * A git-bash drive path (/c/Code/...) is read as C:/Code/..., not as C:\c\Code\... (the 2026-10-17 stray dir).
 * Only the repo this script lives in and the OS temp dir are allowed. Test: Server/OutPath.test.mjs */
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export default class OutPath {
	static ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

	static gitbash(arg){
		const m = /^\/([a-zA-Z])(\/.*)?$/.exec(String(arg).replaceAll("\\", "/"));
		return m && process.platform === "win32" ? `${m[1].toUpperCase()}:${m[2] || "/"}` : String(arg);
	}

	static inside(dir, root){
		const rel = path.relative(path.resolve(root), dir);
		return !rel.startsWith("..") && !path.isAbsolute(rel);
	}

	// allowed: extra roots besides the repo and os.tmpdir() (tests pass their own)
	static resolve(arg, allowed = [OutPath.ROOT, os.tmpdir()]){
		const out = path.resolve(OutPath.gitbash(arg));
		if (!allowed.some(r => OutPath.inside(out, r)))
			throw new Error(`OutPath: refusing "${arg}" -> ${out}; output must be inside the repo (${OutPath.ROOT}) or ${os.tmpdir()}`);
		return out;
	}
}
