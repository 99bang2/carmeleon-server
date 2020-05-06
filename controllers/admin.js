'use strict'
const models = require('../models')
const response = require('../libs/response')
const consola = require('consola')
const jwt = require('jsonwebtoken')
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]
const secret = config.secretKey

exports.read = async function (ctx) {
	let admin = await models.admin.getByUid(ctx, Number(ctx.admin.uid))
	response.send(ctx, admin)
}

exports.update = async function (ctx) {
	let admin = await models.admin.getByUid(ctx, Number(ctx.admin.uid))
	let _ = ctx.request.body
	Object.assign(admin, _)
	await admin.save()
	response.send(ctx, admin)
}

exports.changePassword = async function (ctx) {
	let admin = await models.admin.getById(ctx.admin.id, models)
	let _ = ctx.request.body
	let verifyPassword = await admin.verifyPassword(_.oldPassword)
	if (!verifyPassword) {
		ctx.throw({
			code: 400,
			message: '기존 비밀번호가 일치하지 않습니다.'
		})
	}
	admin.password = _.newPassword
	await admin.save()
	response.send(ctx, admin)
}

exports.login = async function (ctx) {
	let _ = ctx.request.body
	let admin = await models.admin.getById(_.id, models)
	if (!admin) {
		ctx.throw({
			code: 400,
			message: '가입하지 않은 아이디이거나, 잘못된 비밀번호입니다.'
		})
	}
	let verifyPassword = await admin.verifyPassword(_.password)
	if (!verifyPassword) {
		ctx.throw({
			code: 400,
			message: '가입하지 않은 아이디이거나, 잘못된 비밀번호입니다.'
		})
	}
	const accessToken = jwt.sign(
		{
			uid: admin.uid,
			id: admin.id,
			grade: admin.grade,
			name: admin.name,
			complexUid: admin.complexUid,
			complexName: admin.complex ? admin.complex.name : null
		},
		secret
	)
	response.send(ctx, {
		token: accessToken
	})
}

exports.check = async function (ctx) {
	response.send(ctx, {
		admin: ctx.admin
	})
}

exports.logout = async function (ctx) {
	response.send(ctx, {})
}

exports.checkUniqueId = async function (ctx) {
	let {id} = ctx.params
	let admin = await models.admin.findOne({
		attributes: ['uid', 'id'],
		where: {
			id: id
		},
		paranoid: false
	})
	let result = !admin
	response.send(ctx, result)
}