import http from "http";
import net from "net";
import http_proxy from "http-proxy";
import Events from "../Server/Events.js";

const css = `
  body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #111; color: #ccc; }
  h1 { font-size: 1.4em; margin-bottom: 0.4em; }
  p { margin: 0.3em 0; font-size: 0.95em; color: #888; }
  a { color: #7c9cbf; }
`;

const starting_page = (name) => `<!doctype html>
<html><head><title>Starting ${name}…</title><style>${css}</style></head><body>
  <h1 style="color:#4ade80">Starting ${name}…</h1>
  <p>Servex is booting it. This page reloads itself when it answers.</p>
  <script>
    const poll = async () => {
      try {
        const r = await fetch(location.href, { cache: 'no-store' });
        if (!r.headers.get('x-servex-starting')) return location.reload();
      } catch {}
      setTimeout(poll, 800);
    };
    setTimeout(poll, 1200);
  </script>
</body></html>`;

const no_route_page = (host, dashboard) => `<!doctype html>
<html><head><title>No route</title><style>${css}</style></head><body>
  <h1 style="color:#f87171">Servex has no project called ${host}</h1>
  <p><a href="${dashboard}">Open the Servex dashboard</a></p>
</body></html>`;

/* ONE PORT, EVERY PROJECT — `monorepo.localhost` reaches whatever port
 * Servex gave the monorepo. Chrome resolves every `*.localhost` name to
 * 127.0.0.1 without any hosts-file entry, which is the whole trick.
 *
 * The best idea in the old Servex is kept exactly as it was: when the target
 * port refuses the connection, Servex STARTS the project and serves a small
 * page that polls itself until it is up. Visiting a stopped project's URL boots
 * it — you never think about starting a server again.
 *
 * ⚠ Binds 127.0.0.1, never 0.0.0.0. This thing routes to arbitrary local
 * processes; the old Servex listened on every interface, and its own MVP doc
 * calls that out as a bug.
 *
 * Port 80 (the owner, 2026-09-23: "the monorepo dev server shouldn't be a
 * dependency of the servex"), so the names read clean — `servex.localhost`,
 * `monorepo.localhost`, no port. A request with no name at all (`localhost`,
 * `127.0.0.1`) goes to `bare` — Servex's own dashboard. */
export default class ReverseProxy extends Events {

    initialize(){
        this.port ??= 80;
        this.host ??= "127.0.0.1";
        this.bare ??= null;         // the project a nameless `localhost` reaches
        this.site ??= null;         // where a nameless `localhost` PAGE link is sent — see handle()
        this.ports ??= {};
        this.wait ??= 15000;        // how long a request waits for a starting project — ready(), failed()

        this.proxy = http_proxy.createProxyServer({});
        this.proxy.on("error", (err, req, res) => this.failed(err, req, res));

        /* ⚠ BOTH loopbacks, IPv4 and IPv6. Chrome tries `[::1]` first for every
         * `*.localhost` name; with nothing there, Windows takes ~2 s to refuse
         * each connection before Chrome falls back to 127.0.0.1 — a page that
         * imports 75 modules sat blank in a fresh browser (servex-port-80,
         * 2026-09-23). Still loopback only: `::1` is this machine, like 127.0.0.1. */
        this.servers = [this.host, ...(this.host === "127.0.0.1" ? ["::1"] : [])].map(host => {
            const server = http.createServer((req, res) => this.handle(req, res));
            server.on("upgrade", (req, socket, head) => this.upgrade(req, socket, head));
            server.on("clientError", (err, socket) => socket.destroy());
            server.on("error", err => console.warn(`proxy: could not listen on [${host}]:${this.port} — ${err.code}`));
            server.listen(this.port, host, () => this.emit("listening", this.port, host));
            return server;
        });
        this.server = this.servers[0];
    }

    name(req){
        const host = (req.headers?.host || "").replace(/:\d+$/, "").toLowerCase();
        if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return this.bare ?? host;
        return host.replace(/\.localhost$/, "");
    }

    target(req){
        const port = this.ports[this.name(req)];
        return port ? `http://127.0.0.1:${port}` : null;
    }

    /* An old tab or bookmark at `localhost/framework/…` would otherwise load the
     * site's files straight off the dashboard (it serves them for its own
     * imports) with no dev server behind them — a page that looks right and
     * cannot write. A page load (not a script, not an API call) for anything
     * but the dashboard itself is sent on to `site` instead. */
    handle(req, res){
        const host = (req.headers.host || "").replace(/:\d+$/, "").toLowerCase();
        if (this.site && (host === "localhost" || host === "127.0.0.1" || host === "[::1]")
            && req.headers["sec-fetch-mode"] === "navigate"
            && !/^\/(index\.html)?(\?|$)|^\/(api|log|mcp|agents)(\/|\?|$)/.test(req.url))
            return res.writeHead(302, { Location: `http://${this.site}.localhost${req.url}` }).end();

        const target = this.target(req);
        if (!target) return res.writeHead(404, { "Content-Type": "text/html" })
            .end(no_route_page(req.headers.host, this.dashboard ?? "/"));
        this.ready(req, res, () => this.proxy.web(req, res, { target }));
    }

    /* Hold a request until its project can take it. A request whose body cannot
     * be sent twice — a POST, a websocket — must not reach a port that is still
     * down: failed() would find the body already spent. So when the project is
     * `starting`, or the request is anything but GET/HEAD, the port is knocked
     * on first (every 250 ms, up to `wait`), and a refusal starts the project
     * (`missing`). The body is still unread while it waits, so nothing is lost.
     * 2026-09-24: right after a Servex restart, the `site` MCP's POST /mcp got
     * the HTML Starting page and every session failed "Unexpected content type".
     * A GET for a running project goes straight through, as always. */
    ready(req, socket, go){
        const name = this.name(req), port = this.ports[name];
        const upgrade = !socket.writeHead;
        if (!port || (!upgrade && /^(GET|HEAD)$/.test(req.method) && !this.starting?.(name))) return go();

        const deadline = Date.now() + this.wait;
        let asked = false;
        const knock = () => {
            if (socket.destroyed) return;
            const probe = net.connect(port, "127.0.0.1");
            probe.once("connect", () => { probe.destroy(); go(); });
            probe.once("error", () => {
                probe.destroy();
                if (!asked){ asked = true; if (!this.missing?.(name)) return go(); }   // not startable — let failed() say so
                if (Date.now() < deadline) setTimeout(knock, 250);
                else go();                                                           // failed() answers
            });
        };
        knock();
    }

    /* ⚠ The visitor's socket gets its own error listener. An open tab's
     * live-reload socket that resets (a reload, a closed tab, a target with no
     * websocket at all) emits ECONNRESET on it, and http-proxy never listens
     * there — unhandled, that one reset killed Servex on every boot while old
     * tabs were reconnecting (servex-port-80, 2026-09-23). */
    upgrade(req, socket, head){
        socket.on("error", () => socket.destroy());
        const target = this.target(req);
        if (!target) return socket.destroy();
        this.ready(req, socket, () => this.proxy.ws(req, socket, head, { target }));
    }

    /* The target port did not answer — almost always because the project is not
     * running. `missing` is Servex's auto-start; if it says it is starting one,
     * a page load (GET or HEAD, safe to send twice) simply WAITS: the port is
     * tried every 250 ms, for up to `wait`, and the request is sent again the
     * moment it answers — the visitor sees the page, late, instead of a
     * "Starting…" page. Right after Servex itself restarts, the dev server is
     * always down (it died with Servex), so this is what makes a reload in that
     * moment look like nothing happened. Only if the project never answers does
     * a page NAVIGATION get the polling page; anything else (a fetch, an MCP
     * call) gets a plain 503 + Retry-After, never HTML it cannot parse. */
    failed(err, req, res){
        if (!res?.writeHead || res.headersSent || res.destroyed) return;
        const name = this.name(req);

        if (this.missing?.(name)){
            const port = this.ports[name];
            req.servex_deadline ??= Date.now() + this.wait;
            if (port && /^(GET|HEAD)$/.test(req.method) && Date.now() < req.servex_deadline)
                return this.retry(req, res, port);
            if (req.headers["sec-fetch-mode"] === "navigate" || /text\/html/.test(req.headers.accept || ""))
                return res.writeHead(200, { "Content-Type": "text/html", "X-Servex-Starting": "1" }).end(starting_page(name));
            return res.writeHead(503, { "Content-Type": "text/plain", "Retry-After": "1", "X-Servex-Starting": "1" })
                .end(`${name} is starting — try again in a second.\n`);
        }
        res.writeHead(502, { "Content-Type": "text/html" }).end(no_route_page(req.headers.host, this.dashboard ?? "/"));
    }

    /* Knock on the port until it answers, then send the request again. A second
     * refusal lands back in failed(), which knows the deadline from the first. */
    retry(req, res, port){
        const knock = () => {
            if (res.headersSent || res.destroyed) return;
            const socket = net.connect(port, "127.0.0.1");
            socket.once("connect", () => { socket.destroy(); this.proxy.web(req, res, { target: `http://127.0.0.1:${port}` }); });
            socket.once("error", () => {
                socket.destroy();
                if (Date.now() < req.servex_deadline) setTimeout(knock, 250);
                else this.failed(null, req, res);
            });
        };
        setTimeout(knock, 250);
    }
}
