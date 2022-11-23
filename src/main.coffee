
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
{ Moonriver }             = require 'moonriver'
{ $window }               = require 'moonriver/lib/transforms'
{ $ }                     = Moonriver


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
  reset: -> @state =
    position:   0
    chunk:      ''

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
    loop
      break if @state.position > last_position
      match = null
      for token, entry of @cfg.tokens
        entry.matcher.lastIndex = @state.position
        continue unless ( match = @state.chunk.match entry.matcher )?
        yield { token, text: match[ 0 ], }
        break
      throw new Error "no match" unless match?
      @state.position += match[ 0 ].length
    return null

  #---------------------------------------------------------------------------------------------------------
  _create_walker: ->
    last_position = null
    #.......................................................................................................
    walker = ->
      loop
        break if @state.position > last_position
        match = null
        for token, entry of @cfg.tokens
          debug '^34345345^', @state.chunk
          debug '^34345345^', @state.position, token
          entry.matcher.lastIndex = @state.position
          continue unless ( match = @state.chunk.match entry.matcher )?
          yield { token, text: match[ 0 ], }
          break
        throw new Error "no match" unless match?
        @state.position += match[ 0 ].length
      return null
    #.......................................................................................................
    R = ( walker.bind @ )()
    R.reset = =>
      last_position   = @state.chunk.length - 1
      @state.position = 0
      # @reset()
      return null
    #.......................................................................................................
    R.reset()
    return R

  #---------------------------------------------------------------------------------------------------------
  _create_pipeline: ->
    # last          = Symbol 'last'
    walker  = null
    mr      = new Moonriver()
    mr.push show = ( d ) -> urge '^49-1^', d
    mr.push xxx = ( source ) =>
      @state.chunk = source
      walker = @_create_walker()
    mr.push show = ( d ) -> urge '^49-2^', d
    mr.push xxx = ( d, send ) =>
      # debug '^342^', d for d from @walk()
      # info '^342^', d for d from @_create_walker()
      # debug '^342^', @state
      send token for token from walker
    mr.push $window -1, +1, null
    mr.push show = ( d ) -> urge '^49-3^', d
    # mr.push store = ( d ) => @state.tokens.push d
    return mr

  #---------------------------------------------------------------------------------------------------------
  finish: ->
    return null


############################################################################################################
module.exports = { Token, Lexer, }
