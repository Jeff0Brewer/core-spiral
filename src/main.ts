import { loadImageAsync } from './lib/load'
import Vis from './vis/vis'
import type { SpiralMetadata } from './vis/spiral'
import './style.css'

const main = async (): Promise<void> => {
    const img = await loadImageAsync('./data/gt1.png')
    const metadata: SpiralMetadata = await fetch('./data/metadata.json').then(res => res.json())
    const vis = new Vis(img, metadata)

    const tick = (): void => {
        vis.draw()
        window.requestAnimationFrame(tick)
    }
    window.requestAnimationFrame(tick)
}

main()
