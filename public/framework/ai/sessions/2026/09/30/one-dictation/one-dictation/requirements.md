# Dictation: one chat widget, everywhere: requirements

The owner, 2026-09-30, verbatim in `../audio-consolidate/owner-words.md` (read every section from "hamburger menu" on). Re-read them before each step.

**Why a new task:** task-mastermind-audio-consolidate got these asks from 14:45 onward but never posted a plan. Its context was full (about 196k) and it kept resuming idle. The owner, 16:35: "This is exactly what it was like an hour ago. I thought we were working on this." **This is the owner's top priority.**

## The goal: ONE component, one set of code
Dictate + ChatPanel, on the **fast/smart voice-session pair** (`ext/Session`), the same on every surface:
1. the mobile ✦ rail and sheet (`ext/drawer/rail.js`): today it's on the pair;
2. the desktop ☰ drawer's AI tab (`ext/drawer/tabs/ai.js`): today it's a separate wrapper with a model switcher;
3. the AI 2 card sidebar: today it's the OLD single per-card assistant (`assistant-<card>`, via Servex `Layers.js` page-ai), with a model chooser;
4. the dev bar's own chat mode.

## Asks
1. **Retire the second and third paths.** The old per-card assistant and the model chooser fold into the pair. `/api/page-ai` feeds the same pair.
2. **Responsive:**
   - on desktop, it fills the full height of the right sidebar;
   - on mobile, it's a resizable sheet that can collapse to one line;
   - it's a single column and minimal to render.
3. **Sessions stay GLOBAL** and never cut off on navigation. Log invisible, timestamped `nav` events (page, card) and `pause start` / `pause end` into the fast assistant's context. Refinement goes to the card that's selected at the time.
4. **Chat and card are ONE content model** (`../inbox-ext/requirements.md` item 9). The chat renders the same content widgets from JSONL lines; there is no private bubble format.
5. **The font is the site's (Montserrat).** Today the sidebar isn't, because of `font: inherit` outside the element that sets the font. Fix it by where it mounts, not by adding CSS.
6. **Document it:** one page showing the live widget on each surface, and how each surface creates it.
7. **Next, NOT now:** threaded replies (click a bubble to open its thread in place on desktop, or taking over the sheet on mobile); the sheet as a routable page.

## How
Foundational, so NO cap, but move fast:
- Post a plan on a card within the first few minutes, as a picture plus what changes on each surface and what could regress. Then build right away in small merges, without waiting for approval (CLAUDE.md law 5).
- Screenshots of every surface at 400 and 1920 before each merge. Never regress the mobile rail, which the owner uses.
- Read what the old task already built first (`../audio-consolidate/`, `left.md`, its commits), and reuse it.
- Message servex-mastermind-opus with the link as each merge lands.
