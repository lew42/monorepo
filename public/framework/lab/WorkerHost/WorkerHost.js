import LiveView, { Lab, row } from "../LiveView/LiveView.js";

// Registers sw.js and shows what the worker is doing. Thin: it adds nothing to
// navigator.serviceWorker except state tracking and re-emitting the worker's messages.
export default class WorkerHost extends Lab {
	constructor({ script = "/sw.js", scope = "/", log } = {}){
		super();
		Object.assign(this, { script, scope, log });
		this.state = "unregistered";   // unregistered | installing | waiting | active | unsupported | error
		this.secure = window.isSecureContext;
		this.supported = "serviceWorker" in navigator;
		this.registration = null;
		this.error = null;
		if (!this.supported){ this.state = "unsupported"; return; }
		navigator.serviceWorker.addEventListener("message", e => {
			this.log?.add("worker", `message ${JSON.stringify(e.data)}`);
			this.emit("message", e.data);
		});
	}

	async register(){
		if (!this.supported) return null;
		try {
			this.registration = await navigator.serviceWorker.register(this.script, { type: "module", scope: this.scope });
			this.watch(this.registration.installing || this.registration.waiting || this.registration.active);
			await navigator.serviceWorker.ready;
			this.registration.addEventListener("updatefound", () => this.watch(this.registration.installing));
			this.sync();
			this.log?.add("worker", "registered, state: " + this.state);
		} catch (error){
			this.error = error; this.state = "error";
			this.log?.add("worker", `register failed: ${error.name}: ${error.message}`);
			this.emit("change");
		}
		return this.registration;
	}

	watch(worker){
		if (!worker) return;
		worker.addEventListener("statechange", () => { this.sync(); this.log?.add("worker", "state " + worker.state); });
		this.sync();
	}
	sync(){
		const r = this.registration;
		this.state = r?.installing ? "installing" : r?.waiting ? "waiting" : r?.active ? "active" : "unregistered";
		this.emit("change");
	}

	ping(){ this.registration?.active?.postMessage({ type: "ping" }); }
	async unregister(){
		const ok = await this.registration?.unregister();
		this.registration = null; this.state = "unregistered"; this.emit("change");
		this.log?.add("worker", "unregistered: " + ok);
	}

	static View = class extends LiveView {
		draw(){
			const h = this.item;
			row("isSecureContext", h.secure, h.secure ? "ok" : "bad");
			row("serviceWorker in navigator", h.supported, h.supported ? "ok" : "bad");
			row("worker state", h.state, h.state === "active" ? "ok" : "");
			row("script / scope", `${h.script} / ${h.registration?.scope ?? h.scope}`);
			row("controlled by worker", !!navigator.serviceWorker?.controller);
			if (h.error) row("error", `${h.error.name}: ${h.error.message}`, "bad");
		}
	};
}
