
function Parser() {
  this._file = null;
  this._lineno = 0;
  this._lines = [];
  this._indents = [0];
  this._line = null;
  this._origLine = null;

  this._tagShortcut = {
    '.': 'div',
    '#': 'div',
  };
  this._attrShortcut = {
    '#': ['id'],
    '.': ['class']
  };
  this._attrDelims = {
    '(' : ')',
    '[' : ']'
  };

  this._tagRe = /^(?:#|\.|\*(?=[^\s]+)|(\w+(?:\w+|:|-)*\w|\w+))/
  this._attrShortcutRe = /^([\.#]+)((?:\w+|-)*)/;

  this._attrName = "^\\s*(\\w+(?:\\w+|:|-)*)";
  this._quotedAttrRe = new RegExp(this._attrName + '\\s*=(=?)\\s*("|\')');
  this._codeAttrRe = new RegExp(this._attrName + '\\s*=(=?)\\s*');

  this._delimRe = /^[\(\)\[\]]/;
  this._attrDelimRe = /^\s*([\(\)\[\]])/;
  this._newLineRe = /\r?\n/;
  this._emptyLineRe = /^\s*$/;
  this._htmlCommentRe = /^\/!(\s?)/;
  this._htmlConditionalCommentRe = /^\/\[\s*(.*?)\s*\]\s*$/;
  this._blockExpressionRe = /^\s*:\s*/;
  this._doctypeRe = /^doctype\s+/i;
  this._textBlockRe = /^((\.)(\s|$))|((\|)(\s?))/;
  this._outputBlockRe = /^=(=?)([.<>]*)/;
  this._outputCodeRe  = /^\s*=(=?)([.<>]*)/;
  this._embededRe = /^(\w+):\s*$/;
  this._closedTagRe = /^\s*\/\s*/;
  this._textContentRe = /^( ?)(.*)$/;
  this._indentRegex  = /^[ \t]+/;
  this._indentationRe = /^\s+/;
  this._nextLineRe = /[,\\]$/;
  this._tabRe = /\t/g;
}

var ParserProto = Parser.prototype;

ParserProto._escapeRegExp = function(str) {
  if (!str) {
    return '';
  }
  return str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
}

ParserProto._reset = function(lines, stacks) {
  this._stacks = stacks || [];
  this._indents = [0];
  this._indents.last = this._stacks.last = function() {
    return this[this.length - 1];
  }
  this._lineno = 0;
  this._lines = lines;
  this._line = this._origLine = null;
}

ParserProto._pushOnTop = function(item) {
  this._stacks.last().push(item);
}

ParserProto._nextLine = function() {
  if (this._lines.length) {
    this._origLine = this._lines.shift();
    this._lineno += 1;
    return this._line = this._origLine;
  } else {
    return this._origLine = this._line = null;
  }
}

ParserProto._getIndent = function(line) {
  var m = line.match(this._indentRegex);
  return m ? m[0].replace(this._tabRe, ' ').length : 0
}

ParserProto.exec = function(str, options) {
  if (options && options['file']) {
    this._file = options['file'];
  } else {
    this._file = null;
  }
  var result = ['multi'];
  this._reset(str.split(this._newLineRe), [result]);

  while (this._nextLine() !== null) {
    this._parseLine()
  }

  this._reset();

  return result;
}

ParserProto._parseLine = function() {
  if (this._emptyLineRe.test(this._line)) {
    this._pushOnTop(['newline']);
    return;
  }

  var indent = this._getIndent(this._line);

  // Remove the indentation
  this._line = this._line.replace(this._indentationRe, '');

  // If there's more stacks than indents, it means that the previous
  // line is expecting this line to be indented.
  var expectingIndentation = this._stacks.length > this._indents.length;

  if (indent > this._indents.last()) {
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
    while(indent < this._indents.last()) {
      this._indents.pop();
      this._stacks.pop();
    }

    // This line's indentation happens lie "between" two other line's
    // indentation:
    //
    //   hello
    //       world
    //     this      # <- This should not be possible!

    if (indent !== this._indents.last()) {
      this._syntaxError('Malformed indentation');
    }
  }

  this._parseLineIndicators();
}

ParserProto._parseLineIndicators = function() {
  do {
    var m;

    // HTML comment
    if (m = this._htmlCommentRe.exec(this._line)) {
      this._pushOnTop(['html', 'comment',
        [
          'slm',
          'text',
          this._parseTextBlock(this._line.slice(m[0].length),
          this._indents.last() + m[1].length + 2)
        ]
      ]);
      break;
    }

    // HTML conditional comment
    if (m = this._htmlConditionalCommentRe.exec(this._line)) {
      var block = ['multi'];
      this._pushOnTop(['html', 'condcomment', m[1], block]);
      this._stacks.push(block);
      break;
    }

    var firstChar = this._line[0];

    // Slm comment
    if (firstChar === '/') {
      this._parseCommentBlock();
      break;
    }

    // Text block.
    if (m = this._textBlockRe.exec(this._line)) {
      var char, space;
      if (m[2] === undefined) {
        char = m[5];
        space = m[6];
      } else {
        char = m[2];
        space = m[3];
      }
      var trailingWS = char === '.';

      this._pushOnTop([
        'slm',
        'text',
        this._parseTextBlock(this._line.slice(m[0].length),
        this._indents.last() + space.length + 1)
      ]);

      if (trailingWS) {
        this._pushOnTop(['static', ' ']);
      }

      break;
    }

    // Inline html
    if (firstChar === '<') {
      var block = ['multi'];
      this._pushOnTop(['multi', ['slm', 'interpolate', this._line], block]);
      this._stacks.push(block);
      break;
    }

    // Code block.
    if (firstChar === '-') {
      // We expect the line to be broken or the next line to be indented.
      this._line = this._line.slice(1);
      var block = ['multi'];
      this._pushOnTop(['slm', 'control', this._parseBrokenLine(), block]);
      this._stacks.push(block);
      break;
    }

    // Output block.
    if (m = this._outputBlockRe.exec(this._line)) {
      // We expect the line to be broken or the next line to be indented.
      this._line = this._line.slice(m[0].length);

      var trailingWS = m[2].indexOf('.') !== -1 || m[2].indexOf('>') !== -1;
      var block = ['multi'];
      if (m[2].indexOf('<') !== -1) {
        this._pushOnTop(['static', ' ']);
      }
      this._pushOnTop(['slm', 'output', m[1].length === 0, this._parseBrokenLine(), block]);
      if (trailingWS) {
        this._pushOnTop(['static', ' ']);
      }
      this._stacks.push(block);

      break;
    }

    // Embedded template.
    if (m = this._embededRe.exec(this._line)) {
      // It is treated as block.
      this._pushOnTop(['slm', 'embedded', m[1], this._parseTextBlock()]);
      break;
    }

    // Doctype declaration
    if (m = this._doctypeRe.exec(this._line)) {
      var value = this._line.slice(m[0].length).trim();
      this._pushOnTop(['html', 'doctype', value]);
      break;
    }

    // HTML tag
    if (m = this._tagRe.exec(this._line)) {
      if (m[1]) {
        this._line = this._line.slice(m[0].length);
      }
      this._parseTag(m[0]);

      break;
    }

    this._syntaxError('Unknown line indicator')


  } while (false);

  this._pushOnTop(['newline']);
}

ParserProto._parseTag = function(tag) {
  var m;
  if (this._tagShortcut[tag]) {
    if (!this._attrShortcut[tag]) {
      this._line = this._line.slice(0, tag.length);
    }

    tag = this._tagShortcut[tag];
  }


  // Find any shortcut attributes
  var attributes = ['html', 'attrs'];
  while (m = this._attrShortcutRe.exec(this._line)) {
    // The class/id attribute is :static instead of 'slm' 'interpolate',
    // because we don't want text interpolation in .class or #id shortcut
    var shortcut = this._attrShortcut[m[1]];
    if (!shortcut) {
      this._syntaxError('Illegal shortcut');
    }

    for (var i = 0, a; a = shortcut[i]; i++) {
      attributes.push(['html', 'attr', a, ['static', m[2]]]);
    }

    this._line = this._line.slice(m[0].length);
  }

  var trailingWS, leadingWS;

  if (m =/^[<>.]+/.exec(this._line)) {
    this._line = this._line.slice(m[0].length);
    trailingWS = m[0].indexOf('.') >= 0 || m[0].indexOf('>') >= 0;
    leadingWS = m[0].indexOf('<') >=0;
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

  do {
    // Block expansion
    if (m = this._blockExpressionRe.exec(this._line)) {
      this._line = this._line.slice(m[0].length);
      if (!(m = this._tagRe.exec(this._line))) {
        this._syntaxError('Expected tag');
      }

      if (m[1]) {
        this._line = this._line.slice(m[0].length);
      }

      var content = ['multi'];
      tag.push(content);

      var i = this._stacks.length;
      this._stacks.push(content);
      this._parseTag(m[0]);
      this._stacks.splice(i, 1);

      break;
    }

    // Handle output code
    if (m = this._outputCodeRe.exec(this._line)) {

      this._line = this._line.slice(m[0].length);
      var trailingWS2 = m[2].indexOf('.') >= 0 || m[2].indexOf('>') >= 0;
      var leadingWS2 = m[2].indexOf('<') >= 0;

      var block = ['multi'];

      if (!leadingWS && leadingWS2) {
        var lastStack = this._stacks.last();
        lastStack.insert(lastStack.length - 2, 0, ['static', ' ']);
      }

      tag.push(['slm', 'output', m[1] !== '=', this._parseBrokenLine(), block]);
      if (!trailingWS && trailingWS2) {
        this._pushOnTop(['static', ' ']);
      }
      this._stacks.push(block);
      break;
    }

    // Closed tag. Do nothing
    if (m = this._closedTagRe.exec(this._line)) {
      this._line = this._line.slice(m[0].length);
      if (this._line.length) {
        this._syntaxError('Unexpected text after closed tag')
      }
      break;
    }

    // Empty content
    if (this._emptyLineRe.test(this._line)) {
      var content = ['multi'];
      tag.push(content);
      this._stacks.push(content);
      break;
    }

    // Text content
    if (m = this._textContentRe.exec(this._line)) {
      tag.push(['slm', 'text', this._parseTextBlock(m[2], this._origLine.length - this._line.length + m[1].length, true)]);
      break;
    }

  } while (false);
}

ParserProto._parseAttributes = function(attributes) {
  // Check to see if there is a delimiter right after the tag name
  var delimiter, m;

  if (m = this._attrDelimRe.exec(this._line)) {
    delimiter = this._attrDelims[m[1]];
    this._line = this._line.slice(m[0].length);
  }

  var booleanAttrRe, endRe;
  if (delimiter) {
    booleanAttrRe = new RegExp(this._attrName + '(?=(\\s|' + this._escapeRegExp(delimiter) + '|$))');
    endRe = new RegExp('^\\s*'+ this._escapeRegExp(delimiter));
  }

  while (true) {
    // Value is quoted (static)
    if (m = this._quotedAttrRe.exec(this._line)) {
      this._line = this._line.slice(m[0].length);
      attributes.push(['html', 'attr', m[1],
                      ['escape', m[2].length === 0, ['slm', 'interpolate', this._parseQuotedAttribute(m[3])]]]);
      continue;
    }

    // Value is JS code
    if (m = this._codeAttrRe.exec(this._line)) {
      this._line = this._line.slice(m[0].length);
      var name = m[1];
      var escape = m[2].length === 0;

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
    if (m = booleanAttrRe.exec(this._line)) {
      this._line = this._line.slice(m[0].length);
      attributes.push(['html', 'attr', m[1], ['multi']]);
      continue;
    }
    // Find ending delimiter
    if (m = endRe.exec(this._line)) {
      this._line = this._line.slice(m[0].length);
      break;
    }

    // Found something where an attribute should be
    this._line = this._line.replace(this._indentationRe, '');
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
}

ParserProto._parseTextBlock = function(firstLine, textIndent, inTag) {
  var result = ['multi'];

  if (!firstLine || !firstLine.length) {
    textIndent = null;
  } else {
    result.push(['slm', 'interpolate', firstLine]);
  }

  var emptyLines = 0;

  while (this._lines.length) {
    if (this._emptyLineRe.test(this._lines[0])) {
      this._nextLine();
      result.push(['newline']);

      if (textIndent) {
        emptyLines++;
      }
    } else {
      var indent = this._getIndent(this._lines[0]);

      if (indent <= this._indents.last()) {
        break;
      }

      if (emptyLines) {
        result.push(['slm', 'interpolate', new Array(emptyLines + 1).join('\n')]);
        emptyLines = 0;
      }

      this._nextLine();
      this._line = this._line.replace(this._indentationRe, '');

      // The text block lines must be at least indented
      // as deep as the first line.

      var offset = textIndent ? indent - textIndent : 0;

      if (offset < 0) {
        this._syntaxError('Text line not indented deep enough.\n' +
                         'The first text line defines the necessary text indentation.' +
                         (inTag ? '\nAre you trying to nest a child tag in a tag containing text? Use | for the text block!' : ''))
      }

      result.push(['newline'])
      result.push(['slm', 'interpolate', (textIndent ? "\n" : '') + new Array(offset + 1).join(' ') + this._line]);

      // The indentation of first line of the text block
      // determines the text base indentation.
      textIndent = textIndent || indent;
    }
  }

  return result;
}

ParserProto._parseCommentBlock = function() {
  while (this._lines.length) {
    var indent = this._emptyLineRe.test(this._lines[0]) ? 0 : this._getIndent(this._lines[0]);

    if (indent <= this._indents.last()) {
      break;
    }

    this._nextLine();
    this._pushOnTop(['newline']);
  }
}

ParserProto._parseBrokenLine = function() {
  var brokenLine = this._line.trim(), m;
  while (m = this._nextLineRe.exec(brokenLine)) {
    this._expectNextLine();
    if (m[0] === '\\') {
      brokenLine = brokenLine.slice(0, brokenLine.length - 2);
    }
    brokenLine += '\n' + this._line;
  }
  return brokenLine;
}

ParserProto._parseJSCode = function(outerDelimeter) {
  var code = '', count = 0, delimiter, closeDelimiter, m;

  // Attribute ends with space or attribute delimiter
  var endRe = new RegExp('^[\\s' +this._escapeRegExp(outerDelimeter) + ']');

  while (this._line.length && (count || !endRe.test(this._line))) {
    if (this._nextLineRe.test(this._line)) {
      code += this._line + '\n';
      this._expectNextLine();
    } else {
      if (count > 0) {
        if (this._line[0] === delimiter[0]) {
          count++;
        } else if (this._line[0] === closeDelimiter[0]) {
          count--;
        }
      } else if (m = this._delimRe.exec(this._line)) {

        count = 1;
        delimiter = m[0];
        closeDelimiter = this._attrDelims[m[0]];
      }

      code = code + this._line[0];
      this._line = this._line.slice(1);
    }
  }

  if (count) {
    this._syntaxError('Expected closing delimiter ' + closeDelimiter);
  }
  return code;
}

ParserProto._parseQuotedAttribute = function(quote) {
  var value = '', count = 0;

  while (this._line.length && (count || this._line[0] !== quote)) {
    if (/^\\$/.test(this._line)) {
      value += ' ';
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
        this._line = this._line.slice(1)
        count = 1;
      }

      value += this._line[0];
      this._line = this._line.slice(1);
    }
  }

  if (count) {
    this._syntaxError('Expected closing brace }');
  }

  if (this._line[0] !== quote) {
    this._syntaxError('Expected closing quote ' + quote)
  }

  this._line = this._line.slice(1);

  return value;
}

ParserProto._syntaxError = function(message) {
  var column = (this._origLine != null && this._line != null) ? this._origLine.length - this._line.length : 0;
  column += 1;
  var msg = [
    message,
    '  ' + (this._file || '(__TEMPLATE__)') + ', Line ' + this._lineno + ", Column " + column,
    '  ' + this._origLine,
    '  ' + new Array(column).join(' ') + '^',
    ''
  ].join('\n');
  throw new Error(msg);
}

ParserProto._expectNextLine = function() {
  if (!this._nextLine()) {
    this._syntaxError('Unexpected end of file');
  }
  this._line = this._line.trim();
}

module.exports = Parser;
