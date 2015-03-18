# Slm

Slm is a template language for js. Port of [Slim](http://slim-lang.com/) but slimmer :)

[![Build Status](https://img.shields.io/travis/slm-lang/slm/master.svg?style=flat)](https://travis-ci.org/slm-lang/slm)
[![Test Coverage](https://codeclimate.com/github/slm-lang/slm/badges/coverage.svg)](https://codeclimate.com/github/slm-lang/slm)
[![Dependency Status](https://david-dm.org/slm-lang/slm.svg)](https://david-dm.org/slm-lang/slm)
[![devDependency Status](https://david-dm.org/slm-lang/slm/dev-status.svg)](https://david-dm.org/slm-lang/slm#info=devDependencies)
[![NPM version](https://badge.fury.io/js/slm.svg)](http://badge.fury.io/js/slm)
[![Code Climate](https://codeclimate.com/github/slm-lang/slm/badges/gpa.svg)](https://codeclimate.com/github/slm-lang/slm)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/slm-lang/slm?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


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
    * Comparable speed to ECT and Hogan [see benchmakrs](https://github.com/slm-lang/template-benchmark#results)
* Easy integration with hapijs
* Embedded engines like [Markdown](https://github.com/slm-lang/slm-markdown) and Textile (TBD)

## Links

* Source: <http://github.com/slm-lang/slm>
* Bugs:   <http://github.com/slm-lang/slm/issues>
* Highlighters:
  * Atom: <https://github.com/slm-lang/language-slm>
  * Sublime: <https://github.com/slm-lang/sublime-slm>
  * Vim: <https://github.com/slm-lang/vim-slm>
* Benchmark: <https://github.com/slm-lang/template-benchmark#results>
* Gulp: <https://github.com/simnalamburt/gulp-slm>
* Grunt: <https://github.com/MichaelDanilov/grunt-slm>
* Karma: <https://github.com/looker/karma-slm-preprocessor>

### How to start?

Install Slm with npm:

    npm install slm --save

### Configure to work with hapijs

```js
var Hapi = require('hapi');

var server = new Hapi.Server(3000);
server.views({
   engines: {
      'slm': require('slm')
   },
   basePath: __dirname + '/views',
   compileOptions: {
      basePath: __dirname + '/views',
      useCache: false // disable internal cache - useful for development
   },
   isCached: false // disable hapi view cache
});

server.route({
    method: 'GET', path: '/',
    handler: function (request, reply) {
      reply.view('index', {hello: "word"});
    }
});

server.start(function () {
  console.log('Server running at:', server.info.uri);
});
```

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

## Line indicators

### Text `|`

The pipe tells Slm to just copy the line. It essentially escapes any processing.
Each following line that is indented greater than the pipe is copied over.

    body
      p
        |
          This is a test of the text block.

  The parsed result of the above:

    <body><p>This is a test of the text block.</p></body>

  The left margin is set at the indent of the pipe + one space.
  Any additional spaces will be copied over.

    body
      p
        | This line is on the left margin.
           This line will have one space in front of it.
             This line will have two spaces in front of it.
               And so on...

You can also embed html in the text line

    - for (var a in this.articles)
      | <tr><td>${a.name}</td><td>${a.description}</td></tr>

### Text with trailing white space `.`

The single dot tells Slm to copy the line (similar to `|`), but makes sure that a single trailing white space is appended.

### Inline html `<` (HTML style)

You can write html tags directly in Slm which allows you to write your templates in a more html like style with closing tags or mix html and Slm style.

    <html>
      head
        title Example
      <body>
        - if this.articles.length
          table
            - for (var a in this.articles)
              <tr><td>${a.name}</td><td>${a.description}</td></tr>
      </body>
    </html>

### Control code `-`

The dash denotes control code. Examples of control code are loops and conditionals. Blocks are defined only by indentation.
If your js code needs to use multiple lines, append a backslash `\` at the end of the lines. If your line ends with comma `,` (e.g because of a method call) you don't need the additional backslash before the linebreak.
Slm inserts `(` and `)` for `if`, `for`, `else if` automatically. So you JS code is more readable.

    body
      - if !this.articles.length
        | No inventory

### Output `=`

The equal sign tells Slm it's a JS call that produces output to add to the buffer. If your JS code needs to use multiple lines, append a backslash `\` at the end of the lines, for example:

    = javascript_include_tag(\
       "jquery",
       "application")

If your line ends with comma `,` (e.g because of a method call) you don't need the additional backslash before the linebreak. For trailing or leading whitespace the modifiers `>` and `<` are supported.

* Output with trailing white space `=>`. Same as the single equal sign (`=`), except that it adds a trailing white space. The legacy syntax `='` is also supported.
* Output with leading white space `=<`. Same as the single equal sign (`=`), except that it adds a leading white space.


### Output without HTML escaping `==`

Same as the single equal sign (`=`), but does not go through the `escapeHtml` method. For trailing or leading whitespace the modifiers `>` and `<` are supported.

* Output without HTML escaping and trailing white space `==>`. Same as the double equal sign (`==`), except that it adds a trailing white space.
* Output without HTML escaping and leading white space `==<`. Same as the double equal sign (`==`), except that it adds a leading white space.

### Code comment `/`

Use the forward slash for code comments - anything after it won't get displayed in the final render. Use `/` for code comments and `/!` for html comments

    body
      p
        / This line won't get displayed.
          Neither does this line.
        /! This will get displayed as html comments.

  The parsed result of the above:

    <body><p><!--This will get displayed as html comments.--></p></body>

### HTML comment `/!`

Use the forward slash immediately followed by an exclamation mark for html comments (`<!-- ... -->`).

### IE conditional comment `/[...]`

    /[if IE]
        p Get a better browser.

renders as

    <!--[if IE]><p>Get a better browser.</p><![endif]-->


## HTML tags

### Doctype tag

The doctype tag is a special tag which can be used to generate the complex doctypes in a very simple way.

XML VERSION

    doctype xml
      <?xml version="1.0" encoding="utf-8" ?>

    doctype xml ISO-8859-1
      <?xml version="1.0" encoding="iso-8859-1" ?>

XHTML DOCTYPES

    doctype html
      <!DOCTYPE html>

    doctype 5
      <!DOCTYPE html>

    doctype 1.1
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
        "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">

    doctype strict
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

    doctype frameset
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">

    doctype basic
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN"
        "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">

    doctype transitional
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

HTML 4 DOCTYPES

    doctype strict
      <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"
        "http://www.w3.org/TR/html4/strict.dtd">

    doctype frameset
      <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN"
        "http://www.w3.org/TR/html4/frameset.dtd">

    doctype transitional
      <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
        "http://www.w3.org/TR/html4/loose.dtd">

### Closed tags (trailing `/`)

You can close tags explicitly by appending a trailing `/`.

    img src="image.png"/

Note, that this is usually not necessary since the standard html
tags (img, br, ...) are closed automatically.

### Trailing and leading whitespace (`<`, `>`)

You can force Slm to add a trailing whitespace after a tag by adding a >.

    a> href='url1' Link1
    a> href='url2' Link2

You can add a leading whitespace by adding <.

    a< href='url1' Link1
    a< href='url2' Link2

You can also combine both.

    a<> href='url1' Link1

### Inline tags

Sometimes you may want to be a little more compact and inline the tags.

    ul
      li.first: a href="/a" A link
      li: a href="/b" B link

For readability, don't forget you can wrap the attributes.

    ul
      li.first: a[href="/a"] A link
      li: a[href="/b"] B link

### Text content

Either start on the same line as the tag

    body
      h1 id="headline" Welcome to my site.

Or nest it.  You must use a pipe or an apostrophe to escape processing

    body
      h1 id="headline"
        | Welcome to my site.

### Dynamic content (`=` and `==`)

Can make the call on the same line

    body
      h1 id="headline" = this.pageHeadline

Or nest it.

    body
      h1 id="headline"
        = this.pageHeadline

### Attributes

You write attributes directly after the tag. For normal text attributes you must use double `"` or single quotes `'` (Quoted attributes).

    a href="http://slm-lang.com" title='Slm Homepage' Goto the Slm homepage

You can use text interpolation in the quoted attributes.

#### Attributes wrapper

If a delimiter makes the syntax more readable for you,
you can use the characters `(...)`, `[...]` to wrap the attributes.
You can configure these symbols.

    body
      h1(id="logo") = this.pageLogo
      h2[id="tagline" class="small tagline"] = this.pageTagline

If you wrap the attributes, you can spread them across multiple lines:

    h2[id="tagline"
       class="small tagline"] = this.pageTagline

You may use spaces around the wrappers and assignments:

    h1 id = "logo" = page_logo
    h2 [ id = "tagline" ] = this.pageTagline

#### Quoted attributes

Example:

    a href="http://slm-lang.com" title='Slm Homepage' Goto the slm homepage

You can use text interpolation in the quoted attributes:

    a href="http://${url}" Goto the ${url}

The attribute value will be escaped by default. Use == if you want to disable escaping in the attribute.

    a href=="&amp;"

You can break quoted attributes with backslash `\`

    a data-title="help" data-content="extremely long help text that goes on\
      and one and one and then starts over...."

#### Javascript attributes

Write the javascript code directly after the `=`. If the code contains spaces you have to wrap
the code into parentheses `(...)`. You can also directly write hashes `{...}` and arrays `[...]`.

    body
      table
        - for var user in this.users
          td id="user-#{user.id}" class=user.role
            a href=userAction(user, 'edit') Edit ${user.name}
            a href=pathToUser(user) = user.name

The attribute value will be escaped by default. Use == if you want to disable escaping in the attribute.

    a href==actionPath('start')

You can also break javascript attributes with backslash `\` or trailing `,` as describe for control sections.

#### Boolean attributes

The attribute values `true`, `false`, `null` and `undefinded` are interpreted
as booleans. If you use the attribute wrapper you can omit the attribute assigment.

    input type="text" disabled="disabled"
    input type="text" disabled=true
    input(type="text" disabled)

    input type="text"
    input type="text" disabled=false
    input type="text" disabled=null


#### Attribute merging

    a.menu class="highlight" href="http://slm-lang.com/" Slm-lang.com

This renders as

    <a class="menu highlight" href="http://slm-lang.com/">Slm-lang.com</a>

You can also use an `Array` as attribute value and the array elements will be merged using the delimiter.

    a class=['menu','highlight']
    a class='menu','highlight'

## Text interpolation

Use ES6 interpolation. The text will be html escaped by default.

    body
      h1 Welcome ${current_user.name} to the show.
      | Unescaped ${=content} is also possible.

To escape the interpolation (i.e. render as is)

    body
      h1 Welcome \${current_user.name} to the show.


# License

Slm is released under the [MIT license](http://www.opensource.org/licenses/MIT).


# Special Thanks

* [Andrew Stone](https://github.com/stonean), for [Slim](https://github.com/slim-template/slim)
* [Magnus Holm](https://github.com/judofyr), for [Temple](https://github.com/judofyr/temple)
* [Daniel Mendler](https://github.com/minad), for maintenance of both
* [John Firebaugh](https://github.com/jfirebaugh), for [Skim](https://github.com/jfirebaugh/skim)
* [AnjLab](http://anjlab.com), for such great team
