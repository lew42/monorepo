# Did the owner's words reach the mastermind? An audit of three dictations

This audit checks three of the owner's long dictations from 2026-09-28. Each one was checked by hand, item by item, against two things:

- what the VS Code tab passed on to a mastermind;
- what the new tool, `Server/refine.mjs`, made from the same words.

| Dictation | Asks in the ledger | Tab kept | Tab changed | Tab stricter | Tab dropped | Tool kept | Tool dropped | Raw words passed along? |
|---|---|---|---|---|---|---|---|---|
| [A: organization mastermind](runs/a/ledger.md) | 59 | 44 | 9 | 2 | 4 | 54 | 2 | yes, word for word |
| [B: consensus](runs/b/ledger.md) (`--collab`) | 38 | 28 | 5 | 2 | 3 | 28 | 1 | yes, word for word |
| [C: harness research](runs/c/ledger.md), tool's first pass | 54 | 38 | 4 | 5 | 7 | 40 | 5 | yes, word for word |
| C, tool after its repair round | 54 | — | — | — | — | *pending* | *pending* | — |

**The tool's other two outcomes.** The table above has no columns for "changed" and "stricter", so here they are for the tool:

- A: 2 changed, 1 stricter.
- B: 9 changed, 0 stricter.
- C, first pass: 7 changed, 2 stricter.

**How to read a ledger row.** Each ask is one thing the owner said they wanted, quoted in their own words. It gets one of four marks:

- `kept` means it arrived with the same meaning.
- `changed` means it was narrowed, reworded or flattened.
- `stricter` means a "maybe" became a rule, or the brief uses a word the owner never said.
- `dropped` means it never arrived.

The ledgers were written by hand before the tool ran, so the tool could not shape them.

## What the tab dropped or changed

The tab never lost the raw words. Every brief had a verbatim `owner-words.md` beside it, and said to read it. So a drop below is a drop from the *summary*, and a careful reader could still recover it.

### A: organization mastermind

| The owner's words | The tab's words | Why it matters |
|---|---|---|
| "the priorities, the weights … sizing, the scale and … grouping" | "Prioritize by weight" | How big each item looks on the card was the owner's picture of the card. |
| "the framework page … the framework core page … the framework core slash page page" | only `/framework/core/Page/` | Two pages the owner named ("I haven't seen it in a while") disappeared. |
| "the main page for any module should … have its own … jump point" | icon items on the paging docs only | A rule for every module shrank to one module. |
| "finding the right names … will be an ongoing process" | — (dropped) | The owner said naming is never done. The brief reads as if it is. |
| "making sure there's nothing … left on the table" | links to old audits, nothing more | The reason for linking the old audits is lost. |
| "a full site audit in turn, but in a prioritized way" | "Paging first. Set everything else aside." | The later tiers vanish. |
| "lists of items when it makes sense" | cross-references only | — |
| "whether they're inline or … full width" | — (dropped) | The two forms of the object card. |
| "just paragraph reading width" (the standard layout) | "one column, about 300–1000px" | The measure, the core of layout 1, is lost. |
| "left aligned looks … funny … centered … is also kind of awkward" | "(centred or left-aligned)" | The owner said both look wrong. The brief offers a choice between them. |
| "we had a whole page skill system … I haven't followed up" | — (dropped) | The owner's open question is never asked. |
| "the page is the path … the actual directory" | — (dropped) | The idea everything hangs on. |
| "I don't know if it's still using this index system" | "such as the AI 2 cards and board.jsonl" | A doubt became a fact. |
| "prioritize our token spend" | "Default to Sonnet for reading and Haiku for scans. Use Opus only to judge." | Model rules the owner never gave. |

### B: consensus

| The owner's words | The tab's words | Why it matters |
|---|---|---|
| "collaborative … benefit rather than bickering and analysis paralysis" | — (dropped, and never came back in any later brief) | This is the test the whole collab design should be judged by. |
| "Identify three different ways to solve it and then tell everyone else" | — (dropped everywhere) | A concrete method the owner gave. |
| "they're gonna learn a lot … which problems to solve" | — (dropped) | What builders learn is an output. Nobody captures it. |
| "a system … flexible for most use cases … seems to be the way to go" | "Make ONE flexible collaboration system" | A suggestion became a capitalised rule. |
| "I just don't see that working as well" | "never a free-for-all" | "I don't see it working" became "never". |
| "see how that works" (web search) | "for non-Claude models (OpenRouter's web plugin …)" | A general question was narrowed to one case. |
| "to have a folder of MD files is the best way" | "decide the one folder convention" | The owner's deeper doubt became a naming decision. |
| "not … every single decision, but when … architecting" | fan-out, with no trigger | Nothing says when a fan-out is worth its cost. |
| "summarizes … the landscape of what exists" | "prefer authoritative sources" | A map of what exists became a pile of saved pages. |
| "feedback about each kind of idea" | one favourite-plus-caveat vote | Per-idea feedback is lost. |

### C: harness research (split across three agents: lines 62, 63 and 64)

| The owner's words | The tab's words | Why it matters |
|---|---|---|
| "it just simply … cleans up and relays the transcription" | — (dropped) | This is today's whole task, dictated a day early. |
| "don't want to cook too many tokens … be efficient" | "Budget: about $15 in total" | A number the owner never said. |
| "Is it true? Is it logical? Can we dispute it?" | "true … logical … useful even if wrong" | A test the owner never gave was added. "Does this make sense?" was dropped. |
| "maybe we do have a configuration for it somewhere" | "the assistant model is set in config" | Two "maybe"s became a fact. |
| "I'm not sure if we should just call it a mastermind" | "the mastermind model is chosen per card" | An open naming question was settled without asking. |
| "I haven't really thought about that yet" (weight) | "heavier cards sort to the top" | A half-thought became a stated rule. (Line 64's "a proposal, not a build" softens it.) |
| "we need that whole assistant … process for every page" | — (dropped) | — |
| "what we want to be able to do on any card at any time" | — (dropped) | The owner's goal for the research system. |
| "it was broken when I clicked on it a few minutes ago" | — (dropped) | A bug report that went nowhere. |
| "number one, highly prioritized … most essential, most foundational" | missing from line 64's core bullets | The owner's first point about structured content. |
| "the amount of space … per card … rows or columns or both" | — (dropped) | How to lay out a card. |
| "it's possible you get fresh insight" | "reviews use a FRESH agent" | The owner's own doubt about fresh eyes is gone. |
| "we'll save that for another task" (agent switcher) | a research sub-area | Mostly fine, but "chat and dictation are one widget, everywhere" is lost. |

## The tool is being tested too: what `coverage.md` caught, and what it missed

`coverage.md` is the tool's own audit. It maps every sentence of the dictation to an ask, or marks it "context only" or "dropped".

| | A | B | C, first pass |
|---|---|---|---|
| Real drops (my ledger) | 2 | 1 | 5 |
| Real drops `coverage.md` flagged | 0 | 0 | 2 (the broken page; bigger cards sort to the top) |
| False "dropped" rows | 2 in the first build ("I'm gonna send this off"); 0 after the rebuild | 4 of 6 | 20 of 23 |
| Suggestion made into a rule, caught | 0 of 1 | — | 0 of 2 |

**What it got wrong, found by this audit:**

1. **Range citations break the count.** A brief that cites `[S15-S21]` counts only S15 and S21 (`citationsIn`, refine.mjs line 333). Every sentence in between shows as uncited, then gets called "context only" or "dropped". This caused 20 of C's 23 "dropped" rows and 4 of B's 6. It also hid real drops inside the ranges. Reported to the task mastermind, and being fixed. B's numbers above come from the file before that fix.
2. **Sentence-level coverage hides part-drops.** A long spoken sentence carries several ideas. It counts as covered if any one of them is cited. A's S28 ("nothing left on the table") and S67 (six layout ideas, including the measure) both show "covered" while part of each is lost. Most of my `changed` items live here.
3. **A hedge lost without a strength word goes unflagged.** "Doesn't seem like a bad way to go" became "Organize by methods and properties". "It probably should have padding" became "it needs padding". Only must, never, always and only are checked.
4. **"Context only" still drops things the mastermind needs.** "I'm gonna keep transcribing in a minute" is context, but the tab passed it on ("More dictation may follow") and the tool's brief did not.
5. **The first build flagged the owner's "send this off" as a dropped ask.** That was a false alarm, and it is fixed in the rebuild.

**What it got right:**

- It kept the owner's hedges as "the owner suggests…" and "the owner is unsure whether…".
- It added no budget and no model names.
- It kept six of the tab's worst misses:
  - "bickering and analysis paralysis";
  - "the page is the path";
  - "both alignments are awkward, an open problem";
  - "clean up and relay the transcription";
  - the owner's four review questions, word for word;
  - the page-skill follow-up.

**The `--collab` vote (B) added nothing.** Two voters each picked the other's draft. The 1-to-1 tie went to the cheaper model, and neither caveat was applied. It cost $0.31, a third of the run. The shorter Haiku draft that won made B's brief the most compressed of the three, with 9 changes.

## Verdict

**The tab** never lost the owner's words, because it always passed them along verbatim. But its summaries regularly turned the owner's doubts into rules (ONE, never, "set in config", a $15 budget, model names), and each dictation lost 3 to 7 asks. Some of those were the very goals the design should be judged by.

**The tool** kept more of what the owner said than the tab did on A and C, and the same on B (54, 28 and 40 kept, against the tab's 44, 28 and 38), and it almost never hardened a hedge. But its own audit, `coverage.md`, cannot yet be trusted: range citations broke it, and it misses drops inside long sentences. It caught 2 of 8 real drops, and raised false alarms by the dozen.

**The one change that would help most:** check coverage per *ask in the ledger*, not per sentence. Split each long sentence into its separate ideas first, then check each idea against the brief. That is what this audit did by hand, and it is where every miss in this report was found.

---

*Cost: runs a $0.75, b $0.97 (with `--collab`), c $0.77. Ledgers and runs are in [`runs/`](runs/). Minion-b, 2026-09-29.*
