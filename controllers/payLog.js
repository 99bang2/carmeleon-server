const models = require('../models')
const response = require('../libs/response')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const moment = require('moment')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	if (_.totalPrice <= 0) {
		ctx.throw({
			code: 400,
			message: '주문 금액이 0원 이하는 구매가 불가능 합니다.'
		})
	}
	let currentDate = moment().format('YYYY-MM-DD')
	let currentDay = parseInt(moment().format('E'))
	let dayType
	(currentDay === 0 || currentDay === 6) ? dayType = 2 : dayType = 1
	let ticketStatus = await models.discountTicket.findByPk(_.discountTicketUid, {
		attributes:
			[
				[Sequelize.literal(`case when ('` + currentDate + `' not between ticket_start_date AND ticket_end_date) AND (ticket_day_type !=` + dayType + `)  AND deleted_at IS NULL then true else false end`), 'expire'],
				[Sequelize.literal(`case when ((select count(uid) from pay_logs where discount_ticket_uid = uid AND deleted_at IS NULL) >= ticket_count) then true else false end`), 'sold_out']
			]
	})
	if(Boolean(ticketStatus.dataValues.expire) === true){
		ctx.throw({
			code: 400,
			message: '유효기간이 지난 할인권 입니다.'
		})
	}
	if(Boolean(ticketStatus.dataValues.sold_out)=== true){
		ctx.throw({
			code: 400,
			message: '매진 된 할인권 입니다.'
		})
	}
	let payLog = await models.payLog.create(_)
	response.send(ctx, payLog)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let payLogs = await models.payLog.search(_, models)
	response.send(ctx, payLogs)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let payLog = await models.payLog.getByUid(ctx, uid, models)
	response.send(ctx, payLog)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let payLog = await models.payLog.getByUid(ctx, uid, models)
	let _ = ctx.request.body
	Object.assign(payLog, _)
	await payLog.save()
	response.send(ctx, payLog)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let payLog = await models.payLog.getByUid(ctx, uid, models)
	await payLog.destroy()
	response.send(ctx, payLog)
}

exports.userList = async function (ctx) {
	let _ = ctx.request.query
	let payLog = await models.payLog.getByUserUid(ctx, _, models)
	response.send(ctx, payLog)
}

exports.userListForAdmin = async function (ctx) {
	let {userUid} = ctx.params
	let payLog = await models.payLog.getByUserUidForAdmin(ctx, userUid, models)
	response.send(ctx, payLog)
}

exports.activeTicketList = async function (ctx) {
	let ticketList = await models.payLog.activeTicketList(ctx, models)
	response.send(ctx, ticketList)
}

exports.refundRequest = async function(ctx) {
	let _ = ctx.request.body
	let count = await models.payLog.count({
		where:{
			uid: _.uid,
			userUid: ctx.user.uid
		}
	})
	if(count === 0){
		ctx.throw({
			code: 400,
			message: '거래 내역이 존재하지 않습니다.'
		})
	}
	await models.paylog.update({cancelStatus: 0, cancelReason: _.cancelReason},{
		where: {
			uid: _.uid
		}
	})
	response.send(ctx, true)
}

exports.refundRequestCancel = async function(ctx) {
	let _ = ctx.request.body
	let count = await models.payLog.count({
		where:{
			uid: _.uid,
			userUid: ctx.user,
			cancelStatus: {
				[Op.gt] : -1
			}
		}
	})
	if(count === 0){
		ctx.throw({
			code: 400,
			message: '환불 요청 내역이 존재하지 않습니다.'
		})
	}
	await models.paylog.update({cancelStatus: -1, cancelReason: ""},{
		where: {
			uid: _.uid
		}
	})
	response.send(ctx, true)
}

exports.priceCheck = async function (ctx){
	let _ = ctx.request.body
	let userPoint = ctx.user.point
	let ticketPrice = await models.discountTicket.findOne({
		attributes: ['totalPrice'],
		where: {
			uid : _.discountTicketUid
		}
	})
	let discountPrice = ticketPrice.totalPrice
	let data = {
		price: discountPrice
	}
	if(userPoint > 10000){
		/*TODO:감면 차량 관련 할인 추가 예정*/
		data.availablePoint = discountPrice/10
	}
	/*TODO:쿠폰 관련 할인 추가 예정*/
	response.send(ctx, data)
}
