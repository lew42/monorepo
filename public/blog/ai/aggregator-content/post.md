A content-strategy idea, written down so it isn't lost: make round-up videos in a niche that are mostly original, quote other creators in short credited clips, and build a small index that makes those clips findable. *This is general information, not legal advice.*

## The idea

Pick a niche: "top 10 restaurants in Chicago", a resort, a product. Make a video that rounds up what the best creators in that niche found, with your own research layer on top:

- founder and history facts
- a map and the location
- how many locations the chain has
- the menu
- profile cards for the people involved
- your own face and commentary

**Most of every video is original.** Other creators' clips are short, credited, and commented on: "creator X went there and thought A, B and C." The clips fill in on-site footage you didn't shoot.

The philosophy is aggregation, the way you'd read three books and write one that summarizes them. The value is a fast, high-level overview that combines several perspectives. The plan is to make as much original content as possible; borrowed clips are the supporting cast.

## Fair use and how YouTube handles copyright

### Fair use

- **Strongest** when you comment on the creator's take: you are reacting to what they said or found.
- **Weakest** when their footage is just B-roll, especially "money shots" such as drone and aerial footage, which creators often license. That is the market-harm factor: you are replacing something they could sell.
- Credit and a link are good faith, not a legal defence.
- There is no "under 20%" safe harbour. The percentage isn't the test.

### What actually happens on YouTube

- **Content ID** is automated fingerprinting. It affects only that one video (the owner can monetize, track or block it) and carries **no strike**. It is mostly used by studios and big publishers; most small creators don't have it. The Copyright Match Tool (for Partner Program creators) targets full or near-full reuploads, so short clips often won't surface.
- **A manual takedown** (the webform) removes the video **and** gives the channel a copyright strike immediately. YouTube checks the request for legal completeness only; it says courts decide fair use. Claimants are legally required to consider fair use before filing (*Lenz v. Universal*), but nobody checks that up front.
- **Counter-notification** is sworn, consents to federal court jurisdiction, and shares your contact information with the claimant. Once a valid one is forwarded, the strike may be cleared, and the claimant has 10 US business days to show legal action or the video is reinstated.
- **Strikes** expire after 90 days. Three within 90 days terminates the channel.

### Monetization is a separate question

- The **reused content** policy is judged channel-wide by reviewers. It isn't based on copyright, permission or fair use, and it explicitly allows clips used for critical review.
- The **inauthentic content** policy (renamed from "repetitious" on July 15, 2025) targets mass-produced, template-driven videos. This is the main risk if the idea is heavily automated across many niches. Automate the research, planning and scripting, but each video has to feel genuinely made.

### The real risk

It isn't a lawsuit. It's an annoyed creator pulling a video and handing out a strike, possibly several that stack. **Asking permission up front** removes most of it; small creators often say yes in exchange for credit and a link.

**Press kits** are generally usable without asking for editorial uses like reviews and news, under each kit's own terms. Never imply endorsement or sponsorship.

## The indexing system

The second half of the idea: a lightweight metadata index of videos, so "find me every clip that shows feature X of product Y" is a database query.

### Discovery

Use the official **YouTube Data API**: search, channels, titles, descriptions, chapters. Start from a query for one product, place or topic rather than crawling in bulk.

### Capture

A temporary screen-recorded stream (OBS is better than Playwright's built-in `recordVideo`, which makes low-quality WebM meant for test debugging) that is **not kept as full video**. It is converted on the fly into:

- **Screenshots** just before and after each scene cut (scene detection, for example PySceneDetect)
- **A Whisper transcript**
- Optionally, a **low-resolution proxy** for rough review

A streamed screen capture has low frame rate and quality, so this is for **indexing and reference, not editing**. Usable footage still has to come from a licensed or permitted source.

### The AI pass

- A vision model tags each scene: talking head or B-roll, objects (cars, boats, houses, places), composition and framing quality.
- The transcript says what is being said and which product feature is being discussed.
- Everything goes into a database you can filter.

### Web UI

Embed the actual YouTube video with the **IFrame Player API** and seek to timestamps for playback and review, without downloading anything. The player is a cross-origin iframe, so you can't grab frames from it; frames come from the capture step.

### Templates and AI planning

- Develop video templates: "top N" recipes and others.
- Have AI research niches, map which creators already cover what, and theorize what content would be useful.

### Expansion

Once the workflow works, spin up channels in other niches: cars, boats, yachts, cruises, travel, tech.

### A product angle

The indexing could be sold. The strongest version, with no grey area, is **indexing creators' own libraries for them**. Competitors exist (Twelve Labs does "search inside video"), so there's demand, but the space isn't empty.

## Caveats and open questions

- **Screen-capturing or downloading YouTube videos is against YouTube's terms.** Downloaders (youtube-dl, yt-dlp) also sit in a legal grey area over circumventing stream protection; the RIAA got youtube-dl pulled from GitHub in 2020, and it was later reinstated. A screen recording is still a copy. Showing the YouTube UI and channel name helps attribution and the commentary framing, but it does not change the copyright position.
- **Evading YouTube's bot detection (rotating proxies, Tor, VPNs) was considered and ruled out.** It deliberately evades access controls, and a product can't depend on a supply line the platform is actively cutting off.
- **The cleanest path** is permission or licensing for the clips actually used, and analysis only on footage you have rights to.

## Where this goes next

A reasonable first experiment: one niche, one video, hand-picked creators who've been asked for permission, and a tiny index of just those videos built from the Data API plus transcripts. If the commentary-heavy format works for viewers, then look at automating research and scene tagging.
