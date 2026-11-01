import { lan, safe_host } from "./MCP.js";

const PORT = Number(process.env.RECITE_PORT) || 8177;

/* The dev server's same-origin door onto recite-server (text to speech), the
 * twin of the `/whisper/*` routes in Whisper.js. `audio/Recite` talks to
 * `http://127.0.0.1:8177` on this machine, and to `<origin>/recite` anywhere
 * else (a phone on the LAN, or the tunnel), because 127.0.0.1 is a different
 * machine on every device. This plugin does NOT start recite-server: Servex
 * does (Servex/ext/recite/recite.js).
 *
 *   GET  /recite/health   GET /recite/voices   POST /recite/speak (JSON in, WAV out)
 *
 * Guarded exactly like `/whisper/*`: loopback or this machine's own LAN, and a
 * Host header that names this machine (`lan()` + `safe_host()`, MCP.js). */
export default class Recite {

    static setup(server) { new Recite(server); }

    constructor(server) {
        this.server = server;
        server.on("express", () => this.route());
    }

    guard(req, res) {
        const from = req.socket.remoteAddress;
        if (lan(from) && safe_host(req.headers.host)) return true;
        console.warn(`Recite: REFUSED ${req.originalUrl} from ${from} (Host: ${req.headers.host}) — loopback/LAN only.`);
        res.status(403).json({ error: "loopback/LAN only; refused " + from });
        return false;
    }

    /** Forward one request and copy back its status, type and the X-Recite-* headers. */
    async forward(req, res, route, init, ms) {
        if (!this.guard(req, res)) return;
        try {
            const r = await fetch(`http://127.0.0.1:${PORT}${route}`, { ...init, signal: AbortSignal.timeout(ms) });
            res.status(r.status);
            for (const h of ["content-type", "x-recite-seconds", "x-recite-took"]) if (r.headers.get(h)) res.set(h, r.headers.get(h));
            res.send(Buffer.from(await r.arrayBuffer()));
        } catch (e) {
            res.status(502).json({ error: "recite-server unreachable: " + (e?.message || e) });
        }
    }

    route() {
        const router = this.server.router;
        router.get("/recite/health", (req, res) => this.forward(req, res, "/health", {}, 2000));
        router.get("/recite/voices", (req, res) => this.forward(req, res, "/voices", {}, 2000));
        router.post("/recite/speak", this.server.express.raw({ type: "*/*", limit: "1mb" }), (req, res) =>
            this.forward(req, res, "/speak", { method: "POST", headers: { "content-type": "application/json" }, body: req.body }, 20000));
    }
}
