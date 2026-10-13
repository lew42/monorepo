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
	// history and reasons: /framework/dev/Socket/doc/Socket-notes.md

	static DATA = /\.(json|jsonl|md|txt|csv)$/i;

	static STATE = "dev-reload-state";

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
		this.listeners = {};
		this.skipped = 0;

		if (sessionStorage.getItem("dev-block") === "1") window.$BLOCKRELOAD = true;

		this.restore();

		// ⚠ LOCALHOST ONLY — RCE risk if widened to LAN (socket carries rpc:cmd/write)
		if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.endsWith(".localhost")) {
			this.connect();
		} else {
			this.disabled = true;
			this.ready.resolve();
		}
	}
	connect() {
		if (this.disabled) return;

		clearTimeout(this.retry);
		this.retry = null;

		this.ws = new WebSocket(this.protocol + "://" + window.location.host);
		this.ws.addEventListener("open", () => this.open());
		this.ws.addEventListener("message", res => this.message(res));

		// ⚠ Failed connect fires "error" AND THEN "close" — reconnect only on "close"
		this.ws.addEventListener("close", () => this.reconnect());
		this.ws.addEventListener("error", () => console.warn("Socket error."));
	}
	open() {
		console.log("%cSocket connected.", "color: green; font-weight: bold;");
		this.connected = true;
		this.fails = 0;
		this.ever_connected = true;
		this.hide_reconnecting();
		this.ready.resolve();
		this.rpc("hello", window.location.pathname, this.tab());
	}

	tab() {
		let id = sessionStorage.getItem("dev-tab");
		if (!id) sessionStorage.setItem("dev-tab", id = crypto.randomUUID().slice(0, 8));
		return id;
	}
	reconnect() {
		// ⚠ Never reject `.ready` — parks pending send()s
		if (this.disabled || this.retry) return;

		// ⚠ Only swap fresh `.ready` if old one resolved
		if (this.connected) {
			this.connected = false;
			this.ready = promise();
		}

		if (this.ever_connected) this.show_reconnecting();

		const delay = Math.min(250 * 2 ** this.fails++, 10000);
		console.warn(`Socket closed, reconnecting in ${delay}ms.`);
		this.retry = setTimeout(() => this.connect(), delay);
	}

	show_reconnecting() {
		if (this.strip || !document.body) return;
		this.inject_style("dev-reconnect", "@layer util { .dev-reconnect-strip { position: fixed; inset-block-start: 0; inset-inline: 0; z-index: 61; padding: 0.3em 0.9em; background: #78350f; color: #fef3c7; font: 0.8rem system-ui, sans-serif; text-align: center; } }");
		const strip = this.strip = document.createElement("div");
		strip.className = "dev-reconnect-strip";
		strip.textContent = "server restarting… reconnecting";
		document.body.prepend(strip);
	}

	hide_reconnecting() {
		this.strip?.remove();
		this.strip = null;
	}

	inject_style(marker, css) {
		if (document.querySelector(`style[data-${marker}]`)) return;
		const style = document.createElement("style");
		style.setAttribute(`data-${marker}`, "");
		style.textContent = css;
		document.head.append(style);
	}
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

	on(name, fn) {
		(this.listeners[name] ??= new Set()).add(fn);
		return () => this.listeners[name].delete(fn);
	}

	emit(name, ...args) {
		for (const fn of this.listeners[name] ?? []) fn(...args);
	}

	reload() {
		if (window.$BLOCKRELOAD) { this.mark_stale(); return this.skip(); }
		if (this.busy()) { this.mark_stale(); return this.defer(); }
		this.preflight().then(ok => {
			if (!ok) return this.mark_stale("This page changed but would not load yet — kept the old one. Reload");
			this.stash();
			window.location.reload();
		});
	}

	async preflight() {
		try {
			const urls = [location.href, ...(this.changed_paths ?? [])];
			const rs = await Promise.all(urls.map(u => fetch(u, { cache: "no-store" })));
			return rs.every(r => r.ok);
		} catch { return true; }
	}

	mark_stale(text = "This page is out of date — reload") {
		if (this.pill || !document.body) return;
		this.inject_style("dev-stale", "@layer util { .dev-stale-pill { position: fixed; inset-block-end: 1rem; inset-inline-start: 1rem; z-index: 60; padding: 0.4em 0.9em; border-radius: 2em; border: 1px solid #b45309; background: #fef3c7; color: #78350f; font: 0.85rem system-ui, sans-serif; cursor: pointer; box-shadow: 0 2px 8px #0004; } }");
		const pill = this.pill = document.createElement("button");
		pill.className = "dev-stale-pill";
		pill.textContent = text;
		pill.onclick = () => { this.stash(); window.location.reload(); };
		document.body.append(pill);
	}

	add_busy(fn) { (this.busy_hooks ??= new Set()).add(fn); return () => this.busy_hooks.delete(fn); }
	busy() { for (const fn of this.busy_hooks ?? []) try { if (fn()) return true; } catch {} return false; }
	defer() {
		if (this.deferring) return;
		this.deferring = setInterval(() => { if (!this.busy()) { clearInterval(this.deferring); this.deferring = null; this.reload(); } }, 1000);
	}

	skip() {
		this.skipped++;
		this.emit("skipped", this.skipped);
	}

	hold(holders) {
		this.hold_holders = holders || [];
		window.dispatchEvent(new CustomEvent("dev-hold", { detail: this.hold_holders }));
	}

	// ⚠ eval must never throw — message() has no catch
	eval(code, token) {
		// ⚠ Read at REPLY time, not call time — answer's value depends on tab state
		const reply = result => this.rpc("eval_result", token, { ...result,
			visibility: document.visibilityState,
			focused: document.hasFocus(),
			size: [innerWidth, innerHeight] });
		const text = value => {
			try { return JSON.stringify(value) ?? String(value); }
			catch { return String(value); }
		};

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

	changed(paths) {
		if (!paths || paths.includes(null)) return this.reload();

		const loaded = this.loaded();
		let stale = false;

		for (const path of paths) {
			if (!loaded.has(path)) continue;
			const swappable = loaded.get(path);
			if (!swappable && this.constructor.DATA.test(path)) { this.emit("data", path); continue; }
			if (!(swappable && this.restyle(path))) stale = true;
		}

		if (stale) { this.changed_paths = paths.filter(path => loaded.has(path)); this.reload(); }
	}

	stash() {
		const where = el => {
			const parts = [];
			for (; el && el.nodeType === 1 && el !== document.documentElement; el = el.parentElement)
				parts.unshift(`${el.tagName}:nth-child(${[...el.parentElement.children].indexOf(el) + 1})`);
			return "html>" + parts.join(">");
		};

		const state = { at: Date.now(), url: location.pathname + location.search, scroll: [], open: [] };

		for (const el of document.querySelectorAll("*")) {
			if (el.scrollTop > 0) state.scroll.push({ at: where(el), top: el.scrollTop });
			if (el.tagName === "DETAILS" && el.open) state.open.push(where(el));
		}

		const $f = document.activeElement;
		if ($f && "value" in $f && $f.value)
			state.focus = { at: where($f), value: $f.value, caret: $f.selectionStart };

		try { sessionStorage.setItem(this.constructor.STATE, JSON.stringify(state)); } catch {}
	}

	restore() {
		let state;
		try {
			const raw = sessionStorage.getItem(this.constructor.STATE);
			sessionStorage.removeItem(this.constructor.STATE);
			state = raw && JSON.parse(raw);
		} catch {}

		if (!state || state.url !== location.pathname + location.search || Date.now() - state.at > 20000) return;

		let tries = 0;
		const put = () => {
			let done = true;

			for (const { at, top } of state.scroll) {
				const el = document.querySelector(at);
				if (!el) { done = false; continue; }
				el.scrollTop = top;
				if (Math.abs(el.scrollTop - top) > 4) done = false;
			}

			for (const at of state.open) {
				const el = document.querySelector(at);
				if (el) el.open = true; else done = false;
			}

			// ⚠ Only into EMPTY field, once — page may have its own content
			const $f = state.focus && document.querySelector(state.focus.at);
			if (state.focus && !$f) done = false;
			else if ($f && !$f.value) {
				$f.value = state.focus.value;
				$f.focus();
				try { $f.setSelectionRange(state.focus.caret, state.focus.caret); } catch {}
				state.focus = null;
			}

			if (!done && tries++ < 60) requestAnimationFrame(put);
		};

		requestAnimationFrame(put);
	}

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

	log() {
		console.log(...arguments);
	}

	rm(dir) {
		return this.request({ method: "rm", args: [dir] });
	}
}
