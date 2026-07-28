import { h1, p, a, pre, div, img, video, hr } from "/app.js";

app.$body.ac("theme-1");

export default {

    link(){
        return a.c("page-link", "Media").href("/edric/style/media/"); // abs path? !! MUST RETURN
    },

    render(){
        div.c("pad", () => {
            a.c("page-back btn bg mb", "Back").href("../");

            h1("Media").ac("mb").style("color", "var(--prim)");

            p("These are the media features built into this framework:");
            p("`img, picture, video, canvas, svg`: use them for images/video, they're capped to fit their container automatically.").ac("mb");

            hr();

            p("`img, picture, video, canvas, svg`: block-level, capped at `max-width: 100%` so they can't overflow their container. This image's real size is `1200x400`, but it's capped to fit:").ac("mb");

            img().attr("src", "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='400'><rect width='100%25' height='100%25' fill='%235a57ff'/><text x='50%25' y='50%25' fill='white' font-size='40' text-anchor='middle' dominant-baseline='middle'>1200x400 image</text></svg>").ac("mb");
            pre(`img().attr("src", "wide-image.jpg");
// real size 1200x400, capped to the container's width`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            p("`svg` files work the same as any other image, just point `img()` at the file:").ac("mb");

            img().attr("src", "/edric/image/icon.svg").style({ width: "4em", height: "4em" }).ac("mb");
            pre(`img().attr("src", "/edric/image/icon.svg").style({ width: "4em", height: "4em" });`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            p("`video`: same capping applies. Add `controls` so it's playable:").ac("mb");

            video().attr("src", "/edric/image/sample-video.mp4").attr("controls", "").style({ width: "100%", "border-radius": "0.3em" }).ac("mb");
            pre(`video().attr("src", "/edric/image/sample-video.mp4").attr("controls", "");`).ac("pad").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
        }).style({ "max-width": "40em", margin: "0 auto" });
    }
}