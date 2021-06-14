'use strict'
const env = process.env.NODE_ENV || 'development'
const config = require(__dirname + '/../configs/config.json')[env]
const Router = require('koa-router')
const api = new Router()
const Redis = require('ioredis')
const redis = new Redis(config.redis)
const ApiCache = require('koa-api-cache')
const apiCache = new ApiCache({redis, conditionFunc(body) {
    return body.result.code === 200
}})

const payLogController          = require('../controllers/user/payLog')
const coopController            = require('../controllers/user/coop')
const pgController              = require('../controllers/user/pg')

const noticeController          = require('../controllers/notice')
const eventController           = require('../controllers/event')
const popupController           = require('../controllers/popup')
const pointLogController        = require('../controllers/point')
const couponController          = require('../controllers/coupon')
const couponLogController       = require('../controllers/couponLog')
const questionController        = require('../controllers/question')
const pushController            = require('../controllers/push')
const teslaController           = require('../controllers/tesla')
const pointStoreController      = require('../controllers/pointStore')
const commonController          = require('../controllers/common')

const controller = require('../controllers/user')
const middleware = require('../middleware')

// user
api.post('/users/login', controller.user.login)
api.get('/users/check', controller.user.check)
api.get('/users/logout', controller.user.logout)

// 공지사항
api.get('/notices', noticeController.list)

// 이벤트
api.get('/events', eventController.list)
api.get('/events/:uid', eventController.read)

//팝업
api.get('/popups', popupController.list)

// 주차장
api.get('/parkings', middleware.auth.onlyAppRequest, apiCache.route({ prefix: "parkings", expire: 300 }), controller.parkingSite.list)
api.get('/parkings/check', controller.parkingSite.check)
api.get('/parkings/:uid', controller.parkingSite.read)

// 전기충전소
api.get('/evChargeStations', middleware.auth.onlyAppRequest, apiCache.route({ prefix: "evChargeStations", expire: 300 }), controller.evChargeStation.list)
api.get('/evChargeStations/realTime', middleware.auth.isUserLoggedIn, controller.evChargeStation.listRealTime)
api.get('/evChargeStations/check', controller.evChargeStation.check)
api.get('/evChargeStations/:uid', controller.evChargeStation.read)

// 주유소
api.get('/gasStations', middleware.auth.onlyAppRequest, apiCache.route({ prefix: "gasStations", expire: 300 }), controller.gasStation.list)
api.get('/gasStations/check', controller.gasStation.check)
api.get('/gasStations/:uid', controller.gasStation.read)

// 세차장
api.get('/carWashes', middleware.auth.onlyAppRequest, apiCache.route({ prefix: "carWashes", expire: 300 }), controller.carWash.list)
api.get('/carWashes/check', controller.carWash.check)
api.get('/carWashes/:uid', controller.carWash.read)
api.get('/carWashes/products/:productUid', controller.carWash.getProductInfo)
api.get('/carWashes/:uid/timeSlots/:date', controller.carWash.getTimeSlots)
api.post('/carWashes/bookings', middleware.auth.isUserLoggedIn, controller.carWash.booking)
api.get('/carWashes/user/bookings', middleware.auth.isUserLoggedIn, controller.carWash.getBookings)
api.get('/carWashes/user/bookings/:uid', middleware.auth.isUserLoggedIn, controller.carWash.getBooking)
api.put('/carWashes/user/bookings/:uid', middleware.auth.isUserLoggedIn, controller.carWash.putBooking)
api.post('/carWashes/user/bookings/:uid/refund', middleware.auth.isUserLoggedIn, controller.carWash.bookingRefundRequest)
api.post('/carWashes/bookings/cancelPayment', middleware.auth.isUserLoggedIn, controller.carWash.cancelPayment)


// 리뷰
api.post('/rates/:targetType/:targetUid', middleware.auth.isUserLoggedIn, middleware.common.isAvailableTarget, controller.rate.create) //리뷰쓰기
api.delete('/rates/:uid', middleware.auth.isUserLoggedIn, controller.rate.delete) //리뷰삭제
api.get('/rates', controller.rate.list) //리뷰목록(타겟, 페이징)
api.get('/rates/own', middleware.auth.isUserLoggedIn, controller.rate.userOwnList) //리뷰목록(사용자)
api.post('/rateTips', middleware.auth.isUserLoggedIn, controller.rate.toggleRateTip) //꿀팁 ON/OFF

/**
 * 즐겨찾기 관리
 */
api.post('/favorites', middleware.auth.isUserLoggedIn, controller.favorite.toggle)
api.get('/favorites', middleware.auth.isUserLoggedIn, controller.favorite.list)

/**
 * 유저 관련 컨트롤러
 */
api.get('/users', middleware.auth.isUserLoggedIn, controller.user.read)
api.put('/users', middleware.auth.isUserLoggedIn, controller.user.update)
api.get('/getBadge', middleware.auth.isUserLoggedIn, controller.user.getBadge)
api.get('/ticketList', middleware.auth.isUserLoggedIn, controller.user.activeTicketList)

// 차량
api.post('/cars', middleware.auth.isUserLoggedIn, controller.car.create)
api.get('/cars', middleware.auth.isUserLoggedIn, controller.car.list)
api.delete('/cars/:uid', middleware.auth.isUserLoggedIn, controller.car.delete)
api.put('/cars/:uid/main', middleware.auth.isUserLoggedIn, controller.car.updateMain)

// 카드
api.post('/cards', middleware.auth.isUserLoggedIn, controller.card.create)
api.get('/cards', middleware.auth.isUserLoggedIn, controller.card.list)
api.delete('/cards/:uid', middleware.auth.isUserLoggedIn, controller.card.delete)
api.put('/cards/:uid/main', middleware.auth.isUserLoggedIn, controller.card.updateMain)

// 포인트
api.get('/points', middleware.auth.isUserLoggedIn, pointLogController.list)
api.get('/points/:uid', middleware.auth.isUserLoggedIn, pointLogController.read)
api.get('/pointLogs/:userUid', middleware.auth.isUserLoggedIn, pointLogController.userList)

// 이용내역
api.post('/payLogs', middleware.auth.isUserLoggedIn, payLogController.create)
api.get('/payLogs', middleware.auth.isUserLoggedIn, payLogController.list)
api.get('/payLogs/:uid', middleware.auth.isUserLoggedIn, payLogController.read)



// 쿠폰
api.get('/coupons', middleware.auth.isUserLoggedIn, couponController.list)
api.get('/coupons/:uid', middleware.auth.isUserLoggedIn, couponController.read)
api.get('/couponLogs', middleware.auth.isUserLoggedIn, couponLogController.list)
api.get('/couponLogs/:uid', middleware.auth.isUserLoggedIn, couponLogController.read)

// 문의사항
api.post('/questions', middleware.auth.isUserLoggedIn, questionController.create)
//필요 없을 시 삭제//
api.get('/questions', middleware.auth.isUserLoggedIn, questionController.list)
api.get('/questions/:uid', middleware.auth.isUserLoggedIn, questionController.read)
//알림 리스트//
api.get('/pushes', middleware.auth.isUserLoggedIn, pushController.userList)
///////////////////

/**
 * 테슬라 컨트롤러
 */
api.post('/teslaLogin', teslaController.teslaLogin)
api.post('/teslas', teslaController.teslaUpdate)

/**
 * 공통 컨트롤러
 */
api.post('/uploads', commonController.fileUpload)
api.post('/searchLocal', commonController.searchLocal)
//address : '주소'
api.post('/searchList', commonController.searchList)
//keyword : '주차장'
api.post('/avgRate', commonController.avgRate)
api.post('/codes', commonController.codes)

// 결제
api.post('/pgPaymentNice', middleware.auth.isUserLoggedIn, pgController.pgPaymentNice)
// api.post('/pgPaymentCancelNice', middleware.auth.isUserLoggedIn, pgController.pgPaymentCancelNice)
api.post('/pgPaymentRefund', middleware.auth.isUserLoggedIn, payLogController.refundRequest)
api.post('/priceCheck', middleware.auth.isUserLoggedIn, payLogController.priceCheck)

// 포인트 상품
api.get('/pointStore/info', pointStoreController.getInfo)
api.post('/pointStore/exchange', middleware.auth.isUserLoggedIn, pointStoreController.exchange)
api.post('/pointStore/playGame', middleware.auth.isUserLoggedIn, pointStoreController.play)
api.get('/pointStore/gameInfo', pointStoreController.getGameInfo)

// 모바일 상품권
api.post('/coop/use', middleware.auth.isUserLoggedIn, coopController.use)
api.post('/coop/check', middleware.auth.isUserLoggedIn, coopController.check)
api.post('/coop/cancel', middleware.auth.isUserLoggedIn, coopController.cancel)
api.get('/coop/history', middleware.auth.isUserLoggedIn, coopController.history)

// 버전 관리
api.get('/versions', commonController.getVersions)

// 판매 주차장 표시
api.get('/parkingInfo', controller.parkingSite.bookingList )

module.exports = api
