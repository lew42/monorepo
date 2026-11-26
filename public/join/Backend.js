/**
 * Backend: the Worker's /api, as the /join/ page calls it (the contract is in the sign-in demo plan).
 *
 *   const backend = await Backend.detect();   // a Backend where /api answers, a MockBackend where it does not
 *   backend.mode                              // "google" | "test" | "mock"
 *   await backend.me()                        // { user, push }
 */
export class Backend {

	constructor(config, mode = "google", key = ""){
		this.config = config;
		this.mode = mode;
		this.key = key;
		this.mock = false;
	}

	// A static host (the dev server) answers /api/config with the page itself: not JSON, so there is no API and the page runs the mock.
	static async detect(params = new URLSearchParams(location.search)){
		if (!params.has("mock")){
			try {
				const config = await (await fetch("/api/config")).json();
				if (config.env) return new Backend(config, params.has("test") ? "test" : "google", params.get("test") || "");
			} catch {}
		}
		const { MockBackend } = await import("./MockBackend.js");
		return new MockBackend();
	}

	async call(path, method = "GET", body){
		const res = await fetch("/api" + path, body === undefined ? { method } : { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
		const data = await res.json().catch(() => ({}));
		if (!res.ok) throw new Error(data.error || `${method} ${path}: HTTP ${res.status}`);
		return data;
	}

	get client_id(){ return this.config.client_id || ""; }
	get vapid_public(){ return this.config.vapid_public || ""; }

	async me(){
		const data = await this.call("/me");
		return { user: data.user || null, push: !!data.push };
	}

	async login_test(){ return (await this.call("/auth/test", "POST", { key: this.key })).user; }
	logout(){ return this.call("/auth/logout", "POST", {}); }
	delete_me(){ return this.call("/me", "DELETE"); }
	subscribe(subscription){ return this.call("/push/subscribe", "POST", subscription); }
	unsubscribe(endpoint){ return this.call("/push/subscribe", "DELETE", endpoint ? { endpoint } : undefined); }
	push_test(){ return this.call("/push/test", "POST", {}); }
}

export default Backend;
