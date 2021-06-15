'use strict'
const env 			= process.env.NODE_ENV || 'development'
const axios 		= require('axios')
const models 		= require('../models')
const response 		= require('../libs/response')
const config 		= require('../configs/config.json')[env]
const codes 		= require('../configs/codes.json')

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

exports.codes = function (ctx) {
	response.send(ctx, codes)
}

exports.getVersions = async function (ctx) {
	let _ = ctx.request.query
	let os = _.os
	let version = _.version
	if(!os || !version) {
		response.badRequest()
	}
	let currentVersionArray = version.split('.')
	if(currentVersionArray.length !== 3) {
		response.badRequest()
	}

	let result = {
		latestVersion: '0.0.0',
		requireForceUpdate: false
	}

	let appLatestVersionKey = os + '-latest-version'
	let appLatestVersionConfig = await models.config.findOne({
		where: {
			key : appLatestVersionKey
		}
	})
	if(appLatestVersionConfig) {
		result.latestVersion = appLatestVersionConfig.value
	}

	let appMinimumVersionKey = os + '-minimum-version'
	let appMinimumVersionConfig = await models.config.findOne({
		where: {
			key : appMinimumVersionKey
		}
	})

	if(appMinimumVersionConfig) {
		let minimumVersionArray = appLatestVersionConfig.value.split('.')
		let currentMajor = Number(currentVersionArray[0])
		let minimumMajor = Number(minimumVersionArray[0])
		let currentMiddle = Number(currentVersionArray[1])
		let minimumMiddle = Number(minimumVersionArray[1])
		let currentMinor = Number(currentVersionArray[2])
		let minimumMinor = Number(minimumVersionArray[2])
		if(minimumMajor > currentMajor) {
			result.requireForceUpdate = true
		}else {
			if(minimumMiddle > currentMiddle) {
				result.requireForceUpdate = true
			}else {
				if(minimumMinor > currentMinor) {
					result.requireForceUpdate = true
				}
			}
		}
	}
	response.send(ctx, result)
}

exports.ticketActive = async function (ctx) {
	let { macroId, active } = ctx.request.body

	if (!macroId) {
		response.validationError(ctx)
	}

	let parkingSite = await models.parkingSite.findByPk(macroId)

	if (parkingSite.siteType !== 0) {
		response.send(ctx, {
			data: false,
			message: "하이파킹 주차장이 아닙니다."
		})
	} else {
		parkingSite.isBuy = active
		await parkingSite.save()

		response.send(ctx, true)
	}
}

exports.parkingBookingList = async function (ctx) {
	let parkingSites = await models.parkingSite.findAll({
		where: {
			isBuy : true
		}})
	response.send(ctx, parkingSites)
}
