import { mat4 } from 'gl-matrix'
import { initProgram, initBuffer, initAttribute, initTexture } from '../lib/gl-wrap'
import vertSource from '../shaders/spiral-vert.glsl?raw'
import fragSource from '../shaders/spiral-frag.glsl?raw'

const POS_FPV = 2
const TEX_FPV = 2
const STRIDE = POS_FPV + TEX_FPV

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
        numSegment: number,
        numRotation: number
    ) {
        this.program = initProgram(gl, vertSource, fragSource)

        const verts = getSpiralVerts(metadata, numSegment, numRotation)
        this.numVertex = verts.length / STRIDE

        this.buffer = initBuffer(gl)
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)

        this.texture = initTexture(gl)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, img)

        const bindPosition = initAttribute(gl, this.program, 'position', POS_FPV, STRIDE, 0, gl.FLOAT)
        const bindTexCoord = initAttribute(gl, this.program, 'texCoord', TEX_FPV, STRIDE, POS_FPV, gl.FLOAT)
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
    heightSearch: Array<number>
    totalHeight: number

    constructor (metadata: ColumnTextureMetadata) {
        this.columnWidth = metadata.width

        // get total height and list of height sums for index search
        this.totalHeight = 0
        this.heightSearch = [0, ...metadata.heights].map(v => {
            this.totalHeight += v
            return this.totalHeight
        })
    }

    getColInd (height: number): number {
        let colInd = 0
        while (this.heightSearch[colInd + 1] < height) {
            colInd++
        }
        return colInd
    }

    get (t: number): [number, number] {
        const tHeight = t * this.totalHeight
        const colInd = this.getColInd(tHeight)

        const x = colInd * this.columnWidth
        const y = tHeight - this.heightSearch[colInd]
        return [x, y]
    }
}

const getSpiralVerts = (
    metadata: ColumnTextureMetadata,
    numSegment: number,
    numRotation: number
): Float32Array => {
    const bandWidth = 0.01
    const radiusInc = 1 / numSegment
    const angleInc = Math.PI * 2 * numRotation / numSegment
    const texMapper = new TextureMapper(metadata)

    const verts = []
    let angle = 0
    let radius = bandWidth * 5
    for (let i = 0; i < numSegment; i++, angle += angleInc, radius += radiusInc) {
        const innerRadius = (radius - bandWidth * 0.5)
        const outerRadius = (radius + bandWidth * 0.5)

        const innerCoord = texMapper.get(Math.pow(i / numSegment, 1.5))
        const outerCoord = [innerCoord[0] + metadata.width, innerCoord[1]]

        verts.push(
            Math.cos(angle) * innerRadius,
            Math.sin(angle) * innerRadius,
            ...innerCoord,
            Math.cos(angle) * outerRadius,
            Math.sin(angle) * outerRadius,
            ...outerCoord
        )
    }

    return new Float32Array(verts)
}

export default CoreSpiral
export type { ColumnTextureMetadata }
