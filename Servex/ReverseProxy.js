import http from "http";
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
        this.proxy.web(req, res, { target });
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
        this.proxy.ws(req, socket, head, { target });
    }

    /* The target port did not answer — almost always because the project is not
     * running. `missing` is Servex's auto-start; if it says it is starting one,
     * the visitor gets the polling page instead of an error. */
    failed(err, req, res){
        if (!res?.writeHead) return;
        const name = this.name(req);

        if (this.missing?.(name)){
            return res.writeHead(200, { "Content-Type": "text/html", "X-Servex-Starting": "1" }).end(starting_page(name));
        }
        res.writeHead(502, { "Content-Type": "text/html" }).end(no_route_page(req.headers.host, this.dashboard ?? "/"));
    }
}
