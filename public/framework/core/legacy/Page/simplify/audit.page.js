import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "The audit",
	description: "Every member of Page, its real consumers, and why it exists.",

	content(){

		md("Counted by grep across `public/`, excluding `Page.class.js` itself and doc prose that only *mentions* a name.");

		md(`| member | real consumers | exists for |
|---|---|---|
| ~~\`root\`~~ | **0** | — *(deleted)* |
| ~~\`url\` setter\`~~ | **0** | — *(deleted)* |
| ~~\`theme\` + \`deactivate()\`~~ | **0** | — *(deleted)* |
| ~~\`body()\`~~ | — | — *(collapsed into \`render()\`)* |
| \`crumb()\` | ColumnPager | **layout** |
| \`chain\` | ColumnPager, \`Pager.leaf()\` | **layout** |
| \`host()\` | \`App.load_page\` → layout | **layout** |
| \`load_ancestors()\` | \`Page.load\` | **layout** (feeds \`host()\`) |
| \`parent_url\` | \`load_ancestors()\` | **layout** |
| \`Page.registry\` | \`Router.intercept\` | **router gate** |
| \`children\` + adoption | \`previews()\`, ColumnPager sidebar | both |
| \`preview()\` / \`previews()\` | 47 uses | itself |
| \`link()\` | 39 uses | itself |
| \`url\` getter, \`module_url\`, \`load\` | everything | itself |
| \`render()\`, \`content\`, \`activate()\` | everything | itself |`);

		md("### The one finding that surprised me");

		md("`root` looked heavily used — `this.root` appears all over `ColumnPager` and `TabPager`. It isn't this getter. That's the **Pager's own** `root` property, assigned by `new host.Pager({ root: host })`. The getter had no callers at all.");

		md("### The cluster");

		md(`\`host()\` + \`load_ancestors()\` + \`parent_url\` is a three-link chain answering
exactly one question: *which ancestor owns the layout?*

- nothing calls \`host()\` but \`App.load_page\`, and only to find a layout
- \`load_ancestors()\` exists only because \`host()\` needs ancestors **loaded**
- \`parent_url\` exists only for \`load_ancestors()\`

It is also the only **async** and only **failure-prone** code in the class — N
sequential dynamic imports on a deep cold load, with a \`catch { break }\` that
swallows real errors. Arya and Alex have no equivalent because neither has a
layout tier.`);

		md("That's ~45 lines, and it's the answer to *\"why is ours four times the size?\"*");
	}
});
