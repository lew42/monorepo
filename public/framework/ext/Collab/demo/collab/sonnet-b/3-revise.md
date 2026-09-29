# Revised — which consensus method works best for cheap fan-out agents?

Four methods, ranked by cost against how well they survive correlated errors:
plain vote (cheapest, weakest), debate (2-3x cost, one judge), peer-rounds
(one extra read-and-revise step, strong middle ground), Delphi (multiple
rounds, strongest, most expensive).

**For cheap fan-out: peer-rounds by default, with a Delphi-style second round
only when the first vote doesn't clear a majority.** That is exactly the shape
this run itself used — brief, read 1-2 peers, revise, vote — and it is the
shape `ext/Collab`'s `phases` already default to for `kind: "research"`.

Sources: general multi-agent literature, not fetched live for this demo.
