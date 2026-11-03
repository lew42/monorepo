import LiveView, { Lab, row } from "../LiveView/LiveView.js";
import { div, span, button } from "/framework/core/View/View.js";

// One notification slot, keyed by tag. A native notification can't be edited, so set()
// shows a new one under the same tag, which replaces the old one: it behaves like an update.
// Events: "click", "action" (a button), "close" (dismissed, or close() called), "change".
export default class NotificationHandle extends Lab {
	constructor(manager, tag, props = {}){
		super();
		Object.assign(this, { manager, tag, props: { ...props }, shown: 0, last: null, state: "idle" });
	}
	get title(){ return this.props.title ?? this.tag; }

	async set(props = {}){
		Object.assign(this.props, props);
		const { title, ...options } = this.props;
		this.state = "showing";
		try {
			await this.manager.registration.showNotification(this.title, { ...options, tag: this.tag });
			this.shown++; this.last = new Date(); this.state = "shown";
			this.manager.log?.add("handle:" + this.tag, `showNotification #${this.shown} "${this.title}"`);
		} catch (error){
			this.state = "error";
			this.manager.log?.add("handle:" + this.tag, `showNotification failed: ${error.name}: ${error.message}`);
		}
		this.emit("change");
		this.manager.refresh();
		return this;
	}

	async close(){
		const list = await this.manager.registration.getNotifications({ tag: this.tag });
		list.forEach(n => n.close());
		this.state = "closed";
		this.manager.log?.add("handle:" + this.tag, `close() on ${list.length} notification(s)`);
		this.emit("close", { by: "page" });
		this.emit("change");
		this.manager.refresh();
	}

	// Called by the manager when the worker reports an event for this tag.
	receive(msg){
		if (msg.type === "click"){
			this.emit(msg.action ? "action" : "click", msg);
			if (msg.action) this.manager.log?.add("handle:" + this.tag, `action "${msg.action}"`);
		} else if (msg.type === "close"){
			this.state = "closed";
			this.emit("close", { by: "user" });
		}
		this.emit("change");
	}

	static View = class extends LiveView {
		draw(){
			const h = this.item;
			row("tag", h.tag);
			row("state", h.state);
			row("shown", `${h.shown}× (last ${h.last ? h.last.toLocaleTimeString([], { hour12: false }) : "never"})`);
			row("title", h.title);
			if (h.props.body) row("body", h.props.body.length > 90 ? h.props.body.slice(0, 90) + "…" : h.props.body);
		}
	};
}
