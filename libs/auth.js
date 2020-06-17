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

//login
exports.login = async function (ctx) {
	let _ = ctx.request.body
	let account = await models.account.getById(ctx, _.id)
	if (!account) {
		ctx.throw({
			code: 400,
			message: '가입하지 않은 아이디이거나, 잘못된 비밀번호입니다.'
		})
	}
	let verifyPassword = await account.verifyPassword(_.password)
	if (!verifyPassword) {
		ctx.throw({
			code: 400,
			message: '가입하지 않은 아이디이거나, 잘못된 비밀번호입니다.'
		})
	}
	const accessToken = jwt.sign(
		{
			uid: account.uid,
			id: account.id,
			grade: account.grade,
			name: account.name,
		},
		secret
	)

}

//logout
exports.logout = async function (ctx) {
	response.send(ctx, {})
}