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

import Link from "./Link.js";

export default class Socket {
	// history and reasons: /framework/dev/Socket/doc/Socket-notes.md

	static DATA = /\.(json|jsonl|md|txt|csv)$/i;

	static STATE = "dev-reload-state";

	// A reload deferred while a mic was busy waits until the page has been quiet this long, so stopping the mic and
	// starting it again never lands on a reloading page (ux/Dictate/test/refresh.mjs, scenario restart).
	static QUIET_MS = 30000;

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

		// The client tries every host (wss on https); the SERVER decides what a peer may do: loopback gets
		// everything, a private LAN peer gets push traffic only, anything else is refused at the upgrade.
		// A refused socket backs off and says so once. doc/lan.md
		this.connect();
	}
	connect() {
		if (this.disabled) return;

		clearTimeout(this.retry);
		this.retry = null;

		const ws = this.ws = new WebSocket(this.protocol + "://" + window.location.host);
		// A socket that `restart()` set aside may still say something late: only the current one counts.
		ws.addEventListener("open", () => ws === this.ws && this.open());
		ws.addEventListener("message", res => ws === this.ws && this.message(res));

		// ⚠ Failed connect fires "error" AND THEN "close" — reconnect only on "close"
		ws.addEventListener("close", () => ws === this.ws && this.reconnect());
		ws.addEventListener("error", () => {});
	}

	// Throw the current connection away and open a new one now. For a socket that looks open but is dead (a half-open connection:
	// the browser has no close to report). core/Item/Outbox.js calls it when its ping gets no answer.
	restart() {
		if (this.disabled) return;
		const old = this.ws;
		if (this.connected) { this.connected = false; this.ready = promise(); }
		try { old?.close(); } catch {}
		this.connect();
	}
	open() {
		console.log("%cSocket connected.", "color: green; font-weight: bold;");
		this.connected = true;
		this.fails = 0;
		this.ever_connected = true;
		Link.report("dev", null);
		this.ready.resolve();
		this.rpc("hello", window.location.pathname, this.tab());
		this.emit("open");   // core/Item/Outbox.js sends again whatever the server has not acked
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

		// One banner for every wire (Link.js); it shows only once the drop has lasted, so a blip never flashes it.
		if (this.ever_connected) Link.report("dev", { why: "the dev server is not answering (restarting?)", retry: () => this.restart() });

		// Never connected here (a static host, a refused peer): back off to a minute, say so once, let
		// send()/request() return instead of parking, and give up after about five minutes.
		if (!this.ever_connected) {
			this.ready.resolve();
			if (this.fails >= 12) { this.disabled = true; return; }
		}
		const delay = Math.min(250 * 2 ** this.fails++, this.ever_connected ? 10000 : 60000);
		if (!this.warned) { this.warned = true; console.warn("Socket not connected; retrying quietly in the background."); }
		this.retry = setTimeout(() => this.connect(), delay);
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
		this.inject_style("dev-stale", "@layer util { .dev-stale-pill { position: fixed; inset-block-start: 0.5rem; inset-inline-start: 50%; transform: translateX(-50%); max-inline-size: calc(100vw - 2rem); z-index: 60; padding: 0.4em 0.9em; border-radius: 2em; border: 1px solid #b45309; background: #fef3c7; color: #78350f; font: 0.85rem system-ui, sans-serif; cursor: pointer; box-shadow: 0 2px 8px #0004; } }");
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
		let quiet_since = 0;
		this.deferring = setInterval(() => {
			if (this.busy()) { quiet_since = 0; return; }
			quiet_since ||= Date.now();
			if (Date.now() - quiet_since < this.constructor.QUIET_MS) return;
			clearInterval(this.deferring); this.deferring = null; this.reload();
		}, 1000);
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

		try { this.emit("stash", state); } catch {}   // a view adds what it needs back (the AI sheet: its size)
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
		this.restored = state;   // read once by whoever stashed something in it (the AI sheet)

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

	// true once the frame is on the wire; false where there is no socket (disabled, or never reachable) so callers never park.
	async send(obj) {
		if (this.disabled) return false;
		await this.ready;
		if (this.ws?.readyState !== WebSocket.OPEN) return false;
		this.ws.send(JSON.stringify(obj));
		return true;
	}

	async request(obj) {
		if (this.disabled) return;
		let response = new Promise(resolve => {
			obj.index = this.requests.push(resolve) - 1;
		});

		if (!(await this.send(obj))) return;

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
