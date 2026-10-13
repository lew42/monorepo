---
name: ui-test
description: Prove a UI interaction instead of describing it — drive the page headless and screenshot after every gesture. Use for "test the drag", "does the resize work", "ui-test this page", any drag / drop / sort / resize / hover / keyboard / pointer gesture you must show working, a layout you suspect is broken at some size, and for "force the state and shoot it" when the state is easier to set than to reach.
---

# ui-test

A gesture you can't see is a gesture you haven't tested. `drive.mjs` runs a plan of pointer steps against a real page in its own headless browser and writes, after **every** step, a numbered png and one line of `steps.json` (the verb, console errors since the last step, the watched elements' rects before and after). The json is the evidence; the pngs are the picture.

```bash
node C:/Code/lew42/monorepo/.claude/skills/ui-test/drive.mjs plan.json
```

```json
{ "url": "http://monorepo.localhost/framework/ext/drawer/", "viewport": { "width": 1280, "height": 900 },
  "watch": [".drawer"], "out": "<scratchpad>/<task>-grip",
  "steps": ["click \"text=Open the rail\"", "move 982 450", "down", "move 982 450 1", "move 832 450 20", "up"] }
```

The rules that break runs most:

- **Write the plan with the Write tool, never a heredoc**, and **always set `out`** to your own scratchpad folder (unnamed runs overwrite each other). Node paths are `C:/…`, never `/c/…`.
- **Never drive the owner's tabs**, and **a proof never posts as the owner** (stub the POST, or `via:"test"`).
- **Pick the root first:** most matches on this site are hidden duplicates that answer with plausible numbers.
- A drag is `down`, then `move x y` with **steps ≥ 10**, then `up`. Quote a `click`/`hover` selector with a space in it.
- A plain screenshot needs no plan: `mcp__site__shot`, or `{ browser }` from `Server/browser.mjs` (never `chromium.launch(`).

**Before your first plan, and whenever a step errors or times out, read [`reference.md`](reference.md):** every verb, the traps (hover-revealed targets, overlay pseudo-elements, auto-scroll, `type` appending), drive vs force, reading a drag, layout flags, and the proven runs.

Improve this skill: append to [`improvements.md`](improvements.md).
