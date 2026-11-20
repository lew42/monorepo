import express from "express";
import Events from "../Server/Events.js";

const VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
const LOOPBACK = /^(127\.\d+\.\d+\.\d+|::1|::ffff:127\.\d+\.\d+\.\d+)$/;

export function loopback(address){
    return LOOPBACK.test(String(address ?? "").replace(/%.*$/, ""));
}

/* ONE MCP ENDPOINT FOR EVERY CLAUDE SESSION ON THIS MACHINE.
 *
 * Streamable HTTP in its simplest legal form — one POST, one application/json
 * answer, no session id, no SSE stream. This is the same shape as
 * Server/plugins/MCP.js, copied and emptied rather than imported: that one is
 * the dev server's own door and is bound to the dev server's tabs, this one
 * belongs to Servex and outlives every dev server.
 *
 * A session connects to it with:
 *   claude --strict-mcp-config --mcp-config '{"mcpServers":{"servex":{"type":"http","url":"http://127.0.0.1:8090/mcp"}}}'
 *
 * ⚠ Loopback only. These tools start and stop processes; anything on the LAN
 * that reached this door would own the machine.
 *
 * THE SEAM — `mcp.tool(definition, handler)`. Anything that wants to put a tool
 * on this door calls it; nothing has to be listed here in advance. A definition
 * is `{ name, description, inputSchema }` and the handler takes the call's
 * arguments and returns a string (or a promise of one). It also accepts a
 * definition that carries its own `handler`, which is the shape a module
 * exporting a whole list of tools wants:
 *
 *   for (const tool of tools) servex.mcp.tool(tool);
 *
 * Registering the same name twice replaces it, so a module can be reloaded. */
export default class MCP extends Events {

    initialize(){
        this.tools = [];
        this.handlers = new Map();
        this.info ??= { name: "servex", title: "Servex", version: "1.0.0" };
        this.instructions ??= "";
        this.listed ??= null;      // (ctx) => names to show in tools/list, or null for all (Servex sets it from Servex/Listed.js)
        this.tool(MCP.CALL.name, { description: MCP.CALL.description, inputSchema: MCP.CALL.inputSchema }, (args, ctx) => this.dispatch(args, ctx));
        this.route();
    }

    /* THE DISPATCHER. Every tool stays registered; only a few are listed (Servex/Listed.js). `call` reaches the rest by name,
     * and checks `args` against that tool's own schema first, so a wrong name or a missing field answers with the schema to use. */
    static CALL = {
        name: "call",
        description: "Call any Servex tool by name, listed or not: call({tool: \"take_worktree\", args: {}}). call({tool: \"list\"}) lists every tool with one line each;"
            + " call({tool: \"list\", args: {name: \"close_task\"}}) returns that tool's full description and input schema. A wrong name or bad args answers with the right schema.",
        inputSchema: { type: "object", properties: { tool: { type: "string", description: "A tool name, or \"list\"." }, args: { type: "object", description: "That tool's arguments." } }, required: ["tool"] },
    };

    async dispatch({ tool, args = {} } = {}, ctx = { caller: null }){
        if (!tool || tool === "list") return this.catalog(args?.name ?? args?.names);
        if (tool === MCP.CALL.name) throw new Error("call({tool: \"call\"}) is a loop; name the tool itself");
        const def = this.tools.find(t => t.name === tool);
        if (!def){
            const words = String(tool).split(/[_\W]+/).filter(w => w.length > 3);
            const near = this.tools.map(t => t.name).filter(n => n.includes(tool) || words.some(w => n.includes(w)));
            throw new Error(`Unknown tool: ${tool}.${near.length ? ` Did you mean ${near.slice(0, 5).join(", ")}?` : ""} call({tool: "list"}) lists every tool.`);
        }
        const why = MCP.check(def.inputSchema, args ?? {});
        if (why) throw new Error(`${tool}: ${why}. Its schema: ${JSON.stringify(def.inputSchema)}`);
        return this.handlers.get(tool)(args ?? {}, ctx);
    }

    /* Required fields present, and top-level types right. The handler still does its own checks; this only makes a bad
     * call through the dispatcher say which schema it missed. */
    static check(schema, args){
        if (typeof args !== "object" || Array.isArray(args) || args === null) return "args must be an object";
        const missing = (schema?.required ?? []).filter(k => args[k] === undefined);
        if (missing.length) return `missing ${missing.join(", ")}`;
        for (const [k, v] of Object.entries(args)){
            const type = schema?.properties?.[k]?.type;
            if (!type || v === null) continue;
            const is = Array.isArray(v) ? "array" : typeof v;
            if (![].concat(type).some(t => t === is || (t === "integer" && Number.isInteger(v)))) return `${k} should be ${[].concat(type).join(" or ")}, got ${is}`;
        }
        return null;
    }

    // one line per tool, or the full definition of the named ones
    catalog(name){
        if (name){
            const names = [].concat(name), found = this.tools.filter(t => names.includes(t.name));
            if (!found.length) throw new Error(`Unknown tool: ${names.join(", ")}. call({tool: "list"}) lists every tool.`);
            return JSON.stringify(found.map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })));
        }
        return this.tools.filter(t => t.name !== MCP.CALL.name).map(t => `${t.name}: ${MCP.first(t.description)}`).join("\n");
    }

    static first(text){
        const s = String(text ?? "").replace(/\s+/g, " ").trim(), m = /^(.{20,160}?[.;])(\s|$)/.exec(s);
        return m ? m[1] : s.slice(0, 160);
    }

    /* What one caller sees. `call`'s description names every tool not listed for it, so a model that read a tool name in a skill
     * finds the way to it in the list itself. */
    visible(ctx = { caller: null }){
        const names = this.listed?.(ctx);
        if (!names) return this.tools;
        const show = new Set([...names, MCP.CALL.name]), hidden = this.tools.filter(t => !show.has(t.name)).map(t => t.name);
        return this.tools.filter(t => show.has(t.name)).map(t => t.name !== MCP.CALL.name ? t
            : { ...t, description: `${t.description} Not listed here, reach them through call: ${hidden.join(", ")}.` });
    }

    tool(def, schema, handler){
        if (typeof def === "string") def = { name: def, ...schema, handler: handler ?? schema?.handler };
        else handler = def.handler ?? schema;

        const tool = {
            name: def.name,
            description: def.description ?? "",
            inputSchema: def.inputSchema ?? def.schema ?? { type: "object", properties: {} }
        };

        this.tools = this.tools.filter(t => t.name !== tool.name).concat(tool);
        this.handlers.set(tool.name, def.handler ?? handler);
        return this;
    }

    route(){
        this.router.post("/mcp", express.json({ limit: "4mb" }), (req, res) => this.post(req, res));
        this.router.all("/mcp", (req, res) => res.status(405).end());
    }

    /* `?as=<agent id>` on the url is WHO is calling: Servex puts it on the door it
     * hands every agent it spawns (Agents.door()), so a tool knows its caller without
     * the agent having to say. No `as` = a session outside Servex, e.g. a VS Code tab.
     * Handlers get it as their second argument: `handler(args, { caller })`. */
    async post(req, res){
        const from = req.socket.remoteAddress;
        if (!loopback(from)){
            return res.status(403).json({ jsonrpc: "2.0", id: null,
                error: { code: -32600, message: `/mcp answers loopback only; refused ${from}` } });
        }

        const { id, method, params = {} } = req.body ?? {};
        if (id == null) return res.status(202).end();      // a notification wants no answer

        try {
            res.json({ jsonrpc: "2.0", id, result: await this.result(method, params, { caller: req.query?.as ?? null }) });
        } catch (e){
            res.json({ jsonrpc: "2.0", id, error: { code: e.code ?? -32603, message: String(e.message || e) } });
        }
    }

    result(method, params, ctx = { caller: null }){
        if (method === "initialize") return {
            protocolVersion: VERSIONS.includes(params.protocolVersion) ? params.protocolVersion : VERSIONS[0],
            capabilities: { tools: {} },
            serverInfo: this.info,
            instructions: this.instructions
        };
        if (method === "ping") return {};
        if (method === "tools/list") return { tools: this.visible(ctx) };
        if (method === "tools/call") return this.call(params.name, params.arguments ?? {}, ctx);
        throw Object.assign(new Error(`Unknown method: ${method}`), { code: -32601 });
    }

    async call(name, args, ctx = { caller: null }){
        const handler = this.handlers.get(name);
        if (!handler) throw Object.assign(new Error(`Unknown tool: ${name}`), { code: -32602 });

        try {
            const value = await handler(args, ctx);
            return Array.isArray(value?.content) ? value : this.text(value);   // a handler may return finished content blocks (view_image: images)
        } catch (e){
            this.on_error?.(e, name === MCP.CALL.name && args?.tool ? args.tool : name, ctx);   // Servex sets it: an {"error"} line in the caller's session log (Servex/ErrorLine.js)
            return { content: [{ type: "text", text: String(e.message || e) }], isError: true };
        }
    }

    text(value){
        return { content: [{ type: "text", text: String(value) }] };
    }
}
