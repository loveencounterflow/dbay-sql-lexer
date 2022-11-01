
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
  whisper }               = GUY.trm.get_loggers 'DEMO-MOO-LEXER'
{ rpr
  inspect
  echo
  log     }               = GUY.trm
#...........................................................................................................
{ equals
  copy_regex }            = GUY.samesame


#===========================================================================================================
class Token

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    return undefined


#===========================================================================================================
class Lexer

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    @cfg                = cfg
    GUY.props.hide @, 'types', ( require './types' ) @cfg
    @[Symbol.iterator]  = @walk.bind @
    state               = @reset()
    @_compile()
    return undefined

  #---------------------------------------------------------------------------------------------------------
  _compile: ->
    for token, cfg of @cfg.tokens
      entry = @types.create.lxr_token_cfg cfg
      # debug '^5435^', { token, cfg, entry, }
      @cfg.tokens[ token ] = entry
    return null

  #---------------------------------------------------------------------------------------------------------
  read: ( source ) ->
    @reset()
    @feed source
    @finish()
    return [ @walk()..., ]

  #---------------------------------------------------------------------------------------------------------
  feed: ( chunk ) ->
    # @types.validate.text chunk ### TAINT also allow buffers ###
    @state.chunk = chunk
    return @

  #---------------------------------------------------------------------------------------------------------
  walk: ->
    last_position = @state.chunk.length - 1
    prv_token     = null
    prv_entry     = null
    collector     = []
    flush         = ->
      yield from collector
      collector = []
      return null
    loop
      break if @state.position >= last_position
      match = null
      for token, entry of @cfg.tokens
        entry.matcher.lastIndex = @state.position
        continue unless ( match = @state.chunk.match entry.matcher )?
        #...................................................................................................
        if prv_entry?.consolidate
          debug '^345345^', prv_token, prv_entry, entry, collector
          if prv_token is entry.token
            debug '^68-1^'
            collector.push token
          else
            debug '^68-2^'
            ### TAINT code duplication ###
            flush()
            yield { token, text: match[ 0 ], }
        else
          debug '^68-3^'
          flush()
          yield { token, text: match[ 0 ], }
        #...................................................................................................
        prv_token = token
        prv_entry = entry
        break
      unless match?
        throw new Error "no match"
      @state.position += match[ 0 ].length
    return null

  #---------------------------------------------------------------------------------------------------------
  finish: ->
    return null

  #---------------------------------------------------------------------------------------------------------
  reset: -> @state =
    position:   0
    chunk:      ''


############################################################################################################
module.exports = { Token, Lexer, }
