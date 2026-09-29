# Dictation B — the "consensus" one (2026-09-28)

**What this is.** Every distinct thing the owner asked for, or said matters, in one dictation, each checked against what the VS Code tab passed on. This was read by hand, before any tool was run.

- **Source:** `.claude/prompts/2026-09-28.jsonl`, line 219 (about 1:51 PM, 8,959 characters). The line number was checked and is right.
- **What the tab passed on:**
  - line 220, a seven-point summary sent to mastermind-servex-3 about card [`agent-work-on-every-page-sanity-checks-c`](/framework/ai2/2026/09/28/agent-work-on-every-page-sanity-checks-c/);
  - line 221, an added question about other consensus systems and web search.
- **The later hops:** from line 220, mastermind-servex-3 wrote the "Added" section of the card's `design.md`, then two briefs, [`collab-rounds/requirements.md`](/framework/ai/2026-09-28/collab-rounds/) and [`source-library/requirements.md`](/framework/ai/2026-09-28/source-library/). Those hops are not the tab's work, so they are noted but not scored.
- **Were the raw words passed along? Yes.** The card holds `owner-words-2.md`, which contains line 219 word for word (checked by exact string match). Line 220 tells the reader to "read them". Both later briefs link that file, and collab-rounds says "read it all".

**Status words:**

- `kept` means it is in the relay with the same meaning.
- `changed` means it is in the relay, but narrowed, reworded or flattened.
- `stricter` means a suggestion became a rule, or the relay uses a word the owner never said.
- `dropped` means it is not in the relay.

## The ledger

| # | The owner's words (trimmed) | Status | The tab's words, where it matters |
|---|---|---|---|
| 1 | "the collaborative planning and kind of consensus operation, that's sort of what the research does" | kept | #1 "Research IS a consensus operation." |
| 2 | "creating a system that is kind of flexible for most use cases, you know, seems to be the way to go" | stricter | #1 "Make ONE flexible collaboration system that covers research, planning and design". The owner's "seems to be the way to go" became a capitalised ONE. |
| 3 | "in the whole research kind of audit … see what the agents think about … how the research process went" | kept | line 220: "minion-research-process-review is reviewing today's harness research, so fold its answer in" |
| 4 | "what other kinds of consensus-based systems we can use, you know, multi-agent reasoning" | kept | line 221: "what OTHER consensus-based, multi-agent reasoning systems could we use" |
| 5 | "in terms of the actual web searching, you know, look into that, see how that works" | changed | line 221 narrows it to "How does web search actually work for non-Claude models (OpenRouter's web plugin …)". The owner asked how web search works, full stop. |
| 6 | "We want better web search. We want better consensus. We want … collaborative … benefit rather than bickering and analysis paralysis" | dropped | The goal the whole design is judged by (collaboration that helps, not bickering and analysis paralysis) is not in line 220, line 221, design.md or either later brief. |
| 7 | "almost everything should just be an object with properties and methods and … instances and arrays of those instances … the internal structure we can see via UI" | kept | #6 |
| 8 | "creating a new research project for every new task isn't necessarily … the goal" | kept | #1 "not a research project per task" |
| 9 | "allow masterminds to … spawn minions … autonomously decide, and … almost always should … try to seek consensus, at least do kind of rough web searches" | kept | #1 "Masterminds should be able to run it autonomously, and nearly always seek consensus plus a rough web search." |
| 10 | "cheap agents to just do initial searches, read a bunch of stuff … a collection of references, of sources … already converted to markdown … any minion could cite a reference" | kept | #5 source library |
| 11 | "maybe there needs to be a directory … our current docs system where we have markdowns … any folder could have docs" | kept | #7 |
| 12 | "linking to either doc or docs … inconsistency … the path name and the tab URL … a broken link … I don't know if doc or docs or whatever, and to have a folder of MD files is the best way" | changed | #7 keeps the doc/docs mismatch and the broken link. The owner's deeper doubt, whether a folder of markdown files is the best way at all, became "decide the one folder convention". |
| 13 | "we don't have to do it for every single decision, but when it comes to … architecting something, spending some cheap minions to just fan out … and … do more web searches for specific things" | changed | #5 keeps the fan-out and the follow-up searches. The scoping (not every decision; for architecting) is gone, so nothing says when a fan-out is worth its cost. |
| 14 | "a very sophisticated and thorough web search system that kind of summarizes like the landscape of what exists on the internet, especially if … an authoritative source" | changed | #5 keeps "prefer authoritative sources". "Summarizes the landscape" (a map of what exists, not only a pile of saved pages) is lost. |
| 15 | "documentation sites, going to GitHub and looking at example code, especially source code when we're talking about a specific library" | kept | #5 "documentation sites, GitHub source" |
| 16 | "we don't want the mastermind to read everything cause it's going to get bogged down in detail" | kept | #2 "The mastermind doesn't read everything" |
| 17 | "cheap minions … finding the best resources and … creating kind of lists of like topics" | kept | #5; design.md `sources/<topic>/` |
| 18 | "the doc system and the research system should be documenting in a persistent kind of like long-term way" | kept | #5 "a persistent SOURCE LIBRARY" |
| 19 | "lessons learned … organize those in the right place so that a future minion or mastermind … is able to find it" | kept | #5 "lessons learned filed where future agents will find them" |
| 20 | "the data structure from the research … should … just be creating docs like md files and probably organized into directories … where that makes sense" | kept | #5 "convert pages to markdown" |
| 21 | "I'm still not sure how the navigation works for the docs system … three layers deep … I don't think we … have that working properly" | kept | #7 "Nested markdown three levels deep has no working navigation." |
| 22 | "nested markdown files … we're not going to be able to browse them very easily. Maybe the AI will be able to read them … and maybe that's good enough" | kept | #7 "whether nested source and lesson docs need browsable navigation or only AI-readable files" |
| 23 | "try and figure out a way to kind of generalize this whole research, web search, like digging … into any specific idea" | kept | #1 |
| 24 | "here's a problem … Identify three different ways to solve it and then tell everyone else … write it down on the file system" | dropped | "Find three ways to solve it" is a concrete method, and it is not in the relay or in any later brief. |
| 25 | "we need to probably use rounds or … steps or phases" | kept | #2 "Rounds and phases" |
| 26 | "agents working in parallel all at the same time … they're going to miss each other's responses … go out of turn … I just don't see that working as well" | stricter | #2 "never a free-for-all". The owner said "I just don't see that working as well". The relay made it a "never". |
| 27 | "an initial phase where … you give them the initial prompt … when everyone's done … each minion create their own directory in that … work folder" (one worktree) | kept | #2 "writing into their OWN directory in the shared worktree" |
| 28 | "If the mastermind reads all of them … that's going to … fry the mastermind's … context … or focus" | kept | #2 "which would fry its context" |
| 29 | "maybe you have each of the minions read maybe one or two others and then revise their own" | kept | #2 |
| 30 | "maybe the research system has some way … for each of the minions to give feedback about each kind of idea" | changed | Feedback on each idea is folded into one favourite-plus-caveat vote (#3). Per-idea feedback is lost. |
| 31 | "let's say a dozen minions building the same thing … refine the potential into the actual outcome" | kept | #4 |
| 32 | "for object oriented design … vote on the best name … method names and property names and method arguments … the core structure" | kept | #4 "vote in stages: first on names" |
| 33 | "once you reach consensus, then you move forward and you have them each … write the code for those methods and get it working" | kept | #4 "everyone implements" |
| 34 | "through that process, you know, they're gonna learn a lot in terms of like what needs to happen and … which problems to solve" | dropped | What the builders learn while implementing is not captured anywhere as an output. |
| 35 | "review each other's code again … Are these like functionally identical and are there any improvements we could make" | kept | #4 "cross-review: are the versions functionally identical?" |
| 36 | "each minion just votes on which one … the one that gets the most votes becomes the right one" | kept | #4 "vote on the best" |
| 37 | "the minions can choose their favorite … with … any improvements they would recommend or caveats" | kept | #3 "Voting, with caveats" |
| 38 | "the best option is this one, but it's missing … some important caveat … if you just add another extra line … then it's … clearly the best" | kept | #3 "The winner gets the caveat folded in." |

## What the tab added that the owner never said

- "Everyone does the brief", a first phase in which every member works the same brief. This is a fair reading of #27.
- "Decide the one folder convention". The owner asked a question, and the relay asks for a decision.
- Line 221: "at what cost? Keep it to a table". Cost is a fair addition. The table is a format rule.
- An instruction to "Revise design.md, then give check-consensus (running, Sonnet) the updated scope, or dispatch a separate task". This is routing, not an ask.

## The later hops (not scored, noted)

- design.md's "Added" section decided three of the owner's open questions:
  - it chose `doc/`;
  - it made everything browsable, not only readable by agents;
  - it set "5 models at 3 price levels, under $0.05".
- collab-rounds proved the system with 3 members, not "let's say a dozen", and made it "a rough web search by default". That default matches #9 and drops #13.
- None of the three dropped items (#6, #24, #34) came back in a later hop.

## Tally

- **Items in the ledger:** 38.
- **The tab's result:** 28 kept, 5 changed, 2 stricter, 3 dropped.
- **Raw words passed along:** yes, word for word.
