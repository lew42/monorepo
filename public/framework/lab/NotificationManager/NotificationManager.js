import LiveView, { Lab, row } from "../LiveView/LiveView.js";
import NotificationHandle from "./NotificationHandle.js";
import { div, span, button } from "/framework/core/View/View.js";

// The one app-level notification object. Wraps permission, maxActions, showNotification and
// getNotifications. Never uses `new Notification()`: Android Chrome throws on it, so
// everything goes through registration.showNotification (the page can probe this: probe()).
export default class NotificationManager extends Lab {
	constructor({ host, log } = {}){
		super();
		Object.assign(this, { host, log });
		this.handles = new Map();      // tag -> NotificationHandle
		this.visible = [];             // what getNotifications() last returned
		this.permission = "Notification" in window ? Notification.permission : "unsupported";
		this.maxActions = "Notification" in window ? (Notification.maxActions ?? "n/a") : "n/a";
		this.probed = null;
		host?.on("message", msg => this.relay(msg));
		host?.on("change", () => this.emit("change"));
		addEventListener("focus", () => this.refresh());
		document.addEventListener("visibilitychange", () => this.refresh());
	}
	get registration(){ return this.host?.registration; }

	async request(){
		if (!("Notification" in window)) return this.permission;
		this.permission = await Notification.requestPermission();
		this.log?.add("manager", "permission: " + this.permission);
		this.emit("change");
		return this.permission;
	}

	// show(opts) -> the handle for opts.tag (made if new). Without a tag, one is minted.
	show(opts = {}){
		const tag = opts.tag ?? "n" + Math.random().toString(36).slice(2, 7);
		const handle = this.handles.get(tag) ?? new NotificationHandle(this, tag);
		this.handles.set(tag, handle);
		handle.set(opts);
		return handle;
	}
	handle(tag){ return this.handles.get(tag) ?? (this.handles.set(tag, new NotificationHandle(this, tag)), this.handles.get(tag)); }

	async refresh(){
		if (!this.registration) return;
		this.permission = "Notification" in window ? Notification.permission : "unsupported";
		this.visible = await this.registration.getNotifications();
		this.emit("change");
	}

	relay(msg){
		if (!msg?.tag) return;
		if (msg.type === "click") this.log?.add("manager", `click on "${msg.tag}"${msg.action ? ` action "${msg.action}"` : ""} (tab was ${msg.visibility}, focused: ${msg.focused})`, msg);
		if (msg.type === "close") this.log?.add("manager", `close on "${msg.tag}"`);
		this.handles.get(msg.tag)?.receive(msg);
		this.refresh();
	}

	// Verify the Android claim: does `new Notification()` throw here?
	probe(){
		try { new Notification("probe"); this.probed = "did NOT throw"; }
		catch (error){ this.probed = `threw ${error.name}: ${error.message}`; }
		this.log?.add("manager", "new Notification() " + this.probed);
		this.emit("change");
	}

	static View = class extends LiveView {
		draw(){
			const m = this.item;
			row("permission", m.permission, m.permission === "granted" ? "ok" : m.permission === "denied" ? "bad" : "");
			row("maxActions", m.maxActions);
			row("new Notification()", m.probed ?? "not probed yet");
			row("visible now", `${m.visible.length}: ${m.visible.map(n => n.tag || "(no tag)").join(", ") || "none"}`);
			div.c("flex gap wrap", () => {
				button.c("btn prim", "Ask permission").attr("type", "button").click(() => m.request());
				button.c("btn", "Refresh visible").attr("type", "button").click(() => m.refresh());
				button.c("btn", "Probe new Notification()").attr("type", "button").click(() => m.probe());
			});
		}
	};
}
