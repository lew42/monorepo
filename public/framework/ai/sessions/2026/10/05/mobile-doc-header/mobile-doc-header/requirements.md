# Module pages on mobile: the title and tabs take half the screen

## The owner, 2026-10-04, on the Dictate page on the phone (verbatim excerpts)
> I really don't like how much space we're wasting on the title and the tabs ... by the time we get to any content on that page, we're already like halfway down the page

> maybe on mobile ... the tabs turn into a drop down ... it would be ideal if this was just the same markup and then it can go from desktop where it lists all the tabs to mobile

> an alternative for the mobile is to make them scroll ... We could try scrolling first. The problem is ... the title is next to the tab. So the tabs actually get only a portion of the mobile device to side scroll.

> a header plus a drop down all in one where the header represents what you're looking at and if you click on it you can see where it exists in the hierarchy and switch to another item

## Want
1. **First, the cheap fix:** under ~600 px, the title and the tab row stack (title on its own line, smaller); the tab row takes the full width, one line, scrolls sideways (no wrap). Same markup, CSS only, in the Doc page header (find the shared component that draws every module page's title + tabs: ext/Doc; law 6, fix it once).
2. **Then, if it fits the budget:** under ~600 px, the title itself becomes the switcher: "Dictate · Overview ▾" opens a list of the tabs (and the parent page), same markup, CSS + a few lines of JS. If time runs short, ship step 1 only and leave step 2 as a To-do line in ext/Doc's readme.
3. Measure the header height at 400 px before and after (shots at 400 and 1200 of /framework/ux/Dictate/ and one other module page).
4. Load the `navigation` and `layout` skills first. Worktree → check_page → merge.mjs.

Budget: $4 (a guide)
Model: Sonnet, ONE agent. Never the mcp__playwright tools.
