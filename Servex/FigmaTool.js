/* figma: a generic pass-through to Figma's own MCP server (https://mcp.figma.com/mcp), called from the PC.
 * A cloud voice chat asks aloud before every call to Figma's connector (use_figma is destructiveHint) and a spoken yes often does not
 * count; a Servex tool is never asked about. So the chat calls Figma THROUGH Servex: this forwards tools/call, tools/list,
 * resources/* and prompts/* unchanged and returns Figma's own content (images included). Nothing here knows a Figma tool by name,
 * so a new Figma tool needs no change. A write to a file another agent has claimed is refused (claims.js). Detail: ext/remote/doc/remote-tools.md. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const HOME = () => process.env.SERVEX_HOME || path.join(process.env.LOCALAPPDATA || os.homedir(), "lew42", "servex");
const LOGIN_EXPIRED = "The Figma login on the PC has expired (Figma answered 401). The owner needs to re-authenticate the `figma` MCP in Claude Code (/mcp, figma, Authenticate); nothing in Servex can renew it.";
// names that are writes even before Figma's tools/list has been read (the list's own annotations win once it is cached)
const WRITE_FALLBACK = new Set(["use_figma", "upload_assets", "create_session", "generate_figma_design", "send_code_to_figma", "html_to_figma", "add_code_connect_map", "send_code_connect_mappings", "create_branch"]);
const NOT_A_FILE_WRITE = new Set(["create_session"]);   // opens a working session; changes nothing in the file

export default class FigmaTool {
	static URL = "https://mcp.figma.com/mcp";
	static PROTOCOL = "2025-06-18";
	static CALL_MS = 150_000;     // use_figma can run long
	static META_MS = 30_000;
	static DEFS_TTL_MS = 10 * 60_000;
	static LIMIT_MINUTE = 10;     // Figma's own limits, shared by every agent on the account
	static LIMIT_DAY = 200;
	static VOICE_CLAIM_MS = 4 * 3600_000;   // a cloud chat is never "live" in agents.live, so its claim counts for this long

	constructor({ url = FigmaTool.URL, credentials, claims = null, log_file, now = () => Date.now() } = {}){
		this.url = url;
		this.credentials = credentials ?? process.env.FIGMA_CREDENTIALS ?? path.join(os.homedir(), ".claude", ".credentials.json");
		this.claims = claims;
		this.log_file = log_file ?? path.join(HOME(), "logs", "figma-calls.jsonl");
		this.now = now;
		this.sid = null; this.ready = false; this.opening = null;   // Figma today is stateless (no mcp-session-id): `ready` says initialize was done, `sid` only when Figma gave one
		this.next_id = 1;
		this.defs = null; this.defs_at = 0;
		this.calls = null;       // timestamps (ms) of tools/call, today only; read from the log on first use
	}

	// ---- the login: read fresh, never written, never returned or logged ----
	token(){
		let c;
		try { c = JSON.parse(fs.readFileSync(this.credentials, "utf8")); } catch { throw new Error("cannot read the Claude Code login file on the PC"); }
		const entry = Object.values(c.mcpOAuth ?? {}).find(v => v?.serverName === "figma" && v.accessToken);
		if (!entry) throw new Error("Claude Code has no Figma login on this PC (no `figma` entry); the owner must authenticate the `figma` MCP in Claude Code");
		return entry.accessToken;
	}

	// ---- one HTTP exchange; a body that is JSON or an event stream, the answer with the matching id ----
	async post(body, { timeout = FigmaTool.META_MS } = {}){
		const res = await fetch(this.url, {
			method: "POST", signal: AbortSignal.timeout(timeout),
			headers: { authorization: "Bearer " + this.token(), "content-type": "application/json", accept: "application/json, text/event-stream", ...(this.sid && body.method !== "initialize" ? { "mcp-session-id": this.sid } : {}) },
			body: JSON.stringify(body),
		});
		const text = await res.text();
		return { res, text };
	}

	static parse(text, id, content_type = ""){
		const msgs = [];
		if (content_type.includes("event-stream")){
			for (const line of text.split(/\r?\n/)) if (line.startsWith("data:")){ try { msgs.push(JSON.parse(line.slice(5))); } catch {} }
		} else { try { msgs.push(JSON.parse(text)); } catch {} }
		return msgs.find(m => m.id === id) ?? msgs.at(-1) ?? null;
	}

	async open(){
		const id = this.next_id++;
		const { res, text } = await this.post({ jsonrpc: "2.0", id, method: "initialize", params: { protocolVersion: FigmaTool.PROTOCOL, capabilities: {}, clientInfo: { name: "servex-figma", version: "1" } } });
		if (res.status === 401) throw new Error(LOGIN_EXPIRED);
		if (!res.ok) throw new Error(`Figma initialize failed: HTTP ${res.status} ${text.slice(0, 200)}`);
		const msg = FigmaTool.parse(text, id, res.headers.get("content-type") ?? "");
		if (msg?.error) throw new Error(`Figma initialize failed: ${msg.error.message}`);
		this.sid = res.headers.get("mcp-session-id");
		this.ready = true;
		await this.post({ jsonrpc: "2.0", method: "notifications/initialized" }).catch(() => {});
	}

	reset(){ this.sid = null; this.ready = false; }

	ensure(){
		if (this.ready) return Promise.resolve();
		return this.opening ??= this.open().finally(() => { this.opening = null; });
	}

	/* One JSON-RPC call. A rejected or expired session is opened again once; a 401 re-reads the login file once (Claude Code may have
	 * refreshed it) and then says the login has expired. Returns Figma's `result`; a JSON-RPC `error` becomes a thrown readable message. */
	async rpc(method, params = {}, { timeout = FigmaTool.META_MS } = {}){
		for (let attempt = 0; ; attempt++){
			await this.ensure();
			const id = this.next_id++;
			const { res, text } = await this.post({ jsonrpc: "2.0", id, method, params }, { timeout });
			if (res.status === 401){ this.reset(); if (attempt < 1) continue; throw new Error(LOGIN_EXPIRED); }
			const msg = FigmaTool.parse(text, id, res.headers.get("content-type") ?? "");
			const lost = res.status === 404 || (res.status === 400 && /session/i.test(text)) || (msg?.error && /session/i.test(msg.error.message ?? "") && /(not found|expired|invalid|unknown)/i.test(msg.error.message));
			if (lost){ this.reset(); if (attempt < 1) continue; }
			if (!res.ok && !msg) throw new Error(`Figma answered HTTP ${res.status}: ${text.slice(0, 300)}`);
			if (msg?.error) throw new Error(`Figma ${method} error ${msg.error.code ?? ""}: ${msg.error.message}`);
			if (!msg) throw new Error(`Figma gave no answer to ${method}`);
			return msg.result ?? {};
		}
	}

	async paged(method, key){
		const all = []; let cursor;
		do {
			const r = await this.rpc(method, cursor ? { cursor } : {});
			all.push(...(r[key] ?? [])); cursor = r.nextCursor;
		} while (cursor);
		return all;
	}

	async tool_defs(fresh = false){
		if (fresh || !this.defs || this.now() - this.defs_at > FigmaTool.DEFS_TTL_MS){ this.defs = await this.paged("tools/list", "tools"); this.defs_at = this.now(); }
		return this.defs;
	}

	// ---- the call count: Figma allows about 10 a minute and 200 a day for the whole account ----
	load_calls(){
		if (this.calls) return;
		this.calls = [];
		const start = new Date(this.now()); start.setHours(0, 0, 0, 0);
		try {
			for (const line of fs.readFileSync(this.log_file, "utf8").split("\n")) {
				if (!line) continue;
				try { const r = JSON.parse(line); if (r.counted && Date.parse(r.at) >= start.getTime()) this.calls.push(Date.parse(r.at)); } catch {}
			}
		} catch {}
	}

	counts(){
		this.load_calls();
		const t = this.now(), start = new Date(t); start.setHours(0, 0, 0, 0);
		this.calls = this.calls.filter(c => c >= start.getTime());
		return { last_minute: this.calls.filter(c => c > t - 60_000).length, today: this.calls.length, limit_minute: FigmaTool.LIMIT_MINUTE, limit_day: FigmaTool.LIMIT_DAY };
	}

	log(row){
		try {
			fs.mkdirSync(path.dirname(this.log_file), { recursive: true });
			fs.appendFileSync(this.log_file, JSON.stringify({ at: new Date(this.now()).toISOString(), ...row }) + "\n");
		} catch {}
	}

	// ---- the claim check: a write to a file another live agent has claimed is refused ----
	static file_key(args){
		if (typeof args?.fileKey === "string" && args.fileKey) return args.fileKey;
		const m = /figma\.com\/(?:design|file|board|make|slides|proto)\/([A-Za-z0-9]+)/.exec(String(args?.url ?? ""));
		return m ? m[1] : null;
	}

	is_write(name, defs){
		if (NOT_A_FILE_WRITE.has(name)) return false;
		const def = defs?.find(t => t.name === name);
		return def ? def.annotations?.readOnlyHint !== true : WRITE_FALLBACK.has(name);
	}

	blocker(key, caller){
		if (!this.claims) return null;
		const base = `figma:${key}`.toLowerCase();
		for (const row of this.claims.list()){
			const thing = String(row.thing ?? "").toLowerCase();
			if (thing !== base && !thing.startsWith(base + "/")) continue;
			if (row.agent === caller) continue;
			const live = !row.stale || (row.agent === "voice-app" && this.now() - Date.parse(row.at) < FigmaTool.VOICE_CLAIM_MS);
			if (live) return row;
		}
		return null;
	}

	// ---- the tool ----
	async handle(a = {}, ctx = {}){
		const t0 = this.now(), caller = ctx?.caller ?? "owner";
		if (a.status) return JSON.stringify({ session_open: this.ready, session_id_held: !!this.sid, tools_cached: this.defs?.length ?? 0, calls: this.counts(), log: this.log_file });
		if (a.list){
			const defs = await this.tool_defs(true);
			if (a.list === "names") return defs.map(t => `${t.name}${t.annotations?.readOnlyHint ? "" : " [writes]"}: ${String(t.description ?? "").split("\n")[0].slice(0, 160)}`).join("\n");
			if (typeof a.list === "string" && a.list !== "true"){
				const one = defs.find(t => t.name === a.list);
				if (!one) throw new Error(`Figma has no tool ${a.list}; figma({list:"names"}) lists them`);
				return JSON.stringify(one, null, 1);
			}
			return JSON.stringify(defs);
		}
		if (a.resources) return JSON.stringify(await this.paged("resources/list", "resources"));
		if (a.prompts) return JSON.stringify(await this.paged("prompts/list", "prompts"));
		if (a.resource){
			const r = await this.rpc("resources/read", { uri: String(a.resource) });
			const content = [];
			for (const c of r.contents ?? []){
				if (typeof c.text === "string") content.push({ type: "text", text: (r.contents.length > 1 ? `// ${c.uri}\n` : "") + c.text });
				else if (c.blob && /^image\//.test(c.mimeType ?? "")) content.push({ type: "image", data: c.blob, mimeType: c.mimeType });
				else content.push({ type: "text", text: JSON.stringify({ uri: c.uri, mimeType: c.mimeType, blob_bytes: Math.floor(String(c.blob ?? "").length * 3 / 4) }) });
			}
			return { content: content.length ? content : [{ type: "text", text: "(empty resource)" }] };
		}
		if (a.prompt) return JSON.stringify(await this.rpc("prompts/get", { name: String(a.prompt), arguments: a.args ?? {} }));
		if (!a.tool) throw new Error('give `tool` (a Figma tool name) with `args`, or `list` (true | "names" | a tool name), `resources`, `resource` (a uri), `prompts`, `prompt`, or `status`');

		const name = String(a.tool), args = a.args && typeof a.args === "object" ? a.args : {};
		const key = FigmaTool.file_key(args);
		let forced = null;
		if (key){
			const defs = await this.tool_defs().catch(() => null);
			if (this.is_write(name, defs)){
				const held = this.blocker(key, caller);
				if (held && a.force !== true){
					this.log({ tool: name, caller, fileKey: key, blocked_by: held.agent });
					return { isError: true, content: [{ type: "text", text: JSON.stringify({ blocked: true, why: `Figma file ${key} is claimed by ${held.agent} since ${held.at}${held.change ? ` (${held.change})` : ""}; a write now could overwrite what it is about to do. Nothing was sent to Figma.`, holder: held.agent, since: held.at, claim: held.thing, card: held.card ?? null, options: [`ask ${held.agent} to pause and release the claim (send_to_agent)`, "retry when it has released (list_claims)", "pass force: true only when the owner has said to"] }) }] };
				}
				if (held) forced = held.agent;
			}
		}

		this.load_calls();
		this.calls.push(this.now());
		let result, err;
		try { result = await this.rpc("tools/call", { name, arguments: args }, { timeout: FigmaTool.CALL_MS }); } catch (e){ err = e; }
		this.log({ tool: name, caller, fileKey: key, ms: this.now() - t0, ok: !err && !result?.isError, counted: true, ...(forced ? { forced_past: forced } : {}), ...(err ? { error: String(err.message).slice(0, 200) } : {}) });
		if (err) throw err;

		const content = Array.isArray(result.content) ? [...result.content] : [{ type: "text", text: JSON.stringify(result) }];
		if (forced) content.push({ type: "text", text: `(servex: forced past the claim held by ${forced})` });
		const n = this.counts();
		if (n.last_minute >= FigmaTool.LIMIT_MINUTE - 2 || n.today >= FigmaTool.LIMIT_DAY - 30) content.push({ type: "text", text: `(servex: ${n.last_minute} Figma calls in the last minute, ${n.today} today; Figma allows about ${n.limit_minute} a minute and ${n.limit_day} a day for the whole account)` });
		return { content, ...(result.isError ? { isError: true } : {}) };
	}

	definition(){
		return {
			name: "figma",
			description: "Call Figma's own MCP server through the PC (no approval prompt, same answer back, images included). `figma({tool, args})` runs any Figma tool (use_figma, get_metadata, get_screenshot, create_session, whoami, upload_assets, ...) and returns its content unchanged; its own tool guide: figma({list:\"names\"}) is one line per tool ([writes] marks the ones that change things), figma({list:\"use_figma\"}) one tool's full schema, figma({list:true}) all of them. figma({resources:true}) / figma({resource:\"skill://figma/figma-use/SKILL.md\"}) list and read Figma's skills and docs; figma({prompts:true}) / figma({prompt:name}) its prompts; figma({status:true}) the call count (Figma allows about 10 calls a minute and 200 a day, for everyone). Start a file with create_session, pass its sessionId on later calls, and claim the file first (claim_topic thing \"figma:<fileKey>\"): a write to a file another live agent has claimed is refused and the answer names the holder; `force: true` overrides, only on the owner's say-so. Reads are never refused.",
			inputSchema: { type: "object", properties: {
				tool: { type: "string", description: "A Figma MCP tool name: use_figma, get_metadata, get_screenshot, whoami, create_session, ..." },
				args: { type: "object", description: "That tool's own arguments, exactly as Figma's schema (figma({list:\"<tool>\"})) names them." },
				force: { type: "boolean", description: "Write even though another live agent has claimed the file. Only when the owner said so." },
				list: { description: "true: all of Figma's tools with schemas. \"names\": one line each. A tool name: that one's full definition." },
				resources: { type: "boolean", description: "List Figma's resources (skills, docs)." },
				resource: { type: "string", description: "Read one resource by uri, e.g. skill://figma/figma-use/SKILL.md or file://figma/docs/add-custom-rules.md." },
				prompts: { type: "boolean", description: "List Figma's prompts." },
				prompt: { type: "string", description: "Get one prompt by name (its arguments in `args`)." },
				status: { type: "boolean", description: "Session state and the call count against Figma's rate limit." },
			} },
			handler: (a, ctx) => this.handle(a, ctx),
		};
	}

	static tools(opts){ return [new FigmaTool(opts).definition()]; }
}
