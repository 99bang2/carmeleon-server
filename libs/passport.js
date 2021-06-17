'use strict'
const consola = require('consola')
const moment = require('moment')
const jwt = require('jsonwebtoken')
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]
const secret = config.secretKey
const models = require('../models')
const ACCESS_TOKEN_MAX_AGE = 1
const ACCESS_TOKEN_MAX_AGE_UNIT = 'd'
const REFRESH_TOKEN_MAX_AGE = 30
const REFRESH_TOKEN_MAX_AGE_UNIT = 'd'

exports.getAccount = async (ctx) => {
	if (ctx.request.headers.authorization && ctx.request.headers.authorization.split(' ')[0] === 'Bearer') {
		let accessToken = ctx.request.headers.authorization.split(' ')[1]
		return await verifyToken(accessToken)
	} else {
		return null
	}
}

exports.getUser = async (ctx) => {
	if (ctx.request.headers.authorization && ctx.request.headers.authorization.split(' ')[0] === 'Bearer') {
		let accessToken = ctx.request.headers.authorization.split(' ')[1]
		let encoded = await verifyToken(accessToken, {maxAge: ACCESS_TOKEN_MAX_AGE + ACCESS_TOKEN_MAX_AGE_UNIT})
		return await models.user.getByUUID(encoded.uuid)
	} else {
		return null
	}
}

exports.generateAdminAccessToken = async (account) => {
	const accessToken = jwt.sign(
		{
			uid: account.uid,
			id: account.id,
			grade: account.grade,
			name: account.name,
			auth: 'admin'
		},
		secret
	)
	return accessToken
}

exports.generateUserAccessToken = async (user) => {
	const accessToken = jwt.sign(
		{
			uuid: user.uuid,
			snsType: user.snsType,
			nickname: user.nickname,
			profileImage: user.profileImage,
			navigationType: user.navigationType,
		},
		secret
	)
	return accessToken
}

exports.generateUserRefreshToken = async (user) => {
	const refreshToken = jwt.sign({}, secret)
	await models.userRefreshToken.upsert({
		userUuid: user.uuid,
		token: refreshToken
	})
	return refreshToken
}

exports.verifyUserAccessToken = async (ctx, options = {}) => {
	if (ctx.request.headers.authorization && ctx.request.headers.authorization.split(' ')[0] === 'Bearer') {
		let accessToken = ctx.request.headers.authorization.split(' ')[1]
		return await verifyToken(accessToken, options)
	} else {
		return null
	}
}

exports.verifyRefreshToken = async (token, userUuid) => {
	let userRefreshToken = await models.userRefreshToken.findOne({ where: { userUuid }})
	if(userRefreshToken && userRefreshToken.token === token) {
		let decoded = await verifyToken(token, { maxAge: REFRESH_TOKEN_MAX_AGE + REFRESH_TOKEN_MAX_AGE_UNIT })
		let expiredAt = moment.unix(decoded.iat).add(REFRESH_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE_UNIT)
		let remainDays = expiredAt.diff(moment(), 'days')
		return {
			...decoded,
			remainDays
		}
	}else {
		return null
	}
}

async function verifyToken(token, options = {}){
	if(token) {
		try {
			let decoded = await jwt.verify(token, secret, options)
			consola.info(decoded)
			return decoded
		} catch (e) {
			consola.info(e)
			return null
		}
	}else {
		return null
	}
}
