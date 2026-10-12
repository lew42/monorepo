# Reading Peers' Briefs

## haiku-c

haiku-c grounded the rules in an architectural insight I missed: CSS has no native scoping, so a static site with no build step must manage the entire namespace by convention. This explains not just THAT the reservation system exists, but WHY — it's forced, not chosen. They also clearly separate what breaks things (style leaks, collisions in the global namespace) from what doesn't (missing specification about precedence, retired classes, modifier edge cases), making the distinction between "hard rules" and "guidelines" clearer.

## sonnet-b

sonnet-b identified a concrete guideline I overlooked: the `.pad` / `.card` / em-unit choice is explicitly presented as a rule of thumb, not enforced, and many real boxes sit at the boundary requiring judgment calls. They also reframed re-prefixing as "optional, not required" more precisely than I did, directly comparing it to BEM's own language ("collision-prevention convenience, not a requirement"). Most importantly, they clarified the distinction between guidelines (best practices that aren't enforced) and gaps (genuinely undefined, where you should ask the owner or document the decision). Their bottom line — hard rules are about COLLISION, soft parts about TASTE and UNRESOLVED EDGE CASES — is simpler and more actionable than mine.
