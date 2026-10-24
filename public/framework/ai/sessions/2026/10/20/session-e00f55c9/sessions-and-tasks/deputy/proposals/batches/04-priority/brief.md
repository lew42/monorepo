# Which big thing does each proposed task plainly serve? (25 tasks)

You sort; you do not build. Do NOT edit any file. This brief has everything you need: do not search the repo. Your final message is ONLY the JSON array described below (the runner saves it to `public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/proposals/batches/04-priority/results.json`).

The owner has three big things:

1. **See and approve the work** — One page per day where the owner sees every session, opens a demo, and approves a whole session with one press. Approving a session approves everything inside it. Spend that never gets approved shows red, as a leak. What is ready to merge sits on the same page. - **Now:** the review page is being built on the AI dashboard ([/framework/ai/], brief: [review-page]). The Merge list is live at [/framework/ai/merge/] and folds into the review page. - **Inside it:** the phone pages for sessions ([sessions/v/mobile]) and the design picks they follow ([mobile-cards.md]); the session page with its tasks; a time filter (Today, Week, Month, Year) inside a session; the 19 closed worktrees whose commits n
2. **Every ask becomes a task that finishes** — Each thing the owner asks for is filed as a task the first time, runs step by step, and ends done or documented, with its proof. Nothing is lost between sessions. - **Now:** the 230 proposed tasks from old asks are being sorted under these three things (accepted into a priority, or parked in a backlog the owner can approve in one press). Process names are decided (*step*, one class per template, handoff by moving the task) and the rename is under way. - **Inside it:** prompt records (each prompt split into parts, its completion computed: [prompt-records.md]); processes ([process.md]); task resolution ([resolution.md]); node chases a started task that goes quiet (the "task chase" and "status 
3. **Agents that know the rules** — Every agent knows where things go and what was decided, from short readmes it can trust, and the right model does each job. - **Now:** the documentation rule is written (documentation skill §4: `readme.md` is the index, a sibling `<topic>.md` for an often-read topic, `doc/` for the rest; no dated logs in readmes; the mastermind owns its area's docs). Next: a cheap pass that makes every readme follow it. The model experiment: one Opus builder that designs and builds a whole slice, compared with an Opus planner plus Sonnet builders ([models]). - **Inside it:** the readme system ([doc/readme-system.md]); seeing which readmes, skills and tools each agent got ([agent-context.md], the readmes page

For each task below answer ONE question: which of the three big things does finishing it **plainly** serve: 1, 2, 3, or none? Answer `none` when in doubt. A task that merely touches the same folder is `none`; it must plainly be part of the thing's own description above.

## Output

A JSON array, one object per task, same ids, nothing else in your message:

```json
[{"id":"abc1234567","priority":1,"why":"one short line"}]   // priority is 1, 2, 3 or "none"
```

## The 25 tasks

1. `12417eecd0` [design/ui] Add a right chevron to buttons and a drop-down arrow to selects — No chevron on button styles found; public/framework/code/css/doc/caveats.md:75 shows a select's arrow is a background-image that a shorthand can wipe.
2. `2de3043831` [ext/Dropdown] Explore dropdown menu variants and the content a custom dropdown can hold — ext/Dropdown exists as one-choice-from-a-list; no variants study found in this pass.
3. `068fce0ce9` [ext/Dropdown] Compare fixed-height scrolling mobile dropdowns with full-page drops — No mobile dropdown comparison found in this pass; the dropdown module is the place for it.
4. `80cff07123` [design/color] Test a darker dark token for higher contrast — public/framework/styles/layers/theme/lew42/lew42.css:50 - --dark: light-dark(#3f3f3f, #4a4a4a); no darker option tried.
5. `b3f8e887d6` [design/color] Explore using darken and lighten together — public/framework/styles/doc/architecture.md:31 sets both as one rule; public/framework/styles/css-scopes.txt:69 says --lighten-* still has no class.
6. `b47772b7bb` [ui/icon] Match icon size to title size and to nav-bar and button text — ui/icon/page.js shows only 14, 18 and 28px sizes (commit ui/icon page: show first). No rule for nav-bar or button placement or for matching a title.
7. `0cd3f7a287` [ui/background] Explore a big icon with title overlaid on a background image as an effect — ui/background/page.js:16-17 has only icon textures ('texture', 'scatter'). No big icon with a title over an image.
8. `117c704d7f` [ext/Dropdown] Explore dropdown menus and the kinds of content that can go inside the custom… — ext/Dropdown/page.js:45 describes a list of choices behind a trigger. No page covers the kinds of content a dropdown can hold.
9. `e881f4db6e` [ai] Explore fixed-height mobile dropdowns — ext/Dropdown/dropdown.css:43-46 - 'A long list scrolls INSIDE the box, never the page' with max-block-size: min(60vh, 22em)
10. `921c322e09` [ui/controls] Make checkboxes, radios and toggles the default controls — ui/controls/doc/grammar.md:136-138 covers checkbox, radio and dropdown sizing only. No rule says toggles come first or that a dropdown is for three or more modes.
11. `c77dca1bb0` [ai] Explore using darken and lighten together — ui/words/words.js:34 - 'is itself a light-dark pair, so one line darkens it in light mode and lightens it in dark'
12. `9681c66828` [design/color] Organise colour modes around the text used on primary backgrounds — public/framework/design/color/doc/rules.md:23 - "Body text needs 4.5:1 against its ground". Contrast rules exist, but no colour modes are organised around text on primary backgrounds. Unbuilt.
13. `9c3b89d2ca` [styles/stacks] Group the stacking colour and nesting examples into named sections — public/framework/styles/stacks/page.js:158 - the only use of 'section' is prose ("the page arguing its own last section"). The examples run as one matrix() flow with h4 labels and no section grouping. Unbuilt.
14. `11b419bb71` [styles/layouts] Work out how these layouts fit on mobile, where space is limited — public/framework/styles/layouts/400 covers one-column sets at 400px for five class strings only; the other layouts were not checked at mobile width. Unbuilt for the rest.
15. `7090b3fcde` [styles] Do a CSS audit of the site — public/framework/ai/rail/overview/overview.json:554 - "outcome": "The CSS audit landed: up to 8,599 of 35,769 lines can go, and a pick-a-curve page..."
16. `14c25a45d6` [styles] Refine the CSS into a much simpler set of components without breaking anything — public/framework/ai/doc/asks-outcomes.md:72 records the CSS audit's 8,599 lines as identified for removal, not removed. The simplification itself is unbuilt.
17. `efb4716dad` [styles] Migrate each CSS usage to the new system, then remove the old one — public/framework/ai/asks/undone.json (ask text only, open, no migration record found). The ask names no target system, so the target needs a decision first.
18. `e15430f07c` [styles] Reduce to a minimum set of tokens and reuse them everywhere — public/framework/ai/asks/undone.json:5457 - "text": "Reduce to a minimum set of tokens and reuse them everywhere." (open, no task found). Unbuilt.
19. `b94d5198cb` [styles] Make unifying and simplifying the CSS the top priority — No completion marker found. Commit 4c74b6ae kept --prim and --bg as aliases for compatibility, so the cleanup is still open.
20. `b7638f7e28` [ui] Give some component types, e.g — public/framework/ui/readme.md:5 - `Only table, kbd and timeline are functions; the rest are markup you copy`. A grep for click-through under ui/ found nothing.
21. `f133c7c3ab` [ui] Show components in action, not only static — public/framework/ui/readme.md:5 - `the rest are markup you copy`; the ui pages show static markup with no live behaviour.
22. `a4df95a04b` [ai] Run a CSS audit — public/framework/ai/audits/index.jsonl:11 - `css, launch, site, taste, layout, ui-behaviors audits (Aug-Sep)`
23. `e6f8f0b992` [styles] Migrate CSS usages one at a time to a simpler component set — No migration record under styles/ or ux/doc/; the old token set is still declared at public/framework/framework.css:263 - `--pad: calc(clamp(1em, 2.6% - 1.1em, 4em) * var(--size));`
24. `7bcc14bf20` [design/color] Cut shaded primary where contrast does not call for it — Rule exists at public/framework/design/color/readme.md:11 (do not darken or tint prime). No audit of shaded primary uses found; grep of design/color/doc/rules.md for primary: no match.
25. `d8b305a37f` [design/color] Reconcile the darkened primary token with the hard-coded M logo — Conflicts with public/framework/design/color/readme.md:11 (do not darken prime to fix contrast). Logo-colour grep found only Figma task files and unrelated hits; no hard-coded M logo colour found.
