import { spawn } from "child_process";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import shot from "./Shot.js";
import stamp from "../stamp.js";
import Assistant from "./Assistant.js";

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

        /* A named preset (today: "assistant") picks the model/effort/tools/system for
         * the caller — see Assistant.js. It also owns its own session continuity per
         * browser tab, so a preset caller never has to pass `resume` itself. */
        const preset = req.preset && Assistant.preset(req.preset);
        const stream = !!(req.stream || preset);
        if (preset) req.resume = req.resume || Assistant.resume(tab?.id);

        /* The "assistant" preset does its own record-keeping — the owner's words and
         * the reply as `card`/`chunk` lines on the board, and a relay to the
         * mastermind's inbox — because the browser side of this preset (the demo page,
         * later the dev bar's composer) never passes `task`, so `record()` below has
         * nothing to write to. `reply_id` is only set for that preset. */
        const reply_id = req.preset === "assistant" ? Assistant.start({ prompt: req.prompt }) : null;

        try {
            const file = req.shot && await shot(req.shot);
            const reply = await this.turn({ ...req, ...preset, stream,
                system: preset ? preset.system : this.system(req),
                on_chunk: reply_id ? text => Assistant.chunk(reply_id, text) : undefined,
                board_id: reply_id,
                prompt: file ? `Read the screenshot at ${file}, then: ${req.prompt}` : req.prompt });

            if (req.task && !reply.error) this.record(req, reply);
            if (preset && !reply.error) Assistant.remember(tab?.id, reply.session_id);
            if (reply_id){
                Assistant.finish(reply_id, reply.error ? `Something went wrong: ${reply.error}` : reply.text);
                Assistant.relay(req.prompt);
            }
            /* `ask_done` is the streaming client's own signal — `ext/Ask/stream.js` — so it
             * fires whether the turn is fine or failed; the plain `ask()` caller (`Ask.js`'s
             * own client, `chat.js`) never sees it, because neither passes `stream`. `board_id`
             * (only set for the "assistant" preset) is the id of the SAME reply as a card on
             * `board.jsonl` — a caller comparing "first chunk over the rpc" against "first
             * chunk from tailing the board" needs it to know which board entry to watch. */
            if (stream) this.socket.rpc("ask_done", { turn: req.id, text: reply.text, session_id: reply.session_id,
                board_id: reply_id || undefined,
                ms_to_first_chunk: reply.ms_to_first_chunk, ms_total: reply.ms_total, error: reply.error });

            this.socket.send({ index, ...reply });
        } catch (e){
            if (stream) this.socket.rpc("ask_done", { turn: req.id, error: String(e.message || e) });
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
     * a test can assert on it without spawning anything. `effort` is the CLI's own
     * `--effort low|medium|high|xhigh|max` (confirmed on the installed CLI — there is
     * no level below "low"). `stream` adds `--include-partial-messages`, which is what
     * turns the ordinary one-block-at-a-time output (`turn()`'s existing behaviour,
     * unchanged for a plain `ask()` call) into text arriving as it is generated.
     * ⚠ `tools: ""` disables only the BUILT-IN tool set — `.mcp.json`'s `site` MCP server
     * still reaches every headless turn regardless, because `--tools` never governed MCP
     * servers in the first place (found live: an "assistant" turn given `tools: ""` still
     * opened a `tool_use` content block, presumably for a `site` tool). `strict_mcp` adds
     * `--strict-mcp-config` with no `--mcp-config` of its own, which the CLI documents as
     * "only use MCP servers from --mcp-config" — none named means none loaded; confirmed
     * with a scratch run showing `mcp_servers: []` and `tools: []` in the turn's own
     * `system/init` event. A caller wanting a truly tool-free turn passes BOTH. */
    args({ resume, from, model = "sonnet", tools, system, effort, stream, strict_mcp }){
        const args = ["-p", "--output-format", "stream-json", "--verbose", "--model", model];
        if (resume) args.push("--resume", resume);
        else if (from) args.push("--resume", from, "--fork-session");
        else args.push("--session-id", randomUUID());
        if (tools != null) args.push("--tools", tools);
        if (system) args.push("--append-system-prompt", system);
        if (effort) args.push("--effort", effort);
        if (stream) args.push("--include-partial-messages");
        if (strict_mcp) args.push("--strict-mcp-config");
        return args;
    }

    turn(req){
        const { id, prompt, stream, on_chunk, board_id } = req;
        const child = spawn(process.env.CLAUDE_BIN || "claude", this.args(req), { windowsHide: true });
        child.stdin.end(prompt ?? "");

        /* A closed browser tab must not leave a turn running to a reply nobody will
         * ever see — real tokens, for nothing. Scoped to STREAMING turns only: a
         * plain `ask()` (chat.js's own thread panel) still finishes and records the
         * exchange even after the tab closes, which is today's behaviour and arguably
         * the right one there — the owner may reopen the tab and expect the answer
         * waiting. Streaming is different: it exists only to paint a LIVE tab, so a
         * gone tab means the turn has no reason left to keep running. */
        const kill = () => child.kill();
        if (stream) this.socket.once("closed", kill);

        const state = { id, started: Date.now(), stream, on_chunk, board_id };
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
            child.on("close", code => {
                if (stream) this.socket.off("closed", kill);
                resolve(state.result
                    ? { text: state.result.result, session_id: state.session_id,
                        cost_usd: state.result.total_cost_usd, duration_ms: Date.now() - state.started,
                        ms_to_first_chunk: state.first_chunk_at ? state.first_chunk_at - state.started : null,
                        ms_total: Date.now() - state.started }
                    : { error: err.trim().slice(-400) || `claude exited ${code} with no result` });
            });
        });
    }

    event(line, state){
        let e;
        try { e = JSON.parse(line); } catch { return; }
        if (e.session_id) state.session_id = e.session_id;
        if (e.type === "result") state.result = e;
        if (e.type === "stream_event" && state.stream) this.delta(e.event, state);
        if (e.type !== "assistant") return;

        for (const c of e.message?.content ?? []){
            if (c.type === "text") this.socket.rpc("ask_event", { id: state.id, text: c.text });
            if (c.type === "tool_use") this.socket.rpc("ask_event", { id: state.id, tool: c.name });
        }
    }

    /* One raw event from `--include-partial-messages` — the Anthropic API's own
     * streaming shape, one level down inside `{type: "stream_event", event}`
     * (confirmed against the installed CLI with a ten-second scratch run, not the
     * docs — `ai/2026-09-19/assistant-stream/task.jsonl` has the capture). A
     * `text_delta` is a word or two of the reply and goes out at once, append-only,
     * as `ask_chunk`; `ext/Ask/stream.js` is the one reader. A tool starting is never
     * forwarded as the raw `tool_use` JSON a browser has no business seeing — one
     * short status chunk instead, same spirit as the existing `ask_event` tool line. */
    delta(ev, state){
        if (ev?.type === "content_block_delta" && ev.delta?.type === "text_delta"){
            const text = ev.delta.text ?? "";
            if (!state.first_chunk_at) state.first_chunk_at = Date.now();
            state.seq = (state.seq ?? 0) + 1;
            this.socket.rpc("ask_chunk", { turn: state.id, seq: state.seq, text, board_id: state.board_id });
            state.on_chunk?.(text);
        } else if (ev?.type === "content_block_start" && ev.content_block?.type === "tool_use"){
            state.seq = (state.seq ?? 0) + 1;
            this.socket.rpc("ask_chunk", { turn: state.id, seq: state.seq, text: "reading the state… ", board_id: state.board_id });
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
