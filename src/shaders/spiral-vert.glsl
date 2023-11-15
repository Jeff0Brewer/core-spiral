attribute vec4 spiralPos;
attribute vec4 linearPos;
attribute vec2 texCoord;

uniform mat4 proj;
uniform mat4 view;
uniform float warpT;

varying vec2 vTexCoord;

void main() {
    vec4 position = (linearPos * warpT + spiralPos * (1.0 - warpT));
    gl_Position = proj * view * position;
    vTexCoord = texCoord;
}
