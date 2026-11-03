// The Chat settings "Make default" store: {Name: {enabled?, config?}} shared by every browser through Servex (GET/POST /api/session/defaults),
// with localStorage as the fallback when Servex cannot be reached. Plain: `fetch` and `url` are handed in, so a test can fake them.
export default class ChatDefaults {
	static KEY = "chat.settings.defaults";

	constructor({ fetch: fetch_fn = globalThis.fetch?.bind(globalThis), url = p => p, storage = globalThis.localStorage, timeout_ms = 10000 } = {}){
		Object.assign(this, { fetch: fetch_fn, url, storage, timeout_ms });
	}

	signal(){ return globalThis.AbortSignal?.timeout ? AbortSignal.timeout(this.timeout_ms) : undefined; }

	// {plugins}, from Servex, else from the browser's own copy ({} when neither has one).
	async get(){
		try {
			const res = await this.fetch(this.url("/api/session/defaults"), { signal: this.signal() });
			const out = await res.json();
			if (!out.ok) throw new Error(out.error ?? "HTTP " + res.status);
			return { plugins: out.plugins ?? {}, from: "servex" };
		} catch (e) {
			return { plugins: this.local(), from: "browser", error: e.message ?? String(e) };
		}
	}

	// Save the class values; the browser's copy is kept either way, and `saved` says which one the owner can count on.
	async set(plugins){
		try { this.storage?.setItem(ChatDefaults.KEY, JSON.stringify(plugins)); } catch { /* storage blocked: Servex is the copy */ }
		try {
			const res = await this.fetch(this.url("/api/session/defaults"), { method: "POST", signal: this.signal(),
				headers: { "content-type": "application/json" }, body: JSON.stringify({ plugins }) });
			const out = await res.json();
			if (!out.ok) throw new Error(out.error ?? "HTTP " + res.status);
			return { saved: "servex" };
		} catch (e) {
			return { saved: "browser", error: e.message ?? String(e) };
		}
	}

	local(){ try { return JSON.parse(this.storage?.getItem(ChatDefaults.KEY) ?? "{}") ?? {}; } catch { return {}; } }
}
