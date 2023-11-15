attribute vec4 spiralPos;
attribute vec4 linearPos;
attribute vec2 texCoord;

uniform mat4 proj;
uniform mat4 view;

varying vec2 vTexCoord;

void main() {
    if (linearPos.x != 0.0) { // so compiler doesn't remove linearPos attrib
        gl_Position = spiralPos;
    }
    gl_Position = proj * view * spiralPos;
    vTexCoord = texCoord;
}
