import { mat4 } from 'gl-matrix'
import { initProgram, initBuffer, initAttribute } from '../lib/gl-wrap'
import vertSource from '../shaders/spiral-vert.glsl?raw'
import fragSource from '../shaders/spiral-frag.glsl?raw'

class CoreSpiral {
    program: WebGLProgram
    buffer: WebGLBuffer
    bindAttrib: () => void
    numVertex: number

    constructor (gl: WebGLRenderingContext, numSegment: number, numRotation: number) {
        this.program = initProgram(gl, vertSource, fragSource)

        const maxRadius = 1
        const bandWidth = 0.05
        const angleInc = Math.PI * 2 * numRotation / numSegment
        const radiusInc = maxRadius / numSegment
        const verts = []
        let angle = 0
        let radius = bandWidth
        for (let i = 0; i < numSegment; i++, angle += angleInc, radius += radiusInc) {
            verts.push(
                Math.cos(angle) * (radius - bandWidth * 0.5),
                Math.sin(angle) * (radius - bandWidth * 0.5),
                Math.cos(angle) * (radius + bandWidth * 0.5),
                Math.sin(angle) * (radius + bandWidth * 0.5)
            )
        }
        this.numVertex = verts.length / 2

        this.buffer = initBuffer(gl)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW)

        this.bindAttrib = initAttribute(
            gl,
            this.program,
            'position',
            2,
            2,
            0,
            gl.FLOAT
        )

        const projLoc = gl.getUniformLocation(this.program, 'proj')
        const viewLoc = gl.getUniformLocation(this.program, 'view')

        const fov = Math.PI * 0.5
        const near = 0.1
        const far = 10
        const proj = mat4.perspective(
            mat4.create(),
            fov,
            window.innerWidth / window.innerHeight,
            near,
            far
        )

        window.addEventListener('resize', (): void => {
            mat4.perspective(
                proj,
                fov,
                window.innerWidth / window.innerHeight,
                near,
                far
            )
            gl.uniformMatrix4fv(projLoc, false, proj)
            gl.viewport(
                0,
                0,
                window.innerWidth * window.devicePixelRatio,
                window.innerHeight * window.devicePixelRatio
            )
        })

        const view = mat4.lookAt(
            mat4.create(),
            [0, 0, 2],
            [0, 0, 0],
            [0, 1, 0]
        )

        gl.uniformMatrix4fv(projLoc, false, proj)
        gl.uniformMatrix4fv(viewLoc, false, view)

        gl.viewport(
            0,
            0,
            window.innerWidth * window.devicePixelRatio,
            window.innerHeight * window.devicePixelRatio
        )
    }

    draw (gl: WebGLRenderingContext): void {
        gl.useProgram(this.program)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
        this.bindAttrib()

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.numVertex)
    }
}

export default CoreSpiral
