# How a chat is made: mic to screen

The whole path of one spoken sentence, with the file that does each step. Line numbers were read from the code on 2026-10-25; if one has drifted, the function name next to it is the stable part.

## 1. The pipeline

```
 CREATE     chat.js:72            Session.start() → POST /api/session/new
            Sessions.js:766       create(): the v-… id, session.jsonl, prewarm the fast seat (:792)

 SPEAK      Dictate.js:575        transcribe(): audio → whisper-server /inference (:584)
            ext/Chat/Mic.js:20    guess_ms 900: the growing sentence is re-sent to Whisper
              │                   settled words + a still-moving "guess" tail
              ▼
 LIVE       ext/Chat/Chat.js:794  live({text, settled, guess}): ONE growing bubble (the draft)
 BUBBLE     Widget.js:507         the sheet's own live(): the draft sits inside the owner bubble
              │
              ▼
 SEND       chat.js:178           Session.say() → POST /api/session/say        (ext/Session/Session.js:79)
            Sessions.js:930       say(): writes the owner's {chat} line (:954 → write :601)
                                  and, for chat v2, opens/grows the Prompt   (assign_prompt :456, call :947)
              │
              ▼
 SAVED      session.jsonl         ONE file, Servex is its only writer
            {chat:{…}}            the words as lines (first view reads these)
            {tasks:{add:{type:"Prompt",…}}} + {"p-…":{raw:{push}}}   (Chat v2 reads these; Servex/agents/PromptLines.js)
              │
              ▼
 FAST       Sessions.js:970       hold_thought(): spoken lines wait; quiet 2.5 s → release_thought (:1103)
 ASSISTANT  Sessions.js:438       voice_say(): one message to the fast seat → {place} lines
              │
              ▼
 SMART      Sessions.js:255       WakePolicy flush → feed_smart (:265): pause 12 s, a question, its name, or each finished sentence (every: 1)
 ASSISTANT  session-smart.md      writes title, text, replies, tasks, questions with the item tool

 STREAM     Sessions.js:1468      GET /api/session/<id>/stream (EventSource)  ← new lines + a reply while it is written
 TO VIEWS   chat.js:275           Session.stream(…): {kind:"stream"} → panel.stream, {kind:"line"} → draw
            chat.js:153           Session.watch(file): polls the file every 1.5 s too; draw() dedupes
```

How the wire is explained step by step, with every claim footnoted: the readme's [How messages travel](../readme.md#how-messages-travel).

## 2. Two views of the same file

```
                      FIRST VIEW                          CHAT V2
files                 ux/Dictate/chat.js                  ext/Chat/v2/ChatV2.js
                      ux/Dictate/Widget.js                ext/Chat/v2/ChatV2Model.js
                      ext/Chat/Chat.js (the box)
reads                 {chat:…}, {place}, {summary},       {tasks:{add:{type:"Prompt"|"Question"|"Task"}}}
                      {refined}, {react} + the stream     and edits by id; nothing else
unit drawn            one bubble per spoken line,         one Prompt at the root, its replies/questions/
                      assistants as bubbles               tasks nested under it
live words            YES: draft bubble, gray guess       NO (⬜): the Prompt grows as Servex writes raw,
                                                          but there is no gray guess tail
raw vs cleaned        raw bubble swapped for cleaned      cleaned/refined shown, "show raw" one click down
the connection        Session.watch + Session.stream      JSONL.live(): the file is streamed, patched in place
where it is           ✦ sheet, drawer AI tab (default)    the "v2" chip on the sheet and the drawer, the session's
                                                          Chat tab (?chat_view=v2), /framework/ext/Chat/v2/
```

They differ in three ways: the first view shows **what was said** (a conversation of bubbles), Chat v2 shows **what it became** (a tree of Prompt → tasks); only the first view draws the live words; only Chat v2 can show a task checked off. Both read the one `session.jsonl`.

## 3. The class sketch, against the code

Starts from "The shape" in [proposal.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/proposal.md), corrected on 2026-10-25.

```js
class Session extends Task {        // ✅ core/Session/Session.js:18. (The proposal said ⬜.) Its file is session.jsonl.
  file                              // ✅ Servex is the only writer (Sessions.js write :601)
  tasks                             // ✅ Task's own list: Prompts, Questions, Tasks
  views                             // ⬜ no Stream | Threads | Structure choice; two separate views, first view and v2
  live                              // ⬜ not in the file: the live draft is only on the page (Chat.js:794 / Widget.js:507)
}
class Prompt extends Task {         // ✅ core/Task/Prompt.js:35
  raw, paragraphs, title, text, tasks, replies   // ✅ all there; raw & paragraphs by fast, title/text/tasks/replies by smart
}
class Paragraph extends Item {}     // ✅ core/Task/Prompt.js:10 (Paragraphs list :15, append/replace)
class Sentence {}                   // ✅ computed, never stored: Prompt.split :53, ChatV2Model.sentences :84
  // flag "?"                       // ⬜ the yellow "?" on a word that looks wrong
class Question extends Task {}      // ✅ core/Task/Question.js:7
class Reply extends Item {}         // ✅ inside Prompt.replies, with anchor {sentence, words?}
Task.by                             // ⬜ the mark that says "fast" or "smart" is not drawn
ChatV2 does not use Prompt          // ⬜ it folds lines by hand (ChatV2Model.js): decided, readme "Decisions"
```

## 4. The colours of the words you are saying

```
 gray trailing words   = Whisper's guess, still changing    .chatbox-guess      Chat.js:810 · Chat.css:534 (opacity .55)
 whole bubble faded    = sent, waiting for its cleaned line .chatbox-live-sent  Chat.js:801 · Chat.css:535 (opacity .6)
                         (small mark "cleaning…", after 2 s "sent, waiting"; Chat.js:802-803)
 black again           = the cleaned line from session.jsonl replaced it
```

## 5. How the item tool changes a chat

The assistants never type into the file. They call `item({path: <the session's page>, delta})`, and the tool appends one line to `session.jsonl`.

```js
item({delta: {tasks: {add: {type: "Prompt", id: "p-…", raw: ["…"]}}}})            // Servex does this one (PromptLines.add_prompt)
item({delta: {"p-1": {title: "Order of the cards", text: "the cleaned version"}}}) // set a title/text
item({delta: {"p-1": {tasks: {add: {title: "Show the life cycle"}}}}})             // a task under a Prompt; the answer carries its id
item({delta: {"p-1": {"t-9": {complete: {}}}}})                                    // complete it: the change is the CHILD's
```

The last line is the nested form: `{"<prompt>":{"<task>":{"complete":{…}}}}`. `ChatV2Model.edit` (`ChatV2Model.js:38`, the `is_kid` branch at :44) hands it to the task inside the Prompt, so the box is checked; an old build stored it on the Prompt and the task stayed open. The same tool adds a Question (`{type:"Question", text, from:"p-…"}`) and answers it (`{"q-…":{answer:{text, by}}}`). What the smart seat may write: the "Chat v2" section of `Servex/agents/session-smart.md`.

## More

[readme](../readme.md) · [Chat v2](/framework/ext/Chat/v2/readme.md) · [map of every piece](map.md) · [Debug tab](debug-tab.md) (each stage, live) · [wake policy](wake-policy.md) · [fast and smart seats](fast-and-smart.md) · [Whisper timeline](whisper-timeline.md) (guesses, finals, the 15 s cap, when a line is written)
