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
		`[A-PASS] 인증번호 안내`,
		`인증번호(${codeVal})를 입력해주세요.`,
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
	if(!_.complexUid || !_.userName || !_.userDong || !_.userHo) {
		response.customError(ctx, '필수 입력값이 누락되었습니다.')
	}
	let userComplex = await models.userComplex.create({
		userUid: user.uid,
		complexUid: _.complexUid,
		userName: _.userName,
		userDong: _.userDong,
		userHo: _.userHo,
		confirmed: false
	})
	response.send(ctx, userComplex)
}

exports.getComplexes = async function (ctx) {
	let _ = ctx.request.query
	let user = await models.user.getByUid(ctx, ctx.user.uid)
	let complexes = await user.getComplexes()
	response.send(ctx, complexes)
}

exports.getDoors = async function (ctx) {
	let user = await models.user.getByUid(ctx, ctx.user.uid)
	let complexes = await user.getComplexes()
	let doorUids = []
	for(let complex of complexes) {
		if(complex.userComplex.confirmed) {
			doorUids = doorUids.concat(complex.userComplex.doors)
		}
	}
	let doors = await models.door.findAll({
		order: [['complexUid', 'ASC'], ['name', 'ASC']],
		where: {
			uid: {
				[models.Sequelize.Op.in]: doorUids
			}
		},
		include:[{
			model: models.complex
		}]
	})
	response.send(ctx, doors)
}