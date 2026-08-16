import express from "express";
import shot from "./Shot.js";

const VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
const LOOPBACK = /^(127\.\d+\.\d+\.\d+|::1|::ffff:127\.\d+\.\d+\.\d+)$/;
const trim = p => String(p ?? "").replace(/\/+$/, "") || "/";

/* ⚠ The server binds 0.0.0.0, and these tools run JS in your browser and drive a
 * headless chromium — anything on the LAN that reached /mcp would own the machine. */
export function loopback(address){
    return LOOPBACK.test(String(address ?? "").replace(/%.*$/, ""));
}

const TOOLS = [{
    name: "pages",
    description: "List the browser tabs connected to the dev server: the page each is on, and since when.",
    inputSchema: { type: "object", properties: {} }
}, {
    name: "eval",
    description: "Evaluate JavaScript in a live tab and return the result as JSON. Promises are awaited. This is DOM truth — computed styles, element boxes, app state — and it beats a screenshot for anything that is not pixels.",
    inputSchema: { type: "object", required: ["code"], properties: {
        code: { type: "string", description: "A JavaScript expression, evaluated at global scope in the tab." },
        path: { type: "string", description: "Which tab, by the url path it reported. Omit for the first connected one." }
    } }
}, {
    name: "shot",
    description: "Screenshot a url with headless chromium; returns the png path on disk, for you to read. Pixels only — `eval` is cheaper for facts.",
    inputSchema: { type: "object", required: ["url"], properties: {
        url: { type: "string", description: "The page to shoot, e.g. http://localhost/framework/." },
        selector: { type: "string", description: "CSS selector — shoots that element instead of the viewport." },
        width: { type: "number", description: "Viewport width, default 1400." },
        height: { type: "number", description: "Viewport height, default 1000." }
    } }
}];

/* The dev server's powers as MCP tools, so every Claude session in this repo has
 * them. Hand-rolled streamable HTTP in its simplest legal form: one POST, one
 * application/json answer, no session, no SSE. The tabs come from the `Tab` socket
 * plugin, registered beside this one in server.js. See Server/README.md. */
export default class MCP {

    static setup(server){ new MCP(server); }

    constructor(server){
        this.server = server;
        server.mcp = this;
        server.on("express", () => this.route());
    }

    route(){
        this.server.router.post("/mcp", express.json({ limit: "1mb" }), (req, res) => this.post(req, res));
        this.server.router.all("/mcp", (req, res) => res.status(405).end());
    }

    async post(req, res){
        const from = req.socket.remoteAddress;
        if (!loopback(from)){
            console.warn(`MCP: REFUSED /mcp from ${from} — loopback only.`);
            return res.status(403).json({ jsonrpc: "2.0", id: null,
                error: { code: -32600, message: `/mcp answers loopback only; refused ${from}` } });
        }

        const { id, method, params = {} } = req.body ?? {};
        if (id == null) return res.status(202).end();

        try {
            res.json({ jsonrpc: "2.0", id, result: await this.result(method, params) });
        } catch (e){
            res.json({ jsonrpc: "2.0", id, error: { code: e.code ?? -32603, message: String(e.message || e) } });
        }
    }

    result(method, params){
        if (method === "initialize") return {
            protocolVersion: VERSIONS.includes(params.protocolVersion) ? params.protocolVersion : VERSIONS[0],
            capabilities: { tools: {} },
            serverInfo: { name: "site", title: "lew42 dev site", version: "1.0.0" },
            instructions: "The site running on localhost. `pages` lists the open tabs, `eval` reads DOM truth from inside one, `shot` takes a png."
        };
        if (method === "ping") return {};
        if (method === "tools/list") return { tools: TOOLS };
        if (method === "tools/call") return this.call(params.name, params.arguments ?? {});
        throw Object.assign(new Error(`Unknown method: ${method}`), { code: -32601 });
    }

    async call(name, args){
        try {
            if (name === "pages") return this.text(this.pages());
            if (name === "eval") return this.text(await this.evaluate(args));
            if (name === "shot") return this.text(await shot(args));
        } catch (e){
            return { content: [{ type: "text", text: String(e.message || e) }], isError: true };
        }
        throw Object.assign(new Error(`Unknown tool: ${name}`), { code: -32602 });
    }

    text(value){
        return { content: [{ type: "text", text: String(value) }] };
    }

    tabs(){
        return (this.server.socket_server?.sockets ?? []).map(socket => socket.tab).filter(tab => tab?.page);
    }

    pages(){
        return JSON.stringify(this.tabs().map(tab => ({ path: tab.page, connected_since: tab.since })), null, 2);
    }

    async evaluate({ path, code }){
        const tab = path ? this.tabs().find(t => trim(t.page) === trim(path)) : this.tabs()[0];
        if (!tab) throw new Error(path
            ? `No connected tab on ${path} — call \`pages\` for the open ones.`
            : "No connected tab — open http://localhost/ in a browser.");

        const { value, error } = await tab.eval(code);
        if (error) throw new Error(error);
        return value;
    }
}
