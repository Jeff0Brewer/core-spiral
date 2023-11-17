precision highp float;

uniform sampler2D mineral0;
uniform sampler2D mineral1;
uniform sampler2D mineral2;
uniform sampler2D mineral3;
uniform sampler2D mineral4;
uniform sampler2D mineral5;
uniform sampler2D mineral6;
uniform vec3 color0;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec3 color4;
uniform vec3 color5;
uniform vec3 color6;
uniform float mag0;
uniform float mag1;
uniform float mag2;
uniform float mag3;
uniform float mag4;
uniform float mag5;
uniform float mag6;

varying vec2 vTexCoord;

void main() {
    float val0 = texture2D(mineral0, vTexCoord).x;
    float val1 = texture2D(mineral1, vTexCoord).x;
    float val2 = texture2D(mineral2, vTexCoord).x;
    float val3 = texture2D(mineral3, vTexCoord).x;
    float val4 = texture2D(mineral4, vTexCoord).x;
    float val5 = texture2D(mineral5, vTexCoord).x;
    float val6 = texture2D(mineral6, vTexCoord).x;
    vec3 color =
        mag0 * val0 * color0 +
        mag1 * val1 * color1 +
        mag2 * val2 * color2 +
        mag3 * val3 * color3 +
        mag4 * val4 * color4 +
        mag5 * val5 * color5 +
        mag6 * val6 * color6;
    gl_FragColor = vec4(color, 1.0);
}
