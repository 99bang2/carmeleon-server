'use strict'
const response = require('../libs/response')
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
