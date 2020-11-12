const models = require('../models')
const response = require('../libs/response')
const pg = require('../controllers/pg')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let checkCard = await  models.card.checkCard(_)
	if(checkCard > 0){
		ctx.throw({
			code: 400,
			message: '이미 등록 된 카드 입니다.'
		})
	}
	let checkCount = await models.card.count({
		where : {userUid:_.userUid}
	})
	if(checkCount === 0){
		_.isMain = true
	}
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
	let result = await pg.pgBillRemoveNice(card.billKey, card.userUid)
	if(result === true){
		await card.destroy()
		response.send(ctx, card)
	}else{
		ctx.throw({
			code: 400,
			message: '삭제 실패'
		})
	}
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
	let _ = ctx.request.body
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
