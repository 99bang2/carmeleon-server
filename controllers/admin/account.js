'use strict'
const models = require('../../models')
const response = require('../../libs/response')
const passport = require('../../libs/passport')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let account = await models.account.create(_)
	response.send(ctx, account)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let accounts = await models.account.search(_, models)
	response.send(ctx, accounts)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let account = await models.account.getByUid(ctx, uid)
	response.send(ctx, account)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let account = await models.account.getByUid(ctx, uid)
	let _ = ctx.request.body
	Object.assign(account, _)
	await account.save()
	response.send(ctx, account)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let account = await models.account.getByUid(ctx, uid)
	await account.destroy()
	response.send(ctx, account)
}

exports.bulkDelete = async function (ctx) {
	let _ = ctx.request.body
	let deleteResult = await models.account.destroy({
		where: {
			uid: _.uids
		}
	})
	response.send(ctx, deleteResult)
}

exports.changePassword = async function (ctx) {
	let account = await models.account.getById(ctx.account.id, models)
	let _ = ctx.request.body
	let verifyPassword = await account.verifyPassword(_.oldPassword)
	if (!verifyPassword) {
		ctx.throw({
			code: 400,
			message: '기존 비밀번호가 일치하지 않습니다.'
		})
	}
	account.password = _.newPassword
	await account.save()
	response.send(ctx, account)
}

exports.login = async function (ctx) {
	let _ = ctx.request.body
	let account = await models.account.getById(_.id, models)
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
	const accessToken = await passport.generateAdminAccessToken(account)
	response.send(ctx, {
		token: accessToken
	})
}

exports.check = async function (ctx) {
	response.send(ctx, {
		account: ctx.account
	})
}
exports.logout = async function (ctx) {
	response.send(ctx, {})
}

exports.checkUniqueId = async function (ctx) {
	let {id} = ctx.params
	let account = await models.account.findOne({
		attributes: ['uid', 'id'],
		where: {
			id: id
		},
		paranoid: false
	})
	if (account) {
		ctx.throw({
			code: 400,
			message: '이미 존재 하는 아이디 입니다.'
		})
	}
	let result = !account
	response.send(ctx, result)
}
