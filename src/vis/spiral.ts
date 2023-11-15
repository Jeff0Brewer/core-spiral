import { mat4 } from 'gl-matrix'
import { initProgram, initBuffer, initAttribute, initTexture } from '../lib/gl-wrap'
import vertSource from '../shaders/spiral-vert.glsl?raw'
import fragSource from '../shaders/spiral-frag.glsl?raw'

const POS_FPV = 2
const TEX_FPV = 2
const STRIDE = 2 * POS_FPV + TEX_FPV

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

        const bindSpiralPos = initAttribute(gl, this.program, 'spiralPos', POS_FPV, STRIDE, 0, gl.FLOAT)
        const bindLinearPos = initAttribute(gl, this.program, 'linearPos', POS_FPV, STRIDE, POS_FPV, gl.FLOAT)
        const bindTexCoord = initAttribute(gl, this.program, 'texCoord', TEX_FPV, STRIDE, 2 * POS_FPV, gl.FLOAT)
        this.bindAttrib = (): void => {
            bindSpiralPos()
            bindLinearPos()
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
        // could do binary search but this is fine for now
        let colInd = 0
        while (this.heightSearch[colInd] < height) {
            colInd++
        }
        return colInd
    }

    get (t: number, nextT?: number): {
        coord: [number, number], breakPercentage: number | null
    } {
        const tHeight = t * this.totalHeight
        const colInd = this.getColInd(tHeight)

        let breakPercentage = null
        if (nextT !== undefined) {
            const nextTHeight = nextT * this.totalHeight
            const nextColInd = this.getColInd(nextTHeight)

            // if columns change in current segment get value indicating
            // where column change happens so extra verts can be
            // added to prevent texture mapping errors
            if (colInd !== nextColInd) {
                const breakT = this.heightSearch[colInd] / this.totalHeight
                breakPercentage = (breakT - t) / (nextT - t)
            }
        }

        const x = colInd * this.columnWidth
        const y = tHeight - this.heightSearch[colInd - 1]
        return { coord: [x, y], breakPercentage }
    }
}

const getSpiralVerts = (
    metadata: ColumnTextureMetadata,
    numSegment: number,
    numRotation: number
): Float32Array => {
    const bandWidth = 0.01
    const radiusInc = 1 / numSegment
    const texMapper = new TextureMapper(metadata)
    const breakEpsilon = 0.000001

    const maxAngle = Math.PI * 2 * numRotation
    const maxRadius = 1
    const minRadius = bandWidth * 5

    const verts: Array<number> = []
    const addSpiralStep = (segmentInd: number, coord: [number, number]): void => {
        const segmentT = segmentInd / numSegment
        const angle = maxAngle * segmentT
        const radius = (maxRadius - minRadius) * segmentT + minRadius
        verts.push(
            Math.cos(angle) * (radius - bandWidth * 0.5),
            Math.sin(angle) * (radius - bandWidth * 0.5),
            0, 0, // temp
            coord[0],
            coord[1],
            Math.cos(angle) * (radius + bandWidth * 0.5),
            Math.sin(angle) * (radius + bandWidth * 0.5),
            0, 0, // temp
            coord[0] + metadata.width,
            coord[1]
        )
    }

    let radius = bandWidth * 5
    for (let i = 0; i < numSegment; i++, radius += radiusInc) {
        const thisT = Math.pow(i / numSegment, 1.5)
        const nextT = Math.pow((i + 1) / numSegment, 1.5)
        const { coord, breakPercentage } = texMapper.get(thisT, nextT)
        addSpiralStep(i, coord)

        if (breakPercentage !== null) {
            const breakT = thisT * (1 - breakPercentage) + nextT * breakPercentage
            const { coord: lowCoord } = texMapper.get(breakT - breakEpsilon)
            const { coord: highCoord } = texMapper.get(breakT + breakEpsilon)

            // add two sets of verts at same position with slightly different
            // texture coords so interpolation between end / start of columns doesn't break
            addSpiralStep(i + breakPercentage, lowCoord)
            addSpiralStep(i + breakPercentage, highCoord)
        }
    }

    return new Float32Array(verts)
}

export default CoreSpiral
export type { ColumnTextureMetadata }
