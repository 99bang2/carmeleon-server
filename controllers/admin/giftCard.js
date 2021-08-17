'use strict'
const models = require('../../models')
const response = require('../../libs/response')
const moment = require('moment')
exports.list = async function (ctx) {
	let giftCards = await models.giftCard.findAll({
		include:[{
			model: models.user,
		}],
		where: {
			accountUid: ctx.account.uid
		}
	})
	response.send(ctx, giftCards)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let giftCard = await models.giftCard.findByPk(uid)
	let _ = ctx.request.body
	_.givenAt = moment().format('YYYY-MM-DD HH:mm:ss')
	Object.assign(giftCard, _)
	await giftCard.save()
	response.send(ctx, giftCard)
}
