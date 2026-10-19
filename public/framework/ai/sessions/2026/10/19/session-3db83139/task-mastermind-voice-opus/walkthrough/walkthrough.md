# One spoken sentence, end to end

You say **"All right, create an opus mastermind."** Below is what happens to those words, in order. Every JSON line is copied by a node one-liner from `public/ai/v-timqv56.jsonl` (the voice session file), lines 30–36. Long `cues` are trimmed with `…`.

```
mic ─▶ Whisper ─▶ Dictate.js ─▶ Session.say() ─POST─▶ Sessions.say() ─▶ v-timqv56.jsonl   (the one file)
                                                                          │    │    │
       Widget.js draws bubble ◀─ chat.js ◀─ Session.watch() polls 1.5 s ◀─┘    │    └─▶ assistants woken
       {place} changes bubble ◀──────────── voice assistant writes {place} ◀───┘
       smart reply bubble     ◀──────────── smart assistant writes {chat}
```

The session file is the single source of truth. The browser never talks to the assistants. It writes a line, then reads the file back.

---

### 1. Whisper hears you — `Dictate.js`

The browser sends a recording to the local Whisper server and gets text back. Whitespace is tidied, then the text goes to whoever is listening.
[`Dictate.js:546`](/framework/ux/Dictate/Dictate.js)

```js
const body = await r.json();                                   // Whisper's JSON: { text: " All right, create an opus mastermind." }
const text = (body.text ?? "").replace(/\s+/g, " ").trim();
this.on_whisper?.({ kind, ms: …, text, raw: body.text ?? "", … });
```

Whisper's own reply has a `text` field, and `on_whisper` passes it along with timing. (I did not find a saved copy of this exact reply, so this step shows the shape, not a copied line.)

---

### 2. The browser says it to Servex — `Session.say()`

The widget calls `Session.say(...)`, which POSTs to `/api/session/say`. For a spoken line it also attaches the mic's state (`floor`) and how long you have been quiet.
[`Session.js:68`](/framework/ext/Session/Session.js) called from [`chat.js:148`](/framework/ux/Dictate/chat.js)

```js
export const say = ({ session, path, text, via = "text", raw, floor: f, cues, … }) => {
	return post("say", { session, path, text, via, …(f ? { floor: f } : {}), …(cues ? { cues } : {}), …quiet_ms });
```

---

### 3. Servex writes the `{chat}` line — `Sessions.say()`

Servex builds one line, appends it to the session file, wakes both assistants, and (for speech) holds the words until you stop talking.
[`Servex/agents/Sessions.js:843`](/Servex/agents/Sessions.js)

```js
this.write(s, { chat: line });                       // the owner's line, appended to the file
this.refine(s, line).catch(…);                       // background clean-up (step 8)
this.wake(s, "fast"); setImmediate(() => this.wake(s, "smart"));
```

The real line (file line 30):

```json
{"chat":{"at":"2026-10-19T17:30:37.220-05:00","session":"v-timqv56","path":"/","from":{"kind":"owner"},"via":"voice","text":"All right, create an opus mastermind.","floor":"speaking","cues":{"mic_on_at":"…","pauses":[…],"speaking_ms":2270}}}
```

`floor: "speaking"` means you are still talking, so the assistants are **not** told yet. The line is held ([`Sessions.js:859`](/Servex/agents/Sessions.js)):

```js
this.hold_thought(s, line);   // keep the words
if (floor !== "speaking" && …) this.release_thought(s, …);   // not yet: still speaking
```

Your next two fragments arrive (lines 31 and 32, `"for you to use for our following questions."` and `"here."`). Then the browser reports silence, and Servex writes a `{quiet}` line (file line 33). That line is never drawn. It releases everything held, in order ([`Sessions.js:1024`](/Servex/agents/Sessions.js)):

```json
{"quiet":{"at":"2026-10-19T17:30:44.184-05:00","ms":2500,"path":"/ai/"}}
```

---

### 4. The page polls the file — `Session.watch()`

Every 1.5 seconds the browser re-fetches the whole file (never cached) and hands any line it has not seen to a callback. Lines you just wrote come back this way too.
[`Session.js:165`](/framework/ext/Session/Session.js)

```js
const res = await fetch(file, { cache: "no-store" });
const lines = (await res.text()).split("\n").filter(l => l.trim());
for (; seen < lines.length; seen++) on_line(JSON.parse(lines[seen]));
```

`chat.js` is that callback. `draw(line)` sends each line to the right method: `{place}` to `panel.say({place})`, `{refined}` to an entry, and a `{chat}` to `panel.say({chat})`. It also skips your own line if it was already drawn the moment you sent it, so no duplicates.
[`chat.js:165`](/framework/ux/Dictate/chat.js) and [`chat.js:205`](/framework/ux/Dictate/chat.js)

```js
if (line?.place) return void panel.say({ place: line.place });
…
panel.say({ chat: line.chat });
```

---

### 5. The bubble is drawn — `Widget.js` and `speak()`

`Thread.draw()` calls `speak()` from `ext/Chat`. Same speaker, less than a short gap since their last bubble: the sentence is added as a new **paragraph in that bubble**, not a new bubble.
[`Widget.js:286`](/framework/ux/Dictate/Widget.js) · [`Chat.js:194`](/framework/ext/Chat/Chat.js)

```js
const bubble = this.follow(() => speak(this.$bubbles, { cls: "chatbox-you", who, text: chat.text, sender, at, id: at, … }));
// in speak():  const last = join ? mergeable($box, sender, at) : null;   if (last) { pieces.push(piece); … }
```

That is why your three fragments (lines 30–32) show as one bubble with three paragraphs. The row is also remembered by its time (`this.lines.set(at, { bubble, … })`), which later `{place}` lines use to find it.

---

### 6. Marks: ✓ and ? — `ux/Understand`

After drawing, the widget asks `ux/Understand` whether your sentence made sense, and appends a small **✓** (clear) or **?** (unclear) to the bubble. This does not touch the session file.
[`Widget.js:192`](/framework/ux/Dictate/Widget.js) (the `mark()` method; called from `draw()` at [`Widget.js:298`](/framework/ux/Dictate/Widget.js))

```js
fetch_marks([text]).then(out => { const m = out?.marks?.[0]; … " ?" or " ✓" });
```

---

### 7. The voice assistant places it — `{place}`

A small assistant reads each finished sentence and writes one `{place}` line saying where it belongs. `re` is the `at` of the sentence it is about.
[`Widget.js:461`](/framework/ux/Dictate/Widget.js)

```json
{"place":{"re":"2026-10-19T17:30:37.220-05:00","to":"card","where":"beside","title":"Create opus mastermind","edit":"nothing"},"by":"voice-assistant-v-timqv56","ts":"2026-10-19T22:30:46.569Z"}
```

The widget looks up the bubble by `re` and acts on `to`:

```js
if (to === "paragraph" || to === "card") this.split_paragraph(re);   // cut the bubble here
if (to === "card") { b.classList.add("ux-dictate-placed-card"); … b.prepend(titleDiv); }   // card + title
```

- `same` changes nothing. The next line (file line 35) is `{"place":{"re":"…17:30:42.435…","to":"same","edit":"nothing"}}` for the fragment "for you to use…", which stays inside the card's bubble.
- `card` splits the bubble at your sentence, adds the title **Create opus mastermind**, and styles it as a card (`where` says which side).
- `edit` can be `improve` or `both` to replace the text with a cleaned version. The raw words stay kept in `said`.

---

### 8. The smart assistant replies — a `{chat}` line

Once the held words were released, the smart assistant answers. It writes its own `{chat}`, and the poll draws it as a reply bubble (`chatbox-reply`) through the same steps 4–5. `re` is the owner line it answers, the last held one (`"here."`):

```json
{"chat":{"at":"2026-10-19T17:30:46.906-05:00","session":"v-timqv56","path":"/","from":{"kind":"assistant","id":"smart","agent":"session-smart-v-timqv56"},"via":"text","text":"I can't do that. Claude's weekly allowance is spent, and the standing rule says I never spawn anything on a Claude model, which includes Opus.\n\nI can start a task mastermind on an OpenRouter model instead … ","re":"2026-10-19T17:30:42.979-05:00"}}
```

---

### The separate `{refined}` line — `Sessions.refine()`

Also in step 3, `refine()` ran in the background. Haiku cleans the sentences and groups them into short sections. When done (seconds later, not tied to the reply), it appends one more line that points back at your sentence by `re`.
[`Sessions.js:549`](/Servex/agents/Sessions.js)

```js
this.write(s, { refined: { at: now_ms(), re: line.at, sentences, sections, flags, cost_usd } });
```

A real one from this file (line 24, for a different sentence, "Or am I? It looks like it.…"):

```json
{"refined":{"at":"2026-10-19T17:30:02.606-05:00","re":"2026-10-19T17:29:33.945-05:00","sentences":[{"n":1,"text":"Or am I?"},…],"sections":[{"id":"sec1","heading":"Where you are","items":[…]}],"flags":[…],"cost_usd":…}}
```

---

**One thing to remember:** every step after the Whisper reply is a line in one file. If something is wrong on screen, read that file first: was the `{chat}` written, was a `{place}` written, did `re` match an `at`?

Read-only note: no code was changed. Line numbers were checked against the files on 2026-10-19.
