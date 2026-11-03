# critique-blog — adversarial critique of the homepage and the blog

## The ask (verbatim)

> TASK — adversarial critique of today's two headline deliverables: the homepage (`/`) and the blog (`/blog/` + all six posts + section pages). The owner's standing directive: "analyze any of the things you've made, and suggest improvements."
>
> METHOD: browse everything a first-time visitor would — cold, at 400/1920/3440, light AND dark: the homepage fold, every post read top to bottom (prose quality included — flag anything that reads AI-generic, overclaims, or under-links), the og: cards (curl each post's raw HTML — is the image real, the description right?), the section rails, the reading layout at 3440 (does the right rail earn its keep on every post?), clicking through to the things the posts link. Then rank what you'd IMPROVE — each item: what's weak, why it matters to a hiring visitor, the concrete fix, effort (S/M/L). Look especially for: sameness across posts (five posts with identical shapes read as template output), dead air at 3440, images that don't earn their bytes, claims a hiring engineer would test and find wanting, the `.demo-note` tint-band-stops-short issue (known — check how visible it really is on the homepage and posts).
>
> Deliverable: 10-20 ranked items as `log` lines in your task.jsonl (`#rank where - weakness - fix - S/M/L`) + keeper screenshots of the top 5 issues + the 3 things that are genuinely GOOD (name them; the next wave must not break them). Two numbers that agree: items logged vs items in your report count. Report: top 5 improvements one line each, the 3 keepers, the sameness verdict, the og-card verdict.

## Scope

READ-ONLY except this task dir. No edits to `public/blog/`, `public/page.js`, or anything else —
this task produces findings, not fixes.

## Rules honoured

- The :80 dev server is DOWN and stays down. A private one runs on 8095 and is torn down at landing.
- No owner tabs driven — headless Playwright / `shot` against 8095 only.
- Scratch screenshots in the session scratchpad (`crit-blog-*`); keepers copied here.
