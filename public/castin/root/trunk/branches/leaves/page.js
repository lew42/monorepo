import { p, a } from '/app.js';
import navigation from '../../../../navigation.js';
import branches from '../page.js';

app.$body.ac("theme-1");

export default {
  link() {
    return a.c("page-link underline", "leaves").href("/castin/root/trunk/branches/leaves/");
  },
  render() {
    navigation.render();
    p("Open to light, I finally breathe.");
    p("Let's go back to the ", branches.link());
  }
}
