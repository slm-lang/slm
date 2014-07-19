
function Parser() {
  this.lineno = 0;
  this.lines = [];
  this.indents = [0];
  this.line = null;
  this.origLine = null;

  this.tagShortcut = {
    '.': 'div',
    '#': 'div',
  };
  this.attrShortcut = {
    '#': ['id'],
    '.': ['class']
  };
  this.attrDelims = {
    '(' : ')',
    '[' : ']',
    '{' : '}',
  };

  this.tagRe = /^(?:#|\.|\*(?=[^\s]+)|(\w+(?:\w+|:|-)*\w|\w+))/
  this.attrShortcutRe = /^([\.#]+)((?:\w+|:|-)*)/;

  this.attrName = "^\\s*(\\w+(?:\\w+|:|-)*)";
  this.quotedAttrRe = new RegExp(this.attrName + '\\s*=(=?)\\s*("|\')');
  this.codeAttrRe = new RegExp(this.attrName + '\\s*=(=?)\\s*');

  this.delimRe = /^[\(\)\[\]\{\}]/;
  this.attrDelimRe = /^\s*([\(\)\[\]\{\}])/;
  this.newLineRe = /\r?\n/;
  this.emptyLineRe = /^\s*$/;
  this.htmlCommentRe = /^\/!(\s?)/;
  this.htmlConditionalCommentRe = /^\/\[\s*(.*?)\s*\]\s*$/;
  this.blockExpressionRe = /^\s*:\s*/;
  this.doctypeRe = /^doctype\s+/i;
  this.textBlockRe = /^((\.)(\s|$))|((\|)(\s?))/;
  this.outputBlockRe = /^=(=?)([.<>]*)/;
  this.outputCodeRe  = /^\s*=(=?)([.<>]*)/;
  this.embededRe = /^(\w+):\s*$/;
  this.closedTagRe = /^\s*\/\s*/;
  this.textContentRe = /^( ?)(.*)$/;
  this.indentRegex  = /^[ \t]+/;
  this.indentationRe = /^\s+/;
  this.nextLineRe = /^[,\\]$/;
  this.tabRe = /\t/g;
}

var ParserProto = Parser.prototype;

ParserProto.escapeRegExp = function(str) {
  if (!str) {
    return '';
  }
  return str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
}

ParserProto.reset = function(lines, stacks) {
  this.stacks = stacks || [];
  this.indents = [0];
  this.indents.last = this.stacks.last = function() {
    return this[this.length - 1];
  }
  this.lineno = 0;
  this.lines = lines;
  this.line = this.origLine = null;
}

ParserProto.pushOnTop = function(item) {
  this.stacks.last().push(item);
}

ParserProto.nextLine = function() {
  if (this.lines.length) {
    this.origLine = this.lines.shift();
    this.lineno += 1;
    return this.line = this.origLine;
  } else {
    return this.origLine = this.line = null;
  }
}

ParserProto.getIndent = function(line) {
  var m = line.match(this.indentRegex);
  return m ? m[0].replace(this.tabRe, ' ').length : 0
}

ParserProto.exec = function(str) {
  var result = ['multi'];
  this.reset(str.split(this.newLineRe), [result]);

  while (this.nextLine()) {
    this.parseLine()
  }

  this.reset();

  return result;
}

ParserProto.parseLine = function() {

  if (this.emptyLineRe.test(this.line)) {
    this.pushOnTop(['newline']);
    return;
  }

  var indent = this.getIndent(this.line);

  // Remove the indentation
  this.line = this.line.replace(this.indentationRe, '');

  // If there's more stacks than indents, it means that the previous
  // line is expecting this line to be indented.
  var expectingIndentation = this.stacks.length > this.indents.length;

  if (indent > this.indents.last()) {
    // This line was actually indented, so we'll have to check if it was
    // supposed to be indented or not.

    if (!expectingIndentation) {
      this.syntaxError('Unexpected indentation');
    }

    this.indents.push(indent);
  } else {
    // This line was *not* indented more than the line before,
    // so we'll just forget about the stack that the previous line pushed.
    if (expectingIndentation) {
      this.stacks.pop();
    }

    // This line was deindented.
    // Now we're have to go through the all the indents and figure out
    // how many levels we've deindented.
    while(indent < this.indents.last()) {
      this.indents.pop();
      this.stacks.pop();
    }

    // This line's indentation happens lie "between" two other line's
    // indentation:
    //
    //   hello
    //       world
    //     this      # <- This should not be possible!

    if (indent !== this.indents.last()) {
      this.syntaxError('Malformed indentation');
    }
  }

  this.parseLineIndicators();
}

ParserProto.parseLineIndicators = function() {
  do {
    var m;

    // HTML comment
    if (m = this.htmlCommentRe.exec(this.line)) {
      this.pushOnTop(['html', 'comment',
        [
          'slm',
          'text',
          this.parseTextBlock(this.line.slice(m[0].length),
          this.indents.last() + m[1].length + 2)
        ]
      ]);
      break;
    }

    // HTML conditional comment
    if (m = this.htmlConditionalCommentRe.exec(this.line)) {
      var block = ['multi'];
      this.pushOnTop(['html', 'condcomment', m[1], block]);
      this.stacks.push(block);
      break;
    }

    var firstChar = this.line[0];

    // Slm comment
    if (firstChar === '/') {
      this.parseCommentBlock();
      break;
    }

    // Text block.
    if (m = this.textBlockRe.exec(this.line)) {
      var char, space;
      if (m[2] === undefined) {
        char = m[5];
        space = m[6];
      } else {
        char = m[2];
        space = m[3];
      }
      var trailingWS = char === '.';

      this.pushOnTop([
        'slm',
        'text',
        this.parseTextBlock(this.line.slice(m[0].length),
        this.indents.last() + space.length + 1)
      ]);

      if (trailingWS) {
        this.pushOnTop(['static', ' ']);
      }

      break;
    }

    // Inline html
    if (firstChar === '<') {
      var block = ['multi'];
      this.pushOnTop(['multi', ['slm', 'interpolate', this.line], block]);
      this.stacks.push(block);
      break;
    }

    // Code block.
    if (firstChar === '-') {
      // We expect the line to be broken or the next line to be indented.
      this.line = this.line.slice(1);
      var block = ['multi'];
      this.pushOnTop(['slm', 'control', this.parseBrokenLine(), block]);
      this.stacks.push(block);
      break;
    }

    // Output block.
    if (m = this.outputBlockRe.exec(this.line)) {
      // We expect the line to be broken or the next line to be indented.
      this.line = this.line.slice(m[0].length);

      var trailingWS = m[2].indexOf('.') !== -1 || m[2].indexOf('>') !== -1;
      var block = ['multi'];
      if (m[2].indexOf('<') !== -1) {
        this.pushOnTop(['static', ' ']);
      }
      this.pushOnTop(['slm', 'output', m[1].length === 0, this.parseBrokenLine(), block]);
      if (trailingWS) {
        this.pushOnTop(['static', ' ']);
      }
      this.stacks.push(block);

      break;
    }

    // Embedded template.
    if (m = this.embededRe.exec(this.line)) {
      // It is treated as block.
      this.pushOnTop(['slm', 'embedded', m[1], this.parseTextBlock()]);
      break;
    }

    // Doctype declaration
    if (m = this.doctypeRe.exec(this.line)) {
      var value = this.line.slice(m[0].length).trim();
      this.pushOnTop(['html', 'doctype', value]);
      break;
    }

    // HTML tag
    if (m = this.tagRe.exec(this.line)) {
      if (m[1]) {
        this.line = this.line.slice(m[0].length);
      }
      this.parseTag(m[0]);

      break;
    }

    this.syntaxError('Unknown line indicator')


  } while (false);

  this.pushOnTop(['newline']);
}

ParserProto.parseTag = function(tag) {
  var m;
  if (this.tagShortcut[tag]) {
    if (!this.attrShortcut[tag]) {
      this.line = this.line.slice(0, tag.length);
    }
    tag = this.tagShortcut[tag];
  }


  // Find any shortcut attributes
  var attributes = ['html', 'attrs'];
  while (m = this.attrShortcutRe.exec(this.line)) {
    // The class/id attribute is :static instead of 'slm' 'interpolate',
    // because we don't want text interpolation in .class or #id shortcut
    var shortcut = this.attrShortcut[m[1]];
    if (!shortcut) {
      this.syntaxError('Illegal shortcut');
    }

    for (var i = 0, a; a = shortcut[i]; i++) {
      attributes.push(['html', 'attr', a, ['static', m[2]]]);
    }

    this.line = this.line.slice(m[0].length);
  }

  var trailingWS, leadingWS;

  if (m =/^[<>.]+/.exec(this.line)) {
    this.line = this.line.slice(m[0].length);
    trailingWS = m[0].indexOf('.') >= 0 || m[0].indexOf('>') >= 0;
    leadingWS = m[0].indexOf('<') >=0;
  }

  this.parseAttributes(attributes);

  tag = ['html', 'tag', tag, attributes];

  if (leadingWS) {
    this.pushOnTop(['static', ' ']);
  }
  this.pushOnTop(tag);
  if (trailingWS) {
    this.pushOnTop(['static', ' ']);
  }

  do {
    // Block expansion
    if (m = this.blockExpressionRe.exec(this.line)) {
      this.line = this.line.slice(m[0].length);
      if (!(m = this.tagRe.exec(this.line))) {
        this.syntaxError('Expected tag');
      }

      if (m[1]) {
        this.line = this.line.slice(m[0].length);
      }

      var content = ['multi'];
      tag.push(content);

      var i = this.stacks.length;
      this.stacks.push(content);
      this.parseTag(m[0]);
      this.stacks.splice(i, 1);

      break;
    }

    // Handle output code
    if (m = this.outputCodeRe.exec(this.line)) {

      this.line = this.line.slice(m[0].length);
      var trailingWS2 = m[2].indexOf('.') >= 0 || m[2].indexOf('>') >= 0;
      var leadingWS2 = m[2].indexOf('<') >= 0;

      var block = ['multi'];

      if (!leadingWS && leadingWS2) {
        var lastStack = this.stacks.last();
        lastStack.insert(lastStack.length - 2, 0, ['static', ' ']);
      }

      tag.push(['slm', 'output', m[1] !== '=', this.parseBrokenLine(), block]);
      if (!trailingWS && trailingWS2) {
        this.pushOnTop(['static', ' ']);
      }
      this.stacks.push(block);
      break;
    }

    // Closed tag. Do nothing
    if (m = this.closedTagRe.exec(this.line)) {
      this.line = this.line.slice(m[0].length);
      if (this.line.length) {
        this.syntaxError('Unexpected text after closed tag')
      }
      break;
    }

    // Empty content
    if (this.emptyLineRe.test(this.line)) {
      var content = ['multi'];
      tag.push(content);
      this.stacks.push(content);
      break;
    }

    // Text content
    if (m = this.textContentRe.exec(this.line)) {
      tag.push(['slm', 'text', this.parseTextBlock(m[2], this.origLine.length - this.line.length + m[1].length, true)]);
      break;
    }

  } while (false);
}

ParserProto.parseAttributes = function(attributes) {
  // Check to see if there is a delimiter right after the tag name
  var delimiter, m;

  if (m = this.attrDelimRe.exec(this.line)) {
    delimiter = this.attrDelims[m[1]];
    this.line = this.line.slice(m[0].length);
  }

  var booleanAttrRe, endRe;
  if (delimiter) {
    booleanAttrRe = new RegExp(this.attrName + '(?=(\\s|' + this.escapeRegExp(delimiter) + '|$))');
    endRe = new RegExp('^\\s*'+ this.escapeRegExp(delimiter));
  }

  while (true) {
    // Value is quoted (static)
    if (m = this.quotedAttrRe.exec(this.line)) {
      this.line = this.line.slice(m[0].length);
      attributes.push(['html', 'attr', m[1],
                      ['escape', m[2].length === 0, ['slm', 'interpolate', this.parseQuotedAttribute(m[3])]]]);
      continue;
    }

    // Value is JS code
    if (m = this.codeAttrRe.exec(this.line)) {
      this.line = this.line.slice(m[0].length);
      var name = m[1];
      var escape = m[2].length === 0;

      var value = this.parseJSCode(delimiter);
      if (!value.length) {
        this.syntaxError('Invalid empty attribute');
      }
      attributes.push(['html', 'attr', name, ['slm', 'attrvalue', escape, value]]);
      continue;
    }

    if (!delimiter) {
      break;
    }

    // Boolean attribute
    if (m = booleanAttrRe.exec(this.line)) {
      this.line = this.line.slice(m[0].length);
      attributes.push(['html', 'attr', m[1], ['multi']]);
      continue;
    }
    // Find ending delimiter
    if (m = endRe.exec(this.line)) {
      this.line = this.line.slice(m[0].length);
      break;
    }

    // Found something where an attribute should be
    this.line = this.line.replace(this.indentationRe, '');
    if (this.line.length) {
      this.syntaxError('Expected attribute');
    }

    // Attributes span multiple lines
    this.pushOnTop(['newline']);

    if (!this.lines.length) {
      this.syntaxError('Expected closing delimiter ' + delimiter);
    }
    this.nextLine();
  }
}

ParserProto.parseTextBlock = function(firstLine, textIndent, inTag) {
  var result = ['multi'];

  if (!firstLine || !firstLine.length) {
    textIndent = null;
  } else {
    result.push(['slm', 'interpolate', firstLine]);
  }

  var emptyLines = 0;

  while (this.lines.length) {
    if (this.emptyLineRe.test(this.lines[0])) {
      this.nextLine();
      result.push(['newline']);

      if (textIndent) {
        emptyLines++;
      }
    } else {
      var indent = this.getIndent(this.lines[0]);

      if (indent <= this.indents.last()) {
        break;
      }

      if (emptyLines) {
        result.push(['slm', 'interpolate', new Array(emptyLines + 1).join('\n')]);
        emptyLines = 0;
      }

      this.nextLine();
      this.line = this.line.replace(this.indentationRe, '');

      // The text block lines must be at least indented
      // as deep as the first line.

      var offset = textIndent ? indent - textIndent : 0;

      if (offset < 0) {
        this.syntaxError('Text line not indented deep enough.\n' +
                         'The first text line defines the necessary text indentation.' +
                         (inTag ? '\nAre you trying to nest a child tag in a tag containing text? Use | for the text block!' : ''))
      }

      result.push(['newline'])
      result.push(['slm', 'interpolate', (textIndent ? "\n" : '') + new Array(offset + 1).join(' ') + this.line]);

      // The indentation of first line of the text block
      // determines the text base indentation.
      textIndent = textIndent || indent;
    }
  }

  return result;
}

ParserProto.parseCommentBlock = function() {
  while (this.lines.length) {
    var indent = this.emptyLineRe.test(this.lines[0]) ? 0 : this.getIndent(this.lines[0]);

    if (indent <= this.indents.last()) {
      break;
    }

    this.nextLine();
    this.pushOnTop(['newline']);
  }
}

ParserProto.parseBrokenLine = function() {
  var brokenLine = this.line.trim();
  while (this.nextLineRe.test(brokenLine)) {
    this.expectNextLine();
    brokenLine += "\n" + this.line;
  }
  return brokenLine;
}

ParserProto.parseJSCode = function(outerDelimeter) {
  var code = '', count = 0, delimiter, closeDelimiter, m;

  // Attribute ends with space or attribute delimiter
  var endRe = new RegExp('^[\\s' +this.escapeRegExp(outerDelimeter) + ']');

  while (this.line.length && (count || !endRe.test(this.line))) {
    if (this.nextLineRe.test(this.line)) {
      code += this.line + '\n';
      this.expectNextLine();
    } else {
      if (count > 0) {
        if (this.line[0] === delimiter[0]) {
          count++;
        } else if (this.line[0] === closeDelimiter[0]) {
          count--;
        }
      } else if (m = this.delimRe.exec(this.line)) {

        count = 1;
        delimiter = m[0];
        closeDelimiter = this.attrDelims[m[0]];
      }

      code = code + this.line[0];
      this.line = this.line.slice(1);
    }
  }

  if (count) {
    this.syntaxError('Expected closing delimiter ' + closeDelimiter);
  }
  return code;
}

ParserProto.parseQuotedAttribute = function(quote) {
  var value = '', count = 0;

  while (this.line.length && (count || this.line[0] !== quote)) {
    if (/^\\$/.test(this.line)) {
      value += ' ';
      this.expectNextLine();
    } else {
      var firstChar = this.line[0];
      if (count > 0) {
        if (firstChar === '{') {
          count++;
        } else if (firstChar === '}') {
          count--;
        }
      } else if (/^\$\{/.test(this.line)) {
        value += firstChar;
        this.line = this.line.slice(1)
        count = 1;
      }

      value += this.line[0];
      this.line = this.line.slice(1);
    }
  }

  if (count) {
    this.syntaxError('Expected closing brace }');
  }

  if (this.line[0] !== quote) {
    this.syntaxError('Expected closing quote ' + quote)
  }

  this.line = this.line.slice(1);

  return value;
}

ParserProto.syntaxError = function(message) {
  throw new Error(message + ' line: ' + this.lineno);
}

ParserProto.expectNextLine = function() {
  if (this.nextLine()) {
    this.syntaxError('Unexpected end of file');
  }
  this.line = this.line.trim();
}

module.exports = Parser;
