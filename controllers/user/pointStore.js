const models = require('../../models')
const response = require('../../libs/response')
const pointLib = require('../../libs/point')
const pointCodes = require('../../configs/pointCodes')
const gameFee = 50

exports.getInfo = async function (ctx) {
	let gamePointList = await models.pointGame.findAll({
		order: [['point', 'desc']]
	})
	let maxGamePoint = gamePointList.length > 0 ? gamePointList[0].point : 20000
	let grateProducts = await models.pointProduct.findAll({
		where: {
			isActive: true,
			productType: 0
		},
		order: [['createdAt', 'desc']]
	})
	let goodProducts = await models.pointProduct.findAll({
		where: {
			isActive: true,
			productType: 1
		},
		order: [['createdAt', 'desc']]
	})
    response.send(ctx, {
		maxGamePoint,
		grateProducts,
		goodProducts
	})
}

exports.exchange = async function (ctx) {
    let _ = ctx.request.body
	let pointProductUid = _.uid
	let name = _.name
	let phone = _.phone
	if(!name || !phone) {
		response.customError(ctx, '수령자 정보를 입력해주세요.')
	}
	let pointProduct = await models.pointProduct.findByPk(pointProductUid)
	if(pointProduct.isSoldOut) {
		response.customError(ctx, '매진된 상품입니다.')
	}
	let user = await models.user.findByPk(ctx.user.uid)
	if(user.point < pointProduct.price) {
		response.customError(ctx, '포인트가 부족합니다.')
	}
	let pointOrder = await models.pointOrder.create({
		userUid: user.uid,
		pointProductUid: pointProductUid,
		name: name,
		phone: phone,
		category: pointProduct.category,
		title: pointProduct.title,
		price: pointProduct.price,
		status: 'WAIT'
	})
	await pointLib.updatePoint(user.uid, pointCodes.POINT_PRODUCT_PURCHASE, pointProduct.price)
    response.send(ctx, pointOrder)
}

exports.getGameInfo = async function (ctx) {
	let userPoint = 0
	let pointStoreUid = 3
	if(ctx.user) {
		let user = await models.user.findByPk(ctx.user.uid)
		userPoint = user.point
	}
	response.send(ctx, {
		userPoint,
		pointStoreUid
	})
}

exports.play = async function (ctx) {
	let user = await models.user.findByPk(ctx.user.uid)
	if(user.point < gameFee) {
		response.customError(ctx, '포인트가 부족합니다.')
	}
	let minNum = 1
	let maxNum = await models.pointGame.sum('probability')
	let ranNum = Math.floor(Math.random()*(maxNum - minNum + 1)) + minNum;
	let pointGames = await models.pointGame.findAll({
		order: [['probability', 'desc']]
	})
	let index = 0
	while(ranNum > 0) {
		let probability = pointGames[index].probability
		ranNum = ranNum - probability
		if(ranNum > 0) {
			index ++
		}
	}
	let rewardPoint = pointGames[index].point
	await pointLib.updatePoint(user.uid, pointCodes.POINT_GAME_PLAY, gameFee)
	await pointLib.updatePoint(user.uid, pointCodes.POINT_GAME_REWARD, rewardPoint)
	response.send(ctx, rewardPoint)
}


