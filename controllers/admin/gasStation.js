'use strict'

const models        = require('../../models')
const response      = require('../../libs/response')
const converter     = require('../../libs/imageConvert')
const naverConfig   = require('../../configs/objectStorage.json')

exports.create = async function (ctx) {
    let _           = ctx.request.body
    _.picture       = await converter(_.picture, naverConfig.prefix_gas)
    let gasStation  = await models.gasStation.create(_)
    response.send(ctx, gasStation)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let gasStation = await models.gasStation.search(_, models)
	response.send(ctx, gasStation)
}

exports.read = async function (ctx) {
    let {uid} = ctx.params
	let _ = ctx.request.query
    let gasStation = await models.gasStation.findByPk(uid)
    response.send(ctx, gasStation)
}

exports.update = async function (ctx) {
    let {uid}       = ctx.params
    let _           = ctx.request.body
    let gasStation  = await models.gasStation.findByPk(uid)
    _.picture       = await converter(_.picture, naverConfig.prefix_gas)
    Object.assign(gasStation, _)
    await gasStation.save()
    response.send(ctx, gasStation)
}

exports.delete = async function (ctx) {
    let {uid} = ctx.params
	let _ = ctx.request.query
    let gasStation = await models.gasStation.findByPk(uid)
    await gasStation.destroy()
    response.send(ctx, gasStation)
}

exports.bulkDelete = async function (ctx) {
    let _ = ctx.request.body
    let deleteResult = await models.gasStation.destroy({
        where: {
            uid: _.uids
        }
    })
    response.send(ctx, deleteResult)
}