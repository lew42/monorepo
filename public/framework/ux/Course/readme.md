# Course — chapters of lessons: a rail, a reading column and a next-up card that coordinate

## Use
```js
import Course from "/framework/ux/Course/Course.js";

new Course({
	chapters: [
		{ title: "Chapter", lessons: [
			{ title: "Lesson", content(course){ return md("…"); } },
		]},
	],
});
```
`go(lesson)` `next()` `back()` `complete()` are the whole seam. State — `current` and a
`completed` Set — lives on the instance; no persistence (compose a `Saver` from `ext/` on top
of those two properties if you want it).

## Watch out
- **Does not extend `Wizard`.** Prototyped first, rejected with evidence — Wizard's
  `render()`/`update()` inline four regions with no per-region seam, so a third region and a
  chapter-grouped rail would fork both wholesale: [`doc/decisions.md`](/framework/ux/Course/doc/decisions/).
- **`rail()` groups the flattened `this.lessons`, never `this.chapters[i].lessons`** — the
  flattened copies carry the `.chapter` back-reference `go(lesson)` needs; the originals don't,
  and handing one to `this.current` throws the moment `lesson()` reads `.chapter.title`.
- **The reading column needs a flex-basis floor beside `.basis`'s fixed track**, or it
  collapses to a one-character sliver on a narrow row instead of wrapping —
  [`doc/decisions.md`](/framework/ux/Course/doc/decisions/).
- **Every region reuses an existing word — `.rail`, `.basis`, `ui/crumbs`, the bare
  `<progress>` element.** Zero classes minted; nothing new in `styles/css-scopes.txt`.

## More
- [Overview](/framework/ux/Course/) · [`doc/decisions.md`](/framework/ux/Course/doc/decisions/) — the
  extend-vs-compose prototype and evidence, the third-region call, both bugs, the centring fix
- [`ux/readme.md`](/framework/ux/) — the tier this lives in · [`ux/Wizard/`](/framework/ux/Wizard/) —
  the class this deliberately does not extend
- Files that matter: `Course.js` (the class), `page.js` (the demo — a real course on the
  framework's own template tier)
