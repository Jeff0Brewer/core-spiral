import { initGl } from '../lib/gl-wrap'
import CoreSpiral from '../vis/spiral'

class Vis {
    gl: WebGLRenderingContext
    spiral: CoreSpiral

    constructor (canvas: HTMLCanvasElement) {
        this.gl = initGl(canvas)
        this.spiral = new CoreSpiral(this.gl, 30000, 10)
    }

    draw (): void {
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT || this.gl.COLOR_BUFFER_BIT)

        this.spiral.draw(this.gl)
    }
}

export default Vis
