import { View } from "/app.js";
import { md_into } from "./md.js";
import { place_card } from "./Chat.js";

View.stylesheet(import.meta, "Chat.css");

/**
 * DRILL IN — a chat card opened as its own small page (the owner, 2026-09-29:
 * "the sheet could then go full screen and kind of become like a shell in and
 * of itself with paging within it"). Full story: `doc/drill.md`.
 *
 *     const drill = new ChatDrill({ panel, session: "s1" });
 *     drill.open(card);      // card = chat().card(at) — pushes #chat=s1~<at>
 *     drill.check();         // after each sync: re-opens the level a reloaded url names
 *
 * A CARD IS A TINY PAGE: `{ key, title, text, place, children }`, built by
 * `Chat.js`'s `card_of()`. The shell shows one card at a time: a header (Back,
 * the path above it, its title) and its children as cards. A child that has
 * children of its own opens one level deeper, in the same shell.
 *
 * ROUTED: the level is the url hash, `#chat=<session>~<key>/<key>…`. Opening
 * a level pushes a history entry; Back, Esc and the browser's back all return
 * one level; the hash emptied of `chat=` closes the shell. `location.search`
 * (the sheet's own `?sheet=`, another task's) is never touched.
 */
const PREFIX = "chat=";

export function drill_hash(session, path){
	return "#" + PREFIX + encodeURIComponent(session) + "~" + path.map(encodeURIComponent).join("/");
}
export function parse_hash(hash = location.hash){
	const h = hash.replace(/^#/, "");
	if (!h.startsWith(PREFIX)) return null;
	const [session, rest = ""] = h.slice(PREFIX.length).split("~");
	return { session: decodeURIComponent(session), path: rest.split("/").filter(Boolean).map(decodeURIComponent) };
}

const plain = t => String(t).replace(/[*_`]+/g, "");
const el = (cls, tag = "div") => Object.assign(document.createElement(tag), { className: cls });

export class ChatDrill {
	constructor({ panel, session }){
		Object.assign(this, { panel, session, path: [], pushed: 0, box: null });
		this.pending = parse_hash()?.session === session ? parse_hash().path : null;
		this.on_pop = () => this.route();
		this.on_key = e => { if (e.key === "Escape" && this.box){ e.stopPropagation(); this.back(); } };
		addEventListener("popstate", this.on_pop);
	}

	/** The panel's own chat — `card(at)` finds a top-level card by its key. */
	card(path){
		let node = this.panel.talk.card(path[0]);
		for (const key of path.slice(1)) node = node?.children.find(c => c.key === key);
		return node ?? null;
	}

	/** A reload that landed on `#chat=…`: open that level once its card exists. */
	check(){
		const path = this.pending;
		if (!path) return;
		// The whole path first: a refined line (the sections a deeper key names)
		// can land after the card itself, so opening the moment the card exists
		// lands one level short. Only if the path never resolves, after a beat,
		// open the deepest level that does.
		if (this.card(path)){ this.pending = null; clearTimeout(this.fallback); return this.show(path); }
		if (this.fallback || !this.card(path.slice(0, 1))) return;
		this.fallback = setTimeout(() => {
			if (!this.pending) return;
			this.pending = null;
			let n = path.length;
			while (n > 1 && !this.card(path.slice(0, n))) n--;
			history.replaceState(history.state, "", location.pathname + location.search + drill_hash(this.session, path.slice(0, n)));
			this.show(path.slice(0, n));
		}, 1500);
	}

	/** Open a top-level card (the "Open" button). */
	open(card){ this.go([card.key]); }

	/** One level deeper, or anywhere: a history entry per level. */
	go(path){
		history.pushState(history.state, "", location.pathname + location.search + drill_hash(this.session, path));
		this.pushed++;
		this.show(path);
	}

	/** Back one level. Only pops history we pushed ourselves — a reload that
	 *  landed deep has nothing of ours to pop, so it steps up in place. */
	back(){
		if (this.pushed > 0) return history.back();   // route() does the rest
		const up = this.path.slice(0, -1);
		history.replaceState(history.state, "", location.pathname + location.search + (up.length ? drill_hash(this.session, up) : ""));
		up.length ? this.show(up) : this.close();
	}

	/** The url changed under us (browser back/forward). */
	route(){
		if (!this.panel.el.isConnected){ removeEventListener("popstate", this.on_pop); return this.close(); }
		const h = parse_hash(), depth = h?.session === this.session ? h.path.length : 0;
		// Our own pushes, counted by how far the url moved (Back, the browser back,
		// forward): only ever pop what we pushed.
		this.pushed = Math.max(0, this.pushed + depth - this.path.length);
		if (this.leaving && this.pushed === 0){
			this.leaving = false;
			if (depth) history.replaceState(history.state, "", location.pathname + location.search);
			return this.close();
		}
		if (h?.session === this.session && h.path.length && this.card(h.path)) this.show(h.path);
		else if (this.box) this.close();
	}

	/* WHERE THE SHELL GOES — one rule, here. Inside the desktop drawer (and not
	   the phone's ✦ sheet): over the whole `.drawer`, its full height, so the
	   page stays beside it. Anywhere else (the sheet, a page): the whole screen.
	   The alternative for desktop, the page's own main area, was not taken: the
	   chat you drilled from would disappear from beside the page you asked about. */
	mount_point(){
		const el = this.panel.el;
		if (!el.closest(".drawer-rail-sheet")){
			const drawer = el.closest(".drawer");
			if (drawer) return { parent: drawer, cls: "chatbox-drill-in-drawer" };
		}
		return { parent: document.body, cls: "" };
	}

	show(path){
		const card = this.card(path);
		if (!card) return this.close();
		this.path = path;
		if (!this.box){
			const { parent, cls } = this.mount_point();
			this.box = el("chatbox-drill " + cls);
			this.box.setAttribute("role", "dialog");
			parent.append(this.box);
			addEventListener("keydown", this.on_key, true);
		}
		this.box.replaceChildren(this.head(path, card), this.body(path, card));
		this.box.querySelector(".chatbox-drill-back")?.focus({ preventScroll: true });
	}

	head(path, card){
		const head = el("chatbox-drill-head");
		const back = el("chatbox-drill-back", "button");
		back.type = "button"; back.textContent = "← Back"; back.title = path.length > 1 ? "up one level" : "back to the chat";
		back.addEventListener("click", () => this.back());
		const crumbs = el("chatbox-drill-crumbs");
		const chat = el("chatbox-drill-crumb", "button");
		chat.type = "button"; chat.textContent = "Chat";
		chat.addEventListener("click", () => this.leave());
		crumbs.append(chat);
		path.slice(0, -1).forEach((_, i) => {
			const up = path.slice(0, i + 1), b = el("chatbox-drill-crumb", "button");
			b.type = "button"; b.textContent = plain(this.card(up)?.title ?? "…");
			b.addEventListener("click", () => this.go(up));
			crumbs.append(" › ", b);
		});
		// A div, not an h2: the site layer styles h2 (a display size), and it beats
		// this theme-layer class at any specificity.
		const title = el("chatbox-drill-title");
		title.setAttribute("role", "heading"); title.setAttribute("aria-level", "2");
		md_into(title, card.title, true);
		const words = el("chatbox-drill-heading");
		words.append(crumbs, title);
		head.append(back, words);
		return head;
	}

	body(path, card){
		const body = el("chatbox-drill-body");
		const page = el("chatbox-drill-page");
		if (card.text && !card.children.length) page.append(md_into(el("chatbox-drill-text md"), card.text));
		if (card.place) page.append(place_card(card.place));
		card.children.forEach(child => page.append(this.tile(path, child)));
		if (!page.children.length) page.append(Object.assign(el("muted"), { textContent: "Nothing inside." }));
		body.append(page);
		return body;
	}

	/** One child as a card: its words (or its placed module); a "›" and a count
	 *  when it opens deeper. A leaf is not clickable. */
	tile(path, child){
		const deep = child.children.length > 0;
		const t = el("chatbox-drill-card" + (deep ? " chatbox-drill-deep" : ""), deep ? "button" : "div");
		if (deep){ t.type = "button"; t.addEventListener("click", () => this.go([...path, child.key])); }
		if (child.place) t.append(place_card(child.place));
		else t.append(md_into(el("chatbox-drill-text md"), child.text ?? child.title));
		if (deep){
			const more = el("chatbox-drill-more", "span");
			more.textContent = child.children.length + " inside ›";
			t.append(more);
		}
		return t;
	}

	/** "Chat" crumb: out of the shell altogether, back to the normal sheet. */
	leave(){
		if (this.pushed > 0){ this.leaving = true; return history.go(-this.pushed); }
		history.replaceState(history.state, "", location.pathname + location.search);
		this.close();
	}

	close(){
		this.box?.remove();
		this.box = null; this.path = [];
		removeEventListener("keydown", this.on_key, true);
	}
}

export default ChatDrill;
