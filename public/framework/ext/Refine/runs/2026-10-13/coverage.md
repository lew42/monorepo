# Coverage

One row per clean sentence, built mechanically from the citations `structured.md` and `brief.md`
already carry — only the *uncited* rows below ("context only" / "dropped, because …" /
"unclassified") came from a model classification pass; every other row, and every flag, is a
plain word count against the transcript, no model call.

## Sentence coverage

| S# | sentence | -> |
|---|---|---|
| S1 | [sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/ai-system-page/requirements.md] | ask #5 |
| S2 | The AI system, defined: its components for AI first, shown to the owner second; the directives that belong in its readme. | ask #5 |
| S3 | Budget: $12. | ask #5 |
| S4 | Load the `sub-mastermind`, `page` and `documentation` skills first. | ask #5 |
| S5 | The owner's raw words: `../requirements-5.md`, asks 5, 6 and 10. | ask #5 |
| S6 | "We should have a framework slash AI system defined somewhere." | ask #5 |
| S7 | "The whole README system is basically the AI system." | ask #5 |
| S8 | "Documenting the components properly for AI is first priority, then letting me see what they look like." | ask #5 |
| S9 | "Directives that resonate go in architecture.md or the readme: don't copy a file by reading and writing it, use move/copy." | ask #6 |
| S10 | "How many minions, which model, which effort, and what they get done are open questions." | ask #6 |
| S11 | "All systems top to bottom use a functional approach: node answers each finished step with the next step, steps pre-programmed once the mastermind approves, each step logged with timestamps." | ask #6 |
| S12 | "Start fresh sessions after a round of work." | ask #6 |
| S13 | Your log is this dir's `task.jsonl`. | ask #5 |
| S14 | CLAUDE.md: readmes point, docs explain; the iceberg readme; show the class; link every mention; never destructive. | ask #6 |
| S15 | What exists. | ask #6 |
| S16 | `public/framework/ai/readme.md` (the index; under 100 lines after the 10-12 audit). | ask #6 |
| S17 | `ai/doc/` (`classes.md`, `organization.md`, `task-folders.md`, `repo-size.md`, `follow-up.md` today). | ask #6 |
| S18 | `ai/SystemClasses.js`. | ask #6 |
| S19 | `ext/System` (a generic System class with a class card, instances and a beat; `ReadmeSystem`, `NavigationSystem`). | ask #6 |
| S20 | The Systems tab. | ask #6 |
| S21 | `Servex/doc/architecture.md`. | ask #6 |
| S22 | `Servex/doc/steps.md` + `Server/Steps.mjs` (the step runner: the automated loop the owner describes already exists in part). | ask #6 |
| S23 | `Servex/TaskLoop.js`. | ask #6 |
| S24 | `.claude/skills/*` (the skills are the AI system's contracts). | ask #6 |
| S25 | The model-testing past work (`node Server/PastWork.mjs "model testing eval"`). | ask #6 |
| S26 | Deliverable. | ask #6 (thin) |
| S27 | `public/framework/ai/doc/architecture.md` (the AI system's conclusive decisions, in the shape the sibling `architecture-md` task is putting into the documentation skill: what the system is and its pattern; one entry per decision with why, the alternative and trade-off, and a link). | ask #6 |
| S28 | The readme chain as the AI's memory; tasks as folders with JSONL logs; cards as the owner's surface. | ask #6 |
| S29 | Roles and tiers (assistant / mastermind / minion, Haiku / Sonnet / Opus) and when each is used. | ask #6 |
| S30 | Worktrees and the merge gate. | ask #6 |
| S31 | The step runner as the loop (code reprompts, not memory). | ask #6 |
| S32 | Logs as persistence (no handoff files). | ask #6 |
| S33 | Fresh sessions after a round. | ask #6 |
| S34 | Token directives (never copy a file by reading and writing it, batch reads, scripts compute, Haiku under 100k). | ask #6 |
| S35 | Under 100 lines. | ask #8 |
| S36 | Where a decision is really open (how many minions, which effort, what they get done; the model-testing results), say so and link the past work instead of inventing an answer. | ask #6 |
| S37 | The system shown: a `System` instance for the AI system (`ext/System`, the class card + live instances) on the `/framework/ai/` page or the Systems tab: its components as cards (Servex, the dev server, MCP servers, models, sessions, cards, skills, the step runner, accounting, transcription, the page system), each one line and a link, computed from the readme's own index where possible. | ask #7 |
| S38 | One screen; the `page` skill decides where it sits. | ask #7 |
| S39 | Readme: `ai/readme.md` gets the one-line overview + the `architecture.md` link at the top; the directives the owner named go there as one line each only if they are not already in CLAUDE.md (do not restate CLAUDE.md; link it). | ask #8 |
| S40 | Report on your card: the decision count, the component count, the links, a 1200 screenshot. | ask #7 |
| S41 | Fence: `public/framework/ai/doc/architecture.md`, `public/framework/ai/readme.md` (top lines), the AI system page/tab component (new file under `public/framework/ai/`), this task dir. | ask #7 |
| S42 | Worktree, four widths, `merge.mjs`. | ask #7 |
| S43 | Stay out of `ai/doc/repo-size.md`, `follow-up*.md`, `asks-outcomes*.md` (sibling tasks). | ask #7 |
| S44 | Sonnet; a Haiku minion for the census. | ask #7 |
| S45 | [sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/architecture-md/requirements.md] | ask #9 |
| S46 | architecture.md per module: the conclusive decisions and why, nothing else. | ask #9 |
| S47 | Budget: $15. | ask #9 |
| S48 | Load the `sub-mastermind` and `documentation` skills first. | ask #9 |
| S49 | The owner's raw words: `../requirements-2.md`, ask 4. | ask #9 |
| S50 | "An architecture.md for each module." | ask #9 |
| S51 | "The conclusive decisions and why." | ask #9 |
| S52 | "Alternatives and trade-offs." | ask #9 |
| S53 | "Not 'the decision was reversed three times'." | ask #9 |
| S54 | "Keeping context to a minimum for new agents: just tell them what they need to know." | ask #9 |
| S55 | Your log is this dir's `task.jsonl`. | ask #9 |
| S56 | CLAUDE.md: readmes point, docs explain; link don't regenerate; never destructive (decision logs stay where they are, they are just not what a new agent reads first). | ask #9 |
| S57 | What exists. | ask #9 |
| S58 | Some modules already have one: `public/framework/styles/doc/architecture.md`, `Servex/doc/architecture.md`. | ask #9 |
| S59 | CLAUDE.md says "an `architecture.md`-style doc beside it holds decisions." | ask #9 |
| S60 | Many modules have `doc/decisions.md` (the log, with dates and reversals) instead. | ask #9 |
| S61 | The `documentation` skill decides what a module's docs must contain. | ask #10 |
| S62 | Census first, by script (`Server/ArchitectureCensus.mjs`, read-only): every module dir under `public/framework/{core,ext,ui,ux,web,styles}`, `Server`, `Servex` with a `readme.md`: has `doc/architecture.md`? has `doc/decisions.md`? how many `decision` lines in its task logs? how many files import it (from `PastWork.mjs`'s method)? | ask #9 |
| S63 | Rank by importers. | ask #9 |
| S64 | Deliverable. | ask #10 (thin) |
| S65 | The shape, once: a template in the `documentation` skill (`.claude/skills/documentation/SKILL.md`, a short section plus a linked `architecture-template.md`): title; one paragraph of what the module is and the pattern it uses; then one entry per conclusive decision: the decision in one sentence, why in one or two, the alternative(s) and the trade-off in one, and a link to the log entry or task that decided it. | ask #10 |
| S66 | No dates in the body unless a date is the decision; no "the owner said on…"; no reversal history. | ask #10 |
| S67 | Under 80 lines for most modules. | ask #10 |
| S68 | The readme links it in its "More" line. | ask #10 |
| S69 | The top 12 modules by importers get a real `doc/architecture.md`, written by Sonnet minions from the module's readme, decisions.md and the `decision` lines in its task logs (a Haiku minion extracts the decision lines into the minion's brief first, so the writer reads a page, not a log). | ask #11 |
| S70 | One minion per module, briefs with exact file lists; you review each against the template and the code (does the code actually do what the decision says?). | ask #11 |
| S71 | Where a module already has one, bring it to the shape only if it is off; never shrink a doc that is already good. | ask #11 |
| S72 | The rule for everyone: one line in `public/framework/readme.md`'s docs section and in the `documentation` skill: a module's readme gives the one-line overview and links `doc/architecture.md` for decisions; `doc/decisions.md` (the log) is history, read when you need to know how a decision moved. | ask #10 |
| S73 | Report on your card: the census counts (modules, with/without), the 12 written with links, the rule's wording. | ask #11 |
| S74 | Fence: `doc/architecture.md` and the one readme link line in the modules you take (list them in your log before starting), `.claude/skills/documentation/**`, `public/framework/readme.md` (one line), `Server/ArchitectureCensus.mjs`, this task dir. | ask #11 |
| S75 | Worktree, `merge.mjs`. | ask #11 |
| S76 | Do not touch the modules the sibling tasks own today: `ux/Dictate`, `core/Page/ext/Inbox`, the catalog page. | ask #11 |
| S77 | [sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/assistant-chain/requirements.md] | ask #13 |
| S78 | Assistant chain: one global assistant; fast per sentence, smart watches, mastermind gets the refined prompt. | ask #13 |
| S79 | Budget: $15. | ask #12 |
| S80 | Load the `sub-mastermind` skill first, then `.claude/skills/every-prompt/SKILL.md` and `tiers.md`. | ask #12 |
| S81 | The owner's raw words: `../requirements-3.md`, ask 4. | ask #12 |
| S82 | "One global assistant should be the way to go." | ask #13 |
| S83 | "A fast assistant that does the transcribing." | ask #13 |
| S84 | "A smart assistant, a variant of the fast one, keeping an eye on how everything is working, giving feedback, hands-off on decisions." | ask #13 |
| S85 | "The refined prompt gets sent to a mastermind as quickly as it's available, not per sentence." | ask #13 |
| S86 | "Every time Whisper transcribes a sentence it gets processed immediately for a response on screen." | ask #13 |
| S87 | "I wish that were working." | ask #13 |
| S88 | Your log is this dir's `task.jsonl`. | ask #12 |
| S89 | CLAUDE.md: one of everything; the owner's words; never destructive; keep working. | ask #12 |
| S90 | What exists. | ask #12 |
| S91 | Roles, in `Servex/agents/roles.js`: `assistant` (fast), `page-assistant`, `master-assistant` (Sonnet today, `Global.js master()`), `page-mastermind`. | ask #12 |
| S92 | Classes, in `Servex/agents/`: `Assistant.js`; `Echo.js` (mirrors the voice echo); `Layers.js` (spawns a pair per page: the design the owner now rejects); `Dispatcher.js`. | ask #12 |
| S93 | Refine: `ext/Refine` (`RefineSystem`, stages, `voice-to-page.md`: voice shows up on the session page stage by stage). | ask #12 |
| S94 | Dictate: `ux/Dictate/doc/handover.md`, `chat.md`. | ask #12 |
| S95 | The dictate-check sibling task owns it today; stay out and read its card. | ask #12 |
| S96 | Deliverable. | ask #12 (thin) |
| S97 | Map the chain as it is (`Servex/agents/doc/assistant-chain.md`, one screen, computed where possible): what happens to one transcribed sentence today, hop by hop (Whisper → ? → ? → a mastermind), with the file and function at each hop, the model, and the measured latency of each hop on one real sentence (headless; the voice walk in `ux/Dictate/doc/try-it.md`). | ask #12 |
| S98 | Where a hop is per-page (Layers.js pairs), say so. | ask #12 |
| S99 | The decision (a `decision` line + the doc): one global assistant session per owner, not per page: the fast assistant (Haiku or Sonnet low) answers each sentence on screen within ~2 s and appends it to the current refinement. | ask #13 |
| S100 | The smart assistant is the same session at a higher tier woken on a batch boundary (a pause, a "send it off", or N sentences), watching and suggesting, launching nothing. | ask #13 |
| S101 | The refined prompt (`ext/Refine`'s JSON, deltas) goes to the standing mastermind once per batch. | ask #13 |
| S102 | Say which existing class becomes which (rename nothing today; aliases if a name must change), what Layers.js's per-page pair becomes (a page CONTEXT the global assistant carries, not a separate agent), and the one rule that keeps context across navigation. | ask #13 |
| S103 | Build the smallest working slice: the global assistant receives per-sentence lines from the Dictate stream and answers on the page the owner is on (through `Echo`/the existing card reply route), and a batch boundary posts the refined prompt to the mastermind inbox (`say.mjs`/the run task's `chat` lines). | ask #14 |
| S104 | Prove it headless with one three-sentence dictation: three fast replies, one mastermind hand-off, timings in the log. | ask #14 |
| S105 | Behind a flag so the current path keeps working until the owner flips it; say the flag on the card. | ask #14 |
| S106 | Report on your card: the hop map in five lines, the decision, the proof timings, the flag. | ask #14 |
| S107 | Fence: `Servex/agents/Assistant.js`, `Echo.js`, `Global.js`, `Layers.js` (flagged changes only), `Servex/agents/doc/assistant-chain.md`, `.claude/skills/every-prompt/tiers.md` (one line), this task dir. | ask #14 |
| S108 | Servex code is tested from a worktree on a private Servex port (never the live one); the live Servex is restarted by the mastermind, not you. | ask #14 |
| S109 | `ux/Dictate` and `ext/Refine` are read-only for you today. | ask #12 |
| S110 | [sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/catalog/requirements.md] | ask #15 |
| S111 | Catalog: everything built with a UI, previewed, one click from its demo. | ask #15 |
| S112 | Budget: $15. | ask #15 |
| S113 | Load the `sub-mastermind` and `page` skills first. | ask #15 |
| S114 | The owner's raw words: `../requirements-2.md`, ask 1. | ask #15 |
| S115 | "Of all the past projects that we've worked on, I feel like I've only seen a small fraction." | ask #15 |
| S116 | "A catalog of all the things we've built." | ask #15 |
| S117 | "A preview on the catalog page is enough." | ask #15 |
| S118 | "Click through to the full demo page." | ask #15 |
| S119 | "Class cards with the icon of the class and the core API." | ask #16 |
| S120 | "A class list of all the ones designed that way." | ask #16 |
| S121 | "A live view of the actual instance hierarchy: still haven't seen that yet." | ask #17 |
| S122 | Your log is this dir's `task.jsonl`. | ask #15 |
| S123 | CLAUDE.md: one of everything, show don't tell, route everything, link every mention. | ask #15 |
| S124 | What exists (the mastermind's past-work run, 2026-10-13). | ask #16 |
| S125 | Class cards exist: `ux/Content/Object/Inspect.js` (every class gets an icon + an `inspect()` card, live on `/framework/ux/Content/Object/`), the dark class card used by `#Mention` and the framework home (`/framework/`), `ext/System` (a class card + live demo + beat), `ai/classes/ClassIndexPage.js` (`/framework/ai/classes/`), `code/objects`, `ui/card`, `ux/Card`. | ask #16 |
| S126 | A catalog mechanism exists in the demo system (memory: `catalog()` rail, `demo.tree()`, `/web/` guide tier) and `/framework/` is already a wall of sections from the sidebar tree. | ask #15 |
| S127 | `public/framework/ai/doc/unreferenced.md` lists files nothing links to (126). | ask #15 |
| S128 | Run `node Server/PastWork.mjs "catalog demo preview"` and `… "instance hierarchy live view"` yourself and record the answers; the live instance-hierarchy view may exist under a name like debug view, inspect tree, or the Panel/Page "two things side by side" demos. | ask #17 |
| S129 | Deliverable. | ask #15 (thin) |
| S130 | The catalog page at the place the `page` skill and the sidebar tree say it belongs (likely `/framework/catalog/` or a tab of `/framework/`; one page, not two): every module or demo page with a UI, as a card with a live preview (an iframe at reduced scale or a cached screenshot from `ext/DesignTool`'s shot system; pick the one that loads in under 2 s for 40 cards, say why) and its title. | ask #15 |
| S131 | Click = the demo page. | ask #15 |
| S132 | Group by the sidebar's own groups. | ask #15 |
| S133 | Computed from the page tree (a script or the tree itself), never a hand-typed list. | ask #15 |
| S134 | Mark the ones the owner has probably not seen: no visit in the dev server's page log in the last 30 days if such a log exists, else anything landed after 2026-10-01. | ask #15 |
| S135 | Class cards section: the list of every class that has a card (icon + core API), each card linking to its page; the three examples the owner asked for first (Refine, Dictate, System), computed from the classes that `inspect()`/`ClassIndexPage` know. | ask #16 |
| S136 | The live instance hierarchy: find it. | ask #17 |
| S137 | If something renders the live instance tree of a running page, link it at the top of the class section with a one-line "this is it" and a screenshot. | ask #17 |
| S138 | If nothing does, write the smallest spec in `doc/instance-tree.md` beside the catalog (class name, what it renders, which existing class it extends) and say so on the card. | ask #17 |
| S139 | Do not build it in this task. | ask #17 |
| S140 | Four widths (`check_page` 400/1200/1920/3440), smoke clean, `merge.mjs`; screenshot at 1200 on the card. | ask #18 |
| S141 | Report on your card: the link, the count of cards, how many marked unseen, the instance-tree verdict. | ask #18 |
| S142 | Fence: the catalog page's own directory, `public/framework/readme.md` and the sidebar tree entry (one line each), this task dir. | ask #18 |
| S143 | Sonnet; Haiku minions for the census. | ask #18 |
| S144 | One page, one minion at a time. | ask #18 |
| S145 | [sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/deploy-cap/requirements.md] | ask #3 |
| S146 | Deploy cap and tracked pictures: finish phase 1 of the repo-size plan. | ask #3 |
| S147 | Budget: $10. | ask #3 |
| S148 | Load the `sub-mastermind` skill first. | ask #3 |
| S149 | The plan you are executing is `public/framework/ai/doc/repo-size.md` ("The plan, in three phases", phase 1, and the two ⬜ items under it). | ask #3 |
| S150 | The owner's raw words are in `../requirements.md` (ask 3: reduce the repo, never destructive, back it up first: the backup is at `E:/Projects/lew42/monorepo-2026-10-13/`, taken 15:53 today). | ask #3, ask #4 |
| S151 | Your log is this dir's `task.jsonl`. | ask #3 |
| S152 | Facts (from repo-size.md, 2026-10-13). | ask #3 |
| S153 | The deployed site (`public/`) is 19,619 files; Cloudflare Workers Free stops at 20,000. | ask #3 |
| S154 | The AI log under `public/framework/ai/sessions/` is ~7,300 of them and is dev-only (needs Servex). | ask #3 |
| S155 | 2,725 screenshots (343 MB of every checkout) are tracked under `public/framework/ai/`; `.gitignore` now stops new ones (5e471fa3b) but the tracked ones stay tracked until untracked. | ask #4 |
| S156 | Deploy config: find it (`wrangler.*`, `readme.md` root "deploy" section, `.github/workflows`) and read how `public/` is uploaded before you write `.assetsignore`. | ask #3 |
| S157 | Deliverable. | ask #3 (thin) |
| S158 | `public/.assetsignore` (Cloudflare's syntax, like .gitignore): exclude `framework/ai/sessions/`, every `shots/` dir, and the other pictures the plan names; commit it with a one-line comment per rule. | ask #3 |
| S159 | Prove the count: a node script (`Server/deploy-count.mjs`, read-only) that applies the ignore rules and prints files-before, files-after, and the margin under 20,000. | ask #3 |
| S160 | Two numbers that must agree: its "before" vs `git ls-files public \| wc -l` (roughly; say why they differ if they do). | ask #3 |
| S161 | Check that nothing the site links to at runtime (a `files.jsonl`, an image a `doc/` page shows) is excluded: run `Server/smoke.mjs` on `/framework/ai/` and one `doc/` page with images. | ask #3 |
| S162 | Untrack the tracked pictures (`Server/untrack-pictures.mjs`): `--dry` prints a manifest (path, size, blob hash) to this task dir; `--apply` runs `git rm --cached` from that manifest in batches and commits once: `untrack: 2,725 pictures under the AI log stay on disk, leave the index (repo-size.md phase 1)`. | ask #4 |
| S163 | Files stay on disk; history is unchanged; undo is `git checkout HEAD~1 -- <paths>`. | ask #4 |
| S164 | Only paths under `public/framework/ai/` that match the new `.gitignore` picture rules; never a `doc/` image. | ask #4 |
| S165 | Then `git status` must be clean for your files and `du -sm` of a fresh `git ls-files` set shows the drop (log it). | ask #4 |
| S166 | Report on your card: files deployed before/after the cap, MB untracked, the undo line, links. | ask #4 |
| S167 | Add the two ⬜ → ✅ in repo-size.md with the commit hashes. | ask #4 |
| S168 | Fence: `public/.assetsignore`, `Server/deploy-count.mjs`, `Server/untrack-pictures.mjs`, `public/framework/ai/doc/repo-size.md` (the two checklist lines only), this task dir. | ask #3 |
| S169 | Work in a worktree (`take_worktree`), `merge.mjs` to land. | ask #3 |
| S170 | Never delete a file from disk, never rewrite history, never push. | ask #3, ask #4 |
| S171 | [sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-check/requirements.md] | ask #1 |
| S172 | Dictate: does transcription work right now, on the phone and the desktop sidebar? | ask #1 |
| S173 | Budget: $12. | ask #1 |
| S174 | Load the `sub-mastermind` and `page` skills first. | ask #1 |
| S175 | The owner's raw words: `../requirements-2.md`, ask 7. | ask #1 |
| S176 | "Check into the whole transcribe thing." | ask #1 |
| S177 | "It should be working." | ask #1 |
| S178 | "It was sort of working." | ask #1 |
| S179 | "I'll go try it right now." | ask #1 |
| S180 | The owner is trying it NOW on an Android phone at the LAN address, so this task is urgent and starts with proof, not building. | ask #1 |
| S181 | Your log is this dir's `task.jsonl`. | ask #1 |
| S182 | What exists (read these first, in order). | ask #1 |
| S183 | `public/framework/ux/Dictate/readme.md`, then `doc/handover.md`, `doc/asks.md`, `doc/decisions.md`, `doc/try-it.md` (the phone voice walk; a headless run passed on 10-12, see `ai/2026-10-12/voice-verify/STATE.md`). | ask #1 |
| S184 | The mobile sheet, the desktop sidebar tabs and the whisper stream are described there. | ask #1 |
| S185 | Servex supervises `whisper-server` (`list_servers`, `server_logs`). | ask #1 |
| S186 | Deliverable. | ask #1 (thin) |
| S187 | Prove it works (30 min): whisper-server up (`list_servers`); the headless voice walk from try-it.md passes again today on current `michael/dev` (log the command and the result); then a Playwright run at phone width (400) that opens the sheet, presses transcribe, feeds the test audio and sees text arrive, with a screenshot in this task dir. | ask #1 |
| S188 | Anything that fails is the first thing you fix, in a worktree, smoke-tested, merged with `merge.mjs`. | ask #1 |
| S189 | Watch the live session: the owner's own attempt lands in the Dictate logs (`ux/Dictate/doc/handover.md` says where; the session store under `public/framework/ai/sessions/2026/10/13/`). | ask #1 |
| S190 | If their attempt shows an error, fix that first and post what you found on your card. | ask #1 |
| S191 | Same UI on phone and desktop: the owner's design: on mobile a small sheet holding only the transcribe button and the text area, resizable; expanded, it becomes the whole sidebar with the chat and the tabs (AI, sessions, ...) the desktop sidebar has. | ask #2 |
| S192 | Record how far today's code is from that in `ux/Dictate/doc/asks.md` (the existing asks file; append a dated section, do not rewrite): what is one component already, what is two, and the smallest change that makes the sheet the sidebar's collapsed form. | ask #2 |
| S193 | Build that smallest change only if it is one afternoon of Sonnet work and the proofs in 1 pass; otherwise write it as the next brief in `doc/next.md`. | ask #2 |
| S194 | New session: does | ask #2 |

## Flags

Three mechanical checks: a **strength word** (must / never / always / only) the cited
sentence(s) don't contain; **new words** — a word in the ask that is nowhere in the whole
transcript; a **thin citation** — an ask cites a sentence but shares no wording with it
(also marked "(thin)" right in the table above).

| ask | flag | detail |
|---|---|---|
| #1 | thin citation | cites S186 but shares no wording with it — the citation may not reflect what S186 actually says |
| #1 | new words | "comes", "minutes", "confirm", "s171", "s172", "s173", "s174", "s175", "s176", "s177", "s178", "s179", "s180", "s181", "s182", "s183", "s184", "s185", "s186", "s187", "s188", "s189", "s190" — not in the transcript at all |
| #2 | new words | "unknown", "s191", "s192", "s193", "s194" — not in the transcript at all |
| #3 | thin citation | cites S157 but shares no wording with it — the citation may not reflect what S157 actually says |
| #3 | new words | "about", "s145", "s146", "s147", "s148", "s149", "s150", "s151", "s152", "s153", "s154", "s156", "s157", "s158", "s159", "s160", "s161", "s168", "s169", "s170" — not in the transcript at all |
| #4 | new words | "cover", "s155", "s162", "s163", "s164", "s165", "s166", "s167", "s150", "s170" — not in the transcript at all |
| #5 | new words | "come" — not in the transcript at all |
| #6 | thin citation | cites S26 but shares no wording with it — the citation may not reflect what S26 actually says |
| #6 | new words | "give", "here", "copied", "cover", "reuse", "rather" — not in the transcript at all |
| #7 | new words | "appear", "fits" — not in the transcript at all |
| #8 | new words | "lacks" — not in the transcript at all |
| #9 | new words | "give", "include", "minimal", "whether" — not in the transcript at all |
| #10 | thin citation | cites S64 but shares no wording with it — the citation may not reflect what S64 actually says |
| #11 | new words | "those" — not in the transcript at all |
| #12 | thin citation | cites S96 but shares no wording with it — the citation may not reflect what S96 actually says |
| #12 | new words | "give", "hops", "reuse", "s109" — not in the transcript at all |
| #13 | new words | "goal", "about", "s100", "s101", "s102" — not in the transcript at all |
| #14 | new words | "s103", "s104", "s105", "s106", "s107", "s108" — not in the transcript at all |
| #15 | thin citation | cites S129 but shares no wording with it — the citation may not reflect what S129 actually says |
| #15 | new words | "because", "reuse", "s110", "s111", "s112", "s113", "s114", "s115", "s116", "s117", "s118", "s122", "s123", "s126", "s127", "s129", "s130", "s131", "s132", "s133", "s134" — not in the transcript at all |
| #16 | new words | "come", "s119", "s120", "s124", "s125", "s135" — not in the transcript at all |
| #17 | new words | "called", "s121", "s128", "s136", "s137", "s138", "s139" — not in the transcript at all |
| #18 | new words | "crew", "s140", "s141", "s142", "s143", "s144" — not in the transcript at all |
