const models = require('../models')
const response = require('../libs/response')
const redisModel = require('../redis_models')
const pCrypto = require('crypto')
const smsSender =require('../libs/smsSender')
function createCode() {
	let min = 100000
	let max = 999999
	return Math.floor(Math.random() * (max - min + 1)) + min
}
function createAk(uid) {
	return pCrypto.randomBytes(16).toString('hex') + String(uid);
}

exports.sendAuthCode = async function (ctx) {
	let _ = ctx.request.body
	if(!_.phoneNumber) {
		response.customError(ctx, '휴대전화번호를 입력해주세요.')
	}
	let alreadySendCode = await redisModel.authCode.read(_.phoneNumber)
	if(alreadySendCode) {
		response.customError(ctx, '이미 발송된 인증번호가 있습니다.')
	}
	let codeVal = createCode()
	await redisModel.authCode.save(_.phoneNumber, codeVal)
	
	await smsSender.sendSMS(
		`<#> [KEY-FREE] 인증번호(${codeVal})를 입력해주세요. FUr6olIpEe1`,
		_.phoneNumber
		)
	response.send(ctx, codeVal)
}

exports.verifyAuthCode = async function (ctx) {
	let _ = ctx.request.body
	if(!_.phoneNumber) {
		response.customError(ctx, '휴대전화번호를 입력해주세요.')
	}
	if(!_.authCode) {
		response.customError(ctx, '인증번호를 입력해주세요.')
	}
	let authCode = await redisModel.authCode.read(_.phoneNumber)
	if(authCode !== _.authCode) {
		response.customError(ctx, '인증번호가 일치하지 않습니다.')
	}
	await redisModel.authCode.remove(_.phoneNumber)
	let user = await models.user.getByPhone(ctx, _.phoneNumber)
	if(!user) {
		user = await models.user.create({
			phone: _.phoneNumber
		})
	}
	let ak = createAk(user.uid)
	user.ak = ak
	await user.save()
	response.send(ctx, ak)
}

exports.searchComplexes = async function (ctx) {
	let _ = ctx.request.query
	let where = {}
	if(_.addressCode) {
		where.addressCode = _.addressCode
	}
	if(_.addressDetailCode) {
		where.addressDetailCode = _.addressDetailCode
	}
	if (_.keyword) {
		where[models.Sequelize.Op.or] = [
			{
				fullAddress: {
					[models.Sequelize.Op.like]: '%' + _.keyword + '%'
				}
			},
			{
				name: {
					[models.Sequelize.Op.like]: '%' + _.keyword + '%'
				}
			},
		]
	}
	let complexes = await models.complex.findAll({
		order: [['name', 'ASC']],
		where: where,
	})
	response.send(ctx, complexes)
}

exports.addComplexes = async function (ctx) {
	let _ = ctx.request.body
	let user = ctx.user
	if(!_.complexUid) {
		response.customError(ctx, '필수 입력값이 누락되었습니다.')
	}
	let alreadyUser = await models.userComplex.getByUserAndComplex(user.uid, _.complexUid)
	if(alreadyUser) {
		response.customError(ctx, '이미 등록한 업소입니다.')
	}
	let userComplex = await models.userComplex.create({
		userUid: user.uid,
		complexUid: _.complexUid,
		confirmed: false
	})
	response.send(ctx, userComplex)
}

exports.getComplexes = async function (ctx) {
	let _ = ctx.request.query
	let userComplexes = await models.userComplex.searchUserComplex(ctx.user.uid, models)
	let complexes = []
	for(let userComplex of userComplexes) {
		userComplex.complex.dataValues.confirmed = userComplex.confirmed
		complexes.push(userComplex.complex)
	}
	response.send(ctx, complexes)
}

exports.getDoors = async function (ctx) {
	let userComplexes = await models.userComplex.searchUserComplex(ctx.user.uid, models)
	let doors = []
	for(let userComplex of userComplexes) {
		doors.push(userComplex.complex.doors)
	}
	response.send(ctx, doors)
}


exports.openDoor = async function (ctx) {
	let _ = ctx.request.body
	let user = ctx.user
	if(!_.doorUid) {
		response.customError(ctx, '필수 입력값이 누락되었습니다.')
	}
	let door = await models.door.getByUid(ctx, _.doorUid)
	let userComplex = await models.userComplex.getByUserAndComplex(user.uid, door.complexUid)
	if(userComplex) {
		userComplex.confirmed = true
		await userComplex.save()
	}
	let log = await models.openDoorLog.create({
		userUid: user.uid,
		complexUid: door.complexUid,
		doorUid: door.uid
	})
	response.send(ctx, log)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let users = await models.user.search(_)
	response.send(ctx, users)
}