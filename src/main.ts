import { loadImageAsync } from './lib/load'
import Vis from './vis/vis'
import type { Metadata } from './vis/vis'
import './style.css'

const main = async (): Promise<void> => {
    const imgPromises = [
        loadImageAsync('./data/gt1-0.png'),
        loadImageAsync('./data/gt1-1.png')
    ]
    const imgs = await Promise.all(imgPromises)

    const metadata: Metadata = await fetch('./data/metadata.json').then(res => res.json())

    const vis = new Vis(imgs, metadata)

    const tick = (): void => {
        vis.draw()
        window.requestAnimationFrame(tick)
    }
    window.requestAnimationFrame(tick)
}

main()
