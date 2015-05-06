var attrDelimRe = /^\s*([\(\)\[\]])/;
var blockExpressionRe = /^\s*:\s*/;
var closedTagRe = /^\s*\/\s*/;
var delimRe = /^[\(\[]/;
var doctypeRe = /^doctype\b/i;
var embededRe = /^(\w+):\s*$/;
var emptyLineRe = /^\s*$/;
var htmlCommentRe = /^\/!(\s?)/;
var htmlConditionalCommentRe = /^\/\[\s*(.*?)\s*\]\s*$/;
var indentRegex  = /^[ \t]+/;
var indentationRe = /^\s+/;
var newLineRe = /\r?\n/;
var nextLineRe = /[,\\]$/;
var outputBlockRe = /^=(=?)([<>]*)/;
var outputCodeRe  = /^\s*=(=?)([<>]*)/;
var tabRe = /\t/g;
var textBlockRe = /^((\.)(\s|$))|^((\|)(\s?))/;
var textContentRe = /^( ?)(.*)$/;

var tagRe = /^(?:#|\.|\*(?=[^\s]+)|(\w+(?:\w+|:|-)*\w|\w+))/;
var attrShortcutRe = /^([\.#]+)((?:\w+|-)*)/;

var attrName = '^\\s*((?!\\${)[^\\0\\"\'><\\/=\\s\\[\\]()\\.#]+)';
var quotedAttrRe = new RegExp(attrName + '\\s*=(=?)\\s*("|\')');
var codeAttrRe = new RegExp(attrName + '\\s*=(=?)\\s*');

var tagShortcut = {
  '.': 'div',
  '#': 'div'
};
var attrShortcut = {
  '#': ['id'],
  '.': ['class']
};
var attrDelims = {
  '(': ')',
  '[': ']'
};

function Parser() { }

var p = Parser.prototype;

p._escapeRegExp = function(str) {
  if (!str) {
    return '';
  }
  return str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
};

p._reset = function(lines, stacks) {
  // Since you can indent however you like in Slm, we need to keep a list
  // of how deeply indented you are. For instance, in a template like this:
  //
  //   doctype       # 0 spaces
  //   html          # 0 spaces
  //    head         # 1 space
  //       title     # 4 spaces
  //
  // indents will then contain [0, 1, 4] (when it's processing the last line.)

  // We uses this information to figure out how many steps we must "jump"
  // out when we see an de-indented line.
  this._indents = [];

  //  Whenever we want to output something, we'll *always* output it to the
  //  last stack in this array. So when there's a line that expects
  //  indentation, we simply push a new stack onto this array. When it
  //  processes the next line, the content will then be outputted into that
  //  stack.
  this._stacks = stacks || [];

  this._lineno = 0;
  this._lines = lines;
  this._line = this._origLine = null;

  this._indents._last = this._stacks._last = function() {
    return this[this.length - 1];
  };
};

p._pushOnTop = function(item) {
  this._stacks._last().push(item);
};

p._sliceLine = function(beginSlice) {
  this._line = this._line.slice(beginSlice);
};

p._nextLine = function() {
  if (this._lines.length) {
    this._origLine = this._lines.shift();
    this._lineno++;
    this._line = this._origLine;
  } else {
    this._origLine = this._line = null;
  }

  return this._line;
};

p._getIndent = function(line) {
  // Figure out the indentation. Kinda ugly/slow way to support tabs,
  // but remember that this is only done at parsing time.
  var m = line.match(indentRegex);
  return m ? m[0].replace(tabRe, ' ').length : 0;
};

p.exec = function(str, options) {
  if (options && options.filename) {
    this._file = options.filename;
  } else {
    this._file = null;
  }
  var res = ['multi'];
  this._reset(str.split(newLineRe), [res]);

  while (this._nextLine() !== null) {
    this._parseLine();
  }

  this._reset();

  return res;
};

p._parseLine = function() {
  if (emptyLineRe.test(this._line)) {
    this._pushOnTop(['newline']);
    return;
  }

  var indent = this._getIndent(this._line);

  // Choose first indentation yourself
  if (!this._indents.length) {
    this._indents.push(indent);
  }

  // Remove the indentation
  this._line = this._line.replace(indentationRe, '');

  // If there's more stacks than indents, it means that the previous
  // line is expecting this line to be indented.
  var expectingIndentation = this._stacks.length > this._indents.length;

  if (indent > this._indents._last()) {
    // This line was actually indented, so we'll have to check if it was
    // supposed to be indented or not.

    if (!expectingIndentation) {
      this._syntaxError('Unexpected indentation');
    }

    this._indents.push(indent);
  } else {
    // This line was *not* indented more than the line before,
    // so we'll just forget about the stack that the previous line pushed.
    if (expectingIndentation) {
      this._stacks.pop();
    }

    // This line was deindented.
    // Now we're have to go through the all the indents and figure out
    // how many levels we've deindented.
    while (indent < this._indents._last() && this._indents.length > 1) {
      this._indents.pop();
      this._stacks.pop();
    }

    // This line's indentation happens lie "between" two other line's
    // indentation:
    //
    //   hello
    //       world
    //     this      # <- This should not be possible!

    if (indent !== this._indents._last()) {
      this._syntaxError('Malformed indentation');
    }
  }

  this._parseLineIndicators();
};

var _parseHtmlComment = function(parser, m) {
  parser._pushOnTop(['html', 'comment',
    [
      'slm', 'text',
      parser._parseTextBlock(parser._line.slice(m[0].length),
      parser._indents._last() + m[1].length + 2)
    ]
  ]);
};

var _parseHtmlConditionalComment = function(parser, m) {
  var block = ['multi'];
  parser._pushOnTop(['html', 'condcomment', m[1], block]);
  parser._stacks.push(block);
};

var _parseTextBlock = function(parser, m) {
  var char, space;
  if (m[2] === undefined) {
    char = m[5];
    space = m[6];
  } else {
    char = m[2];
    space = m[3];
  }
  var trailingWS = char === '.';

  parser._pushOnTop([
    'slm', 'text',
    parser._parseTextBlock(parser._line.slice(m[0].length),
    parser._indents._last() + space.length + 1)
  ]);

  if (trailingWS) {
    parser._pushOnTop(['static', ' ']);
  }
};

var _parseOutputBlock = function(parser, m) {
  // We expect the line to be broken or the next line to be indented.
  parser._sliceLine(m[0].length);

  var trailingWS = m[2].indexOf('>') !== -1;
  var block = ['multi'];
  if (m[2].indexOf('<') !== -1) {
    parser._pushOnTop(['static', ' ']);
  }
  parser._pushOnTop(['slm', 'output', m[1].length === 0, parser._parseBrokenLine(), block]);
  if (trailingWS) {
    parser._pushOnTop(['static', ' ']);
  }
  parser._stacks.push(block);
};

var _parseEmbeded = function(parser, m) {
  // It is treated as block.
  parser._pushOnTop(['slm', 'embedded', m[1], parser._parseTextBlock()]);
};


var _parseCommentBlock = function(parser) {
  while (parser._lines.length) {
    if (!emptyLineRe.test(parser._lines[0])) {
      var indent = parser._getIndent(parser._lines[0]);
      if (indent <= parser._indents._last()) {
        break;
      }
    }

    parser._nextLine();
    parser._pushOnTop(['newline']);
  }
};

var _parseInlineHtml = function(parser) {
  var block = ['multi'];
  parser._pushOnTop(['multi', ['slm', 'interpolate', parser._line], block]);
  parser._stacks.push(block);
};

var _parseCodeBlock = function(parser) {
  // We expect the line to be broken or the next line to be indented.
  parser._sliceLine(1);
  var block = ['multi'];
  parser._pushOnTop(['slm', 'control', parser._parseBrokenLine(), block]);
  parser._stacks.push(block);
};

var _parseDoctype = function(parser, m) {
  var value = parser._line.slice(m[0].length).trim();
  parser._pushOnTop(['html', 'doctype', value]);
};

var _parseTag = function(parser, m) {
  if (m[1]) {
    parser._sliceLine(m[0].length);
  }
  parser._parseTag(m[0]);
};

p._matchLineThen = function(regex, next) {
  var m = regex.exec(this._line);
  if (m) {
    next(this, m);
    return true;
  }
  return false;
};

p._ifTrueThen = function(condition, next) {
  if (condition) {
    next(this);
    return true;
  }

  return false;
};

p._parseLineIndicators = function() {
  for (;;) {
    var firstChar = this._line[0];

    if (
      // HTML comment
      this._matchLineThen(htmlCommentRe, _parseHtmlComment) ||
      // or HTML conditional comment
      this._matchLineThen(htmlConditionalCommentRe, _parseHtmlConditionalComment) ||
      // Slm comment
      this._ifTrueThen(firstChar === '/', _parseCommentBlock) ||
      // Text block.
      this._matchLineThen(textBlockRe, _parseTextBlock) ||
      // Inline html
      this._ifTrueThen(firstChar === '<', _parseInlineHtml) ||
      // Code block.
      this._ifTrueThen(firstChar === '-', _parseCodeBlock) ||
      // Output block.
      this._matchLineThen(outputBlockRe, _parseOutputBlock) ||
      // Embedded template.
      this._matchLineThen(embededRe, _parseEmbeded) ||
      // Doctype declaration
      this._matchLineThen(doctypeRe, _parseDoctype) ||
      // HTML tag
      this._matchLineThen(tagRe, _parseTag)) {
        this._pushOnTop(['newline']);
        return;
      }
    this._syntaxError('Unknown line indicator');
  }
};

p._parseShortcutAttributes = function() {
  // Find any shortcut attributes
  var attributes = ['html', 'attrs'], m;
  while ((m = attrShortcutRe.exec(this._line))) {
    // The class/id attribute is :static instead of 'slm' 'interpolate',
    // because we don't want text interpolation in .class or #id shortcut
    var shortcut = attrShortcut[m[1]];
    if (!shortcut) {
      this._syntaxError('Illegal shortcut');
    }

    for (var i = 0, il = shortcut.length; i < il; i++) {
      attributes.push(['html', 'attr', shortcut[i], ['static', m[2]]]);
    }

    this._sliceLine(m[0].length);
  }
  return attributes;
};

p._parseTag = function(tag) {
  var m, trailingWS, leadingWS;
  if (tagShortcut[tag]) {
    tag = tagShortcut[tag];
  }

  var attributes = this._parseShortcutAttributes();
  m = /^[<>]+/.exec(this._line);
  if (m) {
    this._sliceLine(m[0].length);
    trailingWS = m[0].indexOf('>') !== -1;
    leadingWS = m[0].indexOf('<') !== -1;
  }

  this._parseAttributes(attributes);

  tag = ['html', 'tag', tag, attributes];

  if (leadingWS) {
    this._pushOnTop(['static', ' ']);
  }
  this._pushOnTop(tag);
  if (trailingWS) {
    this._pushOnTop(['static', ' ']);
  }

  for(;;) {
    // Block expansion
    m = blockExpressionRe.exec(this._line);
    if (m) {
      this._sliceLine(m[0].length);
      if (!(m = tagRe.exec(this._line))) {
        this._syntaxError('Expected tag');
      }

      if (m[1]) {
        this._sliceLine(m[0].length);
      }

      var content = ['multi'];
      tag.push(content);

      var sl = this._stacks.length;
      this._stacks.push(content);
      this._parseTag(m[0]);
      this._stacks.splice(sl, 1);

      break;
    }

    // Handle output code
    m = outputCodeRe.exec(this._line);
    if (m) {
      this._sliceLine(m[0].length);
      var trailingWS2 = m[2].indexOf('>') !== -1;

      var block = ['multi'];

      if (!leadingWS && m[2].indexOf('<') !== -1) {
        var lastStack = this._stacks._last();
        lastStack.splice(lastStack.length - 1, 0, ['static', ' ']);
      }

      tag.push(['slm', 'output', m[1] !== '=', this._parseBrokenLine(), block]);
      if (!trailingWS && trailingWS2) {
        this._pushOnTop(['static', ' ']);
      }
      this._stacks.push(block);
      break;
    }

    // Closed tag. Do nothing
    m = closedTagRe.exec(this._line);
    if (m) {
      this._sliceLine(m[0].length);
      if (this._line.length) {
        this._syntaxError('Unexpected text after closed tag');
      }
      break;
    }

    // Empty content
    if (emptyLineRe.test(this._line)) {
      var emptyContent = ['multi'];
      tag.push(emptyContent);
      this._stacks.push(emptyContent);
      break;
    }

    // Text content
    m = textContentRe.exec(this._line);
    if (m) {
      tag.push(['slm', 'text', this._parseTextBlock(m[2], this._origLine.length - this._line.length + m[1].length, true)]);
      break;
    }

    break;
  }
};

p._parseAttributes = function(attributes) {
  // Check to see if there is a delimiter right after the tag name
  var delimiter, m;

  m = attrDelimRe.exec(this._line);
  if (m) {
    delimiter = attrDelims[m[1]];
    this._sliceLine(m[0].length);
  }

  var booleanAttrRe, endRe;
  if (delimiter) {
    booleanAttrRe = new RegExp(attrName + '(?=(\\s|' + this._escapeRegExp(delimiter) + '|$))');
    endRe = new RegExp('^\\s*' + this._escapeRegExp(delimiter));
  }

  while (true) {
    // Value is quoted (static)
    m = quotedAttrRe.exec(this._line);
    if (m) {
      this._sliceLine(m[0].length);
      attributes.push(['html', 'attr', m[1],
                      ['escape', !m[2].length, ['slm', 'interpolate', this._parseQuotedAttribute(m[3])]]]);
      continue;
    }

    // Value is JS code
    m = codeAttrRe.exec(this._line);
    if (m) {
      this._sliceLine(m[0].length);
      var name = m[1], escape = !m[2].length;
      var value = this._parseJSCode(delimiter);

      if (!value.length) {
        this._syntaxError('Invalid empty attribute');
      }
      attributes.push(['html', 'attr', name, ['slm', 'attrvalue', escape, value]]);
      continue;
    }

    if (!delimiter) {
      break;
    }

    // Boolean attribute
    m = booleanAttrRe.exec(this._line);
    if (m) {
      this._sliceLine(m[0].length);
      attributes.push(['html', 'attr', m[1], ['multi']]);
      continue;
    }
    // Find ending delimiter
    m = endRe.exec(this._line);
    if (m) {
      this._sliceLine(m[0].length);
      break;
    }

    // Found something where an attribute should be
    this._line = this._line.replace(indentationRe, '');
    if (this._line.length) {
      this._syntaxError('Expected attribute');
    }

    // Attributes span multiple lines
    this._pushOnTop(['newline']);

    if (!this._lines.length) {
      this._syntaxError('Expected closing delimiter ' + delimiter);
    }
    this._nextLine();
  }
};

p._parseTextBlock = function(firstLine, textIndent, inTag) {
  var result = ['multi'];

  if (!firstLine || !firstLine.length) {
    textIndent = null;
  } else {
    result.push(['slm', 'interpolate', firstLine]);
  }

  var emptyLines = 0;

  while (this._lines.length) {
    if (emptyLineRe.test(this._lines[0])) {
      this._nextLine();
      result.push(['newline']);

      if (textIndent) {
        emptyLines++;
      }
    } else {
      var indent = this._getIndent(this._lines[0]);

      if (indent <= this._indents._last()) {
        break;
      }

      if (emptyLines) {
        result.push(['slm', 'interpolate', new Array(emptyLines + 1).join('\n')]);
        emptyLines = 0;
      }

      this._nextLine();
      this._line = this._line.replace(indentationRe, '');

      // The text block lines must be at least indented
      // as deep as the first line.

      var offset = textIndent ? indent - textIndent : 0;

      if (offset < 0) {
        this._syntaxError('Text line not indented deep enough.\n' +
                         'The first text line defines the necessary text indentation.' +
                         (inTag ? '\nAre you trying to nest a child tag in a tag containing text? Use | for the text block!' : ''));
      }

      result.push(['newline']);
      result.push(['slm', 'interpolate', (textIndent ? '\n' : '') + new Array(offset + 1).join(' ') + this._line]);

      // The indentation of first line of the text block
      // determines the text base indentation.
      textIndent = textIndent || indent;
    }
  }

  return result;
};


p._parseBrokenLine = function() {
  var brokenLine = this._line.trim(), m;
  while ((m = nextLineRe.exec(brokenLine))) {
    this._expectNextLine();
    if (m[0] === '\\') {
      brokenLine = brokenLine.slice(0, brokenLine.length - 2);
    }
    brokenLine += '\n' + this._line;
  }
  return brokenLine;
};

p._parseJSCode = function(outerDelimeter) {
  var code = '', count = 0, delimiter, closeDelimiter, m;

  // Attribute ends with space or attribute delimiter
  var endRe = new RegExp('^[\\s' + this._escapeRegExp(outerDelimeter) + ']');

  while (this._line.length && (count || !endRe.test(this._line))) {
    m = nextLineRe.exec(this._line);
    if (m) {
      if (m[0] === '\\') {
        code += this._line.slice(0, this._line.length - 2);
      } else  {
        code += this._line;
      }
      code += '\n';
      this._expectNextLine();
    } else {
      if (count > 0) {
        if (this._line[0] === delimiter[0]) {
          count++;
        } else if (this._line[0] === closeDelimiter[0]) {
          count--;
        }
      } else {
        m = delimRe.exec(this._line);
        if (m) {
          count = 1;
          delimiter = m[0];
          closeDelimiter = attrDelims[delimiter];
        }
      }

      code += this._line[0];
      this._sliceLine(1);
    }
  }

  if (count) {
    this._syntaxError('Expected closing delimiter ' + closeDelimiter);
  }
  return code;
};

p._parseQuotedAttribute = function(quote) {
  var value = '', count = 0;

  while (count !== 0 || this._line[0] !== quote) {
    var m = /^(\\)?$/.exec(this._line);
    if (m) {
      value += m[1] ? ' ' : '\n';
      this._expectNextLine();
    } else {
      var firstChar = this._line[0];
      if (count > 0) {
        if (firstChar === '{') {
          count++;
        } else if (firstChar === '}') {
          count--;
        }
      } else if (/^\$\{/.test(this._line)) {
        value += firstChar;
        this._sliceLine(1);
        count = 1;
      }

      value += this._line[0];
      this._sliceLine(1);
    }
  }

  this._sliceLine(1);

  return value;
};

p._syntaxError = function(message) {
  var column = (this._origLine !== null && this._line !== null) ? this._origLine.length - this._line.length : 0;
  column += 1;
  var msg = [
    message,
    '  ' + (this._file || '(__TEMPLATE__)') + ', Line ' + this._lineno + ', Column ' + column,
    '  ' + (this._origLine || ''),
    '  ' + new Array(column).join(' ') + '^',
    ''
  ].join('\n');
  throw new Error(msg);
};

p._expectNextLine = function() {
  if (this._nextLine() === null) {
    this._syntaxError('Unexpected end of file');
  }
  this._line = this._line.trim();
};

module.exports = Parser;
