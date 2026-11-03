verdict: pass
1. [note] Each moved method's doc comment now sits in two places: above the one-line forwarder in `Page.class.js` (e.g. lines 219, 462) and above the moved body in `Listing.js`/`Load.js`. That is why the brief's line check does not agree (Page.class.js −97/+13 = 84 net, against 114 lines moved). Keep the full comment in one place, and give the forwarder a short pointer or nothing.
2. [note] `doc/split-statics.mjs:33` does nothing: `text.replace(..., (m) => m)` hands back the same string. Delete the line.
3. [note] `core/Page/readme.md:5` still says "the 23 small files beside it"; with `Load.js` added, that count is one short. `doc/classes.md` got its `Load.js` row, so the file list itself is current.
4. [note] The `Page` versus `this` choice was checked one method at a time and holds. `from` passes `this` (it calls `new P`, `P.read_json`, `P.props` and `P.from`, so a subclass keeps its own kind). `load` passes `Page` (so `instanceof P` is still `instanceof Page`). The listing memos (`P.listings`, `P.loaded_listings`, `P.log_pages`) still land on `Page`. Neither new file imports `Page.class.js`. `is` comes from `View.js`, which exports it at line 476. `node --check` passes on all three files.

## Requirements
- 1 "Before" measures and `statics-before.json` — yes — the ready line in session.jsonl gives split-measure 786, Page tests 2/2, Item tests 4/4, smoke 0 FAIL; statics-before.json is here
- 2 "Move, by script", `--dry` manifest — yes — `doc/split-statics.mjs`; manifest.json lists 11 methods, each with old lines, new file and its binding; the two hand fixes are logged
- 2a listing statics → `Listing.js` taking the class first — yes — diff.patch, Listing.js +37..+81
- 2b loading statics → new `Load.js`, `Page.Load = PageLoad` — yes — diff.patch, Load.js, plus Page.class.js:688
- 2c "Page versus this must not change" — yes — `from` forwards with `this`, the other ten with `Page`, the same as the old bodies (see finding 4)
- 2d "No import cycle" — yes — Load.js imports only View.js; Listing.js imports only Router/listing.js
- 2e "no caller changes" — yes — all 11 names stay on Page as static forwarders; statics-after = before + `Load` (46 against 45, per the ready line)
- 3 "Prove nothing changed" — yes — the tests, smoke and call rows are the same before and after (per the ready line); `node --check` passed again in this review
- 3e line counts must agree — no, explained — the counts differ because the comments are duplicated (finding 1); this is a note, not a fix
- 4 "Doc" row in architecture.md — yes — diff.patch, architecture.md:37; the readme only points to classes.md, and classes.md got the `Load.js` row
- "One commit each" — yes — 252ce850a (the move) and 8d1592623 (the docs); steps 1 and 3 changed no code, so they made no commits
- class page with live instances — n/a — PageLoad holds no state; it is a bag of statics

## Words
- architecture.md row — yes — it says what moved, where it went and why `Page` versus `this` is kept, in plain sentences; it is long, but it is the deep doc
- Load.js header comment — yes — one line, and it names the doc
