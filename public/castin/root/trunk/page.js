import { div, p, a, span } from '/app.js';
import navigation from '../../navigation.js';
import branches from './branches/page.js';
import root from '../page.js';

app.$body.ac("theme-1");

export default {
  link() {
    return a.c("page-link underline", "trunk").href("/castin/root/trunk/")
  },
  render() {
    navigation.render();
    p("Rising steady, I carry the weight of these darn ", branches.link());
    p("Let's go back to the ", root.link());
  }
}
