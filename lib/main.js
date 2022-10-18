(function() {
  var Lexer;

  Lexer = (function() {
    var BOOLEAN, COMMA, DBLSTRING, LITERAL, MATH, MATH_MULTI, NUMBER, PARAMETER, SEMICOLON, SQL_BETWEENS, SQL_CONDITIONALS, SQL_FUNCTIONS, SQL_OPERATORS, SQL_SORT_ORDERS, STAR, STRING, SUB_SELECT_OP, SUB_SELECT_UNARY_OP, UNKNOWN, WHITESPACE;

    class Lexer {
      constructor(sql, cfg = {}) {
        var bytesConsumed, i, ref;
        this.sql = sql;
        this.keep_whitespace = (ref = cfg != null ? cfg.keep_whitespace : void 0) != null ? ref : false;
        this.tokens = [];
        this.currentLine = 1;
        this.currentOffset = 0;
        i = 0;
        while (this.chunk = sql.slice(i)) {
          bytesConsumed = this.keywordToken() || this.starToken() || this.booleanToken() || this.functionToken() || this.windowExtension() || this.sortOrderToken() || this.commaToken() || this.operatorToken() || this.numberToken() || this.mathToken() || this.dotToken() || this.conditionalToken() || this.betweenToken() || this.subSelectOpToken() || this.subSelectUnaryOpToken() || this.stringToken() || this.parameterToken() || this.parensToken() || this.whitespaceToken() || this.literalToken() || this.semicolon() || this.unknown();
          if (bytesConsumed < 1) {
            throw new Error(`NOTHING CONSUMED: Stopped at - '${this.chunk.slice(0, 30)}'`);
          }
          i += bytesConsumed;
          this.currentOffset += bytesConsumed;
        }
        this.token('EOF', '');
        this.postProcess();
      }

      postProcess() {
        var i, j, len, next_token, ref, results, token;
        ref = this.tokens;
        results = [];
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          token = ref[i];
          if (token[0] === 'STAR') {
            next_token = this.tokens[i + 1];
            if (!(next_token[0] === 'COMMA' || next_token[0] === 'FROM')) {
              results.push(token[0] = 'MATH_MULTI');
            } else {
              results.push(void 0);
            }
          } else {
            results.push(void 0);
          }
        }
        return results;
      }

      token(name, value) {
        return this.tokens.push([name, value, this.currentLine, this.currentOffset]);
      }

      tokenizeFromStringRegex(name, regex, part = 0, lengthPart = part, output = true) {
        var match, partMatch;
        if (!(match = regex.exec(this.chunk))) {
          return 0;
        }
        partMatch = match[part].replace(/''/g, "'");
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
        word = this.regexEscape(word);
        matcher = /^\w+$/.test(word) ? new RegExp(`^(${word})\\b`, 'ig') : new RegExp(`^(${word})`, 'ig');
        match = matcher.exec(this.chunk);
        if (!match) {
          return 0;
        }
        this.token(name, match[1]);
        return match[1].length;
      }

      tokenizeFromList(name, list) {
        var entry, j, len, ret;
        ret = 0;
        for (j = 0, len = list.length; j < len; j++) {
          entry = list[j];
          ret = this.tokenizeFromWord(name, entry);
          if (ret > 0) {
            break;
          }
        }
        return ret;
      }

      keywordToken() {
        return this.tokenizeFromWord('SELECT') || this.tokenizeFromWord('INSERT') || this.tokenizeFromWord('INTO') || this.tokenizeFromWord('DEFAULT') || this.tokenizeFromWord('VALUES') || this.tokenizeFromWord('DISTINCT') || this.tokenizeFromWord('FROM') || this.tokenizeFromWord('WHERE') || this.tokenizeFromWord('GROUP') || this.tokenizeFromWord('ORDER') || this.tokenizeFromWord('BY') || this.tokenizeFromWord('HAVING') || this.tokenizeFromWord('LIMIT') || this.tokenizeFromWord('JOIN') || this.tokenizeFromWord('LEFT') || this.tokenizeFromWord('RIGHT') || this.tokenizeFromWord('INNER') || this.tokenizeFromWord('OUTER') || this.tokenizeFromWord('ON') || this.tokenizeFromWord('AS') || this.tokenizeFromWord('CASE') || this.tokenizeFromWord('WHEN') || this.tokenizeFromWord('THEN') || this.tokenizeFromWord('ELSE') || this.tokenizeFromWord('END') || this.tokenizeFromWord('UNION') || this.tokenizeFromWord('ALL') || this.tokenizeFromWord('LIMIT') || this.tokenizeFromWord('OFFSET') || this.tokenizeFromWord('FETCH') || this.tokenizeFromWord('ROW') || this.tokenizeFromWord('ROWS') || this.tokenizeFromWord('ONLY') || this.tokenizeFromWord('NEXT') || this.tokenizeFromWord('FIRST');
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
        return this.tokenizeFromList('BETWEEN', SQL_BETWEENS);
      }

      subSelectOpToken() {
        return this.tokenizeFromList('SUB_SELECT_OP', SUB_SELECT_OP);
      }

      subSelectUnaryOpToken() {
        return this.tokenizeFromList('SUB_SELECT_UNARY_OP', SUB_SELECT_UNARY_OP);
      }

      functionToken() {
        return this.tokenizeFromList('FUNCTION', SQL_FUNCTIONS);
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
        return this.tokenizeFromRegex('LEFT_PAREN', /^\(/) || this.tokenizeFromRegex('RIGHT_PAREN', /^\)/);
      }

      windowExtension() {
        var match;
        match = /^\.(win):(length|time)/i.exec(this.chunk);
        if (!match) {
          return 0;
        }
        this.token('WINDOW', match[1]);
        this.token('WINDOW_FUNCTION', match[2]);
        return match[0].length;
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
        newlines = partMatch.match(/\n/g, '');
        this.currentLine += (newlines != null ? newlines.length : void 0) || 0;
        return partMatch.length;
      }

      semicolon() {
        return this.tokenizeFromRegex('SEMICOLON', SEMICOLON);
      }

      unknown() {
        return this.tokenizeFromRegex('UNKNOWN', UNKNOWN);
      }

      regexEscape(str) {
        return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      }

    };

    SQL_FUNCTIONS = ['AVG', 'COUNT', 'MIN', 'MAX', 'SUM'];

    SQL_SORT_ORDERS = ['ASC', 'DESC'];

    SQL_OPERATORS = ['=', '!=', '>=', '>', '<=', '<>', '<', 'LIKE', 'NOT LIKE', 'ILIKE', 'NOT ILIKE', 'IS NOT', 'IS', 'REGEXP', 'NOT REGEXP'];

    SUB_SELECT_OP = ['IN', 'NOT IN', 'ANY', 'ALL', 'SOME'];

    SUB_SELECT_UNARY_OP = ['EXISTS'];

    SQL_CONDITIONALS = ['AND', 'OR'];

    SQL_BETWEENS = ['BETWEEN', 'NOT BETWEEN'];

    BOOLEAN = ['TRUE', 'FALSE', 'NULL'];

    MATH = ['+', '-', '||', '&&'];

    MATH_MULTI = ['/', '*'];

    STAR = /^\*/;

    COMMA = /^,/;

    WHITESPACE = /^[ \n\r]+/;

    LITERAL = /^`?([a-z_][a-z0-9_]{0,}(\:(number|float|string|date|boolean))?)`?/i;

    PARAMETER = /^\$([a-z0-9_]+(\:(number|float|string|date|boolean))?)/;

    NUMBER = /^[+-]?[0-9]+(\.[0-9]+)?/;

    STRING = /^'((?:[^\\']+?|\\.|'')*)'(?!')/;

    DBLSTRING = /^"([^\\"]*(?:\\.[^\\"]*)*)"/;

    SEMICOLON = /^;/;

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
      R.push({type, text, idx});
    }
    return R;
  };

}).call(this);

//# sourceMappingURL=main.js.map