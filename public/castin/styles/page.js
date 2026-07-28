import { p, a, div, h1, h2, h3, h4, h5, h6, code, br, pre } from '/app.js';
import navigation from '../navigation.js';
import snippet from '../components/snippet.js';
import { span, style } from '../../framework/core/View/View.js';

app.$body.ac("theme-1");

style(`
  .zoom-ill > * {
    height: 100px;
  }
`);

export default {
  // Layers intro
  layers() {
    h5.c("underline", "Layers");
    p("The framework organises all of its CSS into three cascade layers; base, theme and util.");
    p("The priority is base < theme < util as declared in the first line of the framework stylesheet.");
    p("Important thing to note here is layer order beats specificity. For example a plain ", code(`.pad { padding: 1em; }`), " in util will override a more specific selector in theme.");
  },

  // Base layer
  base() {
    h5.c("underline", "Base");
    p("The base layer provides the lowest priority resets, defaults that anything else can override.");
    p("- ", code(`box-sizing: border-box`), "is set on everything");
    p("- Media elements (img, picture, video, canvas, svg) have", code(`display: block; max-width: 100%`), " so they never overflow");
    p("- Form controls inherit font and inputs default to full width of the container with the exception of some types; (checkbox, radio, submit, color, button and reset")

    p("- ", code(`overflow-wrap: break-word;`), " is set on ", code(`p, h1, h2, h3, h4, h5 and h6`));
    p("- Ordered and un-ordered lists have a 1.2em padding on the left", code(`ul, ol { padding-left: 1.2em; }`));
  },

  theme() {
    h5.c("underline", "Theme");
    p("The theme provides the look/visual identity of the framework. Custom css properties and styled defaults built on base.");
    p("Some custom properties defined in :root");
    snippet(`
      :root {
        --prim: #5a57ff;
        --bg: #42404B;
        --subtle: rgba(0,0,0,0.5);
        --column: 14em;
      }
    `);
    p(code(`--column`), "is used with .flex.auto, .grid.auto, and .grid.three");
  },

  utilities() {
    h5.c("underline", "Utilities");
    p("The util layer is composable, single-purpose classess you can add to any elements class list. Styles from this layer will win if they have to fight styles from theme or base");
    this.flex();
    this.grid();
    this.gap();
    this.zoom();
    p("Many of the utility classes are combinators and they only do something when composed with others like .flex/.grid");
  },

  flex() {
    h6.c("underline", "Flexbox");
    p("To activate flex add ", code(`flex`), " to your class list");
    code(`
      div.c("flex ...", ...)
    `);
    p("Use ", code(`v-center`), " to center flex items vertically");
    p("Use ", code(`h-center`), " to center flex items horizontally");
  },

  grid() {
    h6.c("underline", "CSS Grid")
    p("The ", code(`grid`), " class is provided to enable css grid layout on a container");
    div.c("_", () => code(`div.c("grid", ...)`));
    p("For automatic cell sizing add ", code(`auto`), " to your class list");
    div.c("padding", () => {
      code(`div.c("grid auto", ...)`);
    });
    p("To get three columns add", code(`three`), " to your class list");
    div.c("", () => {
      div.c("w-fit-content h-fit-content margin-b", code(`div.c("grid three", ...)`));
      div.c("grid three gap", () => {
        div.c("border", "Column 1");
        div.c("border", "Column 2");
        div.c("border", "Column 3");
      })
    });
  },

  zoom() {
    h5.c("underline", "Zoom");
    p("The utilities layer also defines some styes to control zoom level.");
    div.c("grid three gap zoom-ill", () => {
      [25, 50, 75, 100, 125, 150, 175, 200].forEach(z => {
        div.c(`zoom-${z} border`, () => {
          span(`Zoom-${z}`);
        })
      });
      div.c(`zoom-responsive`, div.c("", "Zoom responsive"))
    })
  },

  gap() {
    h6.c("underline", "Flexbox/Gridbox gap");
    p("To set a gap around flex or grid items");
    code(`div.c("flex gap ...", ...);`);
    br();
    code(`div.c("grid gap ...", ...);`);
  },

  render() {
    navigation.render();
    this.layers();
    this.base();
    this.theme();
    this.utilities();
  }
}
