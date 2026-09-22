import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import stamp from "../stamp.js";

const now = () => stamp();

/* The `assistant` turn config, and its record-keeping — split out of `Ask.js` so that
 * file stays "one browser message, one `claude -p` turn" and nothing more. This is a
 * plain module, not a `Socket` plugin: nothing here listens on the wire directly, so
 * there is no `DevSocket.Socket.use(...)` line to add in `run.js`. `Ask.js` calls
 * straight into these static methods at the points in `ask()` where a preset applies —
 * see `ext/Ask/doc/decisions.md`'s "The assistant preset" for the full reasoning.
 *
 * ⚠ Env overrides for testing, read once per call so a private test server never
 * touches the owner's real board or the real mastermind's inbox:
 *   ASSISTANT_BOARD   — the board.jsonl this writes `card`/`chunk` lines to
 *                        (default: public/framework/ai/v/3/board.jsonl)
 *   ASSISTANT_LEDGER  — when set, `relay()` appends here directly instead of spawning
 *                        say.mjs against the real mastermind run */
export default class Assistant {

    /* A preset the client can NAME instead of spelling out model/effort/tools/system
     * itself — today just "assistant": Sonnet, the lowest effort the CLI offers
     * (`--effort low`; confirmed against `claude -p --help`, no lower level exists),
     * a pure-text turn (no tools — nothing here needs one, and every tool call the
     * model can't complete under `-p` with no permission prompt just burns the first
     * few seconds the whole feature exists to save), and this persona instead of the
     * VS-code-tab `assistant` skill's full text (that text tells the model to run
     * `say.mjs heard`/`say` itself over Bash — wrong here, because THIS SERVER does
     * that recording at `ask_done`, and the preset has no Bash tool to run it with
     * anyway). See the "skill as system prompt vs first message" measurement in this
     * task's log for why system-prompt injection is the shipped default. */
    static SYSTEM = `You are the owner's assistant: a fast, light front desk beside a running mastermind system that does the actual building. Speed is the whole point — answer in two or three short, plain sentences, the way you would in voice mode. You do no building and you read no code. When the owner asks for something to be built, decided or investigated, say plainly that you are passing it to the mastermind and nothing more — deciding it is not your job. Never write the owner's name anywhere; say "you".`;

    static preset(name){
        if (name !== "assistant") return null;
        // `tools: ""` alone is not enough — it only turns off the BUILT-IN tools;
        // `.mcp.json`'s `site` MCP server still reaches a headless turn regardless
        // (found live, proving this task's own demo: the model opened a `tool_use`
        // block anyway). `strict_mcp` adds `--strict-mcp-config` with no MCP servers
        // of its own, which empties BOTH lists — see `Ask.js`'s `args()`.
        return { model: "sonnet", effort: "low", tools: "", strict_mcp: true, system: this.SYSTEM };
    }

    /* One resumed session per browser TAB, kept here rather than sent back and forth
     * by the client — "store the session id server-side per browser tab, the way Ask
     * does" (the brief). A tab that never got a reply yet has no entry, so the first
     * message of a tab's assistant conversation starts fresh, same as `Ask.js`'s own
     * "first message forks / every later one resumes" rule, minus the fork (an
     * assistant persona needs no task transcript to inherit). */
    static sessions = new Map();
    static resume(tab_id){ return tab_id ? this.sessions.get(tab_id) : undefined; }
    static remember(tab_id, session_id){ if (tab_id && session_id) this.sessions.set(tab_id, session_id); }

    static board(){ return path.resolve(process.env.ASSISTANT_BOARD || "public/framework/ai/v/3/board.jsonl"); }

    static append(entry){
        const file = this.board();
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.appendFileSync(file, JSON.stringify(entry) + "\n");
    }

    /* Send time: the owner's words land on the board AT ONCE, before the turn has
     * generated a single token — "every owner prompt shows word for word in the log
     * the instant it is submitted, before any answer" (the owner, 2026-09-19). The
     * reply's own card is written empty and "working" in the same breath, so the
     * board already has somewhere for the coming chunks to land. Returns the reply
     * card's id — `chunk()`/`finish()` take it. */
    static start({ prompt }){
        const at = now(), hhmmss = at.slice(11, 19).replaceAll(":", "");
        const reply_id = "a-" + hhmmss;
        this.append({ card: { at, id: "o-" + hhmmss, author: "owner", title: String(prompt ?? "").slice(0, 90), text: prompt ?? "" } });
        this.append({ card: { at, id: reply_id, author: "assistant", title: "", text: "", status: "working" } });
        return reply_id;
    }

    /* Chunks are batched — "flush every ~150ms or 40 characters, whichever comes
     * first — never one line per token" (the coordinator's addition): the board is
     * a file every open tab tails, and a line per token would be hundreds of writes
     * and hundreds of socket frames for one short reply. One pending buffer per
     * reply id; `finish()` flushes whatever is left. */
    static buffers = new Map();

    static chunk(id, text){
        const b = this.buffers.get(id) ?? { text: "", timer: null };
        b.text += text;
        this.buffers.set(id, b);
        if (b.text.length >= 40) return this.flush(id);
        b.timer ??= setTimeout(() => this.flush(id), 150);
    }

    static flush(id){
        const b = this.buffers.get(id);
        if (!b) return;
        clearTimeout(b.timer);
        if (b.text) this.append({ chunk: { at: now(), id, text: b.text } });
        this.buffers.set(id, { text: "", timer: null });
    }

    static finish(id, text){
        this.flush(id);
        this.buffers.delete(id);
        this.append({ card: { at: now(), id, author: "assistant", title: String(text ?? "").slice(0, 90), text: text ?? "", status: "done" } });
    }

    /* The owner's words, into the mastermind's inbox — reusing `say.mjs`'s own
     * `run()` (find the newest unlanded mastermind run's own task.jsonl) and its
     * `relay` verb by SPAWNING it, not reimplementing that search here. `spawn` with an argv
     * array never goes through a shell, so — unlike the CLI usage `say.mjs`'s own
     * header warns about — an apostrophe or a quote in the owner's words is not a
     * hazard: there is no shell to see them.
     * `ASSISTANT_LEDGER` is the test env override: set, it appends the same shape
     * straight to a scratch file instead, so a private test server's turns never
     * reach the real mastermind's real task.jsonl. */
    static relay(text){
        const ledger = process.env.ASSISTANT_LEDGER;
        if (ledger){
            const file = path.resolve(ledger);
            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.appendFileSync(file, JSON.stringify({ chat: { at: now(), from: "owner", via: "assistant", msg: text } }) + "\n");
            return;
        }
        const say = path.resolve(".claude/skills/every-prompt/say.mjs");
        const child = spawn(process.execPath, [say, "relay", text ?? ""], { windowsHide: true });
        child.on("error", e => console.warn("Assistant: relay spawn failed —", e.message));
    }
}
