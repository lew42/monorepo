import Events from "../../Events.js";
import os from "node:os";
import { loopback } from "../MCP.js";

// What the internet may send through Server/SiteGateway.mjs on top of the LAN list: `append` and `ping` (one JSONL line, only under public/ and
// only a .jsonl, schema-checked in Append.js) so page edits and dictation work from anywhere. Never write, rm, move, cmd or ask.
const SITE_OK = new Set(["append", "ping"]);   // ping: the Outbox heartbeat that restarts a dead socket (core/Item/Outbox.js)

// This PC's own addresses. A peer that is one of them is a process on this machine (the gateway dials the PC's LAN address),
// so a phone on the Wi-Fi, which has its own address, can never pass as the gateway by sending the header itself.
function own(address){
    const a = String(address ?? "").replace(/%.*$/, "").replace(/^::ffff:/, "");
    return loopback(a) || Object.values(os.networkInterfaces()).flat().some(i => i.address === a);
}

// THE one list of what a non-loopback (LAN) peer may send: hello, jsonl tails, and read-only queries.
// `query` answers from an in-memory index of files under public/ and never runs or writes anything, but only
// for the sources named in LAN_QUERY (a new source is not exposed until it is added here). Doc: dev/Socket/doc/lan.md
const LAN_OK = new Set(["hello", "subscribe", "unsubscribe", "query"]);
const LAN_QUERY = new Set(["sessions", "tasks", "inflight"]);

// Socket gets created by SocketServer

export default class Socket extends Events {

	/**
	 * ws, req, server, socket_server get passed from SocketServer
	 */

    initialize() {
		console.log("New socket initialized");
        // false = LAN peer: push traffic only. `x-lew42-remote` = a browser on the internet, relayed from loopback by
        // Server/SiteGateway.mjs: it gets the LAN tier too (a header can only lower the tier, never raise it).
        const remote = !!this.req?.headers?.["x-lew42-remote"];
        this.local = loopback(this.req?.socket?.remoteAddress) && !remote;
        // the site tier: relayed by the gateway on this PC (the header is only believed from this PC's own address)
        this.site = remote && own(this.req?.socket?.remoteAddress);
        this.ws.on("message", this.message.bind(this));
        this.ws.on("close", this.close.bind(this));
        // A protocol ping every 25 s: Cloudflare drops a WebSocket that is silent for about 100 s, which showed the "server restarting" strip.
        // The browser answers with a pong on its own. unref(): the timer never keeps the dev server alive.
        this.ping = setInterval(() => { if (this.ws.readyState === this.ws.OPEN) try { this.ws.ping(); } catch {} }, 25000);
        this.ping.unref?.();

        // "error" is the one ws event that THROWS when unobserved — an abrupt
        // client disconnect would otherwise take the whole dev server down.
        // "close" still fires after it, so cleanup is unaffected.
        this.ws.on("error", err => console.error("Socket error:", err.message));
    }

    message(data) {
        try {
            const message = JSON.parse(data.toString());
            const lan = LAN_OK.has(message.method) && (message.method !== "query" || LAN_QUERY.has(message.args?.[0]?.source));
            if (!this.local && !lan && !(this.site && SITE_OK.has(message.method))){
                console.warn(`socket: REFUSED ${message.method ?? "message"} from LAN peer ${this.req?.socket?.remoteAddress}`);
                if (message.index !== undefined) this.send({ method: "refused", args: [message.method], index: message.index });
                return;
            }
            if (process.env.SOCKET_LOG === "on") console.log("Socket message", message);   // off by default: it grew monorepo.out to 36 MB
            this.emit("message", message);

            if (message.method) {
				if (process.env.SOCKET_LOG === "on") console.log(`RPC: ${message.method}`);
                this.emit(`rpc:${message.method}`, message.args, message.index);
            }
        } catch (e) {
            console.error("Failed to parse socket message", e);
        }
    }

    send(obj) {
        // A peer can vanish between "close" firing and a queued send landing.
        // LiveReload.changed() fans out over every socket, so one dead peer
        // throwing here used to skip the reload for everyone after it.
        if (this.ws.readyState !== this.ws.OPEN) return;
        this.ws.send(JSON.stringify(obj));
    }

    rpc(method, ...args) {
        this.send({ method, args });
    }

    close() {
        clearInterval(this.ping);
        this.socket_server.sockets = this.socket_server.sockets.filter(socket => socket !== this);
        this.emit("closed");
    }
}
