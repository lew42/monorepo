import { p, b, ul, li, h4, h5, h6, code, span, figcaption, table, thead, tbody, tr, td, th, View } from '/app.js';
import navigation from '../navigation.js';
import snippet from '../components/snippet.js';

app.$body.ac("theme-1");

export default {
  app() {
    h4.c("underline", "App");
    p("The app is the entry point of our web application");
    snippet(`
      import App from './framework/code/App.js';
      const app = window.app = new App();
    `);

    p("Nothing is injected into <body> until all loaders resolve, a broken stylesheet will crash the app!");

    this.lifecycle();
    this.routing();
    this.loaders();
  },

  lifecycle() {
    h5.c("underline", "Lifecycle");
    p("When you call ", code(`App.instantiate`), " it runs a fixed, ordered pipeline.");
    p("- ", code("App.config"), " does the initial setup; for example wiring up the dev Socket on localhost ");
    p("- ", code("App.render"), " pre-render before the page loads: creates a $body and $app, then sets $app as the captor.");
    p("- ", code("App.load"), " awaits the page module, then awaits", code(`this.loaded`), "(all stylesheets and fonts)");
    p("- ", code("App.initialize"), " is an empty hook, subclasses can override this.");
    p("- ", code("App.inject"), " appends $app into <body>");
    p("- ", code(`App.ready.resolve`), " resolves the ready promise so external code can await full startup");
  },

  routing() {
    h5.c("underline", "Routing");
    p(code(`App.path_to_page_url`), " maps the browser path to a module.")
    snippet(`
      - / -> /page.js
      - /path/ -> /path/page.js
      - /path/sub/ -> /path/sub.page.js
    `);
    p(code(`Load page`), " will dynamically import the module, then append ", code(`mod.default`), " if it is present. If an error occurs, it renders a ", code(`Page Load Error`), " block");
  },

  loaders() {
    p("You can load stylesheets by calling ", code(`App.stylesheet(<stylesheet url>)`), ".This will return a promise which will be evaluated automatically by the browser when added to the DOM.");
    snippet(`App.stylesheet("/style.css")`);
  },

  view() {
    h4.c("underline", "View");
    p("A view is synonymous to a HTMLElement, it represents any of the html elements.");
    p("The ", code(`View`), " constructor expects an Object that contains a tag value, which is the html tagname of whatever html element we need to create.");
    snippet(`
      let span = new View({ tag: 'span' });
    `);
    p("This will append a new span element to the DOM");
    p("Views can be composed to build arbitrary DOM trees.");
    snippet(`
      div.c("some_class", () => {
        for (let i = 0; i < 10; i++) {
          p("This is a paragraph inside a div");
        }
      })
    `);
    p("The above snippet will create 10 paragraph elements inside a div with ", b("some_class"), " as a class name. ");
    p("The ", code(`View`), " class provides a list of function you can use to create elements.");
    snippet(`import View from './app.js';`);
    p("Here is a list of all the supported HTML Elements; ", () => {
      for (const el in View.elements()) { span(code(el), ","); }
    });

    figcaption.c("text-small", "A list of all the supported html elements");
    p("To create an element, simply call its corresponding method name in the view class. For example, to create a div, call ", code(`View.div()`));
    p("This will create a new View and append the said view into the DOM.");
    p("For convenience, all the element creation functions have been re-exported from './app.js, so you can import them directly without going through the ", code(`View`), " class");
    snippet(`
    import { div, p, h3 } from './app.js';

    export default {
      render() {
        div.c("card", () => {
          h3("Title of your card");
          p("Card content");
        });
      }
    }
    `);

    this.view_captor();
    this.view_api();
  },

  view_captor() {
    h5.c("underline", "View captor");
    p("This is what makes the declarative API work.");
    p("When you are writing your'e framework code, you never have to manually insert elements into the DOM, thats the work of the captor.")
    p("View keeps a global 'container', ",
      code(`View.captor`),
      ". When you create a view with ", code(`capture = true`), "( the default )",
      ", it is automatically appended onto the captor during prerender."
    );
    p("When you pass a function as child, like so; ", code(`div.c('card', () => { ... })`), " append_fn temporarily makes that div the captor, runs your function, then restore the previous captor.");
    p("This is how everything created inside the arrow function nests insides the card.")

    p(code(`append()`), " is polymorphic. Depending on what you hand it, a different code path is taken:");
    [
      { i: span("Another ", code("View")), o: span("appends its ", code(".el")) },
      { i: span("A ", code("POJO")), o: span("each key becomes a classed child") },
      { i: span("An ", code("Array")), o: span("flattened") },
      { i: span("A ", code("Function")), o: span("captured ") },
      { i: span("A ", code("Promise")), o: span("is appened when resolved via ", code("append_promise")) },
      { i: span("A ", code("String / DOM Node")), o: span("appended raw") },
    ].forEach(({ i, o }) => {
      p("- ", i, " → ", o)
    });
  },

  view_api() {
    h5.c("underline", "View API");
    h6.c("underline", "Classes");
    p("View provides some usefull methods to manipulate css class names;");
    p("- ", code("View.ac"), " to add a class");
    p("- ", code("View.rc"), " to remove a class");
    p("- ", code("View.tc"), " to toggle class");
    p("- ", code("View.hc"), " to check if a class exists");

    h6.c("underline", "Attributes");
    p("Some methods are also provided to manipulate html attributes;");
    p("- ", code("View.attr"), " gets OR sets an attribute by their name.");
    p("- ", code("View.href"), " sets the href attribute. Shorthand for ", code("attr('href', url)"));

    h6.c("underline", "Events");
    p("- ", code("View.on"), " adds an event listener");
    p("- ", code("View.off"), " removes an event listener");
    p("- ", code("View.click"), " is a shorthand for", code(`on('click', cb)`));

    h6.c("underline", "DOM operations");
    p("Some methods for provided for DOM operations include;");
    p("- ", code("View.insert"), " inserts a child at a given index.");
    p("- ", code("View.index"), " returns this view's position among it's parents children.");
    p("- ", code("View.remove"), " removes the element from the DOM.");
    p("- ", code("View.replace"), " replaces this element with another view or element.");
    p("- ", code("View.clone"), " returns a new View wrapping a deep clone of the element.");
    p("- ", code("View.repeat"), " clones the view n times");
    p("- ", code("View.buffer"), " swaps the live element for a static clone");
    p("- ", code("View.empty"), " clears all children");

    h6.c("underline", "Content");
    p("- ", code("View.text"), " get or set textContent.");
    p("- ", code("View.html"), " get or set innerHTML.");
    p("- ", code("View.append"), " / ", code("View.prepend"), " add children (polymorphic — see captor section).");
    p("- ", code("View.backtick_append"), " appends text, turning `backtick` spans into <code> elements — this is what p() uses.");
  },

  render() {
    navigation.render();
    this.app();
    this.view();
  }
}
