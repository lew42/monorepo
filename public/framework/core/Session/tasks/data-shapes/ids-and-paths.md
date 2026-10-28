# Ids and paths: how a line names the item it changes

The owner's questions (2026-10-28), following [flow-and-ids.md](flow-and-ids.md):

- What is the `t-` in `t-c3`?
- Isn't searching every list a bad idea, and part of why replay is slow?
- Could a line name the list, or use a dotted path, instead of a tower of braces?
- Ids vs UUIDs vs counters: which survives two agents, two devices, and merging?
- "I'd rather figure this out once and for all", for every use, not only sessions.

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
- **Each List keeps a `Map` from id to member,** updated on add, remove and move. A hop is then one Map lookup. Ten levels deep is ten lookups, which costs nothing.
- **`Item.get` stops searching lists.** It still answers an old line (one with no list name), but only as a fallback, and it logs a warning.
- **Ids only need to be unique among siblings.** That was the 10-03 rule, and it's enough once every hop names its list. **No file-wide uniqueness, and no file-wide index.**

This replaces the design seats' "unique per file, plus an index". Their reason for the index was that lines skipped the list name. Once every line names it, the index has no job left, except references (§6).

## 4. Braces vs a path: the same thing, spelled two ways

A deep item needs one level of braces per hop. A **path key** says the same thing flat:

```js
{"tasks":{"ui":{"tasks":{"c3":{"complete":{}}}}}}      // nested
{"tasks/ui/tasks/c3":{"complete":{}}}                   // path key: expands to exactly the line above
```

- **Same walk, same meaning:** `set()` splits the key on `/` and walks the hops. The code for this already exists, `Item.locate(path)` (`Item.js:190-206`), kept since 10-03 to read old lines.
- **Why `/` and not `.`:** it's the same separator as a url. One address then runs from the site root to a field: `/framework/ai/sessions/…/v-7k2q/#tasks/ui/tasks/c3`. A dot works too, as long as ids never contain one.
- **What was dropped on 10-03** was a separate `at` key beside the delta (`{"at":"a/b","set":…}`), so there would be one grammar. A path *key* keeps that one grammar: it's only a shorter way to write the nesting.
- **Recommendation:** read both forms. Write the path form whenever it's two or more hops deep.

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

## 6. References: path first, id as the fallback

A reference (the chat showing a task) stores the **path** and the **id**: `{"ref":"tasks/ui/tasks/k2p9x4mq"}`.

- **Normal case:** follow the path, a few Map lookups.
- **The target moved:** the path misses. The root then looks the id up in an index, which is built the first time a miss happens, and never saved. Because ids are random, the id alone finds it.
- **Across files:** the url plus the path: `/…/v-7k2q/#tasks/ui/tasks/k2p9x4mq`.

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
2. Each List keeps an id → member `Map`.
3. `set()` accepts a `/` path key, written whenever a line is two or more hops deep.
4. `Item.get` stops searching lists (old lines only, with a warning).
5. `new_id()` makes 8 random characters; the item tool's `tasks.add` stops slugging titles.
6. Refs store the path; a miss falls back to an id index built on the first miss.
7. Old files still replay: the nested form and id-only lines keep working, with a warning.
