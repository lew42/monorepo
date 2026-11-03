// Server/DevPublish.mjs — keeps GitHub current after merge.mjs lands a branch: pull before pushing the dev branch,
// retry a refused push once, and (off by default) publish dev to `main` through a pull request. Doc: public/framework/doc/git.md
//   node Server/DevPublish.mjs [--main-repo <dir>]    sync + push the dev branch now, publish to main if switched on
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { DEV_BRANCH, MAIN_BRANCH } from "./dev-branch.mjs";

const SETTINGS = path.join(import.meta.dirname, "publish.json");

export default class DevPublish {
	static git(cwd, ...a){ return spawnSync("git", a, { cwd, encoding: "utf8", windowsHide: true, maxBuffer: 64 << 20 }); }
	static out(r){ return (r.stdout || "").trim(); }
	static last(r){ return ((r.stderr || r.stdout || "").trim().split("\n").pop() || "").trim(); }
	static lines(s){ return s.split(/\r?\n/).filter(Boolean); }

	/** Publishing to `main` is off until lew42.com follows `production` (git.md). On: set {"main": true} in Server/publish.json, or MERGE_PUBLISH_MAIN=1. */
	static publish_on(file = SETTINGS){
		if (process.env.MERGE_PUBLISH_MAIN) return process.env.MERGE_PUBLISH_MAIN === "1";
		try { return JSON.parse(fs.readFileSync(file, "utf8")).main === true; } catch { return false; }
	}

	/** "Merge qf-5: bold the session title": the branch's slug (after the last "/") and its head commit's subject. */
	static merge_message(branch, subject){
		const slug = branch.split("/").pop();
		return subject ? `Merge ${slug}: ${subject}` : `Merge ${slug}`;
	}

	static ancestor(main, a, b){ return DevPublish.git(main, "merge-base", "--is-ancestor", a, b).status === 0; }

	/** Bring `ref` (a remote branch) into the checked-out `dev` of the main tree without ever touching other dirty files.
	 *  Behind -> fast-forward. Diverged -> merge, only when merge-tree says clean and no uncommitted file is one `ref` changed.
	 *  Returns {ok, did: "none"|"ff"|"merge", note}. Never throws, never aborts a merge (a refusal leaves the tree as it was). */
	static integrate(main, dev, ref){
		const g = (...a) => DevPublish.git(main, ...a);
		if (g("rev-parse", "--verify", "-q", ref).status) return { ok: true, did: "none", note: `${ref} does not exist` };
		if (DevPublish.ancestor(main, ref, "HEAD")) return { ok: true, did: "none", note: `${dev} already has ${ref}` };
		if (DevPublish.ancestor(main, "HEAD", ref)) {
			const r = g("merge", "--ff-only", "--no-autostash", ref);
			return r.status ? { ok: false, did: "none", note: `could not fast-forward ${dev} to ${ref}: ${DevPublish.last(r)}` } : { ok: true, did: "ff", note: `${dev} fast-forwarded to ${ref}` };
		}
		const mt = g("merge-tree", "--write-tree", "--name-only", "--no-messages", "HEAD", ref);
		if (mt.status) return { ok: false, did: "none", note: `${dev} and ${ref} conflict in: ${DevPublish.lines(mt.stdout).slice(1).join(", ")}; resolve by hand` };
		const theirs = new Set(DevPublish.lines(g("diff", "--name-only", "--no-renames", `HEAD...${ref}`).stdout));
		const dirty = DevPublish.lines(g("status", "--porcelain", "--untracked-files=no").stdout).map(l => l.slice(3).replace(/^.* -> /, "").replace(/^"|"$/g, ""));
		const hit = dirty.filter(f => theirs.has(f));
		if (hit.length) return { ok: false, did: "none", note: `${ref} changed files with uncommitted edits in the main tree (${hit.slice(0, 3).join(", ")}); try again later` };
		const r = g("merge", "--no-edit", "--no-autostash", "-m", `Merge ${ref} into ${dev}`, ref);
		return r.status ? { ok: false, did: "none", note: `merge of ${ref} into ${dev} failed: ${DevPublish.last(r)}` } : { ok: true, did: "merge", note: `merged ${ref} into ${dev}` };
	}

	/** Pull before pushing: fetch, bring origin/dev in, push; a refused push fetches, brings it in and pushes once more. Returns {ok, notes[]}. */
	static push_dev(main, dev = DEV_BRANCH, { log = () => {} } = {}){
		const notes = [], note = s => { notes.push(s); log(s); };
		const sync = () => {
			const f = DevPublish.git(main, "fetch", "origin");
			if (f.status) { note(`fetch of origin failed: ${DevPublish.last(f)}`); return false; }
			const i = DevPublish.integrate(main, dev, `origin/${dev}`);
			if (i.did !== "none") note(i.note); else if (!i.ok) note(i.note);
			return i.ok;
		};
		if (!sync()) return { ok: false, notes };
		let p = DevPublish.git(main, "push", "origin", dev);
		if (p.status) {
			note(`push of ${dev} refused (${DevPublish.last(p)}); fetching and trying once more`);
			if (!sync()) return { ok: false, notes };
			p = DevPublish.git(main, "push", "origin", dev);
		}
		if (p.status) { note(`push of ${dev} failed (the merge stands): ${DevPublish.last(p)}`); return { ok: false, notes }; }
		note(`pushed ${dev} to origin`);
		return { ok: true, notes };
	}

	/** The GitHub token git itself uses (credential manager), or GH_TOKEN. null when there is none. */
	static token(){
		if (process.env.GH_TOKEN || process.env.GITHUB_TOKEN) return process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
		const r = spawnSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8", windowsHide: true, timeout: 15000 });
		return /^password=(.+)$/m.exec(r.stdout || "")?.[1] ?? null;
	}
	static slug(main){
		const url = DevPublish.out(DevPublish.git(main, "config", "--get", "remote.origin.url"));
		return /github\.com[/:]([^/]+\/[^/.]+?)(?:\.git)?$/.exec(url)?.[1] ?? null;
	}
	/** One GitHub REST call -> {status, json}. */
	static async api(method, route, body){
		const token = DevPublish.token();
		if (!token) return { status: 0, json: { message: "no GitHub token (git credential fill gave none)" } };
		const r = await fetch("https://api.github.com" + route, {
			method, signal: AbortSignal.timeout(30000),
			headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "lew42-merge", ...(body ? { "Content-Type": "application/json" } : {}) },
			body: body ? JSON.stringify(body) : undefined
		});
		return { status: r.status, json: await r.json().catch(() => ({})) };
	}

	/** Publish `dev` to `main`: open a pull request dev -> main and merge it (the rule on main requires one), then move the local `main` label
	 *  and bring the pull request's merge commit back into dev (a fast-forward when nothing landed meanwhile). Returns {ok, notes[]}.
	 *  `api(method, route, body)` is injectable for tests; `wait(ms)` is how long to wait between "not mergeable yet" retries. */
	static async publish_main(main, dev = DEV_BRANCH, { api = DevPublish.api, log = () => {}, wait = ms => new Promise(r => setTimeout(r, ms)), title } = {}){
		const notes = [], note = s => { notes.push(s); log(s); };
		const g = (...a) => DevPublish.git(main, ...a);
		const slug = DevPublish.slug(main);
		if (!slug) { note("publish to main skipped: origin is not a github.com remote"); return { ok: false, notes }; }
		if (g("fetch", "origin").status) { note("publish to main skipped: fetch of origin failed"); return { ok: false, notes }; }
		if (g("rev-parse", "--verify", "-q", `origin/${dev}`).status) { note(`publish to main skipped: origin/${dev} does not exist`); return { ok: false, notes }; }
		const ahead = Number(DevPublish.out(g("rev-list", "--count", `origin/${MAIN_BRANCH}..origin/${dev}`)) || 0);
		if (!ahead) { note(`main already has everything on origin/${dev}`); return { ok: true, notes }; }
		const owner = slug.split("/")[0];
		let pr = await api("POST", `/repos/${slug}/pulls`, { title: title ?? `Publish ${dev} to ${MAIN_BRANCH}`, head: dev, base: MAIN_BRANCH, body: `${ahead} commit(s) from \`${dev}\`, opened by Server/merge.mjs (Server/DevPublish.mjs).` });
		let number = pr.json?.number;
		if (pr.status === 422 && !number) {
			const open = await api("GET", `/repos/${slug}/pulls?state=open&base=${MAIN_BRANCH}&head=${encodeURIComponent(owner + ":" + dev)}`);
			number = open.json?.[0]?.number;
		}
		if (!number) { note(`publish to main failed: pull request not opened (${pr.status} ${pr.json?.message ?? ""}${pr.json?.errors?.[0]?.message ? ": " + pr.json.errors[0].message : ""})`); return { ok: false, notes }; }
		let merged = null;
		for (let i = 0; i < 5; i++) {
			merged = await api("PUT", `/repos/${slug}/pulls/${number}/merge`, { merge_method: "merge", commit_title: `Publish ${dev} to ${MAIN_BRANCH} (#${number})` });
			if (merged.status === 200) break;
			if (merged.status !== 405 && merged.status !== 409) break;
			await wait(2000);
		}
		if (merged?.status !== 200) { note(`publish to main failed: pull request #${number} not merged (${merged?.status} ${merged?.json?.message ?? ""}); it stays open`); return { ok: false, notes }; }
		note(`published ${dev} to main through pull request #${number}`);
		const f = g("fetch", "origin");
		if (f.status) { note(`published, but the fetch afterwards failed: ${DevPublish.last(f)}`); return { ok: true, notes }; }
		const label = g("fetch", "origin", `${MAIN_BRANCH}:${MAIN_BRANCH}`);
		note(label.status ? `local ${MAIN_BRANCH} label not moved: ${DevPublish.last(label)}` : `local ${MAIN_BRANCH} label moved to origin/${MAIN_BRANCH}`);
		const back = DevPublish.integrate(main, dev, `origin/${MAIN_BRANCH}`);
		note(back.note);
		if (back.did !== "none" && back.ok) { const p = g("push", "origin", dev); if (p.status) note(`push of ${dev} after the publish failed: ${DevPublish.last(p)}`); }
		return { ok: true, notes };
	}
}

if (import.meta.url === `file:///${process.argv[1]?.replaceAll("\\", "/")}`) {
	const i = process.argv.indexOf("--main-repo"), main = i > 0 ? path.resolve(process.argv[i + 1]) : path.resolve(import.meta.dirname, "..");
	const log = s => console.log(s);
	const r = DevPublish.push_dev(main, DEV_BRANCH, { log });
	if (r.ok && DevPublish.publish_on()) await DevPublish.publish_main(main, DEV_BRANCH, { log });
	else if (!DevPublish.publish_on()) console.log("publish to main is off (Server/publish.json)");
	process.exit(r.ok ? 0 : 1);
}
