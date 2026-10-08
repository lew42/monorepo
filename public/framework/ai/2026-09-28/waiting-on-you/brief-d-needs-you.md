# Brief D — the "Needs you" tab (2026-09-29)

Load the `minion` skill first, then `page`. Card directory: public/framework/ai/2026/09/28/waiting-on-you-never-buried/ and the task dir public/framework/ai/2026-09-28/waiting-on-you/ (read requirements.md there; the old branch `worktree/waiting-on-you` has a strip design — `git show worktree/waiting-on-you:public/framework/ai2/waiting.js` and its fold.js/Cards.js diff — reuse ideas, it is 75 commits stale so do NOT merge it).

## The owner's words, today
"does the AI2 dashboard... have a view yet that just shows me... the most important things that are waiting on me? ... having a prioritized view ... what's needed from me ... I don't even want to look at it because it's just so... we have not built like a solid foundational thing."

## Work ONLY in the worktree C:\Code\lew42\worktrees\needs-you (server http://localhost:53478/). Commit there. Never touch C:\Code\lew42\monorepo.

## Deliverables
1. **A "Needs you" tab, FIRST on the AI 2 root**: tabs read `Needs you · Inbox · Overview` (see `content()` and `route()` in public/framework/ai2/page.js). It is the DEFAULT view at /framework/ai2/. Inbox moves to its own address (e.g. /framework/ai2/inbox/) — card urls must still work and still light Inbox; Overview stays at overview/. Every view has its url; reload/back lands in place.
   - Lists ONLY what waits on the owner: an unanswered Question or Decision on any card (examples: card 2026/09/29/openrouter-key-for-the-harness-spike, 2026/09/28/in-flight-tonight-5-tasks-stalled-2-rest, the `d-next-build` Decision `place` line on the Now card 2026/09/25/now), cards of type `question`, and cards whose last message asks the owner something (ends with "?" addressed to the owner). Find how decisions are answered (ux/Content/Decision) so "answered" ones drop out.
   - Ranked: a BLOCKER first (something that stops work, e.g. the OpenRouter key blocks the harness), then decisions, then FYIs. Give each item a kind from its data; a simple rule is fine, write it down in a comment.
   - Each item is ONE big plain line (a short title, 5–8 words, not raw dictation) with its answer control right there (the Decision's options as buttons, or a reply box), or a link to its card. Nothing else on the tab.
   - Empty: one line, "Nothing needs you".
   - Data from the static card index / card logs the page already loads (fold.js, cards index); no new datastore, no Servex change unless unavoidable.
2. **Overview fixes** (public/framework/ai2/overview.js and css): stray "Folder" labels appear above the title and the grid at 1920 — remove them. Each ask shows the first words of a raw dictation ("All right, so the whole thing here is…") — show a short TITLE instead (the task's title, or a 5–8 word summary), with the full quote one click away (a <details> or link).
3. Screenshots at 1920 and 3440 of /framework/ai2/ (Needs you) and /framework/ai2/overview/, saved into the task dir as needs-1920.png, needs-3440.png, overview-1920.png, overview-3440.png. Judge them: can the owner tell in 5 seconds what needs him?
4. `node Server/smoke.mjs C:\Code\lew42\worktrees\needs-you` clean. Update public/framework/ai2/readme.md in one line + a short doc/needs-you.md. Commit in the worktree. Do NOT merge — the mastermind merges.

## Rules
Every Node spawn uses windowsHide: true. Headless Playwright only; never the owner's tabs. CSS inside a layer, classes prefixed ai2-. No DOM after an await. Budget: about $4. Log progress with `node .claude/hooks/append.mjs` to the task dir's task.jsonl as "minion-D: ...". Finish with a one-paragraph report: what changed, the four screenshot paths, anything unfinished.
