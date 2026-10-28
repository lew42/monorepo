# Ids and paths: how a line names the item it changes

The owner's questions (2026-10-28), following [flow-and-ids.md](flow-and-ids.md):

- What is the `t-` in `t-c3`?
- Isn't searching every list a bad idea, and part of why replay is slow?
- Could a line name the list, or use a dotted path, instead of a tower of braces?
- Ids vs UUIDs vs counters: which survives two agents, two devices, and merging?
- "I'd rather figure this out once and for all", for every use, not only sessions.

## DECIDED by the owner (2026-10-28): dots, and each level decides for itself

This replaces the `/` proposal in §4, §6 and §8 below.

1. **A path uses dots, never slashes:** `{"tasks.ui.tasks.c3":{"complete":{}}}`. That form is read everywhere and typed by people and tools; the store itself keeps writing nested lines (§4). A slash looks like a file-system path. A dot reads as what it is, an in-memory JavaScript object path. Slashes stay for things that really are on disk.
2. **`set` walks the path through `get`, one level at a time, and each level decides how to look up the next part.**
   - The root's `get` takes the first part (`tasks`). If what it finds has its own `get`, the root hands it **the rest of the path** and lets it carry on.
   - **A List** fails the plain property lookup, then falls back to its own members.
   - **How** a List finds a member is the List's own business: a scan, an id-to-member `Map`, or a flat index of all its descendants. A subclass can change the rule without touching anyone else.
   - Control always passes down to the object that owns the next step, so an extension can re-engineer its own lookup easily. The owner: "that's kind of what I thought I'd asked for before".
   - The nested form (`{"tasks":{"ui":{…}}}`) is the same walk, and stays readable.
3. **No `#` in addresses.** The `#` in the examples below was an invention; the site doesn't use a hash router. A reference to an item in another file holds two fields: the file's url and the dotted path inside it.

   ```js
   {"ref": {"url": "/framework/ai/sessions/…/v-7k2q/", "path": "tasks.ui.tasks.c3"}}
   ```

   Inside one file, the url is left out: `{"ref": {"path": "tasks.ui.tasks.c3"}}`.
4. **Ids must never contain a dot.** Short random ids (§5) are letters and digits only.

## 1. What `t-ui` and `t-c3` are

**Examples, not real ids.** The design seats invented `t-`, `s-`, `p-` (task, sentence, prompt) to make their sample lines readable. Nothing in the code makes ids like that. Today's code makes ids three ways:

| Who makes the item | Id today | Problem |
|---|---|---|
| code or the browser (`new Item()`) | a UUID (`new_id()`, 36 characters) | long |
| an agent, via the item tool's `tasks.add` | **a slug of the title** (`fix-the-tab-bar`) | a rename leaves a wrong id; the same title twice gets `-2` |
| a page's content | readable names (`content-code`) | fine for code-made things |

## 2. Searching every list: yes, it's wrong, and it's slow

**It contradicts a rule the owner already set.** On 2026-10-03 (commit `9f66f0dbb`) the rule became: *"an id is unique only among its own list's siblings; a List held as a property is reached by its property name."* The writer never caught up with it.

- **The writer drops the list name.** `Store.hops` writes a member's change as `{"c3":{…}}`, not `{"tasks":{"c3":{…}}}`.
- **So the reader has to guess.** `Item.get(key)` checks own properties, then data, then **searches every list the item owns** (`core/Item/Item.js:183-186`), taking the first hit.

**What that costs:**

- **Wrong answers:** two lists with an `s1` misroute on replay (seat a proved it).
- **Time:** the streaming seat's CPU profile of the voice-session replay found the two biggest costs:
  - `lists()`, which rebuilds the list of lists at every hop by looping over every property (`Item.js:227-231`): 24.6 s of self time, out of about 40 s in total;
  - lines that searched the whole tree and missed: 6,257 of 9,176 lookups.

  The owner's guess is right.
- **Each list search is itself a scan,** `Array.find` (`core/List/List.js:112`).

## 3. The fix: name every hop, and look up by Map

**Rule:** a line names each step from the root down: a property name, then, inside a List, the member's id. Nothing is ever searched.

```js
{"tasks":{"c3":{"complete":{}}}}                       // root → its "tasks" List → member c3 → complete()
{"tasks":{"ui":{"tasks":{"c3":{"set":{"title":"…"}}}}}} // a subtask, two levels down
```

- **On a List, an unknown key means a member id.** `List.get(key)` already does this: its own property first, then a member (`List.js:116`). That is the owner's "the list falls back to its own items" idea. It exists; it just isn't the only route.
- **The default List keeps a `Map` from id to member,** updated on add, remove and move. A hop is then one Map lookup, and ten levels deep is ten lookups, which costs nothing. It's the default, not a rule: a List subclass may keep a flat index of all its descendants, or anything else (the DECIDED section).
- **`Item.get` stops searching lists.** It still answers an old line (one with no list name), but only as a fallback, and it logs a warning.
- **Ids only need to be unique among siblings.** That was the 10-03 rule, and it's enough once every hop names its list. **No file-wide uniqueness, and no file-wide index.**

This replaces the design seats' "unique per file, plus an index". Their reason for the index was that lines skipped the list name. Once every line names it, the index has no job left, except references (§6).

## 4. Braces vs a path: the same thing, spelled two ways

A deep item needs one level of braces per hop. A **path key** says the same thing flat:

```js
{"tasks":{"ui":{"tasks":{"c3":{"complete":{}}}}}}      // nested
{"tasks.ui.tasks.c3":{"complete":{}}}                   // path key: expands to exactly the line above
```

- **Same walk, same meaning:** each level's `get` takes the first part and hands the rest down (the DECIDED section above). Today's `Item.locate(path)` (`core/Item/Item.js:190-206`, kept since 10-03 to read old `/` lines) is the nearest existing code. But it walks the whole path from the top itself, where the decided rule hands control down level by level.
- **Dots, not slashes** (the owner's call): a slash looks like a file-system path.
- **What was dropped on 10-03** was a separate `at` key beside the delta (`{"at":"a/b","set":…}`), so there would be one grammar. A path *key* keeps that one grammar: it's only a shorter way to write the nesting.
- **Read both forms, but WRITE nested lines, never dotted ones** (corrected by the plan review, 2026-10-28). About 20 scripts and views read lines by their shape (`Server/PromptRecords.mjs`, `Server/ChildLinks.mjs`, `ext/Chat/v2/ChatV2Model.js`), and a data key with a dot in it (a file name) must not be mistaken for a path. In 129,723 real lines there are 0 dotted keys today, so reading them is safe. Dotted paths are for people and tools to type (the item tool, docs); the store writes nested.

## 5. Ids: the options compared

| Scheme | Example | Length | Two devices or agents offline | Merging two lists | Readable | Verdict |
|---|---|---|---|---|---|---|
| UUID | `9f2c41d0-6b1e-4c7a-…` | 36 | safe | safe | no | safe but long |
| **Short random** (nanoid-style) | `k2p9x4mq` | 8 | safe in practice | safe in practice; a clash is detectable and redrawn | no | **recommended for anything a person or agent makes** |
| Counter | `a1`, `a2` | 2–4 | **clash** | **clash** | somewhat | rejected: the owner's two-agents case breaks it |
| Slug of the title | `fix-the-tab-bar` | ~20 | clash on equal titles | clash | yes | rejected: a rename leaves a lying id |
| Type letter + random | `t-k2p9x4mq` | 10 | as short random | as short random | the letter only | the letter is cosmetic (below) |
| Client + counter (Figma's public description) | `14:302` | 4–8 | safe, if each client has a number | safe | no | good, but needs a client registry |
| Time-sorted (ULID) | `01JB…` | 26 | safe | safe | no | only if sorting by id matters; list order already does that |
| **A fixed name** | `ui`, `review`, `tasks` | short | n/a | n/a | yes | **recommended for code-made structure** |

**How safe is "safe in practice"?** 8 characters of base 36 is about 2.8 trillion values. Among 100,000 siblings (a big table), the chance of any clash is about 1 in 500. Merging two lists of 10,000 each is about 1 in 30,000. A clash isn't silent: `add` refuses an id that is already there, and the maker draws again. If an id ever needs to be unique across the whole site, 12 characters gives that, at a third of a UUID's length.

**The type letter.** It never causes a clash, because the random part carries the uniqueness, so two types sharing a letter is harmless. But it repeats the item's `type` field, and goes stale if an item changes class (a Prompt that becomes something else). Recommendation: no letter. The path already says what something is (`tasks/k2p9x4mq`).

**The rule, then:**
- **Code-made structure gets a fixed, readable name** (`ui`, `review`). Code reruns safely: an `add` of a name that exists does nothing.
- **Anything a click or an agent makes gets a short random id,** minted once, at that moment.

## 6. References (the owner's ask 24): when, how, and moves

### What a reference is, and when to use one

A reference is a small Item that **points at an item living somewhere else**, instead of holding a copy of it. Use one whenever the same thing shows in two places:
- a task shown in the chat;
- a child session listed under a task;
- a page linked from another page;
- an editor instance pointing at its component.

The rule from the synthesis: **one owner per item, and everyone else holds a reference.** A reference stores where the target is, never its title or state, so it can't drift.

### How it is written, and how it comes back on load

```js
{"chat":{"add":{"type":"Ref","path":"tasks.ui.tasks.c3"}}}                              // same file
{"chat":{"add":{"type":"Ref","url":"/framework/ai/sessions/…/v-7k2q/","path":"tasks.ui"}}}   // another file
```

1. **Replay makes the Ref and nothing more.** It holds the `path` (and the `url`, if the target is in another file). Nothing is looked up yet, so the order of lines can't break it.
2. **It's resolved when first needed** (drawn, or read through `ref.target`):
   - **Same file:** `root.get("tasks.ui.tasks.c3")`, a few lookups (§3).
   - **Another file:** open that file's Store, `Item.open(url)`, which replays it once and keeps one root per url (`Store.for`, `core/Item/Store.js`, already does this), then `get(path)` on that root.
3. **A target that can't be found** draws a visible "gone" row naming the path. It's never silently empty.

**Built (build E, 2026-10-28, branch `worktree/browser-refs`):** `Ref` resolves in the browser too, through `Item.open(url)` over the live tail, with the id fallback, backlinks and forwards below: [core/Item/doc/ref.md](../../../Item/doc/ref.md). Before it, only node resolved one (`Task.resolver`).

### Moves: the options

| Option | How a ref is written | After a move | Cost |
|---|---|---|---|
| **Relative** (`..` to climb up) | `"..tasks.c3"` | breaks when either end moves | **no**: two ways to break |
| **Absolute path** | `{url, path}` from the file's root | breaks when anything on the path is restructured | simple; breaks on moves |
| **Absolute + id fallback** | `{url, path}`; the path ends in a random id | a miss looks the id up in an index built on first miss | works within one file, if ids are random |
| **Backlinks** (the owner's idea) | `{url, path}`, plus the target knows who points at it | the mover walks the backlinks and updates each ref | always fresh paths; the backlinks must stay true |
| **A forward at the old place** (like a web redirect) | `{url, path}` | the old spot gets `{moved_to: <new>}`, and old refs follow it | needs no list of referrers; ideal across files |

### Recommendation: absolute refs, backlinks in memory, forwards across files

1. **Refs are absolute:** `{path}` inside a file, `{url, path}` across files. Never relative.
2. **Backlinks, computed rather than stored, within one file.** On load, the root keeps a Map from each target to the refs pointing at it. It's built while the lines replay, so it's never out of date.
   - It answers "where is this task shown?" for free.
   - When something moves, the writer walks its backlinks and appends one line per ref, giving it the new path. The stored paths stay correct, and no index needs saving.
   - This is the owner's idea, with one change: the backlinks are computed, not written to disk (compute, don't recall: CLAUDE.md law 7).
3. **Across files: a forward, not stored backlinks.** Storing backlinks would mean writing into the target's file every time anyone references it: a two-file write that can drift. Instead, a move to another file leaves `{moved_to: {url, path}}` at the old place.
   - An old ref follows the forward.
   - When a ref resolves through a forward, the writer quietly appends the new address to it, so the next load goes straight there.
   - This is the same fix the pages seat proposed for a renamed page (a redirect instead of a 404).
4. **If a site-wide "what links here" is ever wanted,** node builds it as an index file by scanning the refs, the same way the search index is built. It's computed, never hand-kept.

## 7. Does one Item class serve every use? Yes

| Use | Shape | Depth | What it relies on |
|---|---|---|---|
| Session | 4 lists, a task tree | 2–4 | named hops; random ids; refs from the chat |
| Pages | `pages` keyed by name | any | names are its ids already (`List.key`) |
| Table | one List of thousands of rows | 2 | the Map: today's scan is quadratic past ~4,000 |
| Chat or channel | one List, appends | 2 | nothing new |
| Editor | a layer tree (or a flat `nodes` List with a `parent` field, Figma-style) | up to ~10 | path keys keep deep lines short; a flat structure is just another use of the same classes |
| Merging two agents' work | two lists into one | — | random ids |

Nothing here needs a second Item class. Flat or nested becomes a choice each structure makes with the same Item and List, not a fork of the base.

## 8. What changes in the code, when building is allowed

Small changes, each with a test:

1. `Store.hops` names the list at every hop.
2. The default List keeps an id → member `Map`; a subclass may choose another lookup.
3. `set()` accepts a dotted path key and hands the rest of the path to each level's own `get`. The store keeps writing nested lines.
4. `Item.get` stops searching lists (old lines only, with a warning).
5. `new_id()` makes 8 random characters; the item tool's `tasks.add` stops slugging titles.
6. Refs store the path; a miss falls back to an id index built on the first miss.
7. Old files still replay: the nested form and id-only lines keep working, with a warning.
