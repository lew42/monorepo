import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { stamp } from "./home.js";
import { CHECK } from "./Heartbeat.js";

/* THE TASK LOOP — nobody should have to remember to land a task.
 *
 * Design: public/framework/ai/2026/09/28/skills-as-a-workflow-tasks-chased-by-nod/design.md
 * Interfaces shared with waiting-on-you and recursive-pairs:
 *   public/framework/ai/2026-09-28/task-loop/interfaces.md
 *
 * Every `every` minutes: walk today's and yesterday's task dirs; for every OPEN
 * task (no `landed_at` with a non-empty `outcome`, and no `closed_by`) — quiet
 * `quiet` minutes, or its owning agent stopped or gone — wake that agent once
 * with the heartbeat's neutral status check (never "land it": the owner,
 * 2026-09-29 — a check must not steer the work), again `gap` minutes later if still open, then
 * escalate: `card_ask` (or, until that tool exists, a plain card message)
 * asking the owner to close it or keep chasing. Escalated = never chased again.
 * Only a landing or `close_task` removes a task from this loop.
 *
 * Shape copied from Monitor.js: a class, `start()`, an unref'd interval, a tick
 * that never throws out of itself. `root` is Servex's own repo root (its REPO),
 * so a worktree's Servex chases the worktree's own tasks. */
export default class TaskLoop {

    constructor(...args){ Object.assign(this, ...args); this.initialize(); }

    initialize(){
        this.every_min ??= Number(process.env.SERVEX_TASKLOOP_EVERY_MIN) || 5;
        this.quiet_min ??= Number(process.env.SERVEX_TASKLOOP_QUIET_MIN) || 20;
        this.gap_min ??= Number(process.env.SERVEX_TASKLOOP_GAP_MIN) || 30;
        this.max_escalations ??= 5;
        this.root ??= process.cwd();
        this.queues = new Map();      // task.jsonl path -> write chain, one writer per file
        this.totals = { chased: 0, escalated: 0 };
        this.status_now = { open: 0, quiet: 0, chased: 0, escalated: 0, last_tick: null };
        this.first_run = false;
    }

    start(){
        this.timer = setInterval(() => this.tick().catch(e =>
            this.servex?.log?.append("servex", { type: "task-loop-error", error: String(e?.message || e) }).catch(() => {})), this.every_min * 60000);
        this.timer.unref();
        return this;
    }

    stop(){ clearInterval(this.timer); }
    status(){ return this.status_now; }

    /* ── one tick ─────────────────────────────────────────────────────── */

    async tick(){
        if (this.busy) return;
        this.busy = true;
        try {
            // worktree-down, 2026-09-29: a landed+merged task's dev server goes down (Server/worktree-sweep.mjs), hidden child so it never blocks this tick.
            try { spawn(process.execPath, [path.join(this.root, "Server", "worktree-sweep.mjs")], { detached: true, stdio: "ignore", windowsHide: true }).unref(); } catch {}
            const now = Date.now(), registry = this.servex.agents.registry_list();
            let open = 0, quiet = 0, escalations = 0;

            for (const file of this.find_task_files()){
                const info = this.read_task(file);
                if (!info || info.landed || info.closed) continue;
                open++;

                const mtime = fs.statSync(file).mtimeMs;
                const quiet_expired = now - mtime >= this.quiet_min * 60000;
                if (quiet_expired) quiet++;
                if (info.escalated) continue;

                const gone = this.agent_gone(info.state, registry);
                const due = !info.last_chase_at || now - Date.parse(info.last_chase_at) >= this.gap_min * 60000;

                if (info.last_chase === 0 && (quiet_expired || gone) && due) await this.chase(file, info, 1, mtime);
                else if (info.last_chase === 1 && due) await this.chase(file, info, 2, mtime);
                else if (info.last_chase >= 2 && due && escalations < this.max_escalations){
                    escalations++;
                    await this.escalate(file, info, mtime);
                }
            }

            this.status_now = { open, quiet, chased: this.totals.chased, escalated: this.totals.escalated, last_tick: stamp() };
            if (!this.first_run){
                this.first_run = true;
                this.servex.say(`task-loop: first run, ${open} open tasks today (${quiet} quiet)`);
            }
        } finally { this.busy = false; }
    }

    /* ── finding tasks ────────────────────────────────────────────────── */

    find_task_files(){
        const today = new Date(), out = [];
        for (const d of [today, new Date(today.getTime() - 86400000)])
            this.walk(path.join(this.root, "public", "framework", "ai", this.date_id(d)), out);
        return out;
    }

    walk(dir, out){
        let entries;
        try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
        for (const e of entries){
            if (e.name.startsWith(".") || e.name === "node_modules") continue;
            const p = path.join(dir, e.name);
            if (e.isDirectory()) this.walk(p, out);
            else if (e.name === "task.jsonl") out.push(p);
        }
    }

    date_id(d){
        const pad = n => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    /* Every `assign` line merged (latest field wins), plus what this loop's own
     * `chase` log lines say about where a task stands, read back from the file
     * itself — so a Servex restart loses no count. */
    read_task(file){
        let text;
        try { text = fs.readFileSync(file, "utf8"); } catch { return null; }
        const state = {};
        let last_chase = 0, last_chase_at = null, escalated = false;
        for (const raw of text.split("\n")){
            if (!raw.trim()) continue;
            let obj; try { obj = JSON.parse(raw); } catch { continue; }
            if (obj.assign && typeof obj.assign === "object") Object.assign(state, obj.assign);
            const chase = obj.log?.chase;
            if (chase === "escalated") escalated = true;
            else if (chase !== undefined){
                const n = Number(chase);
                if (Number.isFinite(n) && n >= last_chase){ last_chase = n; last_chase_at = obj.log.at ?? last_chase_at; }
            }
        }
        const landed = !!state.landed_at && !!String(state.outcome ?? "").trim();
        return { state, last_chase, last_chase_at, escalated, landed, closed: !!state.closed_by };
    }

    /* Line-1 `agent`, else the registry row whose `session_id` matches — the
     * registry mirrors every live agent's fields on every state change, so this
     * is a restart-proof stand-in for "the live agent whose session_id matches". */
    owning_agent_id(state, registry){
        return state.agent || registry.find(r => state.session_id && r.session_id === state.session_id)?.id || null;
    }

    agent_gone(state, registry){
        const id = this.owning_agent_id(state, registry);
        const row = id && registry.find(r => r.id === id);
        return !row || row.state === "stopped" || row.state === "gone";
    }

    /* ── acting ───────────────────────────────────────────────────────── */

    async chase(file, info, n, mtime){
        const id = this.owning_agent_id(info.state, this.servex.agents.registry_list());
        const text = `Task ${this.slug(file)} has been quiet since ${this.at(mtime)}. ${CHECK}`;
        let woke;
        if (id) try { this.servex.agents.send(id, text, { from: "servex-task-loop" }); woke = `woke ${id}`; }
        catch (e){ woke = `could not wake: ${e.message || e}`; }
        else woke = "could not wake: no owning agent found";
        await this.write_line(file, { log: { at: stamp(), msg: `task-loop chase ${n} of 2: ${woke}`, chase: n } });
        this.totals.chased++;
    }

    /* `card_ask` (waiting-on-you) called in-process once it registers a handler
     * on the same MCP door every tool here goes through; a plain card message
     * until then — exactly as interfaces.md agrees. */
    async escalate(file, info, mtime){
        const slug = this.slug(file), card = info.state.card || "live";
        const question = `${slug} has been quiet since ${this.at(mtime)} and did not land after 2 chases. Close it, or keep chasing?`;
        const ask = this.servex.mcp?.handlers?.get("card_ask");
        let said;
        try {
            said = ask
                ? await ask({ card, question, options: ["close it", "keep chasing"], from: info.state.agent }, { caller: "servex-task-loop" })
                : await this.servex.assistant.card_reply({ card, from: "servex-task-loop", text: question });
        } catch (e){ said = `not delivered: ${e.message || e}`; }
        await this.write_line(file, { log: { at: stamp(), msg: `task-loop escalated: ${String(said).slice(0, 200)}`, chase: "escalated" } });
        this.totals.escalated++;
    }

    /* The only other way a task leaves the loop — the owner's `close_task` tool
     * (Servex.js) calls straight into this. */
    async close_task({ dir, why } = {}){
        if (!dir) return { ok: false, why: "dir is required" };
        const file = path.join(path.isAbsolute(dir) ? dir : path.join(this.root, dir), "task.jsonl");
        if (!fs.existsSync(file)) return { ok: false, why: `no task.jsonl at "${dir}"` };
        const at = stamp();
        await this.write_line(file, { assign: { closed_by: "owner", closed_at: at, closed_why: why ?? null } });
        return { ok: true, dir, closed_at: at };
    }

    /* One append at a time per file — a chase and a close_task landing at the
     * same moment can never tear a line, same reason Cards.js and Log.js each
     * keep one queue per file. */
    write_line(file, obj){
        const next = (this.queues.get(file) ?? Promise.resolve()).then(() => fs.promises.appendFile(file, JSON.stringify(obj) + "\n"));
        this.queues.set(file, next.catch(() => {}));
        return next;
    }

    relative(file){ return path.relative(this.root, file).split(path.sep).join("/"); }

    /* `.../ai/<date>/<slug...>/task.jsonl` -> `<slug...>`, a sub-task included. */
    slug(file){
        const parts = this.relative(file).split("/");
        return parts.slice(parts.indexOf("ai") + 2, -1).join("/");
    }

    /* Local time with its offset, `home.js`'s `stamp()` format for an arbitrary
     * moment (a file's mtime), which `stamp()` itself only ever reads as now. */
    at(ms){
        const d = new Date(ms), off = -d.getTimezoneOffset(), pad = n => String(Math.abs(n)).padStart(2, "0");
        return new Date(d.getTime() + off * 60000).toISOString().slice(0, 19) + (off < 0 ? "-" : "+") + pad(Math.trunc(off / 60)) + ":" + pad(off % 60);
    }
}
