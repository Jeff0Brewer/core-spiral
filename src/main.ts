import { loadImageAsync } from './lib/load'
import Vis from './vis/vis'
import './style.css'

const main = async (): Promise<void> => {
    const imgPromises = [
        loadImageAsync('./gt1-0.png'),
        loadImageAsync('./gt1-1.png')
    ]
    const imgs = await Promise.all(imgPromises)

    const vis = new Vis(imgs)

    const tick = (): void => {
        vis.draw()
        window.requestAnimationFrame(tick)
    }
    window.requestAnimationFrame(tick)
}

main()
