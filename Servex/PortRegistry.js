import fs from "fs";
import Events from "../Server/Events.js";
import { place } from "./home.js";

/* WHO GETS WHICH PORT — remembered forever, so a project's URL, its cookies and
 * its localStorage survive a restart. `monorepo` is port 3100 today and port
 * 3100 next month.
 *
 * The map is a plain `{ name: port }` object and the reverse proxy holds a live
 * reference to that same object, so a project discovered later shows up in the
 * proxy with nothing to wire. */
export default class PortRegistry extends Events {

    initialize(){
        this.first ??= 3100;        // not 3000 — that is the most contested port on any dev machine
        this.reserved ??= [];
        this.path = place("ports.json");
        this.ports = this.load();
    }

    load(){
        try { return JSON.parse(fs.readFileSync(this.path, "utf8")); } catch { return {}; }
    }

    save(){
        fs.writeFileSync(this.path, JSON.stringify(this.ports, null, 2));
    }

    port(name){
        if (this.ports[name]) return this.ports[name];

        const used = new Set([...Object.values(this.ports), ...this.reserved]);
        let port = this.first;
        while (used.has(port)) port++;

        this.ports[name] = port;
        this.save();
        return port;
    }

    /* Nail a name to a port we did not choose — Servex's own dashboard, so
     * `servex.localhost:<proxy>` reaches it like any other project. */
    pin(name, port){
        this.ports[name] = port;
        this.save();
        return port;
    }
}
