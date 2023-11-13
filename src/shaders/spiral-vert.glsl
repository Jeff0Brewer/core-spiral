attribute vec4 position;
attribute vec2 texCoord;
attribute float texInd;

uniform mat4 proj;
uniform mat4 view;

varying float vTexInd;
varying vec2 vTexCoord;

void main() {
    gl_Position = proj * view * position;
    vTexInd = texInd;
    vTexCoord = texCoord;
}
