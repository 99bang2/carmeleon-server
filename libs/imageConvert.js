'use strict'
const Request       = require('request-promise')
const objectStorage = require('./naverStorage')
const sharp         = require('./sharp')
const jimp          = require('./jimp')
const fs            = require('fs')
const config        = require('../configs/objectStorage.json')
const jo = require("jpeg-autorotate");
const Jimp = require("jimp");

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
    let list = []

    while (images.length) {
        let url = images.pop()
        if (await checkUrl(url)) {
            let image;
            if(url.includes('_watermarked')){
                image = url
            }else {
                let name = getName(url).replace('.','_watermarked.')
                let width = await sharp.getUrlImageWidth(url)

                if (width > sharp.WIDTH) {
                    let resize = await sharp.resizeUrlImageToFilestream(url)
                    await objectStorage.uploadStream(resize, name, prefix)
                }

                let local_watermark_path = './images/watermarked.jpg'
                let watermarkedImage = await jimp.addWaterMark(url)

                await watermarkedImage.writeAsync(local_watermark_path)

                /////////////////////////// jpeg-autorotate///////////////////////////////
                await jo.rotate(local_watermark_path)
                    .then(async ({orientation}) => {
                        if(orientation !== null && orientation === 6) {
                            let image = await Jimp.read(local_watermark_path)
                            await image.rotate(180).writeAsync(local_watermark_path)
                        }
                    }).catch((error) => {
                        if(error.code === jo.errors.correct_orientation) {
                            console.log('The orientation of this image is already correct!')
                        }
                    })
                //////////////////////////////////////////////////////////////////////////

                await objectStorage.uploadStream(fs.createReadStream(local_watermark_path), name, prefix)

                image = config.url + '/' + config.bucket_name + '/watermark/' + prefix + '/' + name
            }
            list.push(image)
        }
    }

    return list
}
