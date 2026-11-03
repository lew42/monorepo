# mastermind-design-crawl — run task (overnight, remote cloud session)

The owner's ask, verbatim (2026-09-01, going to bed):

> let's try to make a web crawler that browses web pages, takes screenshots, and attempts to do a few things:
>
> 1. document the journey on the /imagine/ page. all sites, screenshots, etc.
>
> 2. analyze the responsive design: pay special attention to the type of navigation (top nav, sticky, left sidebar, tabs, etc), page layout (how many columns, unique scroll behavior, etc). spawn minions, and have them create a vocabulary with tags, and tag sites with these unique features. have them find the blog, docs, etc. make special note of multi-level navigation.
>
> 3. spawn a minion to look at the ext/DesignTool. it hasn't been used in a while. I think it needs improvement. the method of creating its feedback might have been flawed, we're still getting a lot of broken layouts (cramped, missing padding, etc).
>
> I want you to design a layout system that doesn't fail. part of that is identifying when/where it fails, and how to improve it. I think a big key to that, right now, is utilizing the space properly. if it's 3440, and we have only a few things, they don't need to be small. layout is scale, visual hierarchy, etc.
>
> the DesignTool, I believe, is setup to take screenshots and based on that feedback, try to determine the actual css adjustment. I think part of the problem, was that we don't have a clearly defined "proper" design, to follow. I tried to identify the comfortable range (padding as a percentage of width, for example). 1% is almost always too little, 30% is almost always too much. unless you're using a section that spans a large area, but then it's not technically padding.
>
> maybe do this: spawn a minion just for padding. have him browse all the pages, and study the css, strictly paying attention to only padding. take screenshots, and try to get an idea for where padding fails, build examples of different scales of padding, etc.
>
> have a minion study scale. when/where do we use smaller or larger scales? maybe we're missing opportunities here.
>
> have a minion study layout, navigation, color, typography, etc. have them each make an /imagine/ page, that's what I'll be checking in the morning.
>
> if you still have token allowance, you could send these design minions to a handful of other websites to screenshot and analyze these questions. that could be a great way to find new or better ways.
>
> as always, they should start with the simplest examples, use previews as navigation when possible, and focus on proper/simple categorization.
>
> have a minion study UI/ux, on our site, and others. specifically menus, panels, buttons, icons, UI controls, etc.
>
> I feel like we need some alternate UI themes. how do we create a better theme browser for all these things? maybe column based pages can allow us to organize trees of themes? can we algorithmically create themes?
>
> Approved base: `michael/dev` (confirmed by owner). Work pushed to `claude/web-crawler-design-analysis-og8s3r`.

## Environment deviations (logged as assumptions)

- **Remote cloud container**, not the owner's PC. The container is reclaimed after the
  session, so — overriding the mastermind skill's "never commit or push" (written for the
  PC where the owner drives git) — this run COMMITS AND PUSHES to the session branch.
  Never to main.
- No `claude-usage.py` here; budget is the session token allowance (15M, ~14.98M at open).
  Same pacing rule: front-load, taper toward morning.
- Dev server: `node server.js` (Linux, port 80) — ours alone; no owner tabs to protect,
  but minions still must not kill/restart it (shared with sibling minions).
- Screenshots via pre-installed Chromium + Playwright (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`).

## The design-study fleet — file fences

Each study owns `public/imagine/design/<topic>/` exclusively, plus its own task dir.
Nobody edits another study's dir. The mastermind alone edits shared files:
`public/imagine/design/page.js` (hub), `public/imagine/page.js`, this task's files, commits.

Studies: padding · scale · layout · navigation · color · typography · ui-controls ·
external crawl (vocabulary + tags) · DesignTool critique (proposal, not surgery) ·
theme browser exploration.
