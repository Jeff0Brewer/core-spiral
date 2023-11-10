import { initGl, initProgram, initBuffer, initAttribute } from '../lib/gl-wrap'
import vertSource from '../shaders/spiral-vert.glsl?raw'
import fragSource from '../shaders/spiral-frag.glsl?raw'

class CoreSpiral {
    gl: WebGLRenderingContext
    program: WebGLProgram
    buffer: WebGLBuffer
    bindAttrib: () => void

    constructor (canvas: HTMLCanvasElement, numSegment: number, numRotation: number) {
        this.gl = initGl(canvas)
        this.program = initProgram(this.gl, vertSource, fragSource)

        const angleInc = Math.PI * 2 * numRotation / numSegment
        const maxRadius = 1
        const radiusInc = maxRadius / numSegment
    }
}
