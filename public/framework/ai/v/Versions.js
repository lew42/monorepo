import { button } from "/app.js";
import Popover from "/framework/ux/Popover/Popover.js";
import Tree from "/framework/ux/Tree/Tree.js";
import { edit } from "/framework/ext/Ask/edit.js";
import { NewVersion } from "./NewVersion.js";

/* The versions of the AI dashboard, and the ONE picker every version wears, so you
   can always get from any version to any other. V1 is the dashboard itself; the
   rest live under `v/`, LISTED LIVE off `./page.js`'s own `children:` string —
   never hand-maintained here — so a version the dev-only "New version" action
   scaffolds (`NewVersion.run()`, `./NewVersion.js`) shows up in the picker with no code
   change anywhere. `load_all_children(1)` is `ux/Tree`'s own way of making sure
   a page's children Map is actually filled before it's read.

   Was a plain `dropdown()` (`ext/Dropdown`) over a hand-written list; now a
   hugging trigger over a `Popover` holding a `Tree` — the comparison and the
   reasoning: [`ux/Popover`](/framework/ux/Popover/). */
export class Versions {
	static async list(){
		const vpage = (await import("./page.js")).default;
		await vpage.load_all_children(1).loading;

		const nums = [...vpage.children.keys()].map(Number).filter(Number.isFinite).sort((a, b) => a - b);

		return [
			// V1 lives at `?v1` on the root url since 2026-09-21 — that url itself now
			// draws V3 (the owner: the AI page should default to V3), and `ai/page.js`
			// reads the param to decide which board to build.
			{ text: "V1", href: "/framework/ai/?v1" },
			...nums.map(n => ({ text: "V" + n, href: `/framework/ai/v/${n}/` })),
		];
	}

	// "V1" for the root dashboard, "V3" for /framework/ai/v/3/ — read off the CALLER'S
	// own url, so every version wears its own correct label with nothing hardcoded.
	static label_of(current){
		if (current === "/framework/ai/?v1") return "V1";
		if (current === "/framework/ai/") return "V3";   // the root url IS V3 now

		return "V" + (current.match(/\/v\/(\d+)\//)?.[1] ?? "?");
	}

	/** Draw the picker showing `current` (a url from `Versions.list()`) as its trigger's
	 *  own hugging label — "V1 ▾", not the 19em-wide `<select>`-shaped box the old
	 *  `dropdown()` drew. Picking another version navigates; on the dev server only
	 *  (`edit()`, `ext/Ask/edit.js`), a "New version" action sits at the menu's foot.
	 *  ⚠ Returns nothing — every call site either uses it as a bare statement or, in
	 *  `ai/page.js`, as an arrow's own expression value, and a View returned THERE
	 *  would be appended a second time (`code` skill §7, "a captured callback's
	 *  return value is appended too") since the trigger already appended itself once
	 *  by being built under that same capture. */
	static picker(current){
		const $trigger = button.c("btn ai-version-trigger", Versions.label_of(current) + " ▾")
			.attr("type", "button").attr("title", "Switch dashboard version");

		new Popover({
			anchor: $trigger.el, place: "bottom",
			content(){
				const $tree = new Tree({ nodes: [] });
				Versions.list().then(nodes => $tree.draw(nodes));

				if (edit()) button.c("ux-popover-item", "+ New version").attr("type", "button")
					.click(async () => {
						const url = await NewVersion.run().catch(e => { console.warn(e); return null; });
						if (url) location.assign(url);
					});
			},
		}).draw();
	}
}

export default Versions;
