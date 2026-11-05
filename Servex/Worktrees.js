import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { fileURLToPath } from "url";
import Events from "../Server/Events.js";
import { stamp, place } from "./home.js";
import TaskDirs from "../Server/TaskDirs.mjs";
import SessionRecord from "../Server/SessionRecord.mjs";
import Landed from "./Landed.js";
import WorktreePreview from "../Server/WorktreePreview.mjs";
import { DEV_BRANCH } from "../Server/dev-branch.mjs";
import { pool_slot } from "./Lifecycle.js";

/* WORKTREE CLEAN-UP — a worktree is temporary (process-monitor, 2026-09-30).
 *
 * Every linked worktree git lists (C:/Code/lew42/worktrees/, and the .claude/worktrees/ ones a Claude Code tab makes) with a package.json becomes a Servex
 * project: a port, a `<name>.localhost`, sometimes a running dev server. Nothing
 * removed them; 57 had piled up, 17 of them already merged.
 *
 * Every 10 minutes each worktree there gets one STATE:
 *
 *   pool         qf-*: the quick-fix pool recycles these itself (Pool.js). Never touched here.
 *   locked       `git worktree lock`ed by someone. Never touched.
 *   in use       a live or dormant agent works inside it, or git touched it in the
 *                last 2 hours (a Claude Code tab Servex does not know may be in it).
 *   no branch    a detached HEAD: nothing would keep its commits. Never touched.
 *   uncommitted  it has real changes git would lose. Never touched; shown so a person can look.
 *                LOG NOISE does not count: a worktree's own dev server appends to the
 *                site's `*.jsonl` logs (files.jsonl, page.jsonl, board.jsonl …) and makes
 *                card folders under public/framework/ai/. Before a worktree with only
 *                noise is removed, the noise is copied to Servex's
 *                `salvage/worktrees/<name>-<date>/` (a diff plus the new files).
 *   open         its branch holds commits compliance/dev does not. `waiting: true` when its task has LANDED
 *                but the branch is not merged: it is HELD until the merge, so the owner can still open it
 *                (build F, 2026-10-28; Servex/doc/worktree-preview.md). A task that asked for a preview
 *                (`{"assign":{"preview":true}}`) also has its dev server bound to the LAN while it waits.
 *   (closing)    a worktree with leftovers whose task has landed (and its agent stopped), or that nothing
 *                touched for 2 days (the backstop, merged or not), is CLOSED: leftovers committed to its own
 *                branch, the folder removed, the branch kept; unmerged commits become a line in ready-to-merge.jsonl.
 *   finished     its branch is merged into compliance/dev (or applied by merge.mjs).
 *
 * A FINISHED worktree is removed: its dev server stopped, `git worktree remove`
 * (--force only when every change is log noise already saved; otherwise git
 * itself refuses anything unclean), and Servex forgets the
 * project, its port and its subdomain. The BRANCH is kept, so `git revert` and
 * `git log` still work. Nothing is removed unless `Server/junction-check.mjs`
 * passes first: a worktree whose node_modules is a junction into main would take
 * main's node_modules with it (2026-09-22, 2026-09-29). SERVEX_WORKTREE_CLEANUP=0
 * only reports. */
export default class Worktrees extends Events {

	initialize(){
		this.main ??= path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
		this.dir ??= path.resolve(this.main, "..", "worktrees");
		this.base ??= DEV_BRANCH;
		this.every ??= Number(process.env.SERVEX_WORKTREES_EVERY_MS) || 10 * 60000;
		this.removing ??= process.env.SERVEX_WORKTREE_CLEANUP !== "0";
		this.stopping ??= process.env.SERVEX_WORKTREE_STOP_SERVERS !== "0";
		this.quiet_hours ??= Number(process.env.SERVEX_WORKTREE_QUIET_HOURS) || 2;
		this.close_hours ??= Number(process.env.SERVEX_WORKTREE_CLOSE_HOURS) || 48;   // quiet this long: close it even if the task never landed
		this.removed = [];       // { at, name, branch, why }
		this.servers_stopped = 0;   // how many worktrees had their dev server and/or health watcher stopped, this Servex run
		this.lan = new Set();       // worktree names whose dev server answers the LAN: a preview waiting for its merge
		this.last = null;        // the latest pass: { at, items, junctions }
	}

	start(){
		this.first = setTimeout(() => this.tick(), 2 * 60000); this.first.unref?.();
		this.timer = setInterval(() => this.tick(), this.every); this.timer.unref?.();
		return this;
	}

	stop(){ clearTimeout(this.first); clearInterval(this.timer); }

	log(entry){ return this.servex?.log?.append("servex", { type: "worktrees", ...entry }).catch(() => {}); }

	git(args, cwd = this.main){
		return new Promise(resolve => execFile("git", ["--no-optional-locks", "-C", cwd, ...args], { windowsHide: true, encoding: "utf8", maxBuffer: 16 << 20 },   // our own status must not refresh the index: quiet_min() would read our pass as activity
			(e, out, err) => resolve({ ok: !e, out: String(e ? err || out : out).trimEnd() })));   // trimEnd: a porcelain line starts with a space
	}

	/* `git worktree list --porcelain`: every linked worktree except the main checkout, wherever it sits
	 * (one beside the repo, monorepo-wt-readme-roles, was never listed here and so never removed, 2026-11-04). */
	async list(){
		const out = (await this.git(["worktree", "list", "--porcelain"])).out, rows = [];
		for (const [i, block] of out.split(/\n\s*\n/).entries()){
			const wt = block.match(/^worktree (.+)$/m)?.[1];
			// git always prints the main checkout first, even when this Servex runs from a linked one
			if (i === 0 || !wt || norm(wt) === norm(this.main) || norm(wt) === norm(this.dir) || /^bare$/m.test(block)) continue;
			rows.push({ path: wt, name: path.basename(wt), branch: block.match(/^branch refs\/heads\/(.+)$/m)?.[1] ?? null,
				head: block.match(/^HEAD (\w+)/m)?.[1] ?? null, locked: /^locked/m.test(block), prunable: /^prunable/m.test(block) });
		}
		return rows;
	}

	/* One worktree's state, with the reason in words. */
	async judge(wt, tasks){
		if (/^qf-\d+$/.test(wt.name)) return { state: "pool", why: "the quick-fix pool recycles it" };
		if (wt.locked) return { state: "locked", why: "locked with git worktree lock" };
		if (wt.prunable || !fs.existsSync(wt.path)) return { state: "finished", why: "its folder is already gone", prune: true };
		// HOLD UNTIL MERGE (build F): a landed task's unmerged branch keeps its folder for review, until the backstop
		const task0 = tasks.get(norm(wt.path));
		if (wt.branch && task0?.landed && !(await this.merged(wt))){
			const q = this.quiet_min(wt);
			if (q === null || q < this.close_hours * 60) return { state: "open", waiting: true, preview: task0.preview ?? null,
				why: `its task ${task0.key} landed; ${wt.branch} waits for its merge (kept until it merges, or ${this.close_hours} quiet hours)` };
		}
		const agent = this.agent_in(wt.path);
		if (agent) return { state: "in use", why: `${agent.id} (${agent.state}) works in it` };
		if (!wt.branch) return { state: "no branch", why: "a detached HEAD; its commits would have no name" };
		// a session Servex does not know about (a VS Code tab) may be working in it: wait for 2 quiet hours of git
		const quiet = this.quiet_min(wt);
		if (quiet === null) return { state: "in use", why: "cannot tell when git last touched it, so it is left alone" };
		if (quiet < this.quiet_hours * 60) return { state: "in use", why: `git was used in it ${quiet} min ago (waits for ${this.quiet_hours} quiet hours)` };
		const changes = await this.changes(wt.path);
		const real = changes.filter(c => !noise(c));
		const closing = task0?.landed && !this.alive(task0.agent) ? `its task ${task0.key} landed and ${task0.agent ?? "its owner"} has stopped`
			: quiet >= this.close_hours * 60 ? `nothing touched it for ${Math.round(quiet / 60)} hours` : null;
		if (closing && (real.length || !(await this.merged(wt)))) return { state: "finished", commit: true, noise: [], why: `${closing}; ${real.length ? real.length + " leftover file(s) and " : ""}${wt.branch} is saved first` };
		if (real.length) return { state: "uncommitted", why: `${real.length} changed file(s): ${real.slice(0, 3).map(c => c.path).join(", ")}` };
		const done = why => ({ state: "finished", noise: changes,
			why: why + (changes.length ? ` (plus ${changes.length} log file(s) its own server wrote, kept in salvage)` : "") });
		if ((await this.git(["merge-base", "--is-ancestor", wt.branch, this.base])).ok) return done(`${wt.branch} is merged into ${this.base}`);
		if (this.applied(wt.head)) return done(`${wt.branch} was applied to ${this.base} by merge.mjs`);
		return { state: "open", why: `${wt.branch} holds commits ${this.base} does not` + (task0 ? `, for ${task0.key}${task0.landed ? "" : " (not landed)"}` : "") };
	}

	async merged(wt){
		return (await this.git(["merge-base", "--is-ancestor", wt.branch, this.base])).ok || this.applied(wt.head);
	}

	/* PREVIEW ON THE PHONE (build F, 2026-10-28): a worktree whose task asked for a preview and now waits for its
	 * merge gets its dev server on the LAN (`HOST=0.0.0.0`, read by Servex.host()) and kept running, so the link on
	 * the ready-to-merge card opens on the phone. `this.lan` is the one list Servex.host() reads. A server whose
	 * worktree stops waiting (merged, closed) goes back to loopback. Never a pool slot or a locked worktree:
	 * judge() never says `waiting` for those. The LAN socket stays push-only (dev/Socket/doc/lan.md). */
	async serve_previews(items){
		const want = new Set(items.filter(i => i.waiting && i.preview).map(i => i.name));
		const going = new Set(items.filter(i => i.state === "finished").map(i => i.name));   // remove() stops these in a moment: no restart first
		const before = this.lan;
		this.lan = want;
		for (const name of new Set([...before, ...want])){
			if (going.has(name)) continue;
			const host = want.has(name) ? "0.0.0.0" : "127.0.0.1";
			const runner = this.servex?.runner?.(name);
			if (!runner) continue;
			const was = runner.env?.HOST;
			if (runner.env) runner.env.HOST = host;
			const up = runner.status && runner.status !== "stopped" && runner.status !== "errored";
			try {
				if (was !== host && up) await runner.restart();
				else if (want.has(name) && !up) await runner.start();
				else continue;
				this.log({ msg: `worktrees: ${name} dev server ${want.has(name) ? "on the LAN for its preview" : "back to loopback"} (${host})`, worktree: name });
			} catch (e){ this.log({ msg: `worktrees: ${name} preview server on ${host} failed: ${e.message}` }); }
		}
	}

	/* Leftovers go into the worktree's own branch, so nothing is lost when the folder goes. Returns the file count. */
	async commit_leftovers(item){
		const n = (await this.changes(item.path)).length;
		if (n){
			await this.git(["add", "-A"], item.path);
			const c = await this.git(["commit", "-m", `worktree closed: ${n} leftover file(s) saved to ${item.branch} before the folder was removed\n\nCo-Authored-By: Claude Code <noreply@anthropic.com>`], item.path);
			if (!c.ok) throw new Error(c.out.split("\n").pop());
		}
		return n;
	}

	/* `git status --porcelain` as { code, path }; untracked folders are listed file by file. */
	async changes(dir){
		const out = (await this.git(["status", "--porcelain", "--untracked-files=all"], dir)).out;
		return out ? out.split("\n").map(l => ({ code: l.slice(0, 2), path: l.slice(3).replace(/^"|"$/g, "") })) : [];
	}

	/* ASK 1 (process-monitor, "the RAM squeeze", 2026-10-01): stop what an idle worktree runs.
	 * Removing a worktree (`remove()`, above) needs its branch MERGED first, because deleting the
	 * FOLDER can't be undone — but stopping just its dev server and health watcher is reversible
	 * (the proxy restarts the server on its next request, and a fresh health-supervisor starts
	 * the next time an agent works there), so the bar for stopping is lower: its task being
	 * paused, landed or stopped is enough on its own, and so is the same "quiet_hours of git"
	 * signal `judge()` already reads — neither needs the branch to be merged. Never while a
	 * live Servex agent is actually working there right now (reason: null). */
	idle_enough(wt, task){
		const agent = this.agent_in(wt.path);
		if (agent && (agent.state === "working" || agent.state === "starting")) return null;
		if (task?.paused) return "its task is paused";
		if (task?.landed) return "its task has landed";
		if (task?.agent && !this.alive(task.agent)) return `its task's agent ${task.agent} has stopped`;
		const quiet = this.quiet_min(wt);
		if (quiet !== null && quiet >= this.quiet_hours * 60) return `quiet for ${quiet} min`;
		return null;
	}

	/* Stops an idle worktree's dev server through Servex's OWN stop path — `command(name,
	 * "stop")`, the exact call `stop_server` makes — so Servex's own record of it (`status`,
	 * used by the proxy's autostart) stays correct; never a guessed pid. Its health.mjs watcher
	 * (and the Chromium that is a child of it) is found and stopped through Lifecycle's own
	 * `open()`/`close()`: `Server/health-supervisor.mjs` already calls `Lifecycle.track("health",
	 * …, { path: ROOT })` on its own start, naming its own pid and the worktree it watches, so
	 * closing it is also never a guessed pid — `close()`'s `taskkill /T` takes the Chromium
	 * child down with it. Never a qf-* pool slot: Pool.js looks after those itself. */
	async stop_idle(items, tasks){
		const lc = this.servex?.lifecycle;
		let health = []; try { health = lc ? lc.open().filter(e => e.kind === "health") : []; } catch {}
		let count = 0;
		for (const item of items){
			if (/^qf-\d+$/.test(item.name) || item.state === "locked" || item.state === "no branch") continue;
			if (this.lan.has(item.name)) continue;   // a preview the owner may open from the phone: the proxy cannot restart a direct LAN port
			const reason = this.idle_enough({ name: item.name, path: item.path }, tasks.get(norm(item.path)));
			if (!reason) continue;
			let did = false;
			const runner = this.servex?.processes?.get(item.name);
			if (runner && runner.status !== "stopped"){
				try { await this.servex.command(item.name, "stop"); did = true; }
				catch (e){ this.log({ msg: `worktrees: ${item.name} server stop failed: ${e.message}` }); }
			}
			for (const row of health.filter(e => same_or_under(e.path, item.path))){
				try { await lc.close(row, `worktree idle (${reason})`); did = true; }
				catch (e){ this.log({ msg: `worktrees: ${item.name} health stop failed: ${e.message}` }); }
			}
			if (did){
				count++;
				this.log({ msg: `worktrees: stopped idle servers for ${item.name} — ${reason}`, worktree: item.name, why: reason });
			}
		}
		this.servers_stopped += count;
		return count;
	}

	/* Copy a worktree's log noise out before it goes: the diff of the changed logs, and every new file. */
	async salvage(item){
		const to = path.join(place("salvage"), "worktrees", `${item.name}-${stamp().slice(0, 16).replace(/[:T]/g, "-")}`);
		fs.mkdirSync(to, { recursive: true });
		const changed = item.noise.filter(c => c.code !== "??").map(c => c.path);
		if (changed.length) fs.writeFileSync(path.join(to, "changes.diff"), (await this.git(["diff", "--", ...changed], item.path)).out + "\n");
		for (const c of item.noise.filter(c => c.code === "??")){
			const dest = path.join(to, "new", c.path);
			fs.mkdirSync(path.dirname(dest), { recursive: true });
			fs.copyFileSync(path.join(item.path, c.path), dest);
		}
		return to;
	}

	/* Minutes since git last touched this worktree: its index, HEAD (by mtime) or
	 * logs/HEAD (by its LAST LINE's own timestamp, not the file's mtime — git gc or
	 * reflog expire rewrites logs/HEAD without adding an entry, which bumped the
	 * mtime of all 36 worktrees at once on 2026-10-01 and made every one look freshly
	 * used). A commit, a checkout or a status refresh is what actually counts. */
	quiet_min(wt){
		if (!this.common) return null;
		const gitdir = path.join(this.common, "worktrees", wt.name);
		let last = 0;
		for (const f of ["index", "HEAD"]) try { last = Math.max(last, fs.statSync(path.join(gitdir, f)).mtimeMs); } catch {}
		last = Math.max(last, this.reflog_last(path.join(gitdir, "logs", "HEAD")));
		return last ? Math.round((Date.now() - last) / 60000) : null;
	}

	/* The timestamp git itself wrote on logs/HEAD's last line: `... <email> <unix> <tz>\t<message>`. */
	reflog_last(file){
		let text; try { text = fs.readFileSync(file, "utf8"); } catch { return 0; }
		const last = text.split("\n").filter(Boolean).at(-1);
		const m = last?.match(/<[^>]*>\s+(\d+)\s+[+-]\d{4}\t/);
		return m ? Number(m[1]) * 1000 : 0;
	}

	agent_in(dir){
		for (const a of this.servex?.agents?.live?.values() ?? [])
			if (a.state !== "stopped" && a.cwd && same_or_under(a.cwd, dir)) return a;
		return null;
	}

	/* Who is working inside this folder right now: a live agent, a not-yet-ended agent in the lifecycle records, or this very process. Returns a name, or null. */
	async held_by(dir){
		if (same_or_under(process.cwd(), dir)) return `this process (${process.argv[1] ? path.basename(process.argv[1]) : "node"})`;
		const a = this.agent_in(dir);
		if (a) return `agent ${a.id}`;
		try {
			const r = (await this.servex?.lifecycle?.resources() ?? []).find(r => r.kind === "agent" && r.path && same_or_under(r.path, dir));
			if (r) return `agent ${r.id}`;
		} catch {}
		return null;
	}

	alive(id){ const a = id && this.servex?.agents?.live?.get(id); return !!a && a.state !== "stopped"; }

	applied(head){
		try { return !!head && JSON.parse(fs.readFileSync(path.join(this.main, ".merge-landed.json"), "utf8")).some(e => e.head === head); }
		catch { return false; }
	}

	/* Which task took which worktree: `{assign: {worktree}}` in its task.jsonl
	 * (Lifecycle.took writes it). Only the last three weeks of task dirs. Every `assign` line
	 * is merged, later wins (the same rule Heartbeat.read() and TaskLoop's own reader use) —
	 * `paused` is read the same way: `{"assign":{"paused":true}}` anywhere in the log. `landed`
	 * needs an `outcome` too (or a `closed_by`), not just `landed_at` on its own, matching
	 * finish-task's own "done" check — the two are always written together, so this only makes
	 * the signal stricter, never looser. */
	tasks(){
		const out = new Map();
		for (const { dir, day, slug } of TaskDirs.list(21)){   // both shapes: the sessions store and old day folders (ai/doc/task-folders.md)
			{
				let text; try { text = fs.readFileSync((SessionRecord.log_file(dir) ?? path.join(dir, "task.jsonl")), "utf8"); } catch { continue; }
				if (!text.includes("\"worktree\"")) continue;
				const state = {};
				for (const line of text.split("\n")){
					let a; try { a = JSON.parse(line).assign; } catch { continue; }
					if (a) Object.assign(state, a);
				}
				if (!state.worktree) continue;
				const landed = Landed.of_dir(dir);
				out.set(norm(state.worktree), { key: `${day}/${slug}`, landed, paused: !!state.paused, agent: state.agent ?? null, worktree: state.worktree, preview: WorktreePreview.page(state) });
			}
		}
		return out;
	}

	/* `node Server/junction-check.mjs`: exit 0 means no link under the worktree roots lands in main. */
	junctions(){
		return new Promise(resolve => execFile(process.execPath, [path.join(this.main, "Server", "junction-check.mjs")], { cwd: this.main, windowsHide: true, encoding: "utf8" },
			(e, out) => resolve({ ok: !e, out: String(out ?? "").trim().split("\n").slice(-3).join(" ") })));
	}

	async tick(){
		if (this.busy) return this.last;
		this.busy = true;
		try {
			// main's own .git, even when this Servex runs from a worktree (where .git is a file)
			this.common ??= path.resolve(this.main, (await this.git(["rev-parse", "--git-common-dir"])).out || ".git");
			const tasks = this.tasks(), items = [];
			for (const wt of await this.list()) items.push({ name: wt.name, path: wt.path, branch: wt.branch, ...(await this.judge(wt, tasks)) });
			await this.serve_previews(items).catch(e => this.log({ msg: `worktrees: serve_previews failed: ${e.message}` }));
			if (this.stopping) await this.stop_idle(items, tasks).catch(e => this.log({ msg: `worktrees: stop_idle failed: ${e.message}` }));
			const finished = items.filter(i => i.state === "finished");
			if (this.removing) for (const r of await this.residue(await this.list())) await this.clear_residue(r.path);
			let junctions = null;
			if (finished.length && this.removing){
				junctions = await this.junctions();
				if (!junctions.ok) this.log({ msg: `worktrees: ${finished.length} finished, none removed — junction-check failed: ${junctions.out}` });
				else for (const i of finished) await this.remove(i);
			}
			this.last = { at: stamp(), items, junctions };
			this.emit("tick", this.last);
			return this.last;
		} finally { this.busy = false; }
	}

	/* A folder git no longer lists (a removal that stopped half way, or a server still running there that wrote files back: docs-gate,
	 * usage-stale, 2026-11-04; 60+ more under worktrees/). Its processes are closed, then the folder is MOVED ASIDE to
	 * ../moved-aside/worktree-residue/<name>-<date>, never deleted: a rename takes a junction with it without following it, and
	 * nothing is lost if it held a file nobody committed. Returns { ok, removed, why }. */
	async clear_residue(dir){
		const name = path.basename(dir), item = { name, path: dir };
		await this.close_under(item, `${name} is a leftover folder`);
		const to = path.join(path.resolve(this.dir, ".."), "moved-aside", "worktree-residue", `${name}-${stamp().slice(0, 10)}-${Date.now()}`);
		try {
			fs.mkdirSync(path.dirname(to), { recursive: true });
			fs.renameSync(dir, to);
		} catch (e){
			await this.close_under(item, `${name} is a leftover folder (retry)`);
			await new Promise(done => setTimeout(done, 3000));
			try { fs.renameSync(dir, to); } catch (e2){ this.log({ msg: `worktrees: leftover folder ${name} not moved: ${e2.message}` }); return { ok: false, why: `leftover folder could not be moved aside: ${e2.message}` }; }
		}
		this.forget(name);
		this.unregister(item);
		this.log({ msg: `worktrees: leftover folder ${name} moved aside to ${to}`, name, to });
		return { ok: true, removed: true, why: `leftover folder moved aside to ${to}` };
	}

	/* Every folder directly under worktrees/ that git does not list, holds no listed worktree, is no pool slot, is not in use
	 * and was last touched over an hour ago (a worktree being made right now is younger). */
	async residue(listed){
		let names; try { names = fs.readdirSync(this.dir, { withFileTypes: true }); } catch { return []; }
		const out = [], reg = (() => { try { return Object.values(JSON.parse(fs.readFileSync(path.join(this.main, ".worktrees.json"), "utf8").replace(/^﻿/, ""))); } catch { return []; } })();
		for (const e of names){
			if (!e.isDirectory() || e.name.startsWith("_") || e.name.startsWith(".")) continue;
			const p = path.join(this.dir, e.name);
			if (listed.some(w => same_or_under(w.path, p) || same_or_under(p, w.path))) continue;
			if (pool_slot(p) || reg.some(w => w?.path && norm(w.path) === norm(p)) || this.agent_in(p)) continue;
			let age = 0; try { age = Date.now() - fs.statSync(p).mtimeMs; } catch { continue; }
			if (age < 3600000) continue;
			out.push({ name: e.name, path: p });
		}
		return out;
	}

	/* The task is closing: remove this worktree NOW if it is clean and its branch is merged (no quiet hours, no waiting for a landing).
	 * Anything unmerged, dirty or locked is kept and the reason returned, so the close reports it as left. Lifecycle.closeout() calls this. */
	async close_now(dir){
		const wt = (await this.list()).find(w => norm(w.path) === norm(dir));
		if (!wt) return fs.existsSync(dir) ? this.clear_residue(dir) : { ok: true, removed: false, why: "already gone" };
		if (wt.locked) return { ok: false, why: "locked with git worktree lock" };
		const held = await this.held_by(wt.path);
		if (held) return { ok: false, why: `${held} still works inside it; removing the folder now would leave it in a gutted checkout. The sweep removes it once that stops` };
		const item = { name: wt.name, path: wt.path, branch: wt.branch };
		if (wt.prunable || !fs.existsSync(wt.path)) Object.assign(item, { prune: true, why: "its folder is already gone" });
		else {
			if (!wt.branch) return { ok: false, why: "a detached HEAD; its commits would have no name" };
			const changes = await this.changes(wt.path), real = changes.filter(c => !noise(c));
			if (real.length) return { ok: false, why: `${real.length} uncommitted file(s): ${real.slice(0, 3).map(c => c.path).join(", ")}` };
			if (!(await this.merged(wt))) return { ok: false, why: `${wt.branch} holds commits ${this.base} does not; kept until it merges` };
			Object.assign(item, { noise: changes, why: `${wt.branch} is merged into ${this.base}; closed with its task` });
		}
		const j = await this.junctions();
		if (!j.ok) return { ok: false, why: `junction-check failed, nothing removed: ${j.out}` };
		const ok = await this.remove(item);
		return ok ? { ok: true, removed: true, why: item.why } : { ok: false, why: item.why };
	}

	/* Close EVERY process the lifecycle can see under this folder: its Servex-run server, a hand-started wrapper, its health
	 * watcher, a Playwright browser. Stopping only Servex's own runner left the rest holding the folder, so `git worktree remove`
	 * could not finish (usage-stale, 2026-11-04). Returns how many were closed. */
	async close_under(item, why){
		const lc = this.servex?.lifecycle;
		if (!lc) return 0;
		let n = 0;
		try {
			for (const r of await lc.resources()){
				if (r.kind === "agent" || !r.path || !same_or_under(r.path, item.path) || r.pid === process.pid) continue;
				try { await lc.close(r, why); n++; } catch (e){ this.log({ msg: `worktrees: ${item.name}: could not close ${r.kind} ${r.id}: ${e.message}` }); }
			}
		} catch (e){ this.log({ msg: `worktrees: ${item.name}: could not list what runs there: ${e.message}` }); }
		return n;
	}

	/* The registry (.worktrees.json, worktree-up.mjs) keeps an entry per hand-made worktree; one left behind keeps a dead pid on the sweep's list. */
	unregister(item){
		const file = path.join(this.main, ".worktrees.json");
		try {
			const reg = JSON.parse(fs.readFileSync(file, "utf8").replace(/^﻿/, ""));
			let changed = false;
			for (const [k, w] of Object.entries(reg)) if (w?.path && norm(w.path) === norm(item.path)){ delete reg[k]; changed = true; }
			if (changed) Object.keys(reg).length ? fs.writeFileSync(file, JSON.stringify(reg, null, "	")) : fs.unlinkSync(file);
		} catch {}
	}

	/* Stop everything running there, remove the folder (git refuses anything unclean), forget the project. */
	async remove(item){
		const sx = this.servex, name = item.name;
		try { await sx?.processes?.get(name)?.terminate?.(); } catch {}
		await this.close_under(item, `worktree ${name} is being removed`);
		let kept = null, committed = 0, unmerged = 0, sha = null;
		if (item.commit){
			try {
				committed = await this.commit_leftovers(item);
				sha = (await this.git(["rev-parse", "HEAD"], item.path)).out;
				unmerged = Number((await this.git(["rev-list", "--count", `${this.base}..HEAD`], item.path)).out) || 0;
				if (unmerged && ((await this.git(["diff", "--quiet", `${this.base}...HEAD`], item.path)).ok)) unmerged = 0;
			} catch (e){ item.state = "open"; item.why = `its leftovers could not be committed first: ${e.message}`; return false; }
		} else if (item.noise?.length){
			try { kept = await this.salvage(item); }
			catch (e){ item.state = "open"; item.why = `its log files could not be saved first: ${e.message}`; return false; }
		}
		// --force only when every change is log noise, and only after it was saved; otherwise git itself refuses
		const take_out = () => item.prune ? this.git(["worktree", "prune"])
			: this.git(["worktree", "remove", ...(item.noise?.length ? ["--force"] : []), item.path]);
		let r = await take_out();
		if (!r.ok && /permission denied|in use|being used|not empty|cannot remove|unable to delete/i.test(r.out)){   // something still held the folder: close again, wait, one more try
			await this.close_under(item, `worktree ${name} is being removed (retry)`);
			await new Promise(done => setTimeout(done, 3000));
			r = await take_out();
		}
		// git unregisters the worktree first and can then fail to delete the folder (a process was still exiting): the retry says "not a working tree" and the folder would stay
		if (!r.ok && /is not a working tree/i.test(r.out)){
			if (!fs.existsSync(item.path)) r = { ok: true, out: "" };   // the first try already did it all
			else { const c = await this.clear_residue(item.path); if (c.ok) r = { ok: true, out: "" }; }
		}
		if (r.ok && !item.prune && fs.existsSync(item.path)){ try { fs.rmdirSync(item.path); } catch {} }   // git can leave an empty folder; rmdir removes only an empty one
		if (!r.ok){ item.state = "open"; item.why = `git refused to remove it: ${r.out.split("\n")[0]}`; this.log({ msg: `worktrees: ${name} not removed: ${r.out}` }); return false; }
		this.forget(name);
		this.unregister(item);
		item.state = "removed";
		const entry = { at: stamp(), name, branch: item.branch, why: item.why, salvage: kept };
		this.manifest({ path: item.path, branch: item.branch, sha, at: entry.at, why: item.why, committed, unmerged, restore: `git worktree add "${item.path}" ${item.branch}` }, unmerged);
		this.removed.push(entry);
		if (this.removed.length > 200) this.removed.shift();
		this.log({ msg: `worktrees: removed ${name} (${item.why}); branch ${item.branch} kept`, ...entry });
		return true;
	}

	/* One line in the removals manifest; an unmerged branch also gets a "ready to merge" line (priority.md 3b). */
	manifest(line, unmerged){
		const dir = path.join(this.main, "public", "framework", "ai", "sessions");
		try {
			fs.mkdirSync(dir, { recursive: true });
			fs.appendFileSync(path.join(dir, "worktree-removals.jsonl"), JSON.stringify(line) + "\n");
			if (unmerged) fs.appendFileSync(path.join(dir, "ready-to-merge.jsonl"), JSON.stringify({ branch: line.branch, sha: line.sha, unmerged, leftover_files: line.committed, at: line.at, how: "node Server/merge.mjs on a worktree of this branch", why: "worktree closed; these commits are not on " + this.base }) + "\n");
		} catch {}
	}

	/* Servex forgets the project: its runner, its place in the list, its port. */
	forget(name){
		const sx = this.servex;
		if (!sx) return;
		sx.processes?.delete?.(name);
		const i = sx.projects?.findIndex(p => p.name === name && !p.self);
		if (i >= 0) sx.projects.splice(i, 1);
		if (sx.ports?.ports?.[name] !== undefined){ delete sx.ports.ports[name]; try { sx.ports.save(); } catch {} }
	}

	/* What the process monitor shows. */
	summary(){
		const items = this.last?.items ?? [], count = s => items.filter(i => i.state === s).length;
		const today = new Date().toDateString();
		return {
			at: this.last?.at ?? null, total: items.filter(i => i.state !== "removed").length,
			pool: count("pool"), in_use: count("in use"), open: count("open"), uncommitted: count("uncommitted"),
			finished: count("finished"), removed_today: this.removed.filter(r => new Date(r.at).toDateString() === today).length,
			servers_stopped: this.servers_stopped,
			junctions_ok: this.last?.junctions ? this.last.junctions.ok : null,
			waiting: items.filter(i => i.waiting).length, lan: [...this.lan],
			items: items.map(({ name, branch, state, why, waiting }) => ({ name, branch, state, why, ...(waiting ? { waiting } : {}) }))
		};
	}

	line(){
		const s = this.summary();
		if (!s.at) return "Worktrees: not counted yet (the first pass runs 2 minutes after Servex starts).";
		return `Worktrees: ${s.total} (${s.pool} pool, ${s.in_use} in use, ${s.open} open, ${s.uncommitted} uncommitted), ${s.removed_today} removed today.`;
	}
}

/* A change the worktree's own server or hooks made: a *.jsonl log anywhere,
 * or a new screenshot under public/framework/ai/. A new plan.md or page.js there is
 * real work, not noise (review, 2026-09-30). Never a rename or a deletion. */
export const noise = c => !/[RCD]/.test(c.code) && !c.path.includes(" -> ")
	&& (/(^|\/)[^/]+\.jsonl$/.test(c.path) || (c.code === "??" && c.path.startsWith("public/framework/ai/") && /\.(png|jpe?g|webp|gif)$/i.test(c.path)));

const norm = p => path.resolve(String(p)).replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
const same_or_under = (p, dir) => { const a = norm(p), b = norm(dir); return a === b || a.startsWith(b + "/"); };
