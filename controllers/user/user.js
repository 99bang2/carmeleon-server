const env = process.env.NODE_ENV || 'development'
const axios = require('axios')
const moment = require('moment')
const models = require('../../models')
const response = require('../../libs/response')
const passport = require('../../libs/passport')
const pointLib = require('../../libs/point')
const config = require('../../configs/config.json')[env]
const pointCodes = require('../../configs/pointCodes.json')
const carWashBookingAPI = config.carWashBookingAPI

exports.read = async function (ctx) {
    let user = await models.user.getByUid(ctx, ctx.user.uid)
    response.send(ctx, user)
}

exports.update = async function (ctx) {
    let user = await models.user.getByUid(ctx, ctx.user.uid)
    let _ = ctx.request.body
    Object.assign(user, _)
    await user.save()
	const accessToken = await passport.generateUserAccessToken(user)
	let data = {
    	user: user,
		token: accessToken
	}
    response.send(ctx, data)
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
		await pointLib.updatePoint(user.uid, pointCodes.WELCOME)
	}else{
		if(_.user.token) {
			user.marketing = _.user.marketing
			user.token = _.user.token
			await user.save()
		}
	}

	const accessToken = await passport.generateUserAccessToken(user)
	const refreshToken = await passport.generateUserRefreshToken(user)
	response.send(ctx, {
		token: accessToken,
		refreshToken: refreshToken
	})
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
	let resBooking = await axios.get(carWashBookingAPI + `/api/carmeleon/bookings`, {
		params: {
			onlyAccept: true,
			vendorUserKey: ctx.user.uid
		}
	})
	result.ticket += resBooking.data.data.count

	//이용내역
	let payLogCount = await models.payLog.count({
		where: {
			visible: true,
			userUid: ctx.user.uid,
			updatedAt: {
				[models.Sequelize.Op.gte]: today
			}
		}
	})
	let res = await axios.get(carWashBookingAPI + `/api/carmeleon/bookings`, {
		params: {
			onlyToday: true,
			vendorUserKey: ctx.user.uid
		}
	})
	let carWashBookingCount = res.data.data.count
	result.payLog = payLogCount + carWashBookingCount

	//공지
	result.notice = await models.notice.count({
		where: {
			isOpen: true,
			updatedAt: {
				[models.Sequelize.Op.gte]: today
			}
		}
	})

	//이벤트
	result.event = await models.event.count({
		where: {
			isOpen: true,
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


exports.activeTicketList = async function (ctx) {
	let list = []
	let payLogs = await models.payLog.findAll({
		include: [
			{
				model: models.parkingSite,
				attributes: ['name', 'address']
			},
			{
				model: models.discountTicket,
				attributes: ['ticketType', 'ticketDayType', 'ticketTime']
			}
		],
		attributes: ['uid', 'carNumber', 'reserveTime', 'price', 'discountPrice', 'createdAt', 'totalPrice'],
		where: {
			userUid: ctx.user.uid,
			activeStatus: false,
			status: 10,
			cancelStatus: -1,
			expired: false
		}
	})
	for(let payLog of payLogs) {
		list.push({
			targetType: 0, // 0: 주차권 3: 세차권
			recordUid: payLog.uid,
			dateTime: moment(payLog.createdAt).format('YYYY-MM-DD') + ' ' + payLog.reserveTime,
			spotName: payLog.parkingSite.name,
			spotAddress: payLog.parkingSite.address,
			title: '일반 주차권',
			subTitle: payLog.discountTicket.ticketTitle
		})
	}
	//세차권
	let res = await axios.get(carWashBookingAPI + `/api/carmeleon/bookings`, {
		params: {
			onlyAccept: true,
			vendorUserKey: ctx.user.uid
		}
	})
	let carWashBookings = res.data.data.rows
	for(let booking of carWashBookings) {
		list.push({
			targetType: 3, // 0: 주차권 3: 세차권
			recordUid: booking.uid,
			dateTime: booking.bookingDate + ' ' + booking.bookingTime,
			spotName: booking.carWashName,
			spotAddress: booking.carWash.address,
			title: '세차권',
			subTitle: booking.product.name
		})
	}
	list.sort((a, b) => {
		if(moment(a.dateTime).isAfter(moment(b.dateTime))) {
			return 1
		}else {
			return -1
		}
	})
	response.send(ctx, list)
}


exports.refresh = async function (ctx) {
	let _ = ctx.request.body
	let refreshToken = _.refreshToken
	//accessToken 검증
	let verifyAccessToken = await passport.verifyUserAccessToken(ctx)
	if(!verifyAccessToken) {
		response.unauthorized(ctx)
	}
	//refreshToken 검증
	let verifyRefreshToken = await passport.verifyRefreshToken(refreshToken, verifyAccessToken.uuid)
	if(!verifyRefreshToken) {
		response.unauthorized(ctx)
	}
	console.log('verifyRefreshToken', verifyRefreshToken)
	//새로운 accessToken 생성
	const accessToken = await passport.generateUserAccessToken(verifyAccessToken)
	//refreshToken 유효기간이 1일 이하인 경우 재생성
	if(verifyRefreshToken.remainDays < 1) {
		refreshToken = await passport.generateUserRefreshToken(verifyAccessToken)
	}
	response.send(ctx, {
		token: accessToken,
		refreshToken: refreshToken
	})
}
