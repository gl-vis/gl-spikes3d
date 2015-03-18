'use strict'

var createBuffer = require('gl-buffer')
var createVAO = require('gl-vao')
var glslify = require('glslify')

module.exports = createSpikes

var createShader = glslify({
  vert: './shaders/vertex.glsl',
  frag: './shaders/fragment.glsl'
})

var identity = [1,0,0,0,
                0,1,0,0,
                0,0,1,0,
                0,0,0,1]

function AxisSpikes(gl, buffer, vao, shader) {
  this.gl         = gl
  this.buffer     = buffer
  this.vao        = vao
  this.shader     = shader
  this.bounds     = [[-1000,-1000,-1000], [1000,1000,1000]]
  this.position   = [0,0,0]
  this.lineWidth  = [2,2,2]
  this.colors     = [[0,0,0,1], [0,0,0,1], [0,0,0,1]]
  this.enabled    = [true,true,true]
  this.drawSides  = [true,true,true]
  this.axes       = null
}

var proto = AxisSpikes.prototype

var OUTER_FACE = [0,0,0]
var INNER_FACE = [0,0,0]

proto.isTransparent = function() {
  return false
}

proto.drawTransparent = function(camera) {}

proto.draw = function(camera) {
  var gl = this.gl
  var vao = this.vao
  var shader = this.shader

  vao.bind()
  shader.bind()

  var model      = camera.model || identity
  var view       = camera.view || identity
  var projection = camera.projection || identity

  var axis
  if(this.axes) {
    axis = this.axes.lastCubeProps.axis
  }

  var outerFace = OUTER_FACE
  var innerFace = INNER_FACE
  for(var i=0; i<3; ++i) {
    if(axis && axis[i] < 0) {
      outerFace[i] = this.bounds[0][i]
      innerFace[i] = this.bounds[1][i]
    } else {
      outerFace[i] = this.bounds[1][i]
      innerFace[i] = this.bounds[0][i]
    }
  }
  
  shader.uniforms.model       = model
  shader.uniforms.view        = view
  shader.uniforms.projection  = projection
  shader.uniforms.coordinates = [this.position, outerFace, innerFace]
  shader.uniforms.colors      = this.colors

  for(var i=0; i<3; ++i) {
    gl.lineWidth(this.lineWidth[i])
    if(this.enabled[i]) {
      vao.draw(gl.LINES, 2, 2*i)
      if(this.drawSides[i]) {
        vao.draw(gl.LINES, 4, 6+4*i)
      }
    }
  }

  vao.unbind()
}

proto.update = function(options) {
  if(!options) {
    return
  }
  if("bounds" in options) {
    this.bounds = options.bounds
  }
  if("position" in options) {
    this.position = options.position
  }
  if("lineWidth" in options) {
    this.lineWidth = options.lineWidth
  }
  if("colors" in options) {
    this.colors = options.colors
  }
  if("enabled" in options) {
    this.enabled = options.enabled
  }
  if("drawSides" in options) {
    this.drawSides = options.drawSides
  }
}

proto.dispose = function() {
  this.vao.dispose()
  this.buffer.dispose()
  this.shader.dispose()
}

function createSpikes(gl, options) {
  //Create buffers
  var data = [
    0, 0, 0,  1, 0, 0,
    1, 0, 0,  1, 0, 0,
    0, 0, 0,  0, 1, 0,
    0, 1, 0,  0, 1, 0,
    0, 0, 0,  0, 0, 1,
    0, 0, 1,  0, 0, 1,

    1,-1, 0,  1, 0, 0,
    1, 1, 0,  1, 0, 0,
    1, 0,-1,  1, 0, 0,
    1, 0, 1,  1, 0, 0,

   -1, 1, 0,  0, 1, 0,
    1, 1, 0,  0, 1, 0,
    0, 1,-1,  0, 1, 0,
    0, 1, 1,  0, 1, 0,
    
   -1, 0, 1,  0, 0, 1,
    1, 0, 1,  0, 0, 1,
    0,-1, 1,  0, 0, 1,
    0, 1, 1,  0, 0, 1
  ]
  var buffer = createBuffer(gl, data)
  var vao = createVAO(gl, [{
    type: gl.FLOAT,
    buffer: buffer,
    size: 3,
    offset: 0,
    stride: 24
  }, {
    type: gl.FLOAT,
    buffer: buffer,
    size: 3,
    offset: 12,
    stride: 24
  }])

  //Create shader
  var shader = createShader(gl)
  shader.attributes.position.location = 0
  shader.attributes.color.location = 1

  //Create spike object
  var spikes = new AxisSpikes(gl, buffer, vao, shader)

  //Set parameters
  spikes.update(options)

  //Return resulting object
  return spikes
}