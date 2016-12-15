var ControlFlow = require('../../lib/filters/control_flow');

describe('ControlFlow', function() {

  var filter;

  beforeEach(function() {
    filter = new ControlFlow();
  });

  it('should process blocks', function(){
    expect(
      filter.exec(['block', 'while (true)', ['static', 'Hello']])
    ).toEqual(
      ['multi',
        ['code', 'while (true)'],
        ['static', 'Hello']
      ]
    );
  });

  it('should process if', function(){
    expect(
      filter.exec(['if', 'condition', ['static', 'Hello']])
    ).toEqual(
      ['multi',
        ['code', 'if(condition){'],
        ['static', 'Hello'],
        ['code', '}']
      ]
    );
  });

  it('should process if with else', function(){
    expect(
      filter.exec(['if', 'condition', ['static', 'True'], ['static', 'False']])
    ).toEqual(
      ['multi',
        ['code', 'if(condition){'],
        ['static', 'True'],
        ['code', '}else{'],
        ['static', 'False'],
        ['code', '}']
      ]
    );
  });

});
