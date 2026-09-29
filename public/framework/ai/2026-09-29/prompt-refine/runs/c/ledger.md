# Dictation C — the harness and research one (2026-09-28)

**What this is.** Every distinct thing the owner asked for, or said matters, in one dictation, each checked against what the VS Code tab passed on. This was read by hand, before any tool was run.

- **Source:** `.claude/prompts/2026-09-28.jsonl`, line 61 (about 12:04 PM, 12,304 characters, the longest of the three). The line number was checked and is right.
- **What the tab passed on:** it split this dictation across three agents, so all three messages are scored together as one relay:
  - line 62, the spawn prompt for task-mastermind-harness-research;
  - line 63, the review process, the architect review and structured content, sent to mastermind-servex-3;
  - line 64, the structured-content design, sent to minion-structured-content-design.
- **The brief named a file that does not exist.** My brief pointed at `ai/2026-09-28/harness-research/requirements.md`. There is no such file. Line 62 *is* the brief. The `requirements-round1.md` and `requirements-round2.md` in that folder were written later by the harness mastermind, not by the tab.
- **Were the raw words passed along? Yes, and well.** [`harness-research/owner-words.md`](/framework/ai/2026-09-28/harness-research/) holds line 61 word for word (checked by exact string match). All three relays point to it, and line 64 even names the exact passage to read.

**Status words:**

- `kept` means it is in the relay with the same meaning.
- `changed` means it is in the relay, but narrowed, reworded or flattened.
- `stricter` means a suggestion became a rule, or the relay uses a word the owner never said.
- `dropped` means it is not in the relay.

## The research task

| # | The owner's words (trimmed) | Status | The tab's words, where it matters |
|---|---|---|---|
| 1 | "spawn, create a task, a mastermind … use the research system … the mastermind should probably orchestrate it" | kept | line 62 "You own one task … run through the site's Research system" |
| 2 | "use a work tree and whatever" | changed | line 62 "Use a worktree for any code you touch; the research files themselves can go straight into the main tree". The exception is the tab's own. |
| 3 | "either open router or just going directly to the providers like Google's Gemini, uh, Anthropic, OpenAI, Grok, both Groks really" | kept | "Anthropic, OpenAI, Google Gemini, xAI Grok, Groq". This correctly reads "both Groks" as two companies. |
| 4 | "open router is pretty … cheap, but … is it gonna … have feature parity with all the individual ones" | kept | "feature parity" |
| 5 | "each API is going to work differently … a user experience that can just seamlessly switch to any model … a lot of hurdles … API inconsistencies" | kept | "API inconsistencies (tools, streaming, caching, thinking)" |
| 6 | "I want to create our own AI harness system um, to use with Open Router" | kept | the task's title |
| 7 | "Open Router has an agent … package … creating our own harness might be better … not sure about that in terms of managing the file context" | kept | "OpenRouter's own agent package vs. our own harness" |
| 8 | "we have MCP servers … right now we're using Claude Code SDK for spawning minions … you need to be fundamentally integrated into the whole system" | kept | "how it replaces the Claude Agent SDK inside Servex … so spawning is model-agnostic" |
| 9 | "work with the Servex mastermind, you know, make sure he's involved and kind of has like a review" | kept | line 62 step 5; line 63 #1 |
| 10 | "don't want to cook too many tokens on this. So try and be efficient" | stricter | "Budget: about $15 in total; say the spend at every step." The owner gave no number. |
| 11 | "a preliminary round with like an opus, maybe one opus and one sonnet doing some research" | kept | "Round 1: ONE Opus and ONE Sonnet" |
| 12 | "then maybe start fresh and have another opus and or sonnet review … the preliminary plan" | kept | "Round 2, fresh eyes: a NEW Opus (and optionally a Sonnet)" |
| 13 | "Work with the Servex mastermind to document what works" | kept | line 63 #1 "Document what works in Servex/doc/" |
| 14 | "figure out how … to use open router to switch to any … provider quickly" | kept | the first sub-area |
| 15 | "in the future … pay careful attention to the cost" | kept | "cost reporting", "cost per turn" |
| 16 | "fleets of minions to use different models to … approach the same task and get different opinions … cross-reference other people's stuff" | kept | "multi-model fleets with cross-review" |
| 17 | "does this make sense? Is it true? Is it logical? Can we dispute it?" | stricter | line 62 judges "is it true (the premises), is it logical (the argument), and is it useful even if wrong". "Useful even if wrong" is the tab's own test. "Does this make sense?" is gone. |
| 18 | "this is sort of what we want to be able to do on any card at any time" | dropped | Research and cross-review on any card was the owner's goal for the system. It is not in the relay. |
| 19 | "this research system, we want it to be very simple and clear. We want to see the structure of the research … I want to see structured content" | kept | "The research page must show STRUCTURE, not paragraphs" |
| 20 | "the file context in terms of just when to list files, a skill system … a Claude.md plus skills that are loaded on demand … MCPs … tools and a loop … auto compact the context" | kept | the harness-parts sub-area |
| 21 | "session IDs to kind of fork and reuse the session … come back to … a previous session, a couple days later … ask a question and it just reuses … the context" | kept | "session ids with fork and resume" |
| 22 | "we need to see the cost. The open router API should have the cost built into it" | kept | "cost per turn" |
| 23 | "permissions and sandboxing for the harness … the work trees" | kept | the permissions sub-area |
| 24 | "if you have a work tree, you probably should have … your own dev server" | kept | "worktrees, each with its own dev server" |
| 25 | "use node for as much as we can … node can pass it along to bash … more control over the IO … responding programmatically versus … relying on the AI's interpretation" | kept | "node rather than bash for control over input and output" |
| 26 | "first we're going to research it, but then … start with some fresh masterminds based on what was gathered … and then go ahead and build the harness … let's get that research going and work on building the harness" | changed | "Building the harness is NOT part of this task", plus a preliminary plan with a build order. The order is kept, but no follow-on build task was set up. |
| 27 | "I'm not sure where the whole system design stuff is at … it was broken when I clicked on it a few minutes ago" | dropped | A bug report about a page, in none of the three relays. |

## The review process (line 63)

| # | The owner's words (trimmed) | Status | The tab's words, where it matters |
|---|---|---|---|
| 28 | "tell the Servex mastermind to build into the system, the task system, a review process" | kept | line 63 #2 |
| 29 | "if the same agent that writes all the code tries to review their own code, they're going to be heavily biased … start with a fresh agent" | kept | "an agent reviewing its own code is biased by its own context, so reviews use a FRESH agent" |
| 30 | "you'd probably get the exact same outcome … similar weights and biases … but if you ask it for a fresh opinion, it's possible you get fresh insight" | changed | The owner's own hedge (a fresh agent may well say the same thing) is dropped, so the relay reads more certain than the owner was. |
| 31 | "A review process should be built into most tasks … a simple CSS fix, you don't really need a complex review" | kept | "nothing for a one-line CSS fix, a full review for anything new" |
| 32 | "taking the screenshots … Is the space used properly? … the right things in the right order? … able to find everything … Navigation is super important" | kept | line 63 lists all four questions |

## Structured content (lines 63 and 64)

| # | The owner's words (trimmed) | Status | The tab's words, where it matters |
|---|---|---|---|
| 33 | "the Servex Mastermind should … spawn a minion to design a system to architect structured content" | kept | lines 63 #3 and 64 |
| 34 | "number one, highly prioritized … the most essential, most foundational, most visual and like familiar things" | dropped | This was the owner's first point, and it is not among line 64's five core bullets. The minion was told to read the passage word for word, so the point was available to it. |
| 35 | "icon items where we can have like three to five named things per section and maybe multiple sections" | kept | "named items, 3–5 per section" |
| 36 | "an outline creates like this picture using words … the parent items and then the number of child items and … grandchild items" | kept | "sections nested like an outline, so the words make a picture" |
| 37 | "that's the structure of the content that … we need to work on for pretty much all the UI cards" | kept | "Content is structure first" |
| 38 | "the amount of space that we want to use per card and what can go on there … what goes first … how to divide the card into either rows or columns or both" | dropped | How to budget a card's space and divide it into rows and columns is not in line 63 or 64. |
| 39 | "lean into structured content … instead of … three paragraphs … a bulleted list, a … nested list" | kept | "Prefer a nested list over paragraphs." |
| 40 | "a list is sort of like, could be a UI card. You don't necessarily need a background" | kept | "A list can be a card without a background." |
| 41 | "does it need a background? … you probably want to have either option. If it has a background, it probably should have … padding" | kept | "does it have a background? With a background it gets padding; without one, it gets no padding" |
| 42 | "you can nest these things … you don't want to put things in too many boxes" | kept | "Blocks nest, but don't box everything." |
| 43 | "a background with a like title and then a, three cards on it … like a navigation and it puts a label on top" | kept | "a background panel with a title and 3 icon cards on it, which amounts to labelled navigation" |
| 44 | "instead of having a picture on the card, it's … just a big icon with the name below it … especially if they're big ideas" | kept | "a big icon with its name below it" |
| 45 | "different sizes of these icon cards" | kept | "the icon card in 3 sizes" |
| 46 | "I don't know if the page itself specifies its weight … Maybe we use like a generic weight … bigger cards naturally get sorted to the top. I haven't really thought about that yet" | stricter | Line 64's core bullets state "heavier cards sort to the top" as settled. Its deliverable #3, "a proposal, not a build", keeps the owner's doubt, so the damage is small. |

## The chat and dictation widget, and the assistant

| # | The owner's words (trimmed) | Status | The tab's words, where it matters |
|---|---|---|---|
| 47 | "an agent switching UI for … the little dictation widget … the dictation widget is really like the chat widget … everywhere we want chat, we want dictation … we'll save that for another task" | changed | Became a research sub-area. "Chat and dictation are one widget, everywhere" is lost. |
| 48 | "when we … click to make a new card we want to be able to switch models and dictate in real time" | kept | "the mastermind model is chosen per card" |
| 49 | "we need that whole assistant … process for every page" | dropped | An assistant on every page is not in the relay. |
| 50 | "maybe the assistant is kind of more of a transparent thing where we … don't necessarily need to choose the model … although maybe we do have a configuration for it somewhere" | stricter | "the assistant model is set in config". Two "maybe"s became a fact. |
| 51 | "right now we're calling it like the manager I'm not sure if we should just call it a mastermind" | stricter | "the mastermind model is chosen per card". The owner's open naming question was settled without asking. |
| 52 | "the assistant would see everything and do some like quick real-time updates … we could find a good model for it whichever … costs … effective" | dropped | — |
| 53 | "it just simply … cleans up and relays the transcription to the model" | dropped | The assistant's job, to clean up and relay the dictation, is today's whole task a day early. It is not in the relay. |
| 54 | "let's add … another task here for … the dictation process … a playground … I'm gonna send this off … then I'm gonna dictate the dictation updates" | kept | The tab waited; the owner dictated it next (line 70). |

## What the tab added that the owner never said

- "Budget: about $15 in total; say the spend at every step".
- "Post progress there, two sentences at a time, via POST …".
- "the topic tree first … with the claim count under each, the verdicts, then detail on click". This is a fair way to turn #19 into a build.
- "If the Research schema can't record those three separately, use the `why` field with the prefixes …". This is a workaround, and it is logged as a gap.
- "Building the harness is NOT part of this task".
- Line 64's deliverables: the demo page at `/framework/ux/Content/structure/`, a decision guide in the `content` skill, and screenshots at 1920 and 3440.

## Tally

- **Items in the ledger:** 54.
- **The tab's result:** 38 kept, 4 changed, 5 stricter, 7 dropped.
- **Raw words passed along:** yes, word for word, with the exact passage named.
