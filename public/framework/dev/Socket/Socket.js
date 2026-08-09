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

		// ⚠ LOCALHOST ONLY — production is static hosting with nothing to connect
		// to. Keep this gate: it is part of static compatibility.
		if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.endsWith(".localhost")) {
			this.connect();
		} else {
			this.disabled = true;
			this.ready.resolve();
		}
	}
	connect() {
		if (this.disabled) return;

		// only one attempt in flight
		clearTimeout(this.retry);
		this.retry = null;

		this.ws = new WebSocket(this.protocol + "://" + window.location.host);
		this.ws.addEventListener("open", () => this.open());
		this.ws.addEventListener("message", res => this.message(res));

		// ⚠ A failed connect fires "error" AND THEN "close". Reconnecting from both
		// turned a dead dev server into a connection storm, so "close" is the single
		// reconnect path and "error" only reports.
		this.ws.addEventListener("close", () => this.reconnect());
		this.ws.addEventListener("error", () => console.warn("Socket error."));
	}
	open() {
		console.log("%cSocket connected.", "color: green; font-weight: bold;");
		this.connected = true;
		this.fails = 0;
		this.ready.resolve();
	}
	reconnect() {
		// ⚠ Never reject `.ready` — a pending promise parks send()s until we are
		// back, and restarting `node server.js` is routine.
		if (this.disabled || this.retry) return;

		// ⚠ Only swap in a fresh `.ready` if the old one resolved, or anything
		// already awaiting it is stranded on a dead promise.
		if (this.connected) {
			this.connected = false;
			this.ready = promise();
		}

		// 250ms, 500ms, 1s, 2s ... capped at 10s
		const delay = Math.min(250 * 2 ** this.fails++, 10000);
		console.warn(`Socket closed, reconnecting in ${delay}ms.`);
		this.retry = setTimeout(() => this.connect(), delay);
	}
	// A reply to a pending request(), or the server calling a method on us.
	message(res) {
		const data = JSON.parse(res.data);

		if (data?.index in this.requests) {
			this.requests[data.index](data);
		} else {
			data.args = data.args || [];
			if (this[data.method])
				this[data.method](...data.args);
		}
	}
	reload() {
		if (!window.$BLOCKRELOAD)
			window.location.reload();
	}

	async send(obj) {
		if (this.disabled) return;
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
