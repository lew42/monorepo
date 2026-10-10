import { Page, View, div, p, button } from "/app.js";

View.stylesheet(import.meta, "pricing.css");

const PRIME25 = "linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), #72c4ff";

export default new Page({
	meta: import.meta,
	title: "Pricing & Dashboard",
	icon: "payments",
	width: "full",
	description: "Pricing cards and a dashboard on the approved solid bases.",
	content() {
		div.c("prc-card", () => {
			// Header
			div.c("prc-header", () => {
				p.c("prc-title", "PRICING & DASHBOARD").style("color", "rgba(0,0,0,.8)");
				p.c("prc-tagline", "Multi-column compositions using the approved solid bases.").style("color", "rgba(0,0,0,.8)");
			});

			// Row 1: Pricing Cards
			div.c("prc-row", () => {
				// STARTER Card
				div.c("prc-pricing-card prc-starter", () => {
					p.c("prc-plan-name", "STARTER").style("color", "#72c4ff");
					p.c("prc-price", "$9").style("color", "rgba(0,0,0,.8)");
					p.c("prc-period", "per month").style("color", "rgba(0,0,0,.55)");
					div.c("prc-divider");

					div.c("prc-checks", () => {
						["5 projects", "10GB storage", "Email support"].forEach(text => {
							div.c("prc-check-row", () => {
								p.c("prc-checkmark", "✓").style("color", "#72c4ff");
								p.c("prc-check-text", text).style("color", "rgba(0,0,0,.8)");
							});
						});
					});

					button.c("prc-button", "CHOOSE PLAN").style("color", "#fff");
				}).style("background", "#fff").style("border", "1px solid rgba(0,0,0,.1)");

				// PRO Card
				div.c("prc-pricing-card prc-pro", () => {
					p.c("prc-plan-name", "PRO").style("color", "#72c4ff");
					p.c("prc-price", "$29").style("color", "#fff");
					p.c("prc-period", "per month").style("color", "rgba(255,255,255,.7)");
					div.c("prc-divider");

					div.c("prc-checks", () => {
						["Unlimited projects", "100GB storage", "Priority support", "Custom domains", "API access"].forEach(text => {
							div.c("prc-check-row", () => {
								p.c("prc-checkmark", "✓").style("color", "#72c4ff");
								p.c("prc-check-text", text).style("color", "#fff");
							});
						});
					});

					button.c("prc-button", "CHOOSE PLAN").style("color", "#fff");
				}).style("background", "#675f56");

				// ENTERPRISE Card
				div.c("prc-pricing-card prc-enterprise", () => {
					p.c("prc-plan-name", "ENTERPRISE").style("color", "#fff");
					p.c("prc-price", "$99").style("color", "#fff");
					p.c("prc-period", "per month").style("color", "#fff");
					div.c("prc-divider");

					div.c("prc-checks", () => {
						["Everything in Pro", "SSO & SAML", "Dedicated support"].forEach(text => {
							div.c("prc-check-row", () => {
								p.c("prc-checkmark", "✓").style("color", "#fff");
								p.c("prc-check-text", text).style("color", "#fff");
							});
						});
					});

					button.c("prc-button", "CONTACT US").style("color", "#fff");
				}).style("background", PRIME25);
			});

			// Row 2: Dashboard
			div.c("prc-dashboard", () => {
				// Sidebar
				div.c("prc-sidebar", () => {
					p.c("prc-sidebar-title", "Dashboard").style("color", "#fff");

					div.c("prc-nav-items", () => {
						["Overview", "Analytics", "Settings", "Team", "Billing"].forEach(item => {
							div.c("prc-nav-item", item).style("color", item === "Overview" ? "#fff" : "rgba(255,255,255,.7)");
						});
					});

					div.c("prc-user-box", () => {
						div.c("prc-avatar");
						div.c("prc-user-info", () => {
							p.c("prc-user-name", "JANE COOPER").style("color", "#fff");
							p.c("prc-user-role", "Admin").style("color", "rgba(255,255,255,.7)");
						});
					});
				});

				// Main content
				div.c("prc-main", () => {
					p.c("prc-overview-title", "Overview").style("color", "rgba(0,0,0,.8)");

					// KPI Row
					div.c("prc-kpi-row", () => {
						[
							{ label: "REVENUE", value: "$12,450" },
							{ label: "USERS", value: "1,247" },
							{ label: "GROWTH", value: "+18.2%" }
						].forEach(kpi => {
							div.c("prc-kpi-tile", () => {
								p.c("prc-kpi-label", kpi.label).style("color", "rgba(0,0,0,.8)");
								p.c("prc-kpi-value", kpi.value).style("color", "rgba(0,0,0,.8)");
							});
						});
					});

					// Activity panel
					div.c("prc-activity", () => {
						p.c("prc-activity-label", "RECENT ACTIVITY").style("color", "rgba(0,0,0,.8)");
						div.c("prc-activity-items", () => {
							["New signup: alex@demo.com", "Payment received: $299", "Team invite accepted"].forEach(text => {
								div.c("prc-activity-row", () => {
									div.c("prc-activity-bar");
									p.c("prc-activity-text", text).style("color", "rgba(0,0,0,.8)");
								});
							});
						});
					});
				});
			});
		});
	},
});
