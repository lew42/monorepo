import { Page, View, div, p, button } from "/app.js";

View.stylesheet(import.meta, "hero.css");

export default new Page({
	meta: import.meta,
	title: "Hero & Navigation",
	icon: "web",
	width: "full",
	description: "Nav, hero content and footer in three compositions: nav+hero+footer, split hero and a settings layout.",
	content() {
		div.c("card hro-page", () => {
			// Header
			div.c("hro-header", () => {
				p.c("h1", "HERO LAYOUTS");
				p.c("muted", "Nav, hero content, and footer. Three bases in composition.");
			});

			// Block A: Nav + hero + footer
			div.c("hro-block", () => {
				// Nav bar
				div.c("hro-nav-bar bg-white", () => {
					p.c("h4", "ACME");
					div.c("flex gap", () => {
						p.c("h4 muted", "Products");
						p.c("h4 muted", "Pricing");
						p.c("h4 muted", "Docs");
					});
				});

				// Hero section
				div.c("hro-hero-section bg-white", () => {
					p.c("h1", "One system.");
					p.c("h1", "Every context.");
					p("Your variables adapt automatically. Set the mode on a parent frame");
					p.c("muted", "and every child resolves through your scheme — no manual overrides.");

					// Stats row
					div.c("flex gap", () => {
						[["3", "Bases"], ["6", "Styles"], ["∞", "Combos"]].forEach(([n, label]) => {
							div.c("card bg-darken hro-stat-card", () => {
								p.c("h1", n);
								p.c("h4 muted", label);
							});
						});
					});
				});

				// Footer bar
				div.c("hro-footer-bar bg-dark", () => {
					p.c("muted", "© 2026 Acme Inc.");
					p.c("h4 hro-accent", "Privacy · Terms · Status");
				});
			});

			// Block B: Split hero
			div.c("hro-split-hero", () => {
				// Left panel
				div.c("hro-split-left bg-dark", () => {
					p.c("h2", "Built for the night.");
					p.c("muted", "A color system that adapts. Switch bases in one decision — your entire UI follows.");

					// Buttons
					div.c("flex gap", () => {
						button.c("prim", "GET STARTED");
						button.c("bg-lighten hro-ghost-button", "LEARN MORE");
					});
				});

				// Right panel
				div.c("hro-split-right bg-white", () => {
					p.c("h4 hro-accent", "WHAT YOU GET");

					["Adaptive tokens", "Explicit solid bases", "Approved tint stacks"].forEach(text => {
						div.c("flex gap v-center", () => {
							div.c("hro-dot");
							p(text);
						});
					});
				});
			});

			// Block C: Settings layout
			div.c("hro-settings-block", () => {
				// Sidebar
				div.c("hro-settings-sidebar bg-white", () => {
					p.c("h4", "SETTINGS");
					div.c("hro-settings-spacer");

					// Nav items
					[["General", false], ["Appearance", true], ["Billing", false], ["Team", false], ["API", false]].forEach(([label, active]) => {
						div.c(`hro-nav-item${active ? " card selected" : ""}`, () => {
							if (active) p.c("h4", label);
							else p.c("muted", label);
						});
					});
				});

				// Content panel
				div.c("hro-settings-content bg-white", () => {
					p.c("h2", "Appearance");
					p.c("muted", "Customize how your workspace looks and feels.");

					// Swatches row
					div.c("flex gap", () => {
						[["White", "bg-white", ""], ["Dark", "bg-dark", "selected"], ["Prime", "bg-prime", ""]].forEach(([label, ground, extra]) => {
							div.c(`card hro-swatch ${ground} ${extra}`.trim(), () => {
								p.c("h4", label);
								div.c("hro-swatch-bar");
							});
						});
					});
				});
			});
		});
	},
});
