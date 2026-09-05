/* ── THE CONFIGURATION LIVES IN THE URL ────────────────────────────────────────

   A page in this realm is seven words (`blocks.js`). Those seven words are worth
   100,800 different pages, and until now you could reach them all by clicking and
   send none of them to anybody: nothing wrote what you had picked into the address
   bar, so a shape you found was gone the moment you refreshed.

   This file is the seam that fixes it, and it is three functions:

       from_url(base, url) on mount — the words in `?…` win over the page's own
       write_url(...)     on every change — one `history.replaceState`
       link_for(...)      the address, for the drawer's "copy this link"

   So a preset is a bookmark, `nest` is linkable, and a shape nobody anticipated can
   be pasted into a message. Nothing is stored: a url is not persistence, and a demo
   with no url in it still resets on refresh (decision 4, 2026-09-05).

   ⚠ IMPORTS ONLY DATA — `blocks.js` and `presets.js`, both of which import nothing.
     `stage.js` and `paging.js` both use this, so it has to sit under both of them. */

import { CONTROLS, values_for } from "./blocks.js";
import { PRESETS } from "./presets.js";

/* ⚠ THE ENTRY QUERY, READ ONCE, AT MODULE LOAD — which is the cold load. core's
     Router navigates by the link's PATHNAME alone and pushes the new address AFTER
     the page has drawn, so `location.search` read later is never a reliable answer
     (`/framework/core/new/1/agents/urls/`, "one thing the Router does owe"). Read it
     here, hold it, and hand it only to the page it names. */
const ENTRY = { path: location.pathname, params: new URLSearchParams(location.search) };

/* ── AND THE SAME QUESTION FOR A LINK YOU CLICK ───────────────────────────────

   A cold load is not the only way to arrive at a configured page: `cross/` links its
   nine cells to `/imagine/paging/?navigation=…&arrangement=…`, and the drawer hands
   out addresses exactly like it. Clicked INSIDE the app, those did nothing — the
   query was dropped and the hub opened on its own words (measured 2026-09-05).

   The reason is the same one `from_url()` explains below: core's Router navigates by
   the link's PATHNAME and pushes the whole address AFTER the page has drawn, so a
   page being built mid-navigation cannot read its own query out of `location`. The
   answer is to read it off THE LINK THAT WAS CLICKED, before the Router gets it.

   ⚠ CAPTURE PHASE. The Router listens on `document` in the bubble phase, so a capture
     listener here runs first and the query is recorded before the navigation starts.
   ⚠ EVERY same-origin link, not only the ones with a query. A rail link back to
     `/imagine/paging/` has no query and MUST clear what a cross cell left behind,
     or the hub would keep re-opening on words you navigated away from. */
let CLICKED = null;

document.addEventListener("click", event => {
	const link = event.target?.closest?.("a[href]");
	if (!link || link.origin !== location.origin) return;
	CLICKED = { path: link.pathname, params: new URLSearchParams(link.search) };
}, true);

// The query that belongs to THIS page: the one on the link that brought you here, or
// the one the browser was opened with. Never "whatever is in the address bar now".
const entry_for = path => (CLICKED?.path === path ? CLICKED : ENTRY.path === path ? ENTRY : null);

/* THE WORDS THIS PAGE OPENS ON: its own, with anything in `?…` written over them.
   A value that is not in that word's list is ignored, so `?room=banana` opens the
   page rather than a broken one.

   ⚠ THE GUARD IS THE PAGE'S OWN URL, not `location.pathname`, and not "the first
     stage to ask". Both of those were tried here on 2026-09-05 and both are wrong:

       first-to-ask   the app's home page is BUILT on every cold load, even when a
                      deep child is what you opened (it is hidden by CSS, not
                      skipped) — so the hub's invisible stage ate the query and the
                      page you actually asked for got none of it.
       location       core's Router loads the next page and pushes its address
                      AFTERWARDS, so during a client-side navigation
                      `location.pathname` is still the page you just LEFT. Every
                      stage you navigated to inherited the previous page's words.

     A page's own `url` is neither: it is decided when the page is added and it is
     never the address bar's opinion. `?…` applies to the page the entry url names,
     and to nothing else. */
/* ⚠ `nest: undefined` MEANS "THE ADDRESS SAYS NOTHING ABOUT IT" and `nest: null`
     means "the address says there is none". They are different answers and the
     caller needs both: without the difference, clicking a nested page OFF could not
     be sent — the key was simply absent, so a refresh put the page's own nest back
     (paging-audit-4b, fix 6). `stage.js` reads `undefined` as "keep my own". */
export function from_url(base, path){
	const entry = path && entry_for(path);
	if (!entry) return { config: { ...base }, nest: undefined };

	const config = { ...base };

	CONTROLS.forEach(({ axis, key }) => {
		// The label's word first, the old key second: every link written before
		// 2026-09-05 says `?surface=tint`, and those still have to open.
		const value = entry.params.get(key) ?? entry.params.get(axis);
		if (value && values_for(axis).some(word => word.id === value)) config[axis] = value;
	});

	return {
		config,
		nest: entry.params.has("nest") ? nest_of(entry.params.get("nest")) : undefined,
	};
}

/* ── `?nest=` TAKES ANY PAGE ───────────────────────────────────────────────────
   A preset id (`?nest=dashboard`), a preset's own address, or the url of a page you
   MADE (`?nest=/imagine/paging/make/notes/`). It used to take a preset id and
   nothing else, so the twelve ready-made pages were the only things that could go
   inside a page and the page you had just made could not — which is the owner's
   sentence "put any page inside any other" unmet (paging-audit-4).

   A preset answers with its seven words, here and now. Any other url answers with a
   PROMISE — `{ url }` and no words — and `stage.js` fetches that page's `page.json`
   when it draws the box. Reading a file is not this file's job. */
export const nest_of = value => {
	if (!value) return null;

	const preset = PRESETS.find(entry => entry.id === value);
	if (preset) return { ...preset.config, id: preset.id, title: preset.title };

	if (!value.startsWith("/")) return null;

	// A preset's own address is still that preset — one nested page, not two ideas.
	const library = value.match(/^\/imagine\/paging\/library\/([^/]+)\/?$/);
	if (library) return nest_of(library[1]);

	return { id: value, url: value, title: title_from(value) };
};

// "…/make/notes/today/" → "today". The page's real title arrives with its file.
const title_from = url => url.replace(/\/+$/, "").split("/").pop() || "that page";

/* ONLY WHAT YOU CHANGED. A preset's url stays clean until you touch a control, and
   then the query says exactly which words you moved — which is also what makes the
   link readable when you paste it to somebody.

   ⚠ `base_nest` IS WHY TAKING A NEST OUT IS SENDABLE. On a page that ships with a
     nested page, "none" is a change from the page's own words, so it has to be said
     out loud: `?nest=` with nothing after it. Leaving the key out said nothing, and
     a refresh brought the nested page back (measured, paging-audit-4b). */
export function query_for(config, base, nest, base_nest){
	const params = new URLSearchParams();

	CONTROLS.forEach(({ axis, key }) => { if (config[axis] !== base?.[axis]) params.set(key, config[axis]); });

	if (nest?.id) params.set("nest", nest.id);
	else if (base_nest?.id) params.set("nest", "");

	return params.toString();
}

export const link_for = (config, base, nest, base_nest) =>
	location.origin + location.pathname + suffix(query_for(config, base, nest, base_nest));

/* ⚠ `replaceState`, NEVER `pushState`. Changing a colour is not a navigation: a push
     would put every swatch you tried into the Back button, and the way out of the
     page would be twenty presses away. Replace keeps one entry and keeps it true. */
export function write_url(config, base, nest, base_nest){
	const query = query_for(config, base, nest, base_nest);
	history.replaceState(history.state, "", location.pathname + suffix(query) + location.hash);
	return query;
}

const suffix = query => (query ? "?" + query : "");

export default from_url;
