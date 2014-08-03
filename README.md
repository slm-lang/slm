# Slm

Slm is a template language for js. Port of [Slim](http://slim-lang.com/) but slimmer :)

## A little bit of history

HAML -> Jade -> Slim -> Slm

### Short list of the features

* Elegant syntax
    * Short syntax without closing tags (Using indentation instead)
    * HTML style mode with closing tags
    * Shortcut tags (based on css selectors)
* Safety
    * Automatic HTML escaping by default
    * Support `htmlSafe` attribute on String objects
* Highly configurable and extendable via plugins
* High performance
    * Comparable speed to ECT and Hogan
* Easy integration with hapijs
* Embedded engines like Markdown and Textile (TBD)

## Links

* Source: <http://github.com/slm-lang/slm>
* Bugs:   <http://github.com/slm-lang/slm/issues>
* Highlighters:
  * Atom: <https://github.com/slm-lang/language-slm>
  * Sublime: <https://github.com/slm-lang/sublime-slm>

### How to start?

Install Slm with npm:

    npm install slm --save

### Syntax example

Here's a quick example to demonstrate what a Slm template looks like:

    doctype html
    html
      head
        title Slm Examples
        meta name="keywords" content="template language"
        meta name="author" content=this.author
        javascript:
          alert('Slm supports embedded javascript!')

      body
        h1 Markup examples

        #content
          p This example shows you how a basic Slm file looks.

        == content()

        - if this.items.length
          table#items
            - for item in this.items
              tr
                td.name = item.name
                td.price = item.price
        - else
          p No items found Please add some inventory.
            Thank you!

        div id="footer"
          == partial('footer')
          | Copyright &copy; ${this.year} ${this.author}

Indentation matters, but the indentation depth can be chosen as you like. If you want to first indent 2 spaces, then 5 spaces, it's your choice. To nest markup you only need to indent by one space, the rest is gravy.
