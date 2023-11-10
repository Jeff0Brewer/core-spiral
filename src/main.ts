import { getFullscreenCanvas } from './components/canvas'
import CoreSpiral from './vis/vis'
import './style.css'

const canvas = getFullscreenCanvas()
document.body.appendChild(canvas)

const spiral = new CoreSpiral(canvas, 30000, 10)

const tick = (): void => {
    spiral.draw()
    window.requestAnimationFrame(tick)
}

window.requestAnimationFrame(tick)
