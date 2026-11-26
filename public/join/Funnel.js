/**
 * Funnel: one event per step of /join/, sent to POST /api/join/event (worker/join.js). No personal data — only a
 * random visitor id this device keeps in localStorage, and the utm_* values the ad link carried, kept in
 * sessionStorage so they survive a reload or the trip through Google. In mock mode it logs to the console and
 * sends nothing, so nobody needs a real Worker to see the calls it would make.
 *
 *   const funnel = new Funnel(backend, env);   // env = the page's InAppBrowser; reads/creates the visitor id
 *   funnel.send("tap_allow");                   // never awaited, never throws: see() fires and forgets
 *   Funnel.reset();                              // Join.reset() (?debug=1's Reset everything) calls it
 */
export class Funnel {

	static VKEY = "join-visitor";
	static UKEY = "join-utm";

	constructor(backend, env, params = new URLSearchParams(location.search)){
		this.backend = backend;
		this.env = env;
		this.utm = this.read_utm(params);
	}

	read_utm(params){
		if (params.has("utm_source") || params.has("utm_campaign") || params.has("utm_content")){
			const utm = { src: params.get("utm_source") || "", camp: params.get("utm_campaign") || "", content: params.get("utm_content") || "" };
			sessionStorage.setItem(Funnel.UKEY, JSON.stringify(utm));
			return utm;
		}
		try { return JSON.parse(sessionStorage.getItem(Funnel.UKEY) || "null") || { src: "", camp: "", content: "" }; }
		catch { return { src: "", camp: "", content: "" }; }
	}

	get visitor(){
		let v = localStorage.getItem(Funnel.VKEY);
		if (!/^[0-9a-f]{16}$/.test(v || "")){
			v = [...crypto.getRandomValues(new Uint8Array(8))].map(b => b.toString(16).padStart(2, "0")).join("");
			localStorage.setItem(Funnel.VKEY, v);
		}
		return v;
	}

	get os(){ return this.env?.ios ? "ios" : this.env?.android ? "android" : "desktop"; }
	get inapp(){ return this.env?.app || ""; }

	send(event){
		if (this.backend?.mock) return void console.log("[funnel]", event, { os: this.os, inapp: this.inapp, ...this.utm });
		const body = JSON.stringify({ v: this.visitor, e: event, inapp: this.inapp, os: this.os, src: this.utm.src, camp: this.utm.camp, content: this.utm.content });
		// text/plain is CORS-safelisted, so no browser refuses the beacon; the Worker's request.json() ignores the type.
		try { if (navigator.sendBeacon?.("/api/join/event", new Blob([body], { type: "text/plain" }))) return; } catch {}
		fetch("/api/join/event", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => {});
	}

	static reset(){
		localStorage.removeItem(Funnel.VKEY);
		sessionStorage.removeItem(Funnel.UKEY);
	}
}

export default Funnel;
