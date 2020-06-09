const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let car = await models.car.create(_)
	response.send(ctx, car)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let cars = await models.car.search(_, models)
	response.send(ctx, cars)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let car = await models.car.getByUid(ctx, uid)
	response.send(ctx, car)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let car = await models.car.getByUid(ctx, uid)
	let _ = ctx.request.body
	Object.assign(car, _)
	await car.save()
	response.send(ctx, car)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let car = await models.car.getByUid(ctx, uid)
	await car.destroy()
	response.send(ctx, car)
}