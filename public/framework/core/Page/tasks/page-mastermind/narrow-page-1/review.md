verdict: pass
1. [note] The brief asked for one lowercase getter per class (`get jsonl()` …); the work used one method, `_helper("Jsonl")`, instead (Page.class.js:96). The reasons are real and logged in session.jsonl: `previews` and `prefs` are already Page methods, `columns`, `related` and `links` are page words or card fields, and `Item.describe()` would list any public getter as a settable field. The mastermind accepted the change, so this is not a fix.
2. [note] The own-Map guard (`Object.hasOwn(this, "_helpers")`, Page.class.js:97) is right and needed. `Template.clone()` reads through to its template, so without the guard a clone would reuse a helper whose `page` is the template.
3. [note] Sharing is safe as checked. Each helper's only instance field is `page` (Jsonl.js:17, Columns.js:8, Previews.js:8, Links.js:9, Related.js:6). Prefs adds `prefix` plus an optional `id`, and no caller sets either on `page.prefs()`: a grep for `prefs().assign|id|prefix` finds nothing. Prefs.key() reads `page.url` / `store_key` on every call, so a page that moves still gets the right key.
4. [note] `_helpers` is never saved: Item.toJSON() (Item.js:266) emits only `type`, `id`, `data` and lists, and `skipped()` (Item.js:15) drops `_` names. Nothing outside Page.class.js reads `_helpers`.
5. [note] The counts agree: 46 forwarders converted out of the brief's 47 (Jsonl 24, Columns 10, Previews 6, Links 4, Related 1, Prefs 1). The 47th is Frame, which is a View that draws fresh DOM on every render, so it correctly stays `new`. The minion logged tests (Page 2/2, Item 4/4) and smoke (0 FAIL) as matching before and after. I did not re-run them.
6. [note] One small cost of the string key: `_helper("Jsonl")` with a typo fails only when it runs (`this.constructor[name]` is undefined), where a getter would show up in a grep or an editor. Step 3 picks the public names, so this is fine for now.

## Requirements
- 1 "Check each helper is safe to share" — yes — session.jsonl has one safety line per class; Frame is "not safe", with its reason
- 2 "one lazy getter on Page … Keep this.constructor.X … `_` field must not be saved" — yes, with a reasoned deviation — `_helper(name)` reads `this.constructor[name]` (Page.class.js:98); `_helpers` is skipped by toJSON
- 3 "Prove nothing changed" — yes — tests, smoke, shots and counts are all logged in session.jsonl; shots are on disk in the worktree (gitignored), not in this review folder
- 4 "Doc: one line in architecture.md" — yes — the new helpers row in doc/architecture.md names `_helper`, the clone guard, and why Frame is left out
- Class shows live instances — n/a — no new class was added; the helpers already existed
## Words
- content 1 (plain, clear) — yes — the architecture.md row and the code comment say what changed and why in full sentences
- content (length) — note — the architecture.md row is long for a table cell, but every clause in it is needed
