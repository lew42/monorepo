import fs from "fs";
import path from "path";
import http from "http";
import net from "net";
import crypto from "crypto";
import { execFileSync } from "child_process";
import WorktreePreview from "./WorktreePreview.mjs";
import { fileURLToPath } from "url";

/* The site from anywhere: https://monorepo.lew42.com → this gateway (127.0.0.1:8192, via the named
 * Cloudflare tunnel) → the dev server, dialled at this PC's own LAN address (10.x:3104), never loopback.
 * The browser sees ONE origin: pages, the live-reload WebSocket, `/whisper/*` and `/servex/*` (Servex's API,
 * through the dev server's own ServexProxy) all ride it.
 *
 * Why the LAN address: the dev server then sees a LAN PEER, exactly like the owner's phone on Wi-Fi, so its own
 * guards still stand: loopback-only routes (/mcp, /screenshot, /devsource.json, /ai-logs, /recordings) refuse it,
 * and the socket gets push traffic plus `append` only (no rpc:cmd, no rpc:write; Socket.js, doc dev/Socket/doc/lan.md). On top of that, four checks here:
 *   1. The key. `?site_key=<remote.token>` once sets an HttpOnly cookie (an HMAC of the token, never the token);
 *      no cookie, no entry. Cloudflare Access replaces this once it is enabled (doc below).
 *   2. Origin. A write (any method but GET/HEAD) and every WebSocket must come from our own origin.
 *   3. DENY: the loopback-only dev routes (/mcp, /ai-logs, /screenshot, /recordings, /devsource.json,
 *      /Servex/, /Server/, /ask/turn, /push/send) never pass.
 *   4. /servex/* passes only the page routes in SERVEX (no /mcp, no merge, no project start/stop).
 * Every request is also marked `x-lew42-remote` (Socket.js drops such a socket to the LAN tier even from loopback).
 * Caching (2026-11-01, 2026-11-02): a phone kept an old Sheet.js and Recite.js for days, served from its HTTP cache with no request at all.
 * Three guards: every reply without a Cache-Control gets `no-cache`; a page load from a browser whose `lew42_cache_v` cookie is not the
 * deploy version() gets `Clear-Site-Data: "cache"` (only the HTTP cache: cookies, the site key and storage stay) plus the cookie, once per
 * browser per deploy; and every HTML page carries a small self-heal script (HEAL below) that asks /__version and, for a page that came out
 * of the browser's cache, refetches its own files and reloads once. localhost never passes here.
 * A live stream (SSE) gets a comment line after 20 s of silence (the socket gets a ping from Socket.js), so Cloudflare's ~100 s idle cut does not drop it.
 *
 *     node Server/SiteGateway.mjs       run it alone (Tunnel.mjs `up` also starts it in named mode)
 *
 * Doc: Servex/ext/remote/doc/tunnel.md ("The site from anywhere") */
export default class SiteGateway {
    static DIR = path.join(process.env.LOCALAPPDATA ?? "", "lew42", "servex");
    static PORT = 8192;
    static PUBLIC = "https://monorepo.lew42.com";
    static COOKIE = "lew42_site";
    static CACHE_COOKIE = "lew42_cache_v";
    static CACHE_V = "";   // manual salt on top of the deploy version: change it to clear every browser's HTTP cache once more
    static CODE = ["*.js", "*.mjs", "*.css", "*.html", "*.webmanifest"];   // a deploy is a commit that touches one of these (log sweeps and docs are not)
    static ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    static TTL = 30000;   // the deploy version is looked up at most this often, never per request
    static DENY = /^\/(mcp|ai-logs|screenshot|recordings|devsource\.json|servex|server|ask|push\/send)(?![\w-])/i;   // a prefix: /mcp, /mcp/x, /mcp;x all match
    static SERVEX = /^\/servex\/(api\/item|api\/page-ai|api\/page-session\/(new|resume)|api\/session\/[\w-]+(\/stream)?|api\/refine(\/live)?|api\/tidy|api\/voice(\/card|\/stream)?|api\/whisper(\/stream)?|api\/hitl|api\/local-chat|log\/prompts)$/;
    static SERVEX_GET = /^\/servex\/(api\/agents|api\/page-agents|api\/page-sessions|api\/sessions|api\/stream|api\/ready-to-merge|waiting)$/;

    constructor({ port = SiteGateway.PORT, target = null, key, version = null } = {}){
        this.fixed_v = version;   // a test pins the deploy version (a string, or a function)
        this.v_at = 0; this.v_last = null;
        this.port = port;
        this.fixed = !!target;
        this.target = target;   // { host, port, name }: name is the Host header the dev server sees; null = look it up (dest())
        this.key = key ?? fs.readFileSync(path.join(SiteGateway.DIR, "remote.token"), "utf8").trim();
        this.cookie = crypto.createHmac("sha256", this.key).update("site-cookie").digest("hex");
    }

    // the dev server at this PC's private LAN address (lan() and safe_host() accept it; loopback() does not)
    static target(){
        const ip = WorktreePreview.lan_ip();
        if (!ip) throw new Error("no private LAN address on this PC");
        const port = WorktreePreview.port("monorepo") ?? 3104;
        return { host: ip, port, name: `${ip}:${port}` };
    }
    // the target, looked up on first use and again after a failed connection (DHCP may have moved the PC)
    dest(){ return this.target ??= SiteGateway.target(); }
    lost(){ if (!this.fixed) this.target = null; }

    // the login cookie, 30 days from now: sent on sign-in and again on every page visit, so the owner signs in once
    set_cookie(){ return `${SiteGateway.COOKIE}=${this.cookie}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`; }

    // the deploy version: the short hash of the last commit that touched code in the served checkout, plus the manual CACHE_V salt
    version(){
        if (this.fixed_v) return typeof this.fixed_v === "function" ? this.fixed_v() : this.fixed_v;
        const now = Date.now(), salt = SiteGateway.CACHE_V ? "." + SiteGateway.CACHE_V : "";
        if (this.v_last === null || now - this.v_at > SiteGateway.TTL){
            this.v_at = now;
            try {
                const h = execFileSync("git", ["log", "-1", "--format=%h", "--", ...SiteGateway.CODE], { cwd: SiteGateway.ROOT, encoding: "utf8", timeout: 5000, windowsHide: true }).trim();
                if (h) this.v_last = h + salt;
            } catch (e){ if (process.env.GW_DEBUG) console.error(e); }
            this.v_last ??= "0" + salt;   // git unavailable: a constant, so each browser is still cleared once
        }
        return this.v_last;
    }

    // a page load (not a module, an image or a fetch)
    is_document(req){
        if (req.method !== "GET") return false;
        const dest = req.headers["sec-fetch-dest"];
        return dest ? dest === "document" : /text\/html/i.test(String(req.headers.accept));
    }
    // a browser whose HTTP cache was not cleared at the current deploy version yet
    cache_old(req){
        const m = new RegExp(`(?:^|;\\s*)${SiteGateway.CACHE_COOKIE}=([^;]*)`).exec(req.headers.cookie ?? "");
        return m?.[1] !== this.version();
    }
    clear_headers(h){
        h["clear-site-data"] = '"cache"';
        h["set-cookie"] = [].concat(h["set-cookie"] ?? [], `${SiteGateway.CACHE_COOKIE}=${this.version()}; Path=/; Max-Age=31536000; Secure; SameSite=Lax`);
    }

    // The self-heal, injected at the top of every HTML page. A page is always sent whole (no 304), so V is the version it was served with.
    // A page that came out of the browser's cache (a restored phone tab) still runs its old V: it asks /__version, and on a difference it
    // replaces its own cached js/css with cache:"reload" fetches and reloads once (the sessionStorage guard keeps it from ever looping).
    // After the reload it writes one line to the Whisper log, so the phone's own log proves it.
    static HEAL = `<script>(()=>{const V="@V@",T="lew42_heal_tried",K="lew42_healed";
try{const n=JSON.parse(sessionStorage.getItem(K));if(n){sessionStorage.removeItem(K);addEventListener("load",()=>import("/framework/audio/Whisper/WhisperLog.js").then(m=>m.default.event("recite","stale code healed",n)).catch(()=>{}))}}catch{}
const check=async()=>{try{const n=(await(await fetch("/__version",{cache:"no-store"})).json()).v;if(n===V||sessionStorage.getItem(T)===n)return;sessionStorage.setItem(T,n);
const u=[...new Set(performance.getEntriesByType("resource").map(e=>e.name).filter(x=>{const l=new URL(x);return l.origin===location.origin&&/\\.(m?js|css)$/.test(l.pathname)}))];
await Promise.all(u.map(x=>fetch(x,{cache:"reload"}).catch(()=>{})));sessionStorage.setItem(K,JSON.stringify({from:V,to:n}));location.reload()}catch{}};
addEventListener("load",check);addEventListener("pageshow",e=>e.persisted&&check());document.addEventListener("visibilitychange",()=>document.visibilityState==="visible"&&check());
})()</script>`;
    inject(html){
        const tag = SiteGateway.HEAL.replace("@V@", this.version());
        return /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, m => m + tag) : tag + html;
    }

    // ── the four checks ────────────────────────────────────────────────────
    has_cookie(req){
        const m = new RegExp(`(?:^|;\\s*)${SiteGateway.COOKIE}=([0-9a-f]{64})`).exec(req.headers.cookie ?? "");
        return !!m && crypto.timingSafeEqual(Buffer.from(m[1]), Buffer.from(this.cookie));
    }
    key_ok(given){
        const a = Buffer.from(String(given ?? "")), b = Buffer.from(this.key);
        return a.length === b.length && crypto.timingSafeEqual(a, b);
    }
    // the decoded path, or null when it tries to climb or smuggle (.., backslash, NUL, bad escapes)
    clean(p){
        let d; try { d = decodeURIComponent(p); } catch { return null; }
        if (/\\|\0|(^|\/)\.\.(\/|$)/.test(d) || /%2f|%5c/i.test(p)) return null;
        return d.replace(/\/{2,}/g, "/");
    }
    // why this request is refused, or null to let it through (auth is checked before this)
    refuse(method, p, origin, upgrade = false){
        if ((upgrade || !/^(GET|HEAD)$/.test(method)) && origin !== SiteGateway.PUBLIC) return "origin";
        if (p.startsWith("/servex/")){
            if (SiteGateway.SERVEX.test(p)) return null;
            if (SiteGateway.SERVEX_GET.test(p) && /^(GET|HEAD)$/.test(method)) return null;
            return "servex route not on the list";
        }
        if (SiteGateway.DENY.test(p)) return "loopback-only route";
        return null;
    }

    // the headers the dev server sees: our Host, the remote marker, a local Origin, no gateway cookie
    headers(req){
        const h = { ...req.headers };
        for (const k of ["host", "x-forwarded-host", "x-lew42-remote", "cf-connecting-ip", "cf-ipcountry", "cf-ray", "cf-visitor", "cdn-loop", "cf-warp-tag-id"]) delete h[k];
        h.host = this.target.name;
        h["x-lew42-remote"] = "1";
        h["x-forwarded-proto"] = "https";
        if (h.origin) h.origin = "http://" + this.target.name;
        if (h.referer) h.referer = h.referer.replace(SiteGateway.PUBLIC, "http://" + this.target.name);
        const rest = (h.cookie ?? "").split(/;\s*/).filter(c => c && !c.startsWith(SiteGateway.COOKIE + "=") && !c.startsWith(SiteGateway.CACHE_COOKIE + "="));
        if (rest.length) h.cookie = rest.join("; "); else delete h.cookie;
        return h;
    }

    // ── http ───────────────────────────────────────────────────────────────
    request(req, res){
        const url = new URL(req.url, SiteGateway.PUBLIC);
        const p = this.clean(url.pathname);
        if (p === null) return res.writeHead(400).end();
        if (url.searchParams.has("site_key")){
            if (!this.key_ok(url.searchParams.get("site_key"))) return this.locked(res);
            url.searchParams.delete("site_key");
            return res.writeHead(302, {
                "set-cookie": this.set_cookie(),
                location: url.pathname + url.search, "cache-control": "no-store" }).end();
        }
        if (!this.has_cookie(req)) return this.locked(res);
        const why = this.refuse(req.method, p, req.headers.origin);
        if (why) return res.writeHead(403, { "content-type": "text/plain" }).end("refused: " + why);
        if (p === "/__version"){
            const h = { "content-type": "application/json", "cache-control": "no-store" };
            if (this.cache_old(req)) this.clear_headers(h);   // a page served from the browser's cache: clear it here too, then it reloads
            return res.writeHead(200, h).end(JSON.stringify({ v: this.version() }));
        }
        let to; try { to = this.dest(); } catch (e) { return res.writeHead(502, { "content-type": "text/plain" }).end("site unreachable: " + e.message); }
        const doc = this.is_document(req), stale = doc && this.cache_old(req), ask = this.headers(req);
        if (doc){ delete ask["if-none-match"]; delete ask["if-modified-since"]; delete ask["accept-encoding"]; }   // a page is always sent whole and plain: a 304 would skip the clear and keep a stale version, and the heal script is added to the text
        const up = http.request({ host: to.host, port: to.port, method: req.method, path: req.url, headers: ask }, r => {
            const h = { ...r.headers };
            if (h.location) h.location = String(h.location).replace("http://" + this.target.name, SiteGateway.PUBLIC);
            h["set-cookie"] = [].concat(h["set-cookie"] ?? [], this.set_cookie());   // each visit with a valid cookie renews its 30 days
            h["cache-control"] ??= "no-cache";   // never left to a heuristic cache: the browser always asks (a 304 is cheap)
            const html = doc && r.statusCode === 200 && /text\/html/i.test(String(r.headers["content-type"])) && !h["content-encoding"];
            if (html && stale) this.clear_headers(h);   // once per browser per deploy: drop its HTTP cache before this page loads its modules
            if (html){
                const parts = [];
                r.on("data", c => parts.push(c));
                r.on("end", () => {
                    const body = Buffer.from(this.inject(Buffer.concat(parts).toString("utf8")));
                    delete h.etag; delete h["last-modified"]; delete h["transfer-encoding"]; h["content-length"] = body.length;
                    res.writeHead(200, h).end(body);
                });
                r.on("error", () => res.destroy());
                return;
            }
            res.writeHead(r.statusCode, h);
            // A live stream (SSE) that goes quiet is cut by Cloudflare after about 100 s; a comment line every 20 s of silence keeps it open.
            // EventSource ignores comment lines. Only sent when the upstream has been silent, so it never lands inside an event.
            if (/text\/event-stream/i.test(String(r.headers["content-type"]))){
                let last = Date.now();
                r.on("data", () => { last = Date.now(); });
                const beat = setInterval(() => { if (Date.now() - last >= 20000) { res.write(": keep-alive\n\n"); last = Date.now(); } }, 10000);
                res.on("close", () => clearInterval(beat));
            }
            r.pipe(res);
            r.on("error", () => res.destroy());
        });
        up.on("error", e => { this.lost(); if (process.env.GW_DEBUG) console.error(e); if (!res.headersSent) res.writeHead(502, { "content-type": "text/plain" }); res.end("site unreachable"); });
        res.on("close", () => { if (!res.writableFinished) up.destroy(); });   // the browser left mid-reply (an SSE tab closed): stop the upstream
        req.pipe(up);
    }

    locked(res){
        res.writeHead(401, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" })
            .end(`<!doctype html><meta name="viewport" content="width=device-width"><title>Locked</title>
<body style="font:18px system-ui;padding:2em;background:#111;color:#ccc">
<h1>Locked</h1><p>Open the site with its key link once (it is in <code>%LOCALAPPDATA%\\lew42\\servex\\site.url</code> on the PC); this browser then stays signed in for 30 days.</p></body>`);
    }

    // ── websocket ──────────────────────────────────────────────────────────
    upgrade(req, socket, head){
        const deny = code => { socket.end(`HTTP/1.1 ${code}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`); };
        socket.on("error", () => socket.destroy());
        const url = new URL(req.url, SiteGateway.PUBLIC);
        const p = this.clean(url.pathname);
        if (p === null) return deny("400 Bad Request");
        if (!this.has_cookie(req)) return deny("401 Unauthorized");
        if (this.refuse(req.method, p, req.headers.origin, true)) return deny("403 Forbidden");
        let to; try { to = this.dest(); } catch { return deny("502 Bad Gateway"); }
        socket.setKeepAlive(true, 20000);
        const up = net.connect(to.port, to.host, () => {
            up.setKeepAlive(true, 20000);
            const h = this.headers(req);
            up.write(`${req.method} ${req.url} HTTP/1.1\r\n` + Object.entries(h).map(([k, v]) => `${k}: ${v}`).join("\r\n") + "\r\n\r\n");
            if (head?.length) up.write(head);
            up.pipe(socket); socket.pipe(up);
        });
        up.on("error", () => { this.lost(); socket.destroy(); });
        socket.on("close", () => up.destroy());
    }

    server(){
        const s = http.createServer((req, res) => this.request(req, res));
        s.on("upgrade", (req, socket, head) => this.upgrade(req, socket, head));
        return s;
    }

    // listens on loopback only; resolves with the server, or null when the port is already taken
    listen(){
        const s = this.server();
        return new Promise(resolve => {
            s.once("error", e => { console.error("site gateway: " + e.message); resolve(null); });
            s.listen(this.port, "127.0.0.1", () => {
                fs.writeFileSync(path.join(SiteGateway.DIR, "site.url"), `${SiteGateway.PUBLIC}/?site_key=${this.key}`);
                console.log(`site gateway on 127.0.0.1:${this.port} for ${SiteGateway.PUBLIC} (key link in site.url)`);
                resolve(s);
            });
        });
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await new SiteGateway().listen() ?? process.exit(1);
