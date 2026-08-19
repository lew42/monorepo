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
		this.swaps = 0;
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
		this.rpc("hello", window.location.pathname, this.tab());
	}

	// A stable name for THIS tab, minted once. Two tabs on one page are otherwise
	// indistinguishable, so `path` cannot address one of them — every `hello` carries
	// this instead, and MCP's tools take it as `tab`. ⚠ sessionStorage: it survives the
	// reload (constant here) and dies with the tab, which is exactly a tab's lifetime.
	tab() {
		let id = sessionStorage.getItem("dev-tab");
		if (!id) sessionStorage.setItem("dev-tab", id = crypto.randomUUID().slice(0, 8));
		return id;
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

	// ⚠ Called BY the server, like reload() — this is MCP's `eval` tool, and it
	// must never throw: message() has no catch, so one bad expression would take
	// down every frame after it.
	eval(code, token) {
		// ⚠ Read at REPLY time, never at call time — a three-second eval spans a
		//   click-away, and what the answer is worth depends on the state it was
		//   answered in. A hidden tab still evaluates; it just stops rendering.
		const reply = result => this.rpc("eval_result", token, { ...result,
			visibility: document.visibilityState,
			focused: document.hasFocus(),
			size: [innerWidth, innerHeight] });
		const text = value => {
			try { return JSON.stringify(value) ?? String(value); }
			catch { return String(value); }
		};

		// The tab may have navigated since it connected.
		this.rpc("hello", window.location.pathname, this.tab());

		try {
			Promise.resolve((0, eval)(code)).then(
				value => reply({ value: text(value) }),
				e => reply({ error: String(e?.message || e) })
			);
		} catch (e) {
			reply({ error: String(e?.message || e) });
		}
	}

	// ⚠ Called BY the server, like reload(). No `paths` — or a null inside one —
	// means "unknown", which is the old reload-everything.
	changed(paths) {
		if (window.$BLOCKRELOAD) return;
		if (!paths || paths.includes(null)) return this.reload();

		const loaded = this.loaded();
		let stale = false;

		for (const path of paths) {
			if (!loaded.has(path)) continue;
			if (!(loaded.get(path) && this.restyle(path))) stale = true;
		}

		if (stale) this.reload();
	}

	// Every same-origin url this tab fetched, pathname → still hot-swappable.
	// ⚠ False once something read the file as data — ext/files shows sources, and
	// swapping a <link> would leave that copy stale on screen.
	loaded() {
		const paths = new Map();
		for (const entry of performance.getEntriesByType("resource")) {
			const { origin, pathname } = new URL(entry.name, window.location.href);
			if (origin !== window.location.origin) continue;
			const swappable = entry.initiatorType !== "fetch" && entry.initiatorType !== "xmlhttprequest";
			paths.set(pathname, swappable && (paths.get(pathname) ?? true));
		}
		return paths;
	}

	// ⚠ Bumps `?t=` on the SAME <link> element. A replacement element registers
	// its @layer at the END of the cascade and silently reorders the whole site.
	restyle(path) {
		const links = [...document.querySelectorAll('link[rel="stylesheet"]')].filter(link => {
			const url = new URL(link.href);
			return url.origin === window.location.origin && url.pathname === path;
		});
		if (!links.length) return false;

		this.swaps++;
		links.forEach(link => {
			const url = new URL(link.href);
			url.searchParams.set("t", this.swaps);
			link.href = url.href;
		});
		return true;
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
