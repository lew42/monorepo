# STATE — refine-demo (mastermind-refine-demo): LANDED 2026-10-08


Merged to michael/dev and Servex restarted.

Checked headless: (refine → flag → S# click-through → live debug tree).

Live: /framework/ext/Refine/ · architecture: ext/Refine/doc/architecture.md · class: doc/prompt.md.

Built: RefineSystem (boss), Prompt (+View), Scorer (rules), RefineDemo, Servex POST /api/refine.

Decisions: scores = rules (Haiku per prompt was the alternative); Cleaner/Structurer named but still the two existing functions; one route because structure() is Node-only.

Next steps: alternates + names via a Haiku pass; per-sentence streaming; Prompt carries its session id; hand-off to agents; phone mic over https (dev/mobile).

