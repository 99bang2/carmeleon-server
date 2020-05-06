'use strict'
const redis = require('redis')
const bluebird = require('bluebird')
const fs = require('fs')
const path = require('path')
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
const config = require(__dirname + '/../configs/config.json')[env]['redis']
const redisModels = {}

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
const redisConn = redis.createClient(config.port, config.host);

fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
    })
    .forEach(async file => {
        let RedisModel = require(path.join(__dirname, file))
        let model = new RedisModel(redisConn)
        redisModels[model.name] = model
    })

redisModels.redisConn = redisConn
module.exports = redisModels
