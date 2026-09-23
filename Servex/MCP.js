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
        this.route();
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

    async post(req, res){
        const from = req.socket.remoteAddress;
        if (!loopback(from)){
            return res.status(403).json({ jsonrpc: "2.0", id: null,
                error: { code: -32600, message: `/mcp answers loopback only; refused ${from}` } });
        }

        const { id, method, params = {} } = req.body ?? {};
        if (id == null) return res.status(202).end();      // a notification wants no answer

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
            serverInfo: this.info,
            instructions: this.instructions
        };
        if (method === "ping") return {};
        if (method === "tools/list") return { tools: this.tools };
        if (method === "tools/call") return this.call(params.name, params.arguments ?? {});
        throw Object.assign(new Error(`Unknown method: ${method}`), { code: -32601 });
    }

    async call(name, args){
        const handler = this.handlers.get(name);
        if (!handler) throw Object.assign(new Error(`Unknown tool: ${name}`), { code: -32602 });

        try {
            return this.text(await handler(args));
        } catch (e){
            return { content: [{ type: "text", text: String(e.message || e) }], isError: true };
        }
    }

    text(value){
        return { content: [{ type: "text", text: String(value) }] };
    }
}
