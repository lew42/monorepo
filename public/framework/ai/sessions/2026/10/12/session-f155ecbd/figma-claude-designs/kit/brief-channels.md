# Brief: YouTube channel ideas, made visible (owner, 2026-10-12, night)

The owner (dictated): lifestyle channels most people love to dream about could run endlessly — **supercars / luxury cars** (what they cost, who makes them, how they compare on performance), **boats and yachts** (from affordable to superyacht, builders, features), **dream houses / architecture** (custom homes in the mountains, on the beach, unique features), **private jets and personal aircraft**. "What would I buy with a million dollars? I'm not sure" is itself a format. Long-form videos get cut into many Shorts linking back. Sourcing: quoting other channels' footage in short, cited clips (channel name in the corner, a few seconds), plus emailing channels for permission. The owner wants to **see** these ideas as Figma designs, not read about them.

Read [ext/Figma/doc/video-kit.md](/framework/ext/Figma/doc/video-kit.md) (formats, safe zones, the verified image pipeline) and [brief-ds.md](brief-ds.md) (tokens, text styles, prime as a splash). File `QYN0G2URSBHYH5I06MOjxU`. Load the figma-use skill first. If `Video · Kit` exists by the time you build, use its components (title card, lower third, end card, Shorts frame); otherwise build plain frames to the same sizes and note it.

## Page `Video · Channel ideas`
- **Notes box at the top** (the owner reads the file, not chat): what this page is, what's open.
- One **section per channel** (Supercars, Yachts, Dream homes, Private jets; a fifth "Million-dollar choice" cross-over): a 1920×1080 channel banner/title card with a real image, the **content ladder** (affordable → mid → luxury → hypercar/superyacht tier, 4–5 real example models/builders per tier with approximate price, one image each), 6–8 **episode ideas** as 16:9 thumbnails (image + 3–5 word hook), and 3 **Shorts** (1080×1920 with safe zones) cut from one episode, each with its hook and end card to the long form.
- **Comparison card** design for the "how they stack up" format (price, 0–60, top speed, range / length, cabin, maker) — one filled example per channel with real numbers you are confident of; mark any you are unsure of "≈".
- **Sourcing section**: a "quoted clip" overlay (clip in a frame, channel name + video title in the corner, "used under fair use / with permission"), a permission-request email template (as a text card), and a short note that fair use is a judgment call, not a guarantee (not legal advice).

## Images
Real models need real photos: Wikimedia Commons by direct URL (curl with a User-Agent; credit author + licence in small text on the frame). Use `generate_image` (planKey `team::1558244461354989578`) only for moods, banners and concepts with no real subject; **cap 12 generations** (they spend Figma AI credits). Place with `upload_assets` + `curl -F` (the doc has the steps). Never fake a brand logo.

## Then
Add the page to `Claude · Overview`'s design-system card and one line to its **For you** card (`186:1062`) if something waits on the owner. Report `kit/channels.md` (sections, image sources/licences, generations used, open questions), committed by path.
