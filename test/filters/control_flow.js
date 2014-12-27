var Lab = require('lab');
var ControlFlow = require('../../lib/filters/control_flow');
var assert  = require('chai').assert;

var lab = exports.lab = Lab.script();


lab.experiment('ControlFlow', function() {

  var filter;

  lab.before(function(done) {
    filter = new ControlFlow();
    done();
  });

  lab.test('should process blocks', function(done){
    assert.deepEqual(
      filter.exec(['block', 'while (true)', ['static', 'Hello']]),
      ['multi',
        ['code', 'while (true)'],
        ['static', 'Hello']
      ]
    );
    done();
  });

  lab.test('should process if', function(done){
    assert.deepEqual(
      filter.exec(['if', 'condition', ['static', 'Hello']]),
      ['multi',
        ['code', 'if(condition){'],
        ['static', 'Hello'],
        ['code', '}']
      ]
    );
    done();
  });

  lab.test('should process if with else', function(done){
    assert.deepEqual(
      filter.exec(['if', 'condition', ['static', 'True'], ['static', 'False']]),
      ['multi',
        ['code', 'if(condition){'],
        ['static', 'True'],
        ['code', '}else{'],
        ['static', 'False'],
        ['code', '}']
      ]
    );
    done();
  });

});
