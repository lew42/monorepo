Budget: $12

# Tabs on a plain Page: tighten, make consistent, file explorer behind a menu

Load the `minion` skill first, then the `page` and `css` skills. Card (the owner's words): `/framework/ai/2026/11/06/page-and-item-voice-help-feature-demos-c/`. The demo: `/live/demos/tabs-page/` (`public/live/demos/tabs-page/page.jsonl`; a plain `Page`, `navigation: "tabs"`, child pages `alpha/` and `beta/`, and the tabs `gamma` to `eta` added by voice with `{"tab":{name,title}}`). It is gitignored, so leave its files alone except through the item tool.

## The owner's notes (relayed by voice-app, 2026-11-06)

1. The H1 "Tabs (plain Page)" is too big on mobile, and its big bottom margin pushes the tabs far down. Tighten it, at least on jsonl/live pages. The owner likes the underlined tab row; test it with 7+ tabs (overflow and scroll).
2. The tabs are inconsistent. Overview has no heading and shows a "Files · 2" link. Alpha and Beta show a heading, and their page can't scroll to the bottom (a layout bug). Overview, Alpha and Beta show a file-explorer widget (a tree on the left, page.jsonl on the right, both scrolling sideways); Gamma doesn't. Where do that widget and the `/files/` sub-route come from (a Page default?)?
3. File explorer: stack it vertically on mobile. The owner LIKES seeing page data, so consider a menu button at the top right that opens files and data, instead of drawing it on every tab.
4. Voice needs a way to control the tab layout (what renders in each tab).

Starting points (verify, don't trust):
- `core/Page/Jsonl.js:201–224`: a page.jsonl page with no `content()` draws its folder through `ext/files/files.js` (`draw_folder`).
- `core/Page/FilesTab.js:45–52`: the `files/` sub-page and the "Files · N" link.
- `core/Page/Frame.js`: the tabs branch.
- 400px shot of today: the H1 takes ~100px, the tabs sit at y≈120, and the explorer starts at y≈220.

## Phase A: findings first, as cards (no paragraphs)

Add a tab "Tabs page" to `/live/design/`. Send `{"ui":{"tabs":{"names":[…existing…,"Tabs page"]}}}` through the item tool, then post cards with `"tab":"Tabs page"`. Each card has a title of a few words, a one-line subtitle, and a visual: a code block holding `file:line` and at most 3 lines of the deciding code, or a cropped shot. One card per question:

- why Overview has no heading and Alpha does;
- what draws the explorer, and why Gamma has none;
- where `/files/` and "Files · N" come from;
- why Alpha can't scroll to the bottom (name the CSS rule);
- **voice and tab content:** what decides a tab's content today (a child folder? a `tab` line with no folder?). Then the smallest delta that would let voice say what a tab shows; recommend one shape, and name the alternative.

Log each finding as a `log` line in your task's session.jsonl, too.

## Phase B: fix in a worktree

Use the worktree Servex gave you; the site is live. Fix:

1. **H1 on mobile:** smaller, with a tight bottom margin, so the tabs sit right under it. Do it in the narrowest place that fixes every jsonl page (say which). Check that a page.js page's H1 doesn't change unless that's clearly right.
2. **7+ tabs:** one underlined row that scrolls sideways (no wrap, no page overflow). The selected tab scrolls into view.
3. **Alpha/Beta scroll bug:** fixed.
4. **Explorer stacks on mobile:** tree above data, no sideways scroll on the page itself.
5. **Explorer behind a menu:** a small button at the top right of a jsonl page, labelled with an icon plus "Files". It opens the explorer (tree + data) as a panel or sheet. Remove the explorer from each tab's body. Make it **the default for jsonl pages**: the owner likes the data, so the button must be visible. Keep the old inline drawing behind one page word (say its name) for pages that want it. Load the `navigation` and `ui` skills for the button and the sheet.

## Fence

- Write only:
  - `core/Page/` (Jsonl.js, Frame.js, FilesTab.js, Page.css and the other files these fixes need);
  - `ext/files/`;
  - `/live/design/` through the item tool (cards and the tabs line only);
  - your task dir.
- **Do not touch** `List.js`, `Item.js`, `Reader.js`, `public/live/*.js` or `Servex/`: mastermind-live-page is working there.
- Never restart Servex or the dev server, never drive the owner's tabs, never `git stash`. `node --check` every .js file you edit. Commit at each working step, by exact path.

## Prove it

- Shots at 400 and 1200 of `/live/demos/tabs-page/` (Overview, Alpha, Gamma, the menu open), served from your worktree. Read the 400 ones yourself.
- Run every node test under `core/Page/` that covers a file you touched (`public/framework/core/Test/readme.md` says how).
- `node Server/smoke.mjs` shows no FAIL for your worktree.

## Done

- One `log` line listing:
  - the commits;
  - the worktree branch;
  - the shot paths;
  - the test output;
  - the page word for the inline explorer;
  - anything you'd change.
- Then stop. The mastermind reviews and merges; **do not merge**.
