/* `node Server/WorktreePreview.mjs <task dir | worktree>` — the link that opens a worktree waiting for review
 * on the owner's phone, over the home Wi-Fi: `http://<this PC's LAN IP>:<the worktree's port>/<page>`.
 *
 * A task asks for it with `{"assign":{"preview":true}}` (or a page path, `"preview":"/framework/x/"`).
 * Once that task has landed and its branch is not merged yet, Servex (Servex/Worktrees.js) keeps the
 * worktree and binds its dev server to the LAN, on-landing logs the link, and the ready-to-merge card
 * shows it. Everything here is computed on read; nothing is stored. Doc: Servex/doc/worktree-preview.md */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { task_state, entry_for_task_dir, task_for_worktree } from "./worktree-sweep.mjs";

const PRIVATE = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;

export default class WorktreePreview {
	static BASE = "michael/dev";

	/* The page a task's `preview` asks for: true -> "/", a "/path/" -> that path, anything else -> null. */
	static page(state){
		const p = state?.preview;
		if (p === true) return "/";
		return typeof p === "string" && p.startsWith("/") ? p : null;
	}

	/* This PC's address on the home Wi-Fi: the first private IPv4, or null (no network). */
	static lan_ip(nets = os.networkInterfaces()){
		const all = Object.values(nets).flat().filter(i => i && (i.family === "IPv4" || i.family === 4) && !i.internal).map(i => i.address);
		return all.find(a => PRIVATE.test(a)) ?? null;
	}

	static url(port, page = "/", ip = WorktreePreview.lan_ip()){
		return ip && port ? `http://${ip}:${port}${page}` : null;
	}

	/* The port Servex gave a project (its ports.json, kept forever), or null. The project name is the folder's name. */
	static port(name, home = process.env.SERVEX_HOME || path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), ".local", "share"), "lew42", "servex")){
		try { return JSON.parse(fs.readFileSync(path.join(home, "ports.json"), "utf8"))[name] ?? null; } catch { return null; }
	}

	/* Is this worktree's work on the base? Its HEAD is an ancestor of the base, its diff against the base is empty,
	 * or merge.mjs applied that head (.merge-landed.json in the main checkout). Synchronous, so the reaper can ask it. It
	 * lacks Pool.landed()'s file-by-file test (async, needs a Pool): a branch whose content landed without its commits
	 * reads unmerged here and is held until the folder is removed or the 48-hour backstop, never freed early. */
	static merged(dir, { base = WorktreePreview.BASE, main = null } = {}){
		const git = (...a) => spawnSync("git", ["--no-optional-locks", "-C", dir, ...a], { encoding: "utf8", windowsHide: true });
		if (git("merge-base", "--is-ancestor", "HEAD", base).status === 0) return true;
		if (git("diff", "--quiet", `${base}...HEAD`).status === 0) return true;
		const head = git("rev-parse", "HEAD").stdout.trim();
		try {
			main ??= path.resolve(dir, git("rev-parse", "--git-common-dir").stdout.trim(), "..");
			return !!head && JSON.parse(fs.readFileSync(path.join(main, ".merge-landed.json"), "utf8")).some(e => e.head === head);
		} catch { return false; }
	}

	/* Why a process running inside a worktree must be kept for its preview, or null: its task asked for a preview and
	 * the branch is not merged yet. The reaper (Servex/Lifecycle.js kept()) asks this, so landing does not stop the
	 * server the phone link points at. The folder's removal (merge, or the 48-hour backstop) ends the hold. */
	static held(p, main){
		const wt = String(p ?? "").replace(/\\/g, "/").match(/^(.*\/worktrees\/[^/]+)/i)?.[1];
		if (!wt || /\/qf-\d+$/i.test(wt) || !fs.existsSync(wt)) return null;
		const task = task_for_worktree(wt, main);
		if (!task || !WorktreePreview.page(task) || WorktreePreview.merged(wt, { main })) return null;
		return `a preview of ${task.key} waits for its merge`;
	}

	/* The phone link for a ready-to-merge row (Server/ReadyToMerge.mjs): its task asked for a preview and a worktree
	 * holds the branch. No git here: the row is already known to be unmerged. */
	static link(task_dir, worktree, opts = {}){
		const page = worktree ? WorktreePreview.page(task_state(task_dir)) : null;
		return page ? WorktreePreview.url(WorktreePreview.port(path.basename(path.resolve(worktree)), opts.home), page, opts.ip) : null;
	}

	/* One task's preview: {worktree, name, port, page, url, merged}, or null when the task did not ask for one. */
	static of_task(dir, opts = {}){
		const state = task_state(dir), page = WorktreePreview.page(state);
		if (!page) return null;
		const worktree = state.worktree ?? entry_for_task_dir(dir)?.path ?? null;
		if (!worktree || !fs.existsSync(worktree)) return { worktree, page, url: null, merged: null, why: "the task names no worktree that exists" };
		const name = path.basename(path.resolve(worktree)), port = WorktreePreview.port(name, opts.home);
		return { worktree, name, port, page, url: WorktreePreview.url(port, page, opts.ip), merged: WorktreePreview.merged(worktree, opts) };
	}
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href){
	const arg = path.resolve(process.argv[2] || ".");
	const p = fs.existsSync(path.join(arg, "package.json"))
		? { worktree: arg, url: WorktreePreview.url(WorktreePreview.port(path.basename(arg)), "/"), merged: WorktreePreview.merged(arg) }
		: WorktreePreview.of_task(arg);
	console.log(p ? JSON.stringify(p, null, 1) : "no preview: the task's assign lines carry no `preview`");
}
