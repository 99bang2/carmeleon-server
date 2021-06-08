'use strict'
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
			let accountData = await jwt.verify(accessToken, secret)
			if(accountData.auth === 'admin') {
				return accountData
			}else {
				return null
			}
		}catch (e) {
			if(e.name === 'TokenExpiredError') {
				response.tokenExpired(ctx)
			}else {
				response.unauthorized(ctx)
			}
		}
	} else {
		return null
	}
}

exports.getUser = async (ctx) => {
	if (ctx.request.headers.authorization && ctx.request.headers.authorization.split(' ')[0] === 'Bearer') {
		try{
			let accessToken = ctx.request.headers.authorization.split(' ')[1]
			let userData = await jwt.verify(accessToken, secret, {
				maxAge: '1 days'
			})
			consola.info(userData)
			return userData
		}catch (e) {
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

//관리자 or 유저 로그인 체크
exports.isEitherLoggedIn = async (ctx, next) => {
	if(ctx.account || ctx.user){
		await next()
		return false
	}
	response.unauthorized(ctx)
}

exports.onlyAppRequest = async (ctx, next) => {
	let userAgent = ctx.userAgent
	if(userAgent.isDesktop) {
		response.unauthorized(ctx)
	}
	if(userAgent.source.indexOf('com.mobilx.carmeleon') < 0 && userAgent.browser.indexOf('okhttp') < 0) {
		response.unauthorized(ctx)
	}
	await next()
}
