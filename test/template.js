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
    var x = template.exec([
      'html',
      '  head: title =this.title',
      '  body',
      '    p =this.text',
      '    - for var i = 0, p; p = this.projects[i]; i++',
      '      a href=p.url',
      '        = p.name',
      '        p =p.description',
      '    - if !this.projects.length',
      '      . No projects'
    ].join('\n'));
    done();
  });
});
