S1. [sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/ai-system-page/requirements.md]
S2. The AI system, defined: its components for AI first, shown to the owner second; the directives that belong in its readme.
S3. Budget: $12.
S4. Load the `sub-mastermind`, `page` and `documentation` skills first.
S5. The owner's raw words: `../requirements-5.md`, asks 5, 6 and 10.
S6. "We should have a framework slash AI system defined somewhere."
S7. "The whole README system is basically the AI system."
S8. "Documenting the components properly for AI is first priority, then letting me see what they look like."
S9. "Directives that resonate go in architecture.md or the readme: don't copy a file by reading and writing it, use move/copy."
S10. "How many minions, which model, which effort, and what they get done are open questions."
S11. "All systems top to bottom use a functional approach: node answers each finished step with the next step, steps pre-programmed once the mastermind approves, each step logged with timestamps."
S12. "Start fresh sessions after a round of work."
S13. Your log is this dir's `task.jsonl`.
S14. CLAUDE.md: readmes point, docs explain; the iceberg readme; show the class; link every mention; never destructive.
S15. What exists.
S16. `public/framework/ai/readme.md` (the index; under 100 lines after the 10-12 audit).
S17. `ai/doc/` (`classes.md`, `organization.md`, `task-folders.md`, `repo-size.md`, `follow-up.md` today).
S18. `ai/SystemClasses.js`.
S19. `ext/System` (a generic System class with a class card, instances and a beat; `ReadmeSystem`, `NavigationSystem`).
S20. The Systems tab.
S21. `Servex/doc/architecture.md`.
S22. `Servex/doc/steps.md` + `Server/Steps.mjs` (the step runner: the automated loop the owner describes already exists in part).
S23. `Servex/TaskLoop.js`.
S24. `.claude/skills/*` (the skills are the AI system's contracts).
S25. The model-testing past work (`node Server/PastWork.mjs "model testing eval"`).
S26. Deliverable.
S27. `public/framework/ai/doc/architecture.md` (the AI system's conclusive decisions, in the shape the sibling `architecture-md` task is putting into the documentation skill: what the system is and its pattern; one entry per decision with why, the alternative and trade-off, and a link).
S28. The readme chain as the AI's memory; tasks as folders with JSONL logs; cards as the owner's surface.
S29. Roles and tiers (assistant / mastermind / minion, Haiku / Sonnet / Opus) and when each is used.
S30. Worktrees and the merge gate.
S31. The step runner as the loop (code reprompts, not memory).
S32. Logs as persistence (no handoff files).
S33. Fresh sessions after a round.
S34. Token directives (never copy a file by reading and writing it, batch reads, scripts compute, Haiku under 100k).
S35. Under 100 lines.
S36. Where a decision is really open (how many minions, which effort, what they get done; the model-testing results), say so and link the past work instead of inventing an answer.
S37. The system shown: a `System` instance for the AI system (`ext/System`, the class card + live instances) on the `/framework/ai/` page or the Systems tab: its components as cards (Servex, the dev server, MCP servers, models, sessions, cards, skills, the step runner, accounting, transcription, the page system), each one line and a link, computed from the readme's own index where possible.
S38. One screen; the `page` skill decides where it sits.
S39. Readme: `ai/readme.md` gets the one-line overview + the `architecture.md` link at the top; the directives the owner named go there as one line each only if they are not already in CLAUDE.md (do not restate CLAUDE.md; link it).
S40. Report on your card: the decision count, the component count, the links, a 1200 screenshot.
S41. Fence: `public/framework/ai/doc/architecture.md`, `public/framework/ai/readme.md` (top lines), the AI system page/tab component (new file under `public/framework/ai/`), this task dir.
S42. Worktree, four widths, `merge.mjs`.
S43. Stay out of `ai/doc/repo-size.md`, `follow-up*.md`, `asks-outcomes*.md` (sibling tasks).
S44. Sonnet; a Haiku minion for the census.
S45. [sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/architecture-md/requirements.md]
S46. architecture.md per module: the conclusive decisions and why, nothing else.
S47. Budget: $15.
S48. Load the `sub-mastermind` and `documentation` skills first.
S49. The owner's raw words: `../requirements-2.md`, ask 4.
S50. "An architecture.md for each module."
S51. "The conclusive decisions and why."
S52. "Alternatives and trade-offs."
S53. "Not 'the decision was reversed three times'."
S54. "Keeping context to a minimum for new agents: just tell them what they need to know."
S55. Your log is this dir's `task.jsonl`.
S56. CLAUDE.md: readmes point, docs explain; link don't regenerate; never destructive (decision logs stay where they are, they are just not what a new agent reads first).
S57. What exists.
S58. Some modules already have one: `public/framework/styles/doc/architecture.md`, `Servex/doc/architecture.md`.
S59. CLAUDE.md says "an `architecture.md`-style doc beside it holds decisions."
S60. Many modules have `doc/decisions.md` (the log, with dates and reversals) instead.
S61. The `documentation` skill decides what a module's docs must contain.
S62. Census first, by script (`Server/ArchitectureCensus.mjs`, read-only): every module dir under `public/framework/{core,ext,ui,ux,web,styles}`, `Server`, `Servex` with a `readme.md`: has `doc/architecture.md`? has `doc/decisions.md`? how many `decision` lines in its task logs? how many files import it (from `PastWork.mjs`'s method)?
S63. Rank by importers.
S64. Deliverable.
S65. The shape, once: a template in the `documentation` skill (`.claude/skills/documentation/SKILL.md`, a short section plus a linked `architecture-template.md`): title; one paragraph of what the module is and the pattern it uses; then one entry per conclusive decision: the decision in one sentence, why in one or two, the alternative(s) and the trade-off in one, and a link to the log entry or task that decided it.
S66. No dates in the body unless a date is the decision; no "the owner said on…"; no reversal history.
S67. Under 80 lines for most modules.
S68. The readme links it in its "More" line.
S69. The top 12 modules by importers get a real `doc/architecture.md`, written by Sonnet minions from the module's readme, decisions.md and the `decision` lines in its task logs (a Haiku minion extracts the decision lines into the minion's brief first, so the writer reads a page, not a log).
S70. One minion per module, briefs with exact file lists; you review each against the template and the code (does the code actually do what the decision says?).
S71. Where a module already has one, bring it to the shape only if it is off; never shrink a doc that is already good.
S72. The rule for everyone: one line in `public/framework/readme.md`'s docs section and in the `documentation` skill: a module's readme gives the one-line overview and links `doc/architecture.md` for decisions; `doc/decisions.md` (the log) is history, read when you need to know how a decision moved.
S73. Report on your card: the census counts (modules, with/without), the 12 written with links, the rule's wording.
S74. Fence: `doc/architecture.md` and the one readme link line in the modules you take (list them in your log before starting), `.claude/skills/documentation/**`, `public/framework/readme.md` (one line), `Server/ArchitectureCensus.mjs`, this task dir.
S75. Worktree, `merge.mjs`.
S76. Do not touch the modules the sibling tasks own today: `ux/Dictate`, `core/Page/ext/Inbox`, the catalog page.
S77. [sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/assistant-chain/requirements.md]
S78. Assistant chain: one global assistant; fast per sentence, smart watches, mastermind gets the refined prompt.
S79. Budget: $15.
S80. Load the `sub-mastermind` skill first, then `.claude/skills/every-prompt/SKILL.md` and `tiers.md`.
S81. The owner's raw words: `../requirements-3.md`, ask 4.
S82. "One global assistant should be the way to go."
S83. "A fast assistant that does the transcribing."
S84. "A smart assistant, a variant of the fast one, keeping an eye on how everything is working, giving feedback, hands-off on decisions."
S85. "The refined prompt gets sent to a mastermind as quickly as it's available, not per sentence."
S86. "Every time Whisper transcribes a sentence it gets processed immediately for a response on screen."
S87. "I wish that were working."
S88. Your log is this dir's `task.jsonl`.
S89. CLAUDE.md: one of everything; the owner's words; never destructive; keep working.
S90. What exists.
S91. Roles, in `Servex/agents/roles.js`: `assistant` (fast), `page-assistant`, `master-assistant` (Sonnet today, `Global.js master()`), `page-mastermind`.
S92. Classes, in `Servex/agents/`: `Assistant.js`; `Echo.js` (mirrors the voice echo); `Layers.js` (spawns a pair per page: the design the owner now rejects); `Dispatcher.js`.
S93. Refine: `ext/Refine` (`RefineSystem`, stages, `voice-to-page.md`: voice shows up on the session page stage by stage).
S94. Dictate: `ux/Dictate/doc/handover.md`, `chat.md`.
S95. The dictate-check sibling task owns it today; stay out and read its card.
S96. Deliverable.
S97. Map the chain as it is (`Servex/agents/doc/assistant-chain.md`, one screen, computed where possible): what happens to one transcribed sentence today, hop by hop (Whisper → ? → ? → a mastermind), with the file and function at each hop, the model, and the measured latency of each hop on one real sentence (headless; the voice walk in `ux/Dictate/doc/try-it.md`).
S98. Where a hop is per-page (Layers.js pairs), say so.
S99. The decision (a `decision` line + the doc): one global assistant session per owner, not per page: the fast assistant (Haiku or Sonnet low) answers each sentence on screen within ~2 s and appends it to the current refinement.
S100. The smart assistant is the same session at a higher tier woken on a batch boundary (a pause, a "send it off", or N sentences), watching and suggesting, launching nothing.
S101. The refined prompt (`ext/Refine`'s JSON, deltas) goes to the standing mastermind once per batch.
S102. Say which existing class becomes which (rename nothing today; aliases if a name must change), what Layers.js's per-page pair becomes (a page CONTEXT the global assistant carries, not a separate agent), and the one rule that keeps context across navigation.
S103. Build the smallest working slice: the global assistant receives per-sentence lines from the Dictate stream and answers on the page the owner is on (through `Echo`/the existing card reply route), and a batch boundary posts the refined prompt to the mastermind inbox (`say.mjs`/the run task's `chat` lines).
S104. Prove it headless with one three-sentence dictation: three fast replies, one mastermind hand-off, timings in the log.
S105. Behind a flag so the current path keeps working until the owner flips it; say the flag on the card.
S106. Report on your card: the hop map in five lines, the decision, the proof timings, the flag.
S107. Fence: `Servex/agents/Assistant.js`, `Echo.js`, `Global.js`, `Layers.js` (flagged changes only), `Servex/agents/doc/assistant-chain.md`, `.claude/skills/every-prompt/tiers.md` (one line), this task dir.
S108. Servex code is tested from a worktree on a private Servex port (never the live one); the live Servex is restarted by the mastermind, not you.
S109. `ux/Dictate` and `ext/Refine` are read-only for you today.
S110. [sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/catalog/requirements.md]
S111. Catalog: everything built with a UI, previewed, one click from its demo.
S112. Budget: $15.
S113. Load the `sub-mastermind` and `page` skills first.
S114. The owner's raw words: `../requirements-2.md`, ask 1.
S115. "Of all the past projects that we've worked on, I feel like I've only seen a small fraction."
S116. "A catalog of all the things we've built."
S117. "A preview on the catalog page is enough."
S118. "Click through to the full demo page."
S119. "Class cards with the icon of the class and the core API."
S120. "A class list of all the ones designed that way."
S121. "A live view of the actual instance hierarchy: still haven't seen that yet."
S122. Your log is this dir's `task.jsonl`.
S123. CLAUDE.md: one of everything, show don't tell, route everything, link every mention.
S124. What exists (the mastermind's past-work run, 2026-10-13).
S125. Class cards exist: `ux/Content/Object/Inspect.js` (every class gets an icon + an `inspect()` card, live on `/framework/ux/Content/Object/`), the dark class card used by `#Mention` and the framework home (`/framework/`), `ext/System` (a class card + live demo + beat), `ai/classes/ClassIndexPage.js` (`/framework/ai/classes/`), `code/objects`, `ui/card`, `ux/Card`.
S126. A catalog mechanism exists in the demo system (memory: `catalog()` rail, `demo.tree()`, `/web/` guide tier) and `/framework/` is already a wall of sections from the sidebar tree.
S127. `public/framework/ai/doc/unreferenced.md` lists files nothing links to (126).
S128. Run `node Server/PastWork.mjs "catalog demo preview"` and `… "instance hierarchy live view"` yourself and record the answers; the live instance-hierarchy view may exist under a name like debug view, inspect tree, or the Panel/Page "two things side by side" demos.
S129. Deliverable.
S130. The catalog page at the place the `page` skill and the sidebar tree say it belongs (likely `/framework/catalog/` or a tab of `/framework/`; one page, not two): every module or demo page with a UI, as a card with a live preview (an iframe at reduced scale or a cached screenshot from `ext/DesignTool`'s shot system; pick the one that loads in under 2 s for 40 cards, say why) and its title.
S131. Click = the demo page.
S132. Group by the sidebar's own groups.
S133. Computed from the page tree (a script or the tree itself), never a hand-typed list.
S134. Mark the ones the owner has probably not seen: no visit in the dev server's page log in the last 30 days if such a log exists, else anything landed after 2026-10-01.
S135. Class cards section: the list of every class that has a card (icon + core API), each card linking to its page; the three examples the owner asked for first (Refine, Dictate, System), computed from the classes that `inspect()`/`ClassIndexPage` know.
S136. The live instance hierarchy: find it.
S137. If something renders the live instance tree of a running page, link it at the top of the class section with a one-line "this is it" and a screenshot.
S138. If nothing does, write the smallest spec in `doc/instance-tree.md` beside the catalog (class name, what it renders, which existing class it extends) and say so on the card.
S139. Do not build it in this task.
S140. Four widths (`check_page` 400/1200/1920/3440), smoke clean, `merge.mjs`; screenshot at 1200 on the card.
S141. Report on your card: the link, the count of cards, how many marked unseen, the instance-tree verdict.
S142. Fence: the catalog page's own directory, `public/framework/readme.md` and the sidebar tree entry (one line each), this task dir.
S143. Sonnet; Haiku minions for the census.
S144. One page, one minion at a time.
S145. [sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/deploy-cap/requirements.md]
S146. Deploy cap and tracked pictures: finish phase 1 of the repo-size plan.
S147. Budget: $10.
S148. Load the `sub-mastermind` skill first.
S149. The plan you are executing is `public/framework/ai/doc/repo-size.md` ("The plan, in three phases", phase 1, and the two ⬜ items under it).
S150. The owner's raw words are in `../requirements.md` (ask 3: reduce the repo, never destructive, back it up first: the backup is at `E:/Projects/lew42/monorepo-2026-10-13/`, taken 15:53 today).
S151. Your log is this dir's `task.jsonl`.
S152. Facts (from repo-size.md, 2026-10-13).
S153. The deployed site (`public/`) is 19,619 files; Cloudflare Workers Free stops at 20,000.
S154. The AI log under `public/framework/ai/sessions/` is ~7,300 of them and is dev-only (needs Servex).
S155. 2,725 screenshots (343 MB of every checkout) are tracked under `public/framework/ai/`; `.gitignore` now stops new ones (5e471fa3b) but the tracked ones stay tracked until untracked.
S156. Deploy config: find it (`wrangler.*`, `readme.md` root "deploy" section, `.github/workflows`) and read how `public/` is uploaded before you write `.assetsignore`.
S157. Deliverable.
S158. `public/.assetsignore` (Cloudflare's syntax, like .gitignore): exclude `framework/ai/sessions/`, every `shots/` dir, and the other pictures the plan names; commit it with a one-line comment per rule.
S159. Prove the count: a node script (`Server/deploy-count.mjs`, read-only) that applies the ignore rules and prints files-before, files-after, and the margin under 20,000.
S160. Two numbers that must agree: its "before" vs `git ls-files public | wc -l` (roughly; say why they differ if they do).
S161. Check that nothing the site links to at runtime (a `files.jsonl`, an image a `doc/` page shows) is excluded: run `Server/smoke.mjs` on `/framework/ai/` and one `doc/` page with images.
S162. Untrack the tracked pictures (`Server/untrack-pictures.mjs`): `--dry` prints a manifest (path, size, blob hash) to this task dir; `--apply` runs `git rm --cached` from that manifest in batches and commits once: `untrack: 2,725 pictures under the AI log stay on disk, leave the index (repo-size.md phase 1)`.
S163. Files stay on disk; history is unchanged; undo is `git checkout HEAD~1 -- <paths>`.
S164. Only paths under `public/framework/ai/` that match the new `.gitignore` picture rules; never a `doc/` image.
S165. Then `git status` must be clean for your files and `du -sm` of a fresh `git ls-files` set shows the drop (log it).
S166. Report on your card: files deployed before/after the cap, MB untracked, the undo line, links.
S167. Add the two ⬜ → ✅ in repo-size.md with the commit hashes.
S168. Fence: `public/.assetsignore`, `Server/deploy-count.mjs`, `Server/untrack-pictures.mjs`, `public/framework/ai/doc/repo-size.md` (the two checklist lines only), this task dir.
S169. Work in a worktree (`take_worktree`), `merge.mjs` to land.
S170. Never delete a file from disk, never rewrite history, never push.
S171. [sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-check/requirements.md]
S172. Dictate: does transcription work right now, on the phone and the desktop sidebar?
S173. Budget: $12.
S174. Load the `sub-mastermind` and `page` skills first.
S175. The owner's raw words: `../requirements-2.md`, ask 7.
S176. "Check into the whole transcribe thing."
S177. "It should be working."
S178. "It was sort of working."
S179. "I'll go try it right now."
S180. The owner is trying it NOW on an Android phone at the LAN address, so this task is urgent and starts with proof, not building.
S181. Your log is this dir's `task.jsonl`.
S182. What exists (read these first, in order).
S183. `public/framework/ux/Dictate/readme.md`, then `doc/handover.md`, `doc/asks.md`, `doc/decisions.md`, `doc/try-it.md` (the phone voice walk; a headless run passed on 10-12, see `ai/2026-10-12/voice-verify/STATE.md`).
S184. The mobile sheet, the desktop sidebar tabs and the whisper stream are described there.
S185. Servex supervises `whisper-server` (`list_servers`, `server_logs`).
S186. Deliverable.
S187. Prove it works (30 min): whisper-server up (`list_servers`); the headless voice walk from try-it.md passes again today on current `michael/dev` (log the command and the result); then a Playwright run at phone width (400) that opens the sheet, presses transcribe, feeds the test audio and sees text arrive, with a screenshot in this task dir.
S188. Anything that fails is the first thing you fix, in a worktree, smoke-tested, merged with `merge.mjs`.
S189. Watch the live session: the owner's own attempt lands in the Dictate logs (`ux/Dictate/doc/handover.md` says where; the session store under `public/framework/ai/sessions/2026/10/13/`).
S190. If their attempt shows an error, fix that first and post what you found on your card.
S191. Same UI on phone and desktop: the owner's design: on mobile a small sheet holding only the transcribe button and the text area, resizable; expanded, it becomes the whole sidebar with the chat and the tabs (AI, sessions, ...) the desktop sidebar has.
S192. Record how far today's code is from that in `ux/Dictate/doc/asks.md` (the existing asks file; append a dated section, do not rewrite): what is one component already, what is two, and the smallest change that makes the sheet the sidebar's collapsed form.
S193. Build that smallest change only if it is one afternoon of Sonnet work and the proofs in 1 pass; otherwise write it as the next brief in `doc/next.md`.
S194. New session: does
