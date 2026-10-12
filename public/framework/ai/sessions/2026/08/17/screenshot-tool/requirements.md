# ScreenshotTool

Mike, 2026-08-17 (verbatim; the mastermind-process preamble and the dashboard/layout/skills asides live in the mastermind run task):

> design the screenshot tool to do what I thought I asked of previous mastermind: when we use the screenshot tool to analyze design/layout/css, (the DesignTool?), we want to log screenshots, and the design feedback from the AI.
> we could use different ai models for different results. and, we could use different prompts for different results. however, i believe a single prompt with multiple angles could suffice. and improving those prompts could improve outcomes.
> …
> This should be a way to analyze a screenshot. Maybe it's a dynamic tool? A past session seemed to wire up a ?screenshot query string that displays a claude session (scratchpad?)-based screenshot?
> We DONT want screenshots logged to the repo (not necessarily anyway).
> We DO want to be able to use the ScreenshotTool, either manually, or automatically (AI-driven). I'm not sure exactly how this integrates with the DesignTool. I'm not even sure what the DesignTool is currently doing (it was recently renamed from LayoutTool, and tries to do design/layout analysis via algorithmic/rules rather than ai inference). The last round tried to get me to judge 2 designs by picking the better one. This was not the way - they differ mostly, and each had a couple flaws. When I finally found some screenshot's raw analysis, the model (it didn't show me which was chosen) did a fantastic job interpreting the Layout, among other design aspects.
> This is the feedback loop we need.
> However, the regional aspect needs to be implemented. For example, if we screenshot the whole screen, and send it off, the ai does a great job of explaining what it's talking about. And maybe that would be enough to fix it. However, I'm thinking that we want to analyze each little container/card, first, at various resolutions.
> So, here's the task: figure out a way to automate the screenshot tool. However, I want to be able to browse the results, as I requested last time, and didn't get:
> I want to be able to see a report of every screenshot taken (reminder: I believe you can specify to playwright which region of the screen you want, or maybe you need an image crop tool to crop it to the screen coordinates for each component). I want to see the precise feedback given. I want to see the model used, and the token consumption. And, hopefully, a textbox where I can ask the same session a question about the image.
> Also, I want to see the prompts used. This is actually the most important part. Experiment with different models and different prompts, from short, simple prompts, to long detailed prompts. You're querying the AI for info about spacing, visual hierarchy, contrast, ui, ux, imagery, etc.. Honestly, we don't need a numeric score, although it doesn't necessarily hurt for some things. Maybe ask it specifically for things like, "identify misalignment", "identify missing background colors", etc.
> In any event, take screenshots! Try to conserve tokens, see if Sonnet can do it. Compare Sonnet and Opus, and maybe even run a couple with Fable, to see how their responses compare, but the results I saw from the recent autonomous run were pretty spot on (accurate, true).
> To clarify, the past round tried to condense like 5 design scores into one, and had problems getting consistency - which is no wonder. But it's not a single score. And we need the per-region specificity. The DesignTool should be able to identify major problems (we have a lot of them - empty spaces that should probably be filled, etc). Sometimes there's a tradeoff (you have to choose to either center a page, or let it sprawl to 100% width which is often too big).
> I strongly believe this is possible: you could set up a screenshot analysis system that can accurately correct and refine the CSS to produce amazing designs. It starts with ROBUST LAYOUT.
> Make skill improvements (add that to the mastermind skill, if it's not already) in skill/improvements.md.
> 1. screenshots are sometimes viewport dependent. however, often they're the same. and even if a component reflows, if it's a strong layout, it'll probably still be ok after reflow.
> how do we test components/layouts at different resolutions? How do we generalize layouts by their configuration (flex, gap, etc)? How do we identify clear rules, like "don't do this", "always do that"?
> As we ask the AI to process these images, we need to converge on a layout strategy.
> Part of this strategy is reviewing all the CSS. Is it necessary? Is it ideal?
> Part of this is reviewing the CSS strategy itself. Do we have the best instructions? If the css strategy doesn't say, we should try to minimize the amount of new stylesheets, new rules, etc. Whenever we reach for a brand new style, we should probably consider, "why don't we have this already"? Materials, Layouts, Themes... shouldn't that cover most of what we need?
> 2. We want to analyze (screenshot) all the parts of all the pages. Not ALL the docs pages, etc. However, as we fix some of the main template pages, it sort of automatically fixes all the derivations. We want to fix as much as we can, as quickly as we can.
> Figure out how to take sub-screen shots. Take screenshots at different resolutions. Maybe get the DesignTool to coordinate? If the MCP can control the width of a demo.stage(), for example, you could use the DesignTool to detect breakpoints within any component. taking screenshots above/below these breakpoints could reveal layout issues.
> Figure out how to fix layout issues, big and small.
> When you figure out how to do this reliably (maybe ask the image analysis Sonnet's for CSS improvement suggestions?) Maybe give an Opus and Sonnet the same image, tell it what page it's on (so it can try and figure out the CSS and whatnot)?
> Do this first, though, so it doesn't get confused, and so we get a nice design critique: Prompt it for design feedback, as discussed. Let it respond with words, so we have the record of what it sees. And then, ask it for CSS improvements (let it know which page it's on, maybe even let it access the page via MCP to inspect the elements, stylesheets, etc?
> Make sure to refine the css skill for minimalism. We want to reduce the number of stylesheets. We want to (slowly but surely) increase the usefulness and quantity of base styles. We want a minimal system that can be adapted for any situation.
> Ok, if you can get this working... Keep going! Analyze every page at every layout. Keep fixing CSS.
> IMPORTANT: Do not monkey patch everything. If you find the CSS fixes contribute more CSS, make the CSS cascade more complex, need complex selectors that are hard to read/remember what they're doing - these are all smells.
> Work autonomously, watch usage window. You are fable, you use a lot of tokens, so offload tasks. Don't worry about nesting tasks for now, just get things moving efficiently.
> In your ScreenshotTool, think about token consumption. I believe you'll want fresh sessions for each image, to avoid context pollution? Shouldn't smaller images require fewer credits? Remember, we want to log all screenshots. Maybe the screenshot tool can be a skill that gets invoked? I don't want you cooking tokens trying to browse the site, take screenshots, send them to minions...
> Offload tasks to minions to save our tokens!

## Scope (mastermind)

Deliverable: `ext/ScreenshotTool/` (or the name the design settles on) — capture regions × widths → ask a model (fresh session per image) → log `{shot, prompt, model, tokens, feedback}` → a browse page per run. Shots live outside the repo (gitignored). Design first (Opus), then build, then experiment, then use it to fix CSS causes.

Fences: per minion brief, appended below as they are issued.

## Mike, 2026-08-17 ~17:00 (verbatim)

> you can use screenshot analysis to improve any page, not just to find broken layouts, but listen to the analysis, try to get the image minions to recommend UI/UX/design fixes of all kinds.
> IMPORTANT: Separate "clearly broken" from "might be better". For all the "maybes", we want to devise a system to preview the recommended fix. The old layout/DesignTool stuff tried to do this. Maybe look at that.
> I'm feeling a Before + After UX that shows the change, with an accept button would be pretty sweet. That's how I'd like to run this framework/site. You find me improvements, I rubberstamp them.
> Continue! Good luck!! Delegate, save tokens!! Make sure to document what I've said, so you don't lose context.

Design consequences (mastermind): every finding carries a class — `broken` (fix now, log the diff) or `maybe` (needs a preview). Maybes become **proposals**: before shot · after shot · the CSS diff · Accept / Reject. Accepted → applied; rejected → recorded so the prompt learns. Look at what DesignTool already does for previewing a change before designing new.

## Design (mastermind, 17:15 — from [shots-history/proposal.md](../shots-history/proposal.md))

The finding that decides it: **~2,150 screenshots taken, 8 logged, 18 with prose feedback, 0 prompts in the repo.** Everything Mike asked for is already built somewhere (`Server/plugins/Shot.js`, `Screenshots.js` = the `?screenshot` route, `Ask.js`, `ext/Ask`, `ext/DesignTool/vision.js`, `audit/twin.js` = Before/After/Accept, `AITask/shots.js`); nothing keeps the record. So: **no `ext/ScreenshotTool` — build `ext/DesignTool/vision/`**: one headless runner outside the browser, `prompts/` in the repo, one JSONL line per shot, one browse page. Sonnet default ($0.035/image measured), fresh session per image (resuming one session cost 3.5× for worse independence), prose first, no score.

### Files (fences)

- `ext/DesignTool/vision/run.mjs` — the runner (Opus builds). `node run.mjs --pages <list|file> --widths 390,1280,3440 --regions auto --prompt critique-v1 --model sonnet --out /framework/ai/<date>/<slug>/` → `shots/*.png` (gitignored dir) + `vision.jsonl` in that task dir. Uses global playwright (Shot.js's settings: `waitUntil:"load"`, `BLOCKRELOAD`, `document.fonts.ready`, DPR 1, recycle context every ~40 navs) and `claude -p --output-format json` (Ask.js's invocation) with a **fresh session per image**. Whole page first, then `locator.screenshot()` per region; regions from `probe.js`'s node walk filtered to cards/containers (≤8 per page-width, min 120×80, no nesting), always logged with the page shot they came from.
- `ext/DesignTool/vision/prompts/<id>.md` — every prompt, verbatim, keyed by filename: `critique-v1` (short), `critique-full-v1` (one prompt, several angles: layout, spacing, hierarchy, contrast, alignment, empty space, missing backgrounds, UI/UX, imagery), `css-v1` (turn 2: given page URL + the region's DOM outline, propose `{sel, decl, why, class}`). The prompt asks for prose, then a JSON block of findings, each `class: "broken" | "maybe"`.
- `vision.jsonl` — one line per shot: `{"shot": {"at","path","hash","url","width","region":{"sel","box"},"page_shot","prompt_id","model","session_id","tokens":{"input","cache_write","cache_read","output"},"cost_usd","duration_ms","prose","findings":[{"class","what","where","sel","decl"}]}}`. `prompt_id` resolves to `prompts/<id>.md`; the runner also writes `prompts.json` (id → text) into the run dir so a run is self-contained.
- `ext/DesignTool/vision/page.js` (+ `browse.js`, `vision.css`) — the browse page (Sonnet builds): `?run=/framework/ai/<date>/<slug>/` → rows = thumb · url/width/region · model · tokens/cost · prose · findings (class badges) · prompt (expandable) · **ask box** = `ask(q, {resume: session_id})` from `ext/Ask`. Filters: page, width, model, prompt. Compare: same shot across models. Cloned from `ai/2026-08-17/vision-browse/row.js`.
- Phase 2: findings with `decl` render in `audit/twin.js` (Before/After) — `broken` → diff logged, `maybe` → twin + Accept/Reject, verdict recorded beside the finding.

Pilot run: 6 pages × 3 widths × (1 page + ≤5 regions), Sonnet, `critique-full-v1` → ~100 shots, ~$3.50; then the same 12 page-shots through Opus and 3 through Fable for the model comparison.

## Mike, 2026-08-17 ~18:00 (verbatim)

> that first page [/framework/ai/2026-08-17/] has 2 scrollbars. the long list of non-clickable things is rather useless... build into this design/screenshot analysis some UX please.. what is the purpose of this page? what are all the possible things I might want to see on this page? how do we most easily see an overview of everything (focusing on current/active for a dashboard), and also drill down or scroll down or click through to see more?

Consequence: the vision prompts get a **UX angle** — purpose of the page · is the most important thing first · overview vs drill-down · is everything that looks like a thing clickable · scroll regions (one, not two). The day page gets a UX redesign task (`day-page-ux`).

## Mike, 2026-08-17 ~18:10 (verbatim)

> screenshot those daily ai report preview cards, get ux recommendations. give the image minion all the potential fields, their range of values, what they link to. then test their linkage, and what it looks like (if it's a 2 column layout where the card acts as the nav). there's 0 space between the viewport top and date header?! surely they must have given feedback on that...
> how are the minions doing? are sonnet minions able to give accurate layout feedback?

Finding: none of ~12 model reads of the day page flagged the zero top space — a heading at the top of a crop reads as "scrolled". Fix: the runner prepends a context header (URL · viewport · top-of-page/unscrolled · region box) to every ask. Card UX folded into `day-page-ux` (field inventory → `card-ux-v1` prompt → region shots → linkage test → 2-column nav check).

## Mike, 2026-08-17 ~18:35 (verbatim)

> if smaller screenshots are less costly, try doing ui card analysis first? trying to analyze the whole page could be trickier? you could compare both options, maybe doing it all at once pans out.
> the one image prompt i read basically was, "give critique", or "what's wrong" but not necesarily how each thing could be better? Let's try to capture that with the feedback. and lastly, maybe you're still working on it, but after we capture the raw opinions, give it the code/page/file to look at, ask it to use/improve (via skill/improvements.md) css and layout skills. at that point, the recommendations become CSS fixes, or css-class additions/removals?
> can we get the sources for these images into either some sort of Panel or stage, in order to render one w/ w/o the change, or, for a page... maybe we need the devbar for proposed fixes
> however, let's be sure we're proposing the right fixes. if we get this all setup, and 90% of the recommendations are garbage, it's all for nothing

Answers so far (measured): a region crop costs the same as a page ($0.068 vs $0.087 — the bill is the answer + a fixed cache read, not pixels); a cropped card and the whole page gave the same verdict on the day cards. So: page first for context, cards for specificity, and the sweep compares both with numbers. Findings gain a `fix` line ("how it could be better"); turn 2 gives the model the page's CSS + the css/layout skills and asks for `{sel, decl}` and skill improvements; a **quality gate** (Opus referee rates a sample right/wrong/taste → precision) decides whether the preview (twin iframes or a devbar "proposals" toggle) gets built.

## The quality gate — result (vision-fixes, Opus referee, 2026-08-17 19:40)

**Findings precision 0.50 (74 findings, right/taste/wrong = 37/31/6); `broken` alone 0.60; fixes 0.62; CSS decls 0.17 (n=6 — the model declined to write CSS for 68 of 74, 18 times correctly quoting the files back). Gate failed; no preview built.** Consensus does not help: seats agreeing ≥2/3 were right 0.33 of the time, lone seats 0.66 — agreement is shared generic bias (dead space, pale grey, unframed cards — deliberate here), and each real bug was caught by exactly one seat. Zero contradictory directions. Dominant failure: **taste filed as broken by a critique that cannot see design intent** (the 40em measure, the `--subtle` bump, `.wall`'s `align-items: start`); turn 2 spends its budget retracting. Best moments: a live data bug found by eye (step bar coloured while the label reads 0/5); turn 2 retracting its own turn-1 finding after reading the CSS.

What this means for the loop: **image critique → Opus harvest that reads the code → cluster-level fix** is the pipeline with evidence (waves 1–3: 21 defects fixed, 3 regressions caught, broken 34 → 29 → 10 on comparable pages). **Model-written CSS is not ready.** Next: a design-intent header for turn 1, `retracted` as a first-class outcome, `critique-full-v3` (written: five failure modes + never state a pixel distance) replayed on the same pngs and refereed on findings only; the browse page must show `fix`/`decl`/`rung`.

**v3 + intent header (19:55):** precision flat (0.62 → 0.55), false modes gone (wrong 3 → 1) — but recall collapsed (`broken` 5 → 0; the day page's two real bugs silenced). `critique-full-v2` stays default; intent should downgrade class, not suppress. Prompt experiments paused; the harvest is the gate.
