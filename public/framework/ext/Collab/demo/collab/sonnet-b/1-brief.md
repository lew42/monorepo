# Brief — which consensus method works best for cheap fan-out agents?

Four methods are in real use: plain vote (cheap, weak against correlated
errors), debate (two members argue, a third judges — better, costs 2-3x),
Delphi (anonymous rounds, each member sees the group's summary and revises —
strong, needs 2+ rounds), and peer-rounds (read-a-few, revise, vote — the
middle ground: most of Delphi's benefit for one extra read step).

For cheap fan-out specifically, peer-rounds wins: it adds one read step, not a
whole extra round, and the read step is what breaks the correlated-error
problem plain voting has.

Sources: general multi-agent literature, not fetched live for this demo.
