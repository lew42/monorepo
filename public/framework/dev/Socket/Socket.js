function promise(){
	let resolve, reject;
	const promise = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});
	promise.resolve = resolve;
	promise.reject = reject;
	return promise;
}

export default class Socket {
	static singleton() {
		if (!this._instance) {
			this._instance = new this();
		}
		return this._instance;
	}

	constructor(...args){
        this.assign(...args);
        this.initialize();
    }

    assign(...args){
        return Object.assign(this, ...args);
    }

	initialize() {
		this.protocol = window.location.protocol === "https:" ? "wss" : "ws";
		this.requests = [];
		this.fails = 0;
		this.connected = false;
		this.retry = null;
		this.ready = promise();

		// Only a local dev server speaks this protocol. On a static host
		// (production deploy) there's nothing to connect to, so don't even
		// try — just stay disabled and let send()/request() no-op.
		if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.endsWith(".localhost")) {
			this.connect();
		} else {
			this.disabled = true;
			this.ready.resolve();
		}
	}
	connect() {
		if (this.disabled) return;

		// only one attempt in flight — clears a pending retry if something
		// calls connect() directly.
		clearTimeout(this.retry);
		this.retry = null;

		this.ws = new WebSocket(this.protocol + "://" + window.location.host);
		this.ws.addEventListener("open", () => this.open());
		this.ws.addEventListener("message", res => this.message(res));

		// A failed connect fires "error" AND THEN "close". Reconnecting from
		// both is what turned a dead dev server into a connection storm, so
		// "close" is the single reconnect path and "error" only reports.
		this.ws.addEventListener("close", () => this.reconnect());
		this.ws.addEventListener("error", () => console.warn("Socket error."));
	}
	open() {
		console.log("%cSocket connected.", "color: green; font-weight: bold;");
		// this.rpc("log", "connected!");
		this.connected = true;
		this.fails = 0;
		this.ready.resolve();
	}
	reconnect() {
		// never reject .ready — a pending promise parks send()s until we're
		// back, which is the point. Retry forever: restarting `node server.js`
		// is routine, and the page should pick it back up on its own.
		if (this.disabled || this.retry) return;

		// only swap in a fresh .ready if the old one was resolved, otherwise
		// anything already awaiting it would be stranded on a dead promise.
		if (this.connected) {
			this.connected = false;
			this.ready = promise();
		}

		// 250ms, 500ms, 1s, 2s ... capped at 10s
		const delay = Math.min(250 * 2 ** this.fails++, 10000);
		console.warn(`Socket closed, reconnecting in ${delay}ms.`);
		this.retry = setTimeout(() => this.connect(), delay);
	}
	// message recieved handler
	message(res) {
		// debugger;
		// console.log(res);
		const data = JSON.parse(res.data);

		// does the index exist
		if (data?.index in this.requests) {
			this.requests[data.index](data);
		} else {
			data.args = data.args || [];
			// console.log(data.method + "(", ...data.args, ")");
			if (this[data.method])
				this[data.method](...data.args);
		}
	}
	reload() {
		if (!window.$BLOCKRELOAD)
			window.location.reload();
		// debugger;
	}

	async send(obj) {
		if (this.disabled) return;
		// console.trace("sending", obj);
		await this.ready;
		this.ws.send(JSON.stringify(obj));
	}

	async request(obj) {
		if (this.disabled) return;
		let response = new Promise(resolve => {
			obj.index = this.requests.push(resolve) - 1;
		});

		await this.send(obj);


		return response;
	}

	async async_rpc(method, ...args){
		return this.request({ method, args });
	}

	rpc(method, ...args) {
		this.send({ method, args })
	}

	ls(dir) {
		return this.request({ method: "ls", args: [dir] });
	}

	// ls_response(data){
	// 	new FSView({ data })
	// }

	cmd(res) {
		console.log("cmd response:", res);
	}

	write(filename, data) {
		this.rpc("write", filename, data);
	}

	log() {
		console.log(...arguments);
	}

	rm(dir) {
		return this.request({ method: "rm", args: [dir] });
	}
}

/*

await socket.request() -> fulfills with response

request(){
	this.send({ request, id })

	this.response = new Promise()
}

*/