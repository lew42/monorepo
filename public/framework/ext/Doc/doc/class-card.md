# A class page is one card: core API first, own members, then inherited (2026-10-19)

The API tab of a Doc whose `subject` is a class opens on a **ClassCard** (`ClassCard.js`, `class ClassCard extends View`, built by `Doc.api_section`). Try it: [Page](/framework/core/Page/api/), [Item](/framework/core/Item/api/), and [List](/framework/core/List/api/) (no weights, so no Core API block). The brief is the owner's 2026-10-06 ask, item 3: `ai/sessions/2026/10/06/markdown-explorer-and-class-cards/requirements.md`.

## The shape, top to bottom

1. **Title card**: the same dark card with the framed icon that an inline `#Class` mention draws (`build_row` from `ext/Mention`), bigger, linked to the class.
2. **Core API**: the Doc's heaviest weighted members (up to 7).
3. **Also on <Class>**: the class's own members that have a page, then one fold, "N more, no page yet".
4. **Inherited from <Base>**: one group per base class, the base as a `#Class` mention, in chain order (`Page`, then `Item`). A class made by a function (the `Events` mixin) has no name and reads "a mixin".

Members are plain unboxed `item()` rows: `play_arrow` for a method (with its parameter names), `label` for a property. A member with a page links to `api/<name>/`; that page has a back link to the card and the card replaces the old rail of names. A subject that is not a class (`md`, `demo`, an app instance) keeps the rail.

## The weight tag

A `core:` string on the Doc config, beside `methods:` and `properties:`, a space-separated list of `name:weight`:

```js
core: "title:10 children:10 content:9 url:8 child:8 add:7 render:7",
```

- Heaviest first; a tie keeps the order written; the top 7 are Core API.
- A bare name (`render`) weighs 1.
- A member with **no weight** sorts after the weighted ones (then declared order, then the order the class holds them) and is not in Core API.
- No `core:` at all means no Core API block; the card still shows own and inherited members.

Written so far: `core/Page/page.js` and `core/Item/page.js`. Add one to any other class's `page.js`.

## Own first, inherited below: computed, not listed

`ClassCard.chain(doc)` walks `subject.prototype` up to `Object.prototype`. Each class's own property descriptors form its group (a function value is a method; anything else is a property). The subject's group also adopts its declared `properties:` (instance fields leave nothing on a prototype). Names starting with `_` are left out.

A base class's members link to the base's own API tab when that Doc is known: `ClassCard.registry` (filled by `Doc.initialize`) first, else a dynamic `import` of the page.js at the base's `#Class` url (`ext/Mention/maps/refs.js`). Until it answers, and for a base with no entry, its members show as "no page yet".

## Decision

Extend `Doc` with a body view rather than build a second class-page system; weight on the Doc config rather than in each member's `.md` (40 fetches per page) or a JSDoc tag. Alternatives and reasons: `ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/class-cards/plan.md`.
