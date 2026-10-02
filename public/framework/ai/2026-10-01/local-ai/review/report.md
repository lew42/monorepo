verdict: fix
1. [fix] The Local Models page says "No local model file was found on disk" in every shot, but `C:\llama\models\qwen2.5-coder.gguf` exists (report-sonnet.md, and provider.js's own MODELS table). `page.js` swallows a failed `GET /api/local-chat` with `.catch(() => {})` and then shows the "no file" message. So when Servex is unreachable, or the route isn't live yet, the page tells the owner something false. Show "couldn't reach Servex" for a failed fetch instead (page 8; shots/…-ai-local/1920.png, the band under the intro).
2. [fix] The owner's first ask was that /framework/ai/local/ be "a report about … all the local AI stuff that I have". The page is only a chat box. The inventory (the programs table, the models table and the total disk used, all already in report-sonnet.md) is not shown on it, or linked from it (Requirements, Phase 1).
3. [fix] Phase 3 ask 4 (`generate_image` into a page's folder plus a page.jsonl card, callable from voice, with the cloud fallback) and ask 6 (the cloud image batch test at /framework/ai/images/) were not built. The landing line says "ComfyUI images are investigated and logged, not built" (Requirements, Phase 3 asks 4 and 6).
4. [fix] The test ladder ran one test (h1-page) on one model (qwen2.5-coder), standalone rather than through spawn_agent, and it failed with pass 0. Ask 3 also wanted gemma-3-4b and gemma-4-E4B tried, plus a finding on "what they CAN do" (search, list, summarise, brainstorm, a redundant vote). Neither is there (Requirements, Phase 3 ask 3; results.jsonl, the new line).
5. [fix] The Ollama + Qwen tool-use problem was not tested with a known tool call. It only exists as written steps in build/requirements.md §5 (Requirements, Phase 2 ask 4).
6. [note] At 3440 the page is one narrow column on an empty screen: empty 0.837 (Layout 1; shots/…-ai-local/3440.png).
7. [note] The last card is an empty framed strip: a 30px band with ink 0 at 400 (layout.json bands[4]). That is the `page_work` box with no matches. It should hide itself, or say "no work yet" (page 9).
8. [note] The intro paragraph is 79 words, over the 60-word limit, and it describes behaviour the reader could see (Words 3; shots/…-ai-local/400.png, band 2).
9. [note] The qwen h1-eval page shot is a 404 ("Page Load Error"). That is expected for an eval fixture nobody declared as a child, but it means the shot proves nothing. It is left out of the systems below.

Widths: all four, 400, 1200, 1920 and 3440, because a new page (/framework/ai/local/) and a change to the /framework/ai/ children list are page-layout changes.

## Requirements
- P1 "a page … framework/ai/local … a report about every … local AI stuff" — no — the page holds a chat and a work card, with no inventory (shots/…-ai-local/1920.png)
- P1 "two minions, one free and one sonnet … compare" — no — only report-sonnet.md exists in the task dir, with no report-free.md and no comparison
- P2.1 "smoke-test each runner … get the working ones working" — partly — llama-server answers `/v1/messages` (llama/readme notes). Ollama, LM Studio and ComfyUI were not smoke-tested.
- P2.2 "a chat harness on /framework/ai/local/ reusing the ONE chat component" — yes — `page.js` uses `ChatPanel` with only a new `deliver`. But the picker shows no model in the shots (finding 1).
- P2.3 "a LOCAL PROVIDER … local/MODEL in tiers.js" — yes — Servex/ext/local/provider.js plus Agents.js and tiers.js. It is not restarted into the shared Servex yet (results.jsonl note).
- P2.4 "revisit the Ollama + Qwen tool trouble … test with one known tool call" — no — the steps are only written down (finding 5)
- P3.1 "Servex runs llama-server … start, stop, swap, one model, unload when idle, RAM/VRAM on the process monitor" — mostly — Process.Llama has swap and `start_idle_watch` (LLAMA_IDLE_MINUTES 10). The diff shows no VRAM figure on the monitor.
- P3.2 "the same Claude Agent SDK harness … check /v1/messages first" — yes — checked, so no shim was needed, and `ANTHROPIC_BASE_URL` goes through LocalProxy
- P3.3 "run the same test ladder … record beside the cloud ones … find what they CAN do" — no — one test, one model, pass 0 (finding 4). A models.json row was added.
- P3.4 "images on any page" — no — not built (finding 3)
- P3.5 "load on demand, unload after idle" — yes for llama-server; n/a for ComfyUI, which was not built
- P3.6 "a cloud image BATCH test … /framework/ai/images/" — no — not built (finding 3)

## Page structure
- page 1 — yes — "Local Models" plus a description that says what the page does (1920.png, top)
- page 2 — no — no concept tiles; the page opens with a 79-word paragraph
- page 3 — yes — intro, then the model picker, then the chat, then the work card
- page 4 — n/a
- page 5 — yes — `local` was appended to /framework/ai/'s `children:`
- page 6 — n/a
- page 7 — yes — the plain page in the AI shell, with no CSS of its own
- page 8 — no — the "No local model file was found on disk" message is false when the fetch fails (finding 1)
- page 9 — no — the empty work strip (finding 7)
- page 10 — no — the intro describes the flow in prose
- page 11 — no — the picker, chat and work regions have no section titles
- page 12 — n/a

## Navigation
- nav 1 — tabs (INBOX/LOG/SYSTEM, from the AI shell) and a sidebar (the site tree)
- nav 2 — yes — layout.json tab_rows 1 at every width
- nav 3 — yes — these are the shell's existing routed tabs, unchanged
- nav 4 — yes — three tabs
- nav 5 — yes — the sidebar sits beside main at 3440 and folds to ☰ at 400 (sheet.png)
- nav 6 — yes — nothing moves above the chat; replies arrive inside ChatPanel

## Layout
- layout 1 — no — one column, with empty 0.837 at 3440 (finding 6)
- layout 2 — yes — Rail + content (the AI shell)
- layout 3 — yes — the reading column is right at 400 and 1200; it is narrow at 3440 (finding 6)
- layout 4 — no — the picker is a bare `.pad` region floating outside any card (1920.png, band 3)
- layout 5 — yes
- layout 6 — n/a
- layout 7 — yes — no big_empty band; the largest is the intro, share 0.277 at 400
- layout 8 — n/a
- layout 9 — yes — the space is left as a gutter, and the measure holds (widest_text 713 at 3440)
- layout 10 — yes
- layout 11 — n/a
- layout 12 — yes — the two cards stand apart with a gap

## Sizing
- sizing 13 — yes — auto heights
- sizing 14 — n/a
- sizing 15 — n/a
- sizing 16 — yes — no surprise scrollbar in the shots
- sizing 17 — n/a
- sizing 18 — yes — overflow_x false at every width
- sizing 19 — yes — no new CSS

## Wrapping
- wrap 20 — yes — wraps lists only the chrome icon buttons (drawer-rail, chatbox-compose-more), which the shared component already had
- wrap 21 — no new wrap — mode-btn at 1.7 lines appears at 1200, 1920 and 3440, in the shared chrome, not this page
- wrap 22 — yes — the compose row sits on one line at every width
- wrap 23 — yes — 400.png stacks cleanly
- wrap 24 — n/a

## Spacing and padding
- spacing 33 — yes — left_stack p total 28 at 400 (under 3em)
- spacing 34 — no — the picker's `.pad` (div.c("pad")) indents its text 16px past the paragraph above at every width, and the chat sits in a `card pad` inside the page (1920.png, bands 3 and 4)
- spacing 35 — no — the picker is `.pad` with no ground or frame, so it is an indent with no reason
- spacing 36 — yes
- spacing 37 — yes — framework classes only
- spacing 38 — yes
- spacing 39 — no — the picker's `.pad` has the same ground as the page (1920.png, band 3)
- spacing 40 — n/a
- spacing 41 — yes — no new CSS
- spacing 42 — yes

## Colour and contrast
- colour 1 — yes — body ink on white; the muted picker message reads at 1920
- colour 2 — yes — white on the orange Send button is the shared component, unchanged
- colour 3 — yes — no literal colours
- colour 4 — yes — the cards are framed
- colour 5 — not measured — dark mode was not shot; no new colours were added
- colour 6 — yes
- colour 7 — yes
- colour 8 — yes — `p.c("muted", …)`

## Flow
- flow 25 — no — the chat, which is the thing you use, sits under a 79-word paragraph that fills about a quarter of the screen at 400 (share 0.277)
- flow 26 — yes — overflow_x false
- flow 27 — yes
- flow 28 — yes
- flow 29 — yes — ChatPanel's own behaviour
- flow 30 — yes — widest_text 713 at 3440
- flow 31 — n/a
- flow 32 — yes — the p left_stack is a single page layer

## Words
- words 1 — no — the "report" page shows no inventory, and the flow is told in prose (findings 2 and 8)
- words 2 — no — the regions have no titles; the paragraph explains the structure
- words 3 — no — the intro is 79 words
- words 4 — yes — "talk to a local model" comes across
- words 5 — yes — "Local Models"
- words 6 — n/a
- words 7 — yes — the page says "local model" throughout
- words 8 — no — the picker message points at "this page's readme" with no link. The readme's own `/Servex/ext/local/*.js` links are source paths, not site pages.
- words 9 — no — the readme has no picture beside it
- words 10 — no — the explanation comes before the chat
- words 11 — yes — full, plain sentences
