precision highp float;

uniform sampler2D tex0;
uniform sampler2D tex1;

varying float vTexInd;
varying vec2 vTexCoord;

void main() {
    if (vTexInd < 1.0) {
        gl_FragColor = texture2D(tex0, vTexCoord);
    } else {
        gl_FragColor = texture2D(tex1, vTexCoord);
    }
}
