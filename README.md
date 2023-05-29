
# 𓆤DBay SQL Lexer


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [𓆤DBay SQL Lexer](#%F0%93%86%A4dbay-sql-lexer)
- [Acknowledgements](#acknowledgements)
- [Notes](#notes)
- [See Also](#see-also)
- [To Do](#to-do)
  - [Is Done](#is-done)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



# 𓆤DBay SQL Lexer

The DBay SQL Lexer takes an SQL string as input and returns a list of tokens in the format `{ type, text,
idx, }`:

```coffee
tokens = ( require 'dbay-sqlite-parser' ).tokenize """select * from my_table"""
```

gives

```js
[ { type: 'select',       text: 'select',   idx: 0  },
  { type: 'star',         text: '*',        idx: 7  },
  { type: 'from',         text: 'from',     idx: 9  },
  { type: 'identifier',   text: 'my_table', idx: 14 } ]
```


# Acknowledgements

The DBay SQL Lexer is a fork of [mistic100/sql-parser](https://github.com/mistic100/sql-parser), with much
of the original code that was outside the scope of a lexer removed.

# Notes

* the SQLite documentation ([*Requirements For The SQLite Tokenizer*](https://www.sqlite.org/draft/tokenreq.html)) is not quite
  accurate at least in some parts; it states that

  > H41130: SQLite shall recognize as an ID token any sequence of characters that begins with an ALPHABETIC
  > character and continue with zero or more ALPHANUMERIC characters and/or "$" (u0024) characters and which
  > is not a keyword token.

However, a simple experiment where we loop over all Unicode code points:

```coffee
@dbay_macros_demo_legal_chrs_in_identifiers = ( T, done ) ->
  { DBay      }     = require '../../../apps/dbay'
  db                = new DBay()
  #.........................................................................................................
  db ->
    for cid in [ 0x0000 .. 0x10ffffff ]
      cid_hex = '0x' + ( cid.toString 16 ).padStart 4, '0'
      chr   = String.fromCodePoint cid
      name  = "x#{chr}x"
      try
        rows = ( row for row from db SQL"""select 42 as #{name};""" )
        # debug '^434^', cid_hex, rows[ 0 ]
      catch error
        warn cid_hex, GUY.trm.reverse error.message
    debug '^645^', cid_hex
  #.........................................................................................................
  done?()
```

gives us only these (inclusive ranges) of rejected codepoints:

```
0x0000..0x0019
0x001a..0x0023
0x0025..0x002f
0x003a..0x0040
0x005b..0x005e
0x0060
0x007b..0x007f
```

For the first position in names, the documentation correctly states that codepoints `0x0024` `/[$]/` and
`0x030..0x039` `/[0-9]/` have to be excluded in addition.

# See Also

* [SQL Parser](https://github.com/taozhi8833998/node-sql-parser)


# To Do

* **[–]** documentation
* **[–]** make lexer accept Unicode identifiers
* **[–]** regex on line 176 is incorrect because backticks can occur independently of each other:

  ```
  LITERAL             = /^`?([a-z_][a-z0-9_]{0,}(:(number|float|string|date|boolean))?)`?/iu
  ```

* **[–]** implement correct identifier parsing; from [*Requirements For The SQLite Tokenizer: Identifier
  tokens*](https://www.sqlite.org/draft/tokenreq.html):

  > Identifiers follow the usual rules with the exception that SQLite allows the dollar-sign symbol in the
  > interior of an identifier. The dollar-sign is for compatibility with Microsoft SQL-Server and is not
  > part of the SQL standard.
  >
  > H41130: SQLite shall recognize as an ID token any sequence of characters that begins with an ALPHABETIC
  > character and continue with zero or more ALPHANUMERIC characters and/or "$" (u0024) characters and which
  > is not a keyword token. Identifiers can be arbitrary character strings within square brackets. This
  > feature is also for compatibility with Microsoft SQL-Server and not a part of the SQL standard.
  >
  > H41130: SQLite shall recognize as an ID token any sequence of characters that begins with an ALPHABETIC
  > character and continue with zero or more ALPHANUMERIC characters and/or "$" (u0024) characters and which
  > is not a keyword token. Identifiers can be arbitrary character strings within square brackets. This
  > feature is also for compatibility with Microsoft SQL-Server and not a part of the SQL standard.
  >
  > H41140: SQLite shall recognize as an ID token any sequence of non-zero characters that begins with "["
  > (u005b) and continuing through the first "]" (u005d) character. The standard way of quoting SQL
  > identifiers is to use double-quotes.
  >
  > H41140: SQLite shall recognize as an ID token any sequence of non-zero characters that begins with "["
  > (u005b) and continuing through the first "]" (u005d) character. The standard way of quoting SQL
  > identifiers is to use double-quotes.

* **[–]** replace with re-written parser based on [moo](https://github.com/no-context/moo) (or similar),
  making use of the regex stick`y` flag


## Is Done

* **[+]** use `u`nicode flag on all regexes
* **[+]** return list of objects instead of list of lists
* **[+]** use lower case for type names

