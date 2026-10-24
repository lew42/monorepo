# Docs check: ext/Refine readme chain (2026-10-16)

Read: root readme, framework readme, ext readme, ext/Refine readme. Nothing else.

- `ext/Refine/readme.md`: RefineSystem chunks are not mentioned. RefineSystem appears only as "the boss" in the file list and the Architecture link, so a reader can't learn that it splits input into chunks or how.
- `ext/Refine/readme.md`: the composer `per_sentence` option is not mentioned. The readme never names the composer, so a reader can't find the option or its default.
- `ext/Refine/readme.md`: `test/composer-flow.mjs` is not mentioned. Only `test/dictate-flow.mjs` is named as proof, so the composer flow has no test pointer.
- `ext/Refine/readme.md`: `doc/redesign.md` is linked, but only inside the Audit bullet, and it is labelled a proposal. If the redesign has been built, the readme is stale; if not, it should say so and give its status.
- `ext/Refine/readme.md`: the opening says "The page opens on a live demo", but the More list still has an "Overview ... run C live by default" bullet describing the old ladder. The two descriptions of the default page disagree.
- `ext/Refine/readme.md`: the page is far past a short index (about 100 lines, many long bullets). The "Architectural Recommendations" section is also stale: it says Refine is a functional factory, but `RefineSystem` and `Prompt` are already classes.
- `ext/Refine/readme.md`: it says `refine-` is "not yet in `styles/css-scopes.txt`" and that the mastermind registers it. That is an old note nobody has checked.
- `ext/Refine/readme.md`: the links mix three styles: `doc/x.md` file paths, `/md/doc/x/` routes, and bare backticked paths. This breaks the "write plain file paths" rule.
- `ext/Refine/readme.md`: `doc/refined-asks.md` ("46 open, 2 done"), `doc/live-refine-2026-10-12.md` and `doc/architecture.md` (the last only as a route) are listed under "On demand" but are not all linked in the text. Check that each doc is linked from the readme.
- `ext/readme.md`: the index has no Refine entry. It only says "Ask, Refine, Research ... are proposed to move" to `ai/`, so the ext index does not point to Refine.
- `ext/readme.md`: the root readme links Refine, but `ext/readme.md` and `framework/readme.md` don't link its test files or the `stages/` module.
- `readme.md` (root): the Refine line mentions the dictation-to-prompt flow and the queue, but not the composer or chunks, so the "unlinked" gap starts here.
