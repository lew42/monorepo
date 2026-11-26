# Test the sign-in demo on your phone

Open **https://staging.lew42.com/join/** on your phone. A first-time visitor taps **twice**: Continue with Google, then Allow. A third tap (the test notification) is optional.

## Before you start (once, about 2 minutes)

In the Google Cloud Console, open the OAuth client `722949407087-g0kag…` and add `https://staging.lew42.com` to **Authorized JavaScript origins**. Until then the Google button says the origin is not allowed. Everything else can be tested now with the test sign-in link the cloud chat has.

## Android (Chrome)

| # | You see | You tap |
|---|---|---|
| 1 | The video, captions on: "Hey! Quick favour… Can you help me test it?" and **Continue with Google**, with "Not working?" under it | Continue with Google, pick your account |
| 2 | **Allow one notification a week** and "One notification, every week. Nothing else." | Allow, then Allow in Chrome's prompt |
| 3 | "You're in. See you next week." and **Send me a test notification now** | Optional: the test button. "Sent. It should arrive in a moment." and a notification titled lew42 arrives |
| 4 | Tap the notification | It opens /join/ |

## iPhone (Safari)

Steps 1 and 3 are the same. At step 2 a sheet says **"Add to your Home Screen first"**: tap Share, then Add to Home Screen, open lew42 from your Home Screen, then tap Allow one notification a week, then Allow. That is the only way an iPhone allows web notifications.

## Inside Instagram or Facebook

Instead of the Google button you see **"Open this in your own browser"**, with Open in Chrome (Android), the menu steps (iPhone), **Copy link** and **Share**. "Not working?" opens the same card anywhere.

## Settings (your avatar, top right)

- **Sign out:** back to Continue with Google.
- **Turn off notifications:** back to Allow.
- **Delete account:** it asks first, then wipes your account and Google's access to it, and you're back at Continue with Google.

## Ads: the link to use, and where to see what they did

Give each ad its own link, for example **https://staging.lew42.com/join/?utm_source=youtube&utm_campaign=test1** (add `&utm_content=<which video>` to tell two ads in one campaign apart). Then open **https://staging.lew42.com/join/stats/**, signed in with your admin Google account: it counts each step (watched, tapped Google, signed in, allowed, subscribed…) for today, the last 7 days and all time, split by `utm_source` and by in-app browser or not.

## Debug

Add `?debug=1` to the URL: a strip shows the in-app browser, iOS or Android, Home Screen, the notification permission, signed in or not, and the subscription, with a **Reset everything** button.

## What only your phone can prove

A real notification arriving (headless browsers refuse to subscribe), the iPhone Home Screen flow, and the video playing with sound. The weekly notification goes out Mondays at 16:00 UTC.

Page readme: [public/join/readme.md](../../../../../../../../join/readme.md) · plan: [plan.md](plan.md)
