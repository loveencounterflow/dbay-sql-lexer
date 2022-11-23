(function() {
  'use strict';
  var $, $window, GUY, Lexer, Moonriver, Token, alert, copy_regex, debug, echo, equals, help, info, inspect, log, plain, praise, rpr, urge, warn, whisper;

  //###########################################################################################################
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('DEMO-MOO-LEXER'));

  ({rpr, inspect, echo, log} = GUY.trm);

  //...........................................................................................................
  ({equals, copy_regex} = GUY.samesame);

  ({Moonriver} = require('moonriver'));

  ({$window} = require('moonriver/lib/transforms'));

  ({$} = Moonriver);

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
    reset() {
      return this.state = {
        position: 0,
        chunk: ''
      };
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
      var entry, last_position, match, ref, token;
      last_position = this.state.chunk.length - 1;
      while (true) {
        if (this.state.position > last_position) {
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
          yield ({
            token,
            text: match[0]
          });
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
    _create_walker() {
      var R, last_position, walker;
      last_position = null;
      //.......................................................................................................
      walker = function*() {
        var entry, match, ref, token;
        while (true) {
          if (this.state.position > last_position) {
            break;
          }
          match = null;
          ref = this.cfg.tokens;
          for (token in ref) {
            entry = ref[token];
            debug('^34345345^', this.state.chunk);
            debug('^34345345^', this.state.position, token);
            entry.matcher.lastIndex = this.state.position;
            if ((match = this.state.chunk.match(entry.matcher)) == null) {
              continue;
            }
            yield ({
              token,
              text: match[0]
            });
            break;
          }
          if (match == null) {
            throw new Error("no match");
          }
          this.state.position += match[0].length;
        }
        return null;
      };
      //.......................................................................................................
      R = (walker.bind(this))();
      R.reset = () => {
        last_position = this.state.chunk.length - 1;
        this.state.position = 0;
        // @reset()
        return null;
      };
      //.......................................................................................................
      R.reset();
      return R;
    }

    //---------------------------------------------------------------------------------------------------------
    _create_pipeline() {
      var mr, show, walker, xxx;
      // last          = Symbol 'last'
      walker = null;
      mr = new Moonriver();
      mr.push(show = function(d) {
        return urge('^49-1^', d);
      });
      mr.push(xxx = (source) => {
        this.state.chunk = source;
        return walker = this._create_walker();
      });
      mr.push(show = function(d) {
        return urge('^49-2^', d);
      });
      mr.push(xxx = (d, send) => {
        var results, token;
        results = [];
        for (token of walker) {
          // debug '^342^', d for d from @walk()
          // info '^342^', d for d from @_create_walker()
          // debug '^342^', @state
          results.push(send(token));
        }
        return results;
      });
      mr.push($window(-1, +1, null));
      mr.push(show = function(d) {
        return urge('^49-3^', d);
      });
      // mr.push store = ( d ) => @state.tokens.push d
      return mr;
    }

    //---------------------------------------------------------------------------------------------------------
    finish() {
      return null;
    }

  };

  //###########################################################################################################
  module.exports = {Token, Lexer};

}).call(this);

//# sourceMappingURL=main.js.map