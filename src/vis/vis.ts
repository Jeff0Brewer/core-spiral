import { mat4 } from 'gl-matrix'
import { initGl } from '../lib/gl-wrap'
import CoreSpiral, { ColumnTextureMetadata } from '../vis/spiral'
import Camera2D from '../lib/camera'

class Vis {
    canvas: HTMLCanvasElement
    gl: WebGLRenderingContext
    camera: Camera2D
    proj: mat4
    spiral: CoreSpiral

    constructor (imgs: Array<HTMLImageElement>, metadata: ColumnTextureMetadata) {
        this.canvas = document.createElement('canvas')
        document.body.appendChild(this.canvas)

        this.gl = initGl(this.canvas)

        this.camera = new Camera2D([0, 0, 1], [0, 0, 0], [0, -1, 0], this.canvas)
        this.spiral = new CoreSpiral(this.gl, imgs, metadata, 10000, 30, this.camera.reset)
        this.spiral.setView(this.camera.matrix)

        this.proj = mat4.create()

        const resize = (): void => {
            const w = window.innerWidth * window.devicePixelRatio
            const h = window.innerHeight * window.devicePixelRatio

            this.canvas.width = w
            this.canvas.height = h

            this.gl.viewport(0, 0, w, h)

            mat4.perspective(this.proj, Math.PI * 0.5, w / h, 0.01, 6)
            this.spiral.setProj(this.proj)
        }
        resize() // init canvas size / proj matrix / gl viewport
        window.addEventListener('resize', resize)
    }

    draw (): void {
        this.camera.update()
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT || this.gl.COLOR_BUFFER_BIT)

        this.spiral.setView(this.camera.matrix)
        this.spiral.draw(this.gl)
    }
}

export default Vis
