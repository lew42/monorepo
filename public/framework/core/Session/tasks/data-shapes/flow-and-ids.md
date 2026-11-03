# How it flows, and how a line finds its item

The owner asked this on 2026-10-28, after reading the [synthesis](synthesis.md): "Give me the flow of all the things… how the deltas are applied… I need to wrap my head around this to be able to approve it." The worries were three:

- UUIDs on everything;
- what "nested storage, flat lookup" means;
- whether a move means chasing every child's id.

This page answers them, for any Item tree, not only sessions.

> **Refined the same night: [ids-and-paths.md](ids-and-paths.md).** Every line names its list, and each List looks members up in a Map, so ids need to be unique only among siblings, and no file-wide index is needed (only a fallback for references). Ids are short and random, with no type letter. Where §3–§5 below say "unique per file, plus an index", that page wins.

## 1. Three questions that are usually mixed up

1. **What shape is the object in memory?** A tree. A Session holds Lists; a List holds Items; an Item can hold Lists. This is today's Item/List, and it stays.
2. **What is on disk?** Not the tree. On disk is a log: one line per change. A snapshot (the tree written out whole) is only a cache beside the log.
3. **How does a line say which item it changes?** This is the real question. "Nested vs flat" is about the *address* in a line, not about how the data is stored.

## 2. How a line is applied today (a recursive set)

A line is a nested JavaScript object. `Item.set(line)` takes each key, finds the child with that name, and hands it the rest. The child does the same, one level at a time, until it reaches a verb (`set`, `add`, `move`, `complete`) and runs it. No dot-paths are involved; the nesting *is* the path.

```js
{"tasks":{"add":{"id":"t-ui","title":"UI"}}}       // session.get("tasks") is a List → List.add(...)
{"t-ui":{"tasks":{"add":{"id":"t-c3","title":"Fix the tab bar"}}}}   // session finds t-ui, t-ui finds its tasks list, add
{"t-ui":{"t-c3":{"complete":{}}}}                   // session → t-ui → t-c3 → complete()
```

At each level, `get(key)` looks in this order (`core/Item/Item.js`, `get`):

1. an own property;
2. a data field;
3. a member with that id in any of this item's lists.

**The bug in this, found by seat (a):** step 3 searches *every* list. If a sentence and a card are both called `s1`, a change meant for the card can land on the sentence on replay, with no warning. The fix is to name the list in the line, or to make ids unique in the file. That's §4.

## 3. What "nested storage, flat lookup" means

- **Nested storage:** in memory, the tree is a real tree. A subtask is *inside* its parent's `tasks` list. The snapshot looks like the tree.
- **Flat lookup:** the root also keeps an `index`, a Map from id to item, built in memory as items are added. **The index is never written to disk.** It's like the index at the back of a book: computed from the pages, not stored separately.

With the index, a line can skip the levels:

```js
{"t-c3":{"complete":{}}}            // the root finds t-c3 in its index, at any depth
```

The long form above still works too. The index is just a shortcut the root checks first.

**Why have the shortcut?**
- The writer only needs to know the id, not the item's whole ancestry. An agent completing a task doesn't have to look up who its parent is.
- **An address that survives a move.** Write `{"t-c3":…}` before or after `t-c3` moves, and it finds the same item.
- Two writers can't disagree about where something is.

## 4. Moving something: one line, and the children come along

**No dependency chase.** A move is one line, and the subtree travels with it, because the children are *inside* the item:

```js
{"t-perf":{"tasks":{"move":{"id":"t-c3","after":null,"from":"t-ui/tasks"}}}}   // t-c3 and all its subtasks are now under t-perf
```

(The receiving list takes the move and names where the item came from. That's today's real line shape, `core/List/List.js`, `move`.)

After the move, the in-memory index still maps `t-c3`, and every child id, to the same objects; only their parent changed. Nothing on disk is rewritten.

**The one hard case is a move to another file** (a task handed to another session). The subtree is copied whole into the new file as one `add` line. The old file gets a `moved` line that points to the new place. There, ids must not clash with the target file's ids, which is the reason ids should be random rather than counters (§5).

## 5. Ids: short, random, unique per file. Not UUIDs

The id only has to be unique **inside one file**. Across files, the path does the work:

```
t-k2p9x4mq                                    inside its own file
{url: "/framework/ai/sessions/…/v-7k2q/", path: "tasks.ui.k2p9x4mq"}   from anywhere else (no #; dotted paths: ids-and-paths.md)
```

- **Short:** a type letter plus 8 random characters (10 characters, where a UUID has 36). With 100,000 items in one file, the chance of any clash is about 1 in 500. The writer refuses a clash anyway, and the maker draws again.
- **Random, not counters:** your phone and your PC can both make ids offline without asking anyone. Counters (`t1`, `t2`) would clash between two devices, or two agents writing at once.
- **Never positional:** a line never says "the 3rd item". Positions change when things are reordered; ids don't. Order is kept by the List itself (`after: <id>`).
- **Prior art.** By its own public description, Figma's multiplayer works the same way: each object has a short id made from the client plus a counter, and is found in one flat map. A move just changes the object's parent.

## 6. The flow, from your voice to a finished task

| # | What happens | Saved? | The line on disk |
|---|---|---|---|
| 1 | You talk. Whisper returns rough text every few seconds; the browser shows it as a grey, live sentence | **No**: browser only (the raw chunks are dropped) | none |
| 2 | You pause. The sentence is final. The browser makes its id and sends one line | yes | `{"hear":{"id":"s-k2p9x4mq","text":"The tab bar is broken on my phone.","prompt":"p-b2a7"}}` |
| 3 | Servex (the one writer) appends it. `Session.hear()` adds the sentence to `sentences` and to the current **draft prompt** in the chat, made if there's none. One line, both effects | — | — |
| 4 | The dev server sees the file grow and pushes the line to every open tab. Each tab runs the same `hear()`. Your own tab already showed it, and skips the echo | — | — |
| 5 | More sentences join the same draft prompt until a long pause or a topic change | yes | more `hear` lines |
| 6 | The smart agent, in batches rather than per sentence, cleans and titles the prompt. **The raw sentences are never edited**: the clean text lives on the prompt | yes | `{"p-b2a7":{"refine":{"title":"Fix the mobile tab bar","text":"…"}}}` |
| 7 | It files the ask: a task under a core task. The chat gets a reference to the task, not a copy | yes | `{"file":{"ask":"…","task":{"id":"t-c3","title":"…","under":"t-ui"}}}` |
| 8 | It replies, anchored to the words it answers | yes | `{"reply":{"id":"r-d4","text":"On it.","to":{"to":"s-k2p9x4mq","words":[2,4]}}}` |
| 9 | Someone finishes the task. Every place it's shown (the chat reference, the task list) updates from this one line | yes | `{"t-c3":{"complete":{"outcome":"…","evidence":["…"]}}}` |

**Where is the paragraph?** The prompt *is* the paragraph: a draft while you talk, refined once the agent has titled and cleaned it. The 10-27 decisions named it `Card`; today's code keeps a `paragraphs` array inside the Prompt. Pick one name. "Paragraph" is fine, if that's the word you think in.

**A typo in one sentence** can get a `fixed` field (design-3): the corrected text is shown, and the raw text stays underneath.

## 7. Why four lists, and the alternatives

Each list holds things with a different life:

| List | Holds | Its life |
|---|---|---|
| `sentences` | your words | never edited, only added; the record of what you said |
| `chat` | prompts, replies, questions, cards, references | the conversation in display order |
| `tasks` | the few core tasks and their subtasks | outlives the conversation; a tree |
| `sessions` | one pointer per child session | each child has its own file |

The index isn't a fifth list. It's in memory only.

| Alternative | What it costs |
|---|---|
| **One list for everything** (today: everything in `tasks`) | It's what produced the 223 "open tasks": prompts, questions and child sessions all counted as work |
| **Sentences inside the chat**, moved into a prompt when grouped (design-3) | One fewer list, but your words move whenever the grouping changes, and every anchor has to follow them |
| **Fully flat** (Figma-style: every object in one map with a `parent` and a position) | A move is one field and lookups are trivial, but the tree must be rebuilt for every view, and a cycle (A inside B inside A) becomes possible. It's worth it for the editor's thousands of layers; for a session it's more machinery than needed |

## 8. The recommendation, in one breath

- Keep the tree in memory (today's Item/List).
- Write one line per change.
- Address by a short random id that's unique in the file, found through an in-memory index. The long nested path still works.
- Move a subtree with one line.
- Point across files with path + id.
- No UUIDs, no positions, no stored index.
