1. Give each of the five checkers the brief in `sessions/2026/10/06/feedback-council/requirements.md`, and have them read the raw words in the card dir `public/framework/ai/council/` and in `words.jsonl` in the active run directory. [S1, S2, S3, S4]

2. Check the owner's brief for the three features (Markdown Explorer, Command Characters, Class card), which is recorded verbatim from the 2026-10-06 dictation. [S24, S25]

3. Check the new asks from `words.jsonl`, plus every open ask in `council/asks.jsonl` whose latest verdict is not `done`. [S5]

4. Give every ask one verdict after looking at the real result: `done`, `partly`, `not done` or `done-but-wrong`. Each verdict gets one line of evidence (URL, screenshot path, file:line). Anything not done gets the smallest fix. [S6, S7]

5. Prove before calling something missing. A false `not done` is the common failure, so search first: `git log`, grep, `.claude/skills/`, CLAUDE.md. [S8, S9]

6. Check the live site at http://monorepo.localhost, never http://localhost/. [S10]

7. For visual asks, use headless Playwright at 1920 and 3440. Never use the owner's tabs (no `mcp__site__eval` on tabs they have open). [S11]

8. Measure the Live card load time, and check scroll on the named URLs with real overflow measures. [S12, S13]

9. Let no window pop up: use `windowsHide: true` and `-WindowStyle Hidden`. [S14]

10. Edit no repo file. Put scratch in the scratchpad, and screenshots in `<run-dir>/shots/`, only as evidence and 12 at most. [S15, S16]

11. Scan `words.jsonl` for up to 8 extra asks the current list misses, and give each the same verdict. [S17]

12. Write ONE json file, `<run-dir>/votes/<your-name>.json`, shaped `{"name", "votes": {"A1": {"v", "e", "f"}}, "extra": [...]}`. [S19]

13. After writing the votes file, reply "done" in one line, then return. [S18, S20]

14. Never write the owner's name anywhere. [S21]

15. Keep each checker to about $2: be quick and do not over-explore. [S22]

16. Load the `minion` skill only if it does not conflict. Edit nothing but your votes file and shots. [S23]

17. Command Characters (`ext/Mention`): settle on three command characters, each for one kind of thing. [S34, S35]

18. Command Characters: `/` is file system paths, strictly 1:1 with the real file system (`/framework/core/Page/`). It has no separate alias and resolves straight to the disk/URL path. [S36, S37]

19. Command Characters: `@` is actors, meaning users and agents (`@owner`, `@mastermind`, `@minion-*`). [S38]

20. Command Characters: `#` is classes and concepts (`#Page`, `#Item`, `#List`). [S39]

21. Command Characters: give each kind a distinct icon and color theme, so the reader learns the type at a glance. [S40, S41]

22. Command Characters: class mentions get an upgraded framed icon and dark card surface (`.page-surface-dark`), so living classes stand out from plain pages. [S42]

23. Class card (class documentation page): the class title card is an icon item card (icon + class name), matching its inline mention and tree navigator row. [S43, S44, S45]

24. Class card: no cards-within-cards. Properties and methods are clean, unboxed icon items, with no nested boxes or borders. [S46, S47]

25. Class card: show the class's own methods first, then inherited base-class methods below (`Page` first, then inherited `Item`). [S48, S49, S50]

26. Class card: put the Core API at the top, with the 5–7 most critical methods and properties. [S51, S52]

27. Class card: rank members by importance and usage weight, with manual ranking in docs/metadata first. [S53]

28. Markdown Explorer: upgrade the dynamic `md/` path and tab, which every page and module already has as a subpath, into a full explorer. [S26, S27, S28, S29]

29. Markdown Explorer: the main content pane renders the module's primary `readme.md`. [S30]

30. Markdown Explorer: the sidebar quick-reference lists all sub-markdown files (`doc/*.md`, sibling `.md`) for quick scanning and instant jumping via `swap_link`. [S31]

31. Markdown Explorer: add an `md` tab on modules that have markdown, so readers and AIs can inspect the docs hub directly. [S32]

32. Markdown Explorer: AIs writing pure Markdown with no JavaScript can then make interconnected docs that are served raw and rendered rich. [S33]
