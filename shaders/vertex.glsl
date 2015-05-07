precision mediump float;

attribute vec3 position, color;
attribute float weight;

uniform mat4 model, view, projection;
uniform vec3 coordinates[3];
uniform vec4 colors[3];
uniform vec2 screenShape;
uniform float lineWidth;

varying vec4 fragColor;

vec3 project(vec3 p) {
  vec4 clip = projection * view * model * vec4(p, 1.0);
  return clip.xyz / clip.w;
}

void main() {
  vec3 vertexPosition = mix(coordinates[0],
    mix(coordinates[2], coordinates[1], 0.5 * (position + 1.0)), abs(position));

  vec3 clipPos = project(vertexPosition);
  vec3 clipOffset = project(vertexPosition + color);
  vec2 delta = weight * (clipPos.xy - clipOffset.xy) * screenShape;
  vec2 lineOffset = normalize(vec2(delta.y, -delta.x)) / screenShape;

  gl_Position   = vec4(clipPos.xy + 0.5 * lineWidth * lineOffset, clipPos.z, 1.0);
  fragColor     = color.x * colors[0] + color.y * colors[1] + color.z * colors[2];
}
