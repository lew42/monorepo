import { h1, p, a, pre, div, hr } from "/app.js";

app.$body.ac("theme-1");

export default {

    link(){
        return a.c("page-link", "Tailwind").href("/edric/style/tailwind/"); // abs path? !! MUST RETURN
    },

    render(){
        div.c("pad", () => {
            a.c("page-back btn bg mb", "Back").href("../");

            h1("Tailwind CSS").ac("mb").style("color", "var(--prim)");

            p("Tailwind is a different styling approach, utility classes for everything (`bg-blue-500`, `p-4`, `flex`...). Yes, you can use it here too, styling is entirely opt-in per page.");
            p("This framework has no build step, so the realistic way to add Tailwind is its CDN script, not the full CLI/PostCSS setup most Tailwind projects use.");
            p("Once it's loaded, use its classes with `.ac()` / `.c()`, exactly like any other class on this site.").ac("mb");

            hr();

            p("1. There's no `script()` helper in `/app.js` (only `stylesheet()` for CSS), so load the Tailwind CDN script with plain DOM:").ac("mb");

            pre(`const script = document.createElement("script");
script.src = "https://cdn.tailwindcss.com";
document.head.appendChild(script);`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            p("2. Once it's loaded, use Tailwind's utility classes the same way you'd use `framework.css`'s:").ac("mb");

            pre(`div.c("flex gap-4 p-4 bg-blue-500 text-white rounded-lg", () => {
    p("Styled entirely with Tailwind");
});`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            p("Heads up: Tailwind's own docs say the CDN build is for quick prototyping, not production, it compiles styles in the browser on every page load instead of ahead of time. Since this repo has no build tooling wired up, that CDN script is realistically the only way to use Tailwind here without adding a whole separate build pipeline.");
        }).style({ "max-width": "40em", margin: "0 auto" });
    }
}