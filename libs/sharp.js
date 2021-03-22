'use strict'

const Request           = require('request-promise')
const Sharp             = require('sharp')
const ImageSizeStream   = require('image-size-stream')
const WIDTH             = 1280

function streamToBuffer (stream) {
    const chunks = []
    return new Promise((resolve, reject) => {
        stream.on('data', chunk => chunks.push(chunk))
        stream.on('error', reject)
        stream.on('end', () => resolve(Buffer.concat(chunks)))
    })
}

module.exports = {
    WIDTH,
    async resizeUrlImageToFilestream(url) {
        const transformer = Sharp().resize({width: WIDTH})
        return await Request(url).pipe(transformer)
    },
    async getUrlImageWidth(url) {
        return new Promise(async (res, rej) => {
            let sharp = Sharp()
            let imageStream = ImageSizeStream()
                .on('size', (dimensions) => res(dimensions.width))
                .on('error', (err) => rej(err))

            await Request.get(url)
                .pipe(sharp)
                .pipe(imageStream)
        })
    },
    async svgToBuffer(path) {
        return streamToBuffer(await Sharp(path).png())
    }
}
