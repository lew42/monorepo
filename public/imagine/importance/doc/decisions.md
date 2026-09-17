# Decisions — the record

Built 2026-09-13 from the owner's brief. What was decided, what was rejected, and what is
deliberately not here.

## Decided

**One `Graph`, two IO halves.** `Graph.js` holds the three collections, the edges, the
scoring and the pair chooser, and imports nothing at all. `importance.js` adds `load()` and
`append()` over `fetch` + the dev socket; `importance.mjs` adds the same two over `fs`.
They are the only two methods that differ. The owner's rule — "nothing structural
distinguishes a bot" — is therefore a fact about the code, not a promise about it: a bot's
judgment and a click's judgment are the same row, scored by the same `score()`.

**JSONL, not TSV, and not `ext/JSONL`'s verb model.** The decisive reason is mechanical:
`Server/plugins/SocketServer/Append.js` refuses any path that does not end `.jsonl`, so a
TSV could be read from the browser but never written from it. `ext/JSONL` was considered
and passed over — its contract is *one verb per line, replayed into one object's state*,
and these are three flat record streams; wrapping every committed row in `{"judgment": …}`
to get a `live()` neither page needs was the wrong trade. Both pages redraw from the
in-memory store when they are activated, which covers the case that matters (judge, walk
back, see the new number). [`storage.md`](./storage.md)

**`winner` holds a node id.** The owner's schema table says `a | b`; the worked example
writes `q1`. The writer writes the id, `Graph.won()` reads both.

**`goal` and `reason` on every judgment row from day one**, empty strings when unset — the
owner named retrofitting `goal` as the painful case, and 21 bytes a row is the cheapest
migration that will ever be available.

**Where you are is a url, not a click.** `?at=q1` on both pages, pushed with
`history.pushState`, so a context is shareable, survives a reload, and the back button
walks back up the graph. Clicking a child does not navigate — it is the same page showing
a different node — so both pages redraw when they are activated, because core builds a
page's view once and caches it. `activated(){ this.draw(); }` — core calls that hook at the
end of its own `activate()`, so the five-line override each page carried for a day (call
`Page.prototype.activate`, draw, return its answer) is gone.

**Nothing you click to move around is a `<button>`.** `lew42.css` gives every real button
0.8em uppercase bold inside a hairline box. That is right for *Add* and wrong for a
question you are reading, so the ranked names, the rank/trace control and the two choice
cards are `role="button"` spans and divs with their own Enter/Space handling (`tap()` in
`views.js`). The same trap the `css` skill records against a tree toggle in 2026-08-19.
Refined 2026-09-13 (below): not looking like a button is not a licence to look like
nothing, so each of those now carries the mark of what it is — a link's underline on a
name, a labelled strip on a card, a labelled toggle on a row.

**One node, many edges — never a copy.** A caveat that applies under two topics is the
SAME `c1`, joined a second time (`c1 qualifies q5`); the words are never pasted into a
second node. A copy drifts the moment one side is edited, and it splits the judgments in
half, so neither copy can ever be ranked honestly. `Graph.link()` and the CLI's `edge`
verb are the only writers of that second edge — `propose()` always mints a new node, which
is why nothing on the command line could express reuse until 2026-09-14.

**An unranked node draws no meter bar**, sorts last, and comes up first in judgment mode.
An empty bar reads as zero, and zero is a score somebody earned.

## Rejected

- **A `data/shards.json` manifest.** A fourth file a writer must remember to update. The
  browser walks every month from `2026-09` to now instead — a quiet month cannot truncate
  the walk, which a "stop at the first miss" loop would have done silently. Revisit when
  the fetch count matters, which is years out.
- **Real nested pages per node** (`/imagine/importance/car/q1/`). It needs the `child()` +
  `load_all_children()` override pair from `cms/json/page.js` to make a cold deep url work,
  and the owner's own caveat says contexts should stay 2–3 hops deep. `?at=` is one line
  and does the same job today.
- **`width: "fill"` on judgment mode.** It would claim the leftover from the context view
  column beside it and squeeze it to its 288px floor — the failure measured on the Research
  front, 2026-09-04. Both columns take the default track; the two choices are
  `flex: 1 1 14rem` so they sit side by side at ~500px of column and stack under it.

**Live, on `ext/JSONL`** (added the same day it was first left out). `Store.open()` streams
all three files instead of fetching them, and a judgment reaches every other open window in
**9 ms**. The verb model was the reason to pass `ext/JSONL` over for storage, and it turned
out not to be a reason at all: `apply()` is the one seam every line passes through, so a
nine-line `Rows` subclass takes flat records and the whole socket half comes free. The
committed files are unchanged — still one flat object per line. Three rules came with it:
the writer does not apply its own line, a control is never inside the streamed region, and
somebody else's judgment does not move the pair under your hand. [`live.md`](./live.md)

## The self-evident pass, 2026-09-13

A reviewer read both screens **cold** — a sentence per pane written down before any code —
and pressed 13 of the 14 control kinds here. Four of their ten findings were this realm's,
and all four are fixed. What changed, and what each reverses:

**The judge cards say they are cards you press.** One line above the pair — *"Click the one
that matters more, or press its key — both scores appear after you pick."* — and a labelled
strip at each card's foot (*Pick this one · 1 · ←*). The cold read could not tell whether
the card or the little key cap was the target.

**Enter hands the keyboard back.** A keypress inside a field was ignored on purpose, so
the natural first move — click the name box, type your name — killed `1 / 2 / ← / →` with
no way back but a click somewhere neutral. The answer was `back()`, which blurred on Enter.
**Reversed the same day** — round two measured what that costs (below). The judge field is
still labelled *judging as*; the propose form's is *proposed by*.

**No score on a card before the pick.** The pair used to arrive carrying `100% of 3
judgments` against `0% of 1 judgment` — the answer printed on the question. `reveal()`
shows both the moment the pick lands, marks the one you chose, and holds the result until
you press *Next two* (or Enter). That also closes a quieter defect: a pick used to replace
both items by itself, which is a click whose consequence nobody can see.

**`up()` reads both directions.** It followed only the DOWN relations, so a caveat — which
hangs UPWARD, `c1 qualifies q1` — had no parent, and its page had no trail at all: the
browser's back button was the only way home. The trail loop also carries a
`chain.includes(id)` stop now, because two nodes that qualify each other could otherwise
print eight crumbs.

**A name that navigates says so.** `.imp-name` wore no mark until hover, on the reasoning
that a column of underlined lines reads as a menu rather than a ranking. The cold reader
did not guess a single name was clickable, so it wears the site's own prose-link mark at
rest — body ink, a `--prim` underline, thinner than a paragraph's. **Reversed.**

**The paragraph describing the bar chart is deleted**, and the picture carries it: the count
beside each bar reads `100% — won 3 of 3`, and the trace control is a labelled row toggle
(*Why? Show the 3 judgments* ↔ *Hide the 3 judgments*) instead of the word "why?" at 0.65em,
which read as a caption. The rank numeral still opens the same rows — the owner's "click a
rank to see the judgments behind it" — and shares one `flip()` with the toggle so the label
can never disagree with what is open.

**The way in turns off where there is nothing to compare.** On a leaf — any caveat, any
question with nothing under it — the biggest button on the screen led to *"There are not two
things here yet to compare"*. It is drawn disabled (`aria-disabled`, which framework.css
already styles) with the reason beside it: *nothing to compare yet — add a second thing
below and this turns on*.

## Round two, the same day

A second reviewer read both screens cold and found eleven things across the two realms.
Three were this one's.

**The pick keys judge from the name box. They are text in the reason box.** Typing a name
and pressing `2` put the digit IN THE NAME, cast nothing, and the next press wrote the
corrupted name to the committed file as the judge — the worst defect either screen had,
because it was silent and it reached disk. `ImpPair.key()` now takes `1 / 2 / ← / →` from
the judge field as a judgment and swallows the keystroke, so the digit never lands; the
same keys are swallowed again after a pick, or a second impatient press would type the one
the first press ate. The field's `title` says so.

The reason field beside it was deliberately NOT given the same rule, which is where this
departs from what round two asked for. *"a bent frame is 2 grand"* is a line somebody will
type, a judgment is **append-only**, and a key that cast one halfway through a sentence
would write a row nothing can take back. A digit typed into a reason is visible in the box
you are looking at; a digit typed into your name was not. So the name box is a control and
the reason box is prose, and the two behave as they read.

**The judgments a toggle opens are drawn under the toggle.** They were drawn after the
caveats hanging off the same rank, which put the first of them 78px below the caveat's own
line — so five rows about rank 1 read as that caveat's record. One statement moved in
`ImpRank.row()`: the slot is built before the attachments, not after. And `weight 1`, a
word nothing on either screen explained, is not printed at all now — one is the default and
says nothing. A weight that is *not* one says it in words (`counts 2×`, `not counted`).

**The judgment column says nothing the column beside it already said.** It drew the green
*Saved to disk* mark and the topic's own title — under a second label, THE CONTEXT — one
scroll-width from the context view drawing both, so a newcomer read two headings for one
thing and a status line printed twice. Under `/imagine/`'s columns host the context view is
always the column on its left, so the mark and the heading are its job alone. The duplicate
that surfaced underneath went too: the column's own title, *Which matters more?*, printed
again in the page's voice one line below it. What is left on that column is the instruction
the two cards cannot draw, the cards, the controls, and the way back.

## The reuse overlay, 2026-09-14

The owner's item 4 was half-closed: clicking a rank showed the judgments behind it, but
"see where a caveat or question is reused across contexts" was left, because the car example
had ONE topic and therefore nothing to show. A second topic seeded by `bot_seed` — *Selling
a used car*, three questions, and the Carfax caveat joined to one of them by a second edge —
gave it something, and the overlay went in behind it.

**The mark is the same gesture as `Why?`, and shares its rule.** A node reached from more
than one topic wears a small chip beside its name; pressing it opens the other topics in
place, with what this node hangs off in each. `.imp-mark` rides `.imp-why`'s CSS rule rather
than copying it, and `.imp-also` rides `.imp-trace`'s box, so two controls that behave alike
cannot drift into looking like two kinds of thing.

**At the node itself the mark counts differently**, because nothing there is "other": the
caveat's own screen says *used in 2 topics* and lists both. That is not decoration — the
trail follows `up(id)[0]`, ONE way home, so a node's second home was invisible from its own
page.

**A topic picker, because `?at=` is the whole address bar.** Without a row of topics a second
one can be reached only by typing its id. It draws only when there IS a second topic, and at
a node that belongs to two of them it marks NEITHER as "here" — `root()` answers with the
first way home it finds, and filling one chip while the head said *used in 2 topics* was two
true statements contradicting each other.

## Left, with the reason

**The trail still shows one way home.** `up(id)[0]` picks the first parent, so the crumbs
above a shared caveat name one of its two topics. The head's mark is the answer — it lists
both — and a trail that forked would be a second navigation idea on a screen that already
has three.

## The namespace — closed 2026-09-14

`public/framework/styles/css-scopes.txt` line 130 now reserves the prefix:

```
imp-         /imagine/importance (the ranked context view, the judge screen, the propose form)
```

The prefix was censused clean before use (zero `.imp-*` hits across `public/**/*.css` and
`public/**/*.js`), and so were the overlay's five additions — `.imp-mark`, `.imp-toggles`,
`.imp-also`, `.imp-topics`, `.imp-topic`. The five `View` subclasses are named `ImpRank`,
`ImpTrace`, `ImpAlso`, `ImpPropose` and `ImpPair` so that `classify()` mints `.imp-rank`,
`.imp-trace`, `.imp-also`, `.imp-propose` and `.imp-pair` inside the same namespace rather
than five bare global words.
