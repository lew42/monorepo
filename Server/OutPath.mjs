/* OutPath.resolve(arg) — turns a path argument into a real absolute path, or refuses it.
 * A git-bash drive path (/c/Code/...) is read as C:/Code/..., not as C:\c\Code\... (the 2026-10-17 stray dir).
 * Only the repo this script lives in, the OS temp dir and this repo's own git worktrees are allowed (a review shot for a branch is
 * taken by the main tree's layout-check and belongs in the branch's worktree, 2026-11-02). Test: Server/OutPath.test.mjs */
import { spawnSync } from "node:child_process";
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

	// the checked-out worktrees of this repo, from git itself (nothing else is trusted as a repo root)
	static worktrees(){
		const r = spawnSync("git", ["worktree", "list", "--porcelain"], { cwd: OutPath.ROOT, encoding: "utf8", windowsHide: true });
		return (r.stdout || "").split(String.fromCharCode(10)).filter(l => l.startsWith("worktree ")).map(l => l.slice(9).trim());
	}

	// allowed: extra roots besides the repo and os.tmpdir() (tests pass their own)
	static DEFAULT = [OutPath.ROOT, os.tmpdir()];
	static resolve(arg, allowed = OutPath.DEFAULT){
		const out = path.resolve(OutPath.gitbash(arg));
		const ok = r => OutPath.inside(out, r);
		if (!allowed.some(ok) && !(allowed === OutPath.DEFAULT && OutPath.worktrees().some(ok)))
			throw new Error(`OutPath: refusing "${arg}" -> ${out}; output must be inside the repo (${OutPath.ROOT}), one of its git worktrees, or ${os.tmpdir()}`);
		return out;
	}
}
