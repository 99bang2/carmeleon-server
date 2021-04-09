'use strict'

const naverConfig   = require('../configs/objectStorage.json')
const AWS           = require('aws-sdk')

const endpoint = new AWS.Endpoint(naverConfig.url)
const S3 = new AWS.S3({
    endpoint,
    ...naverConfig.s3
})

const objectStorageApi = {
    async uploadStream(file, name, prefix) {
        let key = 'watermark/' + prefix + '/' + name
        let param = {
            Bucket: naverConfig.bucket_name,
            Key: key,
            Body: file,
            ACL: 'public-read',
            ContentType: 'jpg',
        }

        return await S3.upload(param).promise()
    }
}

module.exports = objectStorageApi
