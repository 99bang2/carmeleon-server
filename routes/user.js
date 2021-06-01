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

const auth = require('../libs/auth')
const userController            = require('../controllers/user/user')
const payLogController          = require('../controllers/user/payLog')
const coopController            = require('../controllers/user/coop')
const pgController              = require('../controllers/user/pg')

const noticeController          = require('../controllers/notice')
const eventController           = require('../controllers/event')
const popupController           = require('../controllers/popup')
const parkingController         = require('../controllers/parkingSite')
const carWashController         = require('../controllers/carWash')
const gasStationController      = require('../controllers/gasStation')
const rateController            = require('../controllers/rate')
const rateTipController         = require('../controllers/rateTip')
const carController             = require('../controllers/car')
const cardController            = require('../controllers/card')
const favoriteController        = require('../controllers/favorite')
const pointLogController        = require('../controllers/point')
const discountTicketController  = require('../controllers/discountTicket')
const couponController          = require('../controllers/coupon')
const couponLogController       = require('../controllers/couponLog')
const evChargeStationController = require('../controllers/evChargeStation')
const questionController        = require('../controllers/question')
const pushController            = require('../controllers/push')
const teslaController           = require('../controllers/tesla')
const pointStoreController      = require('../controllers/pointStore')
const commonController          = require('../controllers/common')

// user
api.post('/users/login', userController.login)
api.get('/users/check', userController.check)
api.get('/users/logout', userController.logout)

// 공지사항
api.get('/notices', noticeController.list)

// 이벤트
api.get('/events', eventController.list)
api.get('/events/:uid', eventController.read)

//팝업
api.get('/popups', popupController.list)

// 주차장
api.get('/parkings', auth.onlyAppRequest, apiCache.route({ prefix: "parkings", expire: 300 }), parkingController.list)
api.get('/parkings/check', parkingController.check)
api.get('/parkings/:uid', parkingController.read)

// 전기충전소
api.get('/evChargeStations', auth.onlyAppRequest, apiCache.route({ prefix: "evChargeStations", expire: 300 }), evChargeStationController.list)
api.get('/evChargeStations/realTime', auth.isUserLoggedIn, evChargeStationController.listRealTime)
api.get('/evChargeStations/check', evChargeStationController.check)
api.get('/evChargeStations/:uid', evChargeStationController.read)

// 주유소
api.get('/gasStations', auth.onlyAppRequest, apiCache.route({ prefix: "gasStations", expire: 300 }), gasStationController.list)
api.get('/gasStations/check', gasStationController.check)
api.get('/gasStations/:uid', gasStationController.read)

// 세차장
api.get('/carWashes', auth.onlyAppRequest, apiCache.route({ prefix: "carWashes", expire: 300 }), carWashController.list)
api.get('/carWashes/check', carWashController.check)
api.get('/carWashes/:uid', carWashController.read)
api.get('/carWashes/products/:productUid', carWashController.getProductInfo)
api.get('/carWashes/:uid/timeSlots/:date', carWashController.getTimeSlots)
api.post('/carWashes/bookings', auth.isUserLoggedIn, carWashController.booking)
api.get('/carWashes/user/bookings', auth.isUserLoggedIn, carWashController.getBookings)
api.get('/carWashes/user/bookings/:uid', auth.isUserLoggedIn, carWashController.getBooking)
api.put('/carWashes/user/bookings/:uid', auth.isUserLoggedIn, carWashController.putBooking)
api.post('/carWashes/user/bookings/:uid/refund', auth.isUserLoggedIn, carWashController.bookingRefundRequest)
api.post('/carWashes/bookings/cancelPayment', carWashController.cancelPayment)

// 리뷰
api.post('/rates/:targetType/:targetUid', auth.isUserLoggedIn, commonController.isAvailableTarget, rateController.create) //리뷰쓰기
api.delete('/rates/:uid', auth.isUserLoggedIn, rateController.delete) //리뷰삭제
api.get('/rates', rateController.list) //리뷰목록(타겟, 페이징)
api.get('/rates/:uid', rateController.userList) //리뷰목록(사용자)
api.post('/rateTips', auth.isUserLoggedIn, rateTipController.create) //꿀팁 ON/OFF

/**
 * 즐겨찾기 관리
 */
api.post('/favorites', auth.isUserLoggedIn, favoriteController.create)
api.get('/favorites/:userUid', auth.isUserLoggedIn, favoriteController.userList)

/**
 * 유저 관련 컨트롤러
 */
api.post('/users', userController.create)
api.get('/users/:uid', auth.isUserLoggedIn, userController.read)
api.put('/users/:uid', auth.isUserLoggedIn, userController.update)
api.get('/getBadge/:uid', auth.isUserLoggedIn, userController.getBadge)

// 차량
api.post('/cars', auth.isUserLoggedIn, carController.create)
api.get('/cars', auth.isUserLoggedIn, carController.list)
api.get('/cars/:uid', auth.isUserLoggedIn, carController.read)
api.put('/cars/:uid', auth.isUserLoggedIn, carController.update)
api.delete('/cars/:uid', auth.isUserLoggedIn, carController.delete)
api.put('/mainCars', auth.isUserLoggedIn, carController.isMain)
api.get('/carLists/:userUid', auth.isUserLoggedIn, carController.carList)

// 카드
api.post('/cards', auth.isUserLoggedIn, cardController.create)
api.get('/cards', auth.isUserLoggedIn, cardController.list)
api.get('/cards/:uid', auth.isUserLoggedIn, cardController.read)
api.put('/cards/:uid', auth.isUserLoggedIn, cardController.update)
api.delete('/cards/:uid', auth.isUserLoggedIn, cardController.delete)
api.put('/mainCards', auth.isUserLoggedIn, cardController.isMain)
api.get('/cardLists/:userUid', auth.isUserLoggedIn, cardController.cardList)

// 주차권
api.get('/discountTickets', discountTicketController.list)
api.get('/discountTickets/:uid', discountTicketController.read)

// 포인트
api.get('/points', auth.isUserLoggedIn, pointLogController.list)
api.get('/points/:uid', auth.isUserLoggedIn, pointLogController.read)
api.get('/pointLogs/:userUid', auth.isUserLoggedIn, pointLogController.userList)

// 이용내역
api.post('/payLogs', auth.isUserLoggedIn, payLogController.create)
api.get('/payLogs', auth.isUserLoggedIn, payLogController.list)
api.get('/payLogs/:uid', auth.isUserLoggedIn, payLogController.read)

// 주차권 목록
api.get('/ticketList', auth.isUserLoggedIn, userController.activeTicketList)

// 쿠폰
api.get('/coupons', auth.isUserLoggedIn, couponController.list)
api.get('/coupons/:uid', auth.isUserLoggedIn, couponController.read)
api.get('/couponLogs', auth.isUserLoggedIn, couponLogController.list)
api.get('/couponLogs/:uid', auth.isUserLoggedIn, couponLogController.read)

// 문의사항
api.post('/questions', auth.isUserLoggedIn, questionController.create)
//필요 없을 시 삭제//
api.get('/questions', auth.isUserLoggedIn, questionController.list)
api.get('/questions/:uid', auth.isUserLoggedIn, questionController.read)
//알림 리스트//
api.get('/pushes', auth.isUserLoggedIn, pushController.userList)
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
api.post('/pgBillNice', auth.isUserLoggedIn, pgController.pgBillNice)
api.post('/pgPaymentNice', auth.isUserLoggedIn, pgController.pgPaymentNice)
// api.post('/pgPaymentCancelNice', auth.isUserLoggedIn, pgController.pgPaymentCancelNice)
api.post('/pgPaymentRefund', auth.isUserLoggedIn, payLogController.refundRequest)
api.post('/priceCheck', auth.isUserLoggedIn, payLogController.priceCheck)

// 포인트 상품
api.get('/pointStore/info', pointStoreController.getInfo)
api.post('/pointStore/exchange', auth.isUserLoggedIn, pointStoreController.exchange)
api.post('/pointStore/playGame', auth.isUserLoggedIn, pointStoreController.play)
api.get('/pointStore/gameInfo', pointStoreController.getGameInfo)

// 모바일 상품권
api.post('/coop/use', auth.isUserLoggedIn, coopController.use)
api.post('/coop/check', auth.isUserLoggedIn, coopController.check)
api.post('/coop/cancel', auth.isUserLoggedIn, coopController.cancel)
api.get('/coop/history', auth.isUserLoggedIn, coopController.history)

// 버전 관리
api.get('/versions', commonController.getVersions)

// 판매 주차장 표시
api.get('/parkingInfo', parkingController.bookingList )

module.exports = api
