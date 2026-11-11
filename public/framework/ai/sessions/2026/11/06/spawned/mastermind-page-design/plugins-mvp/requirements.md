# Plugins MVP: one demo page shows its plugin tree, with working switches

Budget: $5. Load the `minion` skill first, then `code` and `page`.

**The ask.** The owner, 2026-11-09 (relayed by voice-app): "every page is just a collection of plugins, and plugins can have plugins… a tree of plugins… toggleable." The plan is [/live/plan/plugins/](/live/plan/plugins/) (`public/live/plan/plugins/page.jsonl`); its fresh review is `../page-templates/review/review.md`. Read the `mvp` and `instant` cards. The owner's rule: plan, review, then build the MVP and demo it. This is that MVP.

## What to build

1. **`/live/demos/plugins/`**, a new demo page (folder `public/live/demos/plugins/`). It is a sub-page of `/live/demos/` (add a `part-link` card there with the item tool, path `/live/demos/`).
2. **A small host class** in that folder, `DemoPage.js`: `class DemoPage extends Plugin` (`/framework/core/Plugin/Plugin.js`). It owns one box element the plugins change. Do **not** make `Page` pluggable: live-page's fold step 2 does that (`public/framework/ai/sessions/2026/11/06/spawned/mastermind-live-page/live-plan/fold-2/`), in review now.
3. **Three toy plugins**, one file each in the folder:
   - `Border`: draws a border on the box;
   - `Badge`: shows a badge in the corner, with one sub-plugin `Count` that adds a number to it (a plugin of a plugin: `Badge.use(Count)`; see `row.plugins` and `active` in `core/Plugin/PluginEntry.js:25-33`);
   - `Wide`: makes the box full width; off by default (`DemoPage.available(Wide)`).
   Each has `static attach(inst)` and `static detach(inst)` that undo cleanly.
4. **The tree panel**, beside the box: one row per plugin, the sub-plugin nested under its parent, a checkbox on each. A sub-plugin's row is greyed while its parent is off (`active` is false). A **Reset** button calls `inst.reset_plugins()`.
5. **A switch saves one line in the demo page's own `page.jsonl`**, so a reload keeps it. Use `RecordWriter.post(url, {lines: [...], by: "owner"})` (`public/framework/core/Item/RecordWriter.js`, header comment). Save the plain `inst.overrides` (e.g. `{"plugins": {"Wide": {"enabled": true}}}`, your choice of key, say which in the readme). On load, read the last saved overrides from the page's lines and pass them to `inst.load_overrides(...)`. The item tool writing the same line must also switch it (an open tab redraws), so the line is the one source of truth.
6. **Under the panel, the JS** a reader would type for what they just did: `page.plugins.set({Wide: {enabled: true}})`, `page.overrides`, `page.reset_plugins()`. One short code block, JS not JSON.
7. **A one-line takeaway** at the top: "This page is a tree of plugins. Flip a switch; the page changes now and after a reload."

Mobile first: the panel stacks under the box below about 700px. Check at 400, 1200, 1920 and 3440 with headless shots (never the owner's tabs).

## How the page is made

A `/live/` sub-page is drawn by `LivePage` (`public/live/LivePage.js`). Look at `public/live/demos/ref/page.js` (a working demo with a `page.js` that imports framework classes) and copy its shape. If a `part-view` card is simpler, use it (`core/Page/doc/ai-api.md`, "add a view"). Say which you chose.

## Tests and docs

- `DemoPage.test.mjs` beside it (agents.md law 12): one DemoPage, the three plugins, toggle each, assert the box changed; sub-plugin inactive when Badge is off; `overrides` → `load_overrides` round trip. Under 1 s.
- `public/live/demos/plugins/readme.md`: what it shows, the files, where a switch is saved. Link it from `public/framework/core/Plugin/readme.md` "More" (one line).

## Fence

Write only in `public/live/demos/plugins/`, plus one link line in `core/Plugin/readme.md` and the link card on `/live/demos/`. Do **not** edit `Plugin.js`, `PluginEntry.js`, `Page.class.js`, `LivePage.js`, any Item or List file. If the MVP needs a change there, stop and write it as a `log` line on your task; the mastermind takes it to live-page.

Work in the worktree you are given. Commit by exact path. Do not merge. Never kill or restart the dev server or Servex, never drive the owner's tabs, never `git stash`. rg is not installed: use `git grep`.

## Report

`log` lines on your task (`plugins-mvp` in `/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/`), the shots in `shots/` in this folder. Reply in under six lines: the url, the commits, the test result, and anything you could not do.
