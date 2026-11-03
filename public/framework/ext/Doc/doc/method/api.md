What fills the API tab. For most modules the whole job is one line — every member of
`this.subject` — and that is what the default does.

## A module with two classes

`ext/editor` has `History` and `Block`; `ext/Saver` has a base class and three
backends. Neither fits one `subject:`, and the answer is **not** a config option
that takes a list — it is an override, which is what `Doc` is a class for:

```js /framework/ext/editor/page.js
class EditorDoc extends Doc {
	api(section){
		super.api(section);
		this.members(section, History, { methods: "push undo redo", prefix: "History." });
		this.members(section, Block,   { methods: "leaf render",    prefix: "Block." });
	}
}
```

`prefix` keeps the two sets apart in the url (`/editor/api/History.push/`) **and** in
the filename (`doc/method/History.push.md`), so a second class's `push` cannot quietly
overwrite the first's page or read the first's prose.

## ⚠ An empty API tab has no section to fill

[`api_section()`](/framework/ext/Doc/api/sections/) only adds the tab when
`methods:` or `properties:` is non-empty — so a `Doc` whose members come *entirely*
from an override gets no tab, and `api()` is never called. List at least one own
member, or override `api_section()` too. Nothing warns; the tab is simply absent.

## Improvements

1. **The empty-tab trap above should warn.** `api()` overridden on a subclass whose
   `methods:` is empty is almost certainly a mistake, and it is detectable in
   `sections()` with one `Object.getPrototypeOf` check. *(simple, useful)*
2. **`prefix` is doing two jobs** — the page name and the doc path — and a module
   might reasonably want `History.push` in the url but `doc/method/history/push.md`
   on disk. Nobody has wanted it yet; recorded so the next person knows it was seen
   rather than missed. *(simple, speculative)*
