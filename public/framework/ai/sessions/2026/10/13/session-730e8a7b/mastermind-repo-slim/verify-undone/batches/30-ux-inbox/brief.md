# Check 8 asks against the repo: ux/Inbox

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/30-ux-inbox/results.json` and stop.

The owner asked for each thing below, and the record says it is still undone. Some are already built and nothing says so. For each ask decide:

- **done**: the thing exists now. Evidence = `path:line` of the code, doc or page that does it, plus the quoted line (under 25 words). A path that does not exist is a failure; open the file and confirm.
- **undone**: you looked and it is not there. Evidence = the three places you looked and what you searched for (the module's readme, its `doc/`, a `grep` for two or three key words, `git log --oneline -n 5 -S"<key word>" -- <dir>`). "I did not find it" with no places named is not allowed.
- **unclear**: the ask is a question, an opinion, a rule about how to work, or too vague to test. Say in one line why.

Be strict: "done" needs a file you opened. A related thing is not the thing. If it is partly built, say **undone** and name what is built and what is missing. Searching hard is cheap; guessing is wrong.

## Where to look

- Module: `ux/Inbox`, folder `public/framework/ux/Inbox` (the site serves `public/` as `/`).
- Readme chain, root to leaf: `readme.md`, `public/framework/readme.md`, `public/framework/ux/readme.md`, `public/framework/ux/Inbox/readme.md`. Also its `doc/`, `tasks/`, `inbox.jsonl`.
- `public/framework/ai/handover.md` and `CLAUDE.md` hold rules that count as "done" for asks about how agents work.
- Use Grep/Glob first; use `git log` sparingly (always with `-n 5` and a path).

## The module's readme (first 70 lines of `public/framework/ux/Inbox/readme.md`)

# Inbox — a rail of page previews beside the page you picked, and nothing jumps

See it: **[the demo](/framework/ux/Inbox/)** — click a row and its page opens on the right
while the rail stays exactly where it is. The AI page's Inbox and Log tabs and AI 2 are the
same rail with AI data ([/framework/ai/](/framework/ai/), [/framework/ai2/](/framework/ai2/)).

## Use

```js
import InboxRail from "/framework/core/Page/ext/Inbox/Rail.js";

class MyRail extends InboxRail {
	source(){ return my_rows(); }   // [{ id, title, icon, at, score, sub, needs }]
}

// inside the page's content(); the page wears `classes: "full fill"`
this.rail = new MyRail({ page: this }).mount();
```

- A row links to `<page url>/<id>/`. Give the page a `route(id)` that returns that row's
  page; it opens in the detail column (`page.$pages`), a sub-page in the third column
  (`page.$sub`).
- Every part is a method: override one and keep the rest. `head_extra()`, `actions()`,
  `toggles()`, `face()`, `when()`, `archive()`, `is_read()`… The list is at the top of
  [`Rail.js`](/framework/core/Page/ext/Inbox/Rail.js).
- **The score floor**: rows under `?min=` (default 90) stay out. `0` shows everything —
  the AI page's Log is the same rail at 0. A tab says its own floor with `rail.tab_floor(n)`.
- A page that takes the whole shell (a System tab, an Overview) wears `inbox-takeover`;
  a plain page beside the rail wears `inbox-page` so it scrolls by itself.
- **`.flush-stack`** — rows touching, no padding, no gap, one box, only its outer corners
  rounded (`--flush-radius`). The rail's list wears it; any list can.

## Watch out

- A row is an `<a>`, never a button: the Router navigates it and marks it `.active`, so
  Back and a reload work. Never draw the selection by hand.
- The order never moves while you look: a row that changed is counted on the "N updated ↑"
  pill. Don't re-sort on a timer.
- A field on a subclass must not share a method's name — `this.stream = …` once replaced
  the base's `stream()` method and the rail drew nothing.
- A row is drawn by the rail's own face (`row_head()`), not yet by `page.preview(nav)`: a
  row needs a dot, a score and an ×, which `preview()` has no hook for yet.

## More

- [`doc/architecture.md`](./doc/architecture.md) (decisions and why)
- [`Inbox.css`](./Inbox.css) — the whole look, including the phone rule (one screen at a time)
- [`ai2/rail.js`](/framework/ai/rail/rail.js) — `AIRail`, the subclass with the usage meters
- [`core/Page/ext/Inbox/`](/framework/core/Page/ext/Inbox/) — the Inbox extension the class lives in
- History of every rule: [`ai2/doc/decisions.md`](/framework/ai/doc/ai2/decisions.md)


## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/30-ux-inbox/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 8 asks

1. `4a0366bbaf` (16 days old): Inbox: core/Page/ext/Inbox extension; AI 2 Inbox to /framework/ai/; Needs you a filter; Log same UI
2. `2feb0c3a56` (16 days old): Inbox: priority 50+ only; Log everything; a priority filter; stalled asks readable
3. `0e80746d45` (3 days old): Find out whether the inbox shows sessions and how its cards are controlled, checking board.jsonl, page.jsonl, the inbox class and the sessions system
4. `7f712d7dac` (3 days old): Decide where inbox card data should be stored, possibly as part of page.jsonl
5. `4f263c8d44` (3 days old): Store inbox cards as an appendable JSONL data set that is loaded and sorted, and get it working with the local JSONL system
6. `c8acae6ab6` (3 days old): Reuse the existing data grid class's concepts in the inbox rendered view, where they fit
7. `dac1d2fef6` (3 days old): Add a preview rail where clicking an inbox item opens its detail page
8. `30cb7edb42` (3 days old): Give each inbox card a right sidebar to talk to it with its context
