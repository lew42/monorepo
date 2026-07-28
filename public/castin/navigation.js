import { p, ul, li, nav, a, app, style } from '/app.js';

app.stylesheet("/castin/main.css");

style(`
  .navigation {
    border-bottom: 0.05em solid black;
    padding: 1rem 0;
    height: 40px;
  }
`)

export default {
  render() {
    nav.c("navigation flex gap v-center w-fit-content", () => {
      a("Home").href("/");
      a("Castin").href("/castin/");
      a("Framework").href("/castin/framework/");
      a("Styles").href("/castin/styles/");
      a("Root").href("/castin/root/");
      a("Trunk").href("/castin/root/trunk/");
      a("Branches").href("/castin/root/trunk/branches/");
      a("Leaves").href("/castin/root/trunk/branches/leaves/");
    });
  }
}
