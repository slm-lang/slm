# Slm 
## with Angular 2 support

Slm is a template language for js. Port of [Slim](http://slim-lang.com/) but slimmer :)

## What changed?

There are some changes in parser regexps and functions, which make possible of using Angular 2 template constructions in slim templates:
* (click)="something"
* [style]="something"
* [(ngModel)]="something"
* #localvar="something"
* #localvar
* \*ngFor="#item of items" (etc) were working fine already
* bind- (etc) were working fine already

## Conflicts and limitations

These changes in parser can be the reason of strange behavior in some **rare** cases, which can be avoided by using different notations, for example:
``
div #event
``
This will be interpreted as `div` element with `#event` attribute. In original Slm `#event` would be the content of tag. So, if you need to start the content with hash symbol, you need to do something like:
``
div 
  | #event
``
Some problems are possible if you wrap attributes with [] or (), and the first attribute is one of Angular\`s attributes with brackets. If you faced with them, try to add whitespace after wrapper opening brackets, or just reorder the attributes so the first one will be some simple html one.

There are also no validation of the brackets order for Angular2 attributes: so you can type [(ngModel]) and it will be rendered the same way without any warning. It is huge pain for me to make regexps which care of this without conditional groups (in JavaScript). Anyway, I don\`t think that this is problem.

## Original Slm links

* Source: <http://github.com/slm-lang/slm>
* Bugs:   <http://github.com/slm-lang/slm/issues>
* Highlighters:
  * Atom: <https://github.com/slm-lang/language-slm>
  * Sublime: <https://github.com/slm-lang/sublime-slm>
  * Vim: <https://github.com/slm-lang/vim-slm>
  * VS Code: <https://github.com/mrmlnc/vscode-slm>
* Benchmark: <https://github.com/slm-lang/template-benchmark#results>
* Gulp: <https://github.com/simnalamburt/gulp-slm>
* Grunt: <https://github.com/MichaelDanilov/grunt-slm>
* Karma: <https://github.com/looker/karma-slm-preprocessor>
* Webpack: <https://github.com/wealthbar/slm-loader>

### How to start?

This npm module is not published in npm, and used in some tools (https://github.com/sintro/slm-brunch) directrly by this git repo. 
Hope, one day the angular2 support will be the part of original Slm and there will be no reason to produce clone-modules in npm.
 
# License

Slm-angular2 is released under the [MIT license](http://www.opensource.org/licenses/MIT).

# Special Thanks

* [Yury Korolev](https://github.com/yury), for [original Slm](https://github.com/slm-lang/slm)
