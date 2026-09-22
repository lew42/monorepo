The microphone, and nothing else: a 🎤 button that dictates into one
`<textarea>`. `reply.js` mounts it beside its reply button and `dictate()` mounts
the same one over a bigger box; it knows nothing about either.

## It is the browser's own ear, not a service

`SpeechRecognition` (still `webkitSpeechRecognition` in Chrome) is built into the
browser. Nothing is installed, no key is held, no audio is uploaded by us, and a
word appears in the box while it is still being said. Chrome on desktop and
Android have it; **Firefox and iOS Safari have nothing**, and there is no
polyfill — so `can_hear()` is false there, `mic()` returns `null`, and the caller
draws a line saying to type instead. A control that is present and dead would be
worse than no control. When a server-side transcriber would win instead:
[decisions](/framework/ext/Ask/doc/decisions/).

## Three things the API gets wrong if you write it from memory

1. **`onresult` hands you the whole list every time.** Only the results from
   `e.resultIndex` on are new, so folding all of them in repeats every sentence
   already in the box. The loop starts at `resultIndex`; that is the entire
   reason it is a loop.
2. **`continuous = true` does not mean continuous.** Chrome still ends the run
   after a few seconds of silence — which is to say, in the middle of a thought.
   `onend` restarts it whenever `listening` is still true, so only a real press
   stops it for good.
3. **Interim results are not final ones.** A result with `isFinal` false is a
   guess that will be replaced, so it is held in a local (`air`) and written after
   the settled text rather than appended to it.

## `input()` is a getter because the box comes after the button

A control draws its buttons above the box they fill, so `this.$input` does not
exist yet when `mic()` is called. `$input` may therefore be a **function** that
finds the box later, and `input()` resolves whichever it was handed. Two lines,
and they are what let the caller build the control top to bottom in the order it
reads.

## What was already typed stays put

`start()` captures the box's current value as `this.typed` and dictation lands
after it, with a space if one is needed. The owner reaching for the microphone in
the middle of a half-typed sentence is the normal case, not the exception.

## Improvements

1. **The restart on `onend` has no backoff.** A permission that is revoked mid-run
   raises `onerror` and `failed()` stops it, but a browser that ends the run
   instantly for any other reason would spin. A counter that gives up after a few
   immediate restarts would bound it. *(simple, speculative — not yet observed.)*
2. **`lang` is a field nobody sets.** It defaults to `en-US` and there is no way
   to change it from a page. One `assign` away whenever a second language is
   actually wanted. *(simple, speculative.)*
3. **No transcript of what was heard.** Only the final text reaches the box, so a
   misheard word cannot be traced back to what the browser thought it heard. The
   alternatives with confidence scores are on the result objects and are thrown
   away. *(medium, speculative.)*
