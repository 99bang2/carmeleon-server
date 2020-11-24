'use strict'
const models = require('../models')
const response = require('../libs/response')
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]
const imageUpload = require('../libs/imageUpload')
const axios = require('axios')
const codes = require('../configs/codes.json')
const availableTargetTypes = ["0", "1", "2", "3"]
const Sequelize = require('sequelize')
const moment = require('moment')

exports.fileUpload = async function (ctx) {
	let _ = ctx.request.body
	let folder = _.dir + '/'
	let dir = './uploads/' + folder
	let file = ctx.request.files.file
	let filePath = imageUpload.imageUpload(ctx, file, dir, folder)
	response.send(ctx, filePath)
}

exports.searchList = async function (ctx) {
	let _ = ctx.request.body
	let res = await axios.get('https://openapi.naver.com/v1/search/local.json?query=' + encodeURI(_.keyword) + '&display=' + _.count, {
		headers: {
			'X-Naver-Client-Id': config.naverClientID,
			'X-Naver-Client-Secret': config.naverClientKey
		}
	})
	response.send(ctx, res.data)
}

exports.searchLocal = async function (ctx) {
	let _ = ctx.request.body
	let res = await axios.get('https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=' + encodeURI(_.address), {
		headers: {
			'X-NCP-APIGW-API-KEY-ID': config.naverApiID,
			'X-NCP-APIGW-API-KEY': config.naverApiKey
		}
	})
	response.send(ctx, res.data)
}

exports.avgRate = async function (ctx, targetType, targetUid) {
	let res = await models.rating.avgRate(targetType, targetUid)
	let ratingAvg = JSON.parse(JSON.stringify(res))[0].ratingAvg
	if (!ratingAvg) {
		ratingAvg = 0
	}
	switch (targetType) {
		case '0' :
			let parkingSite = await models.parkingSite.getByUid(ctx, targetUid, null, models)
			Object.assign(parkingSite, {rate: ratingAvg})
			await parkingSite.save()
			break
		case '1' :
			let evChargeStation = await models.evChargeStation.getByUid(ctx, targetUid)
			Object.assign(evChargeStation, {rate: ratingAvg})
			await evChargeStation.save()
			break
		case '2' :
			let gasStation = await models.gasStation.getByUid(ctx, targetUid)
			Object.assign(gasStation, {rate: ratingAvg})
			await gasStation.save()
			break
		case '3' :
			let carWash = await models.carWash.getByUid(ctx, targetUid)
			Object.assign(carWash, {rate: ratingAvg})
			await carWash.save()
			break
	}
	return true
}

exports.codes = function (ctx) {
	response.send(ctx, codes)
}

exports.isAvailableTarget = async (ctx, next) => {
	let {targetType} = ctx.params
	if (availableTargetTypes.indexOf(targetType) < 0) {
		ctx.throw({
			code: 400,
			message: '잘못된 요청입니다.'
		})
	}
	await next()
}

exports.checkRateAvailable = async function (uid) {
	// UID = PayLogUid //
	let rateCheck = await models.payLog.findOne({
		attributes: ['rate_uid'],
		where: {uid: uid},
		raw: true
	})
	return rateCheck.rate_uid === null;
}

exports.pushMessage = async function (data) {
	let push = await models.push.create(data)
	return push
}


exports.updatePoint = async function (userUid, pointCode, point = 0) {
	let user = await models.user.findByPk(userUid)
	point = point > 0 ? point : pointCode.amount

	// 리뷰 중복 체크
	if(pointCode.id === 2000 || pointCode.id === 2100){
		let checkPointCount = await models.pointLog.count({
			where: {
				userUid: userUid,
				codeId: pointCode.id,
				createdAt: {
					[Sequelize.Op.gte]: moment().format('YYYY-MM-DD')
				}
			}
		})
		if(checkPointCount >= 5){
			point = 0
		}
	}

	if(point > 0) {
		await models.pointLog.create({
			userUid: userUid,
			point: pointCode.isPlus ? point : (point * -1),
			codeId: pointCode.id,
			reason: pointCode.reason
		})
		user.point = pointCode.isPlus ? user.point + point : user.point - point
		await user.save()
	}

	return point
s}
