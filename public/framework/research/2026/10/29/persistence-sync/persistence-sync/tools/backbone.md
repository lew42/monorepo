# Backbone.js

`id: backbone` · category: `state` / `model-tree` · kind: `tool` · status: `stale` (2025-04-01) · license: MIT

Profile by profile-backbone, 2026-10-30. Sources are linked inline; **Inference:** marks judgment. Code links are pinned to commit `94260d91dcf4050360f055506271b61f7b24e5e3` (the shared clone HEAD, committed 2026-10-13; `package.json` says 1.6.1).

## What it is

Backbone.js gives you `Model` (one object of attributes that fires change events when they change) and `Collection` (an ordered set of models that fires add, remove, reset and sort events), plus `Events` as a mixin for any object ([backbone.js#L147](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L147), [L461](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L461), [L831](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L831)). It is for web apps that want model objects with change events and a server sync, without a full framework.

What sets it apart in its subcategory: it is the oldest and most direct Model + Collection + events design in this list. Its one sync seam, `Backbone.sync`, is the piece most worth studying ([notes/fullstack_framework_data_paths.md](../notes/fullstack_framework_data_paths.md), section 6). **Inference:** it is the closest published match to lew42's `Item` and `List`, which is why the comparison below matters.

**Parent note:** Marionette builds on Backbone (Backbone is its parent). No record is needed for Marionette here.

## How it works

- **Data model:** a `Model` holds an `attributes` object and a `cid` (client id); its `id` comes from `idAttribute` ([L461-L478](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L461-L478)). A `Collection` holds `models` in an array and a `_byId` index for lookup by id or cid ([get, L1067-L1072](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L1067-L1072)).
- **One change looks like:** `model.set("title", "x")` or `model.set({title: "x", done: true})`. The model updates `attributes`, then fires `change:<attr>` for each attribute that changed and one `change` for the whole call ([set, L540-L612](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L540-L612)). The event payload is `(model, options)`. It does not carry a serializable delta.
- **Persistence:** none in the core. Persistence is `fetch`, `save` and `destroy`, which call `Backbone.sync` ([Model.sync, L513](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L513)). The default adapter turns each call into one HTTP request.
- **Transport:** `Backbone.sync` maps `create`, `update`, `patch`, `delete` and `read` to POST, PUT, PATCH, DELETE and GET ([methodMap, L1722-L1728](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L1722-L1728)). It sends the request through `Backbone.ajax`, which proxies to jQuery ([L1732-L1734](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L1732-L1734)).
- **Runtime:** the browser and Node. Nothing here runs on Workers. The server part is whatever answers the REST URLs.
- **Client use from plain JS:** the file is UMD. In a browser it needs `underscore` already loaded as the global `_` (jQuery is optional) ([L37](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L37)). So it works from a script tag with no build step, but it is not an ES module. The `modules/` folder holds the ES module build for debugInfo only ([notes/fullstack_framework_data_paths.md](../notes/fullstack_framework_data_paths.md), section 1).

## Code facts

- **Model `set` (one batch of changes):** `set` diffs each key against the current value and records the changed keys. The first `set` in a batch copies `attributes` into `_previousAttributes` and resets `changed` ([L564-L567](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L564-L567)). Nested `set` calls inside a change handler join the same batch (`_changing`).
- **`change:<attr>` then `change`:** `change:<attr>` fires once per changed key during the call. `change` fires once at the end of the outermost batch, and the `while (this._pending)` loop catches changes made by handlers ([L595-L611](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L595-L611)).
- **`changed` and `previous`:** `changed` holds only the keys whose value differs from the value before the batch. A key set back to its old value is removed from `changed` ([L578-L580](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L578-L580)). `hasChanged(attr)`, `changedAttributes()`, `previous(attr)` and `previousAttributes()` read it ([L632-L668](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L632-L668)).
- **Validation is opt-in on `set`:** `_validate` runs only when `options.validate` is true ([L807-L808](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L807-L808)). `save` turns it on by default ([L699](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L699)).
- **`silent`:** `options.silent` skips every change event for that call ([L559](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L559), gate at [L595](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L595)). Nothing else records the change.
- **Collection `set` options:** `add` (default true), `remove` (default true), `merge` (default true) ([setOptions, L842](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L842)). `at` inserts at an index, and `sort: false` skips the comparator ([L929-L934](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L929-L934)). `add` is `set` with `merge: false, remove: false` ([L886-L888](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L886-L888)). `remove` fires `update` with `changes.removed` ([L891-L904](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L891-L904)).
- **Collection events:** each added model fires `add` (model, collection, options). Removed models fire `remove`. After the batch, the collection fires one `update` with `options.changes = {added, removed, merged}` ([L1009-L1014](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L1009-L1014)). `reset` swaps the whole list, with no `add` or `remove` events, and fires one `reset` ([L1026-L1037](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L1026-L1037)). `sort` fires `sort` ([L1100-L1116](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L1100-L1116)).
- **Model events bubble to collections:** a collection listens to each model with `model.on('all', ...)` ([L1274-L1280](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L1274-L1280)) and re-fires every model event on itself ([_onModelEvent, L1294-L1307](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L1294-L1307)). So one `collection.on("change", ...)` sees changes to any item.
- **`Backbone.sync` adapter contract:** `sync(method, model, options)` receives one of the five CRUD names and the model. It must call `options.success(resp)` or `options.error(...)`, which `fetch` and `save` set up ([L675-L676](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L675-L676)); `fetch` and `save` return whatever `sync` returns. The default builds the URL from `url()` and sends `model.toJSON()` as JSON for create, update and patch ([L1661-L1720](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L1661-L1720)). It fires `request` on the model ([L1717](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L1717)). Replacing `Backbone.sync` (globally) or `sync` on one model or collection is the documented override.
- **Server reply merge:** `fetch` and `save` pass the reply through `parse` and then `model.set(serverAttrs)`. So a server reply fires `change` events like any other `set` ([fetch, L672-L685](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L672-L685)).
- **Events mixin:** `on`, `off`, `once`, `listenTo`, `stopListening`, `trigger` ([L147-L445](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L147-L445)). `trigger("x")` also calls every `"all"` handler with the event name first ([triggerApi, L380-L387](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L380-L387)). The mixin goes onto Model at [L481](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L481) and onto Collection at [L857](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L857).
- **Dependencies:** `underscore` is a hard dependency (`dependencies`); `jquery` is an optional peer ([package.json L15-L25](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/package.json#L15-L25)). The UMD wrapper takes `_` and `$` from the globals or from `require` ([L17, L25-L33, L37](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L17-L37)).

## Group-by positions

Axes from taxonomy.md section 4 that apply to `state`. Authority, layout, partition, transport and history are not listed for this category, so I skipped them.

- reactivity: `events`. Changes are announced by `change:<attr>`, `change`, `add`, `remove`, `update`, `reset` and `sort` events. Nothing tracks dependencies for you ([set, L540-L611](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L540-L611)).
- client-model: `object-graph`. Models hold ids and belong to collections, and `Collection.get` finds them by id through `_byId` ([L1067-L1072](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L1067-L1072)). **Inference:** nothing loads children lazily, so the object graph is whatever the app builds.
- change-format: `snapshot` on the wire. `save` sends `model.toJSON()` whole, and sends only `attrs` for `patch` ([L1661-L1720](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L1661-L1720)). **Inference:** the in-memory event is keyed by model and attribute, which is close to `id-ops`, but nothing serialises it as an op.
- conflict: `lww`. `save` sends the whole model with no version check, and the reply is merged back with `set` ([fetch, L672-L685](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L672-L685)). The last write wins, with no merge step.
- list-order: `index`. `add` takes an `at` index and `sort` takes a comparator ([set, L929-L934](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L929-L934), [sort, L1100-L1116](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L1100-L1116)). There is no `move` verb in this version (grep of backbone.js finds none).
- query: `client-index`. `get(id)` uses `_byId`. Other lookups (`where`, `findWhere`, `filter`) are underscore methods that scan the array ([L1607-L1618](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L1607-L1618)).

Features (tags from taxonomy.md section 5): `open-source` (MIT, [package.json L53](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/package.json#L53)), `browser-esm-no-bundler` (works from a script tag with a global `_`, not as an ES module, [L37](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L37)). Not set: `offline`, `realtime`, `multi-user-merge`, `undo-history`, `references`.

## Pairs with

No pairs recorded. Its two named companions are not tool records: `underscore` (a hard dependency) and jQuery (an optional peer that the default sync uses) ([package.json L15-L25](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/package.json#L15-L25)).

## Alternatives

Substitutes: you would pick one of these instead.

- `mobx-keystone`: a typed model tree in the same `model-tree` subcategory, which emits patches and snapshots instead of events. Pick it when you want the change as data ([taxonomy.md](../taxonomy.md) section 3; [notes/signals_reactivity_lists.md](../notes/signals_reactivity_lists.md), line 158).
- `mobx-state-tree`: the same idea with a stricter type system. Pick it for typed state trees ([taxonomy.md](../taxonomy.md) section 3; [notes/signals_reactivity_lists.md](../notes/signals_reactivity_lists.md), line 158).
- `tanstack-db`: client collections fed by a sync function (`begin`, `write`, `commit`, `markReady`). The notes call it a more rigorous successor to `Backbone.sync` ([notes/fullstack_framework_data_paths.md](../notes/fullstack_framework_data_paths.md), line 256). Pick it when you want the sync seam with a ready state and transactional batches.

## Avoid with

None verified as a specific tool. The category-level rule applies: a Backbone model and a second store that writes the same attributes give two owners for one piece of state ([taxonomy.md](../taxonomy.md) section 6, conflicts).

## Adopters

Named on the Backbone site's examples list (Trello, Airbnb, Khan Academy, Stripe and others). This list is self-reported and wiring is not checked ([notes/signals_reactivity_lists.md](../notes/signals_reactivity_lists.md), line 370; secondary).

- **WordPress core**: bundles Backbone, and the Trac ticket tracks updates to 1.6.0 and 1.6.1. Wiring not checked; the ticket was not fetched here ([notes/fullstack_framework_data_paths.md](../notes/fullstack_framework_data_paths.md), line 441; [WordPress Trac #63763](https://core.trac.wordpress.org/ticket/63763)).

## Status

- Latest release: 1.6.1 on 2025-04-01. Last push 2026-10-13. The metrics row carries the `NO_RELEASE_12MO` flag, so the status is `stale` under taxonomy.md section 1 ([notes/adoption_metrics.md](../notes/adoption_metrics.md), line 104).
- Maintainers and company: the project is on GitHub under jashkenas. I did not check the maintainer roster ([package.json](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/package.json)).
- License: MIT ([package.json L53](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/package.json#L53)).

## Fit for lew42

**Inference:** lew42 already has the parts Backbone is known for. `Item` fires `change` and a `delta` with `{set: {key: value}}` for each real change, and `List` works by id ([Item.js L104-L111 and L189-L191](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L104-L111), [List.js L5-L6](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L5-L6)). Adopting Backbone would lose the delta payload and the by-id list verbs for a generic `change` event with no record of what changed. It would also add a dependency on underscore and a UMD bundle, which the no-new-npm-dependency rule forbids without asking first. My recommendation is to skip the library and borrow two ideas: one batched event per outermost write, and one collection `update` with `changes`.

## Lessons

- **One batched change per outermost `set`.** Nested `set` calls join the batch,, and `change` fires once after the handlers finish ([L564-L567](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L564-L567), [L595-L611](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L595-L611)).
- **A collection re-fires its models' events.** It listens to each model with `on('all')` and forwards the events, so one listener on a list sees any child change ([L1274-L1280](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L1274-L1280), [L1294-L1307](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L1294-L1307)).
- **One sync function per model or collection, keyed by CRUD name.** Persistence is a single overridable function, not a method per store ([L1661-L1728](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L1661-L1728)).

## Lesson for Lew42

- **Got right, keep:** the batch shape. One change per outermost write, and one collection `update` carrying `changes: {added, removed, merged}` ([L1009-L1014](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L1009-L1014)). lew42's `act(verb)` already sums deltas into one `delta` per verb ([Item.js L104-L111](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L104-L111)).
- **Lacked, silent writes:** the `silent` option. In Backbone it skips every event for that call and leaves no record ([L595](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L595)). A silent write would vanish from a JSONL delta log. If lew42 ever adds a mute, it must still write the delta.
- **Lacked, opt-in validation:** `set` validates only with `validate: true` ([L807-L808](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L807-L808)), while `save` turns it on by default. lew42 should validate on every write, or make skipping it explicit.

## Gaps

- I did not run Backbone. Code facts come from reading the pinned source, and the browser script-tag path is untested.
- The default `Backbone.sync` is the only adapter in the clone. Any localStorage adapter is a plugin that is not in this clone.
- Adopter wiring is not verified. The WordPress ticket was not fetched. The notes say Jupyter widgets depend on `backbone` 1.4.0, but the notes say that is background knowledge, so I did not list it.
- `View` and `Router` exist in the same file ([View, L1400](https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js#L1400)); I did not profile them.
- Marionette is only noted as the child of Backbone. It has no record here.
- The ES module build under `modules/` is described in the notes as covering debugInfo only. I did not check it.

## Sources

- https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/backbone.js
- https://github.com/jashkenas/backbone/blob/94260d91dcf4050360f055506271b61f7b24e5e3/package.json
- https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js
- https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js
- https://core.trac.wordpress.org/ticket/63763 (via notes, not fetched)
- notes/adoption_metrics.md
- notes/fullstack_framework_data_paths.md
- notes/signals_reactivity_lists.md
- lessons/object-model.md
- taxonomy.md
