var Lab = require('lab'),
    Template = require('../lib/template');

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite("Engine", function() {
  var template;
  before(function(done) {
    template = new Template
    done();
  });

  test('it works!!', function(done) {
    var x = template.exec(
      'html\n' +
      '  head\n' +
      '    title =this.title\n' +
      '  body\n' +
      '    p =this.text\n' +
      '    - for (var i = 0, p; p = this.projects[i]; i++) {\n' +
      '      a href="${p.url}"\n' +
      '        = p.name\n' +
      '        p =p.description\n' +
      '      - }\n' +
      '    - if (!this.projects.length) {\n' +
      '      . No projects\n' +
      '      - }\n'
    );
    console.log(x);
    done();
  });
});
