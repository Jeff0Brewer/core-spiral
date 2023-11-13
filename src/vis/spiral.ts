import { mat4 } from 'gl-matrix'
import { initProgram, initBuffer, initAttribute, initTexture, getTextureAttachments } from '../lib/gl-wrap'
import type { Metadata } from '../vis/vis'
import vertSource from '../shaders/spiral-vert.glsl?raw'
import fragSource from '../shaders/spiral-frag.glsl?raw'

class CoreSpiral {
    program: WebGLProgram
    buffer: WebGLBuffer
    textures: Array<WebGLTexture>
    texAttachments: Array<number>
    bindAttrib: () => void
    setProj: (m: mat4) => void
    setView: (m: mat4) => void
    numVertex: number

    constructor (
        gl: WebGLRenderingContext,
        images: Array<HTMLImageElement>,
        metadata: Metadata,
        numRotation: number,
        numSegment: number
    ) {
        this.program = initProgram(gl, vertSource, fragSource)
        console.log(metadata)

        this.textures = []
        this.texAttachments = getTextureAttachments(gl)
        for (let i = 0; i < images.length; i++) {
            gl.activeTexture(this.texAttachments[i])
            this.textures.push(initTexture(gl))
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.LUMINANCE,
                gl.LUMINANCE,
                gl.UNSIGNED_BYTE,
                images[i]
            )
        }

        const maxRadius = 1
        const bandWidth = 0.05
        const angleInc = Math.PI * 2 * numRotation / numSegment
        const radiusInc = maxRadius / numSegment
        const verts = []
        let angle = 0
        let radius = bandWidth
        for (let i = 0; i < numSegment; i++, angle += angleInc, radius += radiusInc) {
            const pos0 = [
                Math.cos(angle) * (radius - bandWidth * 0.5),
                Math.sin(angle) * (radius - bandWidth * 0.5)
            ]
            const pos1 = [
                Math.cos(angle) * (radius + bandWidth * 0.5),
                Math.sin(angle) * (radius + bandWidth * 0.5)
            ]
            verts.push(
                ...pos0,
                ...pos0, // temp tex coord
                0, // temp tex ind
                ...pos1,
                ...pos1, // temp tex coord
                0 // temp tex ind
            )
        }
        this.numVertex = verts.length / 5

        this.buffer = initBuffer(gl)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW)

        const bindPosition = initAttribute(gl, this.program, 'position', 2, 5, 0, gl.FLOAT)
        const bindTexCoord = initAttribute(gl, this.program, 'texCoord', 2, 5, 2, gl.FLOAT)
        const bindTexInd = initAttribute(gl, this.program, 'texInd', 1, 5, 4, gl.FLOAT)
        this.bindAttrib = (): void => {
            bindPosition()
            bindTexCoord()
            bindTexInd()
        }

        const tex0Loc = gl.getUniformLocation(this.program, 'tex0')
        const tex1Loc = gl.getUniformLocation(this.program, 'tex1')
        gl.uniform1i(tex0Loc, 0)
        gl.uniform1i(tex1Loc, 1)

        const projLoc = gl.getUniformLocation(this.program, 'proj')
        const viewLoc = gl.getUniformLocation(this.program, 'view')
        this.setProj = (m: mat4): void => {
            gl.useProgram(this.program)
            gl.uniformMatrix4fv(projLoc, false, m)
        }
        this.setView = (m: mat4): void => {
            gl.useProgram(this.program)
            gl.uniformMatrix4fv(viewLoc, false, m)
        }
    }

    draw (gl: WebGLRenderingContext): void {
        gl.useProgram(this.program)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
        this.bindAttrib()

        for (let i = 0; i < this.textures.length; i++) {
            gl.activeTexture(this.texAttachments[i])
            gl.bindTexture(gl.TEXTURE_2D, this.textures[i])
        }

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.numVertex)
    }
}

export default CoreSpiral
