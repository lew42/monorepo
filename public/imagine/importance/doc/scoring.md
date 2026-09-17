# Scoring — the seam

**A score is never stored.** It is computed from the judgment rows every time anything is
drawn. That is the whole reason the formula can change without the files changing.

Three methods in `importance.js` do all of it, and they are deliberately separate:

```js
rows(context)       // every judgment cast in this context, minus the retracted ones
tallies(context)    // per node: games, wins, summed weight, summed winning weight
score(tally, rows)  // ONE number from one tally — this is the only invented value
```

`rank(ids, context)` glues them together and sorts. Nothing else on the site computes a score.

## What it does today: a weighted win rate

```js
score(tally){ return tally.weight ? tally.won / tally.weight : 0; }
```

`weight` is the sum of the judges' weights across every comparison this node took part in;
`won` is the sum across the ones it won. With every judge at the default weight 1.0 that is
exactly *wins ÷ games* — q1 in the car topic won 3 of 3, so it reads **100% — won 3 of 3**.

A judge whose `weight` is 0.2 moves the number a fifth as far as one at 1.0, and a judge set
to 0 has no effect at all. That is the owner's answer to brigading, and it needs no special
case: the rows stay, the weight changes, the score recomputes.

## The honest part: the count travels with the number

Every place a score is shown, the number of judgments behind it is shown next to it, and a
node nobody has judged says **"unranked — no judgments yet"** rather than 0%.

This is not decoration. 0% is a real, earned score: it means judged, and lost every single
time — which is what "What color is it?" has. Printing 0% for something nobody has looked at
would make the cold-start problem invisible exactly when it is worst. `confidence()` in
`views.js` is the one function that formats this, so no screen can disagree with another.
An unranked row draws no meter bar at all, sorts last, and is the first thing judgment mode
shows you.

## Swapping in Elo or Bradley–Terry

Replace `score()`. Nothing else.

It is handed the node's tally **and the raw rows of the context**, which is the only thing
either of those methods needs that a tally alone does not carry: who beat whom, in order.

- **Elo** walks `rows` in `created` order, holds a rating per node, and updates both sides
  after each comparison. It wants the sequence — hence `rows` — and a `K` constant, which is
  a number in this file, not a column in any table.
- **Bradley–Terry** fits a strength per node by maximum likelihood over the same pairs. It
  wants the counts per *ordered pair*, which is one pass over `rows`.

Neither asks the three files for a single new field. Both would want to cache their result
per context rather than recompute per render — that cache is a `Map` in the `Store`, cleared
by `append()`, and it is not needed at the size the car example runs at.

## What the pair chooser does with it

`pair(context)` scores every possible comparison by how little it would teach us, and picks
the lowest:

```
cost = (times this exact pair was already judged) × 10
     + (judgments the two nodes have between them)
     + |score difference| × 5
```

So: a pair nobody has compared beats one already settled, a new node beats a well-judged one,
and two nodes with close scores beat a blowout. A freshly proposed item has zero of all three
and comes up immediately — which is the cold-start answer, and it falls out of the same
numbers rather than needing a rule of its own.

The weights (10, 1, 5) are a first guess, not a finding. They are three numbers on one line
in `importance.js`; changing them changes which question you are asked next and nothing else.
