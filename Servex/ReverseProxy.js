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

/* ONE PORT, EVERY PROJECT — `monorepo.localhost:8080` reaches whatever port
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
 * ⚠ The port is a field, default 8080. Port 80 is the owner's own dev server.
 * The day Servex takes over from it, that is `new Servex({ proxy_port: 80 })`. */
export default class ReverseProxy extends Events {

    initialize(){
        this.port ??= 8080;
        this.host ??= "127.0.0.1";
        this.ports ??= {};

        this.proxy = http_proxy.createProxyServer({});
        this.proxy.on("error", (err, req, res) => this.failed(err, req, res));

        this.server = http.createServer((req, res) => this.handle(req, res));
        this.server.on("upgrade", (req, socket, head) => this.upgrade(req, socket, head));
        this.server.listen(this.port, this.host, () => this.emit("listening", this.port));
    }

    name(req){
        return (req.headers?.host || "").split(":")[0].replace(/\.localhost$/, "");
    }

    target(req){
        const port = this.ports[this.name(req)];
        return port ? `http://127.0.0.1:${port}` : null;
    }

    handle(req, res){
        const target = this.target(req);
        if (!target) return res.writeHead(404, { "Content-Type": "text/html" })
            .end(no_route_page(req.headers.host, this.dashboard ?? "/"));
        this.proxy.web(req, res, { target });
    }

    upgrade(req, socket, head){
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
