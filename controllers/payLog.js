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
				[Sequelize.literal(`case when ('` + currentDate + `' not between ticket_start_date AND ticket_end_date) AND (ticket_day_type !=` + dayType + `) then true else false end`), 'expire'],
				[Sequelize.literal(`case when ((select count(uid) from pay_logs where discount_ticket_uid = uid) >= ticket_count) then true else false end`), 'sold_out']
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
	let {userUid} = ctx.params
	let payLog = await models.payLog.getByUserUid(ctx, userUid, models)
	response.send(ctx, payLog)
}

exports.activeTicketList = async function (ctx) {
	let ticketList = await models.payLog.activeTicketList(ctx, models)
	response.send(ctx, ticketList)
}
