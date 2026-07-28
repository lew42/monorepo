import app, { div, h2, h3, p, pre, ul, ol, li, img, input, el, Page } from "/app.js";
import { doc } from "../../ui/docs.js";

app.stylesheet(import.meta, "toggle-switch.css");

customElements.define("toggle-switch", class extends HTMLElement {
  connectedCallback() {
    const checked = this.hasAttribute("checked");
    this.innerHTML = `
      <label class="toggle-switch">
        <input type="checkbox" ${checked ? "checked" : ""}>
        <span class="slider"></span>
      </label>
    `;
    this.querySelector("input").addEventListener("change", (e) => {
      this.dispatchEvent(new CustomEvent("toggle", { detail: e.target.checked }));
    });
  }
});

export default new Page({
  meta: import.meta,
  title: "HTML basics",
  theme: "theme-1",
  content() {
    doc({
      back: "/alex/styles/",
      build() {
        p("You get these for free — no classes needed. `framework.css` applies them to plain tags so raw HTML already looks reasonable.");

        h2("The reset");
        p("`box-sizing: border-box` on everything, so padding and borders never blow out your widths.");
        p("A readable `body`: system font, `line-height: 1.5`, and a font size that scales gently with the viewport.");
        p("Media is block-level and never overflows: `img, video, svg { max-width: 100% }`.");
        p("Long words wrap instead of overflowing, and `pre` scrolls sideways rather than stretching the page.");

        h2("Live example");
        div.c("demo", () => {
          h3("A heading");
          p("A paragraph of body text. Notice the comfortable line height and spacing, all from the reset with no classes applied.");
          ul(() => {
            li("List items get sensible left padding");
            li("So the bullets are not clipped");
          });
          ol(() => {
            li("List items get sensible left padding");
            li("So the bullets are not clipped");
          })
        });

        h2("Full-width form fields");
        p("Text inputs, selects, and textareas stretch to fill their container by default, which keeps forms tidy without extra CSS:");
        div.c("demo", () => {
          input().attr("type", "text").attr("placeholder", "I fill the width automatically");
        });
        pre(`input().attr("type", "text")
     .attr("placeholder", "...");`);

        h2("Responsive image");
        p("`img` is block-level and capped at `max-width: 100%`, so it never overflows its container:");
        div.c("demo", () => {
          img()
            .attr(
              "src",
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='120'%3E%3Crect width='320' height='120' fill='%235a57ff'/%3E%3Ctext x='160' y='68' font-family='sans-serif' font-size='20' fill='white' text-anchor='middle'%3E320 x 120 image%3C/text%3E%3C/svg%3E"
            )
            .attr("alt", "Example image");
        });

        h2("Custom web components");
        p("Define once with `customElements.define()`, then use anywhere via `el(\"tag-name\")`. They're global — not scoped to this directory:");
        div.c("demo", () => {
          const $toggle = el("toggle-switch").attr("checked", "");
          const $label = el("span").ac("toggle-label").text("On");
          $toggle.on("toggle", (e) => $label.text(e.detail ? "On" : "Off"));
        });
        pre(`const $toggle = el("toggle-switch").attr("checked", "");
const $label = el("span").text("On");

$toggle.on("toggle", (e) =>
  $label.text(e.detail ? "On" : "Off")
);`);
      },
    });
  },
});
