'use strict'
const Request = require('request-promise')
const objectStorage = require('./naverStorage')
const sharp = require('./sharp')
const jimp = require('./jimp')
const fs = require('fs')

function getName(url) {
    let split = url.split('/')
    return split.pop()
}

async function checkUrl(url) {
    return await Request.get(url)
        .then(() => {
            return true
        })
        .catch(err => {
            console.log('========================= image is not exist \n', err.statusCode, err.options.uri)
            return false
        })
}

module.exports = async (images, prefix) => {
    while (images.length) {
        let url = images.pop()
        if (await checkUrl(url)) {
            let name = getName(url)
            let width = await sharp.getUrlImageWidth(url)

            if (width > sharp.WIDTH) {
                let resize = await sharp.resizeUrlImageToFilestream(url)
                await objectStorage.uploadStream(resize, name, prefix)
            }

            let local_watermark_path = './images/watermarked.jpg'
            let watermarkedImage = await jimp.addWaterMark(url)

            await watermarkedImage.writeAsync(local_watermark_path)
            await objectStorage.uploadStream(fs.createReadStream(local_watermark_path), name, prefix)
        }
    }
}
