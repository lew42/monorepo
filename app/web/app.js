// The auth app's UI. Plain View classes from the framework (staged beside this file by scripts/stage.mjs).
import { docs_page, doc_page } from "/docs.js";
import { View, div, h2, h3, p, span, a, button, img, table, thead, tbody, tr, th, td } from "/framework/core/View/View.js";

const api = async (path, body, method = "POST") => {
	const res = await fetch("/api" + path, body === undefined ? {} : { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.error || "HTTP " + res.status);
	return data;
};

const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const ios = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const when = ms => new Date(ms).toLocaleString();

let gsi;
const load_google = () => gsi ??= new Promise((ok, no) => {
	const s = document.createElement("script");
	s.src = "https://accounts.google.com/gsi/client";
	s.onload = ok; s.onerror = () => no(new Error("could not load Google sign-in (offline?)"));
	document.head.append(s);
});

class InstallButton extends View {
	render(){
		if (standalone()) return;
		if (ios()) return this.append(div.c("hint", "To install on iPhone: tap the Share icon, then “Add to Home Screen”."));
		addEventListener("beforeinstallprompt", e => {
			e.preventDefault();
			this.empty(button.c("primary", "Install app").click(async () => { e.prompt(); await e.userChoice; this.empty(); }));
		});
	}
}

class Bell extends View {
	render(){
		this.append(button.c("bell", "🔔").attr("title", "Notifications").click(async () => {
			if (!("Notification" in window)) return alert("This browser has no notifications. On iPhone, install the app first (Share → Add to Home Screen).");
			const perm = await Notification.requestPermission();
			if (perm !== "granted") return alert("Notifications are " + perm + ". Allow them in the browser's site settings.");
			const reg = await navigator.serviceWorker.ready;
			reg.showNotification("lew42 app", { body: "Notifications work on this device.", icon: "/icons/icon-192.png", tag: "test" });
		}));
	}
}

class App extends View {
	// no class fields here: View runs render() inside super(), before a subclass's fields exist
	async render(){
		this.state = { user: null, config: {}, path: location.pathname };
		this.bar = div.c("topbar");
		this.main = new View({ tag: "main" });
		this.append(this.bar, this.main);
		addEventListener("popstate", () => this.go(location.pathname, false));
		this.state.config = await api("/config");
		this.state.user = (await api("/me")).user;
		this.go(location.pathname, false);
	}

	async load_settings(){
		this.state.settings = (await api("/settings")).settings;
		document.documentElement.dataset.theme = this.state.settings.theme || "auto";
	}

	go(path, push = true){
		if (push) history.pushState({}, "", path);
		this.state.path = path;
		this.draw();
	}

	link(path, label, cls = "nav"){
		return a.c(cls + (this.state.path === path ? " on" : ""), label).href(path).on("click", e => { e.preventDefault(); this.go(path); });
	}

	draw(){
		const { user, path } = this.state;
		if (user && !this.state.settings){ this.state.settings = {}; this.load_settings().then(() => this.draw()); }
		this.bar.empty(this.link("/", "lew42", "brand"));
		if (user){
			this.bar.append(this.link("/", "Home"), this.link("/docs", "Docs"), this.link("/profile", "Profile"));
			if (user.role === "admin") this.bar.append(this.link("/admin", "Admin"));
			this.bar.append(new Bell(), new InstallButton());
			this.bar.append(user.avatar_url ? img.c("avatar").attr("src", user.avatar_url).attr("referrerpolicy", "no-referrer").attr("alt", "") : span(user.name || user.email));
			this.bar.append(button("Sign out").click(() => this.sign_out()));
		} else {
			this.bar.append(new Bell(), new InstallButton());
		}
		const page = !user ? this.login_page() : path === "/docs" ? docs_page(this, api) : path.startsWith("/doc/") ? doc_page(this, api, path.slice(5)) : path === "/profile" ? this.profile_page() : path === "/admin" ? this.admin_page() : this.home_page();
		this.main.empty(page);
	}

	login_page(){
		const holder = div.c("center", h2("Sign in"), p.c("muted", "Use your Google account."));
		const note = p.c("error", "");
		holder.append(note);
		const { config } = this.state;
		if (!config.client_id) note.text("Google sign-in is not configured yet (no client id).");
		else load_google().then(() => {
			google.accounts.id.initialize({ client_id: config.client_id, auto_select: false, callback: async res => {
				try { this.state.user = (await api("/auth/google", { credential: res.credential })).user; this.go("/", false); }
				catch (err){ note.text(err.message); }
			} });
			const slot = div();
			holder.append(slot);
			google.accounts.id.renderButton(slot.el, { theme: "outline", size: "large", text: "signin_with", shape: "pill" });
		}).catch(err => note.text(err.message));
		if (config.dev_login){
			const dev = div.c("dev", p.c("muted", "Local dev only: sign in without Google"));
			["admin", "alice", "bob"].forEach(h => dev.append(button("dev: " + h).click(async () => { this.state.user = (await api("/dev/login", { handle: h })).user; this.go("/", false); })));
			holder.append(dev);
		}
		return holder;
	}

	home_page(){
		const list = div(p.c("muted", "Loading…"));
		api("/feed").then(({ items }) => list.empty(items.map(i => div.c("card", h3(i.title), p(i.body), span.c("muted", when(i.at)))))).catch(e => list.empty(p.c("error", e.message)));
		return div(h2("Home"), p.c("muted", "Hello, " + (this.state.user.name || this.state.user.email) + ". Here is your feed."), list);
	}

	settings_card(){
		const mine = this.state.settings || {};
		const pick = div.c("row");
		["auto", "light", "dark"].forEach(t => pick.append(button.c(mine.theme === t || (!mine.theme && t === "auto") ? "primary" : "", t).click(async () => {
			this.state.settings = (await api("/settings", { theme: t }, "PUT")).settings;
			document.documentElement.dataset.theme = t;
			this.draw();
		})));
		return div.c("card", h3("Your settings"), p.c("muted", "Saved in your own Durable Object, so they follow you to every device."), pick);
	}

	profile_page(){
		const u = this.state.user;
		const row = (k, v) => tr(th(k), td(v ?? "—"));
		return div(h2("Profile"), table(tbody(row("Name", u.name), row("Email", u.email), row("Role", u.role), row("Member since", when(u.created_at)), row("Last login", when(u.last_login)), row("Google id", u.google_sub), row("Stage", this.state.config.env))), this.settings_card());
	}

	admin_page(){
		const out = div(p.c("muted", "Loading…"));
		api("/admin/users").then(({ users }) => out.empty(table(
			thead(tr(th("Name"), th("Email"), th("Role"), th("Last login"))),
			tbody(users.map(u => tr(td(u.name || ""), td(u.email), td(u.role), td(when(u.last_login)))))
		))).catch(e => out.empty(p.c("error", e.message)));
		return div(h2("Users"), out);
	}

	async sign_out(){
		await api("/auth/logout", {});
		if (window.google?.accounts) google.accounts.id.disableAutoSelect();
		this.state.user = null; this.state.settings = null;
		document.documentElement.dataset.theme = "auto";
		this.go("/");
	}
}

new App({ el: document.getElementById("app"), capture: false });

if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");
