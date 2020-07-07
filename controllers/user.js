const models = require('../models')
const response = require('../libs/response')

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
    response.send(ctx, user)
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
		})
	}
	const accessToken = jwt.sign(
		user.dataValues,
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
