const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let card = await models.card.create(_)
	response.send(ctx, card)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let cards = await models.card.search(_, models)
	response.send(ctx, cards)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let card = await models.card.getByUid(ctx, uid)
	response.send(ctx, card)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let card = await models.card.getByUid(ctx, uid)
	let _ = ctx.request.body
	Object.assign(card, _)
	await card.save()
	response.send(ctx, card)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let card = await models.card.getByUid(ctx, uid)
	await card.destroy()
	response.send(ctx, card)
}

exports.userList = async function (ctx) {
	let {userUid} = ctx.params
	let card = await models.card.getByUserUid(ctx, userUid)
	response.send(ctx, card)
}

exports.cardList = async function (ctx) {
	let {userUid} = ctx.params
	let _ = ctx.request.query
	_.userUid = userUid
	let cards = await models.card.search(_, models)
	response.send(ctx, cards)
}

exports.isMain = async function (ctx) {
	let _ = ctx.request.query
	await models.card.update(
		{ isMain: false },
		{ where: { userUid: _.userUid }}
	);
	let card = await models.card.update(
		{ isMain: true },
		{ where: { uid: _.uid }}
	);
	response.send(ctx, card)
}
