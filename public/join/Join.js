import { GoogleButton } from "/framework/ux/Auth/GoogleButton.js";
import { InAppBrowser } from "/framework/ux/Auth/InAppBrowser.js";
import { JoinState } from "./JoinState.js";
import { Funnel } from "./Funnel.js";

const el = (tag, cls = "", ...kids) => {
	const e = document.createElement(tag);
	if (cls) e.className = cls;
	for (const k of kids) if (k != null && k !== false) e.append(k);
	return e;
};
const btn = (cls, text, fn) => Object.assign(el("button", cls, text), { type: "button", onclick: fn });
const key_bytes = b64 => Uint8Array.from(atob(b64.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));

/**
 * Join: the /join/ landing page. One portrait video that never stops, the host's caption, and ONE button at the bottom
 * that changes: Continue with Google, then Allow one notification a week, then done. Words are in copy.js, the API is
 * `backend` (Backend or MockBackend). Page: readme.md. Built from ux/Auth: GoogleButton and InAppBrowser.
 *
 *   const join = new Join(document.getElementById("join"), copy);   // draws the video and caption at once
 *   join.start(await Backend.detect());                             // then signs in, reads /api/me, draws the button
 *
 * The state is derived, never stored: no user = "google" (or "inapp" inside another app's browser); a user without a
 * subscription = "allow"; a user with one and permission granted = "done". A reload therefore lands on the right one.
 */
export class Join {

	constructor(root, copy){
		this.root = root;
		this.copy = copy;
		this.env = new InAppBrowser();
		this.params = new URLSearchParams(location.search);
		this.user = null;
		this.push = false;
		this.draw();
	}

	// ---- the parts that never change -----------------------------------------------------------------

	draw(){
		const { copy } = this;
		this.$media = el("div", "media");
		if (copy.video) this.draw_video(); else this.$media.append(Object.assign(el("img", "still"), { src: copy.still, alt: "" }));
		this.$caption = el("p", "caption", copy.caption);
		this.$act = el("div", "act");
		this.$note = el("p", "note");
		this.$badge = el("span", "badge", "mock");
		this.$top = el("div", "top", this.$badge);
		this.$debug = el("pre", "debug");
		this.$sheet = el("div", "sheet-slot");
		this.frame = el("div", "frame", this.$media, el("div", "scrim"), this.$top, this.$debug, el("div", "over", this.$act, this.$note, this.$caption), this.$sheet);
		this.root.append(this.frame);
		this.$badge.hidden = true;
		this.$debug.hidden = !this.params.has("debug");
	}

	draw_video(){
		const { copy } = this;
		const video = this.$video = el("video", "video");
		Object.assign(video, { muted: true, loop: true, autoplay: true, playsInline: true, poster: copy.poster, src: copy.video });
		video.setAttribute("muted", ""); video.setAttribute("playsinline", "");
		const track = Object.assign(el("track"), { kind: "captions", src: copy.captions, default: true });
		video.append(track);
		track.addEventListener("load", () => track.track.mode = "hidden");
		track.track.mode = "hidden";   // our own caption box draws the cues
		track.track.addEventListener("cuechange", () => {
			const text = [...(track.track.activeCues || [])].map(c => c.text).join(" ");
			if (text) this.$caption.textContent = text;
		});
		this.$sound = btn("pill sound", "Tap for sound", () => {
			video.muted = !video.muted;
			this.$sound.textContent = video.muted ? "Tap for sound" : "Sound on";
			if (!video.muted) this.funnel.send("video_unmuted");
		});
		this.$media.append(video);
		addEventListener("pointerdown", () => video.paused && video.play().catch(() => {}), { once: true });
	}

	// ---- start, and the state that follows -----------------------------------------------------------

	async start(backend){
		this.backend = backend;
		this.funnel = new Funnel(backend, this.env, this.params);
		this.$badge.hidden = !backend.mock;
		if (this.$sound) this.$top.prepend(this.$sound);
		if ("serviceWorker" in navigator) navigator.serviceWorker.register("/join/sw.js", { scope: "/join/" }).catch(err => this.say(err.message, true));
		this.google = new GoogleButton({ theme: "dark", on_video: true, client_id: backend.client_id, label: GoogleButton.labels[2] });
		this.google.el.addEventListener("signin", e => this.signed_in(e.detail.user, e.detail.mock, e.detail.email));
		// Google's own button lives in a cross-origin iframe, which never bubbles its own click — but a pointerdown that
		// lands on the iframe's box still fires on this ancestor first, so this is the only tap we can see.
		this.google.el.addEventListener("pointerdown", () => this.funnel.send("tap_google"), { capture: true });
		this.funnel.send("view");
		await this.refresh();
	}

	async refresh(){
		try { Object.assign(this, { push: false, user: null }, await this.backend.me()); }
		catch (err){ this.say(this.copy.failed + " " + err.message, true); }
		this.render();
	}

	get permission(){ return "Notification" in window ? Notification.permission : "unsupported"; }
	get subscribed(){ return this.push && this.permission === "granted"; }
	get state(){ return JoinState.of({ user: this.user, in_app: this.env.in_app, push: this.push, permission: this.permission }); }

	render(){
		const state = this.state;
		this.frame.dataset.state = state;
		this.say("");
		this.$act.replaceChildren(...this[`act_${state}`]());
		this.$top.querySelector(".avatar")?.remove();
		if (this.user) this.$top.append(this.avatar());
		this.show_debug();
	}

	say(text, bad = false){
		this.$note.textContent = text;
		this.$note.classList.toggle("bad", bad);
	}

	// The Worker keeps no email, so the one Google gave us at sign-in is remembered on this device only, for revoke().
	signed_in(user, mock, email){
		if (email) localStorage.setItem("join-google-email", email);
		if (mock){
			// A real Worker with no Google client id (production today) has no fake sign-in to fall back on.
			if (!this.backend.mock) return this.say(this.copy.not_set_up, true);
			this.backend.login(user);
		}
		this.funnel.send("signed_in");
		return this.refresh();
	}

	// ---- the four button states ----------------------------------------------------------------------

	act_google(){
		const { copy, backend } = this;
		return [
			this.google.el,
			btn("link", copy.google_note, () => { this.funnel.send("not_working"); this.inapp_sheet(); }),
			backend.mode === "test" && btn("pill test", copy.test_signin, () => this.test_signin()),
		].filter(Boolean);
	}

	act_inapp(){
		return [this.inapp_card(), this.backend.mode === "test" && btn("pill test", this.copy.test_signin, () => this.test_signin())].filter(Boolean);
	}

	act_allow(){
		const { copy } = this;
		return [btn("main", copy.allow_button, () => { this.funnel.send("tap_allow"); this.allow(); }), el("p", "small", copy.allow_note)];
	}

	act_done(){
		const { copy } = this;
		return [el("p", "title", copy.done_title), btn("main", copy.done_test, () => this.test_push())];
	}

	async test_signin(){
		try { await this.backend.login_test(); this.funnel.send("signed_in"); await this.refresh(); }
		catch (err){ this.say(`${this.copy.failed} ${err.message}`, true); }
	}

	// ---- allow notifications -------------------------------------------------------------------------

	// iPhone only allows push from a page added to the Home Screen; any iOS browser in a tab is the same.
	get needs_home_screen(){ return this.env.ios && !InAppBrowser.standalone(); }

	async allow(){
		const { copy, backend } = this;
		if (this.needs_home_screen) return this.ios_sheet();
		if (!("Notification" in window) || !("serviceWorker" in navigator) || (!backend.mock && !("PushManager" in window))) return this.say(copy.unsupported, true);
		try {
			const permission = await Notification.requestPermission();
			if (permission !== "granted") return this.say(copy.blocked, true);
			const reg = await navigator.serviceWorker.ready;
			if (backend.mock) await backend.subscribe();
			else {
				if (!backend.vapid_public) throw new Error("the server has no push key yet");
				const timeout = new Promise((_, no) => setTimeout(() => no(new Error("the browser's push service did not answer in 15 s")), 15000));
				const sub = await Promise.race([reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key_bytes(backend.vapid_public) }), timeout]);
				await backend.subscribe(sub.toJSON());
			}
			this.push = true;
			this.funnel.send("subscribed");
			this.render();
		} catch (err){
			this.say(`${copy.failed} ${err.message}`, true);
		}
	}

	async test_push(){
		this.funnel.send("test_push");
		this.say("…");
		try {
			const res = await this.backend.push_test();
			const codes = (res.results || []).map(r => `${r.host} ${r.status}`).join(", ");
			if (res.sent === 0) this.say(`${this.copy.failed} the push service refused it${codes ? ` (${codes})` : ""}.`, true);
			else this.say(this.copy.done_sent + (codes ? ` (${codes})` : ""));
		} catch (err){
			this.say(`${this.copy.failed} ${err.message}`, true);
		}
	}

	async browser_sub(){
		const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration("/join/") : null;
		return reg ? reg.pushManager.getSubscription() : null;
	}

	async unsubscribe(){
		const sub = await this.browser_sub();
		await sub?.unsubscribe();
		await this.backend.unsubscribe(sub?.endpoint);
	}

	// ---- sheets: in-app card, add to Home Screen, settings -------------------------------------------

	sheet(title, ...nodes){
		const close = () => this.$sheet.replaceChildren();
		this.$sheet.replaceChildren(el("div", "sheet-wrap",
			Object.assign(el("div", "backdrop"), { onclick: close }),
			el("div", "sheet", title && el("h2", "", title), ...nodes, btn("link dark", this.copy.close, close))));
		return close;
	}

	inapp_card(){
		const { copy, env } = this, url = JoinState.share_url(location.href);
		const steps = env.ios ? el("ol", "steps", ...copy.inapp_ios.map(s => el("li", "", s))) : null;
		this.funnel.send("inapp_card_shown");
		return el("div", "card",
			el("h2", "", copy.inapp_title),
			el("p", "", copy.inapp_why),
			env.android && Object.assign(el("a", "main link-btn", copy.inapp_android), { href: env.intent_url(url) }),
			steps,
			el("p", "small", copy.inapp_other),
			el("div", "row",
				btn("pill dark", copy.copy_link, async e => { this.funnel.send("copy_link"); await navigator.clipboard?.writeText(url).catch(() => {}); e.target.textContent = copy.copied; }),
				navigator.share && btn("pill dark", copy.share_link, () => { this.funnel.send("share"); navigator.share({ url, title: document.title }).catch(() => {}); })));
	}

	inapp_sheet(){ this.sheet(null, this.inapp_card()); }

	ios_sheet(){
		const { copy } = this;
		this.funnel.send("ios_sheet_shown");
		this.sheet(copy.ios_title, el("p", "", copy.ios_why), el("ol", "steps", ...copy.ios_steps.map(s => el("li", "", s))));
	}

	avatar(){
		const user = this.user, name = user.name || user.handle || "?";
		return btn("avatar", user.avatar_url ? Object.assign(el("img"), { src: user.avatar_url, alt: "", referrerPolicy: "no-referrer" }) : name[0].toUpperCase(), () => this.settings_sheet());
	}

	settings_sheet(){
		const { copy } = this, user = this.user;
		const confirm = el("div", "confirm");
		const ask = () => confirm.replaceChildren(el("p", "", copy.delete_confirm),
			el("div", "row", btn("pill danger", copy.delete_yes, () => this.delete_account(close)), btn("pill dark", copy.cancel, () => confirm.replaceChildren())));
		const close = this.sheet(copy.settings_title,
			el("p", "who", `${copy.signed_in_as} `, el("b", "", user.name || user.handle)),
			btn("wide", copy.sign_out, () => this.sign_out(close)),
			this.subscribed && btn("wide", copy.notifications_off, () => this.notifications_off(close)),
			btn("wide danger", copy.delete_account, ask),
			confirm);
	}

	async sign_out(close){
		try { await this.backend.logout(); this.funnel.send("signed_out"); } catch (err){ this.say(`${this.copy.failed} ${err.message}`, true); }
		globalThis.google?.accounts?.id?.disableAutoSelect();
		close(); await this.refresh();
	}

	async notifications_off(close){
		try { await this.unsubscribe(); } catch (err){ this.say(`${this.copy.failed} ${err.message}`, true); }
		close(); await this.refresh();
	}

	async delete_account(close){
		try {
			await this.unsubscribe().catch(() => {});
			const email = localStorage.getItem("join-google-email");
			await this.backend.delete_me();
			this.funnel.send("deleted");
			localStorage.removeItem("join-google-email");
			// Revoking needs the Google SDK initialised, which only a real client id does.
			if (this.backend.client_id && email) globalThis.google?.accounts?.id?.revoke(email, () => {});
		} catch (err){ this.say(`${this.copy.failed} ${err.message}`, true); }
		close(); await this.refresh();
	}

	// ---- ?debug=1 ------------------------------------------------------------------------------------

	async show_debug(){
		if (!this.params.has("debug")) return;
		const { env, backend } = this, sub = await this.browser_sub().catch(() => null);
		const rows = {
			mode: backend.mode, "in-app": env.in_app ? `yes (${env.app})` : "no", platform: env.ios ? "iOS" : env.android ? "Android" : "other",
			standalone: InAppBrowser.standalone(), permission: this.permission, "push supported": "PushManager" in window,
			"signed in": this.user ? `yes, id ${this.user.id ?? "?"}` : "no", "subscription (browser)": !!sub, "subscription (server)": this.push, state: this.state,
		};
		this.$debug.replaceChildren(Object.entries(rows).map(([k, v]) => `${k}: ${v}`).join("\n"), "\n", btn("pill danger", "Reset everything", () => this.reset()));
	}

	async reset(){
		try { await this.backend.logout(); } catch {}
		await this.unsubscribe().catch(() => {});
		globalThis.google?.accounts?.id?.disableAutoSelect();
		for (const reg of await navigator.serviceWorker?.getRegistrations?.() ?? []) await reg.unregister();
		Funnel.reset();
		for (const store of [localStorage, sessionStorage])
			for (const key of Object.keys(store)) if (key.startsWith("join-")) store.removeItem(key);
		location.reload();
	}
}

export default Join;
