
function Parser() {
  this.lineno = 0;
  this.lines = [];
  this.indents = [0];
  this.line = null;
  this.origLine = null;

  this.tagShortcut = {};
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
  this.attrShortcutRe = /^([\.#]+)((?:\w+|-)*)/;

  this.attrName = "^\\s*(\\w+(?:\\w+:|-)*)";
  this.quotedAttrRe = new RegExp(this.attrName + '\\s*=(=?)\\s*("|\')');
  this.codeAttrRe = new RegExp(this.attrName + '\\s*=(=?)\\s*');

  this.delimRe = /^[\(\)\[\]\{\}]/;
  this.attrDelimRe = /^\s*([\(\)\[\]\{\}])/;
  this.newLineRegex = /\r?\n/;
  this.emptyLineRegex = /^\s*$/;
  this.htmlCommentRegex = /^\/!(\s?)/;
  this.htmlConditionalCommentRegex = /^\/\[\s*(.*?)\s*\]\s*$/;
  this.blockExpressionRegex = /^\s*:\s*/;
  this.slmCommentRegex = /^\//;
  this.doctypeRegex = /^doctype\s+/i;
  this.codeBlockRegex = /^-/;
  this.textBlockRegex = /^([\.\|])(\s?)/;
  this.outputBlockRegex = /^=(=?)(['<>]*)/;
  this.inlineHtmlRegex = /^</;
  this.embededRegex = /^(\w+):\s*$/;
  this.outputCodeRegex = /^\s*=(=?)([.<>]*)/;
  this.closedTagRegex = /^\s*\/\s*/;
  this.textContentRegex = /^( ?)(.*)$/;
  this.indentRegex  = /^[ \t]+/;
  this.indentationRegex = /^\s+/g;
  this.nextLineRegex = /^[,\\]$/;
  this.splatAttributeRegex = /^\s*\*(?=[^\s]+)/;
}

(function() {

  this.escapeRegExp = function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

  this.reset = function(lines, stacks) {
    this.stacks = stacks || [];
    this.indents = [0];
    this.indents.last = this.stacks.last = function() {
      return this[this.length - 1];
    }
    this.lineno = 0;
    this.lines = lines;
    this.line = this.origLine = null;
  };

  this.pushOnTop = function(item) {
    this.stacks.last().push(item);
  };

  this.nextLine = function() {
    if (this.lines.length) {
      this.origLine = this.lines.shift();
      this.lineno += 1;
      return this.line = this.origLine; // TODO: dup
    } else {
      return this.origLine = this.line = null;
    }
  };

  this.getIndent = function(line) {
    var m = line.match(this.indentRegex);
    return m ? m[0].replace(/\t/g, ' ').length : 0
  };

  this.exec = function(str) {
    var result = ['multi'];
    this.reset(str.split(this.newLineRegex), [result]);

    while (this.nextLine()) {
      this.parseLine()
    }

    this.reset(null, null);

    return result;
  };

  this.parseLine = function() {

    if (this.emptyLineRegex.test(this.line)) {
      this.pushOnTop(['newline']);
      return;
    }

    var indent = this.getIndent(this.line);

    // Remove the indentation
    this.line = this.line.replace(this.indentationRegex, '');

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
  };

  this.parseLineIndicators = function() {
    do {
      var line = this.line, m;

      // HTML comment
      if (m = this.htmlCommentRegex.test(line)) {
        this.pushOnTop(['html', 'comment',
          [
            'slm',
            'text',
            this.parseTextBlock(line.slice(m[0].length),
            this.indents.last() + m[0].length + 2)
          ]
        ]);
        break;
      }

      // HTML conditional comment
      if (m = this.htmlConditionalCommentRegex.exec(line)) {
        var block = ['multi'];
        this.pushOnTop(['html', 'condcomment', m[1], block]);
        this.stacks.push(block);
        break;
      }

      // Slm comment
      if (this.slmCommentRegex.test(line)) {
        this.parseCommentBlock();
        break;
      }

      // Text block.
      if (m = this.textBlockRegex.exec(line)) {

        var trailingWS = m[1] === ".";

        this.pushOnTop([
          'slm',
          'text',
          this.parseTextBlock(line.slice(m[0].length),
          this.indents.last() + m[1].length + 1)
        ]);

        if (trailingWS) {
          this.pushOnTop(['static', ' ']);
        }

        break;
      }

      // Inline html
      if (this.inlineHtmlRegex.test(line)) {
        var block = ['multi'];
        this.pushOnTop(['multi', ['slm', 'interpolate', line], block]);
        this.stacks.push(block);
        break;
      }

      // Code block.
      if (this.codeBlockRegex.test(line)) {
        // We expect the line to be broken or the next line to be indented.
        this.line = line = line.slice(1);
        var block = ['multi'];
        this.pushOnTop(['slm', 'control', this.parseBrokenLine(), block]);
        this.stacks.push(block);
        break;
      }

      // Output block.
      if (m = this.outputBlockRegex.exec(line)) {
        // We expect the line to be broken or the next line to be indented.
        this.line = line = line.slice(m[0].length);

        var trailingWS = m[2].indexOf('\'') >= 0 || m[2].indexOf('>') >= 0;
        var block = ['multi'];
        if (m[2].indexOf('<') >= 0) {
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
      if (m = this.embededRegex.exec(line)) {
        // It is treated as block.
        this.pushOnTop(['slm', 'embedded', m[1], this.parseTextBlock()]);
        break;
      }

      // Doctype declaration
      if (m = this.doctypeRegex.exec(line)) {
        var value = line.slice(m[0].length).trim();
        this.pushOnTop(['html', 'doctype', value]);
        break;
      }

      // HTML tag
      if (m = this.tagRe.exec(line)) {
        if (m[1]) {
          this.line = line.slice(m[0].length);
          this.parseTag(m[0]);
        }

        break;
      }

      this.syntaxError('Unknown line indicator')


    } while (false);

    this.pushOnTop(['newline']);
  };

  this.parseTag = function(tag) {
    var m;
    if (this.tagShortcut[tag] && !this.attrShortcut[tag]) {
      this.line = this.line.slice(0, tag.length);
    }

    // Find any shortcut attributes
    var attributes = ['html', 'attrs'];
    while (m = this.attrShortcutRe.exec(this.line)) {
      // The class/id attribute is :static instead of :slim :interpolate,
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
      if (m = this.blockExpressionRegex.exec(this.line)) {
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
      if (m = this.outputCodeRegex.exec(this.line)) {
        this.line = this.line.slice(m[0].length);
        var trailingWS2 = m[2].indexOf('.') >= 0 || m[2].indexOf('>') >= 0;

        var block = ['multi'];

        if (!leadingWS && m[2].indexOf('<') >= 0) {
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
      if (m = this.closedTagRegex.exec(this.line)) {
        this.line = this.line.slice(m[0].length);
        if (this.line.length) {
          this.syntaxError('Unexpected text after closed tag')
        }
        break;
      }

      // Empty content
      if (this.emptyLineRegex.test(this.line)) {
        var content = ['multi'];
        tag.push(content);
        this.stacks.push(content);
        break;
      }

      // Text content
      if (m = this.textContentRegex.exec(this.line)) {
        tag.push(['slm', 'text', this.parseTextBlock(m[2], this.origLine.length - this.line.length + m[1].length, true)]);
        break;
      }

    } while (false);
  };

  this.parseAttributes = function(attributes) {
    // Check to see if there is a delimiter right after the tag name
    var delimiter = null, m;

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
      // Splat attribute
      if (m = this.splatAttributeRegex.exec(this.line)) {
        this.line = this.line.slice(m[0].length);
        attributes.push(['slm', 'splat', this.parseJSCode(delimiter)]);
        continue;
      }

      // Value is quoted (static)
      if (m = this.quotedAttrRe.exec(this.line)) {
        this.line = this.line.slice(m[0].length);
        attributes.push(['html', 'attr', m[1],
                        ['escape', m[2].length == 0, ['slm', 'interpolate', this.parseQuotedAttribute(m[3])]]]);
        continue;
      }

      // Value is JS code
      if (m = this.codeAttrRe.exec(this.line)) {
        this.line = this.line.slice(m[0].length);
        var name = m[1];
        var escape = m[2].length === 0;
        var value = this.parseJSCode(delimiter);
        if (value.length === 0) {
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
      this.line = this.line.repace(/^\s+/, '');
      if (this.line.length) {
        this.syntaxError('Expected attribute');
      }

      // Attributes span multiple lines
      this.pushOnTop(['newline']);

      if (this.lines.length === 0) {
        this.syntaxError('Expected closing delimiter ' + delimiter);
      }
      this.nextLine();
    }
  };

  this.parseTextBlock = function(firstLine, textIndent, inTag) {
    var result = ['multi'];

    if (!firstLine || firstLine.length === 0) {
      textIndent = null;
    } else {
      result.push(['slm', 'interpolate', firstLine]);
    }

    var emptyLines = 0;

    while (this.lines.length) {
      if (this.emptyLineRegex.test(this.lines[0])) {
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
        this.line = this.line.replace(/^\s+/, '');

        // The text block lines must be at least indented
        // as deep as the first line.

        var offset = textIndent ? indent - textIndent : 0;

        if (offset < 0) {
          this.syntaxError('Text line not indented deep enough.\n' +
                           'The first text line defines the necessary text indentation.' +
                           (inTag ? '\nAre you trying to nest a child tag in a tag containing text? Use | for the text block!' : ''))
        }

        result.push(['newline'])
        result.push(['slim', 'interpolate', (textIndent ? "\n" : '') + new Array(offset + 1).join(' ') + this.line]);

        // The indentation of first line of the text block
        // determines the text base indentation.
        this.textIndent = this.textIndent || indent;
      }
    }

    return result;
  };

  this.parseCommentBlock = function() {
    while (this.lines.length) {
      var indent = this.emptyLineRegex.test(this.lines[0]) ? 0 : this.getIndent(this.lines[0]);

      if (indent <= this.indents.last()) {
        break;
      }

      this.nextLine();
      this.pushOnTop(['newline']);
    }
  };

  this.parseBrokenLine = function() {
    var brokenLine = this.line.trim();
    while (/[,\\]$/.test(brokenLine)) {
      this.expectNextLine();
      brokenLine += "\n" + this.line;
    }
    return brokenLine;
  };

  this.parseJSCode = function(outerDelimeter) {
    var code = '', count = 0, delimiter, closeDelimiter, m;

    // Attribute ends with space or attribute delimiter
    endRe = /\A[\s#{Regexp.escape outerDelimiter}]/

    while (this.line.length && !(count !== 0 || !endRe.test(this.line))) {
      if (this.nextLineRegex.test(this.line)) {
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

    if (count != 0) {
      this.syntaxError('Expected closing delimiter ' + closeDelimiter);
    }
    return code;
  };

  this.parseQuotedAttribute = function(quote) {
    var value = '', count = 0;

    while (this.line.length && !(count !== 0 || this.line[0] === quote[0])) {

      if (/^\\$/.test(this.line)) {
        value = value + ' ';
        this.expectNextLine();
      } else {
        if (count > 0) {
          if (this.line[0] === '{') {
            count++;
          } else if (this.line[0] === '}') {
            count--;
          }
        } else if (/^\$\{/.test(this.line)) {
          value = value + this.line[0];
          this.line = this.line.slice(1);
          count = 1;
        }

        value = value + this.line[0];
        this.line = this.line.slice(1);
      }
    }

    if (count !== 0) {
      this.syntaxError('Expected closing brace }');
    }

    if (this.line[0] !== quote[0]) {
      this.syntaxError('Expected closing quote ' + quote)
    }

    this.line = this.line.slice(1);

    return value;
  };

  this.syntaxError = function(message) {
    throw new Error(message + ' line: ' + this.lineno);
  };

  this.expectNextLine = function() {
    if (this.nextLine()) {
      this.syntaxError('Unexpected end of file');
    }
    this.line = this.line.trim();
  };

}).call(Parser.prototype);

module.exports = Parser;
