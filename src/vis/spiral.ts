import { mat4 } from 'gl-matrix'
import { initProgram, initBuffer, initAttribute, initTexture } from '../lib/gl-wrap'
import vertSource from '../shaders/spiral-vert.glsl?raw'
import fragSource from '../shaders/spiral-frag.glsl?raw'

type ColumnTextureMetadata = {
    width: number,
    heights: Array<number>
}

class CoreSpiral {
    program: WebGLProgram
    buffer: WebGLBuffer
    texture: WebGLTexture
    bindAttrib: () => void
    setProj: (m: mat4) => void
    setView: (m: mat4) => void
    numVertex: number

    constructor (
        gl: WebGLRenderingContext,
        img: HTMLImageElement,
        metadata: ColumnTextureMetadata,
        numRotation: number,
        numSegment: number
    ) {
        this.program = initProgram(gl, vertSource, fragSource)

        this.texture = initTexture(gl)
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.LUMINANCE,
            gl.LUMINANCE,
            gl.UNSIGNED_BYTE,
            img
        )

        const texMapper = new TextureMapper(metadata)
        const maxRadius = 1
        const bandWidth = 0.01
        const angleInc = Math.PI * 2 * numRotation / numSegment
        const radiusInc = maxRadius / numSegment
        const verts = []
        let angle = 0
        let radius = bandWidth * 5
        for (let i = 0; i < numSegment; i++, angle += angleInc, radius += radiusInc) {
            const coord = texMapper.get(Math.pow(i / numSegment, 1.5))
            const pos0 = [
                Math.cos(angle) * (radius - bandWidth * 0.5),
                Math.sin(angle) * (radius - bandWidth * 0.5)
            ]
            const coord0 = [...coord]
            const pos1 = [
                Math.cos(angle) * (radius + bandWidth * 0.5),
                Math.sin(angle) * (radius + bandWidth * 0.5)
            ]
            const coord1 = [
                coord[0] + metadata.width,
                coord[1]
            ]
            verts.push(
                ...pos0,
                ...coord0,
                ...pos1,
                ...coord1
            )
        }
        this.numVertex = verts.length / 4

        this.buffer = initBuffer(gl)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW)

        const bindPosition = initAttribute(gl, this.program, 'position', 2, 4, 0, gl.FLOAT)
        const bindTexCoord = initAttribute(gl, this.program, 'texCoord', 2, 4, 2, gl.FLOAT)
        this.bindAttrib = (): void => {
            bindPosition()
            bindTexCoord()
        }

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

        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
        this.bindAttrib()

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.numVertex)
    }
}

// helper for mapping texture with columns of data
// to continuous strip
class TextureMapper {
    columnWidth: number
    columnHeights: Array<number>
    totalHeight: number

    constructor (metadata: ColumnTextureMetadata) {
        this.columnWidth = metadata.width
        this.columnHeights = metadata.heights

        const sum = (a: number, b: number): number => a + b
        this.totalHeight = this.columnHeights.reduce(sum, 0)
    }

    get (t: number): [number, number] {
        const tHeight = t * this.totalHeight

        let colInd = 0
        let colTotal = this.columnHeights[0]
        while (colTotal < tHeight) {
            colInd++
            colTotal += this.columnHeights[colInd]
        }

        const x = (colInd * this.columnWidth) % 1
        const y = (this.columnHeights[colInd] - (colTotal - tHeight))
        return [x, y]
    }
}

export default CoreSpiral
export type { ColumnTextureMetadata }
