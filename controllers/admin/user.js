const models = require('../../models')
const response = require('../../libs/response')
const jwt = require('jsonwebtoken')
const env = process.env.NODE_ENV || 'development'
const config = require('../../configs/config.json')[env]
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
	if(user.uid !== ctx.user.uid) {
		response.unauthorized(ctx)
	}
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

exports.bulkDelete = async function (ctx) {
	let _ = ctx.request.body
	let deleteResult = await models.user.destroy({
		where: {
			uid: _.uids
		}
	})
	response.send(ctx, deleteResult)
}

exports.carList = async function (ctx) {
	let {userUid} = ctx.params
	let car = await models.car.getByUserUid(ctx, userUid)
	response.send(ctx, car)
}

exports.cardList = async function (ctx) {
	let {userUid} = ctx.params
	let card = await models.card.getByUserUid(ctx, userUid)
	response.send(ctx, card)
}
