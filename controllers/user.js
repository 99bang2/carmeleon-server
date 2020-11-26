const models = require('../models')
const response = require('../libs/response')
const jwt = require('jsonwebtoken')
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]
const secret = config.secretKey
const common = require('../controllers/common')
const pointCodes = require('../configs/pointCodes')
const moment = require('moment')

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
		await common.updatePoint(user.uid, pointCodes.WELCOME)
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
	let user = await models.user.findByPk(ctx.user.uid)
	let today = moment().format('YYYY-MM-DD')
	let result = {
		ticket: 0,
		coupon: 0, //추후 작업
		notice: 0,
		alarm: 0,
		event: 0,
		payLog: 0
	}
	//사용가능한 주차권
	result.ticket = await models.payLog.count({
		where: {
			userUid: ctx.user.uid,
			activeStatus: false,
			status: 10,
			cancelStatus: -1,
			expired: false
		}
	})

	//이용내역
	result.payLog = await models.payLog.count({
		where: {
			visible: true,
			userUid: ctx.user.uid,
			updatedAt: {
				[models.Sequelize.Op.gte]: today
			}
		}
	})
	//공지
	result.notice = await models.notice.count({
		where: {
			updatedAt: {
				[models.Sequelize.Op.gte]: today
			}
		}
	})

	//이벤트
	result.event = await models.event.count({
		where: {
			updatedAt: {
				[models.Sequelize.Op.gte]: today
			}
		}
	})

	//푸시

	if(user.newMessage) {
		result.alarm = await models.push.count({
			where: {
				status: 1,
				[models.Sequelize.Op.or]: [{
					userUid: ctx.user.uid
				},{
					pushType: 2
				}],
				sendDate: {
					[models.Sequelize.Op.gte]: user.newMessage
				}
			}
		})
	}

	response.send(ctx, result)
}
