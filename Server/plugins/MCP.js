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

const TAB = { type: "string", description: "Which tab, by the `tab` id `pages` gives it. The reliable way to name one — prefer it to `path`." };
const PATH = { type: "string", description: "Which tab, by the url path it reported. Refused when it names more than one tab; omit only when exactly one tab is connected." };

const TOOLS = [{
    name: "pages",
    description: "List the browser tabs connected to the dev server: each tab's id, the page it is on, since when, and who has claimed it. Pass an id as `tab` to the other tools — two tabs can sit on one path.",
    inputSchema: { type: "object", properties: {} }
}, {
    name: "eval",
    description: "Evaluate JavaScript in a live tab and return the result as JSON. Promises are awaited. This is DOM truth — computed styles, element boxes, app state — and it beats a screenshot for anything that is not pixels. Every answer reports the tab's visibility AT ANSWER TIME: a hidden tab still evaluates, but stops rendering, so anything the page sizes inside a rAF or ResizeObserver callback is stale.",
    inputSchema: { type: "object", required: ["code"], properties: {
        code: { type: "string", description: "A JavaScript expression, evaluated at global scope in the tab." },
        tab: TAB,
        path: PATH
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
}, {
    name: "claim",
    description: "Ring a tab in orange and mark its title, so the owner can see at a glance which window you are driving. Several sessions share this browser: claim the one you drive, and release it when the task lands.",
    inputSchema: { type: "object", properties: {
        note: { type: "string", description: "Your task slug — the label is what says which running task owns this window." },
        who: { type: "string", description: "Who is driving. Default `claude`." },
        tab: TAB,
        path: PATH
    } }
}, {
    name: "release",
    description: "Drop a tab's claim. A ring left up says an agent is driving a window that nobody is driving.",
    inputSchema: { type: "object", properties: { tab: TAB, path: PATH } }
}];

/* Every answer carries the state it was answered in. Visibility is TIME-VARYING — a
 * tab is foreground when you spawn and claim it, and hidden the moment the owner
 * clicks away, which is the normal workflow — so a warning in a doc is a guess about
 * a value that has already changed, and this is a measurement. ⚠ A hidden tab does
 * not sleep: it evaluates, it just stops RENDERING. See doc/hidden.md. */
function status(tab, { visibility, focused, size }){
    if (!visibility) return `tab ${tab.page} — no state reported (tab predates the fix; reload it)`;

    const where = `tab ${tab.page} · ${size?.join("×") ?? "?"}${focused ? " · focused" : ""}`;
    if (visibility === "visible") return `${where} · visible`;

    return `${where} · ⚠ HIDDEN — no rAF, no ResizeObserver, nothing paints. CSS-driven`
        + ` layout still measures true (a geometry read forces a reflow); anything the page`
        + ` sizes inside a frame callback is frozen. Use \`shot\` for that.`;
}

/* The dev server's powers as MCP tools, so every Claude session in this repo has
 * them. Hand-rolled streamable HTTP in its simplest legal form: one POST, one
 * application/json answer, no session, no SSE. The tabs come from the `Tab` socket
 * plugin, registered beside this one in server.js. See Server/README.md. */
export default class MCP {

    static setup(server){ new MCP(server); }

    constructor(server){
        this.server = server;
        server.mcp = this;
        this.tools = [...TOOLS];
        this.handlers = new Map();
        server.on("express", () => this.route());
    }

    /* Another plugin's tools, on the same door: `server.mcp.register(tool, args => …)`.
     * The handler answers with a string. See plugins/Research.js. */
    register(tool, handler){
        this.tools.push(tool);
        this.handlers.set(tool.name, handler);
        return this;
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
            instructions: "The site running on localhost. `pages` lists the open tabs, `eval` reads DOM truth from inside one, `shot` loads a url in a fresh headless chromium and takes a png. Address a tab by the `tab` id `pages` gives it — two tabs can sit on the same path, and an ambiguous `path` is refused rather than guessed. Several sessions share this browser: `claim` the tab you drive so the owner can see which window is yours, `release` it when the task lands. Every `eval` answer ends with the tab's state at answer time — read it, because a hidden tab evaluates fine but does not render."
        };
        if (method === "ping") return {};
        if (method === "tools/list") return { tools: this.tools };
        if (method === "tools/call") return this.call(params.name, params.arguments ?? {});
        throw Object.assign(new Error(`Unknown method: ${method}`), { code: -32601 });
    }

    async call(name, args){
        try {
            if (name === "pages") return this.text(this.pages());
            if (name === "eval") return this.text(await this.evaluate(args));
            if (name === "shot") return this.text(await shot(args));
            if (name === "claim") return this.text(await this.claim(args));
            if (name === "release") return this.text(await this.release(args));
            if (this.handlers.has(name)) return this.text(await this.handlers.get(name)(args));
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
        return JSON.stringify(this.tabs().map(tab => ({
            tab: tab.id ?? null, path: tab.page, connected_since: tab.since,
            claimed_by: tab.claimed ? [tab.claimed.who, tab.claimed.note].filter(Boolean).join(" · ") : null
        })), null, 2);
    }

    /* ⚠ Ambiguity is refused, never guessed. Two tabs on one page are the normal case
     * here — comparing a change side by side — and the old "omit for the first connected
     * one" quietly picked one of them, so a session could drive the wrong window and
     * never know. The error carries the whole list, so recovery is the retry, not a
     * second `pages` call. Tabs that predate the id reload into one. */
    pick({ tab, path }){
        const tabs = this.tabs();
        const list = () => tabs.map(t => `${t.id ?? "(no id — reload it)"} on ${t.page}`).join(", ");

        if (!tabs.length) throw new Error("No connected tab — open http://localhost/ in a browser.");

        if (tab){
            const hit = tabs.find(t => t.id === tab);
            if (!hit) throw new Error(`No connected tab ${tab}. Open now: ${list()}`);
            return hit;
        }

        const found = path ? tabs.filter(t => trim(t.page) === trim(path)) : tabs;
        if (!found.length) throw new Error(`No connected tab on ${path}. Open now: ${list()}`);
        if (found.length > 1) throw new Error(
            `${found.length} tabs match${path ? ` ${path}` : ""} — say which with \`tab\`: `
            + found.map(t => t.id ?? "(no id — reload that tab)").join(", "));

        return found[0];
    }

    async evaluate({ tab, path, code }){
        const t = this.pick({ tab, path });
        return this.answer(t, await t.eval(code));
    }

    /* Every answer carries the tab it was answered in, whichever verb asked. */
    answer(tab, { value, error, ...state }){
        if (error) throw new Error(error);
        return `${value}\n\n${status(tab, state)}`;
    }

    /* `dev/Claim` paints the ring; `Tab` keeps the record, so `pages` can report who is
     * driving without asking the browser. The verb lives beside the tools rather than in
     * a skill file a session has to already know to read. */
    async claim({ tab, path, who = "claude", note = "" }){
        const t = this.pick({ tab, path });
        return this.answer(t, await t.claim(who, note));
    }

    async release({ tab, path }){
        const t = this.pick({ tab, path });
        return this.answer(t, await t.release());
    }
}
