const getFullscreenCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas')

    const resize = (): void => {
        canvas.width = window.innerWidth * window.devicePixelRatio
        canvas.height = window.innerHeight * window.devicePixelRatio
    }
    resize()
    window.addEventListener('resize', resize)

    return canvas
}

export {
    getFullscreenCanvas
}
