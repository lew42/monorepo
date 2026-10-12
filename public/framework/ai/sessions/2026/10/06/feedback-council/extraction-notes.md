# Extraction notes — feedback council, 2026-10-06

Source: `words.jsonl` (642 lines, 2026-09-25 through 2026-10-02), a raw grep of page.jsonl card
chat, `.claude/prompts/<day>.jsonl` session logs, and task-notifications.

**Noise vs signal:** of 642 raw lines, 281 were unique owner-attributed lines after stripping
task-notifications, prompt templates and duplicate card/page-log echoes of the same words — the
rest (roughly 360 lines, 56%) were task-notification payloads, cleaning-prompt templates sent TO
an LLM, swear-word/filler transcription test runs ("Wow.", "hello there", "can you hear me?"),
or exact repeats of a line already logged via both the raw prompt feed and the card's page.jsonl.
Of the 281 owner lines, most were live-transcribed fragments of a handful of long dictation runs
(the 2026-09-25 Now-card tab request, the 2026-09-29 layout-explorer/sidebar monologue, and the
2026-09-30/10-01 Dictate UX critique session) — genuinely new, distinct ideas numbered below.

## New asks (E1-E25)

- **E1** — padding opt-in (`.pad` class), not default — words.jsonl:30,23 (Now card, 2026-09-25)
- **E2** — chat stays a persistent sidebar, not a tab — words.jsonl:9-13 (Now card)
- **E3** — tabs should be real routed pages, not hash ids — words.jsonl:16-22 (Now card)
- **E4** — invoke the layout/padding skill on every layout; maybe fold into paging skill — words.jsonl:26-28 (Now card)
- **E5** — dictation-to-chat and assistant-response latency (4-5s) — words.jsonl line ~97 (2026-09-29 new-card)
- **E6** — selected-element context never reaches the LLM prompt — words.jsonl:108-116 (2026-09-29, from-dictation-to-a-brief card)
- **E7** — three-column layout explorer spec (left categories / center preview / right children) — words.jsonl:114-116
- **E8** — study HTML nesting of sidebars/drawers site-wide; name reusable sidebar slots — words.jsonl:114-116
- **E9** — ext/Chat as a reusable streaming extension — words.jsonl ~line 340 (2026-09-30 Dictate)
- **E10** — fast/smart assistant icons double as avatar+username inline — words.jsonl ~line 340
- **E11** — lightweight emoji reactions for simple acknowledgments — words.jsonl ~line 328-332
- **E12** — referenced things become persistent context cards — words.jsonl ~line 944 (2026-10-01 Dictate)
- **E13** — standing browsable catalog of layout/navigation patterns site-wide — words.jsonl ~line 376
- **E14** — tasks nest visibly under their parent card so none get lost — words.jsonl ~line 376
- **E15** — ask-by-voice sheet header/back-button/gear+more menu cleanup — words.jsonl ~line 732
- **E16** — sticky auto-scroll-to-bottom with a jump-back button — words.jsonl ~line 664-668
- **E17** — "clean transcribe" mode toggle (no editable text area) — words.jsonl ~line 680-688
- **E18** — duplicate/doubled messages bug — words.jsonl ~line 636, 960, 1024
- **E19** — mic start/stop sound cue missing — words.jsonl ~line 700-704
- **E20** — pulsing-dot mic indicator replacing the level bar — words.jsonl ~line 716-732
- **E21** — text-to-speech "Voice" class/system — words.jsonl ~line 892-920
- **E22** — card mentions must be real hyperlinks — words.jsonl ~line 1079-1092
- **E23** — mic listening independent of sheet open/close state — words.jsonl ~line 868-876
- **E24** — remote/mobile access via Cloudflare Tunnel — words.jsonl ~line 788, 120
- **E25** — threaded replies to a specific card/comment — words.jsonl ~line 792-800

## Checked against the existing 44 (asks.jsonl)

Did not re-create: the page.jsonl tab system as a general concept overlaps A2/B3/B16 (already
tracked show-don't-tell and chat-width asks) but the Now-card-specific "tabs as real pages, not
hashes" (E3) and "chat stays a sidebar not a tab" (E2) are concrete, new directives not covered by
wording in A-D. The mobile split-chat layout (B16), the AI-written-log-JSON-should-be-computed
audit (D-series/law 7), the page_read format addition, and the Known Issues page system were all
checked and are substantively the same as existing A-D asks, so nothing new was written for them.
