# Revised — which consensus method works best for cheap fan-out agents?

Plain majority vote is cheapest but breaks on correlated errors — members given
the same prompt tend to make the same mistake, so three votes for one wrong
answer look like consensus. A cheap fix: read 1–2 peers before voting, so each
vote reflects more than one member's blind spot.

Sources: skimmed, not saved — this run predates the source library.
