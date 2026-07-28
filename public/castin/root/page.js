import { p, a } from '/app.js';
import navigation from '../navigation.js';
import trunk from './trunk/page.js';
import home from '../page.js';

app.$body.ac("theme-1");

export default {
  link() {
    return a.c("page-link underline", "root").href("/castin/root/")
  },
  render() {
    navigation.render();
    p("Deep in the dark, unseen, I hold on to the ", trunk.link());
    p("Let's go back ", home.link());
  }
}
