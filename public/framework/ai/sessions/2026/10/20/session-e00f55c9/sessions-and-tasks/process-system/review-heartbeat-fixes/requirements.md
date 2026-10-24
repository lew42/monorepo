# review.mjs and Heartbeat fixes (mastermind-deputy, 2026-10-23)

1. review.mjs refuses a review target that is HEAD or michael/dev, so a review cannot land against the wrong tree.
2. Heartbeat sends no status checks to a task waiting on the owner or paused; look-first briefs append a wait line with their show: line.
