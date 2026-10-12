# size-standard — can pad, gap, flow and type collapse into one `--size` knob? (Opus, study + a live study page)

Three laws: less is more (ASAP); clear beats brief, by far; prioritize. Length budget: the study page is one screen with the live demo on it; the report is 8 lines.

Read first: the repo's `CLAUDE.md`; the owner's sentence in `../mastermind-graduate/layout-brief.md` deliverable 13 (and the verbatim paragraph it comes from); `../../2026-09-04/mastermind-platform/minion-rules.md`; `/imagine/design/spacing/decision.md` (the 09-05 decision: three ramps, three levels), `/imagine/design/spacing/ceilings/` and `/imagine/design/spacing/audit/` (how 20 pages were measured before/after — reuse the script if it is in the repo, else rebuild it in the scratchpad under `size-standard/`); `framework.css` `:root` (the exact tokens: the pad/gap/flow ramps, the levels, `--measure`, the type clamp) and `core/Page/Page.css` (the columns `cqi` pads). Skills: `new-task` (this dir, group `layout`), `css`, `layout`, `new-page`, `finish-task`.

## The hypothesis (the owner's)

One knob, `--size` (`.size-small { --size: .75em }`), and everything else revolves around it: padding, gap and flow scale fluidly with width, clamped, derived from `--size` and the box's width — `%` first, container units (`cqi`) if they earn it. Today there are three ramps and three levels, set on 09-05, plus the columns host's own `cqi` pads: four systems that a reader has to hold at once. Prove or refute that they collapse to one.

## The work

1. **Write the candidate** as a `:root` block of ≤ 8 lines: `--size`, and pad / gap / flow / the type scale derived from it and from width. Say what each existing token becomes (an alias of the derived value, or deleted).
2. **Apply it without touching `framework.css`** — another minion needs the site byte-identical today. Your probe injects the candidate as a stylesheet (`page.addStyleTag`) over the 20 audit pages at 400 / 1280 / 1920 / 3440 and measures median pad, gap, flow and body size, next to today's numbers. One table, in your log and on the page.
3. **The study page `/imagine/design/size/`** (register it in `/imagine/design/page.js` `children:`): one screen — the candidate's ≤ 8 lines shown; a live section with a resize handle (build it from `ext/grip`, import, do not copy) whose pad, gap, flow and type visibly follow `--size` and the width as you drag it, with the three levels `small / regular / large` as chips; the before/after table; the verdict in one sentence. The page carries its own scoped copy of the candidate so it works today (scoped under its own class; nothing global).
4. **The verdict**: collapse or not; if yes, the exact `:root` block to land and the list of rules that must change (count them by grep — `var(--pad-ramp` etc.); if no, the reason with the number that says so.

## Rules

`framework.css`, `core/`, `ext/`: read only. Write `public/imagine/design/size/**`, one name in `public/imagine/design/page.js` `children:`, this task dir. Private server `PORT=8099 node server.js` (kill the pid you started; never port 80; never the owner's tabs). Never `find /`; never spawn agents; never `git stash`/commit. Budget ~300k tokens. Report in ≤ 8 plain lines: the candidate's lines, the verdict, the before/after medians at 1280 and 3440 as one line each, what would change if it lands.
