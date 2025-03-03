

'use strict'


############################################################################################################
GUY                       = require 'guy'
{ alert
  debug
  help
  info
  plain
  praise
  urge
  warn
  whisper }               = GUY.trm.get_loggers 'DBAY-SQL-LEXER'
{ rpr
  inspect
  echo
  log     }               = GUY.trm

#===========================================================================================================
class Lexer
  constructor: (sql, cfg = {} ) ->
    @sql              = sql
    @keep_whitespace  = cfg?.keep_whitespace ? false
    @tokens           = []
    @currentLine      = 1
    @current_idx      = 0
    while @chunk = sql[ @current_idx ... ]
      codeunit_count = @keywordToken() or
                       @starToken() or
                       @eolcommentToken() or
                       @blockcommentToken() or
                       @booleanToken() or
                       @sortOrderToken() or
                       @commaToken() or
                       @operatorToken() or
                       @numberToken() or
                       @mathToken() or
                       @dotToken() or
                       @conditionalToken() or
                       @betweenToken() or
                       @subSelectOpToken() or
                       @subSelectUnaryOpToken() or
                       @stringToken() or
                       @parameterToken() or
                       @parensToken() or
                       @whitespaceToken() or
                       @literalToken() or
                       @semicolon() or
                       @unknown()

      if codeunit_count < 1
        throw new Error "nothing consumed: Stopped at - #{rpr @chunk[ ... 100 ]}"
      @current_idx += codeunit_count
    @postProcess()
    return undefined

  postProcess: ->
    for token, i in @tokens
      if token[0] is 'STAR'
        next_token = @tokens[i+1]
        unless next_token[0] is 'COMMA' or next_token[0] is 'FROM'
          token[0] = 'MATH_MULTI'
    return null

  push_token: (name, value) ->
    @tokens.push([name, value, @currentLine, @current_idx])
    return null

  tokenizeFromStringRegex: (name, regex, part=0, lengthPart=part, output=true) ->
    return 0 unless ( match = regex.exec @chunk )?
    partMatch = match[part].replace(/''/gu, "'")
    @push_token(name, partMatch) if output
    return match[lengthPart].length

  tokenizeFromRegex: (name, regex, part=0, lengthPart=part, output=true) ->
    return 0 unless ( match = regex.exec @chunk )?
    partMatch = match[part]
    @push_token(name, partMatch) if output
    return match[lengthPart].length

  tokenizeFromWord: ( name, word = name ) ->
    word = GUY.str.escape_for_regex word
    matcher = if ( /^\w+$/u ).test(word)
      new RegExp("^(#{word})\\b",'igu')
    else
      new RegExp("^(#{word})",'igu')
    match = matcher.exec(@chunk)
    return 0 unless match
    @push_token(name, match[1])
    return match[1].length

  tokenizeFromList: (name, list) ->
    R = 0
    for entry in list
      R = @tokenizeFromWord(name, entry)
      break if R > 0
    return R

  keywordToken: -> return (
    @tokenizeFromWord('SELECT') or
    @tokenizeFromWord('INSERT') or
    @tokenizeFromWord('INTO') or
    @tokenizeFromWord('DEFAULT') or
    @tokenizeFromWord('VALUES') or
    @tokenizeFromWord('DISTINCT') or
    @tokenizeFromWord('FROM') or
    @tokenizeFromWord('WHERE') or
    @tokenizeFromWord('GROUP') or
    @tokenizeFromWord('ORDER') or
    @tokenizeFromWord('NOT') or
    @tokenizeFromWord('BY') or
    @tokenizeFromWord('HAVING') or
    @tokenizeFromWord('LIMIT') or
    @tokenizeFromWord('JOIN') or
    @tokenizeFromWord('LEFT') or
    @tokenizeFromWord('RIGHT') or
    @tokenizeFromWord('INNER') or
    @tokenizeFromWord('OUTER') or
    @tokenizeFromWord('ON') or
    @tokenizeFromWord('AS') or
    @tokenizeFromWord('CASE') or
    @tokenizeFromWord('WHEN') or
    @tokenizeFromWord('THEN') or
    @tokenizeFromWord('ELSE') or
    @tokenizeFromWord('END') or
    @tokenizeFromWord('UNION') or
    @tokenizeFromWord('ALL') or
    @tokenizeFromWord('LIMIT') or
    @tokenizeFromWord('OFFSET') or
    @tokenizeFromWord('FETCH') or
    @tokenizeFromWord('ROW') or
    @tokenizeFromWord('ROWS') or
    @tokenizeFromWord('ONLY') or
    @tokenizeFromWord('NEXT') or
    @tokenizeFromWord('FIRST')    )

  dotToken: -> @tokenizeFromWord('DOT', '.')
  operatorToken:    -> @tokenizeFromList('OPERATOR', SQL_OPERATORS)
  mathToken:        ->
    @tokenizeFromList('MATH', MATH) or
    @tokenizeFromList('MATH_MULTI', MATH_MULTI)
  conditionalToken: -> @tokenizeFromList('CONDITIONAL', SQL_CONDITIONALS)
  betweenToken:     -> @tokenizeFromRegex('BETWEEN', BETWEEN)
  subSelectOpToken: -> @tokenizeFromList('SUB_SELECT_OP', SUB_SELECT_OP)
  subSelectUnaryOpToken: -> @tokenizeFromList('SUB_SELECT_UNARY_OP', SUB_SELECT_UNARY_OP)
  sortOrderToken:   -> @tokenizeFromList('DIRECTION', SQL_SORT_ORDERS)
  booleanToken:     -> @tokenizeFromList('BOOLEAN', BOOLEAN)

  starToken:        -> @tokenizeFromRegex('STAR', STAR)
  eolcommentToken:  -> @tokenizeFromRegex('EOLCOMMENT', EOLCOMMENT)
  blockcommentToken:  -> @tokenizeFromRegex('BLOCKCOMMENT', BLOCKCOMMENT)
  commaToken:       -> @tokenizeFromRegex('COMMA', COMMA)
  literalToken:     -> @tokenizeFromRegex('LITERAL', LITERAL, 1, 0)
  numberToken:      -> @tokenizeFromRegex('NUMBER', NUMBER)
  parameterToken:   -> @tokenizeFromRegex('PARAMETER', PARAMETER, 1, 0)
  stringToken:      ->
    @tokenizeFromStringRegex('STRING', STRING, 1, 0) ||
    @tokenizeFromRegex('DBLSTRING', DBLSTRING, 1, 0)

  parensToken: ->
    return ( @tokenizeFromRegex 'LEFT_PAREN', /^\(/u ) or ( @tokenizeFromRegex 'RIGHT_PAREN', /^\)/u )

  whitespaceToken: ->
    return 0 unless match = WHITESPACE.exec(@chunk)
    partMatch = match[0]
    @push_token('WHITESPACE', partMatch) if @keep_whitespace
    newlines = partMatch.match(/\n/gu, '')
    @currentLine += newlines?.length || 0
    return partMatch.length

  semicolon:        -> @tokenizeFromRegex('SEMICOLON', SEMICOLON)
  unknown:          -> @tokenizeFromRegex('UNKNOWN', UNKNOWN)

  SQL_SORT_ORDERS     = ['ASC', 'DESC']
  SQL_OPERATORS       = ['=', '!=', '>=', '>', '<=', '<>', '<', 'LIKE', 'LIKE', 'ILIKE', 'ILIKE', 'IS', 'REGEXP', 'REGEXP']
  SUB_SELECT_OP       = ['IN', 'ANY', 'ALL', 'SOME']
  SUB_SELECT_UNARY_OP = ['EXISTS']
  SQL_CONDITIONALS    = ['AND', 'OR']
  BETWEEN             = /^(\bbetween\b)/isu
  BOOLEAN             = ['TRUE', 'FALSE', 'NULL']
  MATH                = ['+', '-', '||', '&&']
  MATH_MULTI          = ['/', '*']
  STAR                = /^\*/u
  EOLCOMMENT          = /^--/u
  BLOCKCOMMENT        = /^\/\*.*\*\//su
  COMMA               = /^,/u
  WHITESPACE          = /^[ \n\r]+/u
  LITERAL             = /^([\p{Letter}_][\p{Letter}_0-9$]*)/iu
  PARAMETER           = /^\$([\p{Letter}_][\p{Letter}_0-9$]*)/u
  NUMBER              = /^[+-]?[0-9]+(\.[0-9]+)?/u
  STRING              = /^'((?:[^\\']+?|\\.|'')*)'(?!')/u
  DBLSTRING           = /^"([^\\"]*(?:\\.[^\\"]*)*)"/u
  SEMICOLON           = /^;/u
  UNKNOWN             = /./u

#-----------------------------------------------------------------------------------------------------------
exports.tokenize = ( sql, cfg ) ->
  R = []
  for [ type, text, lnr, idx, ] in ( new Lexer sql, cfg ).tokens
    type = type.toLowerCase()
    type = switch type
      when 'literal'    then 'identifier'
      when 'dblstring'  then 'quoted_identifier'
      else type
    R.push { type, text, idx, }
  return R
