'use strict'
const response = require('../libs/response')
const passport = require('../libs/passport')
exports.isAdminLoggedIn = async (ctx, next) => {
	let account = await passport.getAccount(ctx)
	if(!account){
		response.unauthorized(ctx)
	}else {
		ctx.account = account
	}
	await next()
}
exports.isUserLoggedIn = async (ctx, next) => {
	let user = await passport.getUser(ctx)
	if(!user) {
		response.unauthorized(ctx)
	}else {
		ctx.user = user
	}
	await next()
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
