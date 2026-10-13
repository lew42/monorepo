S1. [sessions/2026/10/09/core-session/requirements.md]
S2. Budget: $6.
S3. core/Session: extract the generic session class out of AISession.
S4. Decided by the owner (19:05, via the page mastermind): [core/Page/doc/architecture.md, "Session"](/framework/core/Page/doc/architecture.md).
S5. One core class for time-based pages: `Session` (record, dated folder, locate/scan/day/dir_url, its `page.jsonl`).
S6. `AISession` extends it; `RefineSession` (task-mastermind-refine-v3) will later too.
S7. Asked by `mastermind-page-system`, owned by `mastermind-ai-system`.
S8. Do.
S9. Create `public/framework/core/Session/Session.js` (`export default class Session`), plus a short `readme.md` (what it is, who extends it, link to the architecture section and to `ai/sessions/doc/data/layout.md`).
S10. Link it from `core/readme.md`.
S11. Move the **generic** statics out of `public/framework/ai/AISession/AISession.js` into it, unchanged in behaviour: `day`, `root_url`, `dir_url`, `scan`, `locate`, and the maps `days`, `slugs` (plus the `scanned` flag).
S12. Root folder is a static hook, `static root_url()`, that the subclass overrides (AISession's is `../sessions/` with the `SESSIONS_ROOT` env override).
S13. **Statics are per class**: JavaScript inherits statics by reference, so each subclass must declare its OWN `days`, `slugs` and `scanned` (`static days = new Map()` in `AISession`), and the Session methods must use `this.days` / `this.slugs` / `this.root_url()`, never the literal `AISession.` or `Session.`.
S14. This is the one way the extraction silently breaks (two subclasses sharing one map).
S15. `AISession extends Session`, keeps everything else (cache, costs, transcript, live index, record log, close, rollup, `LINE_TYPES`).
S16. `scan` already reads the first line `{"session": "<uuid>"}` of a `page.jsonl` the page tool made; keep that.
S17. Prove (tick only with proof).
S18. `node --check` on every file touched; `node -e "import('./public/framework/ai/AISession/AISession.js')"` loads in node.
S19. Behaviour is the same: run `node Server/session-index.mjs` or the closest existing script that calls `AISession.scan/locate` (find callers with Grep: `AISession.locate`, `AISession.scan`, `AISession.dir_url`) before and after, and show equal output for 3 known ids.
S20. Then open `/framework/ai/sessions/` headless (`mcp__site__shot` at 1920) and confirm the grid and one detail page still render.
S21. A tiny test: a throwaway subclass `class T extends Session` with its own maps does not change `AISession.days`.
S22. Rules.
S23. Do not change any caller's API: every `AISession.x` that works today still works (inherited statics are fine).
S24. Commit by exact path, one commit for the new class, one for the AISession change.
S25. Do not touch uncommitted files you did not edit.
S26. Do not restart Servex; say in your report that Servex needs one.
S27. Update `ai/sessions/doc/ui/classes.md` with the new parent in one line.
S28. Report: one screen, links, what you proved, what you did not.
S29. [sessions/2026/10/09/feedback-council/requirements.md]
S30. Feedback council: brief for each of the five checkers.
S31. Card dir (read the raw words there): `public/framework/ai/council/` (and the current run directory).
S32. Words: `words.jsonl` in the active run directory.
S33. Asks to check: new asks extracted from `words.jsonl` plus every open ask in `public/framework/ai/council/asks.jsonl` whose latest verdict isn't `done`.
S34. Your job.
S35. For EVERY ask, LOOK at the real result and give one verdict: `done` / `partly` / `not done` / `done-but-wrong`, one line of evidence (URL, screenshot path, file:line), and for anything not `done` the smallest fix.
S36. Prove before you call something missing.
S37. A false "not done" is the common failure: search the repo (`git log`, grep, the skills in `.claude/skills/`, CLAUDE.md) before writing it.
S38. The live site: http://monorepo.localhost (never http://localhost/).
S39. Visual asks: headless Playwright at 1920 and 3440 (Playwright, never the owner's tabs, no `mcp__site__eval` on tabs the owner has open).
S40. Time the Live card load.
S41. Check scroll on the named URLs with real overflow measures.
S42. No window may pop up: `windowsHide: true`, `-WindowStyle Hidden`.
S43. Do NOT edit any repo file.
S44. Scratch goes in your scratchpad; screenshots to `<run-dir>/shots/<your-name>-<ask>.png` only for the ones that are evidence (keep <=12).
S45. Also scan `words.jsonl` and add up to 8 **extra asks** the owner made there that current asks miss, with the same verdict.
S46. Return.
S47. Write ONE json file `<run-dir>/votes/<your-name>.json`: `{"name":"...","votes":{"A1":{"v":"done|partly|not done|done-but-wrong","e":"evidence","f":"smallest fix or empty"},...},"extra":[{"ask":"...","v":"...","e":"...","f":"..."}]}`
S48. Then reply "done" in one line.
S49. Never write the owner's name anywhere.
S50. Budget about $2 each: be quick, do not over-explore.
S51. Load the `minion` skill first only if it does not conflict: you edit nothing but your votes file and shots.
S52. [sessions/2026/10/09/notifications-lab/notifications-lab/requirements.md]
S53. Notifications Lab.
S54. Goal.
S55. Get web notifications working on my Android phone against the local dev server, from a normal browser tab (no PWA install), and build a demo page to explore what notifications can do.
S56. Write a short report of findings when done.
S57. Constraints.
S58. Vanilla JS, native ESM, no TypeScript, no build step.
S59. Use our existing View class and page system; read existing code first and follow its patterns.
S60. Each class has a static View, rendered via `this.constructor.View`.
S61. Parents render children through the children's views.
S62. Views should show internal state live (permission, worker state, visible notifications, event log).
S63. New classes go in lab/ClassName/ClassName.js (capitalized, file name matches class name).
S64. Helper classes that only serve a parent are nested in the parent's folder.
S65. Don't reuse native API names (Notification, ServiceWorker, etc.).
S66. Keep wrappers thin and close to the native API shape.
S67. No offline caching / fetch interception.
S68. Local testing.
S69. I test on my phone via the desktop's LAN IP.
S70. Setup: Android Chrome → chrome://flags → "Insecure origins treated as secure" → add http://<LAN-IP>:<port> → relaunch.
S71. Show window.isSecureContext on the page.
S72. If the flag doesn't make service workers + notifications work, tell me and propose the simplest fallback (e.g. mkcert).
S73. Classes.
S74. lab/WorkerHost/WorkerHost.js
S75. Registers the service worker (sw.js at site root, type: 'module'), exposes registration + state, relays messages from the worker.
S76. Keep sw.js thin.
S77. lab/NotificationManager/NotificationManager.js
S78. One instance at the app level.
S79. Wraps permission, maxActions, registration.showNotification and getNotifications.
S80. NOTE: `new Notification()` throws on Android Chrome, so everything goes through showNotification().
S81. Verify this.
S82. show(opts) → NotificationHandle
S83. Relays click / action / close events from sw.js to the page.
S84. lab/NotificationManager/NotificationHandle.js
S85. One notification slot keyed by tag.
S86. Native notifications are immutable, so set(props) re-shows under the same tag to act like an update.
S87. close(), and click / action / close events.
S88. Demo page.
S89. Stacked demo cards, each with buttons plus a live view, and a shared event log.
S90. Cover:
S91. All showNotification options: body, icon, badge, image, tag, renotify, silent, vibrate patterns, requireInteraction, actions, data.
S92. maxActions, and what happens with more actions than allowed.
S93. Long multi-paragraph body: truncation and expanded view.
S94. Multiple notifications at once vs same-tag replacement.
S95. Progress bar via repeated set() (text bar like ▓▓▓░░ 3/5).
S96. Question chain: 2-button choices, answer → next question on same tag.
S97. Click behavior with the tab focused, backgrounded and closed (focus the existing tab vs open a new one).
S98. What sound/vibrate/silent the page controls vs Android's per-site settings.
S99. Stretch, only once the above works: push notifications (subscription + a dev-server route that sends a test push after a delay, so I can switch apps or close the tab first).
S100. Report.
S101. Short markdown: what works without installing a PWA, setup steps that worked, results of each demo, limits found (e.g. buttons only, no checkboxes or inputs), and anything that surprised you.
S102. Next step (don't build yet).
S103. Page lifecycle testing: visibilitychange, pagehide, freeze, unload, sendBeacon.
S104. Note anything you learn about it in the report.
S105. Notes from the dispatcher.
S106. "lab/" means a lab directory under the public tree; choose the right location by the readme chain (is there an existing lab area? if not, pick `public/framework/lab/` or similar and record the alternative), and make sure the lab and its demo are linked from the site.
S107. You can test notification logic headless where possible; the real Android test is the owner's, so give them a one-screen phone checklist page (the URL to open, the flag steps, the buttons to press) and put the same steps in the report.
S108. No new npm dependency.
S109. The push stretch needs a dev-server route (`Server/`); that is the one place to be careful: small, loopback-safe, reviewed.
S110. [sessions/2026/10/09/refine-demo/refine-demo/requirements.md]
S111. Refine demo: a Prompt class you can talk to, with a live debug view.
S112. Owner (2026-10-08).
S113. Goal: a page where you speak one prompt and watch it become raw, clean and structured text, beside a live view of the `Prompt` object doing it.
S114. How to work.
S115. Who: you are a Sonnet 5.5 mastermind owning this task end to end; build it yourself.
S116. Spawn a Haiku 5.5 minion (parent = you, under 60k tokens) only for cheap reading.
S117. Git: work in a worktree, smoke-test, commit after each working step, read the diff, merge.
S118. Budget: run `node Server/usage-now.mjs` before any spawn.
S119. No OpenRouter (paused, its accounting is untrusted): use Claude Haiku 5.5, the local model, or plain code.
S120. Resume: keep `STATE.md` in the task dir current after every step so a fresh session can continue.
S121. Always: link everything you create from the site; destroy nothing; reply in chat with one sentence.
S122. Read first.
S123. `public/framework/ext/Refine/doc/vision-2026-10-08.md` (the owner's whole design, both addenda: pipeline, per-sentence clarity and weight, flags, alternates, names, the `Prompt` class), `ext/Refine/readme.md` and its `doc/`, `Server/refine.mjs`, `ext/Refine/engine.js` + `structure.js`, `ux/Dictate`, and CLAUDE.md ("Write classes", "Show the class", "Name things", "Link every mention").
S124. Build (small, working, visible).
S125. A `Prompt` class (`ext/Refine/Prompt.js`, class name = file name; follow the house pattern: `Prompt.View = ...` attached after the class, `render()` does `new this.constructor.View(...)`): holds `raw`, `clean` (numbered sentences), `refined` (cards with sub-cards), and per sentence `clarity`, `weight`, `flags`, `alternates`.
S126. Reuse `engine.js`/`structure.js` for the actual cleaning and structuring; don't write a second pipeline.
S127. Scores may be simple first (a rule/heuristic or a Haiku call per prompt, not per sentence loops); record what you chose.
S128. The `ext/Refine` page becomes a working demo: a dictation widget (reuse `ux/Dictate`; must work on the phone page described in `framework/dev/mobile`) that refines one prompt at a time: speak, then see raw, clean, structured, with a yellow flag on low-clarity sentences (never nag) and click-through from a refined card to its source sentence.
S129. A button records the next prompt.
S130. If dictation is unavailable, a text box does the same.
S131. The live debug view next to it (CLAUDE.md "Show the class"): a tree/card of the live `Prompt` instance, rendering each property by type (string, boolean, number, nested array/object; functions optional), updating as you use the demo; the class card (icon, name, core API, who calls it).
S132. Reuse the existing class-card / Doc code from `ext/Doc` and `framework/ai/system` if it fits; extend, don't duplicate.
S133. Try your best; the owner will look.
S134. Docs: `ext/Refine` readme (short index) + one doc on the `Prompt` class; link the demo from the AI system page / the Refine entry on the site.
S135. Out of scope now.
S136. No refined-prompt hand-off to agents, no inbox filing, no multi-agent ranking of alternates, no hooks into VS Code.
S137. Note them as next steps.
S138. Land with `finish-task`; commit with attribution; no loose files.
S139. [sessions/2026/10/09/session-060cdfff/page-mastermind/doc-audit/requirements.md]
S140. core/Page doc audit: one recommendation per doc file.
S141. Budget: $1 per minion.
S142. Model: Haiku.
S143. Read only, except your own `recs.md`.
S144. Stay under 60k tokens: read each file once, and grep (do not read whole) to find related docs.
S145. The owner (2026-10-09, 19:05) wants the page system's docs cleaned up: merged, condensed or moved where they overlap, and superseded files archived with a note.
S146. You recommend; the mastermind (`mastermind-page-system`) decides and does the moves with a script.
S147. Change no file except your own `recs.md`, written in this folder (`doc-audit/`).
S148. What to read.
S149. `public/framework/core/Page/readme.md` (the module's index) and `public/framework/core/Page/doc/architecture.md` (the current class architecture and decisions; treat it as the truth).
S150. Your files, named in your prompt, all in `public/framework/core/Page/doc/`.
S151. For each file, grep `public/framework/core/Page/` and `public/framework/ext/` for docs on the same topic (its key words, and links to it), and skim only the matching parts.
S152. What to decide, per file.
S153. One verdict:
S154. keep: current, unique, and in the right place.
S155. condense: right place, but long or repetitive; say what to cut.
S156. merge: overlaps another doc; name the doc it should merge into and which one survives.
S157. move: belongs beside another module; name the folder.
S158. archive: superseded or describes a system that no longer exists; name what replaced it.
S159. Also note: is it linked from `readme.md` or another doc (`grep -rl "<name>.md" public/framework/core/Page`)?
S160. Any claim you can see is stale (a file, class or method that no longer exists: check with a quick grep)?
S161. What to write.
S162. `recs.md` in your own task folder, one block per file:
S163. ## <file>.md: <verdict>
S164. - why: one or two plain sentences
S165. - into / folder / replaced by: <path, if any>
S166. - linked from: <files, or "nowhere">
S167. - stale: <claims checked and found wrong, or "none found">
S168. Then "keep" with "none found" is a fine answer.
S169. Then stop.
S170. [sessions/2026/10/09/session-060cdfff/page-mastermind/requirements.md]
S171. Page mastermind: study the page system, then agents change pages by path + delta.
S172. The owner, 2026-10-09 ~18:05 (VS Code tab 7efd07d5).
S173. Your primer is `public/framework/core/Page/readme.md`; your goal is `core/Page/doc/page-tool-2026-10-09.md` (read both first).
S174. 1. Study, with a readme sanity check (cheap).
S175. Read the readme chain root → `core/Page/` and the child readmes it names.
S176. On ingest, check each: up to date? stale? unclear? a major subsystem missing? Fix only **major** errors and omissions (a big subsystem not indexed, a wrong fact), in a line each; do not polish, do not go into skill refinement.
S177. List what you fixed in your task log.
S178. 2. Build: the page tool works for real.
S179. Close the four gaps in `page-tool-2026-10-09.md`.
S180. (1) A delta can add a tab, change layout, change navigation (smallest change to `Page.class.js`).
S181. (2) Every session folder gets a `page.jsonl` beside its `session.jsonl`, rendered on top of the default session template, live.
S182. (3) An agent knows its own page's path (Servex injects it; a VS Code tab via a hook); the agent writes only path + raw JSON delta, and the tool stamps ts/ids/by.
S183. (4) The demo: in a session, "add a tab here" makes a tab appear with no reload.
S184. Sessions get a name (slug) where they lack one; VS Code tabs too.
S185. Write the class architecture first (a short page: classes, what extends/composes what) per CLAUDE.md, then the smallest slice.
S186. Fences and neighbours.
S187. You own `core/Page/`, `Servex/agents/page_tools.js`.
S188. `minion-session-detail-live` is editing `ai/AISession/AISessionDetail.js` right now (its step 5 = AI-posted cards on the session page).
S189. Message it (`send_to_agent`) before touching the session template; better, let it land first and build on it.
S190. The AI mastermind (`mastermind-ai-system`) studies the AI system in parallel; ask it, don't duplicate its reading.
S191. Rules.
S192. Opus, by the owner's choice ("we want this to work properly"); spawn Sonnet or Haiku helpers only for bounded pieces.
S193. Worktree; commit after each working step; `Server/merge.mjs`; check pages at 400/1200/1920/3440.
S194. Land with finish-task and a `Note:` card with the demo screenshot.
S195. [sessions/2026/10/09/session-060cdfff/page-mastermind/streaming-doc/requirements.md]
S196. Budget: $3
S197. core/Page: one clear overview of page storage and streaming.
S198. The owner (2026-10-09 18:15 and 18:25, relayed by vscode-mastermind-7efd07d5) said: "Document the page streaming system in core/Page very clearly: page.jsonl append → live() tail → render; what lives where, cross references, which tools write it (page_tools.js, Servex append_log), coordination; one overview a reader can follow."
S199. Document clearly page.js vs page.jsonl vs files.jsonl (the per-folder index; directory.json is now off, see Server/doc/directory-off.md), and the other path-based per-directory systems; the page system is our storage + streaming container.
S200. Do.
S201. Write ONE file: `C:\Code\lew42\worktrees\page-mm\public\framework\core\Page\doc\streaming.md` (worktree `page-mm`, branch worktree/page-mm).
S202. Under ~120 lines.
S203. Plain sentences for a new coder (CLAUDE.md law 2), a diagram in a code block, then short sections:
S204. The files in a folder: page.js, page.jsonl, files.jsonl, settings.jsonl, readme.md, doc/, directory.json (off) — one line each: what it is, who writes it, who reads it.
S205. One line's journey: a writer appends → the dev server's watcher → `Server/plugins/SocketServer/Tail.js` → the socket → `ext/JSONL/live.js` → `Page.Reader` (core/Page/Page.class.js, extends `Item.Store` in core/Item/Store.js) → `page.set()` → the page redraws (`log_redraw`, `nav_redraw`, and the new `rerender()`).
S206. Name each file with its path.
S207. Say what a browser tab writes back (`Item.Store` → `Server/plugins/SocketServer/Append.js`).
S208. Who writes: `Servex/agents/page_tools.js` (page_set is the page tool: path + delta, see doc/page-tool-architecture.md), Servex `append_log`, `.claude/hooks/append.mjs`, and hand edits are blocked by `.claude/hooks/jsonl-guard.mjs`.
S209. One line each.
S210. Rules that keep it safe: append only (never rewrite), one writer per line, validation (`.claude/hooks/jsonl-schema.mjs`), localhost-only streaming (production loads once).
S211. Path-based per-directory systems: md/ and fs/ routes, the page inbox (core/Page/ext/Inbox), files.jsonl listing — one line each with a link (core/Page/ext/doc/path-extensions.md has the census).
S212. Read the real code to verify every claim (Tail.js, live.js, Store.js, Append.js, Server/plugins/PageFiles.js, Page.class.js `Page.Reader`, doc/jsonl.md, doc/loading.md, Server/doc/directory-off.md).
S213. Link existing docs instead of repeating them.
S214. Write links as plain relative file paths (`jsonl.md`, `../../Item/Store.js`).
S215. Fence.
S216. Only that one file.
S217. Do not edit readmes or code (the mastermind links it).
S218. Commit it in the worktree: `git -C C:/Code/lew42/worktrees/page-mm add public/framework/core/Page/doc/streaming.md`, then commit with a clear message ending with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
S219. Never `git add -A` (the worktree has generated noise).
S220. Then stop and reply in two sentences.
