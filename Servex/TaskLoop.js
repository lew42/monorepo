import fs from "fs";
import SessionRecord from "../Server/SessionRecord.mjs";
import path from "path";
import { spawn, execFile } from "child_process";
import { stamp } from "./home.js";
import { CHECK } from "./Heartbeat.js";
import Steps from "../Server/Steps.mjs";
import TaskDirs from "../Server/TaskDirs.mjs";
import Task from "../public/framework/core/Task/Task.js";

/* THE TASK LOOP — nobody should have to remember to land a task.
 *
 * Design: public/framework/ai/sessions/2026/09/28/cards/skills-as-a-workflow-tasks-chased-by-nod/design.md
 * Interfaces shared with waiting-on-you and recursive-pairs:
 *   public/framework/ai/sessions/2026/09/28/task-loop/task-loop/interfaces.md
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
        this.quiet_min ??= Number(process.env.SERVEX_TASKLOOP_QUIET_MIN) || 5;     // a started task with no new line this long gets a status ask (and again this often)
        this.asks_before_flag ??= 3;                                                // asks in a row with no new line, then one red flag
        this.reflag_min ??= 60;                                                     // and one more flag this often while it stays silent
        this.clock ??= () => Date.now();                                            // a test passes a fake one
        this.max_escalations ??= 5;
        this.followup_min ??= Number(process.env.SERVEX_TASKLOOP_FOLLOWUP_MIN) || 120;   // a task waiting on the owner: first reminder after this
        this.followup_again_min ??= 24 * 60;                                              // then one more this often
        this.root ??= process.cwd();
        this.queues = new Map();      // task.jsonl path -> write chain, one writer per file
        this.totals = { chased: 0, escalated: 0, nudged: 0 };
        this.status_now = { open: 0, quiet: 0, chased: 0, escalated: 0, nudged: 0, last_tick: null };
        this.first_run = false;
    }

    start(){
        this.timer = setInterval(() => this.tick().catch(e =>
            this.servex?.log?.append("servex", { type: "task-loop-error", error: String(e?.message || e) }).catch(() => {})), this.every_min * 60000);
        this.timer.unref();
        // /framework/ai/tasks/ tails index.jsonl: its writer is a child of Servex (a snapshot blocks ~100 ms), so it restarts with Servex; the newest watcher wins its lock
        this.watch_state();
        return this;
    }

    /* A child spawned once and never checked is a view nobody refreshes (2026-10-20: the watcher died at a restart and the
     * Inbox sat 30 min stale). So it is respawned when it exits, at most once a minute; stop() ends that. */
    watch_state(){
        const watcher = path.join(this.root, "Server", "AIIndex.mjs");
        if (this.stopping || process.env.SERVEX_NO_TASKSTATE || !fs.existsSync(watcher)) return;
        this.state_started = Date.now();
        try {
            this.state_watch = spawn(process.execPath, [watcher, "--watch"], { stdio: "ignore", windowsHide: true });
            this.state_watch.on("error", () => {});
            this.state_watch.on("exit", code => {
                if (this.stopping) return;
                this.servex?.log?.append("servex", { type: "taskstate-exit", code, respawn: true }).catch(() => {});
                const wait = Math.max(0, 60000 - (Date.now() - this.state_started));
                (this.state_timer = setTimeout(() => this.watch_state(), wait)).unref?.();
            });
        } catch {}
    }

    stop(){ this.stopping = true; clearInterval(this.timer); clearTimeout(this.state_timer); try { this.state_watch?.kill(); } catch {} }
    status(){ return this.status_now; }

    /* ── one tick ─────────────────────────────────────────────────────── */

    async tick(){
        if (this.busy) return;
        this.busy = true;
        try {
            // worktree-down, 2026-09-29: a landed+merged task's dev server goes down (Server/worktree-sweep.mjs), hidden child so it never blocks this tick.
            try { spawn(process.execPath, [path.join(this.root, "Server", "worktree-sweep.mjs")], { detached: true, stdio: "ignore", windowsHide: true }).unref(); } catch {}
            this.follow_up_daily();
            this.handover_daily();
            this.undone_asks_daily();
            await this.servex.process_runner?.tick().catch(() => {});   // every process moves on, or resumes after a restart (ProcessRunner)
            await this.servex.respawn?.tick().catch(() => {});   // a standing agent a day old and not busy gets a fresh session (agents/Respawn.js)
            await this.servex.prompt_tasks?.sweep().catch(() => {});   // an approved prompt task that names a module moves home (agents/PromptTasks.js)
            const now = this.clock(), registry = this.servex.agents.registry_list();
            let open = 0, quiet = 0, escalations = 0;

            for (const file of this.find_task_files()){
                const info = this.read_task(file);
                if (!info) continue;
                if (info.queued && !info.spawned) await this.launch(file).catch(() => {});   // the retry for a task the slot check held back (templates.md)
                // task-replay, 2026-10-16: the state comes from Task.replay. Only `running` is chased; waiting-on-owner gets reminders; the rest are left alone.
                if (info.task_state === "waiting"){
                    if (info.waiting_on === "owner" && this.servex.heartbeat?.opted_in(info.state)) await this.follow_up(file, info, registry, now);
                    continue;
                }
                if (info.task_state !== "running") continue;
                open++;

                // step-runner, 2026-10-12: a step past 2x its estimate gets ONE nudge, independent of the status ask below.
                await this.nudge_step(file, info.state, registry, now);
                // the quiet clock starts at the file's last write, or, when the last line is our own ask/flag, at that line
                const ref = info.last_line_ours ? Math.max(info.last_ask_at, info.last_flag_at) : fs.statSync(file).mtimeMs;
                if (now - ref >= this.quiet_min * 60000) quiet++;
                if (await this.chase(file, info, registry, now, ref, escalations < this.max_escalations)) escalations++;
            }

            this.status_now = { open, quiet, chased: this.totals.chased, escalated: this.totals.escalated, nudged: this.totals.nudged, last_tick: stamp() };
            if (!this.first_run){
                this.first_run = true;
                this.servex.say(`task-loop: first run, ${open} open tasks today (${quiet} quiet)`);
            }
        } finally { this.busy = false; }
    }

    /* follow-up-daily, 2026-10-13: once per local day, run Server/StaleClose.mjs --apply, then Server/FollowUp.mjs --write (what fell through the cracks) and post ONE owner_note row for the day.
     * "Done today" = follow-up.md's mtime is today, so a restart never repeats it. LogSweeper (ALLOW) commits the two files. Doc: Servex/doc/task-loop.md */
    follow_up_daily(){
        const file = path.join(this.root, "public", "framework", "ai", "doc", "follow-up.md");
        let m = 0; try { m = fs.statSync(file).mtimeMs; } catch {}
        const day = this.date_id(new Date());
        if (this.date_id(new Date(m)) === day || this.follow_up_busy) return;
        this.follow_up_busy = true;
        const run = (script, args, done) => execFile(process.execPath, [path.join(this.root, "Server", script), ...args], { cwd: this.root, windowsHide: true, timeout: 120000 }, done);
        // the step before it, 2026-10-18: StaleClose --apply stops the stale tasks silent over StaleClose.HOURS, so the follow-up does not list them (Server/doc/stale-close.md)
        // and the links backfill (review fix 1): every task / child-session folder gets its reference on its parent log, so no hand step (Server/SessionRecord.mjs apply_links)
        try { const n = new SessionRecord({ root: this.root }).apply_links().applied; if (n) console.log(`[task-loop] session links backfilled: ${n}`); } catch (e){ console.warn("[task-loop] session links backfill failed:", e); }
        run("StaleClose.mjs", ["--apply"], () => run("FollowUp.mjs", ["--write"], (err, out) => {
            this.follow_up_busy = false;
            if (err) return this.servex?.log?.append("servex", { type: "task-loop-error", error: "follow-up: " + String(err.message || err) }).catch(() => {});
            const c = (out.match(/\{[\s\S]*?\}/) || [""])[0]; let n = {}; try { n = JSON.parse(c.replace(/'/g, "").replace(/([\w-]+):/g, '"$1":')); } catch {}
            const flagged = ["unmerged", "merged-not-landed", "quiet", "no-outcome", "asks"].reduce((t, k) => t + (n[k] || 0), 0);
            this.servex?.cards?.owner_note?.({ title: `Follow-up ${day}: ${flagged} flagged`, text: `${flagged} rows fell through today (${n.healthy ?? "?"} healthy): see the list`, kind: "risk", links: ["/framework/ai/doc/follow-up.md"], by: "task-loop" })?.catch?.(() => {});
        }));
    }

    /* handover-daily, 2026-10-17: once per UTC day, run Server/HandoverNow.mjs --write so the NOW block at the top of handover.md stays computed.
     * "Done today" = the date in the block's own "computed <date>" stamp (the file is hand-edited too, so its mtime says nothing); a restart never repeats it.
     * LogSweeper (ALLOW) commits handover.md. Doc: Servex/doc/task-loop.md */
    handover_daily(){
        const file = path.join(this.root, "public", "framework", "ai", "handover.md");
        let text = ""; try { text = fs.readFileSync(file, "utf8"); } catch { return; }
        const done = (text.match(/## NOW \(computed (\d{4}-\d{2}-\d{2})/) || [])[1];
        if (done === new Date().toISOString().slice(0, 10) || this.handover_busy) return;
        this.handover_busy = true;
        execFile(process.execPath, [path.join(this.root, "Server", "HandoverNow.mjs"), "--write"], { cwd: this.root, windowsHide: true, timeout: 120000 }, err => {
            this.handover_busy = false;
            if (err) this.servex?.log?.append("servex", { type: "task-loop-error", error: "handover-now: " + String(err.message || err) }).catch(() => {});
        });
    }

    /* undone-asks-daily, 2026-10-17: once per UTC day (the date in undone.json's own generated_at is not today) run Server/UndoneAsks.mjs --json.
     * LogSweeper (ALLOW) commits undone.json. Doc: public/framework/ai/asks/readme.md */
    undone_asks_daily(){
        const file = path.join(this.root, "public", "framework", "ai", "asks", "undone.json");
        let at = ""; try { at = JSON.parse(fs.readFileSync(file, "utf8")).generated_at ?? ""; } catch {}
        if (at.slice(0, 10) === new Date().toISOString().slice(0, 10) || this.undone_busy) return;
        this.undone_busy = true;
        execFile(process.execPath, [path.join(this.root, "Server", "UndoneAsks.mjs"), "--json"], { cwd: this.root, windowsHide: true, timeout: 120000 }, err => {
            this.undone_busy = false;
            if (err) this.servex?.log?.append("servex", { type: "task-loop-error", error: "undone-asks: " + String(err.message || err) }).catch(() => {});
        });
    }

    /* ── finding tasks ────────────────────────────────────────────────── */

    /* The sessions store (ai/sessions/YYYY/MM/DD/..., Server/TaskDirs.mjs) PLUS the old ai/YYYY-MM-DD/ walk, de-duplicated. */
    find_task_files(){
        const today = new Date(), out = [];
        try { for (const t of TaskDirs.list(2)) out.push((SessionRecord.log_file(t.dir) ?? path.join(t.dir, "task.jsonl"))); } catch {}
        for (const d of [today, new Date(today.getTime() - 86400000)])
            this.walk(path.join(this.root, "public", "framework", "ai", this.date_id(d)), out);
        return [...new Set(out.map(f => path.resolve(f)))];
    }

    walk(dir, out){
        let entries;
        try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
        for (const e of entries){
            if (e.name.startsWith(".") || e.name === "node_modules") continue;
            const p = path.join(dir, e.name);
            if (e.isDirectory()) this.walk(p, out);
            else if (SessionRecord.is_log_entry(dir, e.name)) out.push(p);
        }
    }

    date_id(d){
        const pad = n => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    /* The file replayed through Task.replay: `task_state` is the Task's state (running = chased as always; a file with no state line
     * maps legacy landed/closed/open, see core/Task/readme.md). `state` is the merged data (latest field wins, `session_id` kept) that
     * the owner and opt-in checks read. Plus what this loop's own `chase` and `follow_up` lines say, read back so a restart loses no count. */
    read_task(file){
        let text;
        try { text = fs.readFileSync(file, "utf8"); } catch { return null; }
        const lines = [], follow_ups = [];
        let spawned = false, queued = false;
        // chase state, all on the log (a restart keeps it): `log.ask:n` and `log.flag:n` are ours; ANY other line resets the count
        let asks = 0, last_ask_at = 0, last_flag_at = 0, flagged = false, last_line_ours = false, blocked = false;
        for (const raw of text.split("\n")){
            if (!raw.trim()) continue;
            let obj; try { obj = JSON.parse(raw); } catch { continue; }
            lines.push(obj);
            if (obj.follow_up) follow_ups.push(obj.follow_up);
            if (obj.spawn) spawned = true;
            if (obj.queue) queued = true;
            if (obj.follow_up || obj.log?.nudge !== undefined) continue;   // our own reminder lines are neither activity nor an ask
            const ours = obj.log && (obj.log.ask !== undefined || obj.log.flag !== undefined);
            last_line_ours = !!ours;
            if (ours){
                const at = Date.parse(obj.log.at) || 0;
                if (obj.log.ask !== undefined){ asks++; last_ask_at = at; }
                else { flagged = true; last_flag_at = at; }
            } else {
                asks = 0; flagged = false; last_ask_at = last_flag_at = 0;
                blocked = this.says_blocked(obj);
            }
        }
        const task = Task.replay(lines), d = task.data;
        // `agent` is a spawn config (an object, templates.md) on a templated task but an agent id (a string) everywhere else: the readers below want the id.
        const cfg = d.agent && typeof d.agent === "object" ? d.agent : null;
        const state = { ...d, ...(cfg ? { agent: undefined } : {}), ...(d.session !== undefined ? { session_id: d.session } : {}) };
        const since = Date.parse(d.waiting_since) || 0;
        const mine = follow_ups.filter(f => (Date.parse(f.at) || 0) >= since);   // a later wait starts a fresh count
        const landed = task.state === "complete", closed = task.state === "stopped";
        return { state, task_state: task.state, waiting_on: d.waiting_on ?? null, waiting_since: d.waiting_since ?? null, waiting_what: d.waiting_what ?? null,
            parent_task: lines.find(l => l.assign)?.assign?.parent_task ?? null,
            agent_cfg: cfg, template: d.template ?? null, first_by: lines[0]?.by ?? null, approved_by: d.approved_by ?? lines.findLast(l => l.approve)?.by ?? null, spawned, queued,
            follow_ups: mine, asks, last_ask_at, last_flag_at, flagged, last_line_ours, blocked, landed, closed };
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


    /* templates.md, first slice: an APPROVED task whose line 1 carries `agent: {role, model, effort, brief}` starts that agent itself. The
     * item tool calls this right after it writes `approve`; the tick calls it again for a task that has a `queue` line and no `spawn` line.
     * Does nothing unless the task is `running`, has an `agent` config and no `spawn` line, so an old task behaves exactly as before.
     * Every id and time in the `spawn` line is read from node (the spawned agent, the files), never typed. */
    async launch(file){
        file = path.resolve(file);
        if (this.launching?.has(file)) return { ok: false, why: "already launching" };
        (this.launching ??= new Set()).add(file);
        try {
            const info = this.read_task(file);
            if (!info?.agent_cfg || !["running", "idle"].includes(info.task_state) || info.spawned) return { ok: false, why: "nothing to launch" };
            const dir = path.dirname(file), cfg = info.agent_cfg, tpl = Task.TEMPLATES[info.template] ?? {};
            // the slot check first, so a queued task does not rerun PastWork on every tick while the machine stays hot
            const hot = this.servex.monitor?.flag?.reason;
            if (hot){
                if (!info.queued) await this.write_line(file, { queue: { at: stamp(), why: hot } });
                return { ok: false, queued: true, why: hot };
            }
            // what already exists on this topic, beside the brief (skipped quietly when the script is absent)
            const past = path.join(this.root, "Server", "PastWork.mjs");
            if (fs.existsSync(past)) await new Promise(done => execFile(process.execPath, [past, "--task", dir], { cwd: this.root, windowsHide: true, timeout: 60000 }, () => done()));
            const registry = this.servex.agents.registry_list();
            const parent = info.first_by && registry.some(r => r.id === info.first_by && r.state !== "stopped" && r.state !== "gone") ? info.first_by : undefined;
            const spec = {
                role: cfg.role ?? "minion",
                model: cfg.model ?? tpl.model, effort: cfg.effort, permission_mode: cfg.permission_mode ?? tpl.permission_mode,
                prompt: cfg.prompt ?? `Your brief is at ${cfg.brief}. Work and land it as the brief says.`,
                task: { dir: this.relative(dir), brief: cfg.brief },
                ...(parent ? { parent } : {}),
            };
            for (const k of Object.keys(spec)) if (spec[k] === undefined) delete spec[k];
            const agent = this.servex.agents.spawn(spec);
            await this.write_line(file, { spawn: { at: stamp(), agent: agent.id, session_id: agent.session_id ?? null, by: "TaskLoop", author: info.first_by, approved_by: info.approved_by } });
            return { ok: true, agent: agent.id };
        } catch (e){
            this.servex.say?.(`task-loop: launch failed for ${this.slug(file)}: ${e.message || e}`);
            return { ok: false, why: String(e.message || e) };
        } finally { this.launching.delete(file); }
    }

    /* ── acting ───────────────────────────────────────────────────────── */

    /* THE CHASE (resolution.md section 8). Every STARTED (running) task, no opt-in. Quiet for `quiet_min` minutes: send its agent ONE status ask
     * (title and path, add a line or complete/stop it); again every `quiet_min` while silent. After `asks_before_flag` asks with no new line,
     * or when its last line says it is blocked: ONE red flag card, then one more per `reflag_min` while it stays silent. The counts are the
     * `log.ask` / `log.flag` lines on the task's own log, so a restart loses nothing; any other new line resets them. `flag_ok` caps flags per tick.
     * Returns true when it flagged. Heartbeat (Heartbeat.js) also asks a quiet agent; this skips an agent Heartbeat has an open check for. */
    async chase(file, info, registry, now, ref, flag_ok = true){
        const quiet = now - ref >= this.quiet_min * 60000;
        const stuck = info.asks >= this.asks_before_flag && quiet;   // the third ask sat unanswered for another quiet period
        if (info.blocked && !info.flagged) return flag_ok && await this.flag(file, info, "its last line says it is blocked", now);
        if (info.flagged){
            if (now - info.last_flag_at >= this.reflag_min * 60000 && quiet) return flag_ok && await this.flag(file, info, `still no new line on its log`, now);
            return false;
        }
        if (stuck) return flag_ok && await this.flag(file, info, `${info.asks} status asks went unanswered`, now);
        if (!quiet) return false;
        const id = this.owning_agent_id(info.state, registry);
        if (id && this.servex.heartbeat?.watch?.get?.(path.resolve(file))?.check_at) return false;   // Heartbeat's own check is already out; it triages the silence
        const mins = Math.round((now - ref) / 60000), slug = this.slug(file);
        const text = `Task ${slug} (${this.relative(path.dirname(file))}${info.state.title ? `, "${info.state.title}"` : ""}): no line on your log for ${mins} min. Add a line with where you are, or complete or stop it.`;
        let woke;
        if (!id) woke = "could not ask: no owning agent found";
        else if (this.servex.agents.stopped_on_purpose?.(id)) woke = `${id} was stopped on purpose; not woken`;
        else try { this.servex.agents.send(id, text, { from: "servex-task-loop" }); woke = `asked ${id}`; }   // send() wakes an agent that is not live, the usual way
        catch (e){ woke = `could not ask: ${e.message || e}`; }
        await this.write_line(file, { log: { at: this.at(now), msg: `task-loop status ask ${info.asks + 1}: ${woke}`, ask: info.asks + 1 } });
        this.totals.chased++;
        return false;
    }

    /* The Step runner's nudge (Server/Steps.mjs): the current step ran past 2x its estimate and the owning agent is live. Once per step. */
    async nudge_step(file, state, registry, now){
        const due = Steps.overdue(Steps.read(file), now);
        if (!due) return;
        const id = this.owning_agent_id(state, registry);
        if (!id || this.agent_gone(state, registry)) return;
        const text = `You were on step ${due.n} (${due.do}, ${due.min} min) since ${this.at(now - due.since_ms)}. Is it done? If you are further along, log {"assign":{"step":<the step you are on>,"at":"NOW"}}; if not, say what is holding it.`;
        try { this.servex.agents.send(id, text, { from: "servex-step-runner" }); } catch { return; }
        await this.write_line(file, { log: { at: stamp(), msg: `step-runner nudge: step ${due.n}`, nudge: due.n } });
        try { await this.servex.log?.append("steps", { type: "nudge", task: this.slug(file), step: due.n, agent: id }); } catch {}
        this.totals.nudged++;
    }

    /* task-replay, 2026-10-16: a task waiting on the OWNER is reminded, never chased. After `followup_min` from waiting_since one
     * reminder, then one every 24 h; each is a `follow_up` line in the file, read back next tick. It goes to the parent task's agent
     * (line 1 `parent_task`, else the owning agent), never revives a stopped one, and also rides the escalation card path. */
    async follow_up(file, info, registry, now){
        const n = info.follow_ups.length, since = Date.parse(info.waiting_since) || now;
        const last = n ? Math.max(...info.follow_ups.map(f => Date.parse(f.at) || 0)) : since;
        if (now - last < (n ? this.followup_again_min : this.followup_min) * 60000) return;
        const to = this.parent_agent(info, registry);
        const text = `Task ${this.slug(file)} is waiting on the owner since ${this.at(since)}: ${info.waiting_what ?? "(no reason given)"}.`;
        if (to && !this.agent_gone({ agent: to }, registry)){
            try { this.servex.agents.send(to, text, { from: "servex-task-loop" }); } catch {}
        }
        await this.post_card(file, info, text);
        await this.write_line(file, { follow_up: { n: n + 1, to: to ?? null, at: stamp() } });
        this.totals.followed = (this.totals.followed ?? 0) + 1;
    }

    /* The agent of the parent task (its task.jsonl, found from root or the sessions store), else this task's owning agent. */
    parent_agent(info, registry){
        const p = info.parent_task;
        if (p){
            for (const base of [this.root, path.join(this.root, "public", "framework", "ai"), path.join(this.root, "public", "framework", "ai", "sessions")]){
                const pd = path.isAbsolute(p) ? p : path.join(base, p), f = SessionRecord.log_file(pd) ?? path.join(pd, "task.jsonl"), up = this.read_task(f);
                const id = up && this.owning_agent_id(up.state, registry);
                if (id) return id;
            }
        }
        return this.owning_agent_id(info.state, registry);
    }

    /* The red flag: the card path TaskLoop already used (card_ask when it exists, else a plain card message, else the Inbox). */
    async flag(file, info, why, now){
        const n = (info.flagged ? 1 : 0) + 1;
        const question = `${this.slug(file)} is started but silent: ${why}. Close it, or keep chasing?`;
        const said = await this.post_card(file, info, question, ["close it", "keep chasing"]);
        await this.write_line(file, { log: { at: this.at(now), msg: `task-loop red flag: ${String(said).slice(0, 200)}`, flag: n } });
        this.totals.escalated++;
        return true;
    }

    /* A line from the agent that says it is stuck: `blocked` as a key, or a log message that starts "blocked". */
    says_blocked(obj){
        return !!(obj.blocked || obj.log?.blocked || /^\s*blocked\b/i.test(String(obj.log?.msg ?? "")));
    }

    /* The one card path: card_ask when it exists (with options), else a plain card message; the Inbox fallback when the card is missing. */
    async post_card(file, info, question, options){
        const card = info.state.card || "live";
        const ask = this.servex.mcp?.handlers?.get("card_ask");
        let said;
        try {
            said = ask
                ? await ask({ card, question, options: options ?? ["noted"], from: info.state.agent }, { caller: "servex-task-loop" })
                : await this.servex.assistant.card_reply({ card, from: "servex-task-loop", text: question });
        } catch (e){ said = `not delivered: ${e.message || e}`; }
        /* NEVER-LOSE-A-WAKE, item 4 (2026-10-01): `card` defaults to "live" when a task names
         * none, but "live" (or whatever it names) can still answer `{ok:false, why:'no card
         * "…"'}` — a card_ask/card_reply never throws for a missing card, it just says so — and
         * that used to be the end of it: logged here, never shown anywhere a person would look.
         * The same Inbox fallback Heartbeat.post() uses now catches it here too. */
        let parsed; try { parsed = typeof said === "string" ? JSON.parse(said) : said; } catch {}
        if (parsed && parsed.ok === false){
            try {
                const out = this.servex.inbox?.drop({ path: path.dirname(file), text: question, from: "servex-task-loop" });
                this.servex.say?.(`task-loop: no card to post to (${parsed.why}) — left a note on ${out?.file ?? path.dirname(file)}`);
            } catch (e){ this.servex.say?.(`task-loop: could not reach the inbox either: ${e.message || e}`); }
        }
        return said;
    }

    /* The only other way a task leaves the loop — the owner's `close_task` tool
     * (Servex.js) calls straight into this. */
    async close_task({ dir, why } = {}){
        if (!dir) return { ok: false, why: "dir is required" };
        const cdir = path.isAbsolute(dir) ? dir : path.join(this.root, dir), file = SessionRecord.log_file(cdir) ?? path.join(cdir, "task.jsonl");
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

    /* Old `.../ai/<date>/<slug...>/task.jsonl`, new `.../ai/sessions/Y/M/D/[session-xxxx/]<slug...>/task.jsonl` -> `<slug...>`, a sub-task included. */
    slug(file){
        const parts = this.relative(file).split("/"), ai = parts.indexOf("ai");
        if (parts[ai + 1] !== "sessions") return parts.slice(ai + 2, -1).join("/");
        let rest = parts.slice(ai + 5, -1);
        if (rest.length > 1 && /^(session-[0-9a-f]+|[0-9a-f]{8}-[0-9a-f-]{27})$/.test(rest[0])) rest = rest.slice(1);
        return rest.join("/");
    }

    /* Local time with its offset, `home.js`'s `stamp()` format for an arbitrary
     * moment (a file's mtime), which `stamp()` itself only ever reads as now. */
    at(ms){
        const d = new Date(ms), off = -d.getTimezoneOffset(), pad = n => String(Math.abs(n)).padStart(2, "0");
        return new Date(d.getTime() + off * 60000).toISOString().slice(0, 19) + (off < 0 ? "-" : "+") + pad(Math.trunc(off / 60)) + ":" + pad(off % 60);
    }
}
