(function() {
  'use strict';
  var GUY, Lexer, alert, debug, echo, help, info, inspect, log, plain, praise, rpr, urge, warn, whisper;

  //###########################################################################################################
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('DBAY-SQL-LEXER'));

  ({rpr, inspect, echo, log} = GUY.trm);

  Lexer = (function() {
    var BETWEEN, BOOLEAN, COMMA, DBLSTRING, LITERAL, MATH, MATH_MULTI, NUMBER, PARAMETER, SEMICOLON, SQL_CONDITIONALS, SQL_OPERATORS, SQL_SORT_ORDERS, STAR, STRING, SUB_SELECT_OP, SUB_SELECT_UNARY_OP, UNKNOWN, WHITESPACE;

    //===========================================================================================================
    class Lexer {
      constructor(sql, cfg = {}) {
        var codeunit_count, ref;
        this.sql = sql;
        this.keep_whitespace = (ref = cfg != null ? cfg.keep_whitespace : void 0) != null ? ref : false;
        this.tokens = [];
        this.currentLine = 1;
        this.current_idx = 0;
        while (this.chunk = sql.slice(this.current_idx)) {
          codeunit_count = this.keywordToken() || this.starToken() || this.booleanToken() || this.sortOrderToken() || this.commaToken() || this.operatorToken() || this.numberToken() || this.mathToken() || this.dotToken() || this.conditionalToken() || this.betweenToken() || this.subSelectOpToken() || this.subSelectUnaryOpToken() || this.stringToken() || this.parameterToken() || this.parensToken() || this.whitespaceToken() || this.literalToken() || this.semicolon() || this.unknown();
          if (codeunit_count < 1) {
            throw new Error(`nothing consumed: Stopped at - ${rpr(this.chunk.slice(0, 100))}`);
          }
          this.current_idx += codeunit_count;
        }
        this.postProcess();
        return void 0;
      }

      postProcess() {
        var i, j, len, next_token, ref, token;
        ref = this.tokens;
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          token = ref[i];
          if (token[0] === 'STAR') {
            next_token = this.tokens[i + 1];
            if (!(next_token[0] === 'COMMA' || next_token[0] === 'FROM')) {
              token[0] = 'MATH_MULTI';
            }
          }
        }
        return null;
      }

      token(name, value) {
        this.tokens.push([name, value, this.currentLine, this.current_idx]);
        return null;
      }

      tokenizeFromStringRegex(name, regex, part = 0, lengthPart = part, output = true) {
        var match, partMatch;
        if (!(match = regex.exec(this.chunk))) {
          return 0;
        }
        partMatch = match[part].replace(/''/gu, "'");
        if (output) {
          this.token(name, partMatch);
        }
        return match[lengthPart].length;
      }

      tokenizeFromRegex(name, regex, part = 0, lengthPart = part, output = true) {
        var match, partMatch;
        if (!(match = regex.exec(this.chunk))) {
          return 0;
        }
        partMatch = match[part];
        if (output) {
          this.token(name, partMatch);
        }
        return match[lengthPart].length;
      }

      tokenizeFromWord(name, word = name) {
        var match, matcher;
        word = GUY.str.escape_for_regex(word);
        matcher = /^\w+$/u.test(word) ? new RegExp(`^(${word})\\b`, 'igu') : new RegExp(`^(${word})`, 'igu');
        match = matcher.exec(this.chunk);
        if (!match) {
          return 0;
        }
        this.token(name, match[1]);
        return match[1].length;
      }

      tokenizeFromList(name, list) {
        var R, entry, j, len;
        R = 0;
        for (j = 0, len = list.length; j < len; j++) {
          entry = list[j];
          R = this.tokenizeFromWord(name, entry);
          if (R > 0) {
            break;
          }
        }
        return R;
      }

      keywordToken() {
        return this.tokenizeFromWord('SELECT') || this.tokenizeFromWord('INSERT') || this.tokenizeFromWord('INTO') || this.tokenizeFromWord('DEFAULT') || this.tokenizeFromWord('VALUES') || this.tokenizeFromWord('DISTINCT') || this.tokenizeFromWord('FROM') || this.tokenizeFromWord('WHERE') || this.tokenizeFromWord('GROUP') || this.tokenizeFromWord('ORDER') || this.tokenizeFromWord('NOT') || this.tokenizeFromWord('BY') || this.tokenizeFromWord('HAVING') || this.tokenizeFromWord('LIMIT') || this.tokenizeFromWord('JOIN') || this.tokenizeFromWord('LEFT') || this.tokenizeFromWord('RIGHT') || this.tokenizeFromWord('INNER') || this.tokenizeFromWord('OUTER') || this.tokenizeFromWord('ON') || this.tokenizeFromWord('AS') || this.tokenizeFromWord('CASE') || this.tokenizeFromWord('WHEN') || this.tokenizeFromWord('THEN') || this.tokenizeFromWord('ELSE') || this.tokenizeFromWord('END') || this.tokenizeFromWord('UNION') || this.tokenizeFromWord('ALL') || this.tokenizeFromWord('LIMIT') || this.tokenizeFromWord('OFFSET') || this.tokenizeFromWord('FETCH') || this.tokenizeFromWord('ROW') || this.tokenizeFromWord('ROWS') || this.tokenizeFromWord('ONLY') || this.tokenizeFromWord('NEXT') || this.tokenizeFromWord('FIRST');
      }

      dotToken() {
        return this.tokenizeFromWord('DOT', '.');
      }

      operatorToken() {
        return this.tokenizeFromList('OPERATOR', SQL_OPERATORS);
      }

      mathToken() {
        return this.tokenizeFromList('MATH', MATH) || this.tokenizeFromList('MATH_MULTI', MATH_MULTI);
      }

      conditionalToken() {
        return this.tokenizeFromList('CONDITIONAL', SQL_CONDITIONALS);
      }

      betweenToken() {
        return this.tokenizeFromRegex('BETWEEN', BETWEEN);
      }

      subSelectOpToken() {
        return this.tokenizeFromList('SUB_SELECT_OP', SUB_SELECT_OP);
      }

      subSelectUnaryOpToken() {
        return this.tokenizeFromList('SUB_SELECT_UNARY_OP', SUB_SELECT_UNARY_OP);
      }

      sortOrderToken() {
        return this.tokenizeFromList('DIRECTION', SQL_SORT_ORDERS);
      }

      booleanToken() {
        return this.tokenizeFromList('BOOLEAN', BOOLEAN);
      }

      starToken() {
        return this.tokenizeFromRegex('STAR', STAR);
      }

      commaToken() {
        return this.tokenizeFromRegex('COMMA', COMMA);
      }

      literalToken() {
        return this.tokenizeFromRegex('LITERAL', LITERAL, 1, 0);
      }

      numberToken() {
        return this.tokenizeFromRegex('NUMBER', NUMBER);
      }

      parameterToken() {
        return this.tokenizeFromRegex('PARAMETER', PARAMETER, 1, 0);
      }

      stringToken() {
        return this.tokenizeFromStringRegex('STRING', STRING, 1, 0) || this.tokenizeFromRegex('DBLSTRING', DBLSTRING, 1, 0);
      }

      parensToken() {
        return (this.tokenizeFromRegex('LEFT_PAREN', /^\(/u)) || (this.tokenizeFromRegex('RIGHT_PAREN', /^\)/u));
      }

      whitespaceToken() {
        var match, newlines, partMatch;
        if (!(match = WHITESPACE.exec(this.chunk))) {
          return 0;
        }
        partMatch = match[0];
        if (this.keep_whitespace) {
          this.token('WHITESPACE', partMatch);
        }
        newlines = partMatch.match(/\n/gu, '');
        this.currentLine += (newlines != null ? newlines.length : void 0) || 0;
        return partMatch.length;
      }

      semicolon() {
        return this.tokenizeFromRegex('SEMICOLON', SEMICOLON);
      }

      unknown() {
        return this.tokenizeFromRegex('UNKNOWN', UNKNOWN);
      }

    };

    SQL_SORT_ORDERS = ['ASC', 'DESC'];

    SQL_OPERATORS = ['=', '!=', '>=', '>', '<=', '<>', '<', 'LIKE', 'LIKE', 'ILIKE', 'ILIKE', 'IS', 'REGEXP', 'REGEXP'];

    SUB_SELECT_OP = ['IN', 'ANY', 'ALL', 'SOME'];

    SUB_SELECT_UNARY_OP = ['EXISTS'];

    SQL_CONDITIONALS = ['AND', 'OR'];

    // SQL_BETWEENS        = ['BETWEEN', 'NOT BETWEEN']
    // SQL_BETWEENS        = /((?:\bnot\b\s+)?\bbetween\b)/isu
    // NOT                 = /^(\bnot\b)/isu
    BETWEEN = /^(\bbetween\b)/isu;

    BOOLEAN = ['TRUE', 'FALSE', 'NULL'];

    MATH = ['+', '-', '||', '&&'];

    MATH_MULTI = ['/', '*'];

    STAR = /^\*/u;

    COMMA = /^,/u;

    WHITESPACE = /^[ \n\r]+/u;

    LITERAL = /^([\p{Letter}_][\p{Letter}_0-9]*)/iu;

    PARAMETER = /^\$([a-z0-9_]+(:(number|float|string|date|boolean))?)/u;

    NUMBER = /^[+-]?[0-9]+(\.[0-9]+)?/u;

    STRING = /^'((?:[^\\']+?|\\.|'')*)'(?!')/u;

    DBLSTRING = /^"([^\\"]*(?:\\.[^\\"]*)*)"/u;

    SEMICOLON = /^;/u;

    UNKNOWN = /./u;

    return Lexer;

  }).call(this);

  //-----------------------------------------------------------------------------------------------------------
  exports.tokenize = function(sql, cfg) {
    var R, idx, j, len, lnr, ref, text, type;
    R = [];
    ref = (new Lexer(sql, cfg)).tokens;
    for (j = 0, len = ref.length; j < len; j++) {
      [type, text, lnr, idx] = ref[j];
      type = type.toLowerCase();
      type = (function() {
        switch (type) {
          case 'literal':
            return 'identifier';
          case 'dblstring':
            return 'quoted_identifier';
          default:
            return type;
        }
      })();
      R.push({type, text, idx});
    }
    return R;
  };

}).call(this);

//# sourceMappingURL=main.js.map