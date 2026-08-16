import { randomUUID } from "crypto";
import stamp from "../../stamp.js";

/* One connected browser tab, as something a Node process can address: which page
 * it says it is on, and an expression channel into it. `MCP.js` is the consumer —
 * the tools `pages` and `eval`. Protocol: public/framework/dev/Socket/doc/wire.md.
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
        socket.on("rpc:hello", ([page]) => this.page = page);
        socket.on("rpc:eval_result", ([token, result]) => this.settle(token, result));
        socket.on("closed", () => [...this.pending.keys()].forEach(token => this.settle(token, { error: "the tab closed" })));
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
