'use strict'
const models = require('../models')
const response = require('../libs/response')
const jwt = require('jsonwebtoken')
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]
const secret = config.secretKey
const imageUpload = require('../libs/imageUpload')
const axios = require('axios')

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
	let res = await axios.get('https://openapi.naver.com/v1/search/local.json?query='+encodeURI(_.address), {
		headers: {
			'X-Naver-Client-Id': 'L0ZTwcsuymagjibioLdb',
			'X-Naver-Client-Secret': 'ThBIVBiils'
		}
	})
	console.log(res)
	response.send(ctx, res.data)
}

exports.searchLocal = async function (ctx){
	let _ = ctx.request.body
	let res = await axios.get('https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query='+encodeURI(_.address), {
		headers: {
			'X-NCP-APIGW-API-KEY-ID': '747rpqhmlc',
			'X-NCP-APIGW-API-KEY': 'NzinJwV0bbybo5msvo4kLLjeZYbpz7XLOFa67k3r'
		}
	})
	response.send(ctx, res.data)
}
