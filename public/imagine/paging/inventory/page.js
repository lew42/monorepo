import { md } from "/app.js";
import { Paging } from "../paging.js";

/* Container: a column in /imagine/paging/'s row (itself /imagine/'s row). Size: `full` —
   an 8-column table needs the room, and this is a one-screen reference, not a place you
   linger. Own layout: two `md()` blocks, the first `.ac("wide")` to escape the 40em
   measure. Regions: one, core's. Preview: the default card.

   THE OWNER'S QUESTION: "it's basically like icon, page, children (with navigation).
   similar to the page generator, what other things have we made that match this
   pattern?" This is the answer — one row per thing already built that way, in the
   vocabulary the rest of /imagine/paging/ shares (mechanisms/, styles/, sizes/). */

export default new Paging({
	meta: import.meta,
	title: "Inventory",
	description: "What already matches icon · page · children · navigation — one row per thing, in the paging vocabulary.",
	icon: "inventory_2",

	content(){
		md("**One row per thing on this site that is already an icon, a page and a list of children — and which of paging's four words it uses.** The owner's question was \"what else have we made that matches this pattern?\"; this table is the answer.").ac("paging-lede");

		md("**Icon, page, children (with navigation) — what else is already built this way?** One row per thing that already matches the [page generator](/framework/core/Page/generator/)'s own shape: a tree of pages, each with a title and an icon, that a click walks. The mechanism column is [paging](/imagine/paging/)'s own four words — `launch` (new column, right) `expand` (grows below) `swap` (replaces in place) `takeover` (fills the screen) — or `none` where the thing does not use the page tree to switch at all.");

		md(`| thing | click | content | layout | surface | toolbar | nesting | verdict |
|---|---|---|---|---|---|---|---|
| [Page generator](/framework/core/Page/generator/) | launch · swap (+ \`full\`=takeover) | s | column | tint | top — spec box + a menu per column head | 3+ (capped at 40 lines) | reuse |
| [Shells](/imagine/shells/) | takeover | s–m | full | tint | top/left/right/bottom — each of the ten shows one | 1 | reuse |
| [Screens](/imagine/screens/) | launch → takeover | s–l | column → full | tint | none — crumb strip only | 4 (Divide) | reuse |
| [Decks](/imagine/decks/) | swap · launch | s–l | full | tint | bottom — the footer strip | 2 | reuse |
| [Mag](/imagine/mag/) | launch | s–m | full → column | tint | none | 3 | reuse |
| [Blogx](/imagine/blogx/) | takeover | m | full | tint | bottom — floor strip, per shell | 3 | extend |
| [Gallery](/imagine/gallery/) | launch | s–l | column | tint | top — title filter, past 8 cards | 1 | reuse |
| [Feeds](/imagine/feeds/) | launch | xs–s | column | tint | top — filter chips on \`data/\` | 2 | reuse |
| [Streamed deck](/imagine/stream/deck/) | none — socket state, no url per slide | s–m | full | tint | bottom — dot strip | 0 | missing |
| [Vary](/imagine/vary/) | launch | s | column | tint | none — look chips in \`colstyles\` | 2–3 | reuse |
| [Game](/imagine/game/) | swap — sibling exits | s | column | tint | none — digits 1–9 | 3 | reuse |
| [Team](/imagine/team/) | launch (+ auto default child) | m | column | plain/tint | top — density/sort chips, in content | 3 | reuse |
| [Generated](/imagine/generated/) | launch · swap | s | column | tint | none | varies (per export) | reuse |
| [ext/tabs](/framework/ext/tabs/) | swap | any | column | plain | top/left/block — the bar itself | 1 | reuse |
| [ext/catalog](/framework/ext/catalog/) | launch | s–l | column | plain | left — \`browse()\`'s sticky filter rail | 1 | reuse |
| [ext/layout + drawer](/framework/ext/drawer/) | swap — drawer content per selection | s | column | plain | right — the persistent rail | 1 | reuse |`).ac("wide");

		md("**Fifteen of sixteen reuse outright.** `ext/tabs` already *is* `swap`; `ext/drawer`+`ext/layout` already *is* a persistent right rail that swaps its content per selection — the exact shape [`paging/rightnav/`](/imagine/paging/) wants. `vary/` and `game/` already demonstrate the tone-ladder surfaces (`wash → tint → surface`) the owner asked for. `screens/`, `decks/` and `mag/` already say `launch`/`swap`/`takeover` in those words. Only [Streamed deck](/imagine/stream/deck/) sits outside the four — a fifth, real paging style (one shared slide number, no url, no navigation event) that the vocabulary does not cover and is not asked to.");

		md("### The `screens/divide/` diagnosis");

		md(`Every hop's box links **forward only**. Two's whole content is one line — \`area("Two", …, this.url + "three/")\` — and that \`to\` never changes once Three (and Four) are open: the box you are looking at can extend the chain but never has a link to \`this.url\`, its own address. So clicking Two after Three exists just re-targets \`/two/three/\`, which is already the active chain — nothing above Three changes and Three stays exactly as active as it was.

"Link to itself" means that line becoming conditional: once a hop already has its next hop open, its own \`area()\` should href \`this.url\` instead of the child's — so clicking the now-narrow Two column would navigate *up* to \`/divide/two/\`, which is shallower than the current route. Deactivating what falls off the chain is the Router's own job already (\`deactivate()\`, columns.md) — it would drop Three (and Four) from the row and they would disappear, leaving One + Two. It is a one-line behavior change, not a fix here — flagged for whichever minion owns \`screens/divide/\`.`);

		md("### Two counts");

		md(`- **\`this.columns()\` vs a shell of their own** — \`rg -l "columns\\(\\)" public/imagine/*/page.js | wc -l\` → **3**: [design](/imagine/design/), [gallery](/imagine/gallery/), [youtube](/imagine/youtube/). The other 16 realms with a top \`page.js\` build their own arrangement (a plain column, an index, or a shell that escapes the row entirely) rather than opting into a nested row.
- **\`width: "full"\`, everywhere under \`public/\`** — \`rg -n 'width: "full"' public --glob '*.js' | wc -l\` → **34** lines, by realm: design 14 (the layout study's own taxonomy) · framework/core 7 (the columns overview + generator) · decks 5 · vary 3 · one each in stream, screens, scenes, mag, gallery.`);
	},
});
