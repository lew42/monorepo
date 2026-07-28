import Events from "../../Events.js";

// Socket gets created by SocketServer

export default class Socket extends Events {

	/**
	 * ws, req, server, socket_server get passed from SocketServer
	 */

    initialize() {
		console.log("New socket initialized");
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
            this.emit("message", message);
			console.log("Socket message", message);

            if (message.method) {
				console.log(`RPC: ${message.method}`);
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
