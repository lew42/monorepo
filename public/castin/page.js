import { p, a, div } from '/app.js';
import root from './root/page.js';
import navigation from './navigation.js';

export default {
  link() {
    return a.c("page-link underline", "home").href("/castin/")
  },
  // content(), not render(): a POJO default export is assigned onto a real Page,
  // so a `render` key SHADOWS Page.prototype.render — and an override owes a
  // returned view. content() is the capture-style seam this always wanted.
  content() {
    navigation.render();
    p("Come closer. Every tree keeps its oldest secret at the ", root.link());
  }
}
