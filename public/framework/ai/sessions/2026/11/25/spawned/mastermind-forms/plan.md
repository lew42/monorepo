# Forms in the monorepo: plan (2026-11-25)

The brief (the owner's words, what exists): `.scratch/forms/brief-2026-11-25.md`. Inputs: `.scratch/forms/` (spec.md, forms.md, research.md, formlab-src/, stills-results.json). The card: [Forms: kit, sign-in, video button](/framework/ai/2026/11/25/forms-kit-sign-in-video-button/).

## The asks

1. One design system: map Figma Lew42 v3 to the web's tokens, smallest change to match (a doc, no token renames).
2. The form kit as blocks: one block per answer type T01–T20, the −3…+3 scale, a Question block, a Form block (list, stepper, quiz) that reads and writes JSON.
3. Pages from blocks: all 20 types on one page; a sign-in block (Google first); a talking-head video with one "Sign in with Google" button over it.
4. Not now: seven colour schemes, Glass forms over video, token work, live poll, experience player, studio.

## What exists (looked before building)

- `ux/Auth/` (`Auth.js`, `MagicAuth.js`): login, signup, reset and a social row as one class, extended by seams. The sign-in block extends it; no second auth view.
- `ux/Wizard/`: the multi-step engine (`next back go done`, `Wizard.Keys`). The Form's stepper layout reuses it if it fits.
- `ui/field/` (stub: label, input, hint) and `ui/controls/` (THE CONTROL GRAMMAR in `framework.css`: one box for button, select, input, textarea; `.prim`; `--size`). The kit wears the control grammar; it adds no second control style.
- `public/app/` + `worker/google.js`: a real Google Identity Services sign-in, never run with a real client id (`GOOGLE_CLIENT_ID` empty). The Google button mirrors its call and stays a mock until a client id is set.
- `ext/Figma/tokens/` + `doc/token-sync.md` (2026-10-12): an opt-in `--fig-*` bridge from an older Figma file. Superseded for v3; the new map says so.

## Names and homes (decided)

| Thing | Home |
|---|---|
| Form kit module | `public/framework/ux/Form/` (page `/framework/ux/Form/`) |
| Base answer class | `ux/Form/Answer.js` (`class Answer extends View`: `value` get/set, `change`, `static type`, `static shape`) |
| 20 answer blocks | `ux/Form/answers/<Name>.js`, one class per file (`YesNo`, `Toggle`, `ChooseOne`, `Dropdown`, `ChooseMany`, `Chips`, `Frequency`, `Agreement`, `Scale7`, `Slider7`, `Slider100`, `Likelihood`, `Stars`, `NumberAnswer`, `DateAnswer`, `TimeAnswer`, `ShortText`, `LongText`, `RankTop3`, `Emoji`) |
| Question, Form | `ux/Form/Question.js`, `ux/Form/Form.js` (`layout: "list" \| "stepper" \| "quiz"`, `values()`, `load(json)`) |
| Styles | `ux/Form/Form.css`, inside `@layer site`, using the framework's own tokens |
| Google button + sign-in | `ux/Auth/GoogleButton.js`; the sign-in view as an `Auth` extension (like `MagicAuth`) |
| Sign-in and video page | `/framework/ux/Auth/google/` |
| Design-system map | `public/framework/ext/Figma/doc/v3-web-map.md`, linked from `start-here-v3.md` and `styles/system/readme.md` |

Alternative considered: `ui/form/` (the template tier). Rejected: each answer holds a typed value and events, which is behaviour, and `ux/` is the tier of extendable classes (Auth and Wizard live there).

## Who does what

| Step | Agent | Model | Folder |
|---|---|---|---|
| Measure both sides (v3 variables; site computed styles at 400, 1000, 1920) | minion `forms-measure` | Sonnet, medium | `measure/` |
| Write the map doc and decide the smallest change | me | — | — |
| Build the kit, its page, tests | minion `forms-kit` | Sonnet, high, worktree | `kit/` |
| Build the Google button, sign-in, video page | minion `forms-signin` | Sonnet, high, worktree | `signin/` |
| Fresh review of each, then merge | `Server/review.mjs`, me | — | — |

Cost guess: measure $2, kit $10–15, sign-in $5–8, reviews $4. Week is 43% used with 98% gone, so the spend is free.

## Reports to the cloud chat (`voice-app`)

(a) this plan and the mapping; (b) the first working page, URL plus screenshot path; (c) the finish, what is left, questions.
