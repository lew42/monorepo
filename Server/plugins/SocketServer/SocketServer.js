import Events from "../../Events.js";
import { WebSocketServer } from "ws";
import Socket from "./Socket.js";

/* ⚠ A WebSocket upgrade is NOT subject to the same-origin policy: without this
 * check, any page in any tab can open ws://localhost and speak this protocol —
 * which includes `rpc:cmd` (exec), `rpc:write` and `rpc:ask` (a Claude turn).
 * Any site visited while the dev server runs could therefore run commands on
 * this machine. A browser always sends Origin; a CLI tool sends none, and a
 * local process already has everything this would protect. */
const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

function local_only({ origin }){
    if (!origin) return true;
    if (LOCAL.test(origin)) return true;
    console.warn(`socket: refused a connection from ${origin}`);
    return false;
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