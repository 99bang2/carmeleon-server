'use strict'
const remoteModals = require('./remoteModel')
const models = require('../../models')
start()
async function start() {
    let crawlingParkings = await remoteModals.parkingSite.findAll()
    let bulkData = []
    for(let parking of crawlingParkings) {
        delete parking.dataValues.uid
        bulkData.push(parking.dataValues)
    }
    await models.parkingSite.bulkCreate(bulkData)
    process.exit()
}