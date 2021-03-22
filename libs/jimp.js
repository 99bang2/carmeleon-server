'use strict'

const Jimp = require('jimp')
const sharp = require('./sharp')

const waterMark = './images/watermark.svg'

module.exports = {
    async addWaterMark(url) {
        let buffer = await sharp.svgToBuffer(waterMark)

        const [image, logo] = await Promise.all([
            await Jimp.read(url),
            await Jimp.read(buffer)
        ])

        logo.resize(Math.floor(image.bitmap.width * 0.546), Jimp.AUTO)

        const X = (image.bitmap.width - logo.bitmap.width) / 2
        const Y = (image.bitmap.height - logo.bitmap.height) / 2

        return image.composite(logo, X, Y, [
            {
                mode: Jimp.BLEND_SCREEN,
                opacitySource: 0.5,
                opacityDest: 1
            }
        ])
    }
}
