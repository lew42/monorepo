# Collab — a mastermind's members through phases to a vote, live, as one object

## What
One collaboration run — a mastermind fans a question out to a few cheap members, they work
through ordered phases (facts, then brief, read peers, revise, vote — or facts, then names,
vote, implement, cross-review, vote for an object-oriented design), and the run ends in a
winner with the caveats it should absorb. Every run starts with `facts`: the members list the
simple, foundational truths together, each with a certainty (`settled`/`likely`/`open`), and any
member may dispute one later, dropping it from `settled` to `likely`. A vote may also be
`{"abstain": true}` — a member weighing in with "no opinion", not silence. `Collab` replays the
run's own `collab.jsonl` into plain objects — `members[]`, `phases[]`, `votes[]`, `decisions[]`,
`facts[]`, `winner` — the way the owner asked for ("almost everything should just be an object
with properties and methods … the more of the internal structure we can see via UI"). `view.js`
draws one run whole; `page.js` is the live page. The runner that actually spawns the members and
writes the log is a sibling task (`Server/collab.mjs`) — this module only reads and draws what
it writes.

## Use
```js
import { Collab } from "/framework/ext/Collab/Collab.js";
import { view } from "/framework/ext/Collab/view.js";

const collab = new Collab({ url: "…/collab.jsonl" });
await collab.live(redraw);       // resolves like load(), then calls redraw() per appended line
view(collab);                     // draws the whole run into the current captor
```
`/framework/ext/Collab/?src=<url of a real collab.jsonl>` draws any run, not just the sample
in `demo/` — a mastermind links a live run straight from its own task page this way. Add
`#d-1` (a decision's own id) to scroll straight to that decision and open its alternatives.

`Collab.Decisions.for("ext/Source", "save")` is the one static method `ext/Doc` calls to find
the link for a name a design run actually decided — it reads the shared
`public/framework/ai/collab/decisions.jsonl` once and resolves to that exact `?src=…#d-1` url,
or `undefined` when nothing named it yet.

## Watch out
- The wire verbs (`collab phase member vote tally winner decision chose fact dispute`) are a
  contract shared with the runner minion — don't change the shape without saying so in both
  tasks' logs. The contract itself: `/framework/ai/2026-09-28/collab-rounds/collab-format.md`.
- `Collab.Fact.disputes[]` only ever grows — a dispute is never removed, even once the fact it
  named has dropped from `settled` to `likely`; the disputes stay as the reason why.
- `on_fact` upserts by `id` (later line wins), the same rule `decision` already uses — a dispute
  that drops a `settled` fact writes a FRESH `fact` line with the same id, it never edits the one
  already in memory in place.
- `member(id)` and `phase(n)` are LOOKUP methods, not the wire verbs of the same name — `apply()`
  routes verbs through `static handlers` instead of calling `this[verb]` the way plain `JSONL`
  does, exactly to avoid that collision. [doc/collab.md](./doc/collab.md)
- A `decision` line's `options[]` is ux/Content's own `{key, say, caveat}` shape on purpose —
  `new Decision({ id, ask, options, log: collab.url })` draws it with no translation, and the
  owner's click on another option writes straight back to the same `collab.jsonl` as a `chose`
  line. [doc/collab.md](./doc/collab.md)
- `chose.option` is the option's `say` TEXT (what `Decision.js` writes), while `decision.chosen`
  is the option's `key` — `Collab.Decision.override()` resolves one to the other so `overruled`
  and `winner()` both work in key form. Mixing the two up reads every real overrule as "not
  overruled." [doc/collab.md](./doc/collab.md)
- `Collab.Scoreboard` keys its rows by `collab + decision + member`, not `decision + member`
  alone — a decision id like `"d-1"` is reused by every run, and a key without `collab` collapses
  six different runs' rows for one member into one.
- The page's **Reviews** table always reads the real, shared
  `/framework/ai/collab/scoreboard.jsonl` — never the demo file, never whatever `?src=` points
  the rest of the page at. It's a sitewide rollup, not one run's own numbers, so it draws first,
  above the fold, ahead of the collab-run replay (`Server/doc/review.md`, the review system's own doc).
- Every option of a decision stays visible with its own vote count, zeros included, ranked —
  `runner_up` is shown too but is never the only alternative. The winner leads (seeded onto the
  `Decision` widget as its own `chose` prop so it doesn't wait on the widget's separate read of
  the log); the rest sit one click down, in a `<details>`.
- The vote count and the winner are readable at a glance — a small badge per option sits right on
  the decision card (`vote_badges()`), never only inside the "every option, by votes" `<details>`.
  Each member's own card shows who it picked ("→ sonnet-b") on the vote-phase row, not a bare "—".
- `page.js` is a `Doc`, not a plain `Page`: the live run stays the Overview, and the API tab lists
  `Collab`'s own members plus `Collab.Scoreboard`'s (prefix `Scoreboard.`) the same way any other
  class's methods and properties show up. ⚠ `api(section){ … }` passed into `new Doc({…})` is an
  ASSIGNED instance member, not a class-body method — it has no real `[[HomeObject]]`, so
  `super.api(section)` throws "not a function"; call `Doc.prototype.api.call(this, section)` instead.

## More
- [The live page](/framework/ext/Collab/) · [doc/collab.md](./doc/collab.md) — the objects, the phase lists, the decision tree
- Files: `Collab.js` (the objects), `view.js` (draws one run), `collab.css`, `page.js`, `demo/` (a sample research run, a sample scoreboard)
- The contract: `/framework/ai/2026-09-28/collab-rounds/collab-format.md` · the design: `/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/design.md`
- Consumers: the runner writes what this reads; a task page can embed `view(collab)` for its own run
