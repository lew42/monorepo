import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

/* node Server/TunnelNamed.mjs setup — one-time (safe to re-run): makes the named tunnel "servex", its ingress
 * (one line per HOSTS entry) and a proxied DNS CNAME per host, and stores the run token at
 * %LOCALAPPDATA%\lew42\servex\remote.tunnel.token. Never prints a secret.
 * The running cloudflared picks up a changed ingress by itself (config_src "cloudflare"); no restart.
 * Doc: Servex/ext/remote/doc/tunnel.md */
export default class TunnelNamed {
    static DIR = path.join(process.env.LOCALAPPDATA ?? "", "lew42", "servex");
    static NAME = "servex";
    static HOST = "servex.lew42.com";
    static ZONE = "lew42.com";
    static PORT = 8191;        // the MCP gateway's fixed port in named mode (Tunnel.gateway)
    // every public host and the local gateway it reaches; nothing here points at a dev server directly
    static HOSTS = [
        { hostname: "servex.lew42.com", port: 8191 },     // Tunnel.gateway(): /mcp/remote/<token> only
        { hostname: "monorepo.lew42.com", port: 8192 },   // SiteGateway.mjs: the site, behind the key cookie
    ];

    constructor(){
        const env = Object.fromEntries(fs.readFileSync(path.join(TunnelNamed.DIR, "cloudflare.env"), "utf8").split(/\r?\n/)
            .map(l => l.match(/^\s*([A-Z_]+)\s*=\s*"?([^"]*?)"?\s*$/)).filter(Boolean).map(m => [m[1], m[2]]));
        this.account = env.CLOUDFLARE_ACCOUNT_ID;
        this.auth = { authorization: "Bearer " + env.CLOUDFLARE_API_TOKEN, "content-type": "application/json" };
    }

    async api(method, url, body){
        const r = await fetch("https://api.cloudflare.com/client/v4" + url, { method, headers: this.auth, body: body && JSON.stringify(body) });
        const j = await r.json();
        if (!j.success) throw new Error(`${method} ${url}: ${JSON.stringify(j.errors)}`);
        return j.result;
    }

    async setup(){
        const acct = `/accounts/${this.account}/cfd_tunnel`;
        let t = (await this.api("GET", `${acct}?name=${TunnelNamed.NAME}&is_deleted=false`))[0];
        if (!t) t = await this.api("POST", acct, { name: TunnelNamed.NAME, config_src: "cloudflare", tunnel_secret: crypto.randomBytes(32).toString("base64") });
        console.log("tunnel", t.id);
        await this.api("PUT", `${acct}/${t.id}/configurations`, { config: { ingress: [
            ...TunnelNamed.HOSTS.map(h => ({ hostname: h.hostname, service: `http://127.0.0.1:${h.port}` })), { service: "http_status:404" }] } });
        const zone = (await this.api("GET", `/zones?name=${TunnelNamed.ZONE}`))[0].id;
        const content = `${t.id}.cfargotunnel.com`;
        for (const { hostname } of TunnelNamed.HOSTS){
            const have = (await this.api("GET", `/zones/${zone}/dns_records?name=${hostname}`))[0];
            const rec = { type: "CNAME", name: hostname.replace("." + TunnelNamed.ZONE, ""), content, proxied: true };
            if (!have) await this.api("POST", `/zones/${zone}/dns_records`, rec);
            else if (have.content !== content) await this.api("PUT", `/zones/${zone}/dns_records/${have.id}`, rec);
            console.log("dns ok", hostname);
        }
        const token = await this.api("GET", `${acct}/${t.id}/token`);
        fs.writeFileSync(path.join(TunnelNamed.DIR, "remote.tunnel.token"), token);
        console.log("run token stored");
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv[2] === "setup") await new TunnelNamed().setup();
