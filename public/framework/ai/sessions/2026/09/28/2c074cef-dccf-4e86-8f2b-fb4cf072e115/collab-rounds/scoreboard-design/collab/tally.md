# Design the `Scoreboard` class in ext/Collab (public/framework/ext/Collab/Collab.js already has a first version by one agent: read it). It reads public/framework/ai/collab/scoreboard.jsonl, where each line is {"score": {at, collab, decision, member, model, votes, won, cost, overrule?}}, one per member per decision. The owner's words: 'each time we do a fan out, if one model never gets any votes and just doesn't seem to be performing, and especially if it's more expensive, we just kind of phase that one out … maybe we can do that automatically … I can see the decisions … and disagree with the way that things were voted on.' It must give, per model: decisions entered, wins, win rate, votes received, total cost, cost per win, a way to pick the models to retire, and count the owner's overrules. House style: plain ES classes, assign-based constructors, small methods, parts as static subclasses. Decide the whole signature first (class, properties, methods and their arguments) as one package, then implement it as a standalone ES module in your own dir.

**Winner:** haiku-a — `public/framework/ai/2026-09-28/collab-rounds/scoreboard-design/collab/haiku-a/3-implement.md`
**Rule:** most votes
**Run cost:** $2.0329

## Votes
- sonnet-b: 1 vote(s), $0.6398
- haiku-a: 2 vote(s), $0.6431

## Caveats
- haiku-a: Adopt the single-pass Map aggregation approach (from haiku-a/haiku-c) in models() to optimize from O(n·m) to O(n) performance while retaining sonnet-b's modularity.
- sonnet-b: add the broken-import finding as its own row in the comparison table, not just prose, since it's the one issue that actually blocks shipping the code as-is
- haiku-c: Adopt sonnet-b's static median() method to extract and document the algorithm; haiku-a's inline calculation works but sonnet-b's static method is more maintainable and clarifies the intent.
