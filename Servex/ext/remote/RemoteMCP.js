import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import express from "express";

/* A tiny remote MCP endpoint (POST /mcp/remote) with ONE tool, `ask_mastermind`, behind a bearer token.
 * Why and how to use it: public/framework/ux/Dictate/doc/voice-bridge.md. Reached through Server/Tunnel.mjs,
 * whose gateway forwards this one path and nothing else. */
export default class RemoteMCP {
    static PATH = "/mcp/remote";
    static DIR = path.join(process.env.LOCALAPPDATA ?? path.join(os.homedir(), "AppData", "Local"), "lew42", "servex");
    static TOKEN_FILE = path.join(RemoteMCP.DIR, "remote.token");
    static VERSION = "2025-03-26";
    static SESSIONS_FILE = "remote.sessions.json";
    static TOOL = {
        name: "ask_mastermind",
        description: "Ask the project's mastermind (the AI that coordinates this codebase) a question and wait up to a minute for its answer.",
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
        const { id, method, params } = req.body ?? {};
        const ok = result => res.json({ jsonrpc: "2.0", id, result });
        const bad = (code, message) => res.json({ jsonrpc: "2.0", id, error: { code, message } });
        if (id === undefined) return res.status(202).end();   // a notification (notifications/initialized)
        if (method === "initialize"){
            const sid = crypto.randomUUID();
            this.sessions[sid] = { agent: null, dir: null, started: new Date().toISOString(), last: new Date().toISOString() };
            this.save_sessions();
            res.set("Mcp-Session-Id", sid);
        }
        if (method === "initialize") return ok({ protocolVersion: params?.protocolVersion ?? RemoteMCP.VERSION, capabilities: { tools: {} }, serverInfo: { name: "lew42-remote", version: "1" } });
        if (method === "ping") return ok({});
        if (method === "tools/list") return ok({ tools: [RemoteMCP.TOOL] });
        if (method === "tools/call"){
            if (params?.name !== RemoteMCP.TOOL.name) return bad(-32602, "unknown tool");
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
        const now = new Date(), day = now.toISOString().slice(0, 10), [y, m, d] = day.split("-");
        const dir = `public/framework/ai/sessions/${y}/${m}/${d}/voice-${short}`;
        const when = `${day} ${now.toTimeString().slice(0, 5)}`;
        let card;
        try { card = JSON.parse(await this.servex.cards.tools().find(t => t.name === "create_card").handler({ title: `Voice session ${when}`, type: "note", by: "remote-mcp" })).id; } catch {}
        const prompt = `You are this voice session's mastermind (session ${sid}). The owner talks to you by voice through a phone connector; each question arrives as a message and you answer by writing plain text to the file it names. Answer from public/framework/ai/handover.md, the readme chain and the site's pages, never from memory, in two or three plain sentences easy to hear aloud. The gateway already logs every question and answer as chat lines in your task.jsonl (${dir}/task.jsonl), so do not duplicate them; log your own work there (node .claude/hooks/append.mjs). A real ask (build this, fix that) goes through module_inbox or spawn_agent as a task mastermind: do it, then say in the answer what you did. Wait for the first question.`;
        const agent = this.servex.agents.spawn({ role: "mastermind", name: `voice-${short}`, prompt, model: "claude-sonnet-5-5", dormant_after: 600, permission_mode: "bypassPermissions", task: { dir, ...(card ? { card } : {}) } });
        Object.assign(s, { agent: agent.id, dir });
        this.save_sessions();
        return { id: agent.id, dir };
    }

    async ask(question, sid, used = {}){
        let { id, dir } = await this.agent_for(sid);
        const qid = crypto.randomBytes(4).toString("hex");
        const out = path.join(this.replies, qid + ".txt");
        fs.mkdirSync(this.replies, { recursive: true });
        const msg = `The owner asks by voice (question ${qid}): "${question}"\nAnswer in two or three plain sentences, easy to hear aloud. Reply by writing your answer as plain text to ${out} (one file write, nothing else).`;
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
