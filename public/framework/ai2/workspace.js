/*
 * THE WORKSPACE VIEW — an experiment, off by default (the owner, 2026-09-28: "the inbox looks a
 * little cramped… letting it breathe like that might work, but maybe we can test that").
 *
 * On, an opened card's detail area is a Floating page (floating.js): the card's tabs and
 * sub-cards as a left nav, the page centred beside it. Off, nothing changes.
 *
 * The switch is the url: `?view=workspace`. It is read once, when this module loads, and the
 * rail's `workspace` word flips it with a full navigation (the one transition that is always
 * allowed), so a card never has to redraw from one layout to the other. While it is on, every
 * AI 2 link you click carries it on (`keep()`), and so does every navigation AI 2 makes itself
 * (`url()`). Back to a url without it reloads, so the url is always the truth.
 */
const ROOT = "/framework/ai2/";
const read = () => new URLSearchParams(location.search).get("view") === "workspace";

export const workspace = {
	on: read(),

	/** An AI 2 address with the switch carried on, when it is on. */
	url(u){
		if (!this.on) return u;
		const x = new URL(u, location.origin);
		if (x.pathname.startsWith(ROOT)) x.searchParams.set("view", "workspace");
		return x.pathname + x.search + x.hash;
	},

	/** Where the `workspace` word goes: this page, with the switch flipped. */
	flipped(){
		const x = new URL(location.href);
		this.on ? x.searchParams.delete("view") : x.searchParams.set("view", "workspace");
		return x.pathname + x.search + x.hash;
	},

	/** A click on an AI 2 link, before the Router reads it: the link keeps the switch. */
	keep(e){
		if (!this.on) return;
		const link = e.target.closest?.("a[href]");
		if (!link || link.origin !== location.origin || !link.pathname.startsWith(ROOT)) return;
		const x = new URL(link.href);
		if (x.searchParams.get("view")) return;
		x.searchParams.set("view", "workspace");
		link.search = x.search;
	},
};

addEventListener("popstate", () => { if (read() !== workspace.on) location.reload(); });

export default workspace;
