import { mat4 } from 'gl-matrix'
import { initGl } from '../lib/gl-wrap'
import CoreSpiral from '../vis/spiral'

type Metadata = {
    width: number,
    heights: Array<number>
}

const FOV = Math.PI * 0.5
const NEAR = 0.1
const FAR = 10

class Vis {
    canvas: HTMLCanvasElement
    gl: WebGLRenderingContext
    view: mat4
    proj: mat4
    spiral: CoreSpiral

    constructor (img: HTMLImageElement, metadata: Metadata) {
        this.canvas = document.createElement('canvas')
        document.body.appendChild(this.canvas)

        this.gl = initGl(this.canvas)

        this.spiral = new CoreSpiral(this.gl, img, metadata, 75, 5000)

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

            mat4.perspective(
                this.proj,
                FOV,
                w / h,
                NEAR,
                FAR
            )
            this.spiral.setProj(this.proj)

            this.gl.viewport(0, 0, w, h)
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
export type { Metadata }
