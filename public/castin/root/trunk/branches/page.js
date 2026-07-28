import { p, a, span } from '/app.js';
import navigation from '../../../navigation.js';
import leaves from './leaves/page.js';
import trunk from '../page.js';

app.$body.ac("theme-1");

export default {
  link() {
    return a.c("page-link underline", "branches").href("/castin/root/trunk/branches/")
  },
  render() {
    navigation.render();
    p("Reaching wider, I learn to let go and stretch out for the ", leaves.link());
    p("Let's go back to the ", trunk.link());
  }
}
