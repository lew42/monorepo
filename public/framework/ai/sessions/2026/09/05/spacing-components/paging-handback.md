# paging/ — the spacing constants this pass did not touch

`public/imagine/paging/` was fenced out of `spacing-components` (another minion owned it
on 2026-09-05). This is the list that pass would have converted, taken at 15:35 — **the
files were being rebuilt while it was taken, so re-run the inventory before acting**
(`spacing-components-inventory.py` in the session scratchpad).

**The transform, so it matches the rest of the site.** A constant `Nem` becomes
`calc(var(--gap-ramp) * N)` — exactly `Nem` at 1280 and 3.07× that at 3440. A
section-scale constant (`2em` and up) becomes `calc(var(--flow-ramp) * N/2)` instead,
which caps at `3em` and grows 1.8×. A `px` value is a painted hairline and stays.
Every converted line carries `/* was <old> - <date> ramps */`.

| family | count | what to do |
|---|---|---|
| `gap` / vertical `margin`, em | 109 | convert |
| `padding`, em | 59 | keep — control padding is a ratio of its own text (the judge's control rule, 0.6–1em); convert only a real container |
| any, px | 10 | keep — a painted hairline seam |

## The rules to convert

### `public/imagine/paging/baseline.css`

- `24` — `gap: 0.3em 0.6em`
- `56` — `gap: 0.3em`

### `public/imagine/paging/build/build.css`

- `54` — `gap: 0.5em`
- `57` — `gap: 0.5em`
- `71` — `gap: 0.2em`
- `90` — `gap: 0.4em`
- `91` — `gap: 0.35em`
- `99` — `gap: 0.4em`
- `104` — `gap: 0.3em`
- `112` — `gap: 0.25em`
- `143` — `gap: 0.35em`
- `152` — `gap: 0.3em`
- `189` — `gap: 0.5em`
- `209` — `margin: 0.6em`
- `215` — `gap: 0.15em`
- `228` — `gap: 0.2em`
- `234` — `gap: 0.3em`
- `254` — `gap: 0.15em`
- `273` — `gap: 0.35em`
- `273` — `margin: 0 0 0.5em`
- `283` — `gap: 0.5em`
- `287` — `gap: 0.15em`
- `289` — `gap: 0.4em`
- `300` — `margin-block-end: 0.6em`
- `329` — `gap: 0.5em`
- `334` — `gap: 0.15em`

### `public/imagine/paging/navigation/navigation.css`

- `81` — `gap: 0.2em`
- `88` — `margin-block-end: 0.6em`
- `91` — `gap: 0.4em`
- `133` — `gap: 0.7em`
- `139` — `gap: 0.35em`
- `187` — `gap: 0.2em`
- `189` — `gap: 0.4em`
- `197` — `gap: 0.6em`
- `210` — `gap: 0.4em`
- `225` — `gap: 0.35em`

### `public/imagine/paging/paging.css`

- `26` — `gap: 0.7em`
- `42` — `gap: 0.4em 1.2em`
- `43` — `gap: 0.3em`
- `52` — `gap: 0.25em`
- `77` — `gap: 0.35em`
- `80` — `gap: 0.5em`
- `99` — `gap: 0.4em`
- `106` — `gap: 0.2em`
- `112` — `gap: 0.6em`
- `120` — `gap: 0.5em`
- `129` — `gap: 0.4em`
- `153` — `gap: 0.4em`
- `155` — `gap: 0.2em`
- `165` — `gap: 0.25em`
- `247` — `gap: 0.7em`
- `248` — `gap: 0.3em`
- `250` — `gap: 0.3em`
- `250` — `margin-block-end: 0.5em`
- `274` — `gap: 0.35em`
- `319` — `gap: 0.3em`
- `326` — `gap: 0.4em`
- `333` — `gap: 0.35em`
- `336` — `gap: 0.4em`
- `351` — `gap: 0.15em`
- `372` — `gap: 0.35em`
- `378` — `gap: 0.5em`
- `391` — `gap: 0.5em`
- `443` — `gap: 0.9em`
- `451` — `gap: 0.4em`
- `487` — `gap: 0.25em`
- `496` — `gap: 0.25em`
- `501` — `gap: 0.3em`
- `521` — `gap: 0.5em`
- `536` — `gap: 0.5em 1.3em`
- `542` — `gap: 0.15em`
- `543` — `gap: 0.2em`
- `565` — `gap: 0.3em`
- `607` — `gap: 0.6em`
- `612` — `gap: 0.7em`
- `636` — `gap: 0.7em`
- `643` — `gap: 0.25em`
- `682` — `gap: 0.3em`
- `703` — `gap: 0.15em`
- `725` — `gap: 0.25em`
- `731` — `gap: 0.4em`
- `747` — `gap: 0.5em`
- `755` — `gap: 0.3em`
- `766` — `gap: 0.4em`
- `777` — `gap: 0.3em`
- `795` — `gap: 0.3em`
- `819` — `gap: 0.3em`
- `826` — `gap: 0.35em`
- `840` — `gap: 0.4em`
- `841` — `gap: 0.35em`
- `864` — `gap: 0.5em`
- `881` — `gap: 0.25em`
- `881` — `margin-block-end: 0.9em`
- `882` — `gap: 0.25em`
- `884` — `gap: 0.4em`
- `884` — `margin-block: 0.4em`
- `885` — `gap: 0.2em`

### `public/imagine/paging/templates/templates.css`

- `71` — `gap: 0.6em`
- `78` — `gap: 0.4em`
- `100` — `gap: 0.8em`
- `107` — `gap: 1.2em`
- `120` — `gap: 0.7em`
- `125` — `margin-block-start: 0.8em`
- `166` — `gap: 0.15em`
- `176` — `gap: 0.6em`
- `188` — `gap: 1em`
- `190` — `gap: 0.8em`
- `197` — `gap: 0.2em 0.7em`
- `223` — `gap: 0.2em`

