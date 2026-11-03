# vision-direction — direction first, then the delta; a decl for every finding; referee on 30+

Laws: less is more · clarity · prioritize. **Deliverable: a precision number on ≥30 model-written CSS deltas produced from directional recommendations, and the browse run that shows the whole chain. Final message ≤ 25 lines.**

Mike (2026-08-17 ~20:50), verbatim: *"shouldn't those, who have already seen the image, replied with a description of the problems (and solutions?) be the one to recommend fixes? shouldn't each recommendation be easily translated to a fix? … maybe it's just telling you what it thinks it should be, which is often what it says (or close) in the CSS? that's why, getting an 'increase' or 'decrease' recommendation first might be better? then, when it looks up the actual code, it can apply a change?"*

Prior: [`../vision-fixes/quality.md`](../vision-fixes/quality.md) — turn 2 wrote a decl for 6/74; 68 declined ("intentional / markup"); decl precision 0.17 on n=6. The seat that saw the image IS the one asked (turn 2 resumes the same session) — keep that.

## Do

1. **`fix` = direction + property.** `prompts/critique-full-v2.md` (default): the `fix` key becomes `{"direction": "increase|decrease|add|remove|align|move|recolour", "property": "<space above the h1 | text contrast | column width | surface | …>", "amount": "<a little | a lot | to match X>"}` — words the model can say from the picture, no CSS, no px. Keep the prose and `class`. Version it `critique-full-v4` (v2 stays for comparability).
2. **Turn 2 must translate every finding.** `prompts/css-v3.md`: "For EACH finding, given its direction/property/amount and the CSS you can read (framework.css tokens, Page.css, the module css, styles/doc/layout-system.md), return the smallest delta that moves it that way: `{sel, decl, why, ladder_rung}` — a token change first, a rule second, a class claim (`wide`, `bleed`) third. If the CSS is already what the fix asks (the finding was taste), return `{"retract": true, "why"}` — that is an answer, not a refusal. Never return nothing." Log `retracted` count.
3. **Run**: the 6 pilot pages, `--replay` the SAME pngs the gate used (`vision-fixes/shots/`, hashes in its `vision.jsonl`), Sonnet, `critique-full-v4` + `--turn2 css-v3`, one seat → `--out public/framework/ai/2026-08-17/vision-direction` (~6 + 6 asks ≈ $2.50; `--dry`; ceiling $5). Expect 25–40 findings → 25–40 decl-or-retract.
4. **Referee (you, Opus)** — every finding: is it real (right/taste/wrong); is the direction right; does the decl move it that way at the right rung without a new branch (right/taste/wrong); is each `retract` correct. Precision for findings · directions · decls · retracts, and by class. Two numbers that must agree: decls+retracts judged = findings in vision.jsonl. `quality.md` here (≤ 50 lines) with the three worst and best quoted, and the one-line verdict: **≥ 0.6 on decls → the preview/accept path opens; else the dominant failure and the next knob.**
5. Also record: $ per finding end-to-end (turn 1 + turn 2) — the number Mike will ask.

## Rules

- Files: `ext/DesignTool/vision/{run.mjs,prompts/*,readme.md}`, this dir. Not `browse.js`/`page.js`; not site CSS. `code` skill once; `finish-task`. Log in `task.jsonl` (bash `printf`; timestamps from `date -Iseconds`); bump step. The browse page renders `fix` as text — if `fix` becomes an object, keep a `fix.text` string ("increase space above the h1 a little") so the UI shows it unchanged.
