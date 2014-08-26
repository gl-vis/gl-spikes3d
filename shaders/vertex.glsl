precision mediump float;

attribute vec3 position, color;

uniform mat4 model, view, projection;
uniform vec3 coordinates[3];
uniform vec4 colors[3];

varying vec4 fragColor;

void main() {
  vec3 vertexPosition = mix(coordinates[0], 
    mix(coordinates[2], coordinates[1], 0.5 * (position + 1.0)), abs(position));
  
  vec4 worldCoordinate = model * vec4(vertexPosition, 1.0);
  vec4 viewCoordinate = view * worldCoordinate;
  vec4 clipCoordinate = projection * viewCoordinate;

  gl_Position   = clipCoordinate;
  fragColor     = color.x * colors[0] + color.y * colors[1] + color.z * colors[2];
}