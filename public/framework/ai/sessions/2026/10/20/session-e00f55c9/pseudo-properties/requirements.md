# Document V1's "pseudo properties", and plan V2 and V3 on one list (you are a mastermind, on Sonnet)

**The owner (2026-11-01, 21:18, relayed by the web voice session):** the biggest item is to unify V2 and V3 and make chat and messages coherent: data structures, transcript streaming and how often each part runs. They want a real list (messages, prompts, sentences by id), not V1's "pseudo properties". "Please DOCUMENT the pseudo-property system so everyone knows the term." Source: [../dictation-v3/owner-notes-2026-11-01-2040.md](../dictation-v3/owner-notes-2026-11-01-2040.md), items 28–29.

## 1. The doc (first, small)
Write `public/framework/core/Session/Chat/doc/pseudo-properties.md`. A pseudo property is a `{chat}` or `{place}` line in a voice session's `session.jsonl` that replays as a set on a field the Session class doesn't really have. Cover, verified against the code with file:line:
- which code writes each kind (`Servex/agents/Sessions.js` `say()` and `line()`; the fast seat's `{place}` through the item tool);
- which V1 readers draw them (`ux/Dictate/Widget.js` and the others; grep them, about 20);
- why it's a problem (order, no ids, edits that move bubbles, no single list);
- how `session.messages` replaces it (`core/Session/Chat/readme.md`: dual-written since b35ee6370, `{place}` mirrored since 9165c4e6c);
- the plan for V1 to switch over (not yet).

Link it from `core/Session/Chat/readme.md` and `ux/Dictate/doc/map.md`. Docs only, so commit by path straight to `michael/dev` and push.

## 2. A one-screen plan: V2 and V3 on `session.messages`
Write `core/Session/Chat/doc/views-on-messages.md`:
- what each view reads today, and what it should read;
- how live updates stream (the Store delta, `live()`);
- how often the fast and smart seats process (the owner's wake rules are in `ux/Dictate/doc/turn-taking.md`);
- the steps, one merge each.

Ask `mastermind-dictation-v3` (it owns the views; `send_to_agent`) before you finish, and fold in its answer. Plan only; don't build.

**Fences:** no `python -`, commit by path, no code changes. **Budget:** about $5. When done, report to vscode-mastermind in 3 lines.

## A step in the plan: the fast seat's comma feed (owner item 30, from mastermind-dictation-v3, 21:20)

- **The smart seat already matches the owner's wake rule.** `Servex/agents/WakePolicy.js` has `WAKE_DEFAULTS.every: 1`, so it wakes on each finished sentence, plus on "?", on its name, and after a 12 s pause.
- **The fast seat does not.** It is woken once per owner line. `ext/Chat/Mic.js` sends one line per sentence (`sentences_per_send: 1`), so the fast seat only ever gets whole sentences. The owner wants it to get pieces at a comma, a full stop or a "?".
- **The existing switch won't do.** Mic's `send_on_comma` cuts the *send* itself, so it would also split the owner's bubbles into fragments.
- **The step:**
  - Mic posts each sub-sentence piece of the live text as its own event (for example a `piece` line), separate from the message.
  - `Servex/agents/Sessions.js` routes only those pieces to the fast seat (`voice_say`, around line 445).
  - Messages and the smart seat stay per sentence.
  - It's a medium change. Put it after the `session.messages` cut-over, so it is built once, on the new data.
