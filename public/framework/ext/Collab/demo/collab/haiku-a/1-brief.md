# Brief — which consensus method works best for cheap fan-out agents?

Plain majority vote is the cheapest: every member drafts once, votes once, done.
It breaks down once members read exactly the same prompt and reason the same
way, since then a "majority" is really one opinion counted three times.

Sources: a couple of blog posts on multi-agent debate, skimmed, not saved.
