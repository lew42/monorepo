# Class cards: plan (one screen)

## Today

- **[Doc](/framework/ext/Doc/)** (`ext/Doc/Doc.js`) is the one class page. Its API tab is a vertical rail of member names, one page per member (source + the `doc/method|property/<name>.md` prose); nothing on it says which members matter or which class they come from.
- **ObjectCard** (`ux/Content/Object/Object.js`, fenced, not touched) draws a small icon + name + property/method list for one object; [Page](/framework/core/Page/)'s own `page.js` overrides `api_section` to draw it under the tab rail. It is a viewer of one object, not a class page.
- **Mention** (`ext/Mention/Mention.js`) owns the `#Class` look: the framed icon and the dark card (`build_row`). Reused here by import, never copied.

## Design

- **One class extended: `Doc`, through a new body view `ClassCard`** (`ext/Doc/ClassCard.js`, `class ClassCard extends View`). `Doc.api_section` draws it as the API tab's home (`this.tabs(undefined, { home })`); member pages stay exactly where they are (`api/<name>/`), so no url moves. Page's own override of `api_section` is deleted so Page uses Doc's.
- **Shape:** the title card (a `#Class` mention row: framed icon + class name, dark card, links to the class) → **Core API** (the weighted members) → **own members** (`Page`) → one group per base class (`Inherited from Item`), each group header a `#Class` mention. Members are plain unboxed `item()` rows: an icon (`play_arrow` method, `label` property), the name, nothing else around it; each links to its member page when one exists.
- **Weight:** `core: "child:10 add:9 render:9 nav:8 chain:7 link:6"` on the Doc config in `page.js`, beside `methods:`/`properties:` (which already name every documented member, so the two stay in one place). Numbers sort high to low, ties keep declared order, the top 7 form Core API. A member with **no weight** sorts after the weighted ones, in declared order, and is simply absent from Core API; a class with no `core:` shows no Core API block at all.
- **Own first, inherited below** is computed at runtime from the prototype chain: walk `subject.prototype` up to (excluding) `Object.prototype`; each class's own descriptors are its group (functions → methods, accessors and declared `properties:` → properties). The subject's group is first, then each base in chain order (`Page`, then `Item`). A base class's members link to the base's own API page when that Doc is loadable (`Doc.of(base)`: registry, else a dynamic `import` of the url `refs` gives), else render as plain items.
- **Declared properties** (instance fields leave nothing on the prototype) belong to the subject. Members with no page (undeclared, or a base whose Doc is not loadable) fold into one "no page yet" disclosure, so the card shows what is documented first.

## decision

Extend `Doc` with a `ClassCard` body view; weight lives in a `core:` string of `name:weight` pairs on the Doc config.
- Alternative 1, a new `ClassPage` beside `Doc`: rejected, two class-page systems (law 6).
- Alternative 2, weight in each member's `.md` front matter or a JSDoc `@weight`: rejected, 40 fetches per class page, or a parse of a source file the page already holds as a string only for the declared members; the Doc config is already the one list of members.
- Alternative 3, ordered list with no numbers: rejected, the owner asked for a weight, and ties are real.
