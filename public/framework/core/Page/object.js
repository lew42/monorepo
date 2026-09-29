import { view } from "../../ux/Content/Object/DefaultView.js";

/**
 * page_object(page) — a live `Page` instance, drawn as a `DefaultView` item tree:
 * its own name, "a Page", then whatever it actually has (`.title`, `.url`,
 * `.children`, `.nav`, `.files`… every own field, nothing hand-picked). `Page`
 * tracks itself already (`Page.class.js`'s constructor calls `Page.track(this)`),
 * so this file's only job is drawing ONE of those instances — not the whole list.
 *
 *   import { page_object } from "/framework/core/Page/object.js";
 *   page_object(this)                 // inside a page's own content()
 *
 * A separate file, not inlined into `page.js`, because `page.js` here is
 * page-system's own — this module is the one seam another page reaches for
 * without touching that file. See `/framework/ux/Content/Object/page/` for it
 * live, and `/framework/ux/Content/Object/doc/default-view.md` for how the tree
 * itself works.
 */
export function page_object(page){ return view(page); }

export default page_object;
