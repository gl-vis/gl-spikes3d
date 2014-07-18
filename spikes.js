'use strict'

var createBuffer = require('gl-buffer')
var createVAO = require('gl-vao')
var glslify = require('glslify')
var axesParams = require('gl-axes/lib/cube')

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
  this.gl = gl
  this.buffer = buffer
  this.vao = vao
  this.shader = shader
  this.bounds = [[-1000,-1000,-1000], [1000,1000,1000]]
  this.position = [0,0,0]
  this.lineWidth = 2
  this.colors = [[0,0,0], [0,0,0], [0,0,0]]
  this.enabled = true
  this.drawSides = true
}

var proto = AxisSpikes.prototype

proto.draw = function(camera) {
  if(!this.enabled) {
    return
  }

  var gl = this.gl
  var vao = this.vao
  var shader = this.shader

  vao.bind()
  shader.bind()

  var model = camera.model || identity
  var view = camera.view || identity
  var projection = camera.projection || identity

  var axis = axesParams(model, view, projection, this.bounds).axis
  var outerFace = [0,0,0]
  var innerFace = [0,0,0]
  for(var i=0; i<3; ++i) {
    if(axis[i] < 0) {
      outerFace[i] = this.bounds[0][i]
      innerFace[i] = this.bounds[1][i]
    } else {
      outerFace[i] = this.bounds[1][i]
      innerFace[i] = this.bounds[0][i]
    }
  }
  
  shader.uniforms.model = model
  shader.uniforms.view = view
  shader.uniforms.projection = projection
  shader.uniforms.coordinates = [this.position, outerFace, innerFace]
  shader.uniforms.colors = this.colors

  gl.lineWidth(this.lineWidth)

  if(this.drawSides) {
    vao.draw(gl.LINES, 18)
  } else {
    vao.draw(gl.LINES, 6)
  }

  vao.unbind()
}

proto.update = function(options) {
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