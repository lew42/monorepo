import Events from "../Server/Events.js";

/* THE LIVE WIRE — Servex pushes, the dashboard listens.
 *
 * Server-sent events, which is the whole of the mechanism: the browser opens
 * `new EventSource("/api/stream")`, the connection stays open, and every write
 * here arrives in that page within milliseconds. No polling loop, no handshake,
 * no library, and the browser reconnects on its own if Servex restarts.
 *
 * Why not a WebSocket. The dev server's socket (Server/plugins/SocketServer) is
 * a real two-way channel because it has to be — live reload, browser eval, a tab
 * registry. Nothing here ever travels browser → Servex: the dashboard's clicks
 * are ordinary POSTs to routes that already exist. One direction is all this
 * needs, and one direction is what SSE is.
 *
 * ⚠ Every write must survive a client that vanished mid-flight — a closed socket
 * throws on write — so `send` drops a dead one rather than taking Servex with it. */
export default class Stream extends Events {

    initialize(){
        this.clients = new Set();
        this.route();
    }

    route(){
        this.router.get("/api/stream", (req, res) => this.open(req, res));
    }

    open(req, res){
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        });
        res.write("retry: 1000\n\n");

        this.clients.add(res);
        req.on("close", () => this.clients.delete(res));
    }

    /* THE LOG GOES OUT TOO, not just the agents.
     *
     * Until now the only thing on this wire was an agent's own typed events, so
     * a page could watch a session think but could not watch the LOG it writes
     * into. The prompt lifecycle needs the log itself: the owner speaks, the
     * line lands, the assistant answers with three more lines, and all of it has
     * to reach an open board within a second of being written.
     *
     * `log` is a `Servex.Log` — its `append()` announces every line it actually
     * accepted — and `names` is the short list of logs a browser is allowed to
     * see. It is a list rather than "everything" on purpose: the agent logs are
     * already on this wire under `agent`, and re-broadcasting the raw transcript
     * of every session on the machine to every open tab is a lot of bytes for a
     * page that asked for none of it. */
    follow(log, names = ["prompts"]){
        log.on("append", (name, entry) => {
            if (names.includes(name)) this.send("log", { log: name, entry });
        });
        return this;
    }

    /* One named event to every open page. `type` is what the browser listens for
     * (`addEventListener("agent", …)`); `data` is JSON on one line, because a raw
     * newline inside an SSE payload ends the message early. */
    send(type, data){
        if (!this.clients.size) return 0;

        const frame = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
        for (const res of this.clients){
            try { res.write(frame); }
            catch { this.clients.delete(res); }
        }
        return this.clients.size;
    }
}
