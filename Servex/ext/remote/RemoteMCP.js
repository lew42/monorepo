import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import express from "express";
import TaskDirs from "../../../Server/TaskDirs.mjs";

/* The remote MCP endpoint (POST /mcp/remote), behind a bearer token. It serves the SAME tool registry every local Claude
 * session gets (`servex.mcp`, read live, never copied) plus `ask_mastermind` on top; calls run as caller "voice-app".
 * Why and how to use it: public/framework/ux/Dictate/doc/voice-bridge.md. Reached through Server/Tunnel.mjs,
 * whose gateway forwards this one path and nothing else. */
export default class RemoteMCP {
    static PATH = "/mcp/remote";
    static DIR = path.join(process.env.LOCALAPPDATA ?? path.join(os.homedir(), "AppData", "Local"), "lew42", "servex");
    static TOKEN_FILE = path.join(RemoteMCP.DIR, "remote.token");
    static VERSION = "2025-03-26";
    // The one source of the voice-agent directives (the voice-mastermind skill must not copy them).
    static INSTRUCTIONS = [
        "FIRST, which kind of client are you? A Servex-spawned agent has a logged session and reads CLAUDE.md. You are a remote/cloud client (the Claude app): you have no local session, so nothing records your conversation unless you do it through this server. Every tool takes owner_words: put the owner's exact words that led to the call there, verbatim, every time; the server files them in today's voice session. Call register_session once at the start (no arguments needed) to get your session id for session_summary and session_line.",
        "You are the voice agent: the Claude app model talking with the owner by voice. The mastermind behind ask_mastermind is an SDK agent on the owner's PC.",
        "Fire ask_mastermind immediately, before saying anything; then speak.",
        "Summarize its answer for the ear, do not read it back. The mastermind is verbose on purpose, to give you context; you keep replies short.",
        "You also have every Servex tool a local session has (page_add, list_agents, send_to_agent, read_page, cards, and more). Use them for small, concrete things; ask_mastermind stays the door for anything that needs judgment or reading the repo.",
        "/live/ is your presentation screen: it shows only what you and the owner are discussing right now, the owner's current ask refined into structure, and you are its only author. When the topic changes, clear it first with page_set path \"/live/\" delta {\"content\":{\"clear\":true}}, then show the new topic with page_add path \"/live/\" and items such as {type: \"part-card\", title, text}. Never post heard or summary cards there.",
        "The owner's standing rule (2026-10-16): when the owner asks a question, put the answer on /live/ as a card first, then say \"take a look\" and keep the spoken reply to one or two sentences. A status answer (\"what's running\") is a card listing each agent's id, state, what it is on and its cost (list_agents has them); it is shown, not spoken.",
        "Never call restart_servex (or stop_server on Servex) during a call: it would drop your own connection. The owner picks the time.",
        "One question at a time. Relay open items (things waiting on the owner) before the call ends.",
        "The mastermind answers inside the tool's one-minute window with an ack and routing; minion results arrive on your next ask, so ask again to hear them.",
    ].join("\n");
    // One generic door that never changes: the app approves it once, and any tool added later is reachable through it (doc/remote-tools.md).
    static CALL = {
        name: "call",
        description: "Call any Servex tool by name, including ones added after this connector was approved: call({tool: \"shell\", args: {command: \"git status\"}}). tool \"list\" returns every tool name with its description and input schema.",
        inputSchema: { type: "object", properties: { tool: { type: "string" }, args: { type: "object" } }, required: ["tool"] },
    };
    static OWNER_WORDS = { type: "string", description: "The owner's exact words that led to this call, verbatim, every time (the server logs them; never paraphrase)." };
    static SESSIONS_FILE = "remote.sessions.json";
    static CALLER = "voice-app";
    static TOOL = {
        name: "ask_mastermind",
        description: "Ask the project's mastermind (the AI that coordinates this codebase, an SDK agent on the owner's PC) and wait up to a minute for its answer. You are the voice agent: call this FIRST, before saying anything, then summarize the answer briefly for the owner (do not read it back), ask one question at a time, and relay open items. The mastermind replies verbosely, for you, not for the owner.",
        inputSchema: { type: "object", properties: { question: { type: "string", description: "What to ask." } }, required: ["question"] },
    };

    /* servex: needs .agents (send, list, registry_list, task_dir_for); root: repo root; wait_ms: reply timeout */
    constructor({ servex, root, router, token_file = RemoteMCP.TOKEN_FILE, wait_ms = 60000, target } = {}){
        Object.assign(this, { servex, root, token_file, wait_ms, target });
        this.replies = path.join(path.dirname(token_file), "remote-replies");
        this.sessions_file = path.join(path.dirname(token_file), RemoteMCP.SESSIONS_FILE);
        this.sessions = this.load_sessions();   // session id -> { agent, dir, started, last }
        this.spawning = new Map();              // session id -> promise, so two first asks make one agent
        this.token = this.load_token();
        if (router) this.mount(router);
    }

    // random 32 bytes, written once, never logged
    load_token(){
        try { return fs.readFileSync(this.token_file, "utf8").trim(); } catch {}
        const token = crypto.randomBytes(32).toString("hex");
        fs.mkdirSync(path.dirname(this.token_file), { recursive: true });
        fs.writeFileSync(this.token_file, token, { mode: 0o600 });
        return token;
    }

    load_sessions(){
        try { return JSON.parse(fs.readFileSync(this.sessions_file, "utf8")); } catch { return {}; }
    }

    save_sessions(){
        try { fs.writeFileSync(this.sessions_file, JSON.stringify(this.sessions, null, 1)); } catch {}
    }

    mount(router){
        const p = RemoteMCP.PATH;
        // the token may ride in the path (/mcp/remote/<token>): the Claude app's connector dialog has no header field
        router.post([p, p + "/:token"], express.json({ limit: "256kb" }), (req, res) => this.post(req, res));
        router.all([p, p + "/:token"], (req, res) => res.status(405).set("Allow", "POST").end());
    }

    authed(req){
        const given = /^Bearer (.+)$/.exec(req.headers.authorization ?? "")?.[1] ?? req.params.token;
        if (!given) return false;
        const a = Buffer.from(given), b = Buffer.from(this.token);
        return a.length === b.length && crypto.timingSafeEqual(a, b);
    }

    async post(req, res){
        if (!this.authed(req)) return res.status(401).set("WWW-Authenticate", "Bearer").json({ error: "bearer token required" });
        let { id, method, params } = req.body ?? {};
        const ok = result => res.json({ jsonrpc: "2.0", id, result });
        const bad = (code, message) => res.json({ jsonrpc: "2.0", id, error: { code, message } });
        if (id === undefined) return res.status(202).end();   // a notification (notifications/initialized)
        if (method === "initialize"){
            const sid = crypto.randomUUID();
            this.sessions[sid] = { agent: null, dir: null, started: new Date().toISOString(), last: new Date().toISOString() };
            this.save_sessions();
            res.set("Mcp-Session-Id", sid);
        }
        if (method === "initialize") return ok({ protocolVersion: params?.protocolVersion ?? RemoteMCP.VERSION, capabilities: { tools: {} }, serverInfo: { name: "lew42-remote", version: "1" }, instructions: RemoteMCP.INSTRUCTIONS });
        if (method === "ping") return ok({});
        if (method === "tools/list") return ok({ tools: this.tools() });
        if (method === "tools/call"){
            const header_sid = req.headers["mcp-session-id"] || `voice-${TaskDirs.day(new Date())}`;
            params = this.intercept(params, header_sid);
            if (params.done) return ok(params.done);
            if (params?.name === RemoteMCP.CALL.name){
                const { tool, args } = params.arguments ?? {};
                if (tool === "list") return ok({ content: [{ type: "text", text: JSON.stringify(this.tools().map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema }))) }] });
                if (tool === RemoteMCP.TOOL.name) params = { name: tool, arguments: args };
                else try { return ok(await this.servex.mcp.call(tool, args ?? {}, { caller: RemoteMCP.CALLER })); }
                catch (e) { return bad(e.code ?? -32603, String(e.message || e)); }
            }
            if (params?.name !== RemoteMCP.TOOL.name){
                // every other tool is the servex registry's own handler; the caller is this app, so writes say who made them
                try { return ok(await this.servex.mcp.call(params?.name, params?.arguments ?? {}, { caller: RemoteMCP.CALLER })); }
                catch (e) { return bad(e.code ?? -32603, String(e.message || e)); }
            }
            const question = String(params.arguments?.question ?? "").trim().slice(0, 4000);
            if (!question) return bad(-32602, "question is required");
            const started = Date.now();
            let text;
            const sid = req.headers["mcp-session-id"] || `voice-${new Date().toISOString().slice(0, 10)}`;
            let used = {};
            try { text = await this.ask(question, sid, used); } catch (e) { text = `could not reach the mastermind: ${e.message}`; }
            this.log(question, Date.now() - started, sid, used.agent);
            return ok({ content: [{ type: "text", text }] });
        }
        return bad(-32601, "method not found");
    }

    // the one registry (servex.mcp, read at call time so late registrations show up) with ask_mastermind on top
    tools(){
        const all = [RemoteMCP.TOOL, RemoteMCP.CALL, ...(this.servex.mcp?.tools ?? []).filter(t => t.name !== RemoteMCP.TOOL.name && t.name !== RemoteMCP.CALL.name)];
        return all.map(t => ({ ...t, inputSchema: { ...(t.inputSchema ?? { type: "object" }), properties: { ...(t.inputSchema?.properties ?? {}), owner_words: RemoteMCP.OWNER_WORDS } } }));
    }

    /* Voice logging (doc/voice-logging.md): strip owner_words from the arguments, file it, log every call, and give a cloud
     * caller a session to write summaries to. Returns the params to dispatch, or { done } when the call is answered here. */
    intercept(params, sid){
        const name = params?.name;
        let args = { ...(params?.arguments ?? {}) };
        const words = [args.owner_words]; delete args.owner_words;
        if (name === RemoteMCP.CALL.name && args.args && typeof args.args === "object"){ words.push(args.args.owner_words); args.args = { ...args.args }; delete args.args.owner_words; }
        const inner = name === RemoteMCP.CALL.name ? args.tool : name;
        const target = name === RemoteMCP.CALL.name ? (args.args ??= {}) : args;
        let v = null;
        try { v = this.voice_session(sid); } catch (e) { console.error("remote-mcp: voice session:", e.message); }
        this.record(v, inner, words.find(w => typeof w === "string" && w.trim()), { tool: inner, args: target }, sid);
        if (v && /^(session_summary|session_line|quick_fix)$/.test(inner) && !this.servex.sessions?.map?.[target.session]) target.session = v.id;
        if (v && inner === "register_session" && !target.id){
            return { done: { content: [{ type: "text", text: JSON.stringify({ ok: true, session: v.id, file: v.file, note: "You are a cloud caller: use this session id for session_summary and session_line. Pass owner_words on every tool call." }) }] } };
        }
        return { ...params, arguments: args };
    }

    // today's voice session for this MCP session: minted once through the Sessions store (no third store), else a plain day folder
    voice_session(sid){
        const s = this.sessions[sid] ??= { agent: null, dir: null, started: new Date().toISOString(), last: null };
        if (s.voice && fs.existsSync(path.join(this.root, "public", s.voice.file))) return s.voice;
        const store = this.servex.sessions;
        if (!store?.create) return null;   // Servex without its session layer (SERVEX_NO_LAYERS): nowhere to file it, and no third store
        let id, file;
        const p = store.prewarm; store.prewarm = false;   // a cloud caller has no drawer to warm an agent for
        try { ({ session: id, file } = store.create({ path: "/live/", fresh: true })); } finally { store.prewarm = p; }
        const row = store.map?.[id]; if (row){ row.caller = RemoteMCP.CALLER; store.save?.(); }
        const abs = path.join(this.root, "public", file);
        if (!fs.existsSync(abs)){
            fs.mkdirSync(path.dirname(abs), { recursive: true });
            fs.appendFileSync(abs, JSON.stringify({ session: { id, kind: "voice", caller: RemoteMCP.CALLER, at: Date.now() } }) + "\n");
        }
        s.voice = { id, file };
        this.save_sessions();
        return s.voice;
    }

    // one line for the words (once per distinct text), one for the call (name + args hash): a call without words is a visible gap
    record(v, tool, words, call, sid){
        if (!v) return;
        const abs = path.join(this.root, "public", v.file), at = new Date().toISOString();
        const text = words?.trim();
        const s = this.sessions[sid], fresh = text && text !== s.last_words;
        try {
            if (fresh){ s.last_words = text; fs.appendFileSync(abs, JSON.stringify({ owner_words: { at, words: text, tool, caller: RemoteMCP.CALLER } }) + "\n"); }
            const hash = crypto.createHash("sha256").update(JSON.stringify(call.args ?? {})).digest("hex").slice(0, 12);
            fs.appendFileSync(abs, JSON.stringify({ tool_call: { at, tool, args_hash: hash, owner_words: !!text, caller: RemoteMCP.CALLER } }) + "\n");
        } catch (e) { console.error("remote-mcp: voice log write failed:", e.message); }
    }

    // REMOTE_MCP_TARGET / this.target / the file remote.target still override everything: one fixed agent for every session
    override(){
        let named = this.target ?? process.env.REMOTE_MCP_TARGET;
        try { named ??= fs.readFileSync(path.join(path.dirname(this.token_file), "remote.target"), "utf8").trim() || undefined; } catch {}
        return named;
    }

    dir_of(id){
        const a = this.servex.agents;
        return a.task_dir_for(a.registry_list().find(r => r.id === id) ?? { id });
    }

    // the agent for this voice session: the stored one, else spawn it (once, even for two simultaneous first asks)
    async agent_for(sid){
        const named = this.override();
        if (named) return { id: named, dir: this.dir_of(named) };
        const s = this.sessions[sid] ??= { agent: null, dir: null, started: new Date().toISOString(), last: null };
        if (s.agent) return { id: s.agent, dir: s.dir };
        if (!this.spawning.has(sid)) this.spawning.set(sid, this.spawn(sid, s).finally(() => this.spawning.delete(sid)));
        return this.spawning.get(sid);
    }

    // 1:1 — a fresh mastermind for this session, with a task dir under ai/sessions/YYYY/MM/DD/ and a card
    async spawn(sid, s){
        const short = sid.replace(/^voice-/, "").replace(/-/g, "").slice(0, 8);
        const now = new Date(), day = TaskDirs.day(now), [y, m, d] = day.split("-");
        const dir = `public/framework/ai/sessions/${y}/${m}/${d}/voice-${short}`;
        const when = `${day} ${now.toTimeString().slice(0, 5)}`;
        let card;
        try { card = JSON.parse(await this.servex.cards.tools().find(t => t.name === "create_card").handler({ title: `Voice session ${when}`, type: "note", by: "remote-mcp" })).id; } catch {}
        const prompt = `Load the voice-mastermind skill first. You are the mastermind of voice session ${sid}. Your task dir is ${dir}/ (task.jsonl is already open)${card ? ` and your card is ${card}` : ""}. Each owner question arrives as a message that names a reply file: answer by writing plain text to it. The gateway already writes the question and answer chat lines into your task.jsonl, so skip that part of the skill and log your own work (agents, decisions) there. Wait for the first question.`;
        const agent = this.servex.agents.spawn({ role: "mastermind", name: `voice-${short}`, prompt, model: "claude-opus-5-5", dormant_after: 600, permission_mode: "bypassPermissions", task: { dir, ...(card ? { card } : {}) } });
        Object.assign(s, { agent: agent.id, dir });
        this.save_sessions();
        return { id: agent.id, dir };
    }

    async ask(question, sid, used = {}){
        let { id, dir } = await this.agent_for(sid);
        const qid = crypto.randomBytes(4).toString("hex");
        const out = path.join(this.replies, qid + ".txt");
        fs.mkdirSync(this.replies, { recursive: true });
        const msg = `The owner asks by voice (question ${qid}): "${question}"\nAnswer for the voice agent, which will decide how to say it aloud: the answer first, then the context it needs to hold a conversation (what it is, where it lives, what is open, alternatives, a link or two); a few short paragraphs at most. Reply by writing your answer as plain text to ${out} (one file write, nothing else).`;
        try { this.servex.agents.send(id, msg, { from: "owner (voice)" }); }
        catch (e) {
            // the stored agent was stopped on purpose or landed: this session gets a fresh one
            if (this.override() || !this.sessions[sid]) throw e;
            Object.assign(this.sessions[sid], { agent: null, dir: null });
            ({ id, dir } = await this.agent_for(sid));
            this.servex.agents.send(id, msg, { from: "owner (voice)" });
        }
        used.agent = id;
        if (this.sessions[sid]) { this.sessions[sid].last = new Date().toISOString(); this.save_sessions(); }
        const file = dir ? path.resolve(this.root, dir, "task.jsonl") : null;
        const rel = dir ? path.relative(this.root, path.resolve(this.root, dir)).replace(/\\/g, "/") : null;
        const link = rel ? "/" + rel + "/" : "its task page";
        const chat = (from, text) => { if (file) try { fs.appendFileSync(file, JSON.stringify({ chat: { from, id: qid, text, at: new Date().toISOString() } }) + "\n"); } catch {} };
        chat("owner (voice)", question);
        const until = Date.now() + this.wait_ms;
        while (Date.now() < until){
            await new Promise(r => setTimeout(r, 500));
            if (fs.existsSync(out)){ const t = fs.readFileSync(out, "utf8").trim(); if (t){ chat("voice-mastermind", t); return t; } }
        }
        return `the mastermind is busy; the question is logged at ${link}`;
    }

    // one line per call, never the token
    log(question, ms, session, agent){
        const line = JSON.stringify({ remote_mcp: { who: "owner (voice)", tool: "ask_mastermind", what: question.slice(0, 200), at: new Date().toISOString(), ms, session, agent } }) + "\n";
        try { fs.appendFileSync(path.join(this.root, "public/framework/ai/log.jsonl"), line); } catch {}
    }
}
