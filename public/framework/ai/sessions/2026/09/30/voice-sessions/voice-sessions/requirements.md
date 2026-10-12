# Voice sessions: requirements

Part of row 34 (`assistant-front`). The design, with a picture and a table, is [design.md](design.md). The owner's own words are the second half of [../audio/owner-words.md](../audio/owner-words.md). Every sentence is traced to an ask in refine/, refine-640/ and refine-655/ `coverage.md` (0 dropped); items 9, 12 and 15 came from those traces.

Report to the current Servex mastermind (mastermind-servex-6 until its successor tells you its id). The design card is `2026/09/29/audio-a-library-of-audio-parts-transcrip`.

**Where this brief and design.md's table disagree, the table wins** (it was rewritten at 7:10 PM). In particular: sessions are saved at `<home page>/ai/<session>.jsonl`, not `logs/voice/`; navigation lines go inside the session file, not `logs/nav/`; and item 11's copy of every line into page.jsonl is replaced by ONE pointer line per session.

## Deliverables

1. **The ✦ rail is the global assistant.** It opens a voice session for the whole browser. The mic stays on while the owner navigates, so it lives in the app shell and never in a page. Prove it on the phone (:8137): start the mic, follow three links, and show that the words are still arriving.
2. **The nav log.** On every link click or route change, a browser session appends `{at, session, from, to}` to `logs/nav/<session>.jsonl` through Servex.
3. **`follow`, a Servex tool.** `follow({agent, path, gather_ms})` tails a jsonl and sends each new line to the agent through `send_to_agent`. It gathers a burst, or anything that arrives while the agent is busy, into ONE message; `unfollow` ends it. This is the answer to the owner's question "can an agent tail a jsonl?": no, but Servex can, and it hands the lines over as messages. Prove it: 20 lines appended in 1 second arrive as one message.
4. **Two assistants per voice session.**
   - **Fast:** it corrects incoming text. It starts when the mic turns on and stops when it turns off.
   - **Smart:** it is the first-level mastermind. It reads intent, refines the ask (`refine.mjs` for long dictation), makes sure nothing is dropped, and spawns task masterminds that any later session can reach.
   Both follow the voice log and the nav log through `follow`.
5. **`Usage.pick(role)` in Usage.js.** It picks the model from the week's numbers: late in the week with usage to spare, a higher model; early in the week or near the pace line, a lower one. The smart assistant and spawn_agent's default call it. It is code, never a memory note.
6. **Reconcile the names.** "Global assistant" now means a voice session's smart assistant. Update the roles page and the chat-room "who does what" section of row 34 so that each role has one name.

7. **Per-voice-session roles (the owner, 6:40 PM, see "Continued" in owner-words.md).** Fast = transcribe and show words fast, nothing else. Smart = hears everything, decides, launches masterminds, routes technical questions. Rename the current roles to match: "manager" and "master assistant" go.
8. **The directory mastermind replaces the per-page manager.** A tool (or a `spawn_agent` mode) that spawns a FRESH mastermind for a path, loading CLAUDE.md, the readme chain root → dir (`load_module`), the skills and the tools, with the prompt "you're a mastermind working in <dir>". The smart assistant routes technical questions to it. Prove it: ask one about /framework/core/Page/ and show it answered from the readmes.

9. **Two refine asks not spelled out above** (refine/brief.md, asks 3 and 4). The echo pattern: the smart assistant and a mastermind both follow the voice session at once, not one of them. And the voice-session mastermind is distinct from a task mastermind but shares its skills: say which skills, on the roles page.

10. **The directory mastermind rules (the owner, 6:55 PM; design.md's second table).** Fresh by default and never forked, with a deterministic opening prompt so the cache is shared. Reuse the same mastermind for follow-ups in one voice session. Questions change nothing; merges update the docs. page.jsonl is the per-path live log. Minions coordinate through a shared log. `follow(path)` itself is built first, as its own task (`../follow/requirements.md`); build on it.

11. **One global session, filed by page (the owner, 7:05 PM; design.md, "One global session").** The mic never stops on navigation. Each line is stamped with its path and written to the session log AND copied into that path's page.jsonl, where the page's AI tab shows it. All chat lines (text, voice, AI replies) use the one `chat` shape in design.md, rendered by ext/Chat. Prove it: talk across three pages, then show each page's AI tab holding only the lines said there, and the session log holding all of them.

12. **Provider-neutral loading (refine-640/brief.md, ask 7).** The directory mastermind's loading uses only plain files (the readme chain, CLAUDE.md or AGENTS.md, the skills), with as little config and as few dependencies as possible, so the same system works whatever the model or provider (see Servex/ext/openrouter/).

13. **One kind of session, with Recent sessions (the owner, 7:10 PM).** ✦ starts a new session, which remembers its home page, follows navigation and never stops while recording. "Recent sessions" (from ✦, and in each page's AI tab, filtered to sessions started or discussed there) lists session summaries; continue any one by id.
14. **Our own session record.** A session is our jsonl plus a `.summary.json`, not a Claude Code transcript, so an OpenRouter or home-built harness session resumes the same way. Map each session to whatever model session backs it (a Claude session id today) inside the file.

15. **One log per task (refine-655/brief.md, ask 17).** The owner asked whether each task folder uses a page.jsonl. Measured at 19:25: all 31 of today's task folders have one, and 24 also have a task.jsonl, so a task keeps two logs. Decide which one is the task's live log that agents `follow`, write the decision with `decide`, and say it in the AITask readme. Asks 18 to 21 (the Dictate page's modes, and ums left in) belong to the audio task's b-refine; asks 25 and 26 (a dual mode) were rejected by the owner at 7:10.

16. **Key sessions by Host from day one** (the owner's project question; ../servex-mastermind/project-aware.md, decision 1). A session's home, and the socket carrying it, resolve from the request's Host to that project's root, so two sites' sessions never mix. Make ServexProxy.js pass `x-forwarded-host` instead of deleting `host`.

## Fence

The app shell and rail (with mobile-nav, if it hasn't landed: ask me first), the Router's route-change hook, `Servex/` (the new tool, the assistants), `Usage.js`, and the roles page. Restart Servex with `node Servex/sustain.mjs --restart` as your last step, and tell me.

**Shares files with** task-mastermind-audio (the ext/Chat widget in the drawer and sheet, `audio/c-chat/requirements.md`) and mobile-nav (the rail). Start the rail work only after both have merged, and build on ext/Chat instead of beside it.
