import fs from "fs";
import path from "path";
import http from "http";
import { spawn, execFileSync } from "child_process";
import { fileURLToPath } from "url";

/* node Server/Tunnel.mjs up|down|status — a free Cloudflare quick tunnel to Servex's /mcp/remote ONLY.
 * cloudflared forwards every path of its origin, so it points at a tiny gateway (below) that passes
 * the one path and 404s the rest. Doc: public/framework/ux/Dictate/doc/voice-bridge.md. */
export default class Tunnel {
    static DIR = path.join(process.env.LOCALAPPDATA ?? "", "lew42", "servex");
    static PATH = "/mcp/remote";

    constructor({ servex_port = Number(process.env.SERVEX_PORT) || 8090 } = {}){
        this.servex_port = servex_port;
        this.state_file = path.join(Tunnel.DIR, "remote.tunnel.json");
        this.url_file = path.join(Tunnel.DIR, "remote.url");
    }

    state(){ try { return JSON.parse(fs.readFileSync(this.state_file, "utf8")); } catch { return null; } }
    alive(pid){ try { process.kill(pid, 0); return true; } catch { return false; } }

    // passes exactly /mcp/remote to Servex on loopback; every other path is a 404 that never reaches Servex
    gateway(){
        return http.createServer((req, res) => {
            const p = new URL(req.url, "http://x").pathname;
            if (p !== Tunnel.PATH && !/^\/mcp\/remote\/[A-Za-z0-9]+$/.test(p)) return res.writeHead(404).end();
            const up = http.request({ host: "127.0.0.1", port: this.servex_port, path: p, method: req.method,
                headers: { authorization: req.headers.authorization ?? "", "content-type": req.headers["content-type"] ?? "" } },
                r => { res.writeHead(r.statusCode, { "content-type": r.headers["content-type"] ?? "application/json", ...(r.headers["mcp-session-id"] ? { "mcp-session-id": r.headers["mcp-session-id"] } : {}) }); r.pipe(res); });
            up.on("error", () => res.writeHead(502).end());
            req.pipe(up);
        });
    }

    async up(){
        const s = this.state();
        if (s && this.alive(s.pid)) return console.log("already up (URL in remote.url)");
        fs.mkdirSync(Tunnel.DIR, { recursive: true });
        const gw = this.gateway();
        await new Promise(r => gw.listen(0, "127.0.0.1", r));
        const port = gw.address().port;
        const child = spawn("npx", ["--yes", "cloudflared", "tunnel", "--url", `http://127.0.0.1:${port}`], { shell: true, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
        const url = await new Promise((resolve, reject) => {
            const t = setTimeout(() => reject(new Error("no tunnel URL after 90 s")), 90000);
            const scan = b => { const m = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/.exec(String(b)); if (m){ clearTimeout(t); resolve(m[0]); } };
            child.stdout.on("data", scan); child.stderr.on("data", scan);
            child.on("exit", c => reject(new Error(`cloudflared exited ${c}`)));
        }).catch(e => { this.kill(child.pid); console.error(e.message); process.exit(1); });
        const token = fs.readFileSync(path.join(Tunnel.DIR, "remote.token"), "utf8").trim();   // the URL carries the token: the connector dialog has no header field
        const full = url + Tunnel.PATH + "/" + token;
        fs.writeFileSync(this.url_file, full);
        fs.writeFileSync(this.state_file, JSON.stringify({ pid: process.pid, child: child.pid, port, at: new Date().toISOString() }));
        console.log(full.replace(token, "<token: see remote.url>"));
        const stop = () => { this.kill(child.pid); try { fs.unlinkSync(this.state_file); } catch {} process.exit(0); };
        process.on("SIGINT", stop); process.on("SIGTERM", stop);
        child.on("exit", stop);
    }

    host(){ try { return new URL(fs.readFileSync(this.url_file, "utf8").trim()).host; } catch { return null; } }
    alive_now(){ const s = this.state(); return !!(s && this.alive(s.pid)); }

    /* The keeper's one step (Servex calls it at boot and every 60 s). A live pid is adopted, never touched;
     * otherwise `up` is started detached so it outlives a Servex restart. Doc: Servex/ext/remote/doc/tunnel.md */
    ensure(){
        if (this.alive_now()) return { act: "up", host: this.host() };
        const had = this.state();
        if (had) try { fs.unlinkSync(this.state_file); } catch {}
        const child = spawn(process.execPath, [fileURLToPath(import.meta.url), "up"], { detached: true, windowsHide: true, stdio: "ignore" });
        child.unref();
        return { act: had ? "restarted" : "started", pid: child.pid };
    }

    kill(pid){ try { execFileSync("taskkill", ["/pid", String(pid), "/t", "/f"], { windowsHide: true, stdio: "ignore" }); } catch {} }

    down(){
        const s = this.state();
        if (!s) return console.log("not running");
        this.kill(s.child); this.kill(s.pid);
        try { fs.unlinkSync(this.state_file); fs.unlinkSync(this.url_file); } catch {}
        console.log("down");
    }

    status(){
        const s = this.state();
        console.log(s && this.alive(s.pid) ? "up (URL in remote.url)" : "down");
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)){
    const verb = process.argv[2];
    if (!["up", "down", "status"].includes(verb)){ console.log("usage: node Server/Tunnel.mjs up|down|status"); process.exit(1); }
    await new Tunnel()[verb]();
}
