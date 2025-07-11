'use strict'

const env               = process.env.NODE_ENV || 'development'
const axios             = require('axios')
const models            = require('../../models')
const response          = require('../../libs/response')
const converter         = require('../../libs/imageConvert')
const config            = require('../../configs/config.json')[env]
const naverConfig       = require('../../configs/objectStorage.json')

const carWashBookingAPI = config.carWashBookingAPI

exports.create = async function (ctx) {
    let _       = ctx.request.body
    _.picture   = await converter(_.picture, naverConfig.prefix_car_wash)
    let carWash = await models.carWash.create(_)
    response.send(ctx, carWash)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let carWash = await models.carWash.search(_, models)
	response.send(ctx, carWash)
}

exports.read = async function (ctx) {
    let {uid} = ctx.params
	let _ = ctx.request.query
    let carWash = await models.carWash.findByPk(uid)
    response.send(ctx, carWash)
}

exports.update = async function (ctx) {
    let {uid}   = ctx.params
	let _       = ctx.request.body
    let carWash = await models.carWash.findByPk(uid)
    _.picture   = await converter(_.picture, naverConfig.prefix_car_wash)
    Object.assign(carWash, _)
    await carWash.save()
    response.send(ctx, carWash)
}

exports.delete = async function (ctx) {
    let {uid} = ctx.params
	let _ = ctx.request.query
    let carWash = await models.carWash.findByPk(uid)
    await carWash.destroy()
    response.send(ctx, carWash)
}

exports.bulkDelete = async function (ctx) {
    let _ = ctx.request.body
    let deleteResult = await models.carWash.destroy({
        where: {
            uid: _.uids
        }
    })
    response.send(ctx, deleteResult)
}
exports.getBookings = async function (ctx) {
    let _ = ctx.request.query
    let res = await axios.get(carWashBookingAPI + `/api/carmeleon/bookings`, {
        params: {
            ..._
        }
    })
    response.send(ctx, res.data.data)
}

exports.getBooking = async function (ctx) {
    let { uid } = ctx.params
    let res = await axios.get(carWashBookingAPI + `/api/carmeleon/bookings/${uid}`)
    response.send(ctx, res.data.data)
}

exports.putBooking = async function (ctx) {
    let { uid } = ctx.params
    let _ = ctx.request.body
    let res = await axios.put(carWashBookingAPI + `/api/carmeleon/bookings/${uid}`, _)
    response.send(ctx, res.data.data)
}
