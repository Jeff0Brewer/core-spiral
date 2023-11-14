import { mat4 } from 'gl-matrix'
import { initGl } from '../lib/gl-wrap'
import CoreSpiral, { ColumnTextureMetadata } from '../vis/spiral'

class Vis {
    canvas: HTMLCanvasElement
    gl: WebGLRenderingContext
    view: mat4
    proj: mat4
    spiral: CoreSpiral

    constructor (img: HTMLImageElement, metadata: ColumnTextureMetadata) {
        this.canvas = document.createElement('canvas')
        document.body.appendChild(this.canvas)

        this.gl = initGl(this.canvas)

        this.spiral = new CoreSpiral(this.gl, img, metadata, 5000, 75)

        this.view = mat4.lookAt(
            mat4.create(),
            [0, 0, 1],
            [0, 0, 0],
            [0, -1, 0]
        )
        this.spiral.setView(this.view)

        this.proj = mat4.create()

        const resize = (): void => {
            const w = window.innerWidth * window.devicePixelRatio
            const h = window.innerHeight * window.devicePixelRatio

            this.canvas.width = w
            this.canvas.height = h

            this.gl.viewport(0, 0, w, h)

            mat4.perspective(this.proj, Math.PI * 0.5, w / h, 0.1, 10)
            this.spiral.setProj(this.proj)
        }
        resize() // init canvas size / proj matrix / gl viewport
        window.addEventListener('resize', resize)
    }

    draw (): void {
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT || this.gl.COLOR_BUFFER_BIT)

        this.spiral.draw(this.gl)
    }
}

export default Vis
