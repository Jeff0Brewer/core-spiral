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
        while (this.heightSearch[colInd] < height) {
            colInd++
        }
        return colInd
    }

    get (t: number, nextT: number): { coord: [number, number], breakPercentage: number | null } {
        const tHeight = t * this.totalHeight
        const colInd = this.getColInd(tHeight)

        const nextTHeight = nextT * this.totalHeight
        const nextColInd = this.getColInd(nextTHeight)

        // if columns change in current segment get value indicating
        // where column change happens so extra verts can be
        // added to prevent texture mapping errors
        let breakPercentage = null
        if (colInd !== nextColInd) {
            const breakT = this.heightSearch[colInd] / this.totalHeight
            breakPercentage = (breakT - t) / (nextT - t)
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
    const angleInc = Math.PI * 2 * numRotation / numSegment
    const texMapper = new TextureMapper(metadata)
    const breakEpsilon = 0.000001

    const verts: Array<number> = []
    const addSpiralStep = (angle: number, radius: number, coord: [number, number]): void => {
        const ir = radius - bandWidth * 0.5
        const or = radius + bandWidth * 0.5
        verts.push(
            Math.cos(angle) * ir,
            Math.sin(angle) * ir,
            coord[0],
            coord[1],
            Math.cos(angle) * or,
            Math.sin(angle) * or,
            coord[0] + metadata.width,
            coord[1]
        )
    }

    let angle = 0
    let radius = bandWidth * 5
    for (let i = 0; i < numSegment; i++, angle += angleInc, radius += radiusInc) {
        const thisT = Math.pow(i / numSegment, 1.5)
        const nextT = Math.pow((i + 1) / numSegment, 1.5)
        const { coord, breakPercentage } = texMapper.get(thisT, nextT)
        addSpiralStep(angle, radius, coord)

        if (breakPercentage !== null) {
            const breakAngle = angle + angleInc * breakPercentage
            const breakRadius = radius + radiusInc * breakPercentage

            const breakT = thisT * (1 - breakPercentage) + nextT * breakPercentage
            const { coord: lowCoord } = texMapper.get(breakT - breakEpsilon, 0)
            const { coord: highCoord } = texMapper.get(breakT + breakEpsilon, 0)

            addSpiralStep(breakAngle, breakRadius, lowCoord)
            addSpiralStep(breakAngle, breakRadius, highCoord)
        }
    }

    return new Float32Array(verts)
}

export default CoreSpiral
export type { ColumnTextureMetadata }
