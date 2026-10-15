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
    static TOOL = {
        name: "ask_mastermind",
        description: "Ask the project's mastermind (the AI that coordinates this codebase) a question and wait up to a minute for its answer.",
        inputSchema: { type: "object", properties: { question: { type: "string", description: "What to ask." } }, required: ["question"] },
    };

    /* servex: needs .agents (send, list, registry_list, task_dir_for); root: repo root; wait_ms: reply timeout */
    constructor({ servex, root, router, token_file = RemoteMCP.TOKEN_FILE, wait_ms = 60000, target } = {}){
        Object.assign(this, { servex, root, token_file, wait_ms, target });
        this.replies = path.join(path.dirname(token_file), "remote-replies");
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
        if (method === "initialize") return ok({ protocolVersion: params?.protocolVersion ?? RemoteMCP.VERSION, capabilities: { tools: {} }, serverInfo: { name: "lew42-remote", version: "1" } });
        if (method === "ping") return ok({});
        if (method === "tools/list") return ok({ tools: [RemoteMCP.TOOL] });
        if (method === "tools/call"){
            if (params?.name !== RemoteMCP.TOOL.name) return bad(-32602, "unknown tool");
            const question = String(params.arguments?.question ?? "").trim().slice(0, 4000);
            if (!question) return bad(-32602, "question is required");
            const started = Date.now();
            let text;
            try { text = await this.ask(question); } catch (e) { text = `could not reach the mastermind: ${e.message}`; }
            this.log(question, Date.now() - started);
            return ok({ content: [{ type: "text", text }] });
        }
        return bad(-32601, "method not found");
    }

    // the live mastermind: REMOTE_MCP_TARGET, else the file remote.target, else the first live run mastermind (never mastermind-servex)
    mastermind(){
        const a = this.servex.agents;
        let named = this.target ?? process.env.REMOTE_MCP_TARGET;
        try { named ??= fs.readFileSync(path.join(path.dirname(this.token_file), "remote.target"), "utf8").trim() || undefined; } catch {}
        const id = named ?? a.list().find(c => /^(task-mastermind|mastermind(?!-servex))/.test(c.id) && c.state !== "stopped")?.id;
        if (!id) throw new Error("no live mastermind");
        return { id, dir: a.task_dir_for(a.registry_list().find(r => r.id === id) ?? { id }) };
    }

    async ask(question){
        const { id, dir } = this.mastermind();
        const qid = crypto.randomBytes(4).toString("hex");
        const file = dir ? path.resolve(this.root, dir, "task.jsonl") : null;
        const rel = dir ? path.relative(this.root, path.resolve(this.root, dir)).replace(/\\/g, "/") : null;
        const link = rel ? "/" + rel + "/" : "its task page";
        // replies go to a file OUTSIDE public/, so polling it never wakes the live-reload watcher
        const out = path.join(this.replies, qid + ".txt");
        fs.mkdirSync(this.replies, { recursive: true });
        if (file) fs.appendFileSync(file, JSON.stringify({ chat: { from: "owner (voice)", id: qid, text: question, at: new Date().toISOString() } }) + "\n");
        this.servex.agents.send(id, `The owner asks by voice (question ${qid}): "${question}"\nAnswer in two or three plain sentences, easy to hear aloud. Reply by writing your answer as plain text to ${out} (one file write, nothing else).`, { from: "owner (voice)" });
        const until = Date.now() + this.wait_ms;
        while (Date.now() < until){
            await new Promise(r => setTimeout(r, 500));
            if (fs.existsSync(out)){ const t = fs.readFileSync(out, "utf8").trim(); if (t) return t; }
        }
        return `the mastermind is busy; the question is logged at ${link}`;
    }

    // one line per call, never the token
    log(question, ms){
        const line = JSON.stringify({ remote_mcp: { who: "owner (voice)", tool: "ask_mastermind", what: question.slice(0, 200), at: new Date().toISOString(), ms } }) + "\n";
        try { fs.appendFileSync(path.join(this.root, "public/framework/ai/log.jsonl"), line); } catch {}
    }
}
