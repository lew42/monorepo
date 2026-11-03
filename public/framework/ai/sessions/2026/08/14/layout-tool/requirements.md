# layout-tool — requirements

## The ask (verbatim)

> i'm having major layout issues.
>
> let's make ext/LayoutTool
>
> look into the vision-* tasks in today's framework/ai dir  this is all about using claude's vision.
>
> the LayoutTool could use browser-based metrics (getComputedStyle? any real screen position, layout CSS, anything relevant to layout) for an entire dom tree (like the .app), or for a specific element.
>
> given any page, or element, we should be able to run a layout analysis.  we want to detect broken layouts, but we need some criteria.  some numerical tests could be run to red-flag obviously broken layouts - for example text butting up against a border with zero padding.
>
> here's what I want you to do:  create the LayoutTool, and generate a bunch of test layouts to test it against.  we generally want an overall layout score, as well as a report of the leading layout issues.  create bad layouts (obviously broken), as well as good ones, and test the different models ability to identify them.
>
> based on feedback from the ai, and comparing it to the numerical measurements, try to hone in on certain ratios for spacing, rhythm, etc.  rather than rely on AI to reason through all the measurements, it would be nice if the LayoutTool could, for example, compute padding (px) as a percentage of width (in px).
>
> i believe it's best to spawn fresh sessions for subsequent image requests, so you don't have to reprocess them all?  and similarly, it might be best to capture all images in one session, and then spawn a fresh session to analyze each image?
>
> we have a /layout-design skill, update that with info how to use this LayoutTool.
>
> consider how to handle responsiveness.  "robust" layouts should behave relatively predictably.  "broken" layouts are usually configured incorrectly.  and sometimes the precise width (in between 400 and 1920, for example), is what produces the edge case.
>
> i've thought we could, for example, run the numerical analysis at every px width, resizing computationally, to try and catch those edge cases?  the problem there, is that there wouldn't usually be anomalous behavior, only with strange edge cases.
>
> in the ext/LayoutTool, let's create a knowledge base of .md files to record layout lessons.  Use the LayoutTool/readme.md to index and summarize them.  Be careful with "always" and "never", but sometimes these words might be useful.  The idea here, is that the LayoutTool could become quite smart/efficient at finding and fixing broken layouts, based on heuristics and simple ratios, for example.
>
> work autonomously, create a /new-task , keep an eye on usage (plan to work through the 5h reset).
>
> maybe the LayoutTool's JS-based analysis could suffice, so the AI isn't even needed?  Just use AI vision to calibrate, if possible, or maybe as a backup.
>
> if you get the LayoutTool working sufficiently, try to use it on existing pages.  don't go editing any CSS just yet, so simply propose the changes.  there are many broken layouts on the site, and we want to detect them.  create a report page with links to all the broken layout examples on the site.
>
> Also, we don't have a great way for the UI to communicate with AI sessions.  Spawn an Opus agent, ask it to create a new task to design a socket -> cli injection for a claude session, so buttons and text inputs can communicate with claude sessions.  And ask it to integrate it into the new framework/ai task system, so we can chat with claude directly from the browser.
>
> When that system is functional, you could, if the LayoutTool needs AI, integrate a way to use claude to analyze a specific element, section, or page?
>
> Begin!

## Scope of THIS task

`ext/LayoutTool` — the analyzer, its test layouts, its calibration against AI
vision, its knowledge base, and a site-wide findings report. The socket→CLI
injection is a **sibling task** (`browser-cli-bridge`, spawned Opus) — this
task consumes it only if it lands in time.

## Prior art this builds on

`vision-sonnet` / `vision-haiku-opus` / `vision-report` (today). The report's
operative findings for this task:

- **Per-image cost is dominated by context accumulation, not the image.** A
  resumed session re-reads every prior image as cache-read, so cost grows with
  the *square* of image count. One fresh session per image keeps it flat (the
  1h prompt cache makes the system prompt a hit across sessions). This
  confirms Mike's hypothesis and is the capture/analyze split used here.
- **Opus for findings meant to drive fixes** (~$0.14/shot, fix-ready: where,
  why, against what spec). **Haiku only as a catastrophe smoke detector — do
  not trust its positive verdicts** (it called ~95–130ch measure "comfortable").
- Model consensus findings are the calibration target: clipped rails at 400px,
  over-wide prose measure at 1920, 39–45% dead right-hand space at 3440.

## Design decisions

- **JS-first, AI-as-calibrator.** The deliverable is a numeric analyzer that
  needs no AI at runtime. Vision is used to *derive and validate thresholds*,
  not to score pages. (Mike: "maybe the LayoutTool's JS-based analysis could
  suffice, so the AI isn't even needed?")
- **Ratios, not absolutes.** Every rule that can be expressed as a
  dimensionless ratio is — padding as a fraction of width, measure in
  characters, gap as a fraction of font-size — so one threshold holds across
  viewports and font scales.
- **Responsiveness = a width sweep with a coarse-to-fine bisect**, not
  every-px. A per-px sweep costs 1500+ layout passes to find the handful of
  widths where a metric actually jumps; sampling at a stride and bisecting
  only where a signature *changes* finds the same edges for ~2% of the work.
- **Test layouts are pages** (the one demo system): a dir under
  `ext/LayoutTool/tests/`, each with a known-bad or known-good verdict
  declared in the file, so the analyzer has ground truth to score against.

## Proposal / steps

1. Scope — read vision tasks, ext/layout, Page.css; design the metric set.
2. Build the probe: browser-side metric collection for a tree or an element.
3. Build the rule/score engine — dimensionless ratios, weighted score.
4. Generate the test corpus — broken and good layouts, declared ground truth.
5. Calibrate — run AI vision on the corpus, compare to the numbers, tune
   thresholds; measure agreement.
6. Responsiveness — width sweep + bisect for edge-case widths.
7. Knowledge base `.md` files + `readme.md` index + `/layout-design` skill update.
8. Run on the real site; write the broken-layout report page.

## File ownership

- This session owns everything under `public/framework/ext/LayoutTool/` and
  this task dir.
- The spawned socket task owns its own dir and its own ext.
- Driver scripts (playwright capture, CLI fan-out) live in the session
  scratchpad, never the repo.
