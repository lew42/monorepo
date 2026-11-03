import fs from "node:fs";
import path from "node:path";
import Tunnel from "../../../Server/Tunnel.mjs";

/* Keeps the Cloudflare quick tunnel up: at boot, then every 60 s. One `tunnel` event per start or death
 * (host only, never the token); a Note card only when the host differs from the last one. Doc: doc/tunnel.md */
export default class TunnelKeeper {
    constructor({ say, cards, tunnel = new Tunnel(), every = 60000 } = {}){
        Object.assign(this, { say, cards, tunnel, every });
        this.host_file = path.join(Tunnel.DIR, "remote.lasthost");
        this.was_up = null;
    }

    start(){ this.tick(); this.timer = setInterval(() => this.tick(), this.every); this.timer.unref?.(); return this; }
    stop(){ clearInterval(this.timer); }

    tick(){
        try {
            const up = this.tunnel.alive_now();
            if (!up){
                if (this.was_up !== false) this.say?.("tunnel not running, starting it", { event: "tunnel-down" });
                this.tunnel.ensure();
                this.was_up = false;
                this.waiting = setTimeout(() => this.announce(), 20000);
                this.waiting.unref?.();
                return;
            }
            this.was_up = true;
            this.announce();
        } catch (e) { this.say?.(`tunnel keeper error: ${e.message}`, { event: "tunnel-error" }); }
    }

    // once the tunnel has written its url: log it, and card it when the host changed
    async announce(){
        const host = this.tunnel.host();
        if (!host) return;
        let last = null; try { last = fs.readFileSync(this.host_file, "utf8").trim(); } catch {}
        if (last === host) return;
        fs.writeFileSync(this.host_file, host + "\n");
        fs.writeFileSync(path.join(Tunnel.DIR, "remote.changed"), new Date().toISOString());
        this.say?.(`tunnel up at ${host}`, { event: "tunnel-up", type: "tunnel-up", host });
        try { await this.cards?.create({ parent: "today", title: `Servex connector URL changed: paste the new one into the claude.ai connector (host ${host})`, type: "note", by: "servex", tags: ["tunnel"] }); } catch {}
    }
}
