# demo-merge-2 — execute steps 2-5 of the demo-merge proposal

**Spec:** [`../demo-merge/proposal.md`](../demo-merge/proposal.md). Step 1 (the height clips) landed already.

## The ask, verbatim

> TASK — execute steps 2-5 of the demo-merge proposal (step 1, the height clips, landed already).
> THE PROPOSAL IS THE SPEC: `public/framework/ai/2026-08-30/demo-merge/proposal.md` (14 variants
> to 6, five ordered steps, call-site counts per step, the open questions at the end — including
> the `page.demo()` vs `demo.page()` name clash: RESOLVE it as the proposal's own analysis leans,
> and say which you chose and why in two lines). Read it + `ext/demo/shell.js` (the proven
> prototype) + today's `urls:` default flip (app.js) before editing. Run the `code` skill.
>
> THE WORK, per the proposal's own order: map `demo.page()` / `demo.tree()` / `demo.exhibit()` /
> `demo.layout()` (231 call sites) onto `page.demo()`/shell config BY CHANGING THEIR FOUR DEFINING
> FILES — never 231 rewrites; the sugars become thin wrappers over the one shell. Delete outright:
> `demo.source`, `demo.source.file`, `demo.stage.two`, `two.js`, `twin()` (0 direct callers; the 25
> `twin: true` configs map to the shell's widths option per the proposal). The width readout ALWAYS
> present (the shell guarantees it). The source expando dies — code becomes the shell's peer column
> everywhere the sugars render source. Add the copy button the shell lacks (the one thing the
> expando had).
>
> VERIFY — the proposal names the risk surface: after each step, crawl a stratified sample (the
> proposal's per-variant call-site lists — pick 3 pages per migrated variant, ~15 pages total + the
> 8 heaviest demo pages) at 400/1920/3440: every demo renders, no clip (render >= content), width
> readout present, code column beside at wide / below at 400, zero console errors. The palette wall
> (29/29) and the generator page unregressed. Count the variants remaining in code at the end — the
> number should be 6.
>
> FENCE — `ext/demo/**` + `ext/layout/**` (the bar becomes a shell option per step 4) only. If a
> call-site FILE must change because a deleted variant is imported by name (grep first — the
> proposal says the 4 sugar files cover 231 of the sites), list every such extra file in the log
> before touching it; more than ~10 extra files means STOP and report instead.

## Fences

- Own: `public/framework/ext/demo/**`, `public/framework/ext/layout/**`.
- Extra call-site files: grep first, log each before touching. >~10 = stop and report.
- Never kill/restart the :80 dev server. Private probe server: `$env:PORT='8095'; node server.js`, torn down after.
- Never drive owner tabs. Never stash. Never commit.
