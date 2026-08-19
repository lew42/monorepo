import { spawn } from "child_process";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import shot from "./Shot.js";
import stamp from "../stamp.js";

const PUBLIC = path.resolve("public");
const SEGMENT = /^[\w.-]+$/;
const turns = new Map();

/* A thread's directory, or null. `task` is a path under `public/` —
 * `framework/styles/layouts/ai/sizing` beside a page, or the legacy
 * `framework/ai/2026-08-14/browser-cli-bridge`. Both carry an `ai` segment, which
 * is the fence: browser input reaches a file write here, so it must resolve under
 * `public/`, name no `..`, and live inside an `ai/` dir. */
function thread_dir(task){
    const parts = String(task ?? "").split("/");
    if (!parts.length || !parts.every(p => SEGMENT.test(p) && p !== "..") || !parts.includes("ai")) return null;

    const dir = path.resolve(PUBLIC, task);
    return dir.startsWith(PUBLIC + path.sep) ? dir : null;
}

/* One browser message -> one headless `claude -p` turn. Continuity is the
 * transcript on disk, so nothing is kept alive between turns.
 * Dev server only; see public/framework/ext/Ask/readme.md. */
export default class Ask {

    static setup(socket){ new Ask(socket); }

    constructor(socket){
        this.socket = socket;
        socket.on("rpc:ask", (args, index) => this.ask(args[0] || {}, index));
        socket.on("rpc:thread", (args, index) => this.thread(args[0] || {}, index));
    }

    /* Open a thread beside a page: `<page>/ai/<slug>/task.jsonl`, one line, NO
     * process. A browser chat is a task whose log happens to be mostly `chat`
     * lines — `Start.js` is the other door, for a task wanting a session to work
     * it. Opening an existing thread is a no-op, not an error. */
    thread({ task, request }, index){
        const dir = thread_dir(task);
        if (!dir) return this.socket.send({ index, error: "Refusing thread path: " + task });

        const file = path.join(dir, "task.jsonl");
        if (fs.existsSync(file)) return this.socket.send({ index, task, existed: true });

        try {
            fs.mkdirSync(dir, { recursive: true });
            this.socket.socket_server?.live_reload?.mute(file, this.socket);
            fs.writeFileSync(file, JSON.stringify({ assign: {
                tab: "browser", request: request || "", requested_at: stamp(),
                now: "open — chatting from the dev rail",
            } }) + "\n");
            this.socket.send({ index, task });
        } catch (e){
            this.socket.send({ index, error: String(e.message || e) });
        }
    }

    async ask(req, index){
        const key = req.resume || req.task || req.id;
        if (turns.has(key)) return this.socket.send({ index, error: "That session is mid-turn." });

        /* The server claims the tab, not the model: the ring is up the instant the turn
         * starts, whether or not the turn ever touches the browser. ⚠ It also drops a
         * claim the owner had made by hand on that tab — a turn is short, and a stale
         * ring lies about who is driving.
         * ⚠ Read per turn, never in the constructor: `server.js` registers `Tab` AFTER
         * this plugin, so `socket.tab` does not exist yet when `Ask` is built. */
        const tab = this.socket.tab;
        turns.set(key, req.id);
        tab?.claim("ai", String(req.task ?? "").split("/").filter(Boolean).pop() || "chat");

        try {
            const file = req.shot && await shot(req.shot);
            const reply = await this.turn({ ...req, system: this.system(req),
                prompt: file ? `Read the screenshot at ${file}, then: ${req.prompt}` : req.prompt });
            if (req.task && !reply.error) this.record(req, reply);
            this.socket.send({ index, ...reply });
        } catch (e){
            this.socket.send({ index, error: String(e.message || e) });
        } finally {
            turns.delete(key);
            tab?.release();
        }
    }

    /* Where the turn is. A `-p` turn reaches the browser only through the `site` MCP,
     * whose tools pick a tab — and two tabs on one page are indistinguishable by path,
     * so the turn is TOLD the id of the one that asked instead of guessing. `context` is
     * whatever the page sent along, e.g. the owner's current selection. */
    system({ context }){
        const tab = this.socket.tab;
        const lines = [];

        if (tab?.id) lines.push(
            `This conversation is bound to browser tab ${tab.id}, which is on ${tab.page}.`
            + ` For anything about that page use the \`site\` MCP tools with tab: "${tab.id}" —`
            + ` never another tab, and never omit it; \`pages\` shows the others.`
            + ` That tab is already claimed for you, so do not claim or release it.`);

        if (context) lines.push(`The owner has selected, on that tab:\n${String(context).slice(0, 800)}`);

        return lines.join("\n\n") || null;
    }

    /* The whole command line, as data — so what a turn is told is one readable list and
     * a test can assert on it without spawning anything. */
    args({ resume, from, model = "sonnet", tools, system }){
        const args = ["-p", "--output-format", "stream-json", "--verbose", "--model", model];
        if (resume) args.push("--resume", resume);
        else if (from) args.push("--resume", from, "--fork-session");
        else args.push("--session-id", randomUUID());
        if (tools != null) args.push("--tools", tools);
        if (system) args.push("--append-system-prompt", system);
        return args;
    }

    turn(req){
        const { id, prompt } = req;
        const child = spawn(process.env.CLAUDE_BIN || "claude", this.args(req), { windowsHide: true });
        child.stdin.end(prompt ?? "");

        const state = { id, started: Date.now() };
        let buf = "", err = "";

        child.stdout.on("data", d => {
            buf += d;
            const lines = buf.split("\n");
            buf = lines.pop();
            lines.forEach(line => line.trim() && this.event(line, state));
        });
        child.stderr.on("data", d => { err += d; });

        return new Promise(resolve => {
            child.on("error", e => resolve({ error: `spawn failed: ${e.message}` }));
            child.on("close", code => resolve(state.result
                ? { text: state.result.result, session_id: state.session_id,
                    cost_usd: state.result.total_cost_usd, duration_ms: Date.now() - state.started }
                : { error: err.trim().slice(-400) || `claude exited ${code} with no result` }));
        });
    }

    event(line, state){
        let e;
        try { e = JSON.parse(line); } catch { return; }
        if (e.session_id) state.session_id = e.session_id;
        if (e.type === "result") state.result = e;
        if (e.type !== "assistant") return;

        for (const c of e.message?.content ?? []){
            if (c.type === "text") this.socket.rpc("ask_event", { id: state.id, text: c.text });
            if (c.type === "tool_use") this.socket.rpc("ask_event", { id: state.id, tool: c.name });
        }
    }

    /* The exchange joins the task's own log, as `chat` lines ext/JSONL replays.
     * Muted so the append doesn't live-reload the tab that is chatting. */
    record({ task, prompt, resume }, reply){
        const dir = thread_dir(task);
        if (!dir) return console.warn("Ask: refusing task path", task);

        const file = path.join(dir, "task.jsonl");
        if (!fs.existsSync(file)) return;

        const at = stamp();
        const lines = [{ chat: { at, role: "user", text: prompt } },
            { chat: { at, role: "assistant", text: reply.text, cost_usd: reply.cost_usd } }];
        if (!resume) lines.unshift({ assign: { chat_session_id: reply.session_id } });

        this.socket.socket_server?.live_reload?.mute(file, this.socket);
        fs.appendFileSync(file, lines.map(l => JSON.stringify(l)).join("\n") + "\n");
    }
}
