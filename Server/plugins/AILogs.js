import fs from "fs";
import os from "os";
import path from "path";
import readline from "readline";
import { loopback } from "./MCP.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/* A subagent (minion) transcript's own filename, exactly as the CLI writes it —
 * "agent-" then hex, nothing else. Only [0-9a-f] is legal in the variable part,
 * so this pattern cannot mean "go up a directory" no matter how a browser (or an
 * attacker) encodes the request — `..%2f`, an absolute path, a second `/`, all
 * fail the regex and the request is refused before a single `fs` call happens. */
const AGENT_FILE = /^agent-[0-9a-f]+\.jsonl$/;

/* The index's own memory. Never in the repo (CLAUDE.md, "scratch goes in the
 * session scratchpad, not the repo") — the OS temp dir is the equivalent for a
 * server process that outlives one agent's session. Keyed by session/agent id,
 * each entry remembers the file's mtime+size alongside the summary it produced,
 * so a request only re-reads the files that actually changed since last time. */
const CACHE_FILE = path.join(os.tmpdir(), "lew42-ai-logs-cache.json");

const PREVIEW = 160;     // first_prompt, chars — matches a rail's one-line preview elsewhere
const REPORT = 240;      // last_text (a minion's report is worth a little more room)

/* Serves Claude Code session transcripts to the ext/ai replay viewer, read-only,
 * straight from where the CLI writes them — nothing is copied into the repo.
 * Dev server only: on static hosting /ai-logs/* falls through to index.html,
 * which the viewer treats as "unavailable".
 *
 * ⚠ The id alone is not a fence: session_ids are written in plain text into
 * task.jsonl files under public/framework/ai, which are served as static
 * assets to the same LAN — so loopback() is the actual guard, on every route
 * below, not only the first one. */
export default class AILogs {

    static setup(server) {
        new AILogs(server);
    }

    constructor(server) {
        this.server = server;
        this.server.ai_logs = this;
        // ⚠ AI_LOGS_DIR is TEST-ONLY — a private server pointed at a scratch
        //   copy under the OS temp dir, so a proof run can append a fake line
        //   or list fake sessions without ever touching ~/.claude/projects or
        //   putting a real transcript's content on screen. Unset in normal use.
        this.dir = process.env.AI_LOGS_DIR ? path.resolve(process.env.AI_LOGS_DIR)
            : path.join(os.homedir(), ".claude", "projects", process.cwd().replace(/[^a-zA-Z0-9]/g, "-"));
        server.on("express", () => this.route());
    }

    /* One guard, every route. Refuses off-loopback with a console line naming
       the path, same wording the original single-transcript route always used. */
    guard(req, res) {
        const from = req.socket.remoteAddress;
        if (loopback(from)) return true;
        console.warn(`AILogs: REFUSED ${req.originalUrl} from ${from} — loopback only.`);
        res.status(403).end();
        return false;
    }

    route() {
        // The index of every session on disk — GET /ai-logs or /ai-logs/, both spellings.
        // ⚠ Registered before :id below: with no id segment at all neither
        //   `/ai-logs/:id` nor this one could ever collide (a `:id` param needs a
        //   real, non-empty segment) but the order is kept defensive on purpose.
        this.server.router.get(["/ai-logs", "/ai-logs/"], async (req, res) => {
            if (!this.guard(req, res)) return;
            const cold = !fs.existsSync(CACHE_FILE);
            const t0 = Date.now();
            const rows = await this.index();
            res.json(rows);
            console.log(`AILogs: index — ${rows.length} sessions, ${Date.now() - t0}ms (${cold ? "cold" : "warm"})`);
        });

        // A session's minions — GET /ai-logs/<uuid>/subagents/
        this.server.router.get("/ai-logs/:id/subagents/", async (req, res) => {
            if (!this.guard(req, res)) return;
            if (!UUID.test(req.params.id)) return res.status(400).end();
            if (!fs.existsSync(path.join(this.dir, req.params.id + ".jsonl"))) return res.status(404).end();
            res.json(await this.subagents(req.params.id));
        });

        // One minion's own transcript — GET /ai-logs/<uuid>/subagents/<file>
        this.server.router.get("/ai-logs/:id/subagents/:file", (req, res) => {
            if (!this.guard(req, res)) return;
            if (!UUID.test(req.params.id)) return res.status(400).end();
            if (!AGENT_FILE.test(req.params.file)) return res.status(400).end();
            this.serve(req, res, path.join(this.dir, req.params.id, "subagents", req.params.file));
        });

        // The original route: one session's own transcript — GET /ai-logs/<uuid>
        this.server.router.get("/ai-logs/:id", (req, res) => {
            if (!this.guard(req, res)) return;
            if (!UUID.test(req.params.id)) return res.status(400).end();
            this.serve(req, res, path.join(this.dir, req.params.id + ".jsonl"));
        });
    }

    /* Range: bytes=<from>- → 206 with only the tail; the feed polls this way
       instead of re-downloading the whole transcript every poll (3 MB, and a
       minion's own transcript can run past 2 MB by itself — see doc/decisions.md). */
    serve(req, res, file) {
        if (!fs.existsSync(file)) return res.status(404).end();

        const size = fs.statSync(file).size;
        const m = /^bytes=([0-9]+)-$/.exec(req.headers.range ?? "");
        const start = m ? Math.min(Number(m[1]), size) : 0;
        res.type("application/x-ndjson");
        res.set("Accept-Ranges", "bytes");
        res.set("Content-Length", String(size - start));
        if (m) { res.status(206); res.set("Content-Range", `bytes ${start}-${Math.max(size - 1, 0)}/${size}`); }
        if (start >= size) return res.end();
        fs.createReadStream(file, { start }).pipe(res);
    }

    /* Every session on disk, newest-modified first. Cached by mtime+size (see
       CACHE_FILE) so a warm request is a stat() per file plus a JSON encode —
       nothing under public/framework/ai/2026-09-19/devbar-chat/ (this task's own
       proof) re-reads unchanged content. The one file that IS live right now
       (whichever session is talking) always misses the cache — its mtime moves
       every turn — so it is the only one actually rescanned on a normal request,
       one streaming pass over its own bytes, never the other 29. */
    async index() {
        if (!fs.existsSync(this.dir)) return [];

        const cache = read_cache();
        let dirty = false;
        const files = fs.readdirSync(this.dir).filter(f => f.endsWith(".jsonl") && UUID.test(f.slice(0, -6)));

        const rows = await Promise.all(files.map(async f => {
            const id = f.slice(0, -6);
            const full = path.join(this.dir, f);
            const st = fs.statSync(full);
            const cached = cache.sessions?.[id];
            let summary;
            if (cached && cached.mtimeMs === st.mtimeMs && cached.size === st.size) {
                summary = cached.summary;
            } else {
                summary = await summarize_session(full);
                (cache.sessions ??= {})[id] = { mtimeMs: st.mtimeMs, size: st.size, summary };
                dirty = true;
            }
            return { id, started: summary.started, modified: st.mtime.toISOString(), bytes: st.size,
                first_prompt: summary.first_prompt, prompts: summary.prompts,
                subagents: subagent_count(this.dir, id) };
        }));

        if (dirty) write_cache(cache);
        return rows.sort((a, b) => Date.parse(b.modified) - Date.parse(a.modified));
    }

    /* One session's minions — what each was told, what it reported, cached the
       same way and for the same reason (a finished minion's transcript never
       changes again; a running one is the one rescan paid for). */
    async subagents(id) {
        const sdir = path.join(this.dir, id, "subagents");
        let files;
        try { files = fs.readdirSync(sdir).filter(f => AGENT_FILE.test(f)); }
        catch { return []; }

        const cache = read_cache();
        const bucket = (cache.agents ??= {})[id] ??= {};
        let dirty = false;

        const rows = await Promise.all(files.map(async f => {
            const full = path.join(sdir, f);
            const st = fs.statSync(full);
            const cached = bucket[f];
            let summary;
            if (cached && cached.mtimeMs === st.mtimeMs && cached.size === st.size) {
                summary = cached.summary;
            } else {
                summary = await summarize_agent(full);
                bucket[f] = { mtimeMs: st.mtimeMs, size: st.size, summary };
                dirty = true;
            }
            return { file: f, started: summary.started, bytes: st.size,
                first_prompt: summary.first_prompt, last_text: summary.last_text };
        }));

        if (dirty) write_cache(cache);
        return rows.sort((a, b) => Date.parse(a.started ?? 0) - Date.parse(b.started ?? 0));
    }
}

/* ── the cache file ──────────────────────────────────────────────────────── */

function read_cache() {
    try { return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")); }
    catch { return {}; }
}

function write_cache(cache) {
    try { fs.writeFileSync(CACHE_FILE, JSON.stringify(cache)); }
    catch (e) { console.warn("AILogs: cache write failed —", e.message); }
}

function subagent_count(dir, id) {
    try { return fs.readdirSync(path.join(dir, id, "subagents")).filter(f => AGENT_FILE.test(f)).length; }
    catch { return 0; }
}

/* ── reading a transcript, one line at a time ────────────────────────────── */

/* A streaming line reader — never `readFileSync` here: some of these files pass
   2 MB (a busy minion) and the session file itself can run past 20 MB, and a
   cold index build touches all 30 at once. A torn or non-JSON line (the CLI
   writes a few other line shapes, like "queue-operation") is skipped, never
   thrown — the same tolerance ext/JSONL's own parser uses client-side. */
async function* lines_of(file) {
    const rl = readline.createInterface({ input: fs.createReadStream(file, { encoding: "utf8" }), crlfDelay: Infinity });
    for await (const line of rl) {
        if (!line.trim()) continue;
        try { yield JSON.parse(line); } catch { /* not a JSON line — skip it */ }
    }
}

/* Is this line a real person's own typed words? The CLI marks its own harness
   injections (a skill load, a caveat, a system reminder) `isMeta` — without
   excluding those, a transcript's "first prompt" is often a 40k-character skill
   body instead of what was actually asked (ext/AITask/conversation.js hits the
   same trap, client-side, for the same reason).
   `sidechain_ok`: a TOP-LEVEL session marks a nested agent's own chatter
   `isSidechain`, which is not something a person typed and must be excluded —
   but inside a MINION'S OWN transcript file every line legitimately carries
   `isSidechain: true` (that is just how the CLI marks agent turns), so the
   subagent reader passes `sidechain_ok: true` and skips that check. */
function is_user_prompt(l, { sidechain_ok = false } = {}) {
    if (l.type !== "user" || l.isMeta) return false;
    if (!sidechain_ok && l.isSidechain) return false;
    const c = l.message?.content;
    return typeof c === "string" ? !!c.trim() : Array.isArray(c) && c.some(b => b.type === "text" && b.text?.trim());
}

const text_of = c => typeof c === "string" ? c : (c ?? []).filter(b => b.type === "text").map(b => b.text).join("\n");

const one_line = (s, n = PREVIEW) => {
    const line = String(s ?? "").trim().split("\n").find(x => x.trim()) ?? "";
    return line.length > n ? line.slice(0, n - 1) + "…" : line;
};

/* What a minion actually SAID at the end, not the one-line "Report delivered to
   the caller." every SubagentHandback call leaves behind as ordinary assistant
   prose — the real report is the `message` argument of that tool call, so this
   looks for the tool call itself first and only falls back to prose (an agent
   that errored out, or never called it, still leaves something to show). */
function handback_message(l) {
    if (l.type !== "assistant" || !Array.isArray(l.message?.content)) return null;
    const call = l.message.content.find(b => b.type === "tool_use" && b.name === "SubagentHandback");
    return call?.input?.message ?? null;
}

function assistant_prose(l) {
    if (l.type !== "assistant") return null;
    return text_of(l.message?.content).trim() || null;
}

/* One streaming pass over a top-level session: when it started, its first real
   prompt, and how many it holds. */
async function summarize_session(file) {
    let started = null, first_prompt = "", prompts = 0;
    for await (const l of lines_of(file)) {
        started ??= l.timestamp ?? null;
        if (is_user_prompt(l)) {
            prompts++;
            if (!first_prompt) first_prompt = one_line(text_of(l.message.content));
        }
    }
    return { started, first_prompt, prompts };
}

/* One streaming pass over a minion's own transcript: the brief it was given,
   and the last thing it reported (the real report if it handed back, its last
   sentence otherwise). */
async function summarize_agent(file) {
    let started = null, first_prompt = "", last_handback = "", last_prose = "";
    for await (const l of lines_of(file)) {
        started ??= l.timestamp ?? null;
        if (!first_prompt && is_user_prompt(l, { sidechain_ok: true })) first_prompt = one_line(text_of(l.message.content));
        const hb = handback_message(l);
        if (hb) last_handback = one_line(hb, REPORT);
        else { const p = assistant_prose(l); if (p) last_prose = one_line(p, REPORT); }
    }
    return { started, first_prompt, last_text: last_handback || last_prose };
}
