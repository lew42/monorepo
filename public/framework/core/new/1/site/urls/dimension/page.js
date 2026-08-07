import { Page } from "/app.js";
import { section } from "../../ui.js";
import { md, claim, visit } from "../ui.js";

/* Two dimensions, one mechanism — which is the finding. A locale and a version
 * are the same shape: a whole subtree under a segment that is not navigation. */
const dimensions = {
	en: { label: "English", guide: "Built from data, not files.", api: "`route()` all the way down." },
	fr: { label: "Français", guide: "Construit à partir de données, pas de fichiers.", api: "`route()` jusqu'en bas." },
	v1: { label: "API v1", guide: "`GET /things` returns an array.", api: "Deprecated, still reachable." },
	v2: { label: "API v2", guide: "`GET /things` returns `{ data, cursor }`.", api: "Current." },
};

export default new Page({
	meta: import.meta,
	title: "Dimensions",

	// One route() claims four prefixes; the page it returns claims its own
	// children the same way. Nothing below this line is a directory.
	route(prefix){
		const dict = dimensions[prefix];
		if (!dict) return null;

		return new Page({
			title: dict.label,
			route(name){ return dict[name] && new Page({ title: name, content(){ md(dict[name]); } }); },
			content(){
				md(`\`${prefix}\` is a **dimension**, not a section. This page and everything under it came from one object literal.`);
				visit([`/urls/dimension/${prefix}/guide/`, `/urls/dimension/${prefix}/api/`]);
			},
		});
	},

	content(){

		claim(() => new Page({
			route(prefix){
				const dict = dimensions[prefix];
				if (!dict) return null;

				return new Page({
					title: dict.label,
					route(name){ return dict[name] && new Page({ title: name, content(){ md(dict[name]); } }); },
				});
			},
		}), ["/urls/dimension/en/guide/", "/urls/dimension/fr/guide/", "/urls/dimension/v1/api/", "/urls/dimension/v2/api/"],
			"Four prefixes, eight leaf urls, zero directories. `route()` nested one level is the whole implementation.");

		section("What the tree makes easy");

		md(`
| | why |
|---|---|
| **every link inside a prefix self-prefixes** | \`naming()\` derives \`parent.url + name + "/"\`, and \`link()\`, \`preview()\`, \`previews()\` and \`tabs()\` all build from \`this.url\`. Not one of them needs to know a prefix exists. |
| **moving the prefix moves the subtree** | the url is the parent's plus the name, so there is no path written down anywhere to update. |
| **a prefix costs nothing until visited** | \`route()\` is consulted per segment, so \`/fr/\` is not loaded, parsed or constructed by a reader who never asks for it. |
`);

		section("What it makes miserable");

		md(`
| | why |
|---|---|
| **the filesystem multiplies** | a declared child imports \`this.url + name + "/page.js"\`, and \`this.url\` is prefixed — so \`/en/guide/\` looks for \`/en/guide/page.js\`. **File-backed children cannot be shared across prefixes.** |
| **switching dimension is string surgery** | there is no \`page.sibling_in("fr")\`. A language switcher must rewrite \`location.pathname\`, which is the one place a view has to read the browser. |
| **the prefix is in the chain** | breadcrumbs read *Dimensions › English › guide*, and \`.in-path\` marks \`/en/\` as an ancestor. It is not a section, but the chain cannot tell. |
| **two pages, two states** | \`/en/guide/\` and \`/fr/guide/\` are different \`Page\` objects with different \`view\`s. Correct for a locale; surprising for a version toggle. |
`);

		md(`**The rule that falls out: a dimension prefix is free when the content comes from data, and expensive when it comes from files.** Above, four prefixes cost one object literal. The same four over \`page.js\` files would cost four parallel directory trees, and they would drift the first time someone edited one.`).ac("note");

		section("So put the dimension last, when files are involved");

		claim(() => new Page({
			meta: import.meta,       // /guide/page.js — ONE directory, one file
			title: "Guide",
			route(locale){           // /guide/fr/ — the page claims its own translations
				return translations[locale] && new Page({ title: locale, content(){ md(translations[locale]); } });
			},
		}), null, "`/guide/fr/` instead of `/fr/guide/`. The file tree is not multiplied, each page owns its own translations, and switching locale is a suffix swap rather than a prefix rewrite.");

		md(`
| | \`/fr/guide/\` | \`/guide/fr/\` |
|---|---|---|
| directories | one per locale, forever | one, ever |
| shares content across locales | no | yes — same page object |
| matches how people read urls | yes, and crawlers agree | less conventional |
| switching locale | rewrite segment 1 | append/replace the last segment |
`);

		md(`**Verdict: prefix-first for locale, suffix for anything file-backed.** A locale genuinely is a different document — someone shares the French page deliberately — so it earns the path, and \`/fr/\` at the front is what every reader and every crawler expects. A version is the same argument. Everything else that wants to be a prefix is usually a lens in costume; the test is in **/urls/query/**.`).ac("note");

		section("Is `route()` on a root-level page the answer?");

		md(`For a dimension, **yes** — and it is the only answer, because the alternative is a \`children\` list that has to name every page in the site once per prefix. But it comes with the whole of the finding above: the moment one page under that prefix wants a \`page.js\` of its own, the prefix has multiplied your directory tree and nothing warns you.`).ac("note");

		visit(["/urls/ugly/", "/urls/static/"]);
	},
});
