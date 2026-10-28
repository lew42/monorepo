# Chat architectures: four ways to hold a voice session's data

> **Decided 2026-10-27: Option B ("the chat is the spine"), not the Option A recommended below.** See [design-decisions-2026-10-27.md](design-decisions-2026-10-27.md). The options stay as the record of the alternatives.

Design only; nothing here is built. It sits beside [system-proposal.md](system-proposal.md) (the agreed shape, "Class architecture (final)") and [system-map.md](system-map.md) (what runs today). Where a claim is checked against the code it says so; guesses say "estimate".

**The two rules every option must keep:**
1. **Raw is write-once.** Every spoken or typed sentence is stored once, exactly as heard, and never edited. The raw transcript is a pure function of that list, so it can always be rebuilt.
2. **Nothing the AI writes is load-bearing.** If an AI is slow, wrong or absent, the chat still shows every sentence in order. Cleaned text, grouping, titles, replies and tasks are layers on top that can be replaced.

## Names (used by all four options)

- **`Sentence`, not `Prompt`.** One raw unit. Today `Prompt extends Task` (`core/Task/Prompt.js`), with tests and readers (`PromptRecords`, `PromptTrace`) built on that. Reusing the name for a light class forces a legacy path; a new name does not. `Prompt` then keeps meaning "what the owner asked, as an old session stored it". (Option D below is the one that wants `Prompt` back, for a group.)
- **`Card`, not `Section`.** A section reads as a full-width page row; a card is what the owner sees: title, summary, the sentences under it. `Card { id, title, summary, said: [sentence ids] }`.
- **No `Paragraph`.** The only thing it added was an id list between a section and its prompts. A card's `said` list does that job. (The class that exists today lives inside `Prompt.js`, lines 11-34, and holds `sentences` plain data; it goes away with `Prompt`'s old role.)
- **`Chat { messages: List<Message> }`** keeps its name for the data. The view classes (`ChatPanel`, `ChatV2`, `ChatV3`, `ext/drawer/ChatView`) are views; if the clash bothers, rename the data `Conversation`. Verified: no `Chat` or `Message` data class exists today, and nothing named `page.chat`.
- **`AITask`** unchanged, with `from: <card id>`.

## Shared pieces

```js
class Sentence extends Item {            // write-once
  id; raw; said_at; via;                 // via: "voice" | "typed"; raw never changes
  clean;                                 // optional, the assistant's tidy version; raw stays
}
class Card extends Item { id; title; summary; said = []; }       // said: Sentence ids, in order
class Message extends Item { id; by; text; at; re; embeds = []; kind; }  // kind: reply | note | question
class AITask extends Item { id; title; state; from; /* existing Task fields */ }
```

**Raw transcript regeneration (same in A, B, D):** `session.sentences.sort(by said_at).map(s => s.raw).join(" ")`. Proof it is complete: a node script (`compute, don't recall`) replays the append-only `session.jsonl` and checks that every `sentences.add` line has a matching sentence and that no later line touched `raw`. The item tool refuses any delta that sets `raw` on an existing sentence (new rule in the allow-list, `page_tools.js` ~423).

**Embeds (all options):** a message carries `embeds: [ids]`. The view resolves each id against the session's live lists and draws that object's card inline. The chat view already redraws "only the card a live line touched" by id (`ChatV3.update`), so an embedded card or task updates itself when the assistant edits the card or task. The assistant never rewrites the message.

---

## A. Lists plus a derived chat (the current agreed shape, with embeds)

The session holds separate lists; the chat is a view that merges them by time. Only the AI's own words are stored as messages.

```js
class AISession extends Item {
  sentences;   // List<Sentence>   code writes
  cards;       // List<Card>       assistant writes
  tasks;       // List<AITask>     assistant writes
  chat;        // Chat { messages: List<Message> }   assistant writes replies/notes
  flow() { return merge_by_time(this.sentences, this.cards, this.chat.messages); } // computed, never stored
}
```

**Render:** `flow()` yields, in time order: each sentence (grouped under its card, gray until a card claims it or 8 s of quiet), each card at the moment of its first sentence, each message. A task appears nested under its `from` card and again wherever a message embeds it.

**Writes (item tool deltas):**
```json
{"sentences":{"add":{"id":"s41","raw":"we need a way to filter tasks by date","said_at":"..."}}}
{"cards":{"add":{"id":"c7","title":"Filter tasks by date","said":["s41"]}}}
{"c7":{"said":{"push":"s42"}}}
{"s41":{"clean":"We need a way to filter tasks by date."}}
{"tasks":{"add":{"id":"t9","title":"Date filter on the task list","from":"c7"}}}
{"chat":{"messages":{"add":{"by":"assistant","text":"Filed it.","re":"s42","embeds":["t9"],"kind":"reply"}}}}
```
(`push` on a plain id array is a new op, ⚠ not in the item tool today; `sentences`, `cards`, `chat` are new allow-list keys.)

**Pros:** one source of truth per fact (law 6); order is computed, so it cannot disagree with `said_at`; each list is independently small, addressable and testable; closest to what V3 already does (a session replayed into real objects, redraw by id). **Cons:** the view does the merging, so every renderer needs the same merge (put it in one `flow()` on the model); a card never appears "again later" in the flow unless a message embeds it, so "look at this" needs a message.

## B. Chat is the spine (stored entries)

The chat is one stored, ordered list of entries; every other list is a record entries point at.

```js
class AISession extends Item {
  sentences; cards; tasks;                 // records
  chat;                                    // Chat { entries: List<Entry> }  the order is stored
}
class Entry extends Item { id; at; kind; ref; text; by; }
// kind: "said" (ref = sentence) | "card" (ref = card) | "task" (ref = task) | "reply" | "note"
```

**Render:** walk `chat.entries`; draw each by `kind`, resolving `ref` live. **Writes:** as A, plus one `chat.entries.add` per event. Code (not the AI) appends the `said` entry with each sentence and the `card`/`task` entry whenever one is created, so the AI writes only `reply` and `note`.

**Pros:** order and visibility are explicit (a card can be pinned, hidden, or re-shown later without a message); one list answers "what did the chat look like at time T"; trivially streamable (render the tail). **Cons:** two orderings to keep equal (`entries` against `said_at`); one more write per event; a missed `entries.add` means a sentence exists but never shows, which breaks rule 2. The hook that appends entries becomes load-bearing.

## C. Event log only; everything is a fold

The session stores one append-only `events` list. Sentences, cards, tasks, chat and the raw transcript are all folded from it on read (what `ChatV2Model.fold` already does by hand, and what `Session.replay_line` does for tasks).

```js
class AISession extends Item { events; /* sentences, cards, tasks, chat, flow() = fold(events) */ }
// event: { at, by, type: "said" | "card.add" | "card.set" | "task.add" | "reply" | ..., ...fields }
```

**Writes:** `{"events":{"add":{"type":"card.set","id":"c7","title":"Date filter"}}}`. **Raw transcript:** `events.filter(type==="said")`. **Render:** fold once, then apply each new event in place.

**Pros:** the most rock-solid storage (nothing is ever updated, only appended; time travel is free); one write path, one validator. **Cons:** the biggest rewrite (every reader, the allow-lists, the V1 `{place}` lines, the legacy folds); the item tool's mental model is "set a field", and `card.set` re-implements it; every reader needs the same fold, so the fold becomes a hidden second schema; hardest for an AI to write correctly (it must know event types, not just fields).

## D. Prompt groups its sentences (the assistant decides grouping)

Keep `Prompt` as a container the owner would recognise, with sentences inside. One open Prompt by default; the assistant closes it and opens another when the topic turns.

```js
class Prompt extends Item { id; sentences = []; /* Sentence ids */ title; summary; open; }
class AISession extends Item { sentences; prompts; tasks; chat; }   // cards ARE prompts
```

**Render:** one card per Prompt, its sentences inside, gray while `open`. **Writes:** `{"prompts":{"add":{"id":"p3","sentences":["s41"],"open":true}}}`, `{"p3":{"sentences":{"push":"s42"}}}`, `{"p3":{"open":false,"title":"..."}}`.

**Pros:** matches today's mental model ("a Prompt is one thought") and V3's draw; fewer objects. **Cons:** it is Option A with `Card` renamed `Prompt` and an `open` flag, so it keeps the word that already means a Task (the legacy collision), keeps grouping decisions in the data model instead of the view, and "open" is shared mutable state two writers (code and assistant) must agree on. Sentence-level granularity is still needed for raw, so it gains nothing over A.

---

## The fast seat: needed or not?

**Today (verified):** one long-lived `voice-assistant` agent per voice session, woken for every sentence, effort low, writing one `{place}` per sentence. `v-sq8y7db` has 1,654 `place` lines, 821 of them "nothing"; `v-9dvbbrn` has 975. The smart seat (Opus 5.5 medium) sees a sentence only through the first `say()` and the 8 s refine pass. The role cost $844 in two weeks (the earlier audit's figure; a script gave $263 for the same role, and that gap is unresolved, so treat the order of magnitude as the fact).

| | Fast seat on | Smart seat alone (batched) |
|---|---|---|
| Latency to a tidy sentence | about 2-4 s (estimate: low effort, no tools) | about 8-20 s (the 8 s quiet wait plus an Opus call; estimate) |
| What the owner sees meanwhile | gray raw, then tidy | gray raw (code writes it at once, no AI) |
| Calls | one per sentence, half are "nothing" | one per quiet batch, a few sentences each |
| Cost driver | the long-lived context grows every sentence; each wake re-reads it (hypothesis, not measured) | fewer, larger calls on a dearer model; no running total known |
| Moving parts | two agents, two views of the same words, a rule that fast never revises | one writer, one order of events |

**Latency matters less than it seems:** the raw sentence is written by code the instant Whisper returns, so the chat never waits on an AI to show what was said. A tidy version arriving 10 s later is invisible to someone talking.

**Recommendation: pause the fast seat as a placer; keep it behind the existing switch.** `session-assistant.txt` already selects the seat (`session_assistant()`, `Sessions.js` 70), so trying this is a config change. Default placement becomes a code rule: a new sentence joins the last card if it is within 8 s, else starts a new unplaced card. The smart seat gets each batch (closed by the 8 s quiet, a question mark, or a typed line), and does placement fixes, `clean`, titles, tasks, questions and replies in one call. Measure before deleting: run a day with each setting and compare `node Server/role-spend.mjs` totals and the owner's complaints.

## Does the chat hold everything, or is it composed?

- **Composed, with stored messages only for the AI's words (A).** Sentences, cards and tasks are records; the chat flow is computed. This avoids duplicate truth. Cards and tasks get into the flow by themselves, at creation time, because the flow merges by time; no AI "puts" them in.
- **Stored entries (B)** only pays if the chat must differ from the records (pinning, hiding, replaying "the chat as it looked"). Nothing asked for that yet.

**How a card gets into the chat and stays current, with no manual update:** the card is created once (`cards.add`), appears in the flow by its time, and every later `{c7:{title:...}}` line redraws it where it stands. A message can also *embed* it (`embeds:["c7"]`), which is the "see this" case; that embed is a reference, so it too updates for free.

## Recommendation

**Option A with embeds, the names `Sentence` and `Card`, and one seat.**
1. Lists are the records; the chat flow is computed (`AISession.flow()`); `chat.messages` holds only the assistant's replies and notes, each with `re` and optional `embeds`.
2. `Sentence` is write-once and light; legacy `Prompt` stays as is for old sessions, read through a compat fold, so nothing breaks.
3. The fast seat stops placing; code writes sentences and a default placement; the smart seat batches and decides.
4. Revisit B only if pinning or "the chat at time T" is asked for, and C only if a replay or audit need outgrows the append-only log we already keep.

**What does not hold against the code (verified 2026-10-26):** `page.chat` does not exist; no `Chat` or `Message` data class exists; `push` is not an item-tool op; the keys `sentences`, `cards`, `chat` are not in `SESSION_KEYS` (`page_tools.js` ~417); V1 `{place}`, `{summary}`, `{refined}` and `{chat}` lines and `ChatV2Model.fold` all need a compat read; `Sessions.refine` (`Sessions.js` 666) still cleans long sentences a second time outside the seats; V3 (`ext/Chat/v3/`, 19 checks) draws Prompts as they are today (new words appended to the newest Prompt), so it already supports "a card per thing, redraw by id" but has no Sentence list, no embeds and no completion rule from Servex.
