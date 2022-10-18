

# 𓆤DBay SQL Lexer

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [𓆤DBay SQL Lexer](#%F0%93%86%A4dbay-sql-lexer)
- [Acknowledgements](#acknowledgements)
- [To Do](#to-do)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



# 𓆤DBay SQL Lexer

The DBay SQL Lexer takes an SQL string as input and returns a list of tokens in the format `[ type, text, line_nr, offset, ]`

# Acknowledgements

The DBay SQL Lexer is a fork of [mistic100/sql-parser](https://github.com/mistic100/sql-parser), with much
of the original code that was outside the scope of a lexer removed.


# To Do

* **[–]** return list of objects instead of list of lists
* **[–]** use lower case for type names

<!-- ## Is Done

* **[+]** implement `DBay::do()` as a method that unifies all of `better-sqlite3`'s `Statement::run()`,
 -->
