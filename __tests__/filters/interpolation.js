var Template = require('../../lib/template');

describe('Interpolate', function() {

  var template;
  beforeEach(function() {
    template = new Template(require('../../lib/vm_node'));
  });

  test('interpolation in attribute', function() {
    var src = 'p id="a${this.idHelper}b" = this.helloWorld';

    expect(
      template.render(src, {idHelper: 'someid', helloWorld: 'hello world'})
    ).toEqual(
      '<p id="asomeidb">hello world</p>'
    );
  });

  test('interpolation in attribute', function() {
    var src = 'p id="a${this.idHelper}b" = this.helloWorld';

    expect(
      template.render(src, {idHelper: 'someid', helloWorld: 'hello world'})
    ).toEqual(
      '<p id="asomeidb">hello world</p>'
    );
  });

  // Not yet
  test('nested interpolation in attribute', function() {
    var src = 'p id="${"abc${1+1}" + "("}" = this.helloWorld';

    expect(
      template.render(src, {helloWorld: 'Hello World from @env'})
    ).toEqual(
      '<p id="abc${1+1}(">Hello World from @env</p>'
    );

  });

  test('Text interpolation: Expected closing }', function() {
    var src = 'p ${abc';

    expect(function(){ template.render(src, {}); }).toThrowError('Text interpolation: Expected closing }');

  });

  test('interpolation in text', function() {
    var src =
      'p\n' +
      '  . ${this.helloWorld} with "quotes"\n' +
      'p\n' +
      '  .\n' +
      '    A message from the compiler: ${this.helloWorld}\n';

    expect(
      template.render(src, {helloWorld: 'Hello World from @env'})
    ).toEqual(
      '<p>Hello World from @env with \"quotes\" </p><p>A message from the compiler: Hello World from @env </p>');
  });

  test('interpolation in tag', function() {
    var src = 'p ${this.helloWorld}';
    expect(
      template.render(src, {helloWorld: 'Hello'})
    ).toEqual(
      '<p>Hello</p>');
  });

  test('escape interpolation', function() {
    var src =
      'p \\${this.helloWorld}\n' +
      'p text1 \\${this.helloWorld} text2';
    expect(
      template.render(src, {helloWorld: 'Hello'})
    ).toEqual(
      '<p>${this.helloWorld}</p><p>text1 ${this.helloWorld} text2</p>');
  });

  test('interpolation with escaping', function() {
    var src = '. ${this.evilMethod()}';
    expect(
      template.render(src, {evilMethod: function() {return '<script>do_something_evil();</script>';}})
    ).toEqual(
      '&lt;script&gt;do_something_evil();&lt;/script&gt; ');
  });

  test('interpolation without escaping', function() {
    var src = '| ${= this.evilMethod()}';
    expect(
      template.render(src, {evilMethod: function() {return '<script>do_something_evil();</script>';}})
    ).toEqual('<script>do_something_evil();</script>');
  });

  test('interpolation with escaping and delimiter', function() {
    var src = '| ${(this.evilMethod())}';
    expect(
      template.render(src, {evilMethod: function() {return '<script>do_something_evil();</script>';}})
    ).toEqual(
      '&lt;script&gt;do_something_evil();&lt;/script&gt;');
  });
});
