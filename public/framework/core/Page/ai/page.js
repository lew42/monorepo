import { Doc, md, h2, small, div, a } from "/app.js";
import Concepts from "/framework/ux/Content/Concepts/Concepts.js";
import { view } from "./ObjectView.js";
import { agents } from "./live.js";

/**
 * core/Page/ai/ — the BRIDGE between Servex (the always-on process that runs
 * every Claude agent) and the page system. Servex's own roles are documented
 * once, at /framework/servex/ — this page only covers the part that is
 * PAGE-specific: every path is a context. A card's own directory
 * (`ai/<date>/<slug>/`) gets its own fast assistant and its own
 * manager/mastermind, minted from that path, the moment the owner first
 * speaks or types on it (Servex/agents/Layers.js).
 */
export default new Doc({
	meta: import.meta,
	title: "The page-based AI system",
	description: "Every page path is a context: its own session ids, its own fast assistant, its own manager.",
	icon: "smart_toy",

	children: "agents",
	notes: "dictation assistant manager sessions",

	content(){
		md("**Every page path is a context.** A card's directory (`ai/<date>/<slug>/`) is not just where its log lives — the moment the owner talks or types on it, Servex mints that path its own fast assistant and its own manager, and both keep the same session id for as long as the card is alive. The five parts below are how that works; [Servex](/framework/servex/) documents the agents themselves.");

		new Concepts({ items: [
			{ name: "Dictation", icon: "mic", href: "doc/dictation/" },
			{ name: "Fast assistant", icon: "bolt", href: "doc/assistant/" },
			{ name: "Manager / mastermind", icon: "engineering", href: "doc/manager/" },
			{ name: "Sessions & the SDK", icon: "key", href: "doc/sessions/" },
			{ name: "The agents list, live", icon: "groups", href: "agents/" },
		] });

		// One line each — what to expect one click in, before clicking.
		md(`- **Dictation** — the microphone that lives on every page, and where its words go.
- **Fast assistant** — the small, quick session that answers a card right away.
- **Manager / mastermind** — the bigger session, kept for a card's whole life, that does the work.
- **Sessions & the SDK** — how a session id is made, saved, and resumed later.
- **The agents list, live** — everything above, fetched from Servex and shown as it runs right now.`);

		// SHOW, DON'T JUST LINK — the very thing this page is about, right here: real
		// agents, fetched live, rendered as the nested `.property` rows above. Fails
		// soft (live.js): no Servex running paints one plain sentence, never an error.
		h2("Live right now");
		div.c("card pad", $box => {
			agents().then(rows => $box.append(() => {
				if (rows === null) return void small.c("muted", "Servex is not answering on this machine — nothing to show.");
				if (!rows.length) return void small.c("muted", "No agents running right now.");
				view(rows.slice(0, 3));
				if (rows.length > 3) a.c("page-link", `+ ${rows.length - 3} more →`).href("agents/");
			}));
		});
	},
});
