const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let coupon = await models.coupon.create(_)
	response.send(ctx, coupon)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let coupons = await models.coupon.search(_, models)
	response.send(ctx, coupons)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let coupon = await models.coupon.getByUid(ctx, uid)
	response.send(ctx, coupon)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let coupon = await models.coupon.getByUid(ctx, uid)
	let _ = ctx.request.body
	Object.assign(coupon, _)
	await coupon.save()
	response.send(ctx, coupon)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let coupon = await models.coupon.getByUid(ctx, uid)
	await coupon.destroy()
	response.send(ctx, coupon)
}
