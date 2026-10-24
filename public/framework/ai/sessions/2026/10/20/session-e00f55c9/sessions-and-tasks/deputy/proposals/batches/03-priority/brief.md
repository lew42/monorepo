# Which big thing does each proposed task plainly serve? (25 tasks)

You sort; you do not build. Do NOT edit any file. This brief has everything you need: do not search the repo. Your final message is ONLY the JSON array described below (the runner saves it to `public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/proposals/batches/03-priority/results.json`).

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

1. `21848c1cb8` [ai] Plan how each long-form video is re-cut into shorts with related-video links — Not built: no re-cut plan found. Grep of public for shorts and related video matched only unrelated pages, and public/imagine/youtube is a player lab, not a video plan.
2. `f8215a9108` [ai] Work out how the planning output moves into the video editing flow — Not built: no handoff from planning to editing found. Grep of public for premiere and video editing found nothing for this.
3. `264597d013` [ai] Find out whether Claude can be linked into Premiere to edit the footage — Not built: Grep of public for premiere found no Premiere integration or research note.
4. `aefe95bcc3` [ai] Find generic images through image search such as Unsplash — Not built: a Grep of public for Unsplash, image generation and image API found only session logs and notes, no code.
5. `bd1b70d9d2` [ai] If images cannot be searched or generated, set up an image generation API as a… — Not built: no image generation API in code. Grep of public for image generation matched session logs and notes only.
6. `72b20f8089` [ai] Develop YouTube idea: sports and luxury cars, cost, makers, performance — Not built: no content plan for this idea found in public/framework.
7. `79cfc99b7d` [ai] Develop YouTube idea: luxury yachts and boats, affordable to luxury — Not built: no content plan for this idea found in public/framework.
8. `0c33413547` [ai] Develop YouTube idea: big houses and architecture, mountain and beach homes — Not built: no content plan for this idea found in public/framework.
9. `0d2bba16d6` [ai] Develop a YouTube content idea on private jets and personal aircraft — Not built: no content plan for this idea found in public/framework.
10. `c7a24ccd51` [ai] Work out how to find footage on other YouTube channels and quote their videos — Not built: no discovery or quoting process found in public/framework.
11. `4f43f54f1f` [ai] Email channels that list an address to request permission to use their footage — Not built: no permission-request template or process found in public/framework.
12. `6cd5c65606` [ai] Identify very foundational, fundamental layouts, starting — styles/rules/robust.md:78 - 'Two panes that become one. Exactly two wants repeat(2, minmax(0, 1fr))'
13. `4158854898` [styles/layouts] Build a two-column layout: title and nav left, card right — styles/rules/robust.md:53 has a 19em left column, but no card-on-right layout turned up. A search for 'card' in sidebar, split, cols and shell js found nothing.
14. `049cc8b045` [design/color] Play with different color schemes for the layouts — No colour-scheme switch for the layouts turned up in a search of styles/layouts.
15. `586af9fe70` [ux/Browse] Explore whether clicking items flips the content — ux/Browse is a list-and-detail view with no flip on select. ux/Card/Card.css has no flip effect; its only match is a comment about chat at line 1013.
16. `7dd9af3e7b` [styles/layouts] Show one layout with four or more different content uses — styles/layouts/space and screens show one layout across several screens. No single layout is shown with four or more different content sets.
17. `135914a3ce` [ai] Identify robust, versatile, simple layouts that can be mixed — styles/rules/robust.md:8-12 - 'This is the shortlist of arrangements that survive the whole range with no media query' (the seven)
18. `f4cc4bec06` [design/color] Vary the color schemes across the layouts — public/framework/styles/system/studies/themes/themes.css:31-163 defines several palettes, but the layout previews are not shown in them.
19. `ff59ecfe54` [styles/layouts] Build a library of foundational layouts for diagrams — public/framework/styles/layouts/wire has eight page skeletons, none for diagrams or flowcharts.
20. `e38bf5f9bc` [design/ui] Experiment with other UI designs that could be useful for the site — No experiment page for alternative UI designs found in this pass; ui/ holds only the current template tier.
21. `22b5d34670` [design] Explore charts, graphs and flowcharts to lift the owner's UIs — Only ux/Content/Spend (a dollars-over-time SVG) appears in the module list. No infographic or flowchart study exists.
22. `9994b5df59` [design] Propose and try alternative UI designs, mobile last — No proposal page found in the module list. Mobile is deprioritised for these ideas, per the ask.
23. `b38f452921` [ui/icon] Build a core icon set: play, menu, dot, close, check, bullets — public/framework/ui/icon/page.js:8-35 shows only arrow_back, home, search, bookmark, more_vert, star, favorite; no play, hamburger, dot, check, or bullet icons.
24. `f77ee21fb5` [design/navigation] Explore nav bar layouts with icons and text beside or below — public/framework/design/navigation/page.js:7 only sets icon: "explore" for the page card; no nav bar with icon-and-text variants found.
25. `8da919253c` [ui/icon] Explore icon sizing that matches the title size and avoids wasted or dead… — public/framework/ui/icon/readme.md:13-15 covers frame, flush and backed icons only; no size-to-title rule or overlay case.
