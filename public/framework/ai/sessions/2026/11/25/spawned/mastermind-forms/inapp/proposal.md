# Getting people out of in-app browsers (proposal; nothing built, no accounts or keys made)

Researched 2026-11-25. Brief: [requirements.md](requirements.md).

## One screen

- **Google sign-in cannot work in an in-app browser (IAB).** Google refuses OAuth in embedded user agents (`disallowed_useragent`); the Google Identity Services button is the same policy. Instagram, TikTok, Facebook, Snapchat, LinkedIn and YouTube all open links in their own view, with its own cookie jar, so the person is not signed in to Google there. Push on iPhone also needs the site added to the Home Screen from Safari.
- **There is no reliable programmatic escape.** Android `intent://` to Chrome works only *sometimes*; iPhone has none that survives app updates (sources say so plainly). So the escape has to be a message the person acts on, plus a fallback that does not depend on any trick.
- **Recommended flow (MVP):**
  1. A tiny detector (below) says "this is an IAB".
  2. In an IAB, replace the Google button with one instruction card: "Open in your browser" and the app's own menu path ("tap the ⋯ menu, then Open in browser"), with a screenshot-style hint per app.
  3. Android only: also show an "Open in Chrome" button that fires an `intent://` URL; if nothing happens in about 1 s, the instruction card is already there.
  4. Beside it on every platform, a small **"Not working? Send me a link"**: email first (free-ish), SMS second (5-6 cents). The link opens the person's default browser, where they are signed in to Google, then they press Continue with Google, add to Home Screen, allow notifications.
  5. The link carries a one-use handoff token that restores what they had done (answers so far), so they pick up where they left off.
- **Build first:** detector + instruction card + email link. **Try but do not rely on:** `intent://` on Android, `x-safari-https://` / `shortcuts://` on iPhone.

## What each app does (credence = how sure I am this holds today)

| App x platform | Sign-in with Google | Push / install | Escape that works | Credence, source |
|---|---|---|---|---|
| Instagram, iPhone | Blocked (WKWebView) | No push (not Home Screen); no install | App's ⋯ menu, "Open in external browser"; no code escape | High for block ([mojoauth, 2026-11-20](https://mojoauth.com/blog/in-app-browser-login-passkeys-oauth-magic-links)); medium for menu ([u2l](https://u2l.ai/blog/open-link-in-default-browser)) |
| Instagram, Android | Blocked (Android WebView, `wv`) | No install prompt; no push | ⋯ menu "Open in Chrome"; `intent://` sometimes works | High block; medium escape ([hackernoon, 2026-11-25](https://hackernoon.com/how-to-detect-instagram-facebook-and-tiktok-in-app-browsers)) |
| TikTok, iPhone and Android | Blocked | No | Menu "Open in browser"; sources say TikTok blocks programmatic escape | Medium ([u2l](https://u2l.ai/blog/open-link-in-default-browser)) |
| YouTube app (Shorts), iPhone and Android | Treat as blocked (own view, no browser cookies) | No | Not documented; assume the app's ⋯ / "Open in browser" if present | **Low**: sources only say links open in YouTube's in-app browser, not whether it is a Custom Tab or SFSafariViewController. A Custom Tab *would* share Chrome's cookies and allow Google sign-in, so test this one on a real phone first ([source](https://link.boo/guides/youtube-shorts-link-in-description)) |
| Facebook / Messenger | Blocked | No | Menu; `intent:` sometimes on Android | High ([hackernoon](https://hackernoon.com/how-to-detect-instagram-facebook-and-tiktok-in-app-browsers)) |
| Passkeys (any IAB) | n/a | n/a | Do not offer in an IAB | High: WebAuthn off by default on Android WebView, host-app-only on iOS WKWebView ([mojoauth](https://mojoauth.com/blog/in-app-browser-login-passkeys-oauth-magic-links)) |
| iPhone default browser (Safari) | Works | Push works only for a site added to the Home Screen (iOS 16.4+), permission asked from a tap inside that app; a Safari tab cannot even ask. Leave "Open as Web App" on (iOS 26) | n/a | High ([relaybell](https://relaybell.com/blog/ios-web-push-2026), [progressivewebapps](https://progressivewebapps.com/background/ios-web-push/)) |
| Android Chrome | Works | Install prompt and push work in a tab | n/a | High (platform behaviour) |

Not verified by anything I could fetch: whether YouTube's iOS view is `SFSafariViewController`; whether `shortcuts://` x-callback works on current iOS. Test both once on the owner's phones.

## Detection (JavaScript)

```js
// Returns the app name, or "" for a normal browser. Strings from hackernoon 2026-11-25; apps change them, so keep this list in one file.
export function in_app_browser(ua = navigator.userAgent){
	if (/FBAN|FBAV|FB_IAB|FBIOS/.test(ua)) return "facebook";
	if (/Instagram/.test(ua)) return "instagram";
	if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) return "tiktok";
	if (/Snapchat/.test(ua)) return "snapchat";
	if (/LinkedInApp/.test(ua)) return "linkedin";
	if (/GSA\//.test(ua)) return "google-app";
	// YouTube's UA is not documented: log navigator.userAgent from a real Shorts tap, then add it here.
	const android_webview = /Android/.test(ua) && /; wv\)/.test(ua);
	const ios_webview = /iPhone|iPad/.test(ua) && !/Safari\//.test(ua);   // WKWebView apps often omit "Safari/"
	return android_webview ? "android-webview" : ios_webview ? "ios-webview" : "";
}

export function chrome_intent(url = location.href){
	const u = new URL(url);
	return `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=${u.protocol.slice(0, -1)};package=com.android.chrome;end`;
}
```

Log every unknown IAB user agent to the Worker (one line) so the list grows from real traffic.

## The magic link, on the existing Worker

Fits [worker/readme.md](/worker/readme.md): D1 `users`, the stateless `s` cookie, `can()` before every handler, no email column (identity ruling 7).

1. **Start (in the IAB):** the landing page has a random `sid` (16 bytes, kept in the page; answers so far are PUT to a short-lived KV/DO draft keyed by it). `POST /api/handoff {sid, to}` where `to` is an email or a phone number. Route action `read` (anonymous), rate limited per IP and per `to` (for example 3 per hour).
2. **Token:** `t = random 32 bytes`, stored as `handoff:<sha256(t)> -> {sid, exp, used:false}` in KV with a 15 minute TTL. One use. The address is used for the send and **not stored** (ruling 7). The link is `https://<host>/h/<t>` (short, because SMS).
3. **Open (default browser):** `GET /h/<t>` marks it used, then redirects to the landing page with `?sid=<sid>`; the page reads the draft by `sid` and continues. No sign-in happens yet: the person presses Continue with Google *here*, where Google works. After sign-in, `PUT /api/answers` (see [the forms proposal](../auth/proposal.md)) copies the draft into their record.
4. **Alternative, not first:** make the link itself sign the person in as an `email` provider user. It removes Google but adds a second sign-in path and an email column (ruling 7 forbids storing it); the one-time code variant ([mojoauth](https://mojoauth.com/blog/in-app-browser-login-passkeys-oauth-magic-links): show a code in the new browser, type it back into the IAB) is only needed if the person must finish *inside* the IAB, which we do not want.
5. **iPhone push:** the link lands in Safari; the page shows "Add to Home Screen, then open it from there" (the existing install hint in [public/app/](/public/app/readme.md)), and asks for notifications from a button inside the installed app. Notifications then belong to that Home Screen app, so say it once there.

| Channel | Cost per send | Owner must sign up for |
|---|---|---|
| Email | Cloudflare Email Sending: 3,000/month included on Workers Paid, then $0.35 per 1,000; the free plan only sends to verified addresses ([Cloudflare docs](https://developers.cloudflare.com/email-service/platform/pricing/)), so the free plan cannot serve strangers | Workers Paid plan (or Resend/MailChannels); a verified sending domain on lew42.com (SPF/DKIM DNS records) |
| SMS | Twilio Verify: about $0.05 + $0.0083 = $0.058 per verification ([authgear, 2026](https://www.authgear.com/post/twilio-verify-pricing-and-alternatives/)). Our link is not an OTP, so plain Twilio Programmable SMS (about 1 cent) is cheaper and enough | Twilio account, a US number, and A2P 10DLC brand registration (US carriers filter unregistered business texts; this takes days) |

## Build order

1. **MVP (small):** `in_app_browser()` + instruction card in `ux/Auth` (`GoogleButton` hides itself in an IAB and shows the card). No backend. Log unknown user agents.
2. Email handoff (`POST /api/handoff`, `GET /h/:t`, KV, rate limit). Needs the email sender above.
3. Draft answers by `sid` so the link restores progress.
4. SMS, only if email is not enough (it costs money and needs 10DLC).
5. Landing page for IAB visitors: short video + Continue (the owner's idea; costs nothing extra and keeps them engaged while the link is sent).

## Try, do not rely on

- `intent://...;package=com.android.chrome;end` from Instagram/Facebook/TikTok on Android: sometimes works, sometimes shows nothing. Always have the instruction card already visible.
- `x-safari-https://`, custom schemes, a Shortcuts callback on iPhone: undocumented, breaks with app updates ([hackernoon](https://hackernoon.com/how-to-detect-instagram-facebook-and-tiktok-in-app-browsers)). Try on the owner's iPhone once; ship nothing that depends on it.
- Copy-link button as a third path ("Copy link, paste in Safari"): zero cost, works everywhere; add it to the card.

## Owner decisions this needs (none block the MVP)

Email sender choice and DNS records; whether SMS is worth 10DLC registration; a real phone test for YouTube Shorts (which view it opens, its user agent).
