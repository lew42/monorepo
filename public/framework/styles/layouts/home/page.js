import { Page, demo, div, span, p, h1, h2, h3, hr, button, label, input, icon } from "/app.js";
import { band as tone } from "../../sections/tone.js";
import full from "../full.js";
import home from "./content.js";

/* The Figma draws this page TWICE — `23-181` at 1920 and `23-1144` at 375 — and every
   band appears in both. Here each band is ONE class string and there is no query on the
   page, so the 1920 drawing and the 375 drawing are the same ten strings at two widths.
   What each band costs, and the three places the two drawings genuinely disagree, is
   doc/transition.md. */

const list = s => s.split(" · ");

/* `sections/tone.js` already maps the four tones to the theme's own surfaces, so a dark
   band here names no colour. Its `padding` comes off because two of the three consumers
   are CARDS, not bands, and a card's padding is `--pad`. */
const DARK = (({ padding, ...rest }) => rest)(tone("dark"));

/* ⚠ A picture placeholder, and it may NOT be `.wash`. `--wash` is keyed to the
   COLOR-SCHEME, not to the band it sits on — `rgba(0,0,0,0.08)` in light mode — so on a
   `dark` band in light mode it paints black-on-black and vanishes. `.muted` solved
   exactly this for text ("derived from the band's own ink, never a fixed grey"); there
   is no background twin of it, so this is that one line. doc/transition.md §3. */
const media = ratio => div.c("flex v-center h-center", () => icon("image").style("opacity", "0.5"))
	.style({ aspectRatio: ratio, borderRadius: "var(--radius)", background: "color-mix(in srgb, currentColor 10%, transparent)" });

const badge = text => span.c("h4 tint pad", text)
	.style({ "--pad": "0.45em 0.9em", alignSelf: "start", borderRadius: "var(--radius)", color: "var(--eyebrow, var(--prim))" });

const tags = str => div.c("flex gap wrap", () => list(str).forEach(t =>
	span.c("h4 muted wash pad", t).style({ "--pad": "0.3em 0.7em", borderRadius: "var(--radius)" })))
	.style("--gap", "0.4em");

export default new Page(demo.layout({
	meta: import.meta,
	title: "Home",
	description: "A real client homepage — ten bands, one class string each, and the same page at 375 and at 3440 with no breakpoint between them.",
	icon: "home",
	group: "Pages",

	twin: true,
	parts: "header logos highlight footer",

	/* ⚠ A REAL viewport, because the claim under test is a viewport claim. The card is
	   `zoom-25` and the stage simulates its widths, and neither is a browser — media
	   queries do not follow `zoom` and a simulated pane is not `100vw`. `400/entry.js`
	   and `wire/` already wire this; third caller, so `layouts/entry.js` is now a fair
	   question (questions.md #3). */
	route(name){ return name === "full" && full(this, () => this.layout().ac("default")); },

	note: "**The whole page is ten class strings and zero media queries.** The Figma files a 1920 drawing and a 375 drawing; every band here is one string that is both. Three do it with `flex auto gap` and a `--column` basis — the row is a row until its two tracks no longer fit, then it is a stack. Three are `grid auto gap`, where `auto-fit` also caps the column count at the number of cards, so three cards can never become four. **The two drawings genuinely disagree in three places** (the nav at 375, the philosophy heading, the portfolio CTA) and each is one paragraph in [doc/transition.md](./doc/transition.md), beside the four widths it was measured at.",

	layout(){

		/* A band bleeds; the words don't — `landing/`'s sandwich, with one `--measure`
		   for the whole page so every band shares one left and right edge. */
		const band = (fill, fn) => div.c("pad", () =>
			div.c("measure flex v gap", fn).style({ "--measure": "96em", "--gap": "2.5em" }))
			.ac(fill !== "dark" && fill)
			.style({ "--pad": "clamp(2.5em, 5vw, 5em) clamp(1em, 4vw, 3em)", ...(fill === "dark" ? DARK : {}) });

		return div.c("page full flex v", () => {

			/* ── Navigation-Header ── `flex gap wrap v-center split`
			   ⚠ The nav's `flex` is the ONE inline flex on this page and it is a
			     vocabulary gap, not a preference: `--grow` reaches children of
			     `.flex.auto`, and this row is not one — `.basis` cannot shrink, and
			     `.flex-1` has a zero basis so it never wraps. doc/transition.md §1. */
			if (this.shows("header")) div.c("flex gap wrap v-center split pad", () => {
				div.c("h3", () => { span(home.brand[0]); span.c("muted", home.brand[1]); });

				div.c("flex gap wrap v-center", () => list(home.nav).forEach(word =>
					span.c("muted", word))).style({ "--gap": "0.6em 1.4em", flex: "1 1 22em" });

				button.c("bg", "Consultation");
			}).style({ "--pad": "0.9em clamp(1em, 4vw, 3em)", "--gap": "1em", borderBottom: "1px solid var(--line)" });

			/* ⚠ NOT `flex-1` + `overflow-y: auto`. That is the app-shell shape — a fixed
			   chrome around one scrolling pane — and on a page whose bands add up to
			   ~4.5k px it turns the middle into a porthole: measured at 1440, 4549px of
			   content inside a 284px box (16.0x) with seven bands unreachable, while the
			   document itself did not scroll at all. A homepage is a DOCUMENT.
			   doc/transition.md §4. */
			div.c("flex v", () => {

				/* ── Hero-Section ── `flex auto gap`, two equal tracks.
				   Copy FIRST in source, so the picture is on the right of one line and
				   BELOW the copy on two — which is the mobile drawing. (`hero/` uses
				   `reverse` for the opposite comp, where the picture lands on top.) */
				band("", () => div.c("flex auto gap", () => {

					div.c("flex v gap", () => {
						div.c("flex gap v-center", () => {
							icon("circle").style({ color: "var(--prim)", fontSize: "0.55em" });
							span.c("h4 muted", home.hero.eyebrow);
						}).style("--gap", "0.6em");

						h1(home.hero.title);
						p.c("muted", home.hero.blurb);

						div.c("flex gap wrap", () => {
							button.c("prim", home.hero.ctas[0]);
							button(home.hero.ctas[1]);
						});
					}).style("--gap", "1.1em");

					div.c("flex v gap", () => {
						media("4 / 3");

						div.c("surface pad flex v gap", () => {
							span.c("h1", home.hero.kpi[0]).style("color", "var(--prim-ink)");
							span.c("muted", home.hero.kpi[1]);
						}).style({ "--pad": "1.2em", "--gap": "0.2em", alignSelf: "start", maxWidth: "18em", marginTop: "-3.5em", marginInlineStart: "1.5em" });
					}).style("--gap", "0");

				}).style({ "--column": "24em", "--gap": "3em" }));

				/* ── Trust-Logos ── `flex gap wrap v-center h-center`, and the gap is
				   what makes 5-across at 1920 and 3-then-2 at 375 the same line. */
				if (this.shows("logos")) band("", () => {
					p.c("h4 muted", home.logos.caption).style("text-align", "center");

					div.c("flex gap wrap v-center h-center", () => list(home.logos.marks)
						.forEach(mark => span.c("h3 muted", mark)))
						.style("--gap", "1em clamp(1.5em, 4vw, 5em)");
				});

				/* ── Services-Section ── a `--grow` header over a `grid auto` wall.
				   `--grow: 1.4` IS 1.40 now, at every width — the basis scales with the
				   weight (framework.css, 2026-08-18, after this page measured the old
				   shared-basis version at 1.52). The Figma's seam is 700/500.
				   ⚠ The weight now moves the WRAP THRESHOLD too: the row breaks when
				     `--column × --grow` summed over the tracks no longer fits, so a
				     weight belongs near 1. `4`/`5` here read as 0.80 and stacked at
				     every width. doc/transition.md §2. */
				band("", () => {
					div.c("flex auto gap", () => {
						div.c("flex v gap", () => { badge(home.services.badge); h2(home.services.title); })
							.style({ "--gap": "0.8em", "--grow": "1.4" });

						p.c("muted", home.services.blurb);
					}).style({ "--column": "18em", "--gap": "2em" });

					div.c("grid auto gap", () => home.services.cards.forEach(([glyph, title, blurb, tag]) =>
						div.c("surface pad flex v gap", () => {
							div.c("flex v-center h-center tint", () => icon(glyph).style("color", "var(--prim-ink)"))
								.style({ flex: "0 0 auto", width: "3em", height: "3em", borderRadius: "var(--radius)" });

							h3(title);
							p.c("muted", blurb);
							tags(tag);
						}).style({ "--pad": "2em", "--gap": "1em" })))
						.style({ "--column": "22em", "--gap": "2em" });
				});

				/* ── Philosophy-Section ── the picture is FIRST in source, so it is the
				   left column at 1920 and the top block at 375, with no `reverse`. */
				band("wash", () => div.c("flex auto gap", () => {
					media("3 / 2");

					div.c("flex v gap", () => {
						badge(home.philosophy.badge);
						h2(home.philosophy.title);
						p.c("muted", home.philosophy.blurb);
						p.c("muted", home.philosophy.coda);

						div.c("surface pad flex v gap", () => {
							p(home.philosophy.quote);
							span.c("h4 muted", home.philosophy.by);
						}).style({ "--pad": "1.5em", "--gap": "0.6em" });
					}).style("--gap", "1em");

				}).style({ "--column": "24em", "--gap": "3em" }));

				/* ── Portfolio-Section ── `grid auto` at a 16em column, so four cards is
				   four across at 1920, two at a tablet and one at 375. */
				band("", () => {
					div.c("flex gap wrap split v-center", () => {
						div.c("flex v gap", () => { badge(home.portfolio.badge); h2(home.portfolio.title); })
							.style("--gap", "0.8em");

						button(home.portfolio.cta);
					});

					div.c("grid auto gap", () => home.portfolio.cards.forEach(([client, kind, title]) =>
						div.c("flex v gap", () => {
							media("16 / 10");

							div.c("flex gap wrap split", () => {
								span.c("h4", client).style("color", "var(--eyebrow, var(--prim))");
								span.c("h4 muted", kind);
							}).style("--gap", "0.5em");

							p.c("h3", title);
						}).style("--gap", "0.7em")))
						.style({ "--column": "16em", "--gap": "2em" });
				});

				/* ── Highlight-Section ── a dark CARD inside a light band, and the same
				   `flex auto gap` seam as the hero. */
				if (this.shows("highlight")) band("", () => div.c("pad flex auto gap", () => {

					div.c("flex v gap", () => {
						span.c("h4", home.highlight.eyebrow).style("color", "var(--eyebrow, var(--prim))");
						h2(home.highlight.title);
						p.c("muted", home.highlight.blurb);

						div.c("flex gap wrap", () => home.highlight.stats.forEach(([n, caption]) =>
							div.c("flex v", () => { span.c("h1", n); span.c("h4 muted", caption); })))
							.style("--gap", "2.5em");

						button(home.highlight.cta).style("align-self", "flex-start");
					}).style("--gap", "1em");

					media("16 / 10");

				}).style({ "--column": "24em", "--gap": "3em", "--pad": "clamp(1.5em, 3vw, 3.5em)", borderRadius: "var(--radius)", ...DARK }));

				/* ── Testimonials-Section ── the same wall as Services, one word apart
				   (`--column: 22em`), which is the point of a vocabulary. */
				band("wash", () => {
					div.c("flex v gap v-center", () => { badge(home.testimonials.badge); h2(home.testimonials.title); })
						.style("--gap", "0.8em");

					div.c("grid auto gap", () => home.testimonials.cards.forEach(([quote, name, role]) =>
						div.c("surface pad flex v gap", () => {
							icon("format_quote").style({ color: "var(--prim-ink)", fontSize: "2em" });
							p(quote);

							div.c("flex gap v-center", () => {
								div.c("wash").style({ flex: "0 0 auto", width: "2.6em", height: "2.6em", borderRadius: "50%" });
								div.c("flex v", () => { span.c("h3", name); span.c("h4 muted", role); });
							}).style({ "--gap": "0.8em", marginTop: "auto" });
						}).style({ "--pad": "2em", "--gap": "1em" })))
						.style({ "--column": "22em", "--gap": "2em" });
				});

				/* ── Contact-Section ── copy beside a real form; `flex auto gap` again. */
				band("", () => div.c("flex auto gap", () => {

					div.c("flex v gap", () => {
						badge(home.contact.badge);
						h2(home.contact.title);
						p.c("muted", home.contact.blurb);

						div.c("flex v gap", () => home.contact.meta.forEach(([glyph, line]) =>
							div.c("flex gap v-center", () => {
								icon(glyph).style("color", "var(--eyebrow, var(--prim))");
								span(line);
							}).style("--gap", "0.6em"))).style("--gap", "0.5em");
					}).style("--gap", "1em");

					div.c("surface pad flex v gap", () => {
						h3(home.contact.form.title);

						home.contact.form.fields.forEach(([caption, type, placeholder]) =>
							label.c("flex v gap", () => {
								span.c("h4", caption);
								input().attr("type", type).attr("placeholder", placeholder);
							}).style("--gap", "0.35em"));

						button.c("prim", home.contact.form.cta);
						p.c("h4 muted", home.contact.form.fine).style("text-align", "center");
					}).style({ "--pad": "2em", "--gap": "1.1em" });

				}).style({ "--column": "24em", "--gap": "3em" }));

			});

			/* ── Footer ── `flex auto gap` at 2:3, then a `split` bottom rule. */
			if (this.shows("footer")) band("dark", () => {
				div.c("flex auto gap", () => {
					div.c("flex v gap", () => {
						div.c("h2", () => { span(home.brand[0]); span.c("muted", home.brand[1]); });
						p.c("muted", home.footer.blurb);
					}).style({ "--gap": "0.6em", "--grow": "0.8" });

					div.c("flex gap wrap", () => home.footer.columns.forEach(([head, links]) =>
						div.c("flex v gap", () => {
							span.c("h4", head);
							list(links).forEach(link => span.c("muted", link));
						}).style("--gap", "0.35em"))).style({ "--gap": "2.5em" });
				}).style({ "--column": "16em", "--gap": "3em" });

				hr();

				div.c("flex gap wrap split v-center", () => {
					span.c("muted", home.footer.copyright);
					div.c("flex gap", () => home.footer.social.split(" ").forEach(glyph =>
						icon(glyph).style("opacity", "0.7"))).style("--gap", "1em");
				});
			});
		});
	},
}));
