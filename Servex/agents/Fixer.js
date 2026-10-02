import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

/* THE STANDING QUICK-FIXER, living inside Servex, the same shape as Assistant.js (the fast
 * assistant): one Claude session, started once at boot, kept warm for as long as Servex runs.
 *
 * WHY IT HOLDS ITS OWN WORKTREE FOREVER (the owner, 2026-09-25, quoted in plan.md): "if you have
 * a quick fix you send it off to an existing one" — no spawn, no new worktree, on the hot path.
 * Every other pool slot is taken and returned per task (Pool.js); the fixer instead TAKES ONE
 * SLOT ONCE, at boot (`pool.take_sync`), and `pool.hold()`s it so the pool's own ten-minute sweep
 * (`reclaim()`, Servex/doc/pool.md) can never hand it to someone else between fixes — Pool.js's
 * own comment there tells the story of qf-9 looking "stopped" while its holder was still working.
 *
 * WHAT IT DOES NOT DO: this file never edits a page itself. The actual edit, the commit, the
 * `merge.mjs` call and the "too big, hand this to a task-mastermind" judgment are the AGENT's
 * own work, following `fixer.md` (its system prompt, read once and cached — see `brief()`).
 * This class is only the plumbing that keeps one such agent warm and holding a slot: starting
 * it, and handing it a request (`quick_fix`, in Sessions.js + tools.js, is the door in). */
export default class Fixer {

	constructor(...args){ this.assign(this.defaults(), ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	defaults(){ return { id: "fixer-1", role: "fixer" }; }

	/* Its posture, read from disk once — same trick as Assistant.brief(): a plain string
	 * `system` REPLACES the CLI's own preamble, so this session never spends a turn loading a
	 * skill it was never going to use (Agents.spawn()'s own comment on why a `system` brief
	 * skips the skill-load step). */
	brief(){
		return this.base ??= fs.readFileSync(path.join(HERE, "fixer.md"), "utf8");
	}

	live(){
		const a = this.servex?.agents?.live?.get(this.id);
		return a && a.state !== "stopped" ? a : null;
	}

	/* Take (once) and hold the pool slot this fixer lives in. Synchronous, like
	 * `Pool.take_sync()` itself — `ensure()` below needs a plain return, not a promise, because
	 * `quick_fix` calls it on the hot path and cannot await a whole worktree-prepare cycle. A
	 * slot already taken earlier this boot (`this.slot`) is reused; the pool is asked exactly
	 * once per Servex process life, same as the fast assistant asks `spawn` once. */
	take_slot(){
		if (this.slot) return this.slot;
		const pool = this.servex?.pool;
		if (!pool) throw new Error("no worktree pool is running in this Servex (SERVEX_NO_POOL?) — the fixer needs one to hold");
		const slot = pool.take_sync(this.id);
		if (!slot) throw new Error("no quick-fix worktree is ready for the fixer to hold (take_worktree would also fail right now) — it will try again on the next request");
		pool.hold(slot.id, this.id);
		this.servex.say?.(`fixer: holding ${slot.id} at ${slot.path}`, { event: "fixer", id: slot.id });
		return this.slot = slot;
	}

	/* Get the standing fixer, starting it the first time (or after it was stopped for some
	 * reason) — idempotent, same shape as Assistant.start(). `urgent: true` means this boot
	 * spawn is never queued behind the machine-is-hot gate (Servex.bypass()): the fixer is
	 * infrastructure, not a unit of work, the same reason the fast assistant is never queued. */
	ensure(){
		const live = this.live();
		if (live) return live;
		const slot = this.take_slot();
		this.servex.agents.live.delete(this.id);   // a STOPPED corpse would otherwise make Agents.name() mint "fixer-1-2"
		return this.servex.agents.spawn({
			id: this.id, role: this.role, name: "1", urgent: true,
			model: "claude-sonnet-5", effort: "medium",   // the brief's own words — `role: "fixer"` has no roles.js row, so these would silently default to Agent.defaults()'s "high" otherwise
			system: this.brief(),
			cwd: slot.path,
			permission_mode: "bypassPermissions",
			dormant_after: "session",   // kept warm: never auto-sleeps while this Servex is up, same word the voice pair uses
			prompt: `You are on duty, holding worktree ${slot.id} at ${slot.path} (its own dev server: ${slot.url}). `
				+ "The next message is a quick-fix request. Answer nothing now."
		});
	}

	/* Called once at Servex boot (Servex.js, right after `this.pool` exists). Never throws past
	 * here — a fixer that cannot get a slot yet (the pool is still warming up) tries again on the
	 * first real request instead of taking Servex's own boot down. */
	start(){
		try { return this.ensure(); }
		catch (e){ this.servex?.say?.(`fixer did not start: ${e.message || e}`); return null; }
	}
}
