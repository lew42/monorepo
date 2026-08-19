import { randomUUID } from "crypto";
import stamp from "../../stamp.js";

const json = v => JSON.stringify(String(v));

/* One connected browser tab, as something a Node process can address: its `id`, which
 * page it says it is on, and an expression channel into it. The consumers are `MCP.js`
 * (the tools `pages` / `eval` / `claim`) and `Ask.js` (which binds a turn to the tab
 * that asked). Protocol: public/framework/dev/Socket/doc/wire.md.
 *
 * ⚠ The wire has no request id in this direction, so `eval` carries its own
 * `token` and the browser echoes it back on `eval_result`. */
export default class Tab {

    static setup(socket){ new Tab(socket); }

    constructor(socket){
        this.socket = socket;
        this.since = stamp();
        this.pending = new Map();
        socket.tab = this;
        // ⚠ The id sticks: the SPA's `navigated()` hello (app.js) carries only a url, and
        //   dropping the id there would make the tab unaddressable after one click.
        socket.on("rpc:hello", ([page, id]) => { this.page = page; if (id) this.id = id; });
        socket.on("rpc:eval_result", ([token, result]) => this.settle(token, result));
        socket.on("closed", () => [...this.pending.keys()].forEach(token => this.settle(token, { error: "the tab closed" })));
    }

    /* The claim is the TAB's, so `pages` can report who is driving without asking the
     * browser — both callers (MCP's tools, and Ask around a turn) come through here.
     * `dev/Claim` paints the ring; this is the record. */
    claim(who = "claude", note = ""){
        this.claimed = { who, note, at: stamp() };
        return this.eval(`import("/framework/dev/Claim/claim.js").then(m => m.claim(${json(who)}, ${json(note)}))`);
    }

    release(){
        this.claimed = null;
        return this.eval(`import("/framework/dev/Claim/claim.js").then(m => m.release())`);
    }

    eval(code){
        const token = randomUUID();
        return new Promise(resolve => {
            this.pending.set(token, resolve);
            setTimeout(() => this.settle(token, { error: "the tab did not answer in 10s" }), 10000).unref();
            this.socket.rpc("eval", code, token);
        });
    }

    settle(token, result){
        const resolve = this.pending.get(token);
        if (!resolve) return;
        this.pending.delete(token);
        resolve(result ?? {});
    }
}
