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

const AXES = CONTROLS.map(control => control.axis);

/* ⚠ THE ENTRY QUERY, READ ONCE, AT MODULE LOAD — which is the cold load. core's
     Router navigates by the link's PATHNAME alone and pushes the new address AFTER
     the page has drawn, so `location.search` read later is never a reliable answer
     (`/framework/core/new/1/agents/urls/`, "one thing the Router does owe"). Read it
     here, hold it, and hand it only to the page it names. */
const ENTRY = { path: location.pathname, params: new URLSearchParams(location.search) };

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
export function from_url(base, path){
	if (!path || path !== ENTRY.path) return { config: { ...base }, nest: null };

	const config = { ...base };

	AXES.forEach(axis => {
		const value = ENTRY.params.get(axis);
		if (value && values_for(axis).some(entry => entry.id === value)) config[axis] = value;
	});

	return { config, nest: nest_of(ENTRY.params.get("nest")) };
}

// `?nest=dashboard` — a whole second page, running inside this one's box.
export const nest_of = id => {
	const preset = PRESETS.find(entry => entry.id === id);
	return preset ? { ...preset.config, id: preset.id, title: preset.title } : null;
};

/* ONLY WHAT YOU CHANGED. A preset's url stays clean until you touch a control, and
   then the query says exactly which words you moved — which is also what makes the
   link readable when you paste it to somebody. */
export function query_for(config, base, nest){
	const params = new URLSearchParams();

	AXES.forEach(axis => { if (config[axis] !== base?.[axis]) params.set(axis, config[axis]); });
	if (nest?.id) params.set("nest", nest.id);

	return params.toString();
}

export const link_for = (config, base, nest) =>
	location.origin + location.pathname + suffix(query_for(config, base, nest));

/* ⚠ `replaceState`, NEVER `pushState`. Changing a colour is not a navigation: a push
     would put every swatch you tried into the Back button, and the way out of the
     page would be twenty presses away. Replace keeps one entry and keeps it true. */
export function write_url(config, base, nest){
	const query = query_for(config, base, nest);
	history.replaceState(history.state, "", location.pathname + suffix(query) + location.hash);
	return query;
}

const suffix = query => (query ? "?" + query : "");

export default from_url;
