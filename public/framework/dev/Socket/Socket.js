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

	/* Paths this tab reads as DATA rather than RUNS. A change to one of these is new
	 * CONTENT, not new code — the program in the browser is byte-for-byte the same
	 * afterwards, so re-reading the file is the whole fix and a reload costs the
	 * reader their scroll position for nothing. Measured 2026-09-22: 203 of the 215
	 * reloads an /framework/ai/ tab took that day were `directory.json` being
	 * rebuilt because an agent created a file somewhere. Extension AND initiator
	 * both have to say "data" — `ext/files` FETCHES a `.js` to show its source, and
	 * that same `.js` is a live module that really does need a reload. */
	static DATA = /\.(json|jsonl|md|txt|csv)$/i;

	// Where a reload's stashed scroll / open / focus state waits. See stash().
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

		/* THE PER-TAB PAUSE SWITCH, restored before anything can reload this tab.
		 * `window.$BLOCKRELOAD` used to be the whole of it, which meant the switch was
		 * forgotten by the very first reload it failed to stop. sessionStorage is
		 * exactly right here: it survives the reload and dies with the tab.
		 * The checkbox and its "n held" count are dev/DevBar/blocked.js. */
		if (sessionStorage.getItem("dev-block") === "1") window.$BLOCKRELOAD = true;

		// Put the reader back where they were, if the last thing this tab did was reload.
		this.restore();

		// ⚠ LOCALHOST ONLY, kept on purpose — this socket also carries `rpc:cmd`
		// and `rpc:write`, so widening it to the LAN would be RCE, not a UX fix.
		// `POST /ask/turn` (Server/plugins/Ask.js) is the narrow door for a phone
		// instead; see `ai/2026-09-29/mobile-nav/` (task log) for why.
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
		this.ever_connected = true;
		this.hide_reconnecting();
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

		// Only once this tab has ever really connected — the very first attempt,
		// before the server has even finished starting on a cold load, is not a
		// restart and should not say it is one.
		if (this.ever_connected) this.show_reconnecting();

		// 250ms, 500ms, 1s, 2s ... capped at 10s
		const delay = Math.min(250 * 2 ** this.fails++, 10000);
		console.warn(`Socket closed, reconnecting in ${delay}ms.`);
		this.retry = setTimeout(() => this.connect(), delay);
	}

	/* THE HOLD STRIP (2026-10-01, page-holds) — the owner's words: a restart
	 * blanked the page; it should hold and reconnect, never go white. Nothing
	 * in this file ever reloads on a close (reconnect() above only retries —
	 * search this file for `reload()` and every caller is changed()/a stale
	 * pill click, never the socket lifecycle), so the page was never actually
	 * going blank FROM the disconnect itself. What was missing is this: zero
	 * sign that anything is happening, so a few hundred ms of silence during
	 * the supervisor's boot-tested swap (Server/doc/watch.md) reads as "it
	 * died" instead of "it's coming back." This shows one small, fixed,
	 * un-clickable line the moment a reconnect is scheduled and removes it the
	 * instant `open()` succeeds — it never reloads or blocks anything itself. */
	show_reconnecting() {
		if (this.strip || !document.body) return;
		if (!document.querySelector("style[data-dev-reconnect]")) {
			const style = document.createElement("style");
			style.setAttribute("data-dev-reconnect", "");
			style.textContent = "@layer util { .dev-reconnect-strip { position: fixed; inset-block-start: 0; inset-inline: 0; z-index: 61; padding: 0.3em 0.9em; background: #78350f; color: #fef3c7; font: 0.8rem system-ui, sans-serif; text-align: center; } }";
			document.head.append(style);
		}
		const strip = this.strip = document.createElement("div");
		strip.className = "dev-reconnect-strip";
		strip.textContent = "server restarting… reconnecting";
		document.body.prepend(strip);
	}

	hide_reconnecting() {
		this.strip?.remove();
		this.strip = null;
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
	/* The socket is the only thing in the browser that hears the file system, so this
	 * is how a page hears it too: `socket.on("data", path => …)`. Returns its own
	 * unsubscribe. A plain registry rather than window events, because what a page
	 * wants to subscribe to is THIS socket, and there is only ever one. */
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
		this.stash();
		window.location.reload();
	}

	/* THE OUT-OF-DATE PILL. A reload this tab refused or postponed (blocked, or busy
	 * with the mic) means code on screen is older than the file on disk. Say so, with
	 * one click to fix it; never reload by itself. Plain DOM, so it works on any page. */
	mark_stale() {
		if (this.pill || !document.body) return;
		const style = document.createElement("style");
		style.textContent = "@layer util { .dev-stale-pill { position: fixed; inset-block-end: 1rem; inset-inline-start: 1rem; z-index: 60; padding: 0.4em 0.9em; border-radius: 2em; border: 1px solid #b45309; background: #fef3c7; color: #78350f; font: 0.85rem system-ui, sans-serif; cursor: pointer; box-shadow: 0 2px 8px #0004; } }";
		const pill = this.pill = document.createElement("button");
		pill.className = "dev-stale-pill";
		pill.textContent = "This page is out of date — reload";
		pill.onclick = () => { this.stash(); window.location.reload(); };
		document.head.append(style);
		document.body.append(pill);
	}

	/* A page can say "not now": add_busy(fn), where fn() is true while a reload
	 * would destroy something (ai2 registers one that is true while its mic is
	 * recording or a transcript is pending). A busy reload is not lost: it waits,
	 * checking once a second, and happens once as soon as every hook says idle. */
	add_busy(fn) { (this.busy_hooks ??= new Set()).add(fn); return () => this.busy_hooks.delete(fn); }
	busy() { for (const fn of this.busy_hooks ?? []) try { if (fn()) return true; } catch {} return false; }
	defer() {
		if (this.deferring) return;
		this.deferring = setInterval(() => { if (!this.busy()) { clearInterval(this.deferring); this.deferring = null; this.reload(); } }, 1000);
	}

	/* A reload this tab refused. The count matters as much as the refusal: a switch
	 * that silently swallows reloads reads as "the dev server has stopped working"
	 * ten minutes later, and the reader has no way to tell the two apart. The dev
	 * bar shows it and clicking it takes them all at once — dev/DevBar/blocked.js. */
	skip() {
		this.skipped++;
		this.emit("skipped", this.skipped);
	}

	// ⚠ Called BY the server, like reload() — Server/plugins/SocketServer/LiveReload.js
	// broadcasts this every time the reload-hold's holder list changes (never on
	// every poll tick, only when it differs). `hold_holders` is read by
	// dev/DevBar/hold.js for the readout beside Block; this file stays the one
	// place that knows the wire shape, so hold.js never has to. A plain window
	// event, not a bare property, because a tab can open dev/DevBar/hold.js
	// AFTER a hold already changed the socket's state at least once.
	hold(holders) {
		this.hold_holders = holders || [];
		window.dispatchEvent(new CustomEvent("dev-hold", { detail: this.hold_holders }));
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

	/* ⚠ Called BY the server, like reload(). No `paths` — or a null inside one —
	 * means "unknown", which is the old reload-everything.
	 *
	 * Three outcomes, cheapest first. A path this tab never loaded is ignored. A
	 * stylesheet is hot-swapped in place. A DATA file the tab fetched fires a `data`
	 * event any page can subscribe to, so the page re-reads the file itself and
	 * nothing is lost. Only the fourth case — a module this tab actually RAN has
	 * changed — reloads, because a changed ES module cannot be re-imported over the
	 * old one without a build step.
	 *
	 * ⚠ It no longer short-circuits on `$BLOCKRELOAD`. Blocking means "do not throw
	 * my state away"; a CSS swap and a data event throw nothing away, so they keep
	 * running while blocked and only `reload()` itself refuses (and counts). */
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

		if (stale) this.reload();
	}

	/* ── WHAT A RELOAD THROWS AWAY ──────────────────────────────────────────────
	 * Most reloads are gone now (see changed() above), but the ones that are left
	 * are real, and they still cost the reader their place on the page. These two
	 * methods put back the three things they would notice: where they had scrolled,
	 * which disclosures were open, and the text they were typing. `?view=` and any
	 * `#hash` need nothing — the url survives a reload by itself.
	 *
	 * ⚠ `window.scrollY` IS ALWAYS 0 ON THIS SITE, so stashing it would restore
	 * nothing while looking like it worked. The document does not scroll: `.pages`
	 * inside the app shell does (measured headless on /framework/ai/2026-09-22/ at
	 * 1440×900 — document 900px tall in a 900px window, `.pages` 5,028px in 900).
	 * So this walks for the elements that really carry a scrollTop.
	 *
	 * ⚠ It cannot restore a fold whose body is BUILT ON CLICK (ext/AITask's
	 * `fold()`): re-adding the open class would show an empty box, which is worse
	 * than a shut one. Native `<details>` is safe because its content is always
	 * there. A module with lazily-built state has to remember that itself. */
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
			sessionStorage.removeItem(this.constructor.STATE);   // one reload only, whatever happens next
			state = raw && JSON.parse(raw);
		} catch {}

		// Ours only. A reader who navigated somewhere else, or came back an hour
		// later on a restored tab, is not asking to be put back where they were.
		if (!state || state.url !== location.pathname + location.search || Date.now() - state.at > 20000) return;

		/* ⚠ The page builds itself asynchronously — the scroller does not exist for
		 * the first few frames, and is not tall enough to ACCEPT the offset for
		 * several more (setting scrollTop past scrollHeight silently clamps). So this
		 * keeps trying for about a second instead of once, and stops the moment every
		 * piece has landed. */
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

			// ⚠ Only into an EMPTY field, and only once. The page may have rebuilt this
			// input with real content of its own, and putting stale text back over that
			// would lose more than the reload did.
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
