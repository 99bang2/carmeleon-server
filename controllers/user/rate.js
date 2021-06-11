const models = require('../../models')
const jwt = require('../../libs/jwt')
const response = require('../../libs/response')
const pointLib = require('../../libs/point')
const pointCodes = require('../../configs/pointCodes')
const TARGET_MAP = {
	"0": "parkingSite",
	"1": "evChargeStation",
	"2": "gasStation",
	"3": "carWash"
}

exports.create = async function (ctx) {
	let { targetUid, targetType } = ctx.params
	let _ = ctx.request.body
	let target = await models[TARGET_MAP[targetType]].findOne({
		where:{
			uid: targetUid,
			isRate: true
		}
	})
	if(!target) {
		ctx.throw({
			code: 400,
			message: `리뷰를 쓸 수 없는 장소입니다.`
		})
	}
	// 포인트 지급
	let point = await pointLib.updatePoint(ctx.user.uid, _.picture.length > 0 ? pointCodes.REVIEW_IMAGE : pointCodes.REVIEW_TEXT)
	let rate = await models.rating.create({
		targetType: targetType,
		targetUid: targetUid,
		userUid: ctx.user.uid,
		rate: _.rate,
		reviewContent: _.reviewContent,
		picture: _.picture,
		point: point
	})
	//평점 업데이트
	target.rate = await models.rating.getTargetRateAvg(targetType, targetUid)
	await target.save()

	response.send(ctx, rate)
}
exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let rating = await models.rating.findByPk(uid)
	if(rating.userUid !== ctx.user.uid) {
		response.unauthorized(ctx)
	}
	if(rating.point > 0) {
		await pointLib.updatePoint(ctx.user.uid, pointCodes.REVIEW_DELETE, rating.point)
	}
	let target = await models[TARGET_MAP[rating.targetType]].findOne({
		where:{
			uid: rating.targetUid
		}
	})
	//삭제처리
	await rating.destroy()
	//평점 업데이트
	target.rate = await models.rating.getTargetRateAvg(rating.targetType, rating.targetUid)
	await target.save()
	response.send(ctx, rating)
}

exports.list = async function (ctx) {
	let params = ctx.request.query
	ctx.user = await jwt.getUser(ctx)
	let userUid = ctx.user ? ctx.user.uid : null
	let where = {
		targetType: params.targetType,
		targetUid: params.targetUid,
	}
	let limit = params.page ? 10 : null
	let offset = params.page ? (Number(params.page) - 1) * limit : null
	const tableMap = ['parking_sites','ev_charge_stations','gas_stations','car_washes']
	let targetTable = tableMap[Number(params.targetType)]
	let order = [['createdAt', 'DESC']]
	if(params.order) {
		if (Number(params.order) === 0) {
			order = models.Sequelize.literal(`rate_tip_count desc, createdAt desc`)
		}else if (Number(params.order) === 1) {
			order = [['createdAt', 'DESC']]
		}else if (Number(params.order) === 2) {
			order = [['rate', 'DESC'],['createdAt', 'DESC']]
		}else if (Number(params.order) === 3) {
			order = [['rate', 'ASC'],['createdAt', 'DESC']]
		}
	}
	let result = await models.rating.findAll({
		attributes: {
			include: [
				[models.Sequelize.literal(`(SELECT COUNT(uid) FROM rate_tips WHERE rate_uid= rating.uid AND rate_tip = true AND deleted_at IS NULL)`), 'rate_tip_count'],
				[models.Sequelize.literal(`(SELECT COUNT(uid) FROM rate_tips WHERE user_uid=` + userUid + ` AND rate_uid = rating.uid AND rate_tip = true AND deleted_at IS NULL)`), 'user_tip_check'],
			]
		},
		include: [
			{
				model: models.user,
				attributes: ['name', 'nickname', 'email', 'profile_image']
			}
		],
		offset: offset,
		limit: limit,
		where: where,
		order: order
	})
	// 필요 정보 //
	let count = await models.rating.findAll({
		attributes: [
			[models.Sequelize.literal(`COUNT(CASE WHEN rate = 1 OR rate = 2  AND deleted_at IS NULL THEN 0 END)`), 'rate_1'],
			[models.Sequelize.literal(`COUNT(CASE WHEN rate = 3 OR rate = 4  AND deleted_at IS NULL THEN 0 END)`), 'rate_2'],
			[models.Sequelize.literal(`COUNT(CASE WHEN rate = 5 OR rate = 6  AND deleted_at IS NULL THEN 0 END)`), 'rate_3'],
			[models.Sequelize.literal(`COUNT(CASE WHEN rate = 7 OR rate = 8  AND deleted_at IS NULL THEN 0 END)`), 'rate_4'],
			[models.Sequelize.literal(`COUNT(CASE WHEN rate = 9 OR rate = 10  AND deleted_at IS NULL THEN 0 END)`), 'rate_5'],
			[models.Sequelize.literal(`COUNT(*)`), 'count'],
			[`(SELECT rate FROM ` + targetTable + ` WHERE uid=` + params.targetUid + ')', 'avg_rate']
		],
		where: where
	})
	response.send(ctx, {
		rows: result,
		count: count
	})
}

exports.userOwnList = async function (ctx) {
	let order = [['createdAt', 'DESC']]
	let ratings = await models.rating.findAll({
		attributes: {
			include: [[models.Sequelize.literal(`(SELECT COUNT(uid) FROM rate_tips WHERE rate_uid= rating.uid AND rate_tip = true)`), 'rate_tip_count']]
		},
		include: [{
			as: 'parkingSite',
			model: models.parkingSite,
			attributes: ['uid', 'name', 'address']
		}, {
			as: 'gasStation',
			model: models.gasStation,
			attributes: ['uid', 'gasStationName', 'address']
		}, {
			as: 'carWash',
			model: models.carWash,
			attributes: ['uid', 'carWashName', 'address']
		}, {
			as: 'evChargeStation',
			model: models.evChargeStation,
			attributes: ['uid', 'statNm', 'addr']
		}],
		order: order,
		where: {userUid: ctx.user.uid}
	})
	for(let index in ratings) {
		let rating = ratings[index]
		let place = getRatingPlaceInfo(rating)
		if(place) {
			rating.dataValues.place = place
			delete rating.dataValues.parkingSite
			delete rating.dataValues.gasStation
			delete rating.dataValues.carWash
			delete rating.dataValues.evChargeStation
		}else {
			ratings.splice(index, 1)
		}
	}
	response.send(ctx, ratings)
}


function getRatingPlaceInfo(rating){
	switch (rating.targetType) {
		case 0:
			return rating.parkingSite ? {
				uid: rating.parkingSite.uid,
				name: rating.parkingSite.name,
				address: rating.parkingSite.address,
			} : null
		case 1:
			return rating.evChargeStation ? {
				uid: rating.evChargeStation.uid,
				name: rating.evChargeStation.statNm,
				address: rating.evChargeStation.addr,
			} : null
		case 2:
			return rating.gasStation ? {
				uid: rating.gasStation.uid,
				name: rating.gasStation.gasStationName,
				address: rating.gasStation.address,
			} : null
		case 3:
			return rating.carWash ? {
				uid: rating.carWash.uid,
				name: rating.carWash.carWashName,
				address: rating.carWash.address,
			} : null
		default: return null
	}
}

exports.toggleRateTip = async function (ctx) {
	let _ = ctx.request.body
	let checkSelf = await models.rating.count({
		where:{
			userUid: ctx.user.uid,
			uid: _.rateUid
		}
	})
	if(checkSelf > 0){
		ctx.throw({
			code: 400,
			message: '자신의 글은 추천할 수 없습니다.'
		})
	}
	let rateTip = await models.rateTip.findOne({
		where:{
			userUid: ctx.user.uid,
			rateUid: _.rateUid
		}
	})
	if(rateTip) {
		rateTip.rateTip = !rateTip.rateTip
		await rateTip.save()
	}else {
		rateTip = await models.rateTip.create({
			userUid: ctx.user.uid,
			rateUid: _.rateUid,
			rateTip: true
		})
	}
	response.send(ctx, rateTip)
}
