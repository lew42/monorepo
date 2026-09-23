# Why the card's top edge holds still

The owner asked for one thing twice: *"see that card updating in real time. Without shit
jumping around."* So this page has exactly one hard requirement — **while you are talking, the
card's top edge stays at the same y**. Text arrives under it; nothing above it moves.

That is easy to say and easy to lose. Four separate things could have broken it, and each one
is closed by a different rule.

## 1. The microphone is taken out of flow

`ux/Dictate` writes live text into *itself* while you talk. It names the engine it found, says
"listening…", can show a stop-after-a-pause countdown, and — the worst case — prints a two-line
error in plain English ("The browser is not allowed to use the microphone…"). In normal
document flow every one of those changes the head's height and shoves the card down.

So the head (`.talk-head`) is a fixed-height box, and the whole microphone widget inside it is
`position: absolute`. Now nothing Dictate ever says can move anything, because it is not part
of the layout at all. The cost is that the reserved height is a number rather than a
measurement, so it is deliberately generous — 7.5rem, and 11rem below 40em where the status
text wraps. If Dictate's own controls change, re-check both.

The alternative considered and rejected: measuring Dictate's height and locking it with
JavaScript. It would waste no space, but it turns a CSS guarantee into a timing problem — the
measurement would have to re-run on every font load, every resize and every status change, and
a missed one is exactly the jump this exists to prevent.

## 2. The heading is drawn empty from the first frame

The assistant's title arrives about two seconds after you stop speaking. If the heading were
*inserted* then, it would push every line of text down at the moment you were reading it.

So `.talk-title` exists from the very first frame, holding the placeholder `listening…` and a
`min-block-size` of exactly one line. The title fills it in place. The chip row
(`.talk-chips`) is reserved the same way for the same reason, even though it sits below the
text and could only ever grow downwards — the rule is easier to keep than to keep exceptions to.

## 3. The heading can never wrap

A reserved one-line box is no use if a long title turns it into two lines. `.talk-title` is
`white-space: nowrap` with an ellipsis, so its height is fixed regardless of what the assistant
sends. The whole title is still readable — it is on the element's `title` attribute, so hovering
shows it.

## 4. The page never scrolls you

Nothing here calls `scrollIntoView`. A page that scrolls itself moves the card relative to the
screen, which is the same complaint even when the layout is innocent.

## The measurements

Chromium headless with `--use-fake-device-for-media-stream` playing the JFK clip into the page,
at 1280×900 and 400×900. The card's top edge was read ten times across one session — five of
them *while the clip was playing* — as `getBoundingClientRect().top`, as an offset inside the
page's own box, and alongside `window.scrollY`, so a page scroll could never be mistaken for
the card moving.

| reading | card top (1280) | card top (400) | card height (1280) | what was on screen |
| --- | --- | --- | --- | --- |
| before the press | 256.3 | 329.63 | 115.19 | empty card |
| talking 1 | 256.3 | 329.63 | 157.3 | grey guess, growing |
| talking 2 | 256.3 | 329.63 | 157.3 | grey guess, growing |
| talking 3 | 256.3 | 329.63 | 169.34 | first sentence solid |
| talking 4 | 256.3 | 329.63 | 211.45 | **title arrived in place** |
| talking 5 | 256.3 | 329.63 | 238.53 | second guess running |
| stopped | 256.3 | 329.63 | 227.25 | two sentences solid |
| +6s | 256.3 | 329.63 | 227.25 | — |
| chips +3s | 256.3 | 329.63 | 232.27 | **chips arrived** |
| chips +8s | 256.3 | 329.63 | 232.27 | third chip |

The card's own height goes from 115px to 232px — the text really is arriving — and the top edge
does not move by so much as a hundredth of a pixel at either width. `window.scrollY` was 0
throughout, and the document never scrolled sideways at 400. No console errors in either run.

The chips were proved with one extra sentence pushed into Servex's log the same way a dictated
one is (same endpoint, same `via: "whisper"`), because the JFK clip is a quotation: it names no
*thing*, so the assistant correctly gives it a title and no `name` lines at all. Everything
after that POST — Servex, the fast assistant, the live stream, this card — is the real path.
