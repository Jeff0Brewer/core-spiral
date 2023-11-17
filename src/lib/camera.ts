import { mat4, vec3 } from 'gl-matrix'

const PAN_SPEED = 0.001
const ZOOM_SPEED = 0.0005
const MAX_ZOOM = 5
const MIN_ZOOM = 0.01

class Camera2D {
    matrix: mat4
    defaultEye: vec3
    defaultFocus: vec3
    defaultUp: vec3
    currEye: vec3
    currFocus: vec3
    currUp: vec3
    currZoom: number
    dragging: boolean
    resetting: boolean
    reset: () => void

    constructor (eye: vec3, focus: vec3, up: vec3, element: HTMLElement) {
        this.matrix = mat4.create()
        mat4.lookAt(this.matrix, eye, focus, up)

        this.defaultEye = eye
        this.defaultFocus = focus
        this.defaultUp = up

        // clone curr vecs to prevent mutating defaults
        this.currEye = vec3.clone(eye)
        this.currFocus = vec3.clone(focus)
        this.currUp = vec3.clone(up)

        // get zoom from length between eye and focus
        this.currZoom = vec3.length(vec3.subtract(vec3.create(), this.currEye, this.currFocus))

        this.dragging = false
        this.resetting = false

        element.addEventListener('mousedown', () => {
            this.dragging = true
            this.resetting = false
        })
        element.addEventListener('mouseup', () => {
            this.dragging = false
        })
        element.addEventListener('mousemove', e => {
            if (this.dragging) {
                this.pan(e.movementX, -e.movementY)
            }
        })

        element.addEventListener('wheel', e => {
            this.resetting = false
            this.zoom(e.deltaY)
        })

        this.reset = (): void => {
            this.resetting = true
        }
    }

    update (): void {
        if (this.resetting) {
            vec3.lerp(this.currEye, this.currEye, this.defaultEye, 0.1)
            vec3.lerp(this.currFocus, this.currFocus, this.defaultFocus, 0.1)
            vec3.lerp(this.currUp, this.currUp, this.defaultUp, 0.1)

            this.currZoom = vec3.length(vec3.subtract(vec3.create(), this.currEye, this.currFocus))
            mat4.lookAt(this.matrix, this.currEye, this.currFocus, this.currUp)
        }
    }

    zoom (delta: number): void {
        const lookVec = vec3.subtract(vec3.create(), this.currEye, this.currFocus)
        const lookDir = vec3.normalize(vec3.create(), lookVec)

        this.currZoom = clamp(this.currZoom * (1 + delta * ZOOM_SPEED), MIN_ZOOM, MAX_ZOOM)

        vec3.scaleAndAdd(this.currEye, this.currFocus, lookDir, this.currZoom)

        mat4.lookAt(this.matrix, this.currEye, this.currFocus, this.currUp)
    }

    pan (deltaX: number, deltaY: number): void {
        const translate = vec3.fromValues(
            deltaX * PAN_SPEED,
            deltaY * PAN_SPEED,
            0
        )
        vec3.add(this.currEye, this.currEye, translate)
        vec3.add(this.currFocus, this.currFocus, translate)

        mat4.lookAt(this.matrix, this.currEye, this.currFocus, this.currUp)
    }
}

const clamp = (val: number, min: number, max: number): number => {
    return Math.max(Math.min(val, max), min)
}

export default Camera2D
