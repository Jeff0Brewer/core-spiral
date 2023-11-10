import Vis from './vis/vis'
import './style.css'

const vis = new Vis()

const tick = (): void => {
    vis.draw()
    window.requestAnimationFrame(tick)
}
window.requestAnimationFrame(tick)
