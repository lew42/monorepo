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

        /* ⚠ A KEEP-ALIVE agent. Without one, http-proxy opens a fresh connection
         * to the project for every request and closes it; each close leaves a
         * port in TIME_WAIT for two minutes. A page importing ~100 modules,
         * reloaded a few times, used up Windows' 16,384 outgoing ports and the
         * next connect failed EADDRINUSE (servex-crash, 2026-09-24: 24,907
         * TIME_WAIT sockets, most of them to the dev server). */
        this.proxy = http_proxy.createProxyServer({ agent: new http.Agent({ keepAlive: true, maxSockets: 64 }) });
        this.proxy.on("error", (err, req, res) => this.failed(err, req, res));
        this.seen = {};             // name -> when it last answered; ready() skips the knock while this is fresh
        this.knocking = {};         // port -> the one shared wait-for-it loop — answers()
        this.proxy.on("proxyRes", (res, req) => this.seen[this.name(req)] = Date.now());

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
     * A project that answered in the last 5 s is not knocked on — every knock
     * is one more connection, and connections are what ran out (see above).
     * 2026-09-24: right after a Servex restart, the `site` MCP's POST /mcp got
     * the HTML Starting page and every session failed "Unexpected content type".
     * A GET for a running project goes straight through, as always. */
    ready(req, socket, go){
        const name = this.name(req), port = this.ports[name];
        const upgrade = !socket.writeHead;
        const fresh = Date.now() - (this.seen[name] ?? 0) < 5000;    // it answered moments ago — a knock would only cost a port
        const unsafe = upgrade || !/^(GET|HEAD)$/.test(req.method);  // a body or a socket that cannot be sent twice
        const hold = port && (this.starting?.(name) || (unsafe && !fresh));
        if (!hold) return go();

        const first = this.starting?.(name) ? Promise.resolve(false) : this.knock(port);   // starting: straight to the shared wait
        first.then(up => {
            if (up || !this.missing?.(name)) return go();          // up, or not startable — failed() says so
            return this.answers(port).then(() => socket.destroyed || go());   // down after `wait`: failed() answers
        });
    }

    /* One knock: does the port take a connection right now? */
    knock(port){
        return new Promise(done => {
            const probe = net.connect(port, "127.0.0.1");
            probe.once("connect", () => { probe.destroy(); done(true); });
            probe.once("error", () => { probe.destroy(); done(false); });
        });
    }

    /* Knock every 250 ms until the port answers or `wait` runs out. ⚠ SHARED:
     * every request waiting on one port awaits the same loop. A page's hundred
     * module requests each knocking on their own was 400 connections a second,
     * and those ran the machine out of ports too (servex-crash, 2026-09-24). */
    answers(port){
        return this.knocking[port] ??= (async () => {
            const until = Date.now() + this.wait;
            try {
                while (Date.now() < until){
                    if (await this.knock(port)) return true;
                    await new Promise(r => setTimeout(r, 250));
                }
                return false;
            } finally { delete this.knocking[port]; }
        })();
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

    /* The proxy could not reach the target. Every error is announced first
     * (`proxy_error` — Servex writes it to the `servex` log), so an intermittent
     * failure names itself.
     *
     * ONLY a refused connection means "the project is not running" (2026-09-24:
     * treating a reset or a "socket hang up" as that answered 1 POST in 6 with
     * the Starting page while the dev server was up, and once autostarted a
     * second dev server that died with EADDRINUSE). A refusal goes to
     * `missing`, Servex's auto-start; a page load (GET or HEAD, safe to send
     * twice) then WAITS — the port is tried every 250 ms, for up to `wait`, and
     * the request is sent again the moment it answers. Right after Servex
     * restarts, the dev server is always down (it died with Servex), so this is
     * what makes a reload in that moment look like nothing happened. Only if the
     * project never answers does a page NAVIGATION get the polling page;
     * anything else (a fetch, an MCP call) gets a plain 503 + Retry-After.
     *
     * Any other error: a GET/HEAD is sent once more straight away; everything
     * else gets a plain-text 502 naming the error. Never HTML a fetch cannot
     * parse, never an autostart. */
    failed(err, req, res){
        const code = err ? (err.code || err.message) : "TIMEOUT";
        this.emit("proxy_error", { code, method: req.method, host: req.headers?.host, path: req.url });
        if (!res?.writeHead) return res?.destroy?.();          // a websocket: nothing to answer with
        if (res.headersSent || res.destroyed) return;
        const name = this.name(req), port = this.ports[name];
        const page = req.headers["sec-fetch-mode"] === "navigate" || /text\/html/.test(req.headers.accept || "");
        const plain = (status, text, extra = {}) => res.writeHead(status, { "Content-Type": "text/plain", ...extra }).end(text + "\n");

        if (err && err.code !== "ECONNREFUSED"){
            if (port && /^(GET|HEAD)$/.test(req.method) && !req.servex_again){
                req.servex_again = true;
                return this.proxy.web(req, res, { target: `http://127.0.0.1:${port}` });
            }
            return plain(502, `Servex could not reach ${name}: ${code}`);
        }

        if (this.missing?.(name)){
            req.servex_deadline ??= Date.now() + this.wait;
            if (port && /^(GET|HEAD)$/.test(req.method) && Date.now() < req.servex_deadline)
                return this.retry(req, res, port);
            if (page) return res.writeHead(200, { "Content-Type": "text/html", "X-Servex-Starting": "1" }).end(starting_page(name));
            return plain(503, `${name} is starting — try again in a second.`, { "Retry-After": "1", "X-Servex-Starting": "1" });
        }
        if (page) return res.writeHead(502, { "Content-Type": "text/html" }).end(no_route_page(req.headers.host, this.dashboard ?? "/"));
        plain(502, `Servex could not reach ${name}: ${code}`);
    }

    /* Wait for the port (the shared knock), then send the request again. A
     * second refusal lands back in failed(), which knows the deadline from the first. */
    retry(req, res, port){
        this.answers(port).then(up => {
            if (res.headersSent || res.destroyed) return;
            if (up) this.proxy.web(req, res, { target: `http://127.0.0.1:${port}` });
            else this.failed(null, req, res);
        });
    }
}
