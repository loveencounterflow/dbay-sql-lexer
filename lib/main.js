(function() {
  'use strict';
  var GUY, Lexer, Token, alert, copy_regex, debug, echo, equals, help, info, inspect, log, plain, praise, rpr, urge, warn, whisper;

  //###########################################################################################################
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('DEMO-MOO-LEXER'));

  ({rpr, inspect, echo, log} = GUY.trm);

  //...........................................................................................................
  ({equals, copy_regex} = GUY.samesame);

  //===========================================================================================================
  Token = class Token {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg) {
      return void 0;
    }

  };

  //===========================================================================================================
  Lexer = class Lexer {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg) {
      var state;
      this.cfg = cfg;
      GUY.props.hide(this, 'types', (require('./types'))(this.cfg));
      this[Symbol.iterator] = this.walk.bind(this);
      state = this.reset();
      this._compile();
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    _compile() {
      var cfg, entry, ref, token;
      ref = this.cfg.tokens;
      for (token in ref) {
        cfg = ref[token];
        entry = this.types.create.lxr_token_cfg(cfg);
        // debug '^5435^', { token, cfg, entry, }
        this.cfg.tokens[token] = entry;
      }
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    read(source) {
      this.reset();
      this.feed(source);
      this.finish();
      return [...this.walk()];
    }

    //---------------------------------------------------------------------------------------------------------
    feed(chunk) {
      // @types.validate.text chunk ### TAINT also allow buffers ###
      this.state.chunk = chunk;
      return this;
    }

    //---------------------------------------------------------------------------------------------------------
    * walk() {
      var collector, entry, flush, last_position, match, prv_entry, prv_token, ref, token;
      last_position = this.state.chunk.length - 1;
      prv_token = null;
      prv_entry = null;
      collector = [];
      flush = function*() {
        yield* collector;
        collector = [];
        return null;
      };
      while (true) {
        if (this.state.position >= last_position) {
          break;
        }
        match = null;
        ref = this.cfg.tokens;
        for (token in ref) {
          entry = ref[token];
          entry.matcher.lastIndex = this.state.position;
          if ((match = this.state.chunk.match(entry.matcher)) == null) {
            continue;
          }
          //...................................................................................................
          if (prv_entry != null ? prv_entry.consolidate : void 0) {
            debug('^345345^', prv_token, prv_entry, entry, collector);
            if (prv_token === entry.token) {
              debug('^68-1^');
              collector.push(token);
            } else {
              debug('^68-2^');
              /* TAINT code duplication */
              flush();
              yield ({
                token,
                text: match[0]
              });
            }
          } else {
            debug('^68-3^');
            flush();
            yield ({
              token,
              text: match[0]
            });
          }
          //...................................................................................................
          prv_token = token;
          prv_entry = entry;
          break;
        }
        if (match == null) {
          throw new Error("no match");
        }
        this.state.position += match[0].length;
      }
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    finish() {
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    reset() {
      return this.state = {
        position: 0,
        chunk: ''
      };
    }

  };

  //###########################################################################################################
  module.exports = {Token, Lexer};

}).call(this);

//# sourceMappingURL=main.js.map