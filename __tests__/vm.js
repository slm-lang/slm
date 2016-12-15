var Lab = require('lab');
var VM = require('../lib/vm');
var assert  = require('chai').assert;

var lab = exports.lab = Lab.script();

lab.experiment('VM', function() {

  var vm = new VM();

  lab.test('.rejectEmpty()', function(done) {
    assert.deepEqual(
      vm.rejectEmpty(['a', null, 'b', '', 'c']),
      ['a', 'b', 'c']
    );
    done();
  });

  lab.test('.flatten()', function(done) {
    assert.deepEqual(
      vm.flatten([1, [2, 3], [4, [5, [6, 7]]]]),
      ['1', '2', '3', '4', '5', '6', '7']
    );

    assert.deepEqual(
      vm.flatten([1, 2, [3], [4, [5, 6], 7], [8, 9]]),
      ['1', '2', '3', '4', '5', '6', '7', '8', '9']
    );

    assert.deepEqual(
      vm.flatten([1, 2, [], [3, [4, 5, []], 6]]),
      ['1', '2', '3', '4', '5', '6']
    );
    done();
  });

  lab.test('.escape()', function(done) {
    assert.deepEqual(vm.escape(), '');
    assert.deepEqual(vm.escape(null), '');
    assert.deepEqual(vm.escape(' '), ' ');
    assert.deepEqual(vm.escape('<'), '&lt;');
    assert.deepEqual(vm.escape('>'), '&gt;');
    assert.deepEqual(vm.escape('"'), '&quot;');
    assert.deepEqual(vm.escape('&'), '&amp;');
    assert.deepEqual(vm.escape('<javascript>alert("alert!")</javascript>'), '&lt;javascript&gt;alert(&quot;alert!&quot;)&lt;/javascript&gt;');

    done();
  });

  lab.test('.safe()', function(done) {
    assert.deepEqual(vm.escape(vm.safe('<javascript>alert("alert!")</javascript>')), '<javascript>alert("alert!")</javascript>');
    assert.deepEqual(vm.escape(vm.safe('')), '');
    assert.deepEqual(vm.escape(vm.safe()), '');
    assert.deepEqual(vm.escape(vm.safe(null)), '');

    done();
  });
});
