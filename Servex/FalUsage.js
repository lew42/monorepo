/* fal_usage: what Fal really billed; fal_estimate: what a call should cost before it runs. Read-only: GET requests to api.fal.ai plus
 * one POST to pricing/estimate (it computes a price, starts nothing), with the key from FalKey (a file, never returned).
 * Default view is Fal's billing-events feed (one row per billed request, with request_id); `view: "summary"` is the usage
 * aggregate per endpoint. Numbers only. Detail: ext/remote/doc/remote-tools.md, "fal_usage". */
import FalKey from "./FalKey.js";

const HOUR = 3600_000;

export default class FalUsage {
	static BASE = "https://api.fal.ai/v1/models";
	static TIMEOUT_MS = 20_000;
	static PAGE = 100;            // rows asked per page
	static MAX_EVENTS = 2000;     // hard ceiling on rows returned
	static DEFAULT_HOURS = 6;
	static LOOKUP_DAYS = 30;      // window when a request_id is given with no start/hours

	static list(v, what){
		const a = (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]).map(String);
		if (a.length > 50) throw new Error(`${what}: at most 50 values`);
		return a;
	}

	static iso(v, what){
		const d = new Date(v);
		if (Number.isNaN(d.getTime())) throw new Error(`${what} is not a date: use ISO 8601, like 2026-11-20T03:30:00Z`);
		return d.toISOString();
	}

	// one GET (or, with `send`, one POST: only used for /pricing/estimate, which computes a price and charges nothing);
	// errors become one readable line, never carrying the key
	static async get(route, params, send){
		const key = FalKey.read();
		const url = new URL(FalUsage.BASE + route);
		for (const [k, v] of Object.entries(params)) for (const x of [].concat(v)) if (x != null) url.searchParams.append(k, String(x));
		let res;
		const init = send ? { method: "POST", body: JSON.stringify(send), headers: { authorization: `Key ${key}`, accept: "application/json", "content-type": "application/json" } }
			: { headers: { authorization: `Key ${key}`, accept: "application/json" } };
		try { res = await fetch(url, { ...init, signal: AbortSignal.timeout(FalUsage.TIMEOUT_MS) }); }
		catch (e){ throw new Error(e.name === "TimeoutError" ? `Fal did not answer within ${FalUsage.TIMEOUT_MS / 1000} s` : `Could not reach Fal: ${e.cause?.code ?? e.message}`); }
		const text = await res.text();
		let body = null; try { body = JSON.parse(text); } catch {}
		if (!res.ok){
			const why = body?.error?.message ?? text.slice(0, 160);
			if (res.status === 401) throw new Error(`Fal rejected the key (401): ${why}. The key in ${FalKey.FILE} is wrong, deleted or expired.`);
			if (res.status === 403) throw new Error(`The Fal key lacks billing scope (403): ${why}. It needs billing:usage:read, auth:keys:read and account:users:read (the BILLING preset, or FULL).`);
			if (res.status === 429) throw new Error(`Fal rate-limited the request (429): ${why}. Try again in a minute.`);
			throw new Error(`Fal answered ${res.status}: ${why}`);
		}
		if (!body || typeof body !== "object") throw new Error("Fal answered something that was not JSON");
		return body;
	}

	static window(a, now = Date.now()){
		const end = a.end ? FalUsage.iso(a.end, "end") : new Date(now).toISOString();
		let start;
		if (a.start) start = FalUsage.iso(a.start, "start");
		else if (Number(a.hours) > 0) start = new Date(Date.parse(end) - Math.min(Number(a.hours), 24 * 90) * HOUR).toISOString();
		else if (FalUsage.list(a.request_id, "request_id").length) start = new Date(Date.parse(end) - FalUsage.LOOKUP_DAYS * 24 * HOUR).toISOString();
		else start = new Date(Date.parse(end) - FalUsage.DEFAULT_HOURS * HOUR).toISOString();
		if (Date.parse(start) >= Date.parse(end)) throw new Error("start must be before end");
		return { start, end };
	}

	static round(n){ return Math.round(n * 1e6) / 1e6; }

	static line(e){
		return { time: e.timestamp, request_id: e.request_id, endpoint: e.endpoint_id, unit: e.unit ?? null, quantity: e.quantity ?? null, unit_price: e.unit_price ?? null, cost_usd: FalUsage.round(e.cost_total ?? 0) };
	}

	static async events(a){
		const w = FalUsage.window(a);
		const cap = Math.min(Math.max(Number(a.max_events) || 500, 1), FalUsage.MAX_EVENTS);
		const params = { start: w.start, end: w.end, endpoint_id: FalUsage.list(a.endpoint_id, "endpoint_id"), request_id: FalUsage.list(a.request_id, "request_id"), limit: FalUsage.PAGE };
		const rows = []; let cursor = null, more = false;
		do {
			const body = await FalUsage.get("/billing-events", { ...params, cursor });
			rows.push(...(body.billing_events ?? []));
			cursor = body.has_more ? body.next_cursor : null;
			more = !!cursor;
		} while (cursor && rows.length < cap);
		const truncated = rows.length > cap || (more && rows.length >= cap);
		const lines = rows.slice(0, cap).map(FalUsage.line).sort((x, y) => String(x.time).localeCompare(String(y.time)));
		const by = new Map();
		for (const l of lines){ const b = by.get(l.endpoint) ?? { endpoint: l.endpoint, requests: 0, cost_usd: 0 }; b.requests++; b.cost_usd += l.cost_usd; by.set(l.endpoint, b); }
		const result = {
			ok: true, view: "events", source: "Fal billing-events (one row per billed request)", window: w, currency: "USD",
			count: lines.length, total_usd: FalUsage.round(lines.reduce((s, l) => s + l.cost_usd, 0)),
			by_endpoint: [...by.values()].map(b => ({ ...b, cost_usd: FalUsage.round(b.cost_usd) })).sort((x, y) => y.cost_usd - x.cost_usd),
			lines,
		};
		if (truncated) result.truncated = `more rows exist; showing the first ${lines.length}. Narrow the window or raise max_events (at most ${FalUsage.MAX_EVENTS}).`;
		if (!lines.length) result.note = "Fal returned no billed requests in this window. Billing rows can lag a few minutes behind a finished job; widen the window or try again shortly.";
		return result;
	}

	static async summary(a){
		const w = FalUsage.window(a);
		const body = await FalUsage.get("/usage", { start: w.start, end: w.end, endpoint_id: FalUsage.list(a.endpoint_id, "endpoint_id"), expand: "summary", bound_to_timeframe: "false" });
		const lines = (body.summary ?? []).map(s => ({ endpoint: s.endpoint_id, unit: s.unit ?? null, quantity: s.quantity ?? null, unit_price: s.unit_price ?? null, cost_usd: FalUsage.round(s.cost_total ?? 0), currency: s.currency ?? "USD" }));
		return { ok: true, view: "summary", source: "Fal usage (aggregate per endpoint and unit; no request ids)", window: w, count: lines.length, total_usd: FalUsage.round(lines.reduce((s, l) => s + l.cost_usd, 0)), lines };
	}

	// Fal's price list (base rate per unit) plus its two estimators. Nothing here is a charge: no generation is started.
	static async estimate(a){
		const ids = FalUsage.list(a.endpoint_id, "endpoint_id");
		if (!ids.length) throw new Error("endpoint_id is required, e.g. minimax/h3-max/lip-sync/image-to-video");
		if (ids.length > 10) throw new Error("endpoint_id: at most 10 values");
		const calls = a.call_quantity == null ? 1 : Number(a.call_quantity), units = a.unit_quantity == null ? null : Number(a.unit_quantity);
		if (!Number.isInteger(calls) || calls < 1) throw new Error("call_quantity must be a whole number, at least 1");
		if (units !== null && !(units >= 0.000001)) throw new Error("unit_quantity must be a number, at least 0.000001");
		const priced = await FalUsage.get("/pricing", { endpoint_id: ids });
		const price = new Map((priced.prices ?? []).map(p => [p.endpoint_id, p]));
		const missing = ids.filter(id => !price.has(id));
		if (missing.length) throw new Error(`Fal has no price for ${missing.join(", ")}. Copy the endpoint id exactly as the model page shows it.`);
		const ask = (id, type, q) => FalUsage.get("/pricing/estimate", {}, { estimate_type: type, endpoints: { [id]: q } }).then(b => FalUsage.round(b.total_cost));
		const lines = await Promise.all(ids.map(async id => {
			const p = price.get(id);
			const l = { endpoint: id, unit: p.unit ?? null, unit_price: p.unit_price ?? null, model_page: `https://fal.ai/models/${id}`,
				call_quantity: calls, typical_cost_usd: await ask(id, "historical_api_price", { call_quantity: calls }) };
			if (units !== null){ l.unit_quantity = units; l.unit_cost_usd = await ask(id, "unit_price", { unit_quantity: units }); }
			return l;
		}));
		return { ok: true, view: "estimate", source: "Fal pricing and pricing/estimate (an estimate, not a charge)", currency: "USD", lines,
			note: "unit_price is Fal's BASE rate per unit. Resolution and duration multipliers are per model and are not in this API: unit_cost_usd is only right if unit_quantity is the BILLED units (fal_usage shows them as `quantity` on past requests). typical_cost_usd is Fal's average over past calls of that endpoint by all users, not your settings. Multipliers for known models: ext/remote/doc/remote-tools.md, fal_estimate." };
	}

	static tools(){
		return [{
			name: "fal_estimate",
			description: "What a Fal call is expected to COST before you run it (an estimate; nothing is generated or charged). For each endpoint_id: Fal's base unit and unit_price, the typical cost of `call_quantity` calls (Fal's historical average), and, if you give `unit_quantity` (billed units, e.g. billed seconds), unit_quantity x price. The base rate is NOT the whole story: resolution and duration multipliers are per model, so compare with fal_usage `quantity` on past requests. The key is a file on the PC and is never returned.",
			inputSchema: { type: "object", properties: {
				endpoint_id: { anyOf: [{ type: "string" }, { type: "array", items: { type: "string" } }], description: "One endpoint id, or up to 10, e.g. heygen/avatar-6/turbo/image-to-video." },
				unit_quantity: { type: "number", description: "Billed units to price (at least 0.000001). Use the model's real billed units, multipliers included." },
				call_quantity: { type: "number", description: "Number of calls for the historical estimate (default 1)." },
			}, required: ["endpoint_id"] },
			handler: async (a = {}) => {
				let r;
				try { r = await FalUsage.estimate(a); }
				catch (e){ r = { ok: false, error: String(e.message || e) }; }
				return { content: [{ type: "text", text: JSON.stringify(r, null, 1) }], ...(r.ok ? {} : { isError: true }) };
			},
		}, {
			name: "fal_usage",
			description: "What Fal actually BILLED (not an estimate): one row per billed request with time, request_id, endpoint, unit, quantity, unit_price and cost_usd, plus a total and a per-endpoint split. Read-only; the key is a file on the PC and is never returned. Window: `hours` back from now (default 6), or `start`/`end` (ISO 8601). Narrow with `request_id` (one or a list; with no window given it searches the last 30 days) and/or `endpoint_id`. `view: \"summary\"` gives Fal's aggregate per endpoint and unit instead (no request ids). Billing rows can lag a finished job by a few minutes.",
			inputSchema: { type: "object", properties: {
				hours: { type: "number", description: "Window length back from now (default 6, at most 2160). Ignored when `start` is given." },
				start: { type: "string", description: "ISO 8601 start, e.g. 2026-11-20T03:30:00Z." },
				end: { type: "string", description: "ISO 8601 end, exclusive (default now)." },
				request_id: { anyOf: [{ type: "string" }, { type: "array", items: { type: "string" } }], description: "One request id, or up to 50." },
				endpoint_id: { anyOf: [{ type: "string" }, { type: "array", items: { type: "string" } }], description: "One endpoint id (e.g. xai/grok-imagine-video/v1.5/image-to-video), or up to 50." },
				view: { type: "string", enum: ["events", "summary"], description: "events (default): one row per billed request. summary: Fal's aggregate per endpoint." },
				max_events: { type: "number", description: "Most request rows returned (default 500, at most 2000)." },
			} },
			handler: async (a = {}) => {
				let r;
				try { r = a.view === "summary" ? await FalUsage.summary(a) : await FalUsage.events(a); }
				catch (e){ r = { ok: false, error: String(e.message || e) }; }
				return { content: [{ type: "text", text: JSON.stringify(r, null, 1) }], ...(r.ok ? {} : { isError: true }) };
			},
		}];
	}
}
