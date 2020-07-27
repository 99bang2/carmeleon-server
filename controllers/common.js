'use strict'
const models = require('../models')
const response = require('../libs/response')
const jwt = require('jsonwebtoken')
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]
const imageUpload = require('../libs/imageUpload')
const axios = require('axios')
const codes = require('../configs/codes.json')
const availableTargetTypes = ["0", "1", "2"]

exports.fileUpload = async function (ctx){
	let _ = ctx.request.body
	let folder = _.dir+'/'
	let dir = './uploads/'+folder
	let file = ctx.request.files.file
	let filePath = imageUpload.imageUpload(ctx, file, dir, folder)
	response.send(ctx, filePath)
}

exports.searchList = async function (ctx){
	let _ = ctx.request.body
	let res = await axios.get('https://openapi.naver.com/v1/search/local.json?query='+encodeURI(_.keyword)+'&display='+_.count, {
		headers: {
			'X-Naver-Client-Id': config.naverClientID,
			'X-Naver-Client-Secret': config.naverClientKey
		}
	})
	response.send(ctx, res.data)
}

exports.searchLocal = async function (ctx){
	let _ = ctx.request.body
	let res = await axios.get('https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query='+encodeURI(_.address), {
		headers: {
			'X-NCP-APIGW-API-KEY-ID': config.naverApiID,
			'X-NCP-APIGW-API-KEY': config.naverApiKey
		}
	})
	response.send(ctx, res.data)
}

exports.avgRate = async function (ctx, targetType, targetUid){
	let res = await models.rating.avgRate(tagetType, targeUid)
	let ratingAvg = JSON.parse(JSON.stringify(res))[0].ratingAvg
	if(!ratingAvg){
		ratingAvg = 0
	}
	switch (targetType) {
		case 0 :
			let parkingSite = await models.parkingSite.getByUid(ctx, targetUid)
			Object.assign(parkingSite, {rate: ratingAvg})
			await parkingSite.save()
		break;
		case 1 :
			let gasStation = await models.gasStation.getByUid(ctx, targetUid)
			Object.assign(gasStation, {rate: ratingAvg})
			await gasStation.save()
		break;
		case 2 :
			let carWash = await models.carWash.getByUid(ctx, targetUid)
			Object.assign(carWash, {rate: ratingAvg})
			await carWash.save()
		break;
	}
	return true
}

exports.codes = function (ctx){
	response.send(ctx, codes)
}


exports.isAvailableTarget = async (ctx, next) => {
	let { targetType } = ctx.params
	if(availableTargetTypes.indexOf(targetType) < 0) {
		ctx.throw({
			code: 400,
			message: '잘못된 요청입니다.'
		})
	}
	await next()
}
