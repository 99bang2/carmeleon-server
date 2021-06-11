'use strict'
const consola = require('consola')
const jwt = require('jsonwebtoken')
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]
const secret = config.secretKey

exports.getAccount = async (ctx) => {
	if (ctx.request.headers.authorization && ctx.request.headers.authorization.split(' ')[0] === 'Bearer') {
		try{
			let accessToken = ctx.request.headers.authorization.split(' ')[1]
			let accountData = await jwt.verify(accessToken, secret)
			if(accountData.auth === 'admin') {
				return accountData
			}else {
				return null
			}
		}catch (e) {
			return null
		}
	} else {
		return null
	}
}
exports.getUser = async (ctx) => {
	const models = require('../models')
	if (ctx.request.headers.authorization && ctx.request.headers.authorization.split(' ')[0] === 'Bearer') {
		try{
			let accessToken = ctx.request.headers.authorization.split(' ')[1]
			let userData = await jwt.verify(accessToken, secret, {
				maxAge: '1 days'
			})
			consola.info(userData)
			if(userData.uuid) {
				userData = await models.user.getByUUID(userData.uuid)
			}else {
				userData = await models.user.getByUid(ctx, userData.uid)
			}
			return userData
		}catch (e) {
			consola.info(e)
			/*if(e.name === 'TokenExpiredError') {
				response.tokenExpired(ctx)
			}else {
				response.unauthorized(ctx)
			}*/
			return null
		}
	} else {
		return null
	}
}
