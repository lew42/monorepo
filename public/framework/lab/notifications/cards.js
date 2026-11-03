import { div, button } from "/app.js";

// Small SVG pictures as data: URLs, so the demo needs no image files.
const svg = (body, w = 192, h = 192) => "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);
const icon = svg('<rect width="192" height="192" rx="40" fill="#2a6df4"/><text x="96" y="130" font-size="110" text-anchor="middle" fill="#fff">L</text>');
const badge = svg('<circle cx="48" cy="48" r="40" fill="#000"/>', 96, 96);      // Android wants a one-colour shape
const image = svg('<rect width="720" height="360" fill="#f4a62a"/><text x="360" y="220" font-size="120" text-anchor="middle" fill="#fff">image</text>', 720, 360);

const bar = (n, of) => "▓".repeat(n) + "░".repeat(of - n) + ` ${n}/${of}`;
const btn = (label, fn, cls = "btn") => button.c(cls, label).attr("type", "button").click(fn);
const row = fill => div.c("lab-demo", fill);
const after = (s, fn) => () => setTimeout(fn, s * 1000);

const LONG = ["First paragraph. Android shows only the first couple of lines of a body until the notification is expanded, so the start of this text has to carry the message.",
	"Second paragraph, after a blank line. Is the line break kept? This is what the expanded view shows.",
	"Third paragraph. And a final sentence that is long enough to wrap over several lines on a narrow phone screen, which shows where the text is cut with an ellipsis."].join("\n\n");

export default [
	{ title: "All the options", note: "One notification with every option set. Press it, then look at the phone: which parts appear (icon, badge in the status bar, big image, buttons)? The log prints the options sent.",
	  fill: ({ manager, log }) => row(() => {
		btn("Show everything", () => {
			const opts = { title: "Everything", tag: "all", body: "body text", icon, badge, image, renotify: true, silent: false, vibrate: [200, 100, 200], requireInteraction: true,
				actions: [{ action: "yes", title: "Yes" }, { action: "no", title: "No" }], data: { demo: "all" } };
			log.add("demo", "options " + JSON.stringify({ ...opts, icon: "…", badge: "…", image: "…" }));
			manager.show(opts);
		}, "btn prim");
		btn("Show plain (title only)", () => manager.show({ title: "Plain", tag: "plain" }));
		btn("Show again, renotify", () => manager.show({ title: "Renotify", tag: "all", renotify: true, body: new Date().toLocaleTimeString() }));
	}) },

	{ title: "maxActions", note: "The browser allows only a few buttons. This sends 1 to 6 buttons and the log says how many the browser reported as the limit. Count the buttons you actually see.",
	  fill: ({ manager, log }) => row(() => {
		[1, 2, 3, 4, 6].forEach(n => btn(`${n} action${n > 1 ? "s" : ""}`, () => {
			log.add("demo", `sending ${n} actions; maxActions = ${manager.maxActions}`);
			manager.show({ title: `${n} actions`, tag: "actions", body: `maxActions is ${manager.maxActions}`, actions: Array.from({ length: n }, (_, i) => ({ action: "a" + (i + 1), title: "Button " + (i + 1) })) });
		}));
	}) },

	{ title: "Long body", note: "A multi-paragraph body. Look at the collapsed notification, then pull it down to expand it.",
	  fill: ({ manager }) => row(() => {
		btn("Show long body", () => manager.show({ title: "Long body", tag: "long", body: LONG, icon }));
		btn("Show long body + image", () => manager.show({ title: "Long body + image", tag: "long", body: LONG, icon, image }));
	}) },

	{ title: "Many at once vs same tag", note: "Different tags pile up as separate notifications. The same tag replaces the one already showing. Press either a few times and watch \"visible now\" in the Manager card.",
	  fill: ({ manager }) => { let n = 0; return row(() => {
		btn("New tag each time", () => manager.show({ title: "Separate #" + (++n), tag: "multi-" + n }));
		btn("Same tag (replace)", () => manager.show({ title: "Replaced " + new Date().toLocaleTimeString(), tag: "same" }));
		btn("Same tag, renotify (sound again)", () => manager.show({ title: "Renotify " + new Date().toLocaleTimeString(), tag: "same", renotify: true }));
		btn("Close all", async () => { (await manager.registration.getNotifications()).forEach(x => x.close()); manager.refresh(); });
	}); } },

	{ title: "Progress bar", note: "A notification can't be edited, so each step shows a new one under the same tag. A text bar stands in for a progress bar.",
	  fill: ({ manager }) => row(() => {
		btn("Run 1 to 5", () => {
			const h = manager.handle("progress"); let n = 0;
			const step = () => {
				h.set({ title: "Uploading", body: bar(++n, 5), silent: true });
				if (n < 5) setTimeout(step, 1200); else setTimeout(() => h.set({ title: "Done", body: "✔ finished", silent: false }), 1200);
			};
			step();
		}, "btn prim");
	}) },

	{ title: "Question chain", note: "Two buttons per question. The answer comes back from the worker, and the next question replaces the notification (same tag). Tap the buttons on the notification itself.",
	  fill: ({ manager, log }) => row(() => {
		const qs = [["Coffee or tea?", "Coffee", "Tea"], ["Morning or night?", "Morning", "Night"], ["Cats or dogs?", "Cats", "Dogs"]];
		btn("Start the chain", () => {
			const h = manager.handle("chain"); let i = 0; const answers = [];
			const ask = () => h.set({ title: `Question ${i + 1} of ${qs.length}`, body: qs[i][0], requireInteraction: true, renotify: true, actions: [{ action: "0", title: qs[i][1] }, { action: "1", title: qs[i][2] }] });
			h.on("action", function on(msg){
				answers.push(qs[i][1 + +msg.action]); i++;
				if (i < qs.length) ask();
				else { h.off("action", on); h.set({ title: "Thanks", body: "You said: " + answers.join(", "), actions: [], requireInteraction: false }); log.add("demo", "answers: " + answers.join(", ")); }
			});
			ask();
		}, "btn prim");
	}) },

	{ title: "What happens when you tap it", note: "Three cases. Tab visible: the tab is focused. Tab in the background: switch to another app, then tap. Tab closed: close this tab, then tap, and a new tab should open (its log says it was opened by a click). Each notification stays until tapped.",
	  fill: ({ manager }) => row(() => {
		btn("Show now (tab focused)", () => manager.show({ title: "Tap me: focused", tag: "click", body: "tab focused when shown", requireInteraction: true }));
		btn("Show in 10 s (go background)", after(10, () => manager.show({ title: "Tap me: background", tag: "click", body: "shown after 10 s", requireInteraction: true })));
		btn("Show now, then close the tab", () => manager.show({ title: "Tap me: tab closed?", tag: "click", body: "close the tab, then tap", requireInteraction: true, data: { url: "/framework/lab/notifications/?from=closed" } }));
	}) },

	{ title: "Sound and vibration", note: "The page can ask for silence or a vibration pattern; Android's per-site and per-channel settings can override it. Compare what you feel and hear with what was asked.",
	  fill: ({ manager, log }) => row(() => {
		[["Default", {}], ["Silent", { silent: true }], ["Short buzz", { vibrate: [100] }], ["Long buzz", { vibrate: [600] }], ["SOS", { vibrate: [100, 50, 100, 50, 100, 150, 300, 50, 300, 50, 300, 150, 100, 50, 100, 50, 100] }], ["Silent + vibrate", { silent: true, vibrate: [300] }]]
			.forEach(([name, o]) => btn(name, () => { log.add("demo", `asked for ${name}: ${JSON.stringify(o)}`); manager.show({ title: name, tag: "sound", renotify: true, body: "sound/vibration test", ...o }); }));
	}) },
	{ title: "Push (stretch)", note: "A push arrives even when the tab is closed. Press Subscribe, then \"Send in 30 s\", then switch apps or close the tab and wait. Needs the dev server running (it sends the push) and an internet connection (Chrome's push service relays it).",
	  fill: ({ host, log }) => row(() => {
		let sub;
		const post = (url, body) => fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).then(async r => ({ ok: r.ok, ...(await r.json().catch(() => ({}))) }));
		btn("Subscribe", async () => {
			try {
				const { key } = await (await fetch("/push/key")).json();
				const bytes = Uint8Array.from(atob(key.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
				sub = await host.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: bytes });
				log.add("push", "subscribed: " + new URL(sub.endpoint).hostname + " -> server: " + JSON.stringify(await post("/push/subscribe", sub.toJSON())));
			} catch (error){ log.add("push", `subscribe failed: ${error.name}: ${error.message}`); }
		}, "btn prim");
		[5, 30, 60].forEach(s => btn(`Send in ${s} s`, async () => {
			if (!sub) return log.add("push", "press Subscribe first");
			log.add("push", `asked the server to push in ${s} s: ` + JSON.stringify(await post("/push/send", { endpoint: sub.endpoint, delay: s })));
		}));
	}) },
];
