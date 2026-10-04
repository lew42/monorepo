# Dev shell polish, one chat everywhere, and notifications you can't lose

Start after push-to-talk lands (same area).

## The ask (owner, 2026-10-03, dictated)
> The dev shell (Ctrl+\): we have a footer, a header, a page tab that doesn't stick to the top. The scrollable area should be the tab contents, not the whole thing: the tabs are the nav, you swap without scrolling to the top. I really like this dev shell: it's the right spot for analytical stuff, but we need to work on it. The assistant/dictate there has a microphone but it's clearly not the same widget: it should be the whole chat widget with Dictate built in, the global smart + fast assistant session loaded automatically. Right now there's old stuff and a very small log. We should track which surfaces use which module (usage of our modules).
> The resize handles: the framework's handle doesn't follow my cursor; the dev shell's handle looks cut off: I only see the right half of the pill, the main page content sits on top of it; it should be the opposite. Maybe a couple of pixels of padding on the main page area so the handle doesn't sit over the page's scrollbar.
> Notifications when a change I asked for is made: Figma's are clunky and disrupt the workflow. An in-page overlay, unobtrusive, never shifting layout, temporary. It goes into that page's history/activity so it's never lost (I hate how a missed Windows notification is hard to find). Even better: an arrow pointing at the thing I described, "fix" with a progress bar, filling as the task goes (minions loaded, code written, branch merged). Really positive feedback that we're on the same page.

## Do
1. **Shell layout:** tab bars stick; only each tab's body scrolls. Fix the clipped resize pill (stacking order: shell rails above the page) and the framework rail's handle not following the cursor; keep the handle off the page scrollbar.
2. **One chat:** the shell's dictate/assistant tab IS the drawer's chat component (Dictate inside it), on the global session. Remove the old widget. Add a module-usage list (which surfaces mount Chat / Dictate) to the Dictate docs page, computed by a grep script, not by hand.
3. **Notifications:** a `ux/Notice` overlay (fixed, no layout shift, fades), every notice also appended to that page's activity log and listed in its Activity tab. Then the "fix this" pointer: given a selector and a task dir, an arrow + label + progress bar beside the element, the bar driven by the task's `step`/`steps`.
4. Screenshots at 1200/1920/3440, shell open and closed.

## Fence
dev/DevShell, dev/DevBar (tabs), core/Shell only for the handle bug, ux/Notice (new), this task dir. NEVER the mcp__playwright tools. Model: Sonnet. Budget $12.

## Owner addition (same day): no custom CSS; the base system in dark mode
> The dev shell chat sidebar should be the exact same UI as every other instance of the dictation widget. Dark mode should just apply. All our dev bar custom CSS: phase it out and lean into the base system in dark mode. The dev bar isn't using the theme fonts (the default font is fine, I'm not opposed). We don't want custom CSS for hardly anything. If something is missing from the framework's basic toolbox, think about adding it there, for everyone. If we don't need the CSS, delete it and use the nearest thing from the toolbox. That's been the whole point of our UI and CSS strategy.

5. **Audit `dev/DevBar` + `dev/DevShell` CSS:** list every rule; for each, delete it (the base/dark theme already does it), replace it with a toolbox class, or, if it's genuinely missing and reusable, move it into the toolbox (`framework.css` / `styles/`) under its proper layer. Report the before/after line counts on the card. Dark comes from the base dark theme (`light-dark()` tokens), not dev-only colours.
