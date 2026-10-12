import { Page, View, div, p, h1, h4, hr, button } from "/app.js";

View.stylesheet(import.meta, "pricing.css");

export default new Page({
	meta: import.meta,
	title: "Pricing & Dashboard",
	icon: "payments",
	width: "full",
	description: "Pricing cards and a dashboard on the approved solid bases.",
	content() {
		div.c("prc-page", () => {
			// Header
			div.c("prc-header", () => {
				h1("PRICING & DASHBOARD");
				p.c("muted", "Multi-column compositions using the approved solid bases.");
			});

			// Row 1: Pricing Cards
			div.c("grid auto gap", () => {
				// STARTER Card
				div.c("card prc-pricing-card", () => {
					h4.c("prc-plan-name", "STARTER");
					p.c("prc-price", "$9");
					p.c("muted", "per month");
					hr();

					div.c("flex v gap", () => {
						["5 projects", "10GB storage", "Email support"].forEach(text => {
							div.c("flex gap", () => {
								p.c("prc-checkmark", "✓");
								p(text);
							});
						});
					});

					button.c("prim", "CHOOSE PLAN");
				});

				// PRO Card
				div.c("card bg-dark prc-pricing-card", () => {
					h4.c("prc-plan-name", "PRO");
					p.c("prc-price", "$29");
					p.c("muted", "per month");
					hr();

					div.c("flex v gap", () => {
						["Unlimited projects", "100GB storage", "Priority support", "Custom domains", "API access"].forEach(text => {
							div.c("flex gap", () => {
								p.c("prc-checkmark", "✓");
								p(text);
							});
						});
					});

					button.c("prim", "CHOOSE PLAN");
				});

				// ENTERPRISE Card
				div.c("card bg-prime prc-pricing-card", () => {
					h4("ENTERPRISE");
					p.c("prc-price", "$99");
					p.c("muted", "per month");
					hr();

					div.c("flex v gap", () => {
						["Everything in Pro", "SSO & SAML", "Dedicated support"].forEach(text => {
							div.c("flex gap", () => {
								p("✓");
								p(text);
							});
						});
					});

					button("CONTACT US");
				});
			});

			// Row 2: Dashboard
			div.c("flex gap prc-dashboard", () => {
				// Sidebar
				div.c("card bg-dark prc-sidebar", () => {
					h4("Dashboard");

					div.c("flex v gap", () => {
						["Overview", "Analytics", "Settings", "Team", "Billing"].forEach(item => {
							div.c("prc-nav-item" + (item === "Overview" ? " bg-lighten" : " muted"), item);
						});
					});

					div.c("card prc-user-box", () => {
						div.c("prc-avatar");
						div.c("flex v", () => {
							h4("JANE COOPER");
							p.c("muted", "Admin");
						});
					});
				});

				// Main content
				div.c("card flex-1 prc-main", () => {
					h4("Overview");

					// KPI Row
					div.c("flex gap", () => {
						[
							{ label: "REVENUE", value: "$12,450" },
							{ label: "USERS", value: "1,247" },
							{ label: "GROWTH", value: "+18.2%" }
						].forEach(kpi => {
							div.c("card flex-1", () => {
								h4.c("muted", kpi.label);
								p.c("prc-kpi-value", kpi.value);
							});
						});
					});

					// Activity panel
					div.c("card", () => {
						h4("RECENT ACTIVITY");
						div.c("flex v gap", () => {
							["New signup: alex@demo.com", "Payment received: $299", "Team invite accepted"].forEach(text => {
								div.c("flex gap prc-activity-row", () => {
									div.c("prc-activity-bar");
									p(text);
								});
							});
						});
					});
				});
			});
		});
	},
});
