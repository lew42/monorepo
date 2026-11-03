import { View, div, span, hr, button, icon } from "/app.js";
import { compare } from "../compare.js";
import "/framework/ui/scale/scale.js";

/* Figma "2-Col: Pricing" section (metadata.xml, frame 17:1051): two plan
 * cards, Starter (light) and Pro (dark, the "highlighted" plan), each an
 * eyebrow label, a big price, "per month", a divider, a checklist and a
 * full-width CTA — no panel behind them, straight on the page.
 *
 * SCALE, DON'T REFLOW, via the shared `ui/scale` component (review finding
 * 8): `.ui-scale` opens a container-query context on its own width, and
 * `.ui-scale-body`'s font-size is `--scale-width`-driven — 16px exactly at
 * 856px wide (the Figma frame's own width, 856 / 16 = 53.5), and smaller
 * below that. Every size in view.css is `em` against that one font-size, so
 * the Figma layout (two cards, one line per feature, one line on the
 * button) holds at any width instead of the pixels wrapping.
 *
 * ⚠ Every child uses a flex `gap`, not individual margins — Figma's five
 * internal gaps (label→price, price→"per month", →divider, →checklist,
 * →button) are ALL 16px, i.e. all exactly 1em, so one `gap: 1em` on the
 * plan's own flex column reproduces every one of them with no per-element
 * number to keep in sync. */
const PLANS = [
	{ name: "Starter", price: "$9", features: ["5 projects", "10GB storage", "Email support"], dark: false },
	{ name: "Pro", price: "$29", features: ["Unlimited projects", "100GB storage", "Priority support", "Custom domains", "API access"], dark: true },
];

View.stylesheet(import.meta, "view.css");

export default class FigmaPricingView extends View {

	render(){
		div.c("ui-scale", () => {
			div.c("ui-scale-body figma-price-grid", () => PLANS.forEach(plan => this.plan(plan)));
		}).style("--scale-width", "53.5");

		compare(new URL("figma.png", import.meta.url).href, "Figma: 2-Col Pricing section");
	}

	plan(plan){
		const $plan = div.c("figma-price-plan" + (plan.dark ? " figma-price-plan-dark" : ""), () => {
			div.c("figma-price-plan-label", plan.name);
			div.c("figma-price-plan-price", plan.price);
			span.c("figma-price-plan-sub", "per month");
			hr();
			div.c("figma-price-plan-features", () => plan.features.forEach(text => {
				icon("check").ac("figma-price-plan-check");
				span(text);
			}));
			button.c("prim", "Choose Plan").click(() => this.choose(plan, $plan));
		});
		return $plan;
	}

	// Nothing persists — a status line under the PLAN it was clicked on (not
	// the bottom of the whole view — review finding 5) is the whole "it
	// works" proof the brief asks for.
	choose(plan, $plan){
		if (this.$chosen) this.$chosen.remove();
		this.$chosen = div.c("h4 muted", `${plan.name} chosen — nothing saved.`).append_to($plan.el);
	}
}
