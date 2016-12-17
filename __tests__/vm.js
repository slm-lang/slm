var VM = require('../lib/vm');

describe('VM', function() {

  var vm = new VM();

  test('.rejectEmpty()', function() {
    expect(vm.rejectEmpty(['a', null, 'b', '', 'c'])).toEqual(['a', 'b', 'c']);
  });

  test('.flatten()', function() {
    expect(vm.flatten([1, [2, 3], [4, [5, [6, 7]]]]))
    .toEqual(['1', '2', '3', '4', '5', '6', '7']);

    expect(vm.flatten([1, 2, [3], [4, [5, 6], 7], [8, 9]]))
    .toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9']);

    expect(vm.flatten([1, 2, [], [3, [4, 5, []], 6]]))
    .toEqual(['1', '2', '3', '4', '5', '6']);
  });

  test('.escape()', function() {
    expect(vm.escape()).toEqual('');
    expect(vm.escape(null)).toEqual('');
    expect(vm.escape(' ')).toEqual(' ');
    expect(vm.escape('<')).toEqual('&lt;');
    expect(vm.escape('>')).toEqual('&gt;');
    expect(vm.escape('"')).toEqual('&quot;');
    expect(vm.escape('&')).toEqual('&amp;');
    expect(vm.escape('<javascript>alert("alert!")</javascript>'))
      .toEqual('&lt;javascript&gt;alert(&quot;alert!&quot;)&lt;/javascript&gt;');
  });

  test('.safe()', function() {
    expect(vm.escape(vm.safe('<javascript>alert("alert!")</javascript>'))).toEqual('<javascript>alert("alert!")</javascript>');
    expect(vm.escape(vm.safe(''))).toEqual('');
    expect(vm.escape(vm.safe())).toEqual('');
    expect(vm.escape(vm.safe(null))).toEqual('');
  });
});
