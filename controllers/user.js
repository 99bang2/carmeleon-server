const models = require('../models')
const response = require('../libs/response')
const jwt = require('jsonwebtoken')
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]
const secret = config.secretKey

exports.create = async function (ctx) {
    let _ = ctx.request.body
    let user = await models.user.create(_)
    response.send(ctx, user)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let users = await models.user.search(_, models)
    response.send(ctx, users)
}

exports.read = async function (ctx) {
    let {uid} = ctx.params
    let user = await models.user.getByUid(ctx, uid)
    response.send(ctx, user)
}

exports.update = async function (ctx) {
    let {uid} = ctx.params
    let user = await models.user.getByUid(ctx, uid)
    let _ = ctx.request.body
    Object.assign(user, _)
    await user.save()
	const accessToken = jwt.sign(
		{
			uid: user.uid,
			snsType: user.snsType,
			name: user.name,
			nickname: user.nickname,
			email: user.email,
			phone: user.phone,
			profileImage: user.profileImage,
			navigationType: user.navigationType,
			token: user.token,
			marketing : user.marketing
		},
		secret
	)
	let data = {
    	user: user,
		token: accessToken
	}
    response.send(ctx, data)
}

exports.delete = async function (ctx) {
    let {uid} = ctx.params
    let user = await models.user.getByUid(ctx, uid)
    await user.destroy()
    response.send(ctx, user)
}

exports.login = async function (ctx) {
	let _ = ctx.request.body
	if (!_.user) {
		ctx.throw({
			code: 400,
			message: '잘못된 로그인 요청입니다.'
		})
	}
	let snsType = _.user.snsType
	let id = [snsType, _.user.id].join('-')
	let user = await models.user.getById(ctx, id)
	if(!user) {
		user = await models.user.create({
			id: id,
			snsType: snsType,
			name: _.user.name,
			nickname: _.user.nickname,
			email: _.user.email,
			phone: _.user.phone,
			profileImage: _.user.profileImage,
			token: _.user.token,
			push: true,
			marketing: _.user.marketing
		})
	}else{
		user.marketing = _.user.marketing
		user.token = _.user.token
		await user.save()
	}
	const accessToken = jwt.sign(
		{
			uid: user.uid,
			snsType: user.snsType,
			name: user.name,
			nickname: user.nickname,
			email: user.email,
			phone: user.phone,
			profileImage: user.profileImage,
			navigationType: user.navigationType,
			token: user.token,
			marketing: user.marketing
		},
		secret
	)
	response.send(ctx, {
		token: accessToken
	})
}

exports.check = async function (ctx) {
	response.send(ctx, {
		user: ctx.user
	})
}

exports.logout = async function (ctx) {
	response.send(ctx, {})
}

exports.checkUniqueId = async function (ctx) {
	let {id} = ctx.params
	let user = await models.user.findOne({
		attributes: ['uid', 'id'],
		where: {
			id: id
		},
		paranoid: false
	})
	if (user) {
		ctx.throw({
			code: 400,
			message: '이미 존재 하는 아이디 입니다.'
		})
	}
	let result = !user
	response.send(ctx, result)
}

exports.bulkDelete = async function (ctx) {
	let _ = ctx.request.body
	let deleteResult = await models.user.destroy({
		where: {
			uid: _.uids
		}
	})
	response.send(ctx, deleteResult)
}

exports.getBadge = async function (ctx) {
	let {uid} = ctx.params
	let user = await models.user.getBadge(ctx, uid)
	response.send(ctx, user)
}
