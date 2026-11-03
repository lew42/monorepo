import View, { div, span, button, icon } from "../../core/View/View.js";

/**
 * The Omnibox moved into core on 2026-09-06. `core/Search` is the corpus and the
 * ranking; `core/Search/Omnibox.js` is the box, and `app.js` mounts exactly one of
 * it for the whole site — press `/` or Ctrl/Cmd K from any page.
 *
 * This file is what is left: a pointer, so that a page which still imports
 * `ext/Omnibox` keeps working and shows the reader where the box actually is.
 * Constructing it draws one line and a button that opens the real box.
 *
 *   ⚠ The class is deliberately NOT named `Omnibox`. `View.classify()` mints a CSS
 *     class from every constructor name in the chain, so a second `Omnibox` would
 *     wear `.omnibox` — `position: fixed`, bottom-centre — and the site would have
 *     two search boxes standing on each other. It exports UNDER that name; only the
 *     class name differs. (`code` skill §7, `new-css-class` §4.)
 */
class OmniboxMoved extends View {

	render(){
		div.c("surface pad flex gap v-center wrap", () => {
			icon("search");
			span("The Omnibox lives at the bottom of this window now, on every page.");

			button.c("btn", "Open it").click(() => this.app?.omnibox?.open());
			span.c("muted", "or press  /  ·  Ctrl K");
		});
	}
}

export { OmniboxMoved as Omnibox };
export default OmniboxMoved;
