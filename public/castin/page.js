import { p, a, div } from '/app.js';
import root from './root/page.js';
import navigation from './navigation.js';

export default {
  link() {
    return a.c("page-link underline", "home").href("/castin/")
  },
  render() {
    navigation.render();
    p("Come closer. Every tree keeps its oldest secret at the ", root.link());
  }
}
