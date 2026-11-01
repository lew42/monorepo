import Events from "../../Events.js";
import { loopback } from "../MCP.js";

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
        this.local = loopback(this.req?.socket?.remoteAddress) && !this.req?.headers?.["x-lew42-remote"];
        this.ws.on("message", this.message.bind(this));
        this.ws.on("close", this.close.bind(this));

        // "error" is the one ws event that THROWS when unobserved — an abrupt
        // client disconnect would otherwise take the whole dev server down.
        // "close" still fires after it, so cleanup is unaffected.
        this.ws.on("error", err => console.error("Socket error:", err.message));
    }

    message(data) {
        try {
            const message = JSON.parse(data.toString());
            if (!this.local && !(LAN_OK.has(message.method) && (message.method !== "query" || LAN_QUERY.has(message.args?.[0]?.source)))){
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
        this.socket_server.sockets = this.socket_server.sockets.filter(socket => socket !== this);
        this.emit("closed");
    }
}
