import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import express from "express";
import TaskDirs from "../../../Server/TaskDirs.mjs";
import DatedFiles from "../../../Server/DatedFiles.mjs";

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
        "If you are a cloud voice agent (no CLAUDE.md on your machine, not running in the monorepo), read `Servex/ext/remote/doc/cloud-voice-agent.md` with read_file before anything else.",
        "You are the voice agent: the Claude app model talking with the owner by voice. You relay: the work is done by Servex agents on the owner's PC, and you have every Servex tool a local session has.",
        "Hand work to agents. list_agents shows who is running and on what; send_to_agent({id, text, from: \"voice-app\"}) gives a running agent the next ask (the one already on that project, so it keeps its context); spawn_agent({role: \"mastermind\", name, prompt}) starts one for a new project (add path: \"<folder>\" to make it that folder's mastermind). Say in a sentence what you handed to whom, then keep talking; never wait in silence.",
        "Agents answer by message: their replies reach you through updates. Summarize a reply for the ear, do not read it back; agents are verbose on purpose, you keep replies short. Small, concrete things (a card, a page_set, a read_page) you do yourself.",
        "ask_mastermind is deprecated: it starts a separate voice-<id> mastermind session with its own reply-file protocol. Do not call it; use spawn_agent and send_to_agent.",
        "/live/ is your presentation screen: it shows only what you and the owner are discussing right now, the owner's current ask refined into structure, and you are its only author. When the topic changes, clear it first with page_set path \"/live/\" delta {\"content\":{\"clear\":true}}, then show the new topic with page_add path \"/live/\" and items such as {type: \"part-card\", title, text}. Never post heard or summary cards there.",
        "The owner's standing rule (2026-10-16): when the owner asks a question, put the answer on /live/ as a card first, then say \"take a look\" and keep the spoken reply to one or two sentences. A status answer (\"what's running\") is a card listing each agent's id, state, what it is on and its cost (list_agents has them); it is shown, not spoken.",
        "Never call restart_servex (or stop_server on Servex) during a call: it would drop your own connection. The owner picks the time.",
        "One question at a time. Relay open items (things waiting on the owner) before the call ends.",
        "Call `updates` at the start of nearly every turn: it returns only what arrived for you since your last call (agent messages, the owner's notes, changes to logs you follow). Subscribe to a log with follow({path, agent: \"voice-app\"}).",
    ].join("\n");
    // The bridge's listening tool (voice-bridge, 2026-11-01): a short long-poll on one ask's ticket. Remote route only.
    static HEAR = {
        name: "voice_hear",
        description: "Cloud voice agents: hear what the mastermind has said so far on an ask (its status, what it is doing, its first words, the answer). Returns the moment anything new arrives, or after wait_s (default 8, max 20). Every reply carries the whole state, so a call cut off by noise loses nothing. Leave ticket out for your latest ask.",
        inputSchema: { type: "object", properties: { ticket: { type: "string" }, wait_s: { type: "number", description: "Default 8, at most 20." } } },
    };
    // One generic door that never changes: the app approves it once, and any tool added later is reachable through it (doc/remote-tools.md).
    static CALL = {
        name: "call",
        description: "Call any Servex tool by name, including ones added after this connector was approved: call({tool: \"shell\", args: {command: \"git status\"}}). tool \"list\" returns every tool name with its description and input schema.",
        inputSchema: { type: "object", properties: { tool: { type: "string" }, args: { type: "object" } }, required: ["tool"] },
    };
    // The ONE cloud-only voice tool (owner, 2026-10-19): the owner's verbatim prompt goes to the session log. Only this remote route lists it; local SDK agents never see it.
    static LOG = {
        name: "cloud_voice_log",
        description: "Cloud voice agents only: file the owner's exact words, verbatim, in your session log. Call it first when the owner speaks, before answering. Guide: Servex/ext/remote/doc/cloud-voice-agent.md",
        inputSchema: { type: "object", properties: { words: { type: "string", description: "The owner's exact words, verbatim; never paraphrase." } }, required: ["words"] },
    };
    static REGISTER_DESCRIPTION = "Cloud voice agents: call once at the start, with a short title, to get your session id (for session_summary and session_line). Guide: Servex/ext/remote/doc/cloud-voice-agent.md";
    static SESSIONS_FILE = "remote.sessions.json";
    static CALLER = "voice-app";
    static TOOL = {
        name: "ask_mastermind",
        description: "DEPRECATED (2026-11-06): use send_to_agent to an agent already on the project, or spawn_agent for a new one; their replies arrive through updates. This tool starts a separate voice-<id> mastermind session. Ask the project's mastermind (the AI that coordinates this codebase, an SDK agent on the owner's PC). It waits a few seconds: you get the answer, or a ticket with the mastermind's status and first words to say while it works (wait:false returns the ticket at once). The answer rides along on your next tool result, or call voice_hear. You are the voice agent: call this FIRST, before saying anything, then summarize the answer briefly for the owner (do not read it back), ask one question at a time, and relay open items. The mastermind replies verbosely, for you, not for the owner.",
        inputSchema: { type: "object", properties: { question: { type: "string", description: "What to ask." }, wait: { type: "boolean", description: "Default true (a few seconds). false returns a ticket at once." }, to: { type: "string", description: "Optional: ask this agent instead of your voice mastermind, e.g. vscode-mastermind." } }, required: ["question"] },
    };

    /* servex: needs .agents (send, list, registry_list, task_dir_for; watch, live: optional, for the bridge); root: repo root;
     * wait_ms: how long ask_mastermind waits before it returns a ticket (REMOTE_MCP_WAIT_MS, default 8 s; was 60 s) */
    constructor({ servex, root, router, token_file = RemoteMCP.TOKEN_FILE, wait_ms = Number(process.env.REMOTE_MCP_WAIT_MS) || 8000, late_ms = 1800000, target } = {}){
        Object.assign(this, { servex, root, token_file, wait_ms, late_ms, target });
        this.tickets = new Map();               // ticket -> what the mastermind has said so far on that ask (see ticket())
        this.turn_words = new Map();            // agent id -> its running turn's words, for heard_event's idle fallback
        this.listen();
        this.replies = path.join(path.dirname(token_file), "remote-replies");
        this.sessions_file = path.join(path.dirname(token_file), RemoteMCP.SESSIONS_FILE);
        this.sessions = this.load_sessions();   // session id -> { agent, dir, started, last }
        this.spawning = new Map();              // session id -> promise, so two first asks make one agent
        this.token = this.load_token();
        this.open = new Map();                  // "session:rpc id" -> the open ask's `used`, so notifications/cancelled can reach it
        this.sweep();                           // an answer written while Servex was down still reaches the inbox
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
        if (id === undefined){   // a notification (notifications/initialized, notifications/cancelled)
            if (method === "notifications/cancelled" && params?.requestId !== undefined){
                const u = this.open.get(`${req.headers["mcp-session-id"] || `voice-${TaskDirs.day(new Date())}`}:${params.requestId}`);
                if (u) u.cancel = true;
            }
            return res.status(202).end();
        }
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
            if (params.done) return ok(this.ride(params.done, header_sid));
            if (params?.name === RemoteMCP.CALL.name){
                const { tool, args } = params.arguments ?? {};
                if (tool === "list") return ok({ content: [{ type: "text", text: JSON.stringify(this.tools().map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema }))) }] });
                if (tool === RemoteMCP.TOOL.name || tool === RemoteMCP.HEAR.name) params = { name: tool, arguments: args };
                else try { return ok(this.after(tool, header_sid, await this.servex.mcp.call(tool, args ?? {}, { caller: RemoteMCP.CALLER }), args)); }
                catch (e) { return bad(e.code ?? -32603, String(e.message || e)); }
            }
            if (params?.name === RemoteMCP.HEAR.name){
                    return ok({ content: [{ type: "text", text: JSON.stringify(await this.hear(params.arguments ?? {}, header_sid, () => res.destroyed || !!res.socket?.destroyed)) }] });
            }
            if (params?.name !== RemoteMCP.TOOL.name){
                // every other tool is the servex registry's own handler; the caller is this app, so writes say who made them
                try { return ok(this.after(params?.name, header_sid, await this.servex.mcp.call(params?.name, params?.arguments ?? {}, { caller: RemoteMCP.CALLER }), params?.arguments)); }
                catch (e) { return bad(e.code ?? -32603, String(e.message || e)); }
            }
            const question = String(params.arguments?.question ?? "").trim().slice(0, 4000);
            if (!question) return bad(-32602, "question is required");
            const started = Date.now();
            let text;
            const sid = header_sid;   // one key for asks, voice_hear, ride and cancels (it was the UTC date here, the local date elsewhere)
            let used = {};
            used.wait = params.arguments?.wait !== false;
            used.to = typeof params.arguments?.to === "string" && params.arguments.to.trim() ? params.arguments.to.trim() : null;
            used.cancelled = () => used.cancel === true || res.destroyed || !!res.socket?.destroyed;   // the app cancelled or dropped the call: stop waiting, keep watching
            const key = `${sid}:${id}`;
            this.open.set(key, used);
            try { text = await this.ask(question, sid, used); } catch (e) { text = `could not reach the mastermind: ${e.message}`; }
            finally { this.open.delete(key); }
            this.log(question, Date.now() - started, sid, used.agent);
            return ok({ content: [{ type: "text", text }] });
        }
        return bad(-32601, "method not found");
    }

    // the one registry (servex.mcp, read at call time so late registrations show up) with ask_mastermind on top
    tools(){
        const own = [RemoteMCP.TOOL.name, RemoteMCP.CALL.name, RemoteMCP.LOG.name, RemoteMCP.HEAR.name], all = [RemoteMCP.TOOL, RemoteMCP.HEAR, RemoteMCP.CALL, RemoteMCP.LOG, ...(this.servex.mcp?.tools ?? []).filter(t => !own.includes(t.name))];
        return all.map(t => t.name === "register_session" ? { ...t, description: RemoteMCP.REGISTER_DESCRIPTION, inputSchema: { type: "object", properties: { title: { type: "string", description: "A short name for this conversation, e.g. live page; the session is filed as cloud-voice-<name>." }, cost: { type: "number", description: "Your own cost so far in USD, if you know it (optional)." } } } } : t);
    }

    /* Voice logging (doc/voice-logging.md): file cloud_voice_log words, log every call, and give a cloud
     * caller a session to write summaries to. Returns the params to dispatch, or { done } when the call is answered here. */
    intercept(params, sid){
        const name = params?.name;
        let args = { ...(params?.arguments ?? {}) };
        const inner = name === RemoteMCP.CALL.name ? args.tool : name;
        const target = name === RemoteMCP.CALL.name ? (args.args ??= {}) : args;
        let v = null;
        const registering = inner === "register_session" && !target.id;   // a cloud caller names its session here; a local agent passes an id
        if (registering && typeof target.title === "string" && target.title.trim()) (this.sessions[sid] ??= { agent: null, dir: null, started: new Date().toISOString(), last: null }).voice_name = target.title, this.save_sessions();
        try { v = this.voice_session(sid); } catch (e) { console.error("remote-mcp: voice session:", e.message); }
        if (v && registering && target.cost != null) this.set_cost(v, target.cost);
        this.record(v, inner, inner === RemoteMCP.LOG.name ? target.words : null, { tool: inner, args: target }, sid);
        if (inner === RemoteMCP.LOG.name) return { done: { content: [{ type: "text", text: JSON.stringify({ ok: !!v && !!String(target.words ?? "").trim(), session: v?.id ?? null }) }] } };
        if (v && /^(session_summary|session_line|quick_fix)$/.test(inner) && !this.servex.sessions?.map?.[target.session]) target.session = v.id;
        if (v && registering){
            return { done: { content: [{ type: "text", text: JSON.stringify({ ok: true, session: v.id, file: v.file, note: "You are a cloud voice agent: use this session id for session_summary and session_line. Call cloud_voice_log with the owner's exact words first on every turn. Guide: Servex/ext/remote/doc/cloud-voice-agent.md" }) }] } };
        }
        return { ...params, arguments: args };
    }

    /* One folder per cloud voice agent per day (owner, 2026-10-19): sessions/YYYY/MM/DD/cloud-voice-<name>/session.jsonl, kind
     * "cloud-voice-agent". <name> is the register_session title, else the caller + date. It is a row in the Sessions store
     * (so session_summary and session_line work) with a hand-set `cost`, not a v-… folder. Guide: doc/cloud-voice-agent.md */
    voice_session(sid){
        const store = this.servex.sessions;
        if (!store?.map) return null;   // Servex without its session layer: nowhere to file it, and no third store
        const ymd = TaskDirs.day().replaceAll("-", "");
        const slug = s => String(s).toLowerCase().replace(/^cloud-voice-?/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
        const name = slug(this.sessions[sid]?.voice_name ?? "") || `${slug(RemoteMCP.CALLER.replace(/^voice-/, "")) || "app"}-${ymd}`;
        const id = `cloud-voice-${name}`, home = DatedFiles.url(DatedFiles.sessions.path(Date.now(), id)), file = `${home}session.jsonl`, abs = path.join(this.root, "public", file);
        if (!store.map[id]){
            const at = Date.now();
            store.map[id] = { id, home, file, kind: "cloud-voice-agent", caller: RemoteMCP.CALLER, at, cost: null, visited: [], fast: null, smart: null, backing: { fast: null, smart: null } };
            store.save?.();
        }
        if (!fs.existsSync(abs)){
            fs.mkdirSync(path.dirname(abs), { recursive: true });
            fs.appendFileSync(abs, JSON.stringify({ session: { id, kind: "cloud-voice-agent", caller: RemoteMCP.CALLER, at: Date.now() } }) + "\n");
        }
        return { id, file };
    }

    // the voice agent has no SDK accounting: it may state its own cost by hand, on the row and as a line
    set_cost(v, usd){
        const n = Number(usd);
        if (!Number.isFinite(n)) return;
        const row = this.servex.sessions?.map?.[v.id];
        if (row){ row.cost = n; this.servex.sessions.save?.(); }
        fs.appendFileSync(path.join(this.root, "public", v.file), JSON.stringify({ cost: { usd: n, at: new Date().toISOString() } }) + "\n");
    }

    // a spawned agent is logged by code with its id and task dir (owner, 2026-10-19), read from the tool's own result
    after(tool, sid, result, args){
        result = this.hint(tool, result, sid);
        if (tool !== "spawn_agent") return result;
        try {
            const v = this.voice_session(sid), text = result?.content?.[0]?.text ?? "", j = JSON.parse(text);
            const id = j.id ?? j.agent?.id, dir = args?.task?.dir ?? j.task_dir ?? j.task?.dir ?? j.dir;
            if (v && id) fs.appendFileSync(path.join(this.root, "public", v.file), JSON.stringify({ spawned: { at: new Date().toISOString(), agent: id, task_dir: dir ?? null, caller: RemoteMCP.CALLER } }) + "\n");
        } catch {}
        return result;
    }

    // catch-up.md item 1: when the cursor is behind, every other tool result says so in one line (nothing when nothing is new)
    hint(tool, result, sid){
        try {
            if (tool === "updates" || !result?.content) return result;
            result = this.ride(result, sid);
            const n = this.servex.external?.ensure?.(RemoteMCP.CALLER)?.pending?.(RemoteMCP.CALLER) ?? 0;
            if (n > 0) return { ...result, content: [...result.content, { type: "text", text: `${n} new update${n === 1 ? "" : "s"} for you: call updates.` }] };
        } catch {}
        return result;
    }

    // one line for the words (only cloud_voice_log passes any), one for every call (name + args hash): a call with no owner_words line before it is a visible gap
    record(v, tool, words, call, sid){
        if (!v) return;
        const abs = path.join(this.root, "public", v.file), at = new Date().toISOString();
        const text = words?.trim();
        try {
            if (text) fs.appendFileSync(abs, JSON.stringify({ owner_words: { at, words: text, caller: RemoteMCP.CALLER } }) + "\n");
            const hash = crypto.createHash("sha256").update(JSON.stringify(call.args ?? {})).digest("hex").slice(0, 12);
            fs.appendFileSync(abs, JSON.stringify({ tool_call: { at, tool, args_hash: hash, caller: RemoteMCP.CALLER } }) + "\n");
        } catch (e) { console.error("remote-mcp: voice log write failed:", e.message); }
    }

    // REMOTE_MCP_TARGET / this.target / the file remote.target still override everything: one fixed agent for every session
    override(){
        let named = this.target ?? process.env.REMOTE_MCP_TARGET;
        try { named ??= fs.readFileSync(path.join(path.dirname(this.token_file), "remote.target"), "utf8").trim() || undefined; } catch {}
        return named;
    }

    // who answers while this connection's own mastermind waits at the spawn gate: REMOTE_MCP_FALLBACK or the file remote.fallback (e.g. vscode-mastermind)
    fallback(){
        let named = process.env.REMOTE_MCP_FALLBACK;
        try { named ??= fs.readFileSync(path.join(path.dirname(this.token_file), "remote.fallback"), "utf8").trim() || undefined; } catch {}
        return named;
    }

    // why an agent cannot answer yet: the spawn gate's reason while it is still in the gate's queue (Servex.js queued_entry), else null
    queued_why(id){
        const held = this.servex.agents?.queued_entry?.(id);
        return held ? (held.card?.()?.reason ?? "queued at the spawn gate") : null;
    }

    dir_of(id){
        const a = this.servex.agents;
        return a.task_dir_for(a.registry_list().find(r => r.id === id) ?? { id });
    }

    // the agent for this voice session: the stored one, else spawn it (once, even for two simultaneous first asks)
    // `to` (an ask's own target) wins; a mastermind queued at the spawn gate hands the ask to the fallback, if one is named
    async agent_for(sid, to){
        if (to) return { id: to, dir: this.dir_of(to) };
        const named = this.override();
        if (named) return { id: named, dir: this.dir_of(named) };
        const s = this.sessions[sid] ??= { agent: null, dir: null, started: new Date().toISOString(), last: null };
        let own;
        if (s.agent) own = { id: s.agent, dir: s.dir };
        else {
            if (!this.spawning.has(sid)) this.spawning.set(sid, this.spawn(sid, s).finally(() => this.spawning.delete(sid)));
            own = await this.spawning.get(sid);
        }
        const why = this.queued_why(own.id), fb = why && this.fallback();
        if (fb && fb !== own.id) return { id: fb, dir: this.dir_of(fb), routed: `${own.id} is waiting to start (${why}), so ${fb} answers` };
        return own;
    }

    // 1:1 — a fresh mastermind for this session, with a task dir under ai/sessions/YYYY/MM/DD/ and a card
    async spawn(sid, s){
        const short = sid.replace(/^voice-/, "").replace(/-/g, "").slice(0, 8);
        const now = new Date(), day = TaskDirs.day(now);
        const dir = DatedFiles.sessions.path(now, `voice-${short}`);
        const when = `${day} ${now.toTimeString().slice(0, 5)}`;
        let card;
        try { card = JSON.parse(await this.servex.cards.tools().find(t => t.name === "create_card").handler({ title: `Voice session ${when}`, type: "note", by: "remote-mcp" })).id; } catch {}
        const prompt = `Load the voice-mastermind skill first. You are the mastermind of voice session ${sid}. Your task dir is ${dir}/ (task.jsonl is already open)${card ? ` and your card is ${card}` : ""}. Each owner question arrives as a message: say one plain sentence first, before any tool call (it is streamed to the voice agent), then write the full answer to the reply file the message names; follow that message's wording. The gateway already writes the question and answer chat lines into your task.jsonl, so skip that part of the skill and log your own work (agents, decisions) there. Wait for the first question.`;
        const agent = this.servex.agents.spawn({ role: "mastermind", name: `voice-${short}`, prompt, model: "claude-opus-5-5", dormant_after: 600, permission_mode: "bypassPermissions", task: { dir, ...(card ? { card } : {}) } });
        Object.assign(s, { agent: agent.id, dir });
        this.save_sessions();
        return { id: agent.id, dir };
    }

    async ask(question, sid, used = {}){
        let { id, dir, routed } = await this.agent_for(sid, used.to);
        const qid = crypto.randomBytes(4).toString("hex");
        const out = path.join(this.replies, qid + ".txt");
        fs.mkdirSync(this.replies, { recursive: true });
        const t = this.ticket(qid, { sid, agent: id, routed, ahead: this.ahead(id) });
        // say first (voice-bridge): the sentence before the first tool call is streamed to the voice agent as it is written. Only a Servex
        // agent streams; a VS Code tab (reached through its inbox file) streams nothing, so it always writes the reply file.
        const streams = !!this.servex.agents?.live?.get?.(id);
        const answer = `the full answer for the voice agent, which will decide how to say it aloud: the answer first, then the context it needs to hold a conversation (what it is, where it lives, what is open, alternatives, a link or two); a few short paragraphs at most. Write it as plain text to ${out} (one file write)`;
        const msg = `The owner asks by voice (question ${qid}): "${question}"\n` + (streams
            ? `SAY FIRST: begin your reply with ONE plain sentence, before any tool call: the answer if you know it, else what you are doing and about how long. The voice agent hears it the moment you write it.\nThen, if more is needed, do it and write ${answer}. If your first sentence was the whole answer, skip the file.`
            : `Reply as soon as you can: write ${answer}. Always write the file, even for a one-sentence answer: it is the only way your answer reaches the voice agent.`);
        try { this.servex.agents.send(id, msg, { from: "owner (voice)" }); }
        catch (e) {
            // the stored agent was stopped on purpose or landed: this session gets a fresh one
            if (used.to || this.override() || !this.sessions[sid]) { this.tickets.delete(qid); throw e; }
            Object.assign(this.sessions[sid], { agent: null, dir: null });
            ({ id, dir, routed } = await this.agent_for(sid));
            Object.assign(t, { agent: id, routed, ahead: this.ahead(id) });
            this.servex.agents.send(id, msg, { from: "owner (voice)" });
        }
        used.agent = id;
        if (this.sessions[sid]) { this.sessions[sid].last = new Date().toISOString(); this.save_sessions(); }
        const file = dir ? path.resolve(this.root, dir, "task.jsonl") : null;
        const rel = dir ? path.relative(this.root, path.resolve(this.root, dir)).replace(/\\/g, "/") : null;
        const link = rel ? "/" + rel + "/" : "its task page";
        const chat = (from, text) => { if (file) try { fs.appendFileSync(file, JSON.stringify({ chat: { from, id: qid, text, at: new Date().toISOString() } }) + "\n"); } catch {} };
        chat("owner (voice)", question);
        used.ticket = qid;
        let sent = false;   // set once the answer is delivered anywhere (returned, or put in the inbox)
        const read = () => { try { return fs.existsSync(out) ? fs.readFileSync(out, "utf8").trim() : ""; } catch { return ""; } };
        // every answer goes to the inbox, returned or not: a call the app dropped can swallow what we return.
        // The answer is the reply file, else (once the turn has ended) the words the agent said: say-first may be the whole answer.
        const deliver = () => {
            const text = read() || (t.turn_done ? t.words.trim() : "");
            if (!text || sent) return null;
            sent = true;
            chat("voice-mastermind", text);
            this.give(qid, text);
            Object.assign(t, { answer: text, done: true });
            this.changed(t);
            return text;
        };
        t.deliver = deliver;   // the listener calls it when the agent's turn ends
        // keep watching after we stop waiting: the answer goes to the caller's inbox, which `updates` delivers
        const watch = () => {
            const until = Date.now() + this.late_ms;
            const tick = () => { if (deliver() || Date.now() > until) return; setTimeout(tick, 1000).unref?.(); };
            setTimeout(tick, 500).unref?.();
        };
        const ack = `the answer will arrive through updates (ticket ${qid}; the question is logged at ${link})`;
        if (used.wait === false){ watch(); return JSON.stringify({ ...this.view(t), note: ack }); }
        const until = Date.now() + this.wait_ms;
        while (Date.now() < until && !used.cancelled?.()){
            await this.until_change(t, Math.min(250, until - Date.now()));   // a stream event wakes it at once; the 250 ms tick reads the reply file
            const text = deliver() ?? (t.done ? t.answer : null);   // the listener may have finished the ticket first
            if (text) return this.mark(t), text;
        }
        watch();
        this.mark(t);
        const v = this.view(t);
        return `Not answered yet (ticket ${qid}). ${v.to} is ${v.status}.${v.first ? ` Its first words: "${v.first}"` : ""} Say that, keep talking; the answer rides along on your next tool result, or call voice_hear. (${ack})`;
    }

    /* THE BRIDGE (voice-bridge, 2026-11-01; plan: public/framework/ai/sessions/2026/10/20/session-e00f55c9/voice-bridge/plan.md).
     * One ticket per ask: what the agent has said so far. `first` is its text before its first tool call (the say-first sentence),
     * `words` all its text this ask, `doing` its latest tool, `rev` bumps on every change so voice_hear and ride() know what is new.
     * `ahead` counts the turns the agent must finish before this ask's own turn (the one running, plus messages queued before ours):
     * their words are about other work, so the ticket ignores them, and every turn end counts one off. */
    ticket(qid, { sid, agent, routed, ahead = 0 }){
        const now = Date.now();
        for (const [k, x] of this.tickets) if (now - x.at > this.late_ms) this.tickets.delete(k);
        const t = { id: qid, sid, agent, routed: routed ?? null, ahead, at: now, first: "", words: "", doing: null, tools: 0, answer: null, done: false, turn_done: false, rev: 0, heard: 0, rode: { first: 0, answer: false }, waiters: new Set() };
        this.tickets.set(qid, t);
        return t;
    }

    changed(t){ t.rev++; for (const w of [...t.waiters]) w(); }

    // resolves on the ticket's next change, after ms, or when gone() says the caller hung up
    until_change(t, ms, gone){
        return new Promise(res => {
            let tm, iv;
            const w = () => { clearTimeout(tm); clearInterval(iv); t.waiters.delete(w); res(); };
            t.waiters.add(w);
            tm = setTimeout(w, Math.max(0, ms));
            if (gone) iv = setInterval(() => { if (gone()) w(); }, 250);
        });
    }

    // the honest state of one ask, in words the voice agent can say
    view(t){
        const why = this.queued_why(t.agent), row = why ? null : this.servex.agents?.live?.get?.(t.agent);
        const status = t.stopped && !t.answer ? "stopped before answering" : t.done ? "done" : why ? `waiting to start: ${why}` : t.doing ? `working (${t.doing})` : row?.state === "working" ? "working" : row ? `${row.state}: the question is queued for it` : "asked";
        return { ticket: t.id, to: t.agent, status, routed: t.routed, first: t.first.trim() || null, answer: t.answer, done: t.done, seconds: Math.round((Date.now() - t.at) / 100) / 10 };
    }

    // what this caller has now been told: ride() only repeats what is new
    mark(t){ t.heard = t.rev; t.rode = { first: t.first.trim().length, answer: !!t.answer }; }

    // turns an agent must finish before a message sent now is answered: the running one plus every message already waiting.
    // `queue.kinds` gains one entry per message sent and loses one per turn end (Agents.js, AgentQueue.push and Agent.emit), so it
    // also counts messages already handed to the Claude process, which `queue.items` no longer holds. If the count is ever high
    // (a priority message jumped the queue), heard_event's idle fallback gives the ask the last turn's words.
    ahead(id){
        const a = this.servex.agents?.live?.get?.(id);
        if (a?.state !== "working") return 0;
        return a.queue?.kinds?.length || 1 + (a.queue?.items?.length ?? 0);
    }

    // the open tickets of an agent, oldest first: its stream belongs to the oldest ask it has not finished
    open_for(agent_id){ return [...this.tickets.values()].filter(t => t.agent === agent_id && !t.done); }

    // agents.watch is the host's one seam for every agent event (Sessions.listen wraps it the same way)
    listen(){
        const agents = this.servex?.agents;
        if (typeof agents?.watch !== "function") return;
        const watch = agents.watch.bind(agents);
        agents.watch = (event, agent) => {
            watch(event, agent);
            try { this.heard_event(event, agent); } catch (e){ console.error("remote-mcp: bridge:", e.message); }
        };
    }

    heard_event(event, agent){
        if (event.nested || !this.tickets.size || !["delta", "tool", "result"].includes(event.type)) return;
        const open = this.open_for(agent?.id);
        if (!open.length) return;
        const t = open.find(x => !x.ahead);   // the oldest ask whose turn has come; asks still behind other turns ignore this one
        const turn = this.turn_words.get(agent.id) ?? { first: "", words: "", tools: 0 };   // this turn's words, whoever they belong to
        this.turn_words.set(agent.id, turn);
        if (event.type === "result"){
            this.turn_words.delete(agent.id);
            const behind = open.filter(x => x.ahead);   // every ask still waiting: a turn ahead of each of them just ended
            if (t && event.stopped) Object.assign(t, { done: true, stopped: true }), this.changed(t);   // cut off mid-turn: closed, and its partial words are not an answer
            // the turn's words go to the oldest open ask only; a later ask the same turn answered arrives by its reply file
            else if (t) for (const x of open) if (!x.ahead && (x === t || x.words)){ x.turn_done = true; x.deliver?.() || this.changed(x); }
            for (const x of behind) x.ahead--;
            // idle fallback: the agent has nothing left to run, so an ask still counting turns was over-counted and this last turn was its own
            const left = agent.state === "working" ? [] : behind;
            if (left.length && !event.stopped) Object.assign(left[0], { ahead: 0, first: turn.first, words: turn.words, tools: turn.tools, turn_done: true }), left[0].deliver?.() || this.changed(left[0]);
            for (const x of left) x.ahead = 0;
            return;
        }
        if (event.type === "delta"){ if (!turn.tools) turn.first += event.text; turn.words += event.text; }
        if (event.type === "tool") turn.tools++;
        if (!t) return;
        t.turn_done = false;   // a new turn: its words are not an answer until it ends
        if (event.type === "delta"){ if (!t.tools) t.first += event.text; t.words += event.text; return this.changed(t); }
        if (event.type === "tool"){ t.tools++; t.doing = `${String(event.name).replace(/^mcp__\w+__/, "")} ${event.input ?? ""}`.trim().slice(0, 80); return this.changed(t); }
    }

    /* voice_hear: a short long-poll on one ticket (default: this connection's latest). Returns at the first change, at wait_s,
     * or when the app hangs up; every reply carries the whole state, so a call cut off by noise loses nothing. */
    async hear({ ticket, wait_s } = {}, sid, gone){
        const t = ticket ? this.tickets.get(String(ticket)) : [...this.tickets.values()].filter(x => x.sid === sid).at(-1);
        if (!t) return { ok: false, error: ticket ? `no open ask with ticket ${ticket} (answers older than 30 minutes are in updates)` : "no ask yet on this connection" };
        const ms = Math.min(20, Math.max(0, Number(wait_s ?? 8))) * 1000, seen = t.heard, start = Date.now();
        if (t.rev === seen && !t.done) await this.until_change(t, ms, gone);
        if (!t.done) t.deliver?.();   // a reply file written since the last tick
        this.mark(t);
        return { ok: true, ...this.view(t), new: t.rev !== seen, waited_ms: Date.now() - start };
    }

    // answers ride along: any tool result on the remote route carries what an open ask of this connection said since the caller last heard
    ride(result, sid){
        if (!result?.content || !sid) return result;
        const lines = [];
        for (const t of this.tickets.values()){
            if (t.sid !== sid) continue;
            const first = t.first.trim();
            if (t.answer && !t.rode.answer) lines.push(`Answer from ${t.agent} (ticket ${t.id}): ${t.answer}`);
            else if (!t.answer && first.length > t.rode.first) lines.push(`${t.agent} so far (ticket ${t.id}, ${this.view(t).status}): "${first}"`);
            else continue;
            this.mark(t);
        }
        return lines.length ? { ...result, content: [...result.content, { type: "text", text: lines.join("\n") }] } : result;
    }

    /* Put an answer in the caller's inbox (from voice-mastermind, reply_to = ticket) and mark its reply file delivered. */
    give(qid, text){
        try {
            if (!this.servex.external?.ensure) return false;   // Servex without its inbox layer
            this.servex.external.ensure(RemoteMCP.CALLER).deliver(RemoteMCP.CALLER, text, { from: "voice-mastermind", reply_to: qid });
            fs.writeFileSync(path.join(this.replies, qid + ".delivered"), new Date().toISOString());
            return true;
        } catch (e) { console.error("remote-mcp: answer to inbox:", e.message); return false; }
    }

    /* At boot: any remote-replies/<qid>.txt with no <qid>.delivered marker goes to the inbox once. The first sweep only marks
     * what already exists (answers from before this change were handled by the old code), so nothing old is replayed. */
    sweep(){
        try {
            if (!this.servex.external?.ensure || !fs.existsSync(this.replies)) return;
            const sentinel = path.join(this.replies, ".swept"), first = !fs.existsSync(sentinel);
            for (const f of fs.readdirSync(this.replies)){
                const m = /^(.+)\.txt$/.exec(f);
                if (!m) continue;
                const qid = m[1], mark = path.join(this.replies, qid + ".delivered"), file = path.join(this.replies, f);
                if (fs.existsSync(mark)) continue;
                if (first || Date.now() - fs.statSync(file).mtimeMs > 86400000){ fs.writeFileSync(mark, first ? "before-sweep" : "stale"); continue; }
                const text = fs.readFileSync(file, "utf8").trim();
                if (text) this.give(qid, text);
            }
            if (first) fs.writeFileSync(sentinel, new Date().toISOString());
        } catch (e) { console.error("remote-mcp: sweep:", e.message); }
    }

    // one line per call, never the token
    log(question, ms, session, agent){
        const line = JSON.stringify({ remote_mcp: { who: "owner (voice)", tool: "ask_mastermind", what: question.slice(0, 200), at: new Date().toISOString(), ms, session, agent } }) + "\n";
        try { fs.appendFileSync(path.join(this.root, "public/framework/ai/log.jsonl"), line); } catch {}
    }
}
