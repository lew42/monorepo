import { Page, md, div, h3, button, View } from "/app.js";
import EventLog from "../EventLog/EventLog.js";
import WorkerHost from "../WorkerHost/WorkerHost.js";
import NotificationManager from "../NotificationManager/NotificationManager.js";
import cards from "./cards.js";

View.stylesheet(import.meta, "lab.css");
const log = new EventLog();
const host = new WorkerHost({ log });
const manager = new NotificationManager({ host, log });
window.lab = { log, host, manager };   // poke it from the console

// A tab opened by tapping a notification while no tab existed carries the click in the URL.
const q = new URLSearchParams(location.search);
if (q.get("clicked")) log.add("page", `opened by a click on "${q.get("clicked")}"${q.get("action") ? `, action "${q.get("action")}"` : ""} (no tab was open)`);

export default new Page({
	meta: import.meta,
	title: "Notifications",
	description: "Web notifications from a plain Android Chrome tab: what works, live.",
	icon: "notifications_active",
	children: "phone report",
	content(){
		md("Press **Start**, allow notifications, then press any button below. Every card shows what the browser is doing and the log at the bottom records every event. On your phone? Do the [phone checklist](phone/) first. Findings: [report](report/).");
		div.c("flex gap wrap", () => {
			button.c("btn prim", "1. Start (register worker)").attr("type", "button").click(async () => { await host.register(); await manager.request(); manager.refresh(); });
			button.c("btn", "Ping worker").attr("type", "button").click(() => host.ping());
		});
		const card = (title, note, fill) => div.c("card pad flow", () => { h3(title); if (note) md(note); fill(); });
		card("Worker", "Is the page allowed to use a service worker, and is it running?", () => div.c("lab-state", () => host.view));
		card("Manager", "Permission and what is on screen right now.", () => div.c("lab-state", () => manager.view));
		cards.forEach(c => card(c.title, c.note, () => c.fill({ manager, host, log })));
		card("Event log", "Everything above writes here, newest first.", () => log.view);
		if (q.get("auto") !== null) host.register().then(() => manager.refresh());
	},
});
