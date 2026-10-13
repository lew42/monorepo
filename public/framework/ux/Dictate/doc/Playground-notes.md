# Playground.js — design notes and history

## Tab system and layout

**Chunks** and **Side** are new (ai/sessions/2026/09/29/audio/audio/, deliverable 4 — "see more detail into the workings of the Whisper transcription process"): Chunks shows every RESEND as its own row, not just the final settled text, so the guess visibly improves; Side shows raw and revised next to each other, in two plain columns, with the level picker above the tabs choosing what "revised" means.

**Clean** is new (ai/sessions/2026/09/29/audio/audio/next-clean-transcription/a-clean-mode, deliverable 5): the clean text alone, no strike-through marks — what the real composer now shows by default (`ext/Chat/Mic.js`'s own clean mode). It is the DEFAULT tab here too, because that is what a first-time reader of this page should see first: the finished result, not the mechanism. Corrections and Live are relabelled "(debug)" — they still work exactly as before, just no longer first.

**Analysis**, **Chat** and **Structure** are new (minion-part2, 2026-10-01 — the Dictate playground as a full-bleed, live system diagram): the same six-tab, show/hide-only mechanism this file already used, just with three more panels. On a narrow screen all nine are still ordinary tabs — "a stack with tabs is fine," the owner's own words (requirements.md). At ≥1200px, `Playground.css` additionally makes Raw/Clean/Analysis/Chat/Structure always-visible GRID COLUMNS (ignoring which tab is "active") and Chunks/Corrections/Live/Side an always-visible debug row underneath — see that file's "full-bleed, 2D desktop layout" section for exactly how.

## Constants and configuration

How much already-cleaned text rides along as `before` — enough for the assistant to see the sentence it is joining, not the whole transcript. `BEFORE_CHARS = 300`.

Longer than this since the previous chunk settled reads as a paragraph break (a blank line in every view), not just the ordinary pause between sentences. `BIG_GAP_MS = 2500`.

The Live tab's one constant: how long the red/green marks take to dissolve, in JS so the CSS transition and a headless proof's wait share the same number. `FADE_MS = 5000`.

The one line a reader sees in the Chat column — intentionally NOT a second `chat()` mount. `@task-mastermind-one-dictation` owns the real widget (mic, bubbles, replies, reactions); this diagram is built AROUND it, never a second copy of it (requirements.md fence: "Part 2 builds the diagram around their widget, not a second widget").

"like" and "i mean" are deliberately NOT in the FILLERS regex — a real sentence like "I like the layout" would lose a real word, not a filler. That call needs context, which is exactly what /api/tidy's fast assistant is for; this rule pass only removes the fillers a fixed word list can never mistake for content. See doc/decisions.md.

The one line every empty panel shows until the first chunk arrives — so a reader never wonders whether the widget is even wired up. `EMPTY_TEXT = "press 🎤 or ▶ Sample — Whisper's words appear here"`.

## Word-level diff implementation

Splits both strings on whitespace and walks the classic longest-common-subsequence table back to a list of {type: "keep"|"strike"|"add", word}. A few dozen lines, and the whole reason the Corrections/Live tabs can show "this word, not that one" instead of a wall of red-then-green.

## Fallback cleanup pass

The fallback pass (when /api/tidy is down or answers ok:false) is minimal on purpose — the owner's own rule: near-verbatim, never change the intent. Fillers out, a doubled word collapsed, a capital after a sentence ends, a capital to open it. No punctuation is MOVED — a misplaced "?" stays exactly where it was said; that is the fast assistant's job, not this one's.

## Tidy function

`ux/Revise` (`Revise.run`) is the ONE place this playground now asks Servex for a cleaned chunk — this used to be its own copy of that same fetch, pointed only at the original "clean" prompt; now the widget's own level picker (below) can ask for `edit` or `summary` too, and there is only one place a Servex-down failure is handled.

## Class design: widget and instance

The dictation playground — one 🎤, one session, three ways of watching it: the raw words whisper actually heard, the fast assistant's strike/add corrections, and a "live" version where those marks dissolve into the clean text. `ux/Dictate/doc/` has the mic itself; this file is only the pipeline and the widget on top of it.

Not a `View` — `widget()` is called from inside a `Page`'s own `content()` (once on the plain Dictate page, once on this module's own page), each already running inside the right captor. **Both calls share this ONE instance** — `pg` at the bottom of this file — so a session started from either widget shows up on both; `doc/decisions.md` has the current shape and the bugs an earlier shape caused. `globalThis.$dictate_pg` (set in `page.js`) is the seam a headless test drives.

One instance for the whole `ux/Dictate` tier — the standalone playground page (its own url) and the widget embedded at the top of the plain Dictate page both read and drive this SAME pipeline, so a chunk settled from either widget shows up in both. `doc/decisions.md` has the shape and the bugs it caused before landing here.

## reset() method

Everything a session accumulates — cleared at the start of every NEW session (the owner's ask #1: one click clears the views and starts fresh). Every MOUNTED widget clears with it — `this.views` is every `widget()` call still on screen.

`this.session` is a plain counter, bumped every reset. Every chunk is stamped with the session it was settled under (`settle()`); `clean_chunk()` refuses to draw a chunk whose stamp no longer matches — a chunk still waiting on `/api/tidy` when the mic is pressed again finishes into nothing instead of painting a NEW session's panels with an OLD session's text. See doc/decisions.md.

**`this.current` is the one `Session` instance** for this run — it owns `chunks`/`resends`/`source`/`analysis`/`partial` (minion-part2, "real classes instead of plain objects"). `cleaned_so_far`/`last_chunk_at`/`clean_queue` stay HERE, on `Playground` itself, not on `Session` — they are the pipeline's own bookkeeping for cleaning the NEXT chunk, never something a reader asked to inspect (decision logged in this task's task.jsonl).

## prune_views() method

Drops a widget from `this.views` once its own root element has left the page — a navigation away from wherever it was mounted, with the old DOM node never reattached. Without this, a widget that leaves the screen stayed in the Set forever, still getting every `meter()` tick and diff update for nobody to see. Called on the next pipeline update rather than eagerly (there is no "the page changed" event to hang this on; the cost of one extra check per update is nothing).

## toggle_empty() method

Shows/hides each panel's own "press 🎤…" line — visible until the panel has something real to show, then gone for the rest of the session. Analysis, Chat and Structure have no empty state of their own: Analysis and Structure always have a real `inspect()` card to show (a stub still IS a card), and Chat is static text.

## widget() method

⚠ Called on EVERY page that shows the playground (the plain Dictate page's Overview, and this module's own page) — each call builds its OWN mic button, audio panel and three panels, registered in `this.views` so the pipeline (`settle()`/`guess()`/`clean_chunk()`) updates every one of them, not just the last one built. No DOM ref here is ever a field on `this` (the shared `pg`) — only on the LOCAL `view` object — because two widgets sharing one field would each overwrite the other's reference (found the hard way: `doc/decisions.md`).

`wide` opts the widget out of the page's default 40em reading measure — a transcript line wrapped constantly at 1920/3440 inside it (Playground.css caps the actual width at a readable 60em, not the full wide track).

## Dictate constructor options

The box is not this widget's job — `on_text`/`on_guess` are. `reason` — "pause" | "forced" (the 15s cap) | "manual" (stop pressed) | undefined (the browser engine, or a sample line) — Dictate.js's own `commit()`, additive, passed straight through to Chunks (4a: "mark each segment cut and say why").

## Raw panel note

**Raw is Whisper's exact output, always** (the owner, 2026-09-29: fillers sometimes vanish from Raw and sometimes stay, make it predictable). That unpredictability is WHISPER'S OWN behavior on quiet or short "um"s, not this pipeline's doing — this pipeline never edits Raw. Only the `clean` level removes filler words, and only in the Corrections/Live/Side views. Said once, plainly, instead of leaving a reader to guess from behavior alone.

## Full-bleed 2D layout details

**The full-bleed, 2D layout (deliverable 4).** Below ~1200px these two divs are plain blocks — exactly today's single `.ux-dictate-pg-panels` wrapper, just split in two, with every panel still shown/hidden one-at-a-time by `select_tab()` through the `[hidden]` attribute (nothing about the tab mechanism changed; "don't delete TABS/select_tab," requirements.md). At ≥1200px, `Playground.css` turns `.ux-dictate-pg-grid` into the owner's own column order — "source, raw, clean, analysis... chat" — Raw/Clean/Analysis/Chat/Structure become ALWAYS-VISIBLE grid columns (the CSS overrides `[hidden]` on just these five), with Structure wider than the rest ("a wider structure panel"). `.ux-dictate-pg-debug-row` does the same for the four debug panels, in their own row underneath — real detail, still there, just not the first thing a wide screen shows.

⚠ Each panel's PRE-EXISTING chunks (a widget mounted after a session already has some) are drawn AFTER the `view.$raw =` / `view.$corrections =` assignment finishes, never inside the same capture callback — the callback runs synchronously while that assignment is still in progress, so reading `view.$raw` from inside it reads `undefined` and every draw call silently no-ops (code skill, "no DOM after an await" family — the same trap, one step earlier: reading a ref before its own assignment has returned).

## Panel definitions

**Raw** (owner's own order: "the raw transcriptions can go in a card").

**Clean** (deliverable 5) — the clean text alone, no strike-through marks: what the real composer shows by default now. One line per settled chunk, drawn with its raw words the instant it settles (nothing worth showing yet is worse than a blank panel) and swapped for the cleaned wording in place once `clean_chunk()` below answers — the exact same "raw now, clean in place once it arrives" idea as `ext/Chat/Mic.js`'s own box.

**Analysis** — a STUB today (requirements.md deliverable 1): a real, inspectable object with its own icon, honest about doing nothing yet.

**Chat** — a placeholder, on purpose; see `CHAT_PLACEHOLDER`'s own comment. `card` (framework.css) is the one existing class for "a framed box" — no new CSS needed to make this read as its own column, same as Analysis and Structure already do through their own `inspect()` card's chrome.

**Structure** (deliverable 3) — the WHOLE session, one nested card, built from `inspect(this.current)` and re-drawn after every `settle()`/`guess()`/`clean_chunk()` (`render_structure()`, below). This is the "visual rendering of the hierarchy" the owner asked for.

**Chunks** — every RESEND as its own row (not just the final text), so the guess visibly improves. `hidden` until picked, same as every panel here.

**Side by side** — raw next to revised, in two plain columns, one row per settled chunk (ask 4b: "raw vs revised side by side, with a level picker" — the picker above the tabs is shared by Side, Corrections and Live).

## select_tab() method

"routed" the light way: the hash names the tab, so a reload or the back button lands on the same one — no separate Page per tab (that shape drew a duplicate H1 per tab and rebuilt panels instead of just showing them).

One `[hidden]` toggle per tab name, read off `view.$<name>` — grown from six hand-written lines to a loop once Analysis/Chat/Structure made it nine (minion-part2). At ≥1200px `Playground.css` overrides `[hidden]` on five of the nine panels so they show regardless of which tab is "active" (see `widget()`'s own comment on the grid) — this method doesn't know or care about that; it always sets the real attribute honestly, same as before.

## audio_panel() method

ONE control names the mic: the picker itself, via the `selected` option's own text — no separate "mic: default" label that could ever disagree with what the picker actually shows (the label used to lag a refresh; two sources of truth for the same fact is how they went out of sync).

Always visible — a bordered, visibly-a-track box even at idle, flat until listening starts. Bigger than the mic button's own tiny bar on purpose (the owner: "larger"); driven by the SAME smoothed number as that bar, `Dictate`'s `on_meter()` hook, never a second loudness calculation of its own.

## refresh_devices() method

A picker of `enumerateDevices()` audio inputs, remembered the same way every `Dictate` on the site remembers one — `DEVICE_KEY` / `remember_device()`, so picking a mic here moves the board's own mic too (`Dictate.js`'s own doc).

## meter() method

⚠ Mirrors the number into `this.current.source.level` (so the Structure panel's `inspect()` tree has a real value to show for "the audio source") but deliberately does NOT re-render Structure here — `meter()` fires ~12 times a second while the mic is live, and rebuilding a whole nested inspect tree that often would be real cost for a number nobody is watching pixel-by-pixel in that one card. Structure re-draws on `settle()`/`guess()`/`clean_chunk()` instead, so the level shown there can be up to one resend stale — noted here as the deliberate, cheaper choice (requirements.md: "don't over-engineer a diffing update... note the cost").

## guess() method

The still-moving guess — replaces the ONE grey line at the end of the Raw view, never appends a new one, so a changed guess is never shown twice. ALSO a row in Chunks (deliverable 4a): every RESEND, not just the settled text, so a reader can watch the guess actually improve. `since_prev` is measured HERE, in the browser, as wall-clock time between two updates — the real Whisper-side processing time lives only inside `ux/Dictate` and isn't exposed by its public API (`Dictate.js` in this task is fenced to its `revise` option only); this is an honest stand-in, labelled as such in the row itself (`draw_chunk_row()`).

## settle() method

A chunk has settled. Draws the raw line immediately (whisper's own answer, never held up) in every mounted widget, then queues the cleanup pass — real or ruled — behind whatever is still cleaning ahead of it, so `before` always reflects everything settled so far.

Stamped with the CURRENT session — `clean_chunk()` checks this stamp against `this.session` before ever drawing it, so a session started while this chunk is still cleaning leaves it silently unwanted rather than painted into the new session's panels. See doc/decisions.md. `cut` (4a) says WHY this segment closed — "pause", "forced" (the 15s cap) or "manual" — undefined for the browser engine or a sample line, which never had a reason to give.

## clean_chunk() method

A new session started while this was cleaning — the cleanup is skipped. See settle() for session stamping.

Stamped on the entry — Side shows what actually ran, even if the picker changes later.

## update_status() method

ONE line, above the tabs, naming the CURRENT cleanup source — never repeated per chunk (the owner: "noise"). Per-line detail still lives in each line's own `title` tooltip (`draw_diff_line()`).

## render_analysis() method

Analysis is a STUB (`objects.js`) — it never changes after a session starts, so this only needs to run once per session (`reset()` calls it; nothing else does).

## render_structure() method

**The simplest working re-render, on purpose** (requirements.md deliverable 3: "don't over-engineer a diffing update for a first version"). Every call throws away the whole card and rebuilds `inspect(this.current)` from scratch — cheap enough for a session with a few dozen chunks, and far simpler than hand-patching one nested tree in place. If a session ever grows into the hundreds of chunks, the cost of re-walking the whole tree on every `settle()`/`guess()` is the thing to measure first; noted here rather than solved now.

## draw_raw_line() method

One settled chunk = one line, inserted before the guess line — which always stays last (`insertBefore`, since a plain append would land a new line AFTER the guess it is replaying to replace).

## draw_clean_line() method

One line per settled chunk, same as Raw — starts showing the raw words (nothing cleaned yet is better than a blank line) and is UPDATED in place, never re-drawn, once `clean_chunk()` answers (`update_clean_line()` below). The wrapped view object is kept on the entry itself, keyed by which mounted widget it belongs to, since two widgets can share one session (`widget()`'s own doc comment) and each needs its own element to update.

## draw_chunk_row() method

One row per Whisper RESEND — segment number, time since the previous update, and the text THAT guess returned — appended once and never rewritten (each row is its own moment; only the settled Raw line and the guess itself are ever updated in place). `since_prev` is measured in THIS file, not inside `ux/Dictate` — see `guess()`'s own comment for why it stands in for "how long Whisper took".

## CUT_LABEL and draw_cut_marker()

A chip marking the SEAM where a segment actually closed and why — "pause" (the owner stopped talking), "forced" (hit the 15s cap mid-sentence, so the next segment is a continuation, not a new thought) or "manual" (stop pressed). Says nothing for the browser engine or a sample line (`entry.cut` is `undefined` there) rather than guessing a reason nobody gave.

## start_fade() method

The strike/add marks dissolve over `FADE_MS` — set once, as an inline style, so the CSS only has to say WHAT transitions, never the number. Added on the NEXT frame (not this one) or the browser has nothing to transition FROM. Once the fade finishes, the struck words are also taken OUT OF LAYOUT (`display: none`) — opacity alone left a gap exactly the width of the word that "vanished" ("we should␣␣we should"), which does not read as clean text at all.

## run_sample() method

Feeds guesses word by word, then settles each chunk — the OWNER's own script: fillers and doubled words in the first line, a misplaced "?" in the second, a forced paragraph break before the third. Proves the whole pipeline (guess -> settle -> clean -> diff -> fade) to a reader, or a headless test, with no microphone and no whisper-server running.

## SAMPLE_SCRIPT

`cut` on each line is invented for the demo (a real session gets it from `Dictate`'s own `close_segment(reason)`) — the point is showing the Chunks view's seam marker actually renders, in the one path (Sample) that has no real Whisper segments to cut.
