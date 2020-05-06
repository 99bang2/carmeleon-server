const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
	if(ctx.admin.grade !== 'SUPER') {
		response.forbidden(ctx)
	}
	let _ = ctx.request.body
	let complex = await models.complex.create(_)
	Object.assign(_.admin, {
		complexUid: complex.uid,
		grade: 'COMPLEX'
	})
	await models.admin.create(_.admin)
	response.send(ctx, complex)
}

exports.list = async function (ctx) {
	if(ctx.admin.grade !== 'SUPER') {
		response.forbidden(ctx)
	}
	let _ = ctx.request.query
	let complexes = await models.complex.search(_, models)
	response.send(ctx, complexes)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	if( ctx.admin.grade !== 'SUPER' && Number(ctx.admin.complexUid) !== Number(uid) ) {
		response.forbidden(ctx)
	}
	let complex = await models.complex.getByUid(ctx, uid, models)
	response.send(ctx, complex)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	if( ctx.admin.grade !== 'SUPER' && Number(ctx.admin.complexUid) !== Number(uid) ) {
		response.forbidden(ctx)
	}
	let _ = ctx.request.body
	let complex = await models.complex.getByUid(ctx, uid, models)
	Object.assign(complex, _)
	await complex.save()
	response.send(ctx, complex)
}

exports.delete = async function (ctx) {
	if(ctx.admin.grade !== 'SUPER') {
		response.forbidden(ctx)
	}
	let {uid} = ctx.params
	let complex = await models.complex.getByUid(ctx, uid, models)
	await complex.destroy()
	response.send(ctx, complex)
}

exports.bulkDelete = async function (ctx) {
	if(ctx.admin.grade !== 'SUPER') {
		response.forbidden(ctx)
	}
	let _ = ctx.request.body
	let deleteResult = await models.complex.destroy({
		where: {
			uid: _.uids
		}
	})
	response.send(ctx, deleteResult)
}

exports.userList = async function (ctx) {
	let _ = ctx.request.query
	if(ctx.admin.grade === 'COMPLEX') {
		_.complexUid = ctx.admin.complexUid
	}
	let users = await models.userComplex.search(_, models)
	response.send(ctx, users)
}

exports.updateUser = async function (ctx) {
	let {uid} = ctx.params
	let _ = ctx.request.body
	if( ctx.admin.grade !== 'SUPER' && Number(ctx.admin.complexUid) !== Number(_.complexUid) ) {
		response.forbidden(ctx)
	}
	let userComplex = await models.userComplex.getByUid(ctx, uid)
	Object.assign(userComplex, _)
	await userComplex.save()
	response.send(ctx, userComplex)
}

exports.createUser = async function (ctx) {
	let _ = ctx.request.body
	if( ctx.admin.grade !== 'SUPER' && Number(ctx.admin.complexUid) !== Number(_.complexUid) ) {
		response.forbidden(ctx)
	}
	let user = await models.user.getByPhone(ctx, _.user.phone)
	if(!user) {
		user = await models.user.create({
			phone: _.user.phone
		})
	}else {
		let alreadyUser = await models.userComplex.getByUserAndComplex(user.uid, _.complexUid)
		if(alreadyUser) {
			response.customError(ctx, '이미 추가되어 있는 휴대전화입니다.')
		}	
	}
	_.userUid = user.uid
	let userComplex = await models.userComplex.create(_)
	response.send(ctx, userComplex)
}

exports.bulkCreateUser = async function (ctx) {
	let _ = ctx.request.body
	if( ctx.admin.grade !== 'SUPER' && Number(ctx.admin.complexUid) !== Number(_.complexUid) ) {
		response.forbidden(ctx)
	}
	let iCnt = 0
	let uCnt = 0
	for(let userData of _.users) {
		let user = await models.user.getByPhone(ctx, userData.phone)
		if(!user) {
			user = await models.user.create({
				phone: userData.phone
			})
		}
		let alreadyUser = await models.userComplex.getByUserAndComplex(user.uid, _.complexUid)
		if(alreadyUser) {
			alreadyUser.confirmed = _.confirmed
			alreadyUser.doors = _.doors
			await alreadyUser.save()
			uCnt ++
		}else {
			userData.userUid = user.uid
			userData.complexUid = _.complexUid
			userData.confirmed = _.confirmed
			userData.doors = _.doors
			await models.userComplex.create(userData)
			iCnt ++
		}
	}
	response.send(ctx, {
		insert: iCnt,
		update: uCnt
	})
}

exports.bulkDeleteUser = async function (ctx) {
	let _ = ctx.request.body
	if( ctx.admin.grade !== 'SUPER' && Number(ctx.admin.complexUid) !== Number(_.complexUid) ) {
		response.forbidden(ctx)
	}
	let deleteResult = await models.userComplex.destroy({
		where: {
			uid: _.uids
		}
	})
	response.send(ctx, deleteResult)
}