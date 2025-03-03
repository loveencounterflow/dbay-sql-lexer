(function() {
  'use strict';
  var GUY, copy_regex, debug, echo, escape_for_regex, help, info, rpr, urge, warn, whisper;

  //###########################################################################################################
  GUY = require('guy');

  ({debug, info, whisper, warn, urge, help} = GUY.trm.get_loggers('DBAY-SQL-LEXER/types'));

  ({rpr, echo} = GUY.trm);

  ({escape_for_regex} = GUY.str);

  ({copy_regex} = GUY.samesame);

  //-----------------------------------------------------------------------------------------------------------
  module.exports = function(cfg) {
    var declare, types;
    types = new (require('intertype')).Intertype();
    ({declare} = types);
    //---------------------------------------------------------------------------------------------------------
    declare.lxr_unicode_regex(function(x) {
      if (!this.isa.regex(x)) {
        return false;
      }
      if (!x.unicode) {
        return false;
      }
      return true;
    });
    //---------------------------------------------------------------------------------------------------------
    declare.lxr_matcher({
      isa: 'lxr_unicode_regex',
      create: function(x) {
        var R;
        if (this.isa.text(x)) {
          R = new RegExp(escape_for_regex(x), 'uy');
        } else {
          if (!this.isa.regex(x)) {
            return x;
          }
          R = copy_regex(x, {
            sticky: true
          });
        }
        return R;
      }
    });
    //---------------------------------------------------------------------------------------------------------
    declare.lxr_token_cfg({
      fields: {
        matcher: 'lxr_matcher',
        consolidate: 'boolean'
      },
      default: {
        matcher: null,
        consolidate: false
      },
      create: function(x) {
        var R;
        if (this.isa.text(x)) {
          R = {
            matcher: x
          };
        } else if (this.isa.regex(x)) {
          R = {
            matcher: x
          };
        } else if (this.isa.object(x)) {
          R = x;
        } else {
          return x;
        }
        R.matcher = this.create.lxr_matcher(R.matcher);
        return {...this.registry.lxr_token_cfg.default, ...R};
      }
    });
    // #---------------------------------------------------------------------------------------------------------
    // declare.lxr_token_entry
    //   isa: 'lxr_unicode_regex.or.lxr_token_cfg'

    // #---------------------------------------------------------------------------------------------------------
    // declare.dbm_anchored_regex ( x ) ->
    //   return false unless @isa.regex x
    //   return false if x.global
    //   return false if x.sticky
    //   return true

    // #---------------------------------------------------------------------------------------------------------
    // declare.dbm_mode ( x ) -> x in [ 'strict', 'practical', ]

    // #---------------------------------------------------------------------------------------------------------
    // declare.dbm_constructor_cfg
    //   fields:
    //     prefix:               'nonempty.text'
    //     escape:               'nonempty.text'
    //     mode:                 'dbm_mode'
    //     _any_name_re:         'regex'
    //     _bare_name_re:        'dbm_global_regex'
    //     _paren_name_re:       'dbm_global_regex'
    //     _start_paren_name_re: 'dbm_anchored_regex'
    //     _escaped_prefix_re:   'dbm_global_regex'
    //     _prefix_esc:          'nonempty.text'
    //     _escape_esc:          'nonempty.text'
    //   default:
    //     prefix:               '@'
    //     # escape:               '\\'
    //     escape:               '%'
    //     mode:                 'practical'
    //     # _any_name_re:              /[\p{Letter}_][\p{Letter}_\d]*/u
    //     ### this regex lifted from Intertype@0.105.1/declarations ###
    //     _prefix_esc:          null
    //     _escape_esc:          null
    //     _any_name_re:         null
    //     _bare_name_re:        null
    //     _paren_name_re:       null
    //     _start_paren_name_re: null
    //     _escaped_prefix_re:   null
    //     # _global_name_re:  null
    //   create: ( cfg ) ->
    //     R = { @registry.dbm_constructor_cfg.default..., cfg..., }
    //     return R unless @isa.nonempty.text R.prefix
    //     #.....................................................................................................
    //     return R if R._prefix_esc?
    //     return R if R._escape_esc?
    //     return R if R._any_name_re?
    //     return R if R._bare_name_re?
    //     return R if R._paren_name_re?
    //     return R if R._start_paren_name_re?
    //     return R if R._escaped_prefix_re?
    //     #.....................................................................................................
    //     ### TAINT harmonize naming, use either `re` or `rx` ###
    //     R._prefix_esc           = escape_for_regex R.prefix
    //     R._escape_esc           = escape_for_regex R.escape
    //     R._any_name_re          = rx.get_rx_for_any_name          R
    //     R._bare_name_re         = rx.get_rx_for_bare_name         R
    //     R._paren_name_re        = rx.get_rx_for_paren_name        R
    //     R._start_paren_name_re  = rx.get_rx_for_start_paren_name  R
    //     R._escaped_prefix_re    = rx.get_rx_for_escaped_prefix    R
    //     R._escaped_escape_re    = rx.get_rx_for_escaped_escape    R
    //     # R._escaped_prefix_re    = /// #{R._escape_esc} #{R._prefix_esc} ///gu
    //     ### prefix, escape must not match chrs.*.forbidden.tail ###
    //     ### prefix, escape must be different from each other (can be substrings???) ###
    //     #.....................................................................................................
    //     declare.dbm_parameter_list ( x ) ->
    //       return false unless @isa.list.of.nonempty.text x
    //       return false unless x.every ( p ) -> ( p.match R._bare_name_re )?
    //       return true
    //     return R

    //---------------------------------------------------------------------------------------------------------
    return types;
  };

}).call(this);

//# sourceMappingURL=types.js.map