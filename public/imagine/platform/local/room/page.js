import { Page, div, span, input, button } from "/app.js";

/* Container: /imagine/platform/local/'s one child. Size: `medium` — a status
   line, a growing log and one input row; nothing here wants more than a chat
   pane. Own layout: three stacked regions. Regions: one (content() draws all
   three). Preview: default card.

   RENDERS WITHOUT THE API. The socket is additive: /api/me failing leaves
   `me` anonymous, and a WebSocket that never opens (server down, or a ban
   refused it at connect — worker/room.js) leaves exactly one muted status
   line. Nothing else on the page depends on either succeeding.

   One Durable Object per url (data.md) — `/api/room?url=<this page's own
   pathname>` — so two tabs on THIS url are two sockets on the SAME room. */

export default new Page({
	meta: import.meta,
	title: "Room",
	description: "One Durable Object, two tabs — open this url twice and watch a message arrive in the other.",
	width: "medium",

	content(){
		this.messages = [];
		this.me = { anonymous: true };

		this.$status = div.c("local-room-status muted", "connecting…");
		this.$log = div.c("local-room-log flex v gap pad surface");

		div.c("local-room-compose flex gap", () => {
			this.$input = input.c("local-room-input flex-1").attr("type", "text").attr("placeholder", "Say something…");
			this.$send = button.c("local-room-send", "Send").click(() => this.send());
		});
		this.$input.on("keydown", e => { if (e.key === "Enter") this.send(); });

		this.whoAmI().then(() => this.connect());
	},

	async whoAmI(){
		try {
			this.me = await fetch("/api/me").then(r => r.json());
		} catch {
			this.me = { anonymous: true };
		}
		if (this.me.anonymous) this.$send.attr("disabled", "true");
	},

	connect(){
		const proto = location.protocol === "https:" ? "wss" : "ws";
		const ws = new WebSocket(`${proto}://${location.host}/api/room?url=${encodeURIComponent(location.pathname)}`);
		this.ws = ws;
		let opened = false;

		ws.addEventListener("open", () => {
			opened = true;
			this.$status.text(this.me.anonymous
				? "reading — sign in via the dev switch to post"
				: `connected as ${this.me.handle} (${this.me.roles?.[0]})`);
		});
		ws.addEventListener("message", e => {
			const data = JSON.parse(e.data);
			if (data.type === "message") { this.messages.push(data); this.redraw(); }
			if (data.type === "error") this.$status.text(`refused — ${data.error}`);
		});
		// A ban, or no server at all, both look like "never opened" from here —
		// the page cannot tell them apart, and does not need to (§1 of /notes/auth/).
		ws.addEventListener("close", () => {
			if (!opened) this.$status.text("offline — the room's socket did not connect");
		});
	},

	redraw(){
		this.$log.empty(() => {
			this.messages.forEach(m => {
				div.c("local-room-line", () => {
					span.c("local-room-author", m.author + ": ");
					span.c("local-room-text", m.text);
				});
			});
		});
	},

	send(){
		const text = this.$input.el.value.trim();
		if (!text || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
		this.ws.send(JSON.stringify({ text }));
		this.$input.el.value = "";
	},
});
