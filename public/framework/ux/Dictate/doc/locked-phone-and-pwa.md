# Does a browser voice session survive a locked phone or a home-screen PWA?

**Short answer:** assume no. A browser voice session should be treated as foreground-only: when the screen locks, the mic and the speech are likely to stop, and the stream likely drops. Nothing in the repo handles this yet, and no web API in this list reliably fixes it.

## What the repo does today

- `capture.js` opens the mic with `getUserMedia` and an `AudioContext` at 16 kHz. It has no `visibilitychange`, no wake lock, and no resume after suspend.
- `ext/Session/Session.js` (`stream()`, the `wait` variable, :179-199) opens the `EventSource` to Servex and, on a closed stream, reopens it after 1 s, doubling to 15 s. (`ux/Dictate/Connection.js` shows the link lights and a retry button; it has no backoff of its own.) That helps after a dropped network, not after the OS freezes the tab.

## Facts by platform (how sure)

- **Wake lock (`navigator.wakeLock`)** keeps the screen from dimming while the page is visible. Android Chrome 84+ and iOS Safari 18.4+ support it, including home-screen apps. It is released when the page is hidden, and it does not stop a lock. **It does not help a locked phone.** (High: spec behaviour; support figures come from web.dev and caniuse search results, read as snippets, not fetched: unverified, check the current support tables before relying on a version number.)
- **Android Chrome, locked screen:** mic capture in a backgrounded tab is likely stopped or silenced. I found no source that proves the exact behaviour. (Low to medium: no direct test found.)
- **iOS Safari, locked screen or home-screen PWA:** reports say the mic track is muted by the system when the screen locks, and PWA audio stops when minimised. The sources were mostly WebView issues, so they apply by analogy. (Medium.)
- **AudioContext on iOS:** it suspends between user gestures and needs a tap to resume. Expect to resume it on every return to the page. (Medium-high: two blog write-ups found by search, by Matt Montag and Sam Eddy; not fetched, so no link.)
- **`speechSynthesis` (read-aloud):** the first `speak()` needs a tap on iOS. Background playback is unreliable on both platforms. (Medium.)
- **Installing as a PWA** does not change any of the above. The manifest and icons only make it launch like an app. (High.)

## The cheapest test on the owner's phone

One page, no code change needed: a short demo that starts the mic and a 1 Hz `EventSource` tick, logs each second's timestamp, and plays a spoken count. Lock the phone for 60 seconds, unlock, and read the log. Run it once in Android Chrome and once in iOS Safari, both as a tab and as a home-screen app. Its output shows which of the four (mic, AudioContext, stream, speech) stopped and when.

## Recommendation

Build the voice session to resume on `visibilitychange` (re-open the stream, resume the `AudioContext`, reacquire the mic) and tell the owner the phone must stay unlocked while talking. Confirm with the test above before promising anything else.
