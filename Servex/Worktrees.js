import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { fileURLToPath } from "url";
import Events from "../Server/Events.js";
import { stamp, place } from "./home.js";

/* WORKTREE CLEAN-UP — a worktree is temporary (process-monitor, 2026-09-30).
 *
 * Every folder in C:/Code/lew42/worktrees/ with a package.json becomes a Servex
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
 *   open         its branch holds commits michael/dev does not, and no landed task owns it.
 *   finished     its branch is merged into michael/dev (or applied by merge.mjs), or
 *                the task that took it has landed and no agent of it is alive.
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
		this.base ??= "michael/dev";
		this.every ??= Number(process.env.SERVEX_WORKTREES_EVERY_MS) || 10 * 60000;
		this.removing ??= process.env.SERVEX_WORKTREE_CLEANUP !== "0";
		this.quiet_hours ??= Number(process.env.SERVEX_WORKTREE_QUIET_HOURS) || 2;
		this.removed = [];       // { at, name, branch, why }
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
		return new Promise(resolve => execFile("git", ["-C", cwd, ...args], { windowsHide: true, encoding: "utf8", maxBuffer: 16 << 20 },
			(e, out, err) => resolve({ ok: !e, out: String(e ? err || out : out).trimEnd() })));   // trimEnd: a porcelain line starts with a space
	}

	/* `git worktree list --porcelain`, only the ones under `this.dir`. */
	async list(){
		const out = (await this.git(["worktree", "list", "--porcelain"])).out, rows = [];
		for (const block of out.split(/\n\s*\n/)){
			const wt = block.match(/^worktree (.+)$/m)?.[1];
			if (!wt || !same_or_under(wt, this.dir) || norm(wt) === norm(this.dir)) continue;
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
		const agent = this.agent_in(wt.path);
		if (agent) return { state: "in use", why: `${agent.id} (${agent.state}) works in it` };
		if (!wt.branch) return { state: "no branch", why: "a detached HEAD; its commits would have no name" };
		// a session Servex does not know about (a VS Code tab) may be working in it: wait for 2 quiet hours of git
		const quiet = this.quiet_min(wt);
		if (quiet === null) return { state: "in use", why: "cannot tell when git last touched it, so it is left alone" };
		if (quiet < this.quiet_hours * 60) return { state: "in use", why: `git was used in it ${quiet} min ago (waits for ${this.quiet_hours} quiet hours)` };
		const changes = await this.changes(wt.path);
		const real = changes.filter(c => !noise(c));
		if (real.length) return { state: "uncommitted", why: `${real.length} changed file(s): ${real.slice(0, 3).map(c => c.path).join(", ")}` };
		const done = why => ({ state: "finished", noise: changes,
			why: why + (changes.length ? ` (plus ${changes.length} log file(s) its own server wrote, kept in salvage)` : "") });
		if ((await this.git(["merge-base", "--is-ancestor", wt.branch, this.base])).ok) return done(`${wt.branch} is merged into ${this.base}`);
		if (this.applied(wt.head)) return done(`${wt.branch} was applied to ${this.base} by merge.mjs`);
		const task = tasks.get(norm(wt.path));
		if (task?.landed && !this.alive(task.agent)) return done(`its task ${task.key} landed and ${task.agent ?? "its owner"} has stopped`);
		return { state: "open", why: `${wt.branch} holds commits ${this.base} does not` + (task ? `, for ${task.key}${task.landed ? "" : " (not landed)"}` : "") };
	}

	/* `git status --porcelain` as { code, path }; untracked folders are listed file by file. */
	async changes(dir){
		const out = (await this.git(["status", "--porcelain", "--untracked-files=all"], dir)).out;
		return out ? out.split("\n").map(l => ({ code: l.slice(0, 2), path: l.slice(3).replace(/^"|"$/g, "") })) : [];
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

	/* Minutes since git last touched this worktree: its index, HEAD or logs/HEAD
	 * under main's .git/worktrees/<name>/ (a commit, a checkout, a status refresh). */
	quiet_min(wt){
		if (!this.common) return null;
		const gitdir = path.join(this.common, "worktrees", wt.name);
		let last = 0;
		for (const f of ["index", "HEAD", path.join("logs", "HEAD")]) try { last = Math.max(last, fs.statSync(path.join(gitdir, f)).mtimeMs); } catch {}
		return last ? Math.round((Date.now() - last) / 60000) : null;
	}

	agent_in(dir){
		for (const a of this.servex?.agents?.live?.values() ?? [])
			if (a.state !== "stopped" && a.cwd && same_or_under(a.cwd, dir)) return a;
		return null;
	}

	alive(id){ const a = id && this.servex?.agents?.live?.get(id); return !!a && a.state !== "stopped"; }

	applied(head){
		try { return !!head && JSON.parse(fs.readFileSync(path.join(this.main, ".merge-landed.json"), "utf8")).some(e => e.head === head); }
		catch { return false; }
	}

	/* Which task took which worktree: `{assign: {worktree}}` in its task.jsonl
	 * (Lifecycle.took writes it). Only the last three weeks of task dirs. */
	tasks(){
		const ai = path.join(this.main, "public", "framework", "ai"), out = new Map();
		const since = Date.now() - 21 * 86400000;
		let days = []; try { days = fs.readdirSync(ai).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d) && Date.parse(d) >= since); } catch {}
		for (const day of days){
			let slugs = []; try { slugs = fs.readdirSync(path.join(ai, day)); } catch {}
			for (const slug of slugs){
				let text; try { text = fs.readFileSync(path.join(ai, day, slug, "task.jsonl"), "utf8"); } catch { continue; }
				if (!text.includes("\"worktree\"")) continue;
				const t = { key: `${day}/${slug}`, landed: false, agent: null, worktree: null };
				for (const line of text.split("\n")){
					let a; try { a = JSON.parse(line).assign; } catch { continue; }
					if (!a) continue;
					if (a.worktree) t.worktree = a.worktree;
					if (a.agent) t.agent = a.agent;
					if (a.landed_at) t.landed = true;
				}
				if (t.worktree) out.set(norm(t.worktree), t);
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
			const finished = items.filter(i => i.state === "finished");
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

	/* Stop its server, remove the folder (git refuses anything unclean), forget the project. */
	async remove(item){
		const sx = this.servex, name = item.name;
		try { await sx?.processes?.get(name)?.terminate?.(); } catch {}
		let kept = null;
		if (item.noise?.length){
			try { kept = await this.salvage(item); }
			catch (e){ item.state = "open"; item.why = `its log files could not be saved first: ${e.message}`; return false; }
		}
		// --force only when every change is log noise, and only after it was saved; otherwise git itself refuses
		const r = item.prune ? await this.git(["worktree", "prune"])
			: await this.git(["worktree", "remove", ...(item.noise?.length ? ["--force"] : []), item.path]);
		if (!r.ok){ item.state = "open"; item.why = `git refused to remove it: ${r.out.split("\n")[0]}`; this.log({ msg: `worktrees: ${name} not removed: ${r.out}` }); return false; }
		this.forget(name);
		item.state = "removed";
		const entry = { at: stamp(), name, branch: item.branch, why: item.why, salvage: kept };
		this.removed.push(entry);
		if (this.removed.length > 200) this.removed.shift();
		this.log({ msg: `worktrees: removed ${name} (${item.why}); branch ${item.branch} kept`, ...entry });
		return true;
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
			junctions_ok: this.last?.junctions ? this.last.junctions.ok : null,
			items: items.map(({ name, branch, state, why }) => ({ name, branch, state, why }))
		};
	}

	line(){
		const s = this.summary();
		if (!s.at) return "Worktrees: not counted yet (the first pass runs 2 minutes after Servex starts).";
		return `Worktrees: ${s.total} (${s.pool} pool, ${s.in_use} in use, ${s.open} open, ${s.uncommitted} uncommitted), ${s.removed_today} removed today.`;
	}
}

/* A change the worktree's own server or hooks made: a *.jsonl log anywhere,
 * or a new file under public/framework/ai/ (a card folder, a screenshot). Never a rename or a deletion. */
export const noise = c => !/[RCD]/.test(c.code) && !c.path.includes(" -> ")
	&& (/(^|\/)[^/]+\.jsonl$/.test(c.path) || (c.code === "??" && c.path.startsWith("public/framework/ai/")));

const norm = p => path.resolve(String(p)).replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
const same_or_under = (p, dir) => { const a = norm(p), b = norm(dir); return a === b || a.startsWith(b + "/"); };
