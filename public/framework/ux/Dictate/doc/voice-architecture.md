# The voice UI: classes, who owns what (2026-10-09)

The owner's complaint: Dictate, Refine and the right-hand drawer each show "a dictation widget", and they look like copies. This page names every piece once, says what it is for, and says which one orchestrates. Written from the code, before any change; the first slice is built (see "Built").

## The classes

```
Dictate                     ux/Dictate/Dictate.js        THE mic engine: record, send to Whisper, hand back words.
 └ ComposerMic              ext/Chat/Mic.js              Dictate, writing into a chat composer instead of a box.
Connection                  ux/Dictate/Connection.js     The row of steps: Mic → Level → Whisper → Transcript → Refine.
VoiceStrip                  ux/Dictate/VoiceStrip.js     THE compact panel: Dictate + Connection + live guess, fixed size.   ← new
Widget                      ux/Dictate/Widget.js         The chat-shaped panel: bubbles on top, a composer (box, mic, Send) below.
ChatPanel / Composer        ext/Chat/                    The bubbles and the typed box that Widget (and the AI tab) are made of.
DrawerTabs                  ext/drawer/tabs.js           The right-hand sidebar: tabs AI, Sessions, Dictation, Settings, Admin, Element.
DrawerRail                  ext/drawer/rail.js           The phone's bottom bar (the ✦ button) that opens a sheet.
 └ DrawerRailSheet*         ext/drawer/rail.js           The sheet: V1 → Sheet → Panel → Chat (each extends the one before).
Refine (RefineDemo)         ext/Refine/RefineDemo.js     One page that USES a VoiceStrip and then refines the text.
```

## Who composes whom

- **`Dictate` is the only engine.** Every mic on the site is a `Dictate` (or `ComposerMic`, its subclass). Nothing else records.
- **`VoiceStrip` is the dictation panel** (compact, no chat). It owns a `Dictate`, a `Connection` and the guess line. Two templates: `full` shows the five-step row (Refine), `compact` shows one plain sentence (a small demo, the drawer's header).
- **`Widget` is the chat panel**: bubbles plus a composer. It is for talking to an assistant, so it is not a `VoiceStrip`, and a `VoiceStrip` has no bubbles.
- **The drawer and the phone sheet are containers, not widgets.** They hold a `Widget` (AI tab, sheet) or a `VoiceStrip` (a Dictation tab, later). A container decides where a panel sits and which page it is about; it never draws a mic itself.
- **The orchestrator is the page** (`RefineDemo`, `DrawerTabs`, `DrawerRail`): it picks a panel, passes `$input`/`deliver`, and reacts to the callbacks. `VoiceStrip` and `Widget` only report.

## What is a copy today, and what to do

| Looks like a copy | It is really | Decision |
|---|---|---|
| Refine's mic | a `Dictate` (was hand-wrapped) | now a `VoiceStrip` — built |
| The Dictate page's demo box | a bare `Dictate` | now a compact `VoiceStrip` — built |
| The drawer's **Dictation** tab | the playground widget (`pg.widget()`), the heaviest of the lot | keep as the debug view; **next**: put a compact `VoiceStrip` above it as the tab's live-transcribe |
| The drawer's **AI** tab and the phone sheet | `Widget` (chat) | already the same class; they stay `Widget` |
| The small AI button | `DrawerRail`'s ✦ | keep; it should open the drawer or just start listening |

The drawer should end up as a properties sidebar (page settings, session, files) that can hold a panel, not as a dictation widget itself. That is a larger move (a dozen callers in `rail.js`/`tabs/`); it is **not** done in this slice.

## Built (slice 1, 2026-10-09)

`VoiceStrip` (with `Connection` moved here from `ext/Refine`, `git mv`) is used by Refine (full template, tested headless at 1400 and 400, buttons do not move) and by the Dictate page's demo (compact). A mic error reads "The microphone could not start: <reason>" and is appended to the error log (`ext/ErrorLog`).

## Not built, in order

1. A compact `VoiceStrip` as the drawer Dictation tab's top, and the ✦ button's "just listen" mode.
2. Every page installs `ErrorLog.watch` (today only Refine and VoiceStrip report), and an error is tagged with its page so the page's own log shows it. Phones are off-localhost, where the dev socket does not exist, so they need Servex's `/log` route as the transport; production (static) writes nothing and should send nothing.
3. A status bar that is only the `VoiceStrip` `compact` sentence, replacing the several small status lines.

Mobile: the socket question is answered in [`mobile-socket-2026-10-09.md`](mobile-socket-2026-10-09.md).
