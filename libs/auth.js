'use strict'
const models = require('../models')
const response = require('../libs/response')
const consola = require('consola')
const jwt = require('jsonwebtoken')
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]
const secret = config.secretKey

exports.getAdmin = async (ctx) => {
	if (ctx.request.headers.authorization && ctx.request.headers.authorization.split(' ')[0] === 'Bearer') {
		try{
			let accessToken = ctx.request.headers.authorization.split(' ')[1]
			let adminData = await jwt.verify(accessToken, secret)
			return adminData
		}catch (e) {
			consola.error(e)
			response.unauthorized(ctx)
		}
	} else {
		return null
	}
}

exports.getUser = async (ctx) => {
	if (ctx.request.headers.ak) {
		let ak = ctx.request.headers.ak
		let user = await models.user.getByAk(ak)
		return user ? {
			uid: user.uid,
			phone: user.phone
		} : null
	} else {
		return null
	}
}

exports.isAdminLoggedIn = async (ctx, next) => {
	if(!ctx.admin){
		response.unauthorized(ctx)
	}
	await next()
}

exports.isUserLoggedIn = async (ctx, next) => {
	if(!ctx.user){
		response.unauthorized(ctx)
	}
	await next()
}
