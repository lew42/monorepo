import { Page, md, code } from "/app.js";

/* No stylesheet of its own — a page about the layer order that had to win a
 * layer fight to render would be arguing against itself. */

export default new Page({
	meta: import.meta,
	title: "Layers",
	description: "Four cascade layers, declared once in framework.css — the one line the whole CSS strategy hangs on.",
	icon: "layers",

	children: "base theme util site",

	content(){

		code.css(`@layer base, theme, site, util;`);

		md("One line, in `framework.css` — which `app.js` loads first in every document, so nothing else restates it. It is the whole conflict-resolution strategy: a later layer beats an earlier one at *any* specificity, so who wins is decided here, once, instead of by selector arms races.");

		this.previews();

		md("| layer | holds | wins because |\n| --- | --- | --- |\n| [`base`](/framework/styles/layers/base/) | the reset — browser defaults that are simply wrong | it doesn't; everything beats it |\n| [`theme`](/framework/styles/layers/theme/) | tokens + the default look; a theme you load replaces it | loads later at equal specificity |\n| [`site`](/framework/styles/layers/site/) | `/styles.css` — this site's skin | beats the framework at any specificity |\n| [`util`](/framework/styles/layers/util/) | opt-in classes | you typed `.pad` on purpose — it should win |");

		md("## Two traps that never throw");

		md("**The first `@layer` statement in the document fixes the order — and a name first seen *later* is appended at the END.** `/app.js` loads `framework.css` and puts its `<link>` first in `<head>`, ahead of every stylesheet a module loaded during import — so framework.css's one line is the order for the whole document, and no other stylesheet declares one. A layer name outside `base theme site util` lands past `util` with nothing in the console.");

		md("**Every rule must be inside a layer.** An unlayered rule beats *every* layer, at any specificity — a stray unlayered `.page` once defeated a four-class selector in a component file. There is no third trap; these two are the whole tax the layers charge.");

		md("Layers are also a ratchet: specificity → a layer → unlayered → `!important` — each rung works once, and spending one raises the cost for everyone after you. **Never escalate downstream; de-escalate upstream.** The full argument is in the [styles record](/framework/styles/).");

		md("Next: [base](/framework/styles/layers/base/) — the reset, line by line.");
	}
});
