# Peer Review: What I Missed

## Sonnet-b

Sonnet-b found a critical failure mode I did not: **Collective Delusion**, where 65% of debate failures have agents reinforcing each other's wrong answer instead of catching it—a failure analysis from a 2025 control study that directly matched debate and voting at equal compute. Sonnet also gave a concrete adaptive strategy (vote once, then ONE more peer-review round only if near-tie) and uncovered the Delphi token cost curve: going from early-stop (~8-9x) to forcing all 6 rounds runs 33-49x, with 90%+ of trials able to stop after round 1.

## Haiku-c

Haiku-c provided specific performance numbers I lacked (voting delivers +17.9% on arithmetic, debate only +4-6% on hard tasks once compute is controlled), and surfaced a critical finding about conformity pressure: wrong peer agreement is *more* effective at misleading initially correct models than correct agreement is at correcting wrong ones (the "Easier to Mislead Than to Correct" paper). Haiku-c also outlined a concrete two-round strategy (independent → show distribution → vote) and flagged the need for verification when peers disagree.

