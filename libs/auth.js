'use strict'
const models = require('../models')
const response = require('../libs/response')
const consola = require('consola')
const jwt = require('jsonwebtoken')
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]
const secret = config.secretKey

exports.getAccount = async (ctx) => {
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

exports.isAdminLoggedIn = async (ctx, next) => {
	if(!ctx.account){
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
