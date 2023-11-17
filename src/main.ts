import { loadImageAsync } from './lib/load'
import Vis from './vis/vis'
import type { ColumnTextureMetadata } from './vis/spiral'
import './style.css'

const main = async (): Promise<void> => {
    const imgPromises = [
        loadImageAsync('./data/gt1-0-00.png'),
        loadImageAsync('./data/gt1-0-01.png'),
        loadImageAsync('./data/gt1-0-02.png'),
        loadImageAsync('./data/gt1-0-03.png'),
        loadImageAsync('./data/gt1-0-04.png'),
        loadImageAsync('./data/gt1-0-05.png'),
        loadImageAsync('./data/gt1-0-06.png')
    ]
    const imgs = await Promise.all(imgPromises)
    const metadata: ColumnTextureMetadata = await fetch('./data/metadata.json').then(res => res.json())
    const vis = new Vis(imgs, metadata)

    const tick = (): void => {
        vis.draw()
        window.requestAnimationFrame(tick)
    }
    window.requestAnimationFrame(tick)
}

main()
