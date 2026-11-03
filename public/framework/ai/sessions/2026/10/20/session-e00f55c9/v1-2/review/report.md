verdict: fix
1. [fix] Stale doc, ext/drawer: `ChatView.js`'s class comment (diff line 573–575) still says "V2 or V3 swaps the chat's bubbles…" and "gets .drawer-rail-sheet-v2-on while v2 shows", and `ext/drawer/readme.md`'s `Sheet.js` bullet still ends "The version dropdown in the sheet's head shows Chat v2 (`ChatV2`) in place of the bubbles". Both now have four versions; name V1.2 (and V3) or say "the version picked".
2. [fix] Stale wording in the empty state: `ChatView.js` `Say something: Chat ${this.mode} draws…` now prints "Chat v1-2", not the name the dropdown shows ("V1.2"). Read the name from `VERSIONS`.
3. [note] Requirement 3, "no pink brain": the Reply still shows a pink 🧠 avatar (`shots/demo-360.png`, band 3; `ext/Chat/roles.js:17` `smart: "🧠"`). The builder kept it on purpose and says so under Pictures in the readme; move that to the readme's Decisions with the alternative (a V1.2-only avatar, e.g. the plain `assistant` 💬), since the owner will read "no pink brain" literally.
4. [note] Requirement 2: a sentence still waiting does not sit in the owner's bubble after the ✓; V1's time-ordering puts "Try a hard refresh." in its own bubble below the Reply (`shots/demo-360.png`), and the live guess is a separate draft pill (`shots/v1-2-360.png`). Order is right (after the ✓), placement is V1's. Fine for a try-out; say it in the readme.
5. [note] The review shots are stale: `shots/<page>/400.png` still shows the old intro ("the grey sentences after it… Pass ?src=…"), while the diff's `page.js` says "the faded sentence after it is on its way. To see a real session, add ?src=…". The server served an old `page.js`; every `layout.json` also logs a 404 at each width. Judge the look by `ext/Chat/v1-2/doc/*.png`.
6. [note] New classes `ChatV1Dot2` and `SendCursor` have a demo page but no view of a live instance's properties (`split()`'s received/waiting would be the one to show).

Widths given: 400, 1200, 1920, 3440 for `/framework/ext/Chat/` and `/framework/ext/Chat/v1-2/`, plus the builder's own `demo-360`, `demo-1920` and `v1-2-360`.

## Requirements
- 1 "Just make an additional version, add it to the list" — yes — `ext/Chat/page.js` children "panel drill list v1-2 v2 v3"; a chip on the session Chat tab; V1.2 in the ✦ sheet and drawer dropdown (`ChatView.VERSIONS`)
- 1b "Extend V1, don't copy it; V1 untouched" — yes — `ChatV1Dot2` feeds V1's own `chat({source})`; `Chat.js` is not in the diff; wrapping rather than subclassing is a readme Decision with its reason
- 1c "draws from session.messages through V1Bubbles.js" — yes — `ChatV1Dot2.entries()` reads `V1Bubbles.events(session)`, skips `{chat}`/`{place}`
- 2 "a small cursor follows the text… words not sent yet sit after the cursor" — yes, with a placement caveat (finding 4) — `shots/demo-360.png`: ✓ after sentence 3, sentence 4 faded after it
- 2b "When a sentence ends… the cursor moves forward" — yes — test checks `after === s-1`, `s-2`, `s-3` after each `sent` mark
- 3 "One check… dims when a sentence is sent, lights back up green when received" — yes — `.chat-cursor-waiting` at .55 opacity, `--ok` when caught up; test checks the computed colour equals `--ok`
- 3b "No grey-to-green flashing per sentence" — yes — one ✓ moved by re-append, `.6s` opacity fade
- 3c "The 🧠 mark goes away" — yes for the mark (test: `brains === 0`); a pink 🧠 avatar remains on Replies (finding 3)
- 4 "Use that rule set; don't restyle" — yes — `ChatV1Dot2.css` touches only the cursor and `.chat-unsent` colour; `Chat.css` not in the diff
- Check: headless test with the fence — yes — `ChatV1Dot2.test.mjs`, 18 checks, drives `read()` in-page, no live Servex
- Check: "ChatV1Compare stays at 0 differing bubbles" — yes — I ran it: 0 differing across 1314, 765, 278, 215, 170 bubbles
- Check: screenshots at 360×740 phone UA and 1920, walkthrough linked — yes — `walkthrough.md`, pictures committed under `ext/Chat/v1-2/doc/`
- Show the class and its live instances — no — finding 6 (note: little state the owner watches beyond what the chat already shows)
- Indexing — partly — `ext/Chat/files.jsonl`, `v1-2/files.jsonl`, `doc/files.jsonl`, `fixture/files.jsonl`, `ext/Chat/readme.md`, `system-map.md`, AISession readme, `core/Session/Chat` readme and `status-icons.md` all name V1.2; stale: findings 1–2
- Can a fresh agent continue from the task folder — yes — `requirements.md`, `session.jsonl` (both reviews, the builder's answers, commit `c146df07bdaf`), `walkthrough.md`

## Page structure
- page 1 (title says what it is) — yes — `400.png` top band, "Chat V1.2"
- page 2 (one takeaway, shown) — yes — the demo chat is the second band, under one sentence
- page 3 (intro short and plain) — yes — one sentence (the shot shows an older wording, finding 5)
- page 4 (no dead space below the content) — n/a — a short demo page; band shares 0.04 / 0.10 / 0.18 at 400

## Navigation
- navigation 1 (identify) — a sidebar (≥1200), a bottom rail (400), the drawer's version dropdown
- sidebar lists the new page — yes — `1200.png`, Chat's children include V1.2 (`page.js` children)
- bottom rail — yes — `400.png` bottom band, unchanged
- dropdown names the version on screen — yes — `ChatView.label()`, test checks "Chat V1.2" label

## Layout
- the page uses the standard layout — yes — layout.json `layout: standard` at every width
- content column sized to its text — yes — `widest_text` 367 / 584 / 626 / 704
- no horizontal scroll — yes — `overflow_x false` at all four widths; `demo-360.png` no scroll

## Sizing
- bubbles hug their text — yes — `demo-360.png`: owner bubble hugs three lines; draft pill hugs "Maybe we could"
- nothing grows past its measure at 3440 — yes — `widest_text 704` at 3440
- the chat band is the right size — yes — `chat-v1-2` share 0.18 / 0.19 / 0.20 / 0.23

## Wrapping
- no text wraps that should not — yes — `wraps` lists only site chrome (`drawer-rail-ai` 3.2 lines at 400, `mode-btn`, `drawer-menu`, `chatbox-compose-more`), not from this diff
- sentences in the bubble wrap cleanly at 360 — yes — `v1-2-360.png`, top band
- tab rows — n/a

## Spacing and padding
- left edges line up — yes — `left_stack` h1 and p equal: 16 / 38 / 54 / 90 px
- gap between bubbles even — yes — `demo-360.png` band 3
- space wasted — no — `empty` 0.66–0.83 is a short demo, no `big_empty` band

## Colour and contrast
- the ✓ uses a token — yes — `--ok`; waiting sentences `--draft-ink` falling back to `--subtle`
- the dim ✓ still readable — yes, barely — `demo-360.png`, ✓ after "Maybe it is the cache." at .55 opacity; small but visible
- faded waiting sentence readable — yes — "Try a hard refresh." in `demo-360.png`

## Flow
- reading order matches time — yes — owner bubble, Reply, waiting sentence, in the order they happened (`demo-360.png`)
- live words after the ✓ — yes — test "draft bubble AFTER the ✓"; `v1-2-360.png`

## Words
- content 1 (plain sentences, the owner's names) — yes — "Chat V1.2", "send cursor", "✓"; readme opens with the owner's quote
- content 2 (no jargon in what the owner reads) — yes, except "Chat v1-2" in the empty state (finding 2)
- content 3 (stale or contradictory text) — no — findings 1 and 5
