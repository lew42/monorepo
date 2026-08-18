import Events from "../../Events.js";
import { WebSocketServer } from "ws";
import Socket from "./Socket.js";
import { loopback } from "../MCP.js";

/* Two checks, two different attackers. This wire carries `rpc:cmd` (exec),
 * `rpc:write` and `rpc:ask` (a Claude turn), so both have to stand.
 *
 * ⚠ Origin alone is worth nothing off-host: only a browser is obliged to send
 * one, and any other client omits it or forges `http://localhost`. The peer
 * address is the one field the caller cannot choose.
 * ⚠ Loopback alone is worth nothing in-browser: a WebSocket upgrade is NOT
 * subject to the same-origin policy, so any site visited in a local tab can
 * open ws://localhost FROM loopback. Origin is what refuses that one. */
const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

function local_only({ origin, req }){
    const from = req.socket.remoteAddress;
    if (!loopback(from)){
        console.warn(`socket: REFUSED an upgrade from ${from} — loopback only.`);
        return false;
    }
    if (origin && !LOCAL.test(origin)){
        console.warn(`socket: REFUSED an upgrade from origin ${origin}.`);
        return false;
    }
    return true;
}

export default class SocketServer extends Events {

    static setup(server) {
        server.on("http", () => {
            server.socket_server = new this({ server });
        });
    }

    initialize() {
		console.log(this.constructor.name + " initialized");
        this.sockets = [];

        this.wss = new WebSocketServer({
            server: this.server.http,
            perMessageDeflate: false,
            verifyClient: local_only
        });

        this.wss.on("connection", (ws, req) => {
            this.sockets.push(
				new SocketServer.Socket({ 
					ws,
					req,

					// socket.server === main Server instance
					server: this.server,

					// socket.socket_server === SocketServer instance
					socket_server: this
				})
			);
        });
    }
}

SocketServer.Socket = Socket;