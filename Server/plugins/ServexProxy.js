import { Readable } from "stream";
import { lan, safe_host } from "./MCP.js";

const SERVEX = "http://127.0.0.1:8090";

/* A dev-only, same-origin PROXY onto Servex — `/servex/*` → `http://127.0.0.1:8090/*`,
 * built for `ai/2026-09-29/mobile-nav/` the same way `Server/plugins/Whisper.js`
 * proxies `/whisper/*` onto whisper-server. Servex answers the AI drawer's page-ai
 * route and the prompt log at `127.0.0.1:8090`, and that address means a different
 * machine on every device — a phone on the LAN can never reach "127.0.0.1" that way.
 * `public/framework/dev/servex_url.js` is the browser side of this same wire: it
 * points a non-localhost page at `<origin>/servex` instead of `127.0.0.1:8090` directly.
 *
 * Guarded by `lan()` AND `safe_host()` (`MCP.js`), the SAME checks `/ask/turn`
 * uses — loopback or this machine's own Wi-Fi, AND a `Host` header that actually
 * names this machine (closing DNS rebinding: a page bound to 127.0.0.1 from an
 * outside domain would otherwise pass `lan()` alone). This exposes ALL of Servex's HTTP
 * API (agents, servers, logs — not just the page-ai and prompt-log calls the phone's
 * drawer happens to make today) to anyone on that network, which is the owner's own
 * choice (2026-09-29: "do NOT downgrade the phone's assistant" — a path allow-list
 * would have to be kept in lockstep with whatever the drawer starts calling next,
 * and would still let a full Servex user run every agent tool from a browser tab
 * that IS on the network, just through a narrower door). A caller outside `lan()`
 * gets 403 before any request reaches Servex at all.
 *
 * Forwards the method, every header but `host` (which must name THIS server, not
 * Servex, or `fetch` sends the wrong one) and the raw body bytes untouched — a
 * page-ai call is small JSON, but this stays generic (any method, any content-type)
 * rather than special-casing JSON, so it also carries whatever Ask ends up needing.
 * The reply streams straight back with `Readable.fromWeb`, so a chunked reply (Ask's
 * own streaming turns) is not buffered whole before the caller sees the first byte.
 * A dead or missing Servex answers 502 with a plain JSON reason — same shape as
 * Whisper.js's own failure path, so callers already know what "unreachable" looks like. */
export default class ServexProxy {

	static setup(server) { new ServexProxy(server); }

	constructor(server) {
		this.server = server;
		server.on("express", () => this.route());
	}

	route() {
		this.server.router.all(/^\/servex\/(.*)/, this.server.express.raw({ type: "*/*", limit: "30mb" }), async (req, res) => {
			const from = req.socket.remoteAddress;
			if (!lan(from) || !safe_host(req.headers.host)){
				console.warn(`ServexProxy: REFUSED ${req.originalUrl} from ${from} (Host: ${req.headers.host}) — loopback/LAN only.`);
				return res.status(403).json({ error: "loopback/LAN only; refused " + from });
			}

			const rest = req.params[0] || "";
			const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
			const target = `${SERVEX}/${rest}${qs}`;

			try {
				const headers = { ...req.headers };
				delete headers.host;
				delete headers["content-length"];

				const r = await fetch(target, {
					method: req.method,
					headers,
					body: ["GET", "HEAD"].includes(req.method) || !req.body?.length ? undefined : req.body,
					signal: AbortSignal.timeout(30000),
				});

				res.status(r.status);
				for (const [k, v] of r.headers)
					if (!["content-encoding", "transfer-encoding", "connection"].includes(k.toLowerCase())) res.set(k, v);

				if (r.body) Readable.fromWeb(r.body).pipe(res);
				else res.end();
			} catch (e) {
				res.status(502).json({ error: "Servex unreachable: " + (e?.message || e) });
			}
		});
	}
}
