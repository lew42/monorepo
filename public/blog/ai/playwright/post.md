# Playwright: a browser you can write to

Playwright is a program that opens a real web browser you cannot see, and then does exactly
what a script tells it: go to this address, click that button, type this sentence, take a
picture. Nobody is watching it and no hand touches a mouse — which is why one tool ends up
doing four jobs that sound unrelated: testing a website, reading data off one, photographing
one, and giving an AI agent hands on the web.

<figure class="blog-exhibit">

![The lew42 home page: a sidebar of links on the left, a headline and a live code demo in the middle, a column of blog cards on the right](demo/01-screenshot-widths-desktop.jpg)

<figcaption>This site's home page, photographed by a browser nobody opened, in a window nobody
was sitting at. <a href="demo/01-screenshot-widths.mjs">The script</a> is twenty lines and takes
four of these — phone, laptop, desktop, ultrawide — in about six seconds.</figcaption>
</figure>

**What it is, precisely.** Playwright is a free library made by Microsoft. One set of commands
drives three different browser engines — Chromium (what Chrome and Edge are built on), Firefox,
and WebKit (what Safari is built on) — either *headless*, which means no window is drawn on
screen at all, or headed, where you sit and watch it work. It comes in two shapes: a full
[test runner](https://playwright.dev/docs/intro) with its own assertions and parallel workers,
and a plain [scripting library](https://playwright.dev/docs/library) with no test framework
anywhere in it. Same commands, both ways. This post is mostly about the second shape, because
that is the one an AI agent reaches for.

The whole idea fits in four lines:

```js
const browser = await pw.chromium.launch();   // an invisible Chrome
const page = await browser.newPage();         // one tab inside it
await page.goto("http://localhost:8123/");    // go there
await page.screenshot({ path: "home.jpg" });  // take the picture
```

That is not a sketch — it is the middle of the script that made the picture above. Add one more
argument, a `viewport` (the pretend window size, in pixels), and those same four lines produce
the phone, the laptop, the desktop and the ultrawide version of it. Everything else in this post
is that shape with more verbs in the middle.

## What people use it for

<figure class="blog-exhibit">

![The AI task board at localhost:8123, with a full sentence typed into its text box: "Ten small Playwright demos — this line only proves typing works."](demo/03-click-and-type-after.jpg)

<figcaption>Nobody typed that. The script called <code>fill()</code> on the box and Playwright
waited for the box to exist, be visible, be enabled and stop moving before it touched it —
<a href="https://playwright.dev/docs/actionability">five checks</a>, on every action, that you
never write. <a href="demo/03-click-and-type.mjs">The script</a>; no button was ever
pressed.</figcaption>
</figure>

**Testing is the main job**, and the reason Playwright exists. An end-to-end test opens the real
site in a real browser and walks through something a person would do — log in, add to cart, check
out — then asserts the result. The thing that makes it bearable is *auto-waiting*: you do not
sprinkle "wait two seconds" through your test, because every action already waits for its target
to be ready.

Five more uses, all the same machinery pointed somewhere else:

- **Scraping and general scripting** — no test runner at all, just a script that visits pages and
  reads what it finds. This is the mode most automation lives in.
- **Screenshots and visual regression** — shoot a page, compare it against the picture from last
  week, and [fail the build on a difference](https://playwright.dev/docs/test-snapshots). It
  catches the CSS change nobody meant to make.
- **PDFs** — [`page.pdf()`](https://playwright.dev/docs/api/class-page) turns any live page into a
  real PDF file. A browser is also a printer.
- **Scheduled monitoring** — run the login-and-checkout script against the live site every few
  minutes, so a broken flow pages you [before a customer finds
  it](https://oneuptime.com/blog/post/2025-10-01-synthetic-monitoring-in-oneuptime-simulating-real-user-journeys-with-playwright/view).
- **All of the above in CI** — the standard setup is [a GitHub Actions
  job](https://playwright.dev/docs/ci-intro) that runs the whole suite on every push.

<figure class="blog-exhibit">

![The /notes/ page with every photograph replaced by a broken-image icon and its alt text — "Drop target UX", "Anchor point, optional" — in a grid of empty white cards](demo/06-network-images-blocked.jpg)

<figcaption>Playwright sits between the page and the internet, so it can cancel a request before
it leaves the computer. Here every image was aborted; what is left is each picture's alt text,
which is exactly what a blind reader gets. It can also hand a page invented JSON that no server
ever sent. <a href="demo/06-network.mjs">The script</a>.</figcaption>
</figure>

## Three ways Claude Code drives a browser

An AI model has no eyes. Giving it a browser means choosing what it gets to perceive, and there
are three real answers — they are different in kind, not in quality.

<figure class="blog-exhibit">

```txt one ariaSnapshot() call, the first ten lines
- link "LEW42": /url: /
- link "Blog": /url: /blog/
- link "Framework": /url: /framework/
- button "brightness_auto"
- heading "A web framework with no build step" [level=1]
- paragraph:
  - text: "Native ES modules, served exactly as written: you add a"
  - code: page.js
```

![The same home page as a picture: sidebar, headline, live code demo, blog cards](demo/09-aria-snapshot.jpg)

<figcaption>The same page, twice. Above is what an agent reads through the Playwright MCP
server — every element as a role and a name, and nothing else. Below is what you read. The
agent clicks <em>the link named "Blog"</em>, never a pair of coordinates.
<a href="demo/09-aria-snapshot.mjs">The script</a>.</figcaption>
</figure>

**1. The accessibility snapshot.** An accessibility tree is the description of a page that a
screen reader uses — every element reduced to its role ("link", "button", "heading") and its
name. [`@playwright/mcp`](https://github.com/microsoft/playwright-mcp), the official Playwright
server for the Model Context Protocol, hands a model that tree instead of a picture and takes
back instructions in the same vocabulary: *click the button named Submit*. It is cheap, it is
exact, and it is blind — a model driving this way cannot tell you the button is invisible
because someone painted it white.

**2. Pixels.** Anthropic's [computer use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool)
is the opposite bet: the model gets a screenshot and mouse and keyboard tools, and reasons about
what it sees at an x and a y. It works on anything a person can see, including a canvas, a video
and a PDF — and it costs an image per step and can misjudge a coordinate.
[Claude for Chrome](https://claude.com/blog/claude-for-chrome) puts the same ability inside a tab
you are already logged into.

**3. Scripts the model writes itself.** This is the mode this repo mostly runs, and it is the
least discussed of the three. Claude Code writes an ordinary twenty-line Playwright script, runs
it with `node`, and reads the output — which can be a screenshot it then looks at, or a number
it measured, or a JSON dump of the DOM. Two standing examples here: the
[`ui-test` habit](/framework/ai/2026-08-19/ui-test-skill/), which drives a real drag or resize
headless and screenshots after every gesture rather than claiming the feature works, and the
[vision runner](/framework/ext/DesignTool/vision/), which shoots a page and asks a model to
critique the design it sees. Slower to start than either of the other two, and unlimited in what
it can ask, because it is just code.

## What it did tonight

<figure class="blog-exhibit">

![MDN's home page at 1920 pixels wide: a purple advertising banner, the dark navigation bar, and the "Resources for Developers, by Developers" headline](demo/10-external-site-mdn-1920.jpg)

<figcaption>Someone else's site, loaded headless from this laptop and shot at 1920. MDN refuses
to be embedded in an iframe (<code>x-frame-options: DENY</code>), so a screenshot is the only way
to look at it from another page — which turns out to be true of most of the web.
<a href="demo/10-external-site.mjs">The script</a>.</figcaption>
</figure>

The demos above are all of this site or of one page of someone else's. The night's actual work
was the same thing at scale, and it is a fair picture of what this kind of automation buys you.

A scout collected **sixty real websites** worth studying for their layout — documentation sites,
blogs, marketing pages, web apps, and a handful pulled out of design galleries.
**Fifty-one of the sixty loaded** on the first or second try. **Nine did not**, every one of them
stopped by a bot check rather than by a bug — 403s and 401s from sites that can tell a headless
browser from a person. **Twenty-five of the sixty** allow themselves to be shown in an iframe;
the other thirty-five send a header forbidding it, which is why the corpus is built on
screenshots rather than live frames.

Every site that loads is then shot at four window widths — 400, 1280, 1920 and 3440 pixels —
plus one deliberately absurd 1280×4000 window that catches a whole long page in a single picture.
The same run reads the DOM and captures the CSS off the network, so the record holds both the
picture and the measurements behind it. Two new corners of this site came out of that:
[**/websites/**](/websites/), the corpus itself — one JSON record per site, its five pictures,
and the tags a person wrote after looking at them — and [**/layouts/**](/layouts/), the
encyclopedia that names the arrangements those tags point at, so `2-sidebar` means one thing
across every record.

None of that is clever. It is one script, run sixty times, with a person reading the results.

## The honest limits

<figure class="blog-exhibit">

```js from demo/06-network.mjs
await page.route("**/*", route => {
	const type = route.request().resourceType();
	if (type === "image") return route.abort();  // safe: a missing picture
	return route.continue();                     // fonts go through, on purpose
});
```

<figcaption>That comment is the scar. Blocking fonts as well as images turned this entire site
into a blank white page — a font loader here fetches its file from JavaScript with no error
handling, so a refused request threw and took the render with it. The demo ships blocking images
only, and <a href="/framework/ai/2026-09-08/font-fallback/">a fix for the loader</a> was opened
the same night.</figcaption>
</figure>

**Sites can tell.** A headless browser leaves fingerprints — `navigator.webdriver` is set, the
plugin list is empty, a hundred smaller tells — and
[commercial anti-bot services read them](https://scrapeops.io/playwright-web-scraping-playbook/nodejs-playwright-make-playwright-undetectable/)
and answer with a block or a CAPTCHA. That is the nine sites above. There is a whole industry of
tools for defeating this, and whether using them is ordinary practice or abuse is genuinely
disputed rather than settled.

**Legal is not the same as safe.** United States courts have found that scraping publicly visible
pages is not a crime under the Computer Fraud and Abuse Act. The company that won that famous
fight, hiQ, then [lost the larger case and paid
$500,000](https://law.justia.com/cases/federal/appellate-courts/ca9/17-16783/17-16783-2022-04-18.html)
under a different theory — breaking the terms of service it had agreed to. Winning on one legal
theory is not winning.

**Auto-waiting is not a cure for flaky tests.** It waits for the page to *look* ready — visible,
stable, enabled — [not for the data behind it to have
arrived](https://mergify.com/learn/flaky-tests/playwright). Real suites still flake on animations
caught mid-transition and on responses that came back a beat late. It removes most of the waiting
code, not the underlying race.

**You cannot read another site's CSS the easy way.** From inside the page, `styleSheet.cssRules`
throws on every stylesheet that came from another domain — five out of five on stripe.com. The
way around it is to catch the stylesheets as they arrive over the network, and to ask the browser
for `getComputedStyle` on the elements, which is the cascade's actual answer.

**And be careful what you believe about it.** A comparison of Playwright against Cypress and
Selenium claiming "42% faster, 67% fewer flaky tests" is repeated across a dozen blog posts with
no study, no method and no source anywhere behind it. Every claim in
[the research log](/imagine/research/playwright/) for this post carries a grade —
*established*, *contested*, *fringe* or *speculation* — and that one is filed as fringe.

## Where to look next

[The ten demos](demo/readme.md) are each under forty-five lines, each teaches one thing, and each
runs against this site with `node`. [The research log](/imagine/research/playwright/) has all
thirty-two claims with their sources. [**/websites/**](/websites/) is what sixty sites look like
once a robot has been through them, and [**/layouts/**](/layouts/) is the vocabulary for saying
what it found.
