

# 𓆤DBay SQL Lexer

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [𓆤DBay SQL Lexer](#%F0%93%86%A4dbay-sql-lexer)
- [Acknowledgements](#acknowledgements)
- [To Do](#to-do)
  - [Is Done](#is-done)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



# 𓆤DBay SQL Lexer

The DBay SQL Lexer takes an SQL string as input and returns a list of tokens in the format `{ type, text, idx, }`

# Acknowledgements

The DBay SQL Lexer is a fork of [mistic100/sql-parser](https://github.com/mistic100/sql-parser), with much
of the original code that was outside the scope of a lexer removed.


# To Do

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


## Is Done

* **[+]** use `u`nicode flag on all regexes
* **[+]** return list of objects instead of list of lists
* **[+]** use lower case for type names

