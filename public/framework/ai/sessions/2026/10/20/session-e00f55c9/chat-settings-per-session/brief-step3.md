# Brief: step 3, `core/Settings` (a settings system between data and UI)

Budget: $3. Load the `minion` skill first. The owner's direction: [requirements.md](requirements.md) (last section) and `ux/Dictate/doc/principles.md` ("Settings"). Plan: [plan.md](plan.md), "New direction", step 3. Never write the owner's name anywhere; never stash; never kill the dev server; never touch `CLAUDE.md`.

## Worktree
You are given a worktree (or make one: `node Server/worktree-up.mjs chat-settings-settings`, never plain `git worktree add`). Work only there; commit by exact path after each working piece; keep `git status` clean (sweeps modify `files.jsonl` files: restore them with `git checkout -- <those files>` before committing). Writes to `.jsonl` go through `node .claude/hooks/append.mjs <target.jsonl> <lines.json>` (hand writes are blocked). Make sure the branch contains current `michael/dev` (merge it in if behind).

## Build (tests first)
New module `public/framework/core/Settings/` (name and home are fixed): `Settings.js`, `Settings.test.mjs`, `readme.md`, `page.js` (a live demo). Also one index line in `public/framework/readme.md` (the core modules list).

API (keep it this small; a plain JS class; `core/Events` only if you want `on/emit`):

```js
const s = new Settings({
	fields: [{ key, label, type: "toggle"|"slider"|"number"|"select"|"text", min, max, step,
	           options: ["a", {value, label, help}], low, high, help }],   // low/high: what a slider's two ends do
	defaults: { key: value },       // the level above; reading falls back to it
	values: { key: value },         // this instance's own overrides (what gets saved); optional
	save: "each" | { debounce_ms: 400 } | "manual",   // how often `persist` runs; default { debounce_ms: 400 }
	persist: own => ...,            // called with the whole own overrides (plain, JSON-safe); may return a promise
	clock: { setTimeout, clearTimeout },   // injectable for tests; default the globals
	groups: { dictate: { fields, defaults }, recite: { ... } },   // optional: each group is a child Settings at s.dictate / s.recite
	level: "this session",          // a plain string the panel shows: which level this edits
});
s.get(key)          // own override, else the default
s.set(key, value)   // stores an override (removes it when equal to the default), emits "change" {key, value, group?}, schedules persist per the policy
s.own               // plain overrides {key: value}; with groups {dictate:{...}, recite:{...}} (only groups that have overrides)
s.load(obj)         // replace all overrides (a session opening); emits "change" per changed key; never calls persist
s.reset()           // drop all overrides (back to defaults); persists
s.save()            // flush now ("manual" waits for this)
s.make_default()    // "Make default": returns the merged defaults (defaults + own), clears own, persists; the caller stores the returned defaults
s.render()          // a View: one row per field by type; a slider shows its low and high text at its two ends and its current value; a select shows the chosen option's help text under it; a line at the top says `level`
```

With groups, the parent's `persist` receives the same `own` shape, and the changed group is what a session writes as one line `{"settings":{"recite":{<that group's whole own overrides>}}}` (core/Session replays those lines with a shallow merge, later line wins per top-level key). Write that shape in the readme.

Tests (`node public/framework/core/Settings/Settings.test.mjs`, plain asserts like `core/Plugin/Plugin.test.mjs`): get falls back to defaults; set stores and removes an override equal to the default; change events; the `own` shape with and without groups; load and reset (load never persists, reset does); the three save policies with an injected clock; make_default; a JSON round trip of `own`. `render()` is checked in a browser, not in the node tests.

Demo `page.js` (copy the shape of `core/Plugin/page.js`): one Settings with a toggle, a slider with end texts, a number, a select with presets that have help text, two groups, and the live `own` JSON beside it. Look at it at phone width 360x740 and at 1920 (`mcp__site__shot` works against the worktree port from `.worktrees.json`; `mcp__servex__check_page` for console errors: no FAIL). Use the existing View and Page primitives from `/app.js`; a small `Settings.css` is fine if a class is needed.

## Rules
- ASAP: the smallest working version; no field types beyond the five; no history in the readme (what it is, exact structure, who reads it, verified against the code).
- The readme says who uses it next: `core/Session` (`session.settings`) and the Chat settings panel. You build none of that.
- Done means: tests green, shots read by you, `git status` clean in the worktree, committed. Report back in one short message: commit hash, test count, what you could not do, any wrong assumption in this brief.
