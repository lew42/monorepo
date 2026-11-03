# Brief: adopt `Kit · Layouts` everywhere it fits (2026-10-12, night)

Read [brief-ds.md](brief-ds.md) and [componentize.md](componentize.md). `Kit · Layouts` (`178:1062`) now has the seven layouts, four charts and `Ground` as components. File `QYN0G2URSBHYH5I06MOjxU`.

- On `DS · 4.1 Foundational layouts`, replace each use specimen's hand-built frame with a layout instance whose slots hold the same real content (move the content nodes in; reset moved nodes to HUG/grow 0 as componentize.md warns). Delete the placeholder-only instance frame `181:2070` once every layout has a real instance on the page. Keep the 4.1 shape and labels.
- On `DS · 6 Screens`, swap the remaining frames (sessions list, detail, settings, desktops) to Layout/Chart/Ground instances where one fits; keep every prototype reaction working (count reactions before and after).
- On `DS · 5`, the In-action dashboard uses Chart instances.
- Screenshot every changed section before and after; if an instance looks worse than the frame it replaced, put the frame back and say why.

Report `kit/adopt.md` (what was swapped, reactions count before/after, anything put back), committed by path.
