# Program.js — Design decisions and history

## ProgramJSONL class

The `ProgramJSONL` class is intentionally **tolerant on purpose**. When a writer appends a line that does not match the schema, we refuse it (`bad` field). However, a *reader* that also refuses such lines would hide the defect — the page's real job is to *show* what came in, not suppress it. Every parseable line lands in `entries` with `bad` (why schema refuses it) and `notes` (weaknesses in the data), and the page marks rather than drops them. The invariant: `entries.length + unparsed == file line count` — the reader claims nothing about what is good, only what came in.

Every verb has its own store in the JSONL `apply()` method, because a rewritten file replays on top of the old one and needs to clear its state first.

## Program class overview and streams

A Program aggregates multiple research topics, each appending to its own `<topic>/log.jsonl`. The whole page is live — every log is `.live()`d so a line a minion appends arrives without reload. Off localhost there is no socket; each log is fetched once.

Every step is a method, so a program with its own emphasis can override one method and inherit the rest.

## listing() and error suppression

`listing()` does one fetch of `directory.json` and probes nothing — no repeated requests to `<topic>/page.js` four times for topics that haven't started yet. The normal state of a new program is that topics have not started, and logging console 404s trains you to ignore the console. The SPA fallback answers a 404 with `index.html` at HTTP 200, so we check `content-type` header (presence of "html" signals a miss).

## capstone naming

The capstone is a sub-page by convention, named by the `this.capstone` config field (default "synthesis"). It is discovered the same way as everything else — no edit here when a topic writes one. The config field `capstone:` should not become a method `capstone()` in this codebase's assign-based style (causes a silent collision swap).

## capstone card placement

The capstone card sits *above* the legend because at 300+ entries, the front's real job is to point to where the *read* of all this is. Otherwise the one page that crosses all topics sits three clicks down inside one of them. A card shape (not a banner) means it needs no CSS of its own, and the line count under it comes from the logs rather than being written here.

## theories board grouping

The theories board is grouped by topic because the schema has no field linking an assessment to the theory it assesses. The topic is the only honest join — opinions sit under their theories, and nothing implies a pairing the data does not contain. (See `doc/program.md` for the full design.)

The board is *capped* (newest first, capped at 4 by default). Uncapped it was 35 cards and 10.8 screens on its own, with the stream below it — a program that never closes has to stay a front. The rest is one click away on the topic's own page.

## takes (assessments) placement

The mainstream assessments (opinions) sit once under the whole topic group, not inside each theory card. Early design repeated the same thirteen assessments under four claims, which read as if each list belonged to the card above it. It does not — the schema has no field pairing them, and honest placement says so.

## badge design

The badge shows both the word *and* its promise (from `CREDENCE_MEANS`), so the treatment is never the only thing carrying the credence. This survives greyscale, screenshots, and screen readers.

## host vs URL display

A research URL is a 120-character permalink; printed in full it wraps to three mono lines and buries the claim above it. The host (domain only, `www.` stripped) is the part you judge a source by. The full URL is the `title` attribute, available on hover.

## wide class

The `wide` class on the research-program div prevents columns hosts from squeezing the whole front to one measure (650px of a 2900px column at 3440). The text inside is capped by its own CSS rules.
