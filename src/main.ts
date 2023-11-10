import { getFullscreenCanvas } from './components/canvas'
import Vis from './vis/vis'
import './style.css'

const canvas = getFullscreenCanvas()
document.body.appendChild(canvas)

const vis = new Vis(canvas)

const tick = (): void => {
    vis.draw()
    window.requestAnimationFrame(tick)
}

window.requestAnimationFrame(tick)
