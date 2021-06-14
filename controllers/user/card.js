'use strict'
const models 	= require('../../models')
const response 	= require('../../libs/response')
const nicePay = require('../../libs/nicePay')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let result = await nicePay.pgBillNice(_.data, ctx)
	if(result.success) {
		let count = await models.card.count({ where : { userUid: ctx.user.uid} })
		let card = await models.card.create({
			..._,
			isMain: count === 0
		})
		response.send(ctx, card)
	}else {
		response.badRequest(ctx)
	}
}

exports.list = async function (ctx) {
	let where = { userUid: ctx.user.uid }
	let order = [['isMain', 'DESC']]
	let attributes = ['cardNumber', 'maskingCardNumber', 'cardCode', 'uid', 'userUid', 'isMain']
	let cards = await models.card.findAll({ where, order, attributes })
	for(let card of cards) {
		delete card.userUid
		delete card.cardNumber
	}
	response.send(ctx, cards)
}

exports.updateMain = async function (ctx) {
	let {uid} = ctx.params
	let card = await models.card.getByUid(ctx, uid)
	if(card.userUid !== ctx.user.uid) {
		response.unauthorized(ctx)
	}
	await models.card.update(
		{ isMain: false },
		{ where: { userUid: ctx.user.uid }}
	)
	card.isMain = true
	await card.save()
	let where = { userUid: ctx.user.uid }
	let order = [['isMain', 'DESC']]
	let attributes = ['cardNumber', 'maskingCardNumber', 'cardCode', 'uid', 'userUid', 'isMain']
	let cards = await models.card.findAll({ where, order, attributes })
	for(let card of cards) {
		delete card.userUid
		delete card.cardNumber
	}
	response.send(ctx, cards)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let card = await models.card.getByUid(ctx, uid)
	if(card.userUid !== ctx.user.uid) {
		response.unauthorized(ctx)
	}
	await card.destroy()
	nicePay.pgBillRemoveNice(uid)
	response.send(ctx, card)
}
