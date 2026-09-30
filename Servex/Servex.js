import fs from "fs";
import os from "os";
import net from "net";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import Server from "../Server/Server.js";
import Events from "../Server/Events.js";
import Log from "./Log.js";
import Monitor from "./Monitor.js";
import TaskLoop from "./TaskLoop.js";
import Heartbeat from "./Heartbeat.js";
import Usage from "./Usage.js";
import Pool from "./Pool.js";
import Lifecycle from "./Lifecycle.js";
import Follow from "./Follow.js";
import MCP, { loopback } from "./MCP.js";
import PortRegistry from "./PortRegistry.js";
import Process from "./Process.js";
import Project from "./Project.js";
import ReverseProxy from "./ReverseProxy.js";
import { launch as launch_gate } from "./gate.mjs";
import { place, stamp } from "./home.js";
import Stream from "./Stream.js";
import { Agents } from "./agents/Agents.js";
import Assistant from "./agents/Assistant.js";
import Dispatcher from "./agents/Dispatcher.js";
import Cards from "./cards/Cards.js";
import Layers from "./agents/Layers.js";
import Sessions from "./agents/Sessions.js";
import Global from "./agents/Global.js";
import External from "./agents/External.js";
import agent_tools from "./agents/tools.js";
import { directory_tools } from "./agents/directory.js";
import tidy from "./agents/tidy.js";
import hitl from "./agents/hitl.js";
import Inbox from "./agents/inbox.js";
import { docs_list, docs_read_file } from "./pages.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..");
const SKIP = new Set(["node_modules", "dist", "build", "coverage"]);

const INSTRUCTIONS = `Servex is the always-on process on this machine. It supervises dev servers`
    + ` (and whisper-server), owns every log file as the single writer, and answers here.`
    + ` Claude sessions do NOT start dev servers themselves — call start_server / restart_server /`
    + ` stop_server and read server_logs. A project is any directory under the scan root with a`
    + ` package.json; each one keeps a fixed port forever and is reachable through the proxy at`
    + ` <name>.localhost:<proxy port>, which auto-starts it on the first request. append_log writes`
    + ` one JSON line into a named log through Servex, so two writers can never tear a line.`;

/* SERVEX — the one process that stays up.
 *
 * Five parts, all in one process because there is nothing to gain from more:
 *
 *   dashboard  a Server (the same class every project here uses) serving
 *              Servex/public/ on 127.0.0.1:8090, and carrying /mcp and the
 *              /log routes on its router.
 *   proxy      127.0.0.1:80 — <name>.localhost reaches the project's
 *              own port, and auto-starts it if it is not running. Port 80
 *              itself is held by gate.mjs, a separate process that outlives
 *              Servex and passes bytes on to the proxy on 8079.
 *   ports      name -> port, remembered in %LOCALAPPDATA%/lew42/servex/ports.json.
 *   processes  one supervised child per running server, plus whisper.
 *   agents     every live Claude session, held in memory and steerable over MCP.
 *
 * Start it with `node Servex/index.js` from the repo root. Read
 * Servex/readme.md first — it is one screen. */
export default class Servex extends Events {

    initialize(){
        /* ⚠ Servex died with 0xC0000409 (a native fast-fail) on 2026-09-23, twice,
         * and on 2026-09-24, and left no trace at all. Next time Node writes a report here. */
        process.report.directory = path.dirname(place("logs", "reports", "report.json"));
        process.report.reportOnFatalError = true;
        process.report.reportOnUncaughtException = true;

        this.root ??= "C:/Code";
        this.depth ??= 2;                 // C:/Code/<project> and C:/Code/<org>/<project>
        this.dashboard_port ??= Number(process.env.SERVEX_PORT) || 8090;
        this.proxy_port ??= Number(process.env.SERVEX_PROXY_PORT) || 80;        // what visitors use — the gate's port
        this.proxy_internal ??= Number(process.env.SERVEX_PROXY_INTERNAL) || 8079;  // where the proxy itself listens
        this.gated ??= !process.env.SERVEX_NO_GATE;   // SERVEX_NO_GATE=1: the proxy binds proxy_port itself, as before
        this.bare ??= "servex";           // a nameless `localhost` is the dashboard (the owner, 2026-09-23) — ReverseProxy.name()

        this.projects = [];
        this.processes = new Map();

        this.log = new this.constructor.Log();
        /* THE CREATION LOG AND THE REAPER (lifecycle, 2026-09-29): Agents and Pool call its hooks,
         * the heartbeat's tick runs its sweep (below). Servex/Lifecycle.js, Servex/doc/lifecycle.md. */
        this.lifecycle = new this.constructor.Lifecycle({ servex: this });
        this.ports = new PortRegistry({ reserved: [80, this.dashboard_port, this.proxy_port, this.proxy_internal] });
        this.ports.pin("servex", this.dashboard_port);

        this.dashboard = new this.constructor.Dashboard({ port: this.dashboard_port, servex: this });
        this.mcp = new MCP({ router: this.dashboard.router, instructions: INSTRUCTIONS });

        /* `guard()` has to be the FIRST thing registered on the router — Express
         * walks a router's middleware/routes in REGISTRATION order, and a plain SSE
         * handler (Stream's own `GET /api/stream`, below) never calls `next()`. The
         * loopback check used to be registered in `initialize()`'s own call order,
         * after this point, so a request for `/api/stream` matched the CORS route
         * and then Stream's handler and finished before ever reaching it — the one
         * route that answered a non-loopback caller (board-from-events, 2026-09-22).
         * Calling it here, before anything else touches the router, closes that. */
        this.guard();

        /* CORS for the live event stream (board-from-events, 2026-09-22) — a browser
         * tab on the site's own origin (the AI board) opens `EventSource("/api/
         * stream")` cross-origin, same as `ux/Dictate`'s POST to `/log/:name` already
         * does. Registered on the router BEFORE `Stream`'s own `GET /api/stream`
         * handler below, on purpose: Express walks a router's middleware/routes in
         * REGISTRATION order, and a plain SSE handler never calls `next()` — a CORS
         * middleware added after it would simply never run for this path. This one
         * only sets the header and falls through. */
        this.dashboard.router.get("/api/stream", (req, res, next) => {
            res.set("Access-Control-Allow-Origin", "*");
            next();
        });
        this.stream = new Stream({ router: this.dashboard.router });

        /* The prompt log goes out on that same wire (prompt-lifecycle,
         * 2026-09-22): the owner speaks, the line lands, the fast assistant
         * answers with three more lines, and an open board draws the whole
         * thread without ever asking again. `Stream.follow()` says why it is a
         * named list and not every log on the machine.
         *
         * ⚠ `cards/<slug>` joins it too (card-storage, ai2-nested) — but there is
         * no fixed list of every card's name to write out by hand, so this hands
         * `follow()` an object with an `includes()` of its own instead of a plain
         * array. `follow()` only ever calls `names.includes(name)`, and nothing
         * about that call cares whether `names` is really an Array — so one small
         * object, matched against the same `cards/` prefix `Log.js`'s own
         * `CARD_NAME` checks, is Stream.js's own seam used exactly as written,
         * not a second one grown beside it. */
        this.stream.follow(this.log, { includes: name => name === "prompts" || name.startsWith("cards/") });

        /* The Claude sessions live here, in this process, holding the same `Log`
         * everything else writes through. That is the whole integration: a tool
         * call arriving at /mcp reaches a session already running in memory.
         *
         * `mcp_url` is what makes an agent able to build a team of its own — every
         * agent Servex spawns gets this same door in its own tool list, so it can
         * call `spawn_agent` exactly as the session that spawned it did. */
        this.agents = new this.constructor.Agents({
            log: this.log, servex: this,
            mcp_url: `http://127.0.0.1:${this.dashboard_port}/mcp`
        });

        /* CARD FOLDERS — one folder per card under ai/, written only by Cards. */
        this.cards = new this.constructor.Cards({ agents: this.agents, log: this.log });

        /* FOLLOW(PATH) (voice-sessions, 2026-09-29): an agent cannot watch a file
         * itself, so Servex watches and tells subscribed agents what changed, one
         * message per burst, through `this.agents.send()` — the same queue
         * `send_to_agent` uses. Servex/Follow.js, Servex/doc/follow.md. */
        this.follow = new this.constructor.Follow({ agents: this.agents }).start();

        /* A VS CODE TAB IS AN AGENT YOU CAN MESSAGE (External.js) — `register_session`
         * lets any Claude session outside this process become addressable: listed,
         * messageable, and forwarded the owner's words on any card it creates. */
        this.external = new this.constructor.External({ servex: this }).install();

        /* THE FAST ASSISTANT — one Sonnet session, always up, whose only job is
         * to turn each sentence the owner speaks into a name, a card and a
         * refined reading within seconds. `install()` puts its tool on /mcp and
         * its two routes on the dashboard; `start()` actually spawns it, which
         * costs a few cents an hour of nothing and answers in about ten seconds
         * when something is said. `SERVEX_NO_ASSISTANT=1` boots without it —
         * that is the switch for a proof run, or for a machine nobody is
         * dictating on. */
        this.assistant = new this.constructor.Assistant({ servex: this }).install();
        if (!process.env.SERVEX_NO_ASSISTANT) setImmediate(() => {
            try { this.assistant.start(); }
            catch (e){ this.say(`assistant did not start: ${e.message || e}`); }
        });

        /* THE DISPATCHER — watches the same `prompts` log for a `task` line
         * the assistant appended (`state: "queued"`) and spawns a task
         * mastermind to build it, at most two at once. No LLM of its own, so
         * nothing here costs anything until a task actually queues. */
        this.dispatcher = new this.constructor.Dispatcher({ servex: this }).install();

        /* THE MACHINE MONITOR and THE SPAWN GATE (servex-monitor, 2026-09-24).
         * The monitor samples CPU, RAM, the top processes, the GPU and the live
         * agents every 5 s (Monitor.js says how, cheaply); while its flag is up,
         * `admission()` queues new agents instead of starting them, and every
         * tick tries the queue again. `SERVEX_NO_MONITOR=1` boots without it. */
        this.admission();
        if (!process.env.SERVEX_NO_MONITOR){
            this.monitor = new this.constructor.Monitor({ servex: this }).start();
            this.checks.push(spec => this.monitor.flag ? this.monitor.flag.reason : null);
            this.monitor.on("tick", () => this.drain());
        }

        /* THE TASK LOOP (task-loop, 2026-09-28): every SERVEX_TASKLOOP_EVERY_MIN
         * minutes, chase an open task quiet past SERVEX_TASKLOOP_QUIET_MIN, or whose
         * owning agent stopped or is gone; escalate to its card after 2 chases
         * SERVEX_TASKLOOP_GAP_MIN apart. `root: REPO`, not process.cwd(), so a
         * worktree's Servex chases the worktree's own tasks, never the live site's.
         * Built always (close_task and task_loop_status stay callable either way);
         * `SERVEX_NO_TASKLOOP=1` only skips the ticking. Doc: Servex/doc/task-loop.md. */
        this.task_loop = new this.constructor.TaskLoop({ servex: this, root: REPO });
        if (!process.env.SERVEX_NO_TASKLOOP) this.task_loop.start();

        /* THE HEARTBEAT (task-loop/heartbeat, 2026-09-29): a task owner silent
         * SERVEX_HEARTBEAT_SILENT_MIN (5) gets a neutral status check; one that died
         * is triaged and revived; the card hears only when that fails. A minion stuck
         * at the spawn gate wakes its parent. `SERVEX_NO_HEARTBEAT=1` skips it. */
        this.heartbeat = new this.constructor.Heartbeat({ servex: this });
        if (!process.env.SERVEX_NO_HEARTBEAT) this.heartbeat.start();
        this.reaper();
        /* The usage bars: claude-usage.py every 15 min, hidden (Usage.js). */
        if (!process.env.SERVEX_NO_USAGE) this.usage = new Usage({ repo: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..") }).start();

        /* THE ASSISTANT LAYERS (ai/2026-09-24/assistant-layers): an assistant and a
         * manager on every card, and the master assistant + mastermind-servex across
         * them all. `SERVEX_NO_LAYERS=1` boots without them. */
        this.inbox = new Inbox({ servex: this });   // every page's inbox: agents/inbox.js, doc/inbox.md
        if (!process.env.SERVEX_NO_LAYERS){
            this.layers = new this.constructor.Layers({ servex: this }).install();
            this.global = new this.constructor.Global({ servex: this }).install();
            this.sessions = new this.constructor.Sessions({ servex: this }).install();   // one ✦ press = one voice session (agents/Sessions.js)
        }

        /* THE WORKTREE POOL (quickfix-worktrees, 2026-09-25): one warm worktree any agent
         * takes with take_worktree. Pool.js and doc/pool.md. `SERVEX_NO_POOL=1` boots without it. */
        if (!process.env.SERVEX_NO_POOL) this.pool = new this.constructor.Pool({ servex: this }).start();

        this.agents.revive();   // agents alive at the last boot come back (resume, same id); the rest are marked gone
        this.routes();
        this.tools();

        /* Servex is the first project in its own list — it eats its own cooking,
         * and `servex.localhost:<proxy>` reaches this dashboard like any other.
         * Listing itself FIRST also claims the name: C:/Code/servex is the old,
         * retired repo, and letting the scan claim `servex` would point the name
         * at a second copy trying to bind this very port. */
        this.projects.push(new Project({ dir: HERE.split(path.sep).join("/"), name: "servex", port: this.dashboard_port, self: true }));
        this.scan(this.root);
        this.adopt();

        this.proxy = new ReverseProxy({
            port: this.gated ? this.proxy_internal : this.proxy_port,
            bare: this.bare,
            site: "monorepo",
            ports: this.ports.ports,
            dashboard: `http://127.0.0.1:${this.dashboard_port}/`,
            missing: name => this.autostart(name),
            starting: name => ["launching", "restarting"].includes(this.processes.get(name)?.status)
        });
        this.proxy.on("proxy_error", e => this.say(`proxy error ${e.code} — ${e.method} ${e.host}${e.path}`, { event: "proxy_error", ...e }));

        this.gate();
        this.whisper();
        this.shutdown();

        this.say(`Servex up — dashboard http://127.0.0.1:${this.dashboard_port}/ · proxy http://127.0.0.1:${this.proxy_port}/${this.gated ? ` (gate -> :${this.proxy_internal})` : ""} · ${this.projects.length} projects under ${this.root}`);
        console.log(`Servex dashboard  http://127.0.0.1:${this.dashboard_port}/`);
        console.log(`Servex proxy      http://<name>.localhost${this.proxy_port === 80 ? "" : `:${this.proxy_port}`}/`);
        console.log(`Servex mcp        http://127.0.0.1:${this.dashboard_port}/mcp`);
    }

    /* ── finding projects ─────────────────────────────────────────────── */

    scan(dir, depth = this.depth){
        let entries = [];
        try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }

        for (const entry of entries){
            if (!entry.isDirectory() || entry.name.startsWith(".") || SKIP.has(entry.name)) continue;
            const child = path.join(dir, entry.name);

            if (fs.existsSync(path.join(child, "package.json"))) this.add(child);
            else if (depth > 1) this.scan(child, depth - 1);
        }
    }

    /* First one wins: two directories can share a basename, and a stable name is
     * worth more than completeness — the name is the URL. */
    add(dir){
        const project = new Project({ dir: dir.split(path.sep).join("/") });
        if (this.projects.some(p => p.name === project.name)) return;

        project.port = this.ports.port(project.name);
        this.projects.push(project);
        return project;
    }

    project(name){
        return this.projects.find(p => p.name === name);
    }

    /* ── running them ─────────────────────────────────────────────────── */

    /* The supervised child for a project, built the first time it is asked for.
     * `NO_WHISPER=1` because Servex owns whisper now — a dev server started from
     * here must not start a second one. (A dev server you start by hand still
     * brings up its own, exactly as before: nothing was removed from
     * Server/plugins/Whisper.js.) */
    runner(name){
        if (this.processes.has(name)) return this.processes.get(name);

        const project = this.project(name);
        if (project?.self || project?.external) return null;   // Servex does not start a second copy of itself, or of a project it did not spawn
        const start = project?.start_command();
        if (!start) return null;

        const runner = new Process({
            name, log: this.log, port: project.port, cwd: project.dir,
            command: start.command, args: start.args, shell: start.shell,
            env: { NO_WHISPER: "1", HOST: "127.0.0.1" },
            detach: true                  // outlives Servex; the next Servex adopts it — Process.js
        });
        this.processes.set(name, runner);
        return runner;
    }

    async command(name, verb){
        const runner = this.runner(name);
        if (!runner) throw new Error(`No project called "${name}" that Servex knows how to start.`
            + ` Startable: ${this.projects.filter(p => p.start_command()).map(p => p.name).join(", ")}`);

        await runner[verb]();
        return JSON.stringify({ ...runner.toJSON(), url: this.url(name) }, null, 2);
    }

    /* The proxy calls this when a project's port refuses a connection. It must
     * answer synchronously — true means "a Starting… page is the right reply". */
    autostart(name){
        const runner = this.runner(name);
        if (!runner) return false;
        if (runner.status === "launching" || runner.status === "restarting") return true;
        if (runner.status === "errored") return false;

        runner.start();
        return true;
    }

    url(name){
        return `http://${name}.localhost:${this.proxy_port}/`;
    }

    list(){
        return this.projects.map(p => ({
            ...p.toJSON(),
            url: this.url(p.name),
            ...(p.self
                ? { status: "online", pid: process.pid, said: "this dashboard" }
                : this.processes.get(p.name)?.toJSON() ?? { status: "stopped", pid: null })
        }));
    }

    /* Every dev server the LAST Servex started and that is still running is
     * picked back up — the same pid, no restart (Process.adopt). Its record in
     * procs/<name>.json is what makes it ours. */
    adopt(){
        let names = [];
        try { names = fs.readdirSync(path.dirname(place("procs", "x.json"))).filter(f => f.endsWith(".json")).map(f => f.slice(0, -5)); } catch {}
        for (const name of names) this.runner(name)?.adopt().catch(e => this.say(`adopt ${name} failed: ${e.message}`));
    }

    /* Whisper is one of these too — same supervision, same log file, four boot
     * cases in Process.Whisper. */
    whisper(){
        const home = process.env.WHISPER_HOME || path.join(process.env.LOCALAPPDATA || "", "lew42", "whisper");
        const port = Number(process.env.WHISPER_PORT) || 8178;
        const model = path.join(home, "models", "ggml-large-v3-turbo.bin");

        const runner = new Process.Whisper({
            name: "whisper", log: this.log, model, port,
            command: path.join(home, "bin", "whisper-server.exe"),
            args: ["-m", model, "--host", "127.0.0.1", "--port", String(port),
                "--vad", "--vad-model", path.join(home, "models", "ggml-silero-v5.1.2.bin")]
        });

        this.processes.set("whisper", runner);
        runner.start();
        return runner;
    }

    /* ── the door ─────────────────────────────────────────────────────── */

    /* Everything binds 127.0.0.1 already; this is the second lock on the same
     * door, because these routes start processes and write files. */
    guard(){
        this.dashboard.router.use((req, res, next) => loopback(req.socket.remoteAddress)
            ? next()
            : res.status(403).json({ error: "Servex answers loopback only." }));
    }

    routes(){
        const router = this.dashboard.router;

        router.get("/api/projects", (req, res) => res.json(this.list()));

        /* A worktree already runs its own server — this just teaches the proxy
         * where it is. `external: true` stops `runner()` from ever trying to
         * start a second copy on the port this one already holds. */
        router.post("/api/projects", express.json({ limit: "1mb" }), (req, res) => {
            const { name, path: dir, port } = req.body ?? {};
            if (!name || !dir) return res.status(400).json({ error: "name and path are required" });
            if (this.project(name)) return res.status(400).json({ error: `"${name}" is already registered` });

            const project = new Project({ dir: String(dir).split(path.sep).join("/"), name, external: true });
            project.port = port ? this.ports.pin(name, Number(port)) : this.ports.port(name);
            this.projects.push(project);

            this.say(`project registered: ${name} -> :${project.port}`, { event: "project", action: "register", name, port: project.port });
            res.json(project.toJSON());
        });

        router.delete("/api/projects/:name", (req, res) => {
            const project = this.project(req.params.name);
            if (!project) return res.status(404).json({ error: `no project called "${req.params.name}"` });

            this.projects = this.projects.filter(p => p !== project);
            this.processes.delete(project.name);
            delete this.ports.ports[project.name];
            this.ports.save();

            this.say(`project unregistered: ${project.name}`, { event: "project", action: "unregister", name: project.name });
            res.json({ ok: true });
        });

        router.post("/api/projects/:name/:verb", async (req, res) => {
            const { name, verb } = req.params;
            if (!["start", "stop", "restart"].includes(verb)) return res.status(400).json({ error: "start, stop or restart" });
            try { res.json(JSON.parse(await this.command(name, verb))); }
            catch (e){ res.status(400).json({ error: String(e.message || e) }); }
        });

        /* THE ONLY WAY ANOTHER PROCESS WRITES A LOG. Nobody opens these files
         * but Log.js — see its comment for why.
         *
         * A BROWSER TAB reads and writes here too, which is why these routes answer
         * CORS: `ux/Dictate` posts every dictated sentence from the site's origin to
         * this one, and a browser calls that cross-origin and sends a preflight
         * `OPTIONS` first. With nothing answering the preflight the fetch never
         * leaves the tab at all — measured 15:17 by the whisper-servex task, which
         * saw `POST /log/prompts` succeed from curl and fail from a page, and fell
         * back to the dev server. `GET /agents`, below, reuses this same middleware
         * for the same reason, from the other direction: the AI board's Agents
         * strip (board-from-events, 2026-09-22) reads it from the site's origin.
         *
         * `*` is safe here and nowhere else would it be: `guard()` has already
         * refused every non-loopback caller two lines up the router, so `*` can
         * only ever mean "any page on this machine". */
        const cors = (req, res, next) => {
            res.set({
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "content-type",
                "Access-Control-Max-Age": "600"
            });
            next();
        };

        router.options("/log/:name", cors, (req, res) => res.status(204).end());

        /* The naming rules live in `Log.append()` itself (see its own comment) —
         * this route only turns its answer into the right HTTP status. `ok`
         * covers both a plain write and one the appender rewrote (`became`);
         * only an outright refusal answers 409. */
        router.post("/log/:name", cors, express.json({ limit: "1mb" }), async (req, res) => {
            try {
                const outcome = await this.log.append(req.params.name, this.stamp_via(req));
                res.status(outcome.ok ? 200 : 409).json(outcome);
            } catch (e){ res.status(400).json({ error: String(e.message || e) }); }
        });

        router.get("/log/:name", cors, async (req, res) => {
            try { res.json(await this.log.tail(req.params.name, Number(req.query.n) || 50)); }
            catch (e){ res.status(400).json({ error: String(e.message || e) }); }
        });

        /* THE CARDS SUB-PATH (decision `card-storage`, ai2-nested). One card's
         * own append-only stream — `cards/<slug>` — a name `:name` above cannot
         * spell, because an Express route param never matches a `/`. Same body,
         * same `cors`, same 409-on-refusal; the only difference is the name
         * `Log.append()`/`Log.tail()` are handed, which is why this is three
         * lines beside the routes above rather than a second router. */
        router.options("/log/cards/:slug", cors, (req, res) => res.status(204).end());

        router.post("/log/cards/:slug", cors, express.json({ limit: "1mb" }), async (req, res) => {
            try {
                const via = this.via(req);   // a card log line wakes listeners beyond the assistant: a worktree page's is stubbed, like /card
                if (via) return res.json({ ok: true, stubbed: true, via, note: "a worktree page's card line: written nowhere, nobody woken" });
                const outcome = await this.log.append(`cards/${req.params.slug}`, req.body ?? {});
                res.status(outcome.ok ? 200 : 409).json(outcome);
            } catch (e){ res.status(400).json({ error: String(e.message || e) }); }
        });

        router.get("/log/cards/:slug", cors, async (req, res) => {
            try { res.json(await this.log.tail(`cards/${req.params.slug}`, Number(req.query.n) || 200)); }
            catch (e){ res.status(400).json({ error: String(e.message || e) }); }
        });

        /* A worktree page's card post (answer, append, create) would wake agents as if the owner
         * spoke: answered as a stub instead, written nowhere (via:worktree, 2026-09-30). */
        router.use("/card", (req, res, next) => {
            const via = req.method === "POST" && this.via(req);
            if (!via) return next();
            res.json({ ok: true, stubbed: true, via, note: "a worktree page's post: nothing written to the main tree's cards, nobody woken" });
        });
        this.cards.routes(router, cors);
        this.inbox.routes(router, cors, express.json({ limit: "64kb" }));   // POST /api/inbox/drop|clear, GET /api/inbox

        /* THE FAST TIDY CALL (dictation-playground, 2026-09-28) — one no-tools
         * model call that cleans up a chunk of dictated text near-verbatim
         * (typos, capitalization, punctuation, fillers only — never a
         * rewrite). See Servex/agents/tidy.js for the prompt and options. */
        router.options("/api/tidy", cors, (req, res) => res.status(204).end());

        router.post("/api/tidy", cors, express.json({ limit: "64kb" }), async (req, res) => {
            const body = req.body ?? {};
            if (typeof body.text !== "string") return res.status(400).json({ ok: false, why: "text must be a string" });
            res.json(await tidy(body));
        });

        /* THE HIT-API CHAT CALLS (chat-hitl, 2026-09-29) — two small no-tools
         * model calls the human-in-the-loop chat uses: `marks` (per-sentence
         * purpose + ambiguity flag) and `rename` (five title alternatives).
         * See Servex/agents/hitl.js. Named ops only — an unknown `op`, or a
         * caller-supplied `system`/`model`, is refused: this route (reachable
         * from the LAN via `/servex`) never runs an arbitrary prompt. */
        router.options("/api/hitl", cors, (req, res) => res.status(204).end());

        router.post("/api/hitl", cors, express.json({ limit: "64kb" }), async (req, res) => {
            const body = req.body ?? {};
            if (body.system !== undefined || body.model !== undefined)
                return res.status(400).json({ ok: false, why: "system and model are not accepted here" });
            if (body.op !== "marks" && body.op !== "rename")
                return res.status(400).json({ ok: false, why: `unknown op "${body.op}"` });
            res.json(await hitl(body));
        });

        router.get("/api/logs", (req, res) => res.json(this.log.names()));

        /* The dashboard's first paint. After this it hears about every change on
         * the live stream (`GET /api/stream`) instead of asking again. */
        // `cors` since 2026-09-23: AI 2's Live card reads who is running NOW
        // (this live map), not the registry below, whose rows outlive a restart.
        router.get("/api/agents", cors, (req, res) => res.json(this.agents.list()));

        /* SAY SOMETHING TO ONE RUNNING AGENT (agent-chat, 2026-09-24) — the Live
         * card's inline chat posts here. `send()` queues it behind the agent's
         * current turn, so a busy agent answers when it is free. Unknown id 404,
         * stopped 409, no text 400 — each with the plain sentence as `error`.
         * ⚠ The Dispatcher sits in the same live map as a FAKE agent whose
         * `send()` means "a child woke me" — so only a real Claude session
         * (`Agents.Agent`) is accepted; anything else is a 409. */
        router.options("/api/agents/:id/message", cors, (req, res) => res.status(204).end());

        router.post("/api/agents/:id/message", cors, express.json({ limit: "64kb" }), (req, res) => {
            const text = String(req.body?.text ?? "").trim();
            if (!text) return res.status(400).json({ error: "text is required" });
            const via = this.via(req);
            if (via) return res.json({ ok: true, stubbed: true, via, note: "a worktree page's message: not delivered, nobody woken" });
            let agent;
            try { agent = this.agents.get(req.params.id); }
            catch (e){ return res.status(404).json({ error: String(e.message || e) }); }
            if (!(agent instanceof this.constructor.Agents.Agent))
                return res.status(409).json({ error: `"${agent.id}" is not a Claude session — it cannot take a message.` });
            try { res.json(agent.send(text, { from: "owner" }).card()); }
            catch (e){ res.status(409).json({ error: String(e.message || e) }); }
        });

        /* The registry — every agent ever spawned, surviving a Servex restart the
         * `live` Map above does not. What `list_agents` and `say.mjs state`'s
         * `MASTERMINDS` block read from outside this process — and, since
         * board-from-events (2026-09-22), the AI board's own Agents strip, reading
         * this cross-origin from the site, hence `cors` (the same star-origin
         * middleware `/log/:name` already uses, safe for the same reason: `guard()`
         * above has already refused every non-loopback caller). */
        router.get("/agents", cors, (req, res) => res.json(this.agents.registry_list()));

        /* The machine monitor's latest sample, verdict, flag and spawn queue. */
        router.get("/api/system", cors, (req, res) => res.json(this.health()));

        /* The worktree pool: { K, N_hours, slots: [...] } — the Live card reads it. */
        router.get("/api/worktrees", cors, (req, res) => res.json(this.pool ? this.pool.list() : { K: 0, N_hours: 0, slots: [] }));

        /* THE DOCS TAB (servex-docs-tab, 2026-09-29) — read-only, loopback-only
         * (guard() above already refuses non-loopback callers). `/api/docs` lists
         * every module under Servex/ or Server/ with its own readme.md;
         * `/api/docs/file` reads one file out of one module. All the validation
         * (path shape, no `..`, resolved-path-stays-inside-root) lives in
         * `docs_read_file()` in pages.js, which throws `.status` 400 or 404. */
        router.get("/api/docs", (req, res) => {
            try { res.json(docs_list()); }
            catch (e){ res.status(500).json({ error: String(e.message || e) }); }
        });

        router.get("/api/docs/file", (req, res) => {
            try {
                const text = docs_read_file(req.query.path, req.query.file);
                res.type(req.query.file === "demo.js" ? "text/javascript" : "text/plain").send(text);
            } catch (e){ res.status(e.status || 400).json({ error: String(e.message || e) }); }
        });
    }

    tools(){
        const name = { type: "string", description: "The project's name, as `list_servers` reports it." };
        const one = { type: "object", required: ["name"], properties: { name } };

        this.mcp
            .tool("list_servers", { description: "Every project Servex found, with its port, its URL through the proxy, whether it is running, and the last line it printed." },
                () => JSON.stringify(this.list(), null, 2))

            .tool("start_server", { description: "Start a project's dev server under Servex, with its own PORT in the environment. Already running is not an error.", inputSchema: one },
                a => this.command(a.name, "start"))

            .tool("restart_server", { description: "Stop a project's dev server and start it again. Safe when it is already dead.", inputSchema: one },
                a => this.command(a.name, "restart"))

            .tool("stop_server", { description: "Stop a project's dev server and leave it stopped.", inputSchema: one },
                a => this.command(a.name, "stop"))

            .tool("server_logs", { description: "The last lines of a log, newest last. Any log name works, not just a server's — `list_servers` and the dashboard name the ones that exist.",
                inputSchema: { type: "object", required: ["name"], properties: { name,
                    n: { type: "number", description: "How many lines. Default 50." } } } },
                async a => JSON.stringify(await this.log.tail(a.name, a.n || 50), null, 2))

            .tool("append_log", { description: "Append one JSON entry to a named log, through Servex. Servex stamps `at` and is the only writer, so two callers can never tear a line.",
                inputSchema: { type: "object", required: ["name", "entry"], properties: {
                    name: { type: "string", description: "Which log. Letters, digits, dot, dash, underscore; it becomes a filename." },
                    entry: { type: "object", description: "The entry. Any shape; `at` is added for you." } } } },
                async a => JSON.stringify(await this.log.append(a.name, a.entry ?? {})));

        /* And the agent host's five, through the very same seam — `spawn_agent`,
         * `send_to_agent`, `interrupt_agent`, `list_agents`, `stop_agent`. Ten
         * tools on one door; nothing about them is special-cased here. */
        for (const tool of agent_tools(this.agents)) this.mcp.tool(tool);
        for (const tool of directory_tools(this.agents)) this.mcp.tool(tool);   // ask_directory: agents/directory.js
        for (const tool of this.cards.tools()) this.mcp.tool(tool);
        for (const tool of this.pool?.tools() ?? []) this.mcp.tool(tool);   // take_worktree, return_worktree
        for (const tool of this.follow.tools()) this.mcp.tool(tool);   // follow, unfollow, list_follows
        for (const tool of this.inbox.tools()) this.mcp.tool(tool);   // drop, clear, inbox


        this.mcp.tool("system_health", {
            description: "Is this machine under strain? The latest sample from Servex's monitor (every 5 s): total CPU %, free RAM,"
                + " the top 5 processes by CPU, claude/node/chrome counts, live agents (working, and idle ones still holding a"
                + " claude process), GPU load/temperature/fan, and a one-line verdict. While the flag is up, new agents are"
                + " queued instead of started — `queue` lists them. The three optional numbers change the flag's thresholds"
                + " for this Servex until it restarts.",
            inputSchema: { type: "object", properties: {
                hot_cpu: { type: "number", description: "Flag when total CPU % stays at or above this. Default 90." },
                hot_seconds: { type: "number", description: "…for this many seconds. Default 60." },
                low_ram_gb: { type: "number", description: "Flag when free RAM falls under this many GB. Default 3." }
            } }
        }, args => {
            this.monitor?.set(args ?? {});
            const health = this.health();
            return `${health.verdict}\n\n${JSON.stringify(health, null, 2)}`;
        });

        /* The task loop's own two tools (Servex/doc/task-loop.md). */
        this.mcp.tool("close_task", {
            description: "The only way a task leaves the task loop besides landing. Appends {closed_by: \"owner\","
                + " closed_at, closed_why} to its task.jsonl; the loop then never chases or escalates it again.",
            inputSchema: { type: "object", required: ["dir"], properties: {
                dir: { type: "string", description: "The task's directory, e.g. `public/framework/ai/2026-09-28/my-task` — repo-relative or absolute." },
                why: { type: "string", description: "One line: why it is being closed without landing." }
            } }
        }, async args => JSON.stringify(await this.task_loop.close_task(args)));

        this.mcp.tool("task_loop_status", {
            description: "The task loop's latest tick: how many tasks are open today, how many are quiet, and running"
                + " totals chased/escalated since this Servex started."
        }, () => JSON.stringify(this.task_loop.status()));

        this.mcp.tool("heartbeat_status", {
            description: "The heartbeat: every watched task owner, how long it has been silent, whether a status check is"
                + " waiting on an answer or it is mid-tool; minions held at the spawn gate; revives queued."
        }, () => JSON.stringify(this.heartbeat.status(), null, 1));
    }

    health(){
        if (!this.monitor) return { verdict: "The monitor is off (SERVEX_NO_MONITOR=1).", queue: this.queued() };
        return { ...this.monitor.health(), queue: this.queued() };
    }

    /* ── the spawn gate ───────────────────────────────────────────────── */

    /* THE GATE ON NEW AGENTS. `checks` is a list of functions; each is called
     * as `check(spec)` and returns a reason string to hold that spawn, or null.
     * `admit(spec)` answers null (start it now) or the first reason. The
     * monitor's flag is one check; `agents/Global.js` pushes an agent cap onto
     * the same list. Keep this exact shape — both sides agreed it.
     *
     * `agents.spawn` is wrapped on the INSTANCE, so every caller goes through
     * it: the MCP tool, the Dispatcher, a resume (`spawn({resume, …})`). A held
     * spec is queued and the caller gets a stand-in whose `card()` says so; the
     * monitor's tick drains the queue once `admit()` says yes again.
     *
     * Some spawns skip the gate, because their callers use the returned agent
     * for more than `.card()` and a stand-in would break them:
     *   - `urgent: true` in the spec — the caller's own say-so;
     *   - role `assistant` / `master-assistant` — Assistant.start() calls
     *     `.send()` on what it gets back, and these are the owner's front desk;
     *   - role `helper` — Assistant.help() rebinds `agent.result` at once;
     *   - a task mastermind whose parent is the Dispatcher — the Dispatcher keys
     *     its slots on `agent.id`, so it is gated one step earlier instead: its
     *     `pump()` waits while `admit()` says no, and the tick calls it again. */
    admission(){
        this.checks = [];
        this.queue = [];
        this.queue_file ??= place("spawn-queue.json");
        const spawn = this.agents.spawn.bind(this.agents);
        this.agents.spawn_now = spawn;
        this.agents.spawn = spec => {
            const broke = process.env.SERVEX_NO_BUDGET ? null : this.heartbeat?.budgets?.().refuse(spec);   // over its task's budget: refused, never queued (Budget.js)
            if (broke){ this.log.append("system", { type: "gate", state: "refused", parent: spec.parent, name: spec.name ?? null, why: broke }).catch(() => {}); throw new Error(broke); }
            const same = this.same_as(spec);   // one session, one process; one queued entry per id, name or session
            if (same) return same;
            const reason = this.bypass(spec) ? null : this.admit(spec);
            return reason ? this.hold(spec, reason) : spawn(spec);
        };
        this.restore();
        setTimeout(() => this.drain(), 5000).unref?.();   // restored entries start even with no monitor ticking
        /* A queued id is addressable: a message is held in its entry, a stop takes it out of the queue. */
        this.agents.queued_entry = id => this.queue.find(e => e.spec.id === id)?.stand_in ?? null;
        this.agents.unqueue = id => {
            const i = this.queue.findIndex(e => e.spec.id === id);
            if (i < 0) return false;
            this.queue.splice(i, 1); this.save_queue();
            this.log.append("system", { type: "gate", state: "removed", id }).catch(() => {});
            return true;
        };
        /* wait_for_agent on a QUEUED id waits for it to start, then for its turn. */
        this.agents.when_started = (id, timeout_s) => !this.queue.some(e => e.spec.id === id) ? null : new Promise(resolve => {
            const on = (spec, agent) => { if (agent?.id === id){ this.off("admitted", on); clearTimeout(t); resolve(agent); } };
            const t = setTimeout(() => { this.off("admitted", on); resolve(null); }, timeout_s * 1000);
            this.on("admitted", on);
        });

        const pump = this.dispatcher.pump.bind(this.dispatcher);
        this.dispatcher.pump = () => {
            const reason = this.dispatcher.queue.length ? this.admit({ role: "task-mastermind", parent: this.dispatcher.id }) : null;
            if (reason){
                if (this.dispatch_held !== reason) this.log.append("system", { type: "gate", state: "held", what: "dispatcher",
                    waiting: this.dispatcher.queue.length, reason }).catch(() => {});
                this.dispatch_held = reason;
                return;
            }
            this.dispatch_held = null;
            pump();
        };
    }

    bypass(spec = {}){
        return !!spec.urgent
            || ["assistant", "master-assistant", "helper"].includes(spec.role)
            || (spec.role === "task-mastermind" && !!spec.parent && spec.parent === this.dispatcher?.id);
    }

    /* FINISHING ROLES FIRST (node-reliability, 2026-09-29). A reviewer, clarity
     * or checker is what lets finished work merge and release its agents and
     * servers; holding it under the 4 GB floor was a priority inversion
     * (mobile-nav, 17:50). It goes through with SERVEX_FINISH_FLOOR_MB (1024)
     * free, whatever the other checks say, and drains ahead of everything else. */
    /* VIA:WORKTREE (node-reliability, 2026-09-30; brief 21:40). A page served by a worktree's dev
     * server posts to this same Servex; its chat and prompt lines landed in the MAIN tree's live
     * logs as the owner's words and woke paid assistants (chat-hitl, 21:33-21:36). A request whose
     * Origin (or Referer) is a worktree's port or `<name>.localhost` — or that says so itself with
     * `x-servex-via` — is `worktree:<name>`: log lines are stamped with it, and nothing wakes for them. */
    via(req){
        const said = req.get?.("x-servex-via");
        if (said) return String(said).slice(0, 80);
        let u; try { u = new URL(req.get?.("origin") || req.get?.("referer") || ""); } catch { return null; }
        let reg = {}; try { reg = JSON.parse(fs.readFileSync(path.resolve(HERE, "..", ".worktrees.json"), "utf8")); } catch {}
        const hit = Object.values(reg).find(e => (u.port && String(e.port) === u.port) || u.hostname === `${e.name}.localhost`);
        return hit ? `worktree:${hit.name}` : null;
    }
    stamp_via(req){
        const body = req.body ?? {}, via = this.via(req);
        return via && body && typeof body === "object" && !Array.isArray(body) ? { ...body, via } : body;
    }

    finishing(spec = {}){ return ["reviewer", "clarity", "checker"].includes(spec.role); }

    admit(spec){
        if (this.finishing(spec) && os.freemem() / 1048576 >= (Number(process.env.SERVEX_FINISH_FLOOR_MB) || 1024)) return null;
        for (const check of this.checks){
            const reason = check(spec);
            if (reason) return reason;
        }
        return null;
    }

    /* THE SAME SPAWN TWICE (node-reliability, 2026-09-29). Returns what a new
     * spawn should become instead of a second process or a second queue entry:
     *   - a resume of a session a live agent already holds → that agent
     *     (lifecycle's session ran as five processes, 18:15);
     *   - an id, a session, or a fresh role+name already queued → that entry's
     *     stand-in, so a message is held in its inbox (mobile-nav's queue held
     *     7 reviewers, 18:00). */
    same_as(spec = {}){
        if (spec.resume && !spec.fork){
            const live = [...this.agents.live.values()].find(a => a.state !== "stopped" && a.session_id === spec.resume);
            if (live){
                this.log.append("system", { type: "gate", state: "deduped", into: live.id, session: spec.resume }).catch(() => {});
                if (spec.prompt) live.send(spec.prompt, { from: "servex" });
                return live;
            }
        }
        const entry = this.queue.find(e =>
            (spec.id && e.spec.id === spec.id)
            || (spec.resume && !spec.fork && e.spec.resume === spec.resume)
            // a fresh spawn is the SAME only when it asks the same thing of the same place for the same parent (a retry)
            || (!spec.resume && !e.spec.resume && spec.name && e.spec.name === spec.name && e.spec.role === spec.role
                && e.spec.prompt === spec.prompt && (e.spec.parent ?? null) === (spec.parent ?? null) && (e.spec.cwd ?? null) === (spec.cwd ?? null)));
        if (!entry) return null;
        this.log.append("system", { type: "gate", state: "deduped", into: entry.spec.id, role: spec.role ?? null, name: spec.name ?? null }).catch(() => {});
        if (spec.prompt && spec.prompt !== entry.spec.prompt && spec.resume) entry.inbox.push([spec.prompt, { from: "servex" }]);
        this.save_queue();
        return entry.stand_in;
    }

    hold(spec, reason){
        /* The id is fixed NOW, so the caller can wait_for_agent on it (review.mjs
         * and clarity.mjs treated a queued spawn as a failure, 19:20). */
        spec.id ??= this.reserve(spec);
        const entry = { spec, reason, at: stamp(), inbox: [] };
        this.queue.push(entry);
        this.log.append("system", { type: "gate", state: "queued", id: spec.id, role: spec.role ?? null, name: spec.name ?? null,
            reason, position: this.queue.length }).catch(() => {});
        const note = `Not started: ${reason}. Servex will start it as soon as that clears, under this id; wait_for_agent on it works now. Its parent is woken as usual once it runs.`;

        /* `send()` on the stand-in HOLDS the message. Agents.send() wakes a stopped
         * agent through spawn and then sends to whatever comes back, so a held
         * resume must not lose the message that woke it (found by assistant-layers,
         * 2026-09-24). drain() delivers the inbox the moment the agent really runs. */
        const stand_in = {
            id: spec.id, queued: true, spec,
            send: (text, extra) => { entry.inbox.push([text, extra]); this.save_queue(); return stand_in; },
            card: () => ({ id: spec.id, state: "queued", queued: true, position: this.queue.indexOf(entry) + 1,
                reason, note, held_messages: entry.inbox.length })
        };
        Object.defineProperty(entry, "stand_in", { value: stand_in, enumerable: false });
        this.save_queue();
        return stand_in;
    }

    /* An id no live agent and no queued entry has: `<role>-<name>`, then -2, -3… */
    reserve(spec){
        const base = this.agents.name({ role: spec.role, name: spec.name });
        const stem = base.replace(/-\d+$/, "");
        const taken = id => (this.agents.live.has(id) && this.agents.live.get(id).state !== "stopped") || this.queue.some(e => e.spec.id === id);
        if (!taken(base)) return base;
        let n = 2;
        while (taken(`${stem}-${n}`)) n++;
        return `${stem}-${n}`;
    }

    /* THE QUEUE SURVIVES A RESTART (node-reliability, 2026-09-29): it is written
     * to spawn-queue.json beside the registry on every change, and read back at
     * boot. Before, a restart dropped every held spawn, prompt included (six at
     * 19:35). A spec carrying code (`sdk`, `mcp_servers`, `system`) cannot be
     * written down; its owner spawns it again, and the drop is logged. */
    save_queue(){
        const keep = this.queue.filter(e => !unsavable(e.spec)).map(({ spec, reason, at, inbox }) => ({ spec, reason, at, inbox }));
        try { fs.writeFileSync(this.queue_file, JSON.stringify(keep, null, 1)); }
        catch (e){ this.say(`spawn queue not saved: ${e.message || e}`); }
    }

    /* A held spec that must not start any more: its cwd is gone, it was stopped on
     * purpose, or its task landed while it waited — the revive guard, asked of a spec. */
    stale(spec){
        const no = this.agents.blocked?.({ id: spec.id, cwd: spec.cwd, task_dir: spec.task?.dir && path.resolve(spec.task.dir),
            ...(spec.resume ? { stopped_by: this.agents.reg().read()[spec.id]?.stopped_by } : {}) });
        if (no) this.log.append("system", { type: "gate", state: "dropped", id: spec.id ?? null, why: no.text }).catch(() => {});
        return !!no;
    }

    restore(){
        let saved = [];
        try { saved = JSON.parse(fs.readFileSync(this.queue_file, "utf8")); } catch { return; }
        for (const { spec, reason, at, inbox } of saved){
            if (!spec || this.same_as(spec) || this.stale(spec)) continue;
            this.hold(spec, reason ?? "restored after a Servex restart");
            const entry = this.queue.at(-1);
            entry.at = at ?? entry.at;
            entry.inbox.push(...(inbox ?? []));
        }
        this.save_queue();
        if (saved.length) this.log.append("system", { type: "gate", state: "restored", count: this.queue.length }).catch(() => {});
    }

    queued(){
        return this.queue.map((entry, i) => ({ position: i + 1, id: entry.spec.id ?? null, role: entry.spec.role ?? null, name: entry.spec.name ?? null,
            reason: entry.reason, since: entry.at }));
    }

    /* Every monitor tick: start what the gate now admits, oldest first. */
    drain(){
        for (;;){
            const i = this.next_ready();
            if (i < 0) break;
            const [{ spec, at, inbox }] = this.queue.splice(i, 1);
            this.save_queue();
            if (this.stale(spec)) continue;
            try {
                const agent = this.agents.spawn_now(spec);
                this.log.append("system", { type: "gate", state: "started", id: agent.id, queued_at: at, held_messages: inbox.length }).catch(() => {});
                for (const [text, extra] of inbox) agent.send(text, extra);   // what arrived while it was held
                this.emit("admitted", spec, agent);   // a caller holding the queued stand-in learns the real agent here
            } catch (e){
                this.log.append("system", { type: "gate", state: "failed", role: spec.role ?? null, name: spec.name ?? null,
                    error: String(e.message || e) }).catch(() => {});
            }
        }
        if (this.dispatcher.queue.length) this.dispatcher.pump();
    }

    /* Finishing roles first, then oldest first; -1 when the gate admits none. */
    next_ready(){
        const order = this.queue.map((e, i) => i).sort((a, b) => this.finishing(this.queue[b].spec) - this.finishing(this.queue[a].spec) || a - b);
        return order.find(i => !this.admit(this.queue[i].spec)) ?? -1;
    }

    say(msg, extra){
        this.log.append("servex", { msg, ...extra }).catch(() => {});
    }

    /* THE GATE (gate.mjs) holds proxy_port and hands every visitor on to the
     * proxy, so a Servex restart is a slow page, not an error page.
     * Servex keeps the gate alive: it launches it at boot and relaunches it
     * within 5 s if port 80 stops answering; the keeper keeps Servex alive, so
     * the chain is keeper → Servex → gate. A second gate finds the port taken
     * and exits, so launching too often costs nothing. */
    gate(){
        if (!this.gated) return;
        const check = () => {
            const socket = net.connect(this.proxy_port, "127.0.0.1");
            socket.once("connect", () => socket.destroy());
            socket.once("error", () => { socket.destroy(); this.say(`gate: ${this.proxy_port} refused — launching it`); launch_gate(this.proxy_port, this.proxy_internal); });
        };
        launch_gate(this.proxy_port, this.proxy_internal);
        setInterval(check, 5000).unref();
    }

    /* Every attached child Servex started dies with it; the detached dev
     * servers do not — the next Servex adopts them. `terminate()` is
     * synchronous on purpose — `process.on("exit")` is the only hook Node
     * guarantees, and it cannot await. A whisper-server that was ALREADY
     * running when Servex started has no child here, so it is never touched. */
    /* THE REAPER'S SWEEP rides the heartbeat's tick — wrapped on the instance, Heartbeat.js
     * itself unchanged — at most once every 5 minutes (a sweep reads the process list: about
     * 1 s of PowerShell). With the heartbeat off, the same sweep runs on its own minute timer.
     * `SERVEX_NO_REAPER=1` boots without it; `SERVEX_REAPER_DRY=1` only says what it would close. */
    reaper(){
        if (process.env.SERVEX_NO_REAPER) return;
        let last = 0;
        const sweep = () => {
            if (this.reaping || Date.now() - last < 5 * 60000) return;
            last = Date.now();
            const dry = !!process.env.SERVEX_REAPER_DRY;
            this.reaping = this.lifecycle.sweep({ dry })
                .then(({ close, gone }) => (close.length || gone.length) && this.say(`lifecycle${dry ? " (dry)" : ""}: ${dry ? "would close" : "closed"} ${close.map(r => `${r.kind} ${r.id} (${r.why})`).join("; ") || "nothing"}; ${gone.length} dead log line(s) ended`))
                .catch(e => this.say(`lifecycle: sweep failed: ${e.message || e}`))
                .finally(() => { this.reaping = null; });
        };
        if (process.env.SERVEX_NO_HEARTBEAT){ this.reaper_timer = setInterval(sweep, 60000); this.reaper_timer.unref(); return; }
        const beat = this.heartbeat, tick = beat.tick.bind(beat);
        beat.tick = async (...args) => { try { return await tick(...args); } finally { sweep(); } };
    }

    shutdown(){
        const down = () => {
            this.agents.closing = true;   // wake_parent writes the inbox but revives nobody while everything stops
            try { this.monitor?.stop(); } catch {}
            try { this.task_loop?.stop(); } catch {}
            try { this.heartbeat?.stop(); } catch {}
            for (const agent of this.agents.live.values()) try { agent.stop(); } catch {}
            for (const runner of this.processes.values()) runner.detach ? runner.release() : runner.terminate();   // a detached dev server outlives Servex on purpose
            this.log.close();
        };
        process.on("SIGINT", () => { down(); process.exit(0); });
        process.on("SIGTERM", () => { down(); process.exit(0); });
        process.on("exit", down);
    }
}

/* SERVEX'S OWN DASHBOARD — the same Server class every project here runs, with
 * the two things that are wrong for Servex overridden.
 *
 * Server serves `public/` relative to the working directory and falls back to
 * its OWN package's index.html; run from the repo root that would serve the
 * lew42 site, not Servex. Two static roots fix it: Servex/public first, then the
 * monorepo's public/, so the dashboard page can `import` the real framework
 * (`/framework/core/View/View.js`) instead of a copy of it.
 *
 * And it binds 127.0.0.1, not 0.0.0.0. */
Servex.Dashboard = class Dashboard extends Server {

    initialize_express(){
        this.express = express;
        this.app = express();
        this.router = express.Router();

        this.app.use(express.static(path.join(HERE, "public"), { redirect: false }));
        this.app.use(express.static(path.join(HERE, "..", "public"), { redirect: false }));
        this.app.use(this.router);

        this.app.use((req, res) => {
            if (/.+\.[a-zA-Z0-9]+$/.test(req.path)) return res.status(404).end();
            res.sendFile(path.join(HERE, "public", "index.html"));
        });
    }

    listen(port = this.port, host = "127.0.0.1"){
        super.listen(port, host);
    }
};

/* SERVEX'S AGENT HOST — `Servex/agents/Agents.js` with one method overridden.
 *
 * `watch()` is the host's own seam: every typed event from every live agent
 * passes through it on its way to the log. Here it also goes out on the live
 * stream, so the dashboard shows a token as the agent thinks it rather than
 * a second and a half later. The agent's card rides along on every event, which
 * is what lets one frame update the row (state, turns, cost) and its open
 * transcript at the same time. */
Servex.Agents = class ServexAgents extends Agents {

    watch(event, agent){
        this.servex.stream.send("agent", { ...event, card: agent.card() });
        this.moment(event, agent);
        if (event.type === "result") this.cost(agent.id);
    }

    /* WHAT A TASK COST — after an agent ends a turn, re-add its task's dollars
     * (`Server/task-cost.mjs`, which walks up to the root itself). A burst of
     * results is one run: 5s trailing, per agent. The run is detached and never
     * throws into `watch()` — a failure is one line in the servex log. */
    cost(id){
        clearTimeout((this.cost_timers ??= new Map()).get(id));
        this.cost_timers.set(id, setTimeout(() => {
            this.cost_timers.delete(id);
            try {
                spawn(process.execPath, [path.join(REPO, "Server", "task-cost.mjs"), "--agent", id],
                    { cwd: REPO, detached: true, windowsHide: true, stdio: "ignore" })
                    .on("error", e => console.error(`task-cost ${id}: ${e.message}`)).unref();
            } catch (e) { console.error(`task-cost ${id}: ${e.message}`); }
        }, 5000));
    }

    /* THE LIVE CARD'S UPDATES (AI 2's `/framework/ai2/live/`) — an agent
     * starting, ending a turn, stopping or failing is one line on `cards/live`,
     * the card's own chat. Tokens and tool calls are not moments, and the two
     * always-on assistants are skipped: they end a turn on every sentence. */
    moment(event, agent){
        if (["assistant-fast", "master-assistant-master"].includes(agent.id)) return;
        const text = event.type === "agent_msg" && event.first ? "started"
            : event.type === "result" ? (event.stopped ? "stopped" : "finished a turn")
            : event.type === "error" ? "hit an error: " + String(event.text ?? "").slice(0, 120)
            : null;
        if (text) this.servex.log.append("cards/live", { type: "update", ref: agent.id, text: `${agent.id} ${text}` }).catch(() => {});
    }
};

/* SERVEX'S SINGLE WRITER — `Log` with two things added that only a long-lived
 * process can do (prompt-lifecycle, 2026-09-22).
 *
 * 1. IT ANNOUNCES. `append()` emits `("append", <log name>, <the line written>)`
 *    the instant a line is actually on disk. That one seam is what the live
 *    wire (`Stream.follow()`) and the fast assistant (`Assistant.listen()`) both
 *    hang off, and neither of them has to poll a file or be wired in by hand.
 *    Nothing is emitted for a refusal — a line that was not written did not
 *    happen.
 *
 * 2. IT FINISHES A PROMPT. `ux/Dictate` posts `{type: "prompt", text}` and
 *    nothing else: no id, no sentences. Both have to exist before anything can
 *    point at that prompt, and both have to be decided ONCE, by the writer, and
 *    frozen — an id so a rename never breaks a link, a sentence array so a
 *    citation like "sentences 0 and 2" can never drift (log-model/events.md
 *    argues that one out in full). `p-1`, `p-2`, … counting from whatever is
 *    already in the file, so the ids a person reads on screen are the ones they
 *    would count themselves.
 *
 * ⚠ This second job really belongs in `Log.js`, beside the naming checks that
 * are already there for the same reason. It is here because the task that wrote
 * it was fenced out of that file; move it down when `Log.js` is next open, and
 * nothing above needs to change. */
Servex.Log = class ServexLog extends Log {

    initialize(){
        super.initialize();
        this.counts = new Map();
    }

    append(name, entry){
        const line = entry?.type === "prompt" ? this.prompt(name, entry) : entry;
        return super.append(name, line).then(out => {
            if (out.ok) this.emit("append", name, out.entry);
            return out;
        });
    }

    prompt(name, entry){
        const sentences = entry.sentences ?? this.sentences(entry.text ?? "");
        return { ...entry, sentences, id: entry.id ?? `p-${this.count(name)}` };
    }

    /* Seeded from the file itself, once, so a Servex restart carries on counting
     * instead of minting a `p-1` that already exists. */
    count(name){
        if (!this.counts.has(name)){
            let text = "";
            try { text = fs.readFileSync(this.file(name).path, "utf8"); } catch {}
            this.counts.set(name, (text.match(/"type":"prompt"/g) ?? []).length);
        }
        const next = this.counts.get(name) + 1;
        this.counts.set(name, next);
        return next;
    }

    /* Deliberately blunt: a sentence ends at `.`, `?` or `!` followed by a
     * space. Dictated speech has no other punctuation to go on, and a split that
     * is occasionally coarse is far better than one that is clever, because
     * whatever it decides is frozen on the line forever. */
    sentences(text){
        return String(text).split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(Boolean);
    }
};

Servex.Assistant = Assistant;
Servex.Dispatcher = Dispatcher;
Servex.Cards = Cards;
Servex.Layers = Layers;
Servex.Sessions = Sessions;
Servex.Global = Global;
Servex.External = External;
Servex.MCP = MCP;
Servex.Monitor = Monitor;
Servex.TaskLoop = TaskLoop;
Servex.Heartbeat = Heartbeat;
Servex.Pool = Pool;
Servex.Lifecycle = Lifecycle;
Servex.Follow = Follow;
Servex.PortRegistry = PortRegistry;
Servex.Process = Process;
Servex.Project = Project;
Servex.ReverseProxy = ReverseProxy;
Servex.Stream = Stream;

/* A spawn spec that holds code, not data — it cannot be written to the queue file. */
function unsavable(spec = {}){ return !!(spec.sdk || spec.mcp_servers || spec.system || spec.one_shot); }
