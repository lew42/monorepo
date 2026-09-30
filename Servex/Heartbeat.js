import fs from "fs";
import path from "path";
import { place, stamp } from "./home.js";
import Budget from "./Budget.js";

/* THE HEARTBEAT — a task's owner that goes quiet is asked how it is doing; one
 * that died is revived; only when that fails does the owner of the machine hear.
 * Doc: Servex/doc/task-loop.md, "The heartbeat". Plain node over agent events
 * (`agents.watch`) and messages (`agents.send`), so any harness can feed it.
 *
 * Watched: every OPEN task (no landed_at + outcome, no closed_by) that opted in —
 * line 1 dated at/after SERVEX_HEARTBEAT_SINCE, or line 1 `heartbeat: true` — so
 * the boot sweep never wakes weeks-old tasks. Only its owner is watched: the latest assign's
 * agent (a fresh session that took over writes one), or that id's resumed successor. */
export const CHECK = "Status check: where are you at? No change of plan needed; just a line on what you're doing.";
const FROM = "servex-heartbeat";

export default class Heartbeat {

    constructor(...args){ Object.assign(this, ...args); this.initialize(); }

    initialize(){
        const env = (k, d) => Number(process.env[k]) || d;
        this.silent_ms ??= env("SERVEX_HEARTBEAT_SILENT_MIN", 5) * 60000;
        this.revive_gap_ms ??= env("SERVEX_HEARTBEAT_REVIVE_GAP_S", 30) * 1000;
        this.since ??= Date.parse(process.env.SERVEX_HEARTBEAT_SINCE || "2026-09-29T13:00:00-05:00");
        this.queue_file ??= place("heartbeat-queue.json");   // revives waiting on the gate survive a restart
        this.seen = new Map();        // agent id -> { at, tool_at } — its last sign of life
        this.watch = new Map();       // task.jsonl -> { owner, card, check_at, answered, told }
        this.stopped_by = new Map();  // agent id -> { by, at } — stopped on purpose, never revived
        this.gate = new Map();        // a queued spawn spec -> { at, reason, told }
        this.admitted = new WeakSet();
        this.booted = Date.now();
        this.last_revive = 0;
    }

    get agents(){ return this.servex.agents; }

    /* taskloop-gate, 2026-09-29: the opt-in test, shared with TaskLoop.js so
     * a boot sweep never touches a task from before this feature existed.
     * `state` is a task's line-1 assign (or TaskLoop's merged assign, which
     * carries line 1's fields through unchanged either way). */
    opted_in(state){
        return !!state && (state.heartbeat === true || Date.parse(state.requested_at) >= this.since);
    }

    /* Hooks on the INSTANCE, the same way Servex's spawn gate wraps `spawn`. */
    start(){
        const a = this.agents, watch = a.watch.bind(a), stop = a.stop.bind(a);
        a.watch = (event, agent) => { watch(event, agent); try { this.saw(event, agent); } catch {} };
        a.stop = (id, opts) => { if (!this.stopped_by.has(id)) this.stopped_by.set(id, { by: opts?.by ?? "in-process", at: stamp() }); return stop(id, opts); };
        a.stopped_on_purpose = id => this.stopped_by.get(id);   // wake_parent never revives these (rule 4c.2)
        a.task_dir_of = id => { for (const [f, w] of this.watch) if (w.owner === id) return path.dirname(f); };
        a.find_task_dir = row => this.find_task_dir(row);
        a.forget_stop = id => this.stopped_by.delete(id);   // the revive guard's last resort (Agents.task_dir_for)
        this.servex.on?.("admitted", spec => this.admitted.add(spec));
        const run = () => this.tick().catch(e => this.servex.say?.(`heartbeat: ${e.message || e}`));
        this.timer = setInterval(run, Math.min(60000, this.silent_ms / 3));
        this.timer.unref();
        setTimeout(run, 3000).unref();   // the boot sweep: a task whose agent died in a restart is picked up at once
        return this;
    }

    stop(){ clearInterval(this.timer); }

    /* Who called stop_agent — the MCP door knows (`ctx.caller`), the tool does not
     * pass it on. Wrapped at the first tick, once Servex has registered its tools. */
    wrap_stop(){
        const h = this.servex.mcp?.handlers, tool = h?.get("stop_agent");
        if (!tool || tool.heartbeat) return;
        const wrapped = (args = {}, ctx = {}) => {
            this.stopped_by.set(args.id, { by: ctx.caller ?? args.from ?? "unknown", at: stamp() });
            return tool(args, ctx);
        };
        wrapped.heartbeat = true;
        h.set("stop_agent", wrapped);
    }

    /* ── signs of life ─────────────────────────────────────────────── */

    saw(event, agent){
        const s = this.seen.get(agent.id) ?? {}, now = Date.now();
        s.at = now;
        if (event.type === "tool" && !event.nested) s.tool_at = now;
        else if (!event.nested && event.type !== "delta") s.tool_at = null;
        this.seen.set(agent.id, s);
        if (agent.state !== "stopped") this.stopped_by.delete(agent.id);
        for (const [file, w] of this.watch){
            if (w.owner !== agent.id) continue;
            if (event.type === "result" && !event.stopped && w.check_at){   // it answered: that goes on the card, nothing else
                w.check_at = null; w.answered = (w.answered ?? 0) + 1;
                const text = (agent.last_text ?? event.text ?? "").slice(0, 600);
                this.log(file, "answered", text.slice(0, 200));
                if (w.card) this.post(w.card, `${agent.id}: ${text}`);
            } else if (event.type === "transcript" && !w.check_at) w.answered = 0;   // working on its own again
        }
    }

    /* The task budgets (Budget.js): swept every tick; the spawn gate asks budgets().refuse(spec). */
    budgets(){ return this.budget ??= new Budget({ heartbeat: this }); }

    /* ── the sweep ─────────────────────────────────────────────────── */

    async tick(){
        if (this.busy) return;
        this.busy = true;
        try {
            const now = Date.now();
            this.wrap_stop();
            const files = this.files();
            /* A task this tick no longer finds (landed, or too old for the task loop) leaves the list. */
            for (const file of [...this.watch.keys()]) if (!files.includes(file)) this.watch.delete(file);
            for (const file of files){
                const t = this.read(file);
                if (!t || t.done){ this.watch.delete(file); continue; }
                const w = this.watch.get(file) ?? {};
                this.watch.set(file, Object.assign(w, { owner: t.owner, card: t.card }));
                if (t.escalated || this.queued_revive(file)) continue;
                const live = this.agents.live.get(t.owner), alive = live && live.state !== "stopped";
                const s = this.seen.get(t.owner), last = s?.at ?? (alive ? this.booted : t.mtime);
                if (w.check_at){
                    if (now - w.check_at >= this.silent_ms) await this.triage(file, t, w, "it did not answer the status check");
                    continue;
                }
                if (now - last < this.silent_ms * 2 ** Math.min(w.answered ?? 0, 4)) continue;
                if (this.children(t.owner).length) continue;   // waiting on its own children; their results wake it
                if (!alive){ await this.triage(file, t, w, live?.last_error ? `its session failed: ${live.last_error}` : "its agent is not running"); continue; }
                if (s?.tool_at){   // never interrupt a tool: note it, and escalate only a tool stuck 3x the silence
                    const min = Math.round((now - s.tool_at) / 60000);
                    if (now - s.tool_at >= 3 * this.silent_ms) await this.escalate(file, t, `${t.owner} has been inside one tool call for ${min} min`);
                    else if (w.told !== "tool"){ w.told = "tool"; await this.log(file, "mid-tool", `${t.owner} is mid-tool; left alone`); }
                    continue;
                }
                try { this.agents.send(t.owner, CHECK, { from: FROM }); w.check_at = now; await this.log(file, "check", `status check sent to ${t.owner}`); }
                catch (e){ await this.triage(file, t, w, `the status check could not be sent: ${e.message || e}`); }
            }
            await this.gate_sweep(now);
            await this.drain(now);
            if (!process.env.SERVEX_NO_BUDGET) await this.budgets().sweep().catch(e => this.servex.say?.(`budget: ${e.message || e}`));
        } finally { this.busy = false; }
    }

    files(){
        const out = new Set(this.servex.task_loop?.find_task_files() ?? []);
        /* A RESUMED agent has no `task` spec: its task dir is on its registry row (kept for the same
         * session), so a resumed task mastermind's own task is watched and budgeted too (cards-and-logs, 09-30). */
        let rows = {}; try { rows = this.agents.reg?.().read() ?? {}; } catch {}
        for (const a of this.agents.live.values()){
            const dir = a.task?.dir ?? (a.state !== "stopped" ? rows[a.id]?.task_dir : null);
            if (dir) out.add(path.join(dir, "task.jsonl"));
        }
        /* ONE ROW PER TASK: the task loop gives absolute paths, an agent's task.dir is often
         * repo-relative, so the same file came in twice (mastermind-servex-9, 2026-09-30). */
        const one = new Map();
        for (const f of out){ const abs = path.resolve(f); const key = abs.toLowerCase(); if (!one.has(key) && fs.existsSync(abs)) one.set(key, abs); }
        return [...one.values()];
    }

    /* Line 1 names the owner and the opt-in; every assign merged says landed,
     * closed or paused; this loop's own `heartbeat` lines count its revives. */
    read(file){
        let text, first, state = {}, revives = [], escalated = false;
        try { text = fs.readFileSync(file, "utf8"); } catch { return null; }
        for (const raw of text.split("\n")){
            let o; try { o = raw.trim() && JSON.parse(raw); } catch {}
            if (!o) continue;
            if (o.assign){ first ??= o.assign; Object.assign(state, o.assign); }
            if (o.log?.heartbeat === "revive") revives.push(Date.parse(o.log.at));
            if (o.log?.heartbeat === "escalated") escalated = true;
        }
        if (!this.opted_in(first)) return null;
        /* The LATEST assign's agent owns it (a fresh session that took the task over writes its own
         * assign line), then that id's resumed successor, if any (Agents.successor, 2026-09-30). */
        const named = state.agent ?? first.agent ?? this.agents.registry_list().find(r => r.session_id && r.session_id === (state.session_id ?? first.session_id))?.id;
        const owner = named && (this.agents.successor?.(named) ?? named);
        if (!owner) return null;
        // the OWNER's session: its registry row first, so a revive never resumes line 1's old session under a new id
        const session_id = this.agents.reg?.().read()?.[owner]?.session_id ?? state.session_id ?? first.session_id;
        const done = (!!state.landed_at && !!String(state.outcome ?? "").trim()) || !!state.closed_by;
        return { owner, session_id, card: state.card, paused: !!state.paused, done, escalated, revives,
            mtime: fs.statSync(file).mtimeMs, slug: this.servex.task_loop?.slug(file) ?? path.basename(path.dirname(file)) };
    }

    /* The task dir whose log names this agent (any assign's `agent`, or line 1's
     * session id), among today's and yesterday's tasks. Only the revive guard
     * calls it, and only for a stopped agent about to be reopened. */
    find_task_dir(row){
        for (const file of this.servex.task_loop?.find_task_files() ?? []){
            let text; try { text = fs.readFileSync(file, "utf8"); } catch { continue; }
            if (text.includes(`"agent":"${row.id}"`) || (row.session_id && text.includes(`"session_id":"${row.session_id}"`))) return path.dirname(file);
        }
        return null;
    }

    children(id){
        const up = p => p && (this.agents.successor?.(p) ?? p);   // a child spawned before a resume names the old id
        return [...[...this.agents.live.values()].filter(a => up(a.parent) === id && a.state !== "stopped"),
            ...(this.servex.queue ?? []).filter(e => up(e.spec.parent) === id)];
    }

    /* ── triage: find why, fix it, escalate only when the fix fails ─── */

    async triage(file, t, w, why){
        w.check_at = null;
        const held = (this.servex.queue ?? []).find(e => e.spec.id === t.owner);
        const once = async (kind, msg) => { if (w.told === kind) return; w.told = kind; await this.log(file, kind, msg); if (t.card) await this.post(t.card, msg); };
        if (held) return once("queued", `${t.owner} ${why}: it is queued at the spawn gate (${held.reason}).`);
        if (t.paused) return once("paused", `${t.owner} ${why}, but the task is paused; not revived.`);
        const by = this.stopped_by.get(t.owner);
        if (by) return once("deliberate", `${t.owner} ${why}: it was stopped on purpose by ${by.by} at ${by.at}; not revived.`);
        const row = this.agents.reg().read()[t.owner], no = row && this.agents.blocked?.({ task_dir: path.dirname(file), ...row });
        if (no) return once(no.why === "cwd-gone" ? "orphaned" : "deliberate", `${t.owner} ${why}: ${no.text}; not revived.`);
        const hour = t.revives.filter(x => Date.now() - x < 3600000).length, day = t.revives.filter(x => Date.now() - x < 86400000).length;
        if (hour >= 2 || day >= 5) return this.escalate(file, t, `${t.owner} ${why}, and was already revived ${hour} times this hour (${day} today)`);
        this.enqueue({ file, owner: t.owner, session_id: t.session_id, why });
        await this.log(file, "revive-queued", `${t.owner} ${why}; a revive is queued`);
    }

    /* The revive queue is a file, drained one every `revive_gap_ms`, and only
     * while the spawn gate would admit — a revive counts toward the cap. */
    jobs(){ try { return JSON.parse(fs.readFileSync(this.queue_file, "utf8")); } catch { return []; } }
    save(jobs){ fs.writeFileSync(this.queue_file, JSON.stringify(jobs, null, 1)); }
    enqueue(job){ const jobs = this.jobs(); if (!jobs.some(j => j.file === job.file)) this.save([...jobs, { ...job, at: stamp() }]); }
    queued_revive(file){ return this.jobs().some(j => j.file === file); }

    async drain(now){
        const jobs = this.jobs();
        if (!jobs.length || now - this.last_revive < this.revive_gap_ms) return;
        if (this.servex.admit?.({ role: "task-mastermind" })) return;   // the gate says wait; the file keeps it
        const job = jobs.shift();
        this.save(jobs);
        this.last_revive = now;
        const t = this.read(job.file), w = this.watch.get(job.file);
        if (!t || t.done || !w) return;
        const dir = path.dirname(job.file), unread = this.inbox(dir);
        const text = `Servex heartbeat: your task ${t.slug} is still open and ${job.why}. ${CHECK}`
            + (unread ? `\n\nWhile you were away, your children reported (from ${path.join(dir, "inbox.jsonl")}):\n${unread}` : "");
        try {
            // a registry row is woken by send(); a task whose agent left no row is resumed from line 1's session id
            if (this.agents.live.has(t.owner) || this.agents.reg().read()[t.owner]) this.agents.send(t.owner, text, { from: FROM });
            else this.agents.reopen({ id: t.owner, session_id: t.session_id }).send(text, { from: FROM });
            w.check_at = Date.now(); w.told = null;
            await this.log(job.file, "revive", `revived ${t.owner} from session ${t.session_id}${unread ? ", with its unread inbox" : ""}`);
            if (t.card) await this.post(t.card, `${t.owner} ${job.why}; Servex revived it and asked where it is at.`);
        } catch (e){ await this.escalate(job.file, t, `${t.owner} ${job.why}, and the revive failed: ${e.message || e}`); }
    }

    /* Unread lines of a task's inbox.jsonl (Agents.wake_parent writes them), then marked read. */
    inbox(dir){
        const file = path.join(dir, "inbox.jsonl");
        let lines; try { lines = fs.readFileSync(file, "utf8").split("\n").flatMap(l => { try { return l.trim() ? [JSON.parse(l)] : []; } catch { return []; } }); } catch { return ""; }
        const from = lines.findLastIndex(l => l.read_upto !== undefined) + 1, unread = lines.slice(from).filter(l => l.text !== undefined);
        if (!unread.length) return "";
        fs.appendFileSync(file, JSON.stringify({ read_upto: lines.length, at: stamp(), by: FROM }) + "\n");
        return unread.map(l => `- ${l.from} (${l.kind}, ${l.at}): ${String(l.text).slice(0, 300)}`).join("\n");
    }

    /* The same door TaskLoop.escalate() uses: card_ask when registered, else a card message. */
    async escalate(file, t, why){
        await this.log(file, "escalated", why);
        if (t.card) await this.post(t.card, `${why.replace(/\.+$/, "")}. Servex could not fix it; please look.`, true);
    }

    async post(card, text, ask){
        const h = this.servex.mcp?.handlers, a = ask && h?.get("card_ask"), ctx = { caller: FROM };
        try {
            return a ? await a({ card, question: text, options: ["look into it", "close it"] }, ctx)
                : h?.get("card_reply") ? await h.get("card_reply")({ card, text }, ctx)
                : await this.servex.assistant?.card_reply({ card, from: FROM, text });
        } catch (e){ this.servex.say?.(`heartbeat: card ${card} not posted: ${e.message || e}`); }
    }

    log(file, kind, msg){
        return this.servex.task_loop.write_line(file, { log: { at: stamp(), heartbeat: kind, msg } });
    }

    /* ── a minion stuck at the spawn gate: its parent hears, once ───── */

    async gate_sweep(now){
        const q = this.servex.queue ?? [];
        for (const e of q) if (!this.gate.has(e.spec)) this.gate.set(e.spec, { at: Date.parse(e.at) || now });
        for (const [spec, g] of this.gate){
            const entry = q.find(e => e.spec === spec);
            if (entry) g.reason = entry.reason;
            if (!entry && (this.admitted.has(spec) || g.told || !spec.parent)){ this.gate.delete(spec); continue; }
            if (g.told || !spec.parent || (entry && now - g.at < this.silent_ms)) continue;
            g.told = true;
            const who = spec.id ?? spec.name ?? spec.role ?? "a minion", min = Math.round((now - g.at) / 6000) / 10;
            const text = entry ? `${who} has been waiting ${min} min at the spawn gate and has not started: ${g.reason}.`
                : `${who} was dropped from the spawn queue without ever starting, after ${min} min: ${g.reason}.`;
            try { this.agents.send(spec.parent, text, { from: FROM }); this.servex.say?.(`heartbeat: told ${spec.parent}: ${text}`); }
            catch (e){ this.servex.say?.(`heartbeat: could not tell ${spec.parent} about ${who}: ${e.message || e}`); }
        }
    }

    status(){
        const now = Date.now(), c = this.agents.counts?.();
        return {
            /* the working cap (Agents.working): "working 3/5", plus how many sleep without a process */
            working: c ? `working ${c.working}/${c.cap}` : null, idle: c?.idle ?? null, dormant: c?.dormant ?? null,
            silent_min: this.silent_ms / 60000,
            /* Only tasks whose owner is running or dormant, or has a check or revive pending: a
             * stopped owner's old task is not news (30 of 58 rows were, 2026-09-30). */
            tasks: [...this.watch].filter(([file, w]) => (a => a && a.state !== "stopped")(this.agents.live.get(w.owner)) || w.check_at || this.queued_revive(file))
                .map(([file, w]) => ({ task: this.servex.task_loop?.slug(file), owner: w.owner,
                state: this.agents.live.get(w.owner)?.state ?? "not running",
                silent_s: this.seen.get(w.owner) ? Math.round((now - this.seen.get(w.owner).at) / 1000) : null,
                mid_tool: !!this.seen.get(w.owner)?.tool_at, check_pending: !!w.check_at, answered: w.answered ?? 0 })),
            gate: [...this.gate].map(([spec, g]) => ({ who: spec.id ?? spec.name ?? spec.role, parent: spec.parent ?? null,
                waited_s: Math.round((now - g.at) / 1000), told: !!g.told })),
            revives_queued: this.jobs().length
        };
    }
}
