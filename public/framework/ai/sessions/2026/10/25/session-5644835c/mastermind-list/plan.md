# List + deltas: how to reference list items (plan, not built)

Owner's need: the fast seat gets a stream of cleaned sentences and must place each one — append to the open Prompt, or start a new one — as an ordinary delta replayed through `set()`. No `{place}` namespace. Builds on [`core/Session/doc/one-replay-plan.md`](/framework/core/Session/doc/one-replay-plan.md) (the architect's plan for the whole session.jsonl shape); this is the List-specific half of it.

## 1. What List already does (read from `List.js`, `Item.js`, `Prompt.js`)

- **Every verb is by id, never an index**: `add`, `remove`, `move`, `order` (List.js:111-295). A delta line is `{"<listname>":{"add":{...}}}` or, nested further, `{"<item id>":{"<listname>":{"add":{...}}}}` — `Item.apply()` walks one name per level (Item.js:124-159).
- **A member's own id is also a name.** `List.get(key)` falls back to `find(key)` (List.js:116), so `{"<prompt id>":{"<para id>":{"text":"new"}}}` already walks straight into one member and sets a field on it — no special verb needed. This is the general "amend a field in place" case, and it works today for any List.
- **"Place after an id" already works.** `add(x, {after})` reads `after` from the call OR from the payload itself (List.js:198), so `{"paragraphs":{"add":{"id":"b","after":"a","text":"…"}}}` inserts "b" right after "a" today. Plain `add` with no `after` appends — that's the whole of "append to a list".
- **Paragraphs (`core/Task/Prompt.js:16-33`) already has the two missing primitives, but only on itself**: `append({id,text})` grows an existing paragraph's text by id (makes it if absent), `replace({id,...fields})` sets fields on an existing member by id (one-argument form, so it works as a delta verb; `List.replace(old,x)` itself is two-argument and can NOT be driven by a single-value delta line as written in the architect's plan's example — Paragraphs' own override is the fix already in place for paragraphs specifically).
- **What's missing:** these two ops (`append`-text, `replace`-by-id) live only on `Paragraphs`, not on `List` itself, so `replies` and any plain `tasks` list don't have them. And **cross-list "nest"** (move a member from one List into another) only has one replay path today, and it's built on the deprecated `locate()` `/`-separated walker (List.js:247-255, Item.js:190-206) — fine for what still reads it, but nothing new should be built on it.

## 2. The reference shapes (one example each)

No new delta "namespace" anywhere — every shape below is Item's existing nested-walk rule, nothing added to `apply()`/`set_one()`.

- **Append to the end of a list** (nothing new):
  `{"p-171":{"paragraphs":{"add":{"id":"b","text":"Next sentence."}}}}`
- **Insert after a specific id** (nothing new — `after` already read from the payload):
  `{"p-171":{"paragraphs":{"add":{"id":"b","after":"a","text":"Next sentence."}}}}`
- **Amend one in place, any field, by id** (nothing new — plain nested-id walk):
  `{"p-171":{"paragraphs":{"a":{"text":"Cleaned version."}}}}`
- **Grow a chunk in place (the live-typing case)** (exists today, only on Paragraphs — proposed: promote to `List` once a second caller needs it, e.g. `replies` streaming a reply word by word):
  `{"p-171":{"paragraphs":{"append":{"id":"a","text":" …more words."}}}}`
- **Nest: nothing new to invent, but the `move` replay branch needs one addition.** Proposed: when a `move` line's `from` is omitted and the id is not found in the destination list, resolve the source by walking the document for that id (`Item.find`) and taking it out of whichever list currently holds it — no slash-path, no new concept:
  `{"p-171":{"tasks":{"move":{"id":"q-42","after":"t-1"}}}}` — groups root Question `q-42` under Prompt `p-171`'s own tasks, wherever `q-42` lived before.

## 3. What this touches in existing code and old JSONL

- **Nothing breaks.** Every shape above either already works (append-after-id, amend-by-id) or is additive: `List.move`'s replay branch gains a fallback only when `from` is absent — existing lines (with or without a path `from`) replay exactly as now.
- **`List.replace(old, x)`'s two-argument signature** can't be driven by a one-value delta line at all; only `Paragraphs.replace({id,...})`'s one-argument override can. Any plan that writes a bare `{"<list>":{"replace":{id,...}}}` line against a list OTHER than Paragraphs will silently fail (`old` becomes the whole object, `x` is undefined) — worth a `warn()` the day a second list needs it, not urgent today since nothing else calls it that way.
- **V1 is untouched by any of this.** V1 reads `{chat}`/`{place}`/`{summary}`/`{refined}` lines, none of which this plan removes — per the owner's and the architect's instruction, Servex keeps writing those until V1 itself moves to the new shapes.

## 4. Recommendation — settled

- **Shipped as-is (zero code change — they already work):** "amend by id" and "append-after-id".
- **The `List.move` question is moot.** The architect's [one-replay-plan.md](/framework/core/Session/doc/one-replay-plan.md) keeps groups as overlays referencing Prompts by id; Prompts never move and stay in time order. So nothing nests across lists, and `List` needs no new code. `append`/`replace`-by-id stay Paragraphs-only until a second list (not just Paragraphs) needs them — don't generalize before there's a second caller.
- **Nothing left to build.** This task is closed.
