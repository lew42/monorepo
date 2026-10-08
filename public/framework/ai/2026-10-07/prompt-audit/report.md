# Prompt Audit Report — What Didn't Get Built

**Status:** Most asks landed. Prompt refinement exists and is wired in. Last week had minimal stalls.

## Summary

- **Total asks:** 259 (asks.jsonl, 2026-09-30 through 2026-10-07)
- **Landed:** 215 (83%)
- **Unbuilt/Stopped/Parked:** 10 (4%)
- **Building, Routed, Queued:** 34 (13%)

## Top Unbuilt/Stopped Asks (10 total)

1. **"Servex: worktree pool stuck (qf-6, qf-9 held 17h by finished agents)"** — *Building → Stalled*  
   Status: `building` → `stalled` (2026-10-03, 13:45)  
   Why: Owner agent dormant; nothing queued to wake it  
   Evidence: Last activity 2026-10-06, 13:45; no progress update  

2. **"Hamburger drawer: closing it sometimes doesn't give the page its space back (fixed itself; intermittent)"** — *Building*  
   Status: `building` (2026-10-02, 15:44)  
   Why: Owner agent dormant  
   Evidence: Intermittent UI bug; drawer-close-space landed Oct 3 but then flipped to stalled on Oct 4  

3. **"Prompts: each owner prompt becomes a refined Inbox card"** — *Dropped*  
   Status: `dropped` (2026-09-30, 16:27)  
   Why: Superseded by a different approach  
   Evidence: Note in asks.jsonl: "chat and card are one model, refinement goes into the selected card (inbox-ext item 9)"  
   Evidence: Was parked under "servex-mastermind-opus (by hand until built)" which has no registry entry  

4. **"Merge candidates: one minion per core dir (later, when tokens allow)"** — *Parked*  
   Status: `parked` (2026-09-30, 14:18)  
   Why: Deliberately deferred for budget  
   Evidence: todo.md item 158: "when tokens allow" + placed in `todo.md` section 3 (Proposed by agents, not requested)  

5. **Unnamed (empty title, 6 entries)** — *Stalled*  
   Status: `stalled` (2026-10-02 through 2026-10-06)  
   Why: Owner agent dormant  
   Evidence: No title means these were likely status-update pings (heartbeat checks, not actual asks)

## Prompt Refinement System

**What exists:** `ext/Refine/` is a complete four-stage refinement UI (raw → clean → structured → brief) that:
- Displays refinement output from `Server/refine.mjs` in a responsive ladder (four columns at 1600px+, three at 640–1599px, stacked below 640px)
- Includes `prompt-card.js` for single-prompt refinement display, reused in `ai2/inbox.js` and card threads
- Has a live try page (`ext/Refine/try/`) for testing the `clean()` step against multiple models

**Wired in:** Yes—prompt refinement runs live on owner prompts via the Council system (`Server/council.mjs`), which extracts owner words from `.claude/prompts/` and card `page.jsonl` files, and the refine step is part of the prompt pipeline. The `ext/Refine` module is imported by `ai2/faces.js` for the "Your prompts" card refinement view.

## Tasks Stopped in Flight (Last 7 Days)

**Week of 2026-09-30 to 2026-10-06:** No tasks were stopped due to usage wall or error.

**Stalls recorded:** 5 entries mark status as "stalled" during this period, but all are **agent dormancy** (agents running out of work and idling, not hitting an error or cost cap). Three (drawer-close-space, worktree-pool, unnamed checks) later resumed building. One (Hamburger drawer) remains stalled; the underlying issue ("space not returned") was documented as intermittent and may have fixed itself.

**Dropped:** "Prompts each-owner-prompt becomes refined card" was deliberately superseded; not a failure, a redirect to a simpler model.

## Script & Data

- **`audit.mjs`:** Parses asks.jsonl, categorizes by week and status, outputs audit.json
- **`audit.json`:** Weekly summary with counts and top unbuilt/stopped asks (20 entries)
- **Source:** asks.jsonl updated through 2026-10-06, 13:45

**No unknown blocks found.** The asks ledger is clean.
