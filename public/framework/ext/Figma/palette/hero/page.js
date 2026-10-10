import { Page, View, div, p } from "/app.js";

View.stylesheet(import.meta, "hero.css");

const PRIME = "#72c4ff";
const PRIME25 = "linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), #72c4ff";
const WHITE10 = "linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff";
const BROWN = "#675f56";
const BROWN10 = "linear-gradient(rgba(255,255,255,.1),rgba(255,255,255,.1)), #675f56";
const INK = "rgba(0,0,0,.8)";
const SOFT = "rgba(0,0,0,.55)";
const LINE = "rgba(0,0,0,.1)";
const WHITE70 = "rgba(255,255,255,.7)";

export default new Page({
	meta: import.meta,
	title: "Hero & Navigation",
	icon: "web",
	width: "full",
	description: "Nav, hero content and footer in three compositions: nav+hero+footer, split hero and a settings layout.",
	content() {
		div.c("hro-card", () => {
			// Header
			div.c("hro-header", () => {
				p.c("hro-title", "HERO LAYOUTS").style("color", INK);
				p.c("hro-tagline", "Nav, hero content, and footer. Three bases in composition.").style("color", INK);
			});

			// Block A: Nav + hero + footer
			div.c("hro-block", () => {
				// Nav bar
				div.c("hro-nav-bar", () => {
					p.c("hro-label", "ACME").style("color", INK);
					div.c("hro-nav-links", () => {
						p.c("hro-label", "Products").style("color", SOFT);
						p.c("hro-label", "Pricing").style("color", SOFT);
						p.c("hro-label", "Docs").style("color", SOFT);
					});
				});

				// Hero section
				div.c("hro-hero-section", () => {
					p.c("hro-hero-title", "One system.").style("color", INK);
					p.c("hro-hero-title", "Every context.").style("color", INK).style("margin-top", "-16px");
					p.c("hro-body", "Your variables adapt automatically. Set the mode on a parent frame").style("color", SOFT);
					p.c("hro-body", "and every child resolves through your scheme — no manual overrides.").style("color", SOFT);

					// Stats row
					div.c("hro-stats-row", () => {
						// Stat 1
						div.c("hro-stat-card", () => {
							p.c("hro-stat-number", "3").style("color", INK);
							p.c("hro-label", "Bases").style("color", SOFT);
						});
						// Stat 2
						div.c("hro-stat-card", () => {
							p.c("hro-stat-number", "6").style("color", INK);
							p.c("hro-label", "Styles").style("color", SOFT);
						});
						// Stat 3
						div.c("hro-stat-card", () => {
							p.c("hro-stat-number", "∞").style("color", INK);
							p.c("hro-label", "Combos").style("color", SOFT);
						});
					});
				});

				// Footer bar
				div.c("hro-footer-bar", () => {
					p.c("hro-body", "© 2026 Acme Inc.").style("color", WHITE70);
					p.c("hro-label", "Privacy · Terms · Status").style("color", PRIME);
				});
			});

			// Block B: Split hero
			div.c("hro-split-hero", () => {
				// Left panel
				div.c("hro-split-left", () => {
					p.c("hro-split-title", "Built for the night.").style("color", "#fff");
					p.c("hro-body", "A color system that adapts. Switch bases in one decision — your entire UI follows.").style("color", WHITE70);

					// Buttons
					div.c("hro-buttons-row", () => {
						div.c("hro-button-primary", () => {
							p.c("hro-label", "GET STARTED").style("color", "#fff");
						}).style("background", PRIME25);
						div.c("hro-button-secondary", () => {
							p.c("hro-label", "LEARN MORE").style("color", "#fff");
						}).style("background", BROWN10);
					});
				}).style("background", BROWN);

				// Right panel
				div.c("hro-split-right", () => {
					p.c("hro-label", "WHAT YOU GET").style("color", PRIME);

					// Row 1
					div.c("hro-split-row", () => {
						div.c("hro-dot").style("background", PRIME25);
						p.c("hro-body", "Adaptive tokens").style("color", INK);
					});

					// Row 2
					div.c("hro-split-row", () => {
						div.c("hro-dot").style("background", PRIME25);
						p.c("hro-body", "Explicit solid bases").style("color", INK);
					});

					// Row 3
					div.c("hro-split-row", () => {
						div.c("hro-dot").style("background", PRIME25);
						p.c("hro-body", "Approved tint stacks").style("color", INK);
					});
				});
			});

			// Block C: Settings layout
			div.c("hro-settings-block", () => {
				// Sidebar
				div.c("hro-settings-sidebar", () => {
					p.c("hro-label", "SETTINGS").style("color", INK);
					div.c("hro-settings-spacer");

					// Nav items
					div.c("hro-nav-item", () => {
						p.c("hro-body", "General").style("color", SOFT);
					});
					div.c("hro-nav-item hro-nav-active", () => {
						p.c("hro-label", "Appearance").style("color", INK);
					});
					div.c("hro-nav-item", () => {
						p.c("hro-body", "Billing").style("color", SOFT);
					});
					div.c("hro-nav-item", () => {
						p.c("hro-body", "Team").style("color", SOFT);
					});
					div.c("hro-nav-item", () => {
						p.c("hro-body", "API").style("color", SOFT);
					});
				});

				// Content panel
				div.c("hro-settings-content", () => {
					p.c("hro-settings-title", "Appearance").style("color", INK);
					p.c("hro-body", "Customize how your workspace looks and feels.").style("color", SOFT);

					// Swatches row
					div.c("hro-swatches-row", () => {
						// White swatch
						div.c("hro-swatch", () => {
							p.c("hro-label", "White").style("color", INK);
							div.c("hro-swatch-bar").style("background", PRIME25);
						}).style("background", "#fff").style("border", `1px solid ${LINE}`);

						// Dark swatch
						div.c("hro-swatch", () => {
							p.c("hro-label", "Dark").style("color", "#fff");
							div.c("hro-swatch-bar").style("background", PRIME25);
						}).style("background", BROWN).style("border", `2px solid ${PRIME}`);

						// Prime swatch
						div.c("hro-swatch", () => {
							p.c("hro-label", "Prime").style("color", "#fff");
							div.c("hro-swatch-bar").style("background", "#fff");
						}).style("background", PRIME25).style("border", `1px solid ${LINE}`);
					});
				});
			});
		});
	},
});
