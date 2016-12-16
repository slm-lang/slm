var Lab = require('lab');
var Template = require('../../lib/template');
var assert  = require('chai').assert;
var assertHtml = require('../helper').assertHtml;

var lab = exports.lab = Lab.script();

lab.experiment('Angular 2', function() {
  var template;
  var htmlTemplate;
  lab.before(function(done) {
    template = new Template(require('../../lib/vm_node'));
    htmlTemplate = new Template(require('../../lib/vm_node'), {mergeAttrs: { 'class': ' ' }, attrDelims: { '(': ')' },  format: 'html' });
    done();
  });

  lab.test('custom html tag names (components)', function(done) {
    assertHtml(htmlTemplate, [
      'my-component#my-component Content'
      ],
      '<my-component id="my-component">Content</my-component>',
      {}, done);
  });

  lab.test('attribute selector notation of components (brackets + inline content)', function(done) {
    assertHtml(htmlTemplate, [
      'div#my-component ( myComponent ) Content'
      ],
      '<div id="my-component" myComponent>Content</div>',
      {}, done);
  });

  lab.test('attribute selector notation of components (brackets + nested content)', function(done) {
    assertHtml(htmlTemplate, [
      'div#my-component ( myComponent )',
      '  | Content'
      ],
      '<div id="my-component" myComponent>Content</div>',
      {}, done);
  });

  lab.test('attribute selector notation of components (square brackets + inline content)', function(done) {
    assertHtml(htmlTemplate, [
      'div#my-component [myComponent] Content'
      ],
      '<div id="my-component" myComponent>Content</div>',
      {}, done);
  });

  lab.test('attribute selector notation of components (square brackets + nested content)', function(done) {
    assertHtml(htmlTemplate, [
      'div#my-component [myComponent]',
      '  | Content'
      ],
      '<div id="my-component" myComponent>Content</div>',
      {}, done);
  });

  lab.test('hash attributes without assigning', function(done) {
    assertHtml(htmlTemplate, [
      'div #item Content'
      ],
      '<div #item>Content</div>',
      {}, done);
  });

  lab.test('hash attributes VS content which starts with hash-symbol', function(done) {
    assertHtml(htmlTemplate, [
      'div #item'
      ],
      '<div #item></div>',
      {}, done);
  });

  lab.test('hash attributes VS content which starts with hash-symbol', function(done) {
    assertHtml(htmlTemplate, [
      'div',
      '  | #item'
      ],
      '<div>#item</div>',
      {}, done);
  });

  lab.test('hash attributes with assigning (inline content)', function(done) {
    assertHtml(htmlTemplate, [
      'div #item="variable" Content'
      ],
      '<div #item="variable">Content</div>',
      {}, done);
  });

  lab.test('hash attributes with assigning', function(done) {
    assertHtml(htmlTemplate, [
      'div #item="variable"',
      '  | Content'
      ],
      '<div #item="variable">Content</div>',
      {}, done);
  });

  lab.test('bracket directives', function(done) {
    assertHtml(htmlTemplate, [
      'div (click)="fireAction();" Content'
      ],
      '<div (click)="fireAction();">Content</div>',
      {}, done);
  });

  lab.test('square bracket directives (without dot in attribute)', function(done) {
    assertHtml(htmlTemplate, [
      'button [disabled]="isDisabled();" Ok'
      ],
      '<button [disabled]="isDisabled();">Ok</button>',
      {}, done);
  });

  lab.test('square bracket directives (with dot in attribute)', function(done) {
    assertHtml(htmlTemplate, [
      'button [style.color]="isSpecial ? \'red\' : \'green\'" Ok'
      ],
      '<button [style.color]="isSpecial ? \'red\' : \'green\'">Ok</button>',
      {}, done);
  });

  lab.test('two-way binding directives', function(done) {
    assertHtml(htmlTemplate, [
      'input [(ngModel)]="heroName"'
      ],
      '<input [(ngModel)]="heroName">',
      {}, done);
  });

  lab.test('two-way binding directives', function(done) {
    assertHtml(htmlTemplate, [
      'input [(ngModel)]="heroName"'
      ],
      '<input [(ngModel)]="heroName">',
      {}, done);
  });

  lab.test('astrix structural directives', function(done) {
    assertHtml(htmlTemplate, [
      'li *ngFor="let hero of heroes" {{hero.name}}'
      ],
      '<li *ngFor="let hero of heroes">{{hero.name}}</li>',
      {}, done);
  });

  lab.test('ref- syntax referencing a template reference variable', function(done) {
    assertHtml(htmlTemplate, [
      'button ref-fax Ok'
      ],
      '<button ref-fax>Ok</button>',
      {}, done);
  });

  lab.test('bind- syntax data binding', function(done) {
    assertHtml(htmlTemplate, [
      'div bind-disabled="isDisabled();" Ok'
      ],
      '<div bind-disabled="isDisabled();">Ok</div>',
      {}, done);
  });

  lab.test('bindings in round wrapper (without dot in attribute)', function(done) {
    assertHtml(htmlTemplate, [
      'div ( (click)="fireAction();" [(ngModel)]="model" [class]="isSpecial ? \'red\' : \'green\'" ) Content'
      ],
      '<div (click)="fireAction();" [(ngModel)]="model" [class]="isSpecial ? \'red\' : \'green\'">Content</div>',
      {}, done);
  });

  lab.test('bindings in round wrapper (with dot in attribute)', function(done) {
    assertHtml(htmlTemplate, [
      'div ( (click)="fireAction();" [style.color]="isSpecial ? \'red\' : \'green\'" [(ngModel)]="model" ) Content'
      ],
      '<div (click)="fireAction();" [style.color]="isSpecial ? \'red\' : \'green\'" [(ngModel)]="model">Content</div>',
      {}, done);
  });

  lab.test('bindings in square wrapper (without dot in attribute)', function(done) {
    assertHtml(htmlTemplate, [
      'div [ (click)="fireAction();" [class]="isSpecial ? \'red\' : \'green\'" [(ngModel)]="model" ] Content'
      ],
      '<div (click)="fireAction();" [class]="isSpecial ? \'red\' : \'green\'" [(ngModel)]="model">Content</div>',
      {}, done);
  });

  lab.test('bindings in square wrapper (with dot in attribute)', function(done) {
    assertHtml(htmlTemplate, [
      'div [ (click)="fireAction();" [style.color]="isSpecial ? \'red\' : \'green\'" [(ngModel)]="model" ] Content'
      ],
      '<div (click)="fireAction();" [style.color]="isSpecial ? \'red\' : \'green\'" [(ngModel)]="model">Content</div>',
      {}, done);
  });

});
