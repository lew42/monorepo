import { Backend } from "./Backend.js";

/**
 * MockBackend: the same calls with no Worker, kept in localStorage ("join-mock"), so the whole flow can be walked on the
 * dev server. The sign-in is a fake user (GoogleButton's own mock), the subscribe is a flag, and the test notification is
 * a local showNotification through the service worker. The page shows a "mock" badge whenever this is in use.
 */
export class MockBackend extends Backend {

	constructor(){
		super({ client_id: "", env: "mock", vapid_public: "" }, "mock");
		this.mock = true;
	}

	get db(){ return JSON.parse(localStorage.getItem("join-mock") || "{}"); }
	set db(v){ localStorage.setItem("join-mock", JSON.stringify(v)); }
	patch(p){ this.db = { ...this.db, ...p }; }

	async me(){ return { user: this.db.user || null, push: !!this.db.push }; }
	login(user){ this.patch({ user }); }
	async logout(){ this.patch({ user: null }); return { ok: true }; }
	async delete_me(){ const email = this.db.user?.email; localStorage.removeItem("join-mock"); return { deleted: true, email }; }
	async subscribe(){ this.patch({ push: true }); return { ok: true }; }
	async unsubscribe(){ this.patch({ push: false }); return { ok: true }; }

	async push_test(){
		const reg = await navigator.serviceWorker.ready;
		await reg.showNotification("Test notification (mock)", { body: "This one was shown locally, with no server.", icon: "/app/icons/icon-192.png", data: { url: "/join/" } });
		return { results: [{ status: "local" }] };
	}
}

export default MockBackend;
