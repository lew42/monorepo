# ext/Refine: verify the owner's rules, find the dropped sentence, take mobile shots, propose a redesign

Owner ask: voice 6e9eb755, logged in [../task.jsonl](../task.jsonl). Background: [/framework/ext/Refine/doc/how-it-works.md](../../../../../ext/Refine/doc/how-it-works.md) (read it first, then the source it cites).

## Facts first, in `public/framework/ext/Refine/doc/audit-2026-10-15.md`
Message the voice mastermind as soon as part 1 is written; don't wait for part 3.
1. **Rules check.** For each of the owner's rules, give: present / partial / missing, the file:line, and one sentence.
   - The cleaned transcription is near-verbatim to raw Whisper. It only capitalizes, drops filler words, and upgrades references when confidence is high. Nothing else is removed.
   - Chunks go to the LLM one sentence at a time (maybe one comma phrase), never word by word, because Whisper amends itself.
   - The flow is raw, then clean, then refined prompt.
   - Chunking is configurable and has a good default.
   - Mentions: a control character (`@`, `/`, `!`) plus a path becomes a linked block that refers to a file-system thing, and cleaning may convert text into those.
   - Is "clean" an LLM or a plain function (a filler list)? The page said "no model": say which code path produced that.
2. **Bugs.** The first sentence "Can you hear me?" vanished from the cleaned transcription: find why (quick_clean filler list? the sequence guard dropping the first Whisper reply? an LLM dropping it?). The text area seems to clip: find the CSS or the class causing it. Fix each bug if the fix is small and safe (worktree, check_page, merge); otherwise describe it.
3. **Classes.** Which classes handle dictation (mic, then local Whisper, including the dropped connection), cleaning and refinement. Then what is documented and what is missing.

## Then
4. **Mobile screenshots.** Shoot `/framework/ext/Refine/` and `/live/` at 400 wide (use `mcp__site__shot` or Playwright headless; never the owner's tabs). Save them beside the audit doc and embed them.
5. **Redesign proposal** (`doc/redesign.md`, a proposal, not built yet). The owner finds the step-one dictation widget too wordy and not compact: it looks like a custom template. Propose one compact page that keeps the flow visible as raw, then clean, then refined, mobile first, reusing existing components (one of everything). Give a sketch, which classes change, and the smallest slice.

## Rules
- Sonnet. Commit each step. Do not restart Servex (the voice tunnel). Link the new docs from `ext/Refine/readme.md`.
- Post progress as `page_add` cards on `/live/` (short: the headline plus a link).
- When done, message mastermind-voice-20261015 with five lines: the rules table summary, the bug causes, what you fixed, the redesign headline, and the screenshot links.
