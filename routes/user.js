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
const middleware =          require('../middleware')
const controller =          require('../controllers/user')
const commonController =    require('../controllers/common')

// user
api.post('/users/login', controller.user.login)
api.post('/users/refresh', controller.user.refresh)
api.get('/users', middleware.auth.isUserLoggedIn, controller.user.read)
api.put('/users', middleware.auth.isUserLoggedIn, controller.user.update)
api.get('/getBadge', middleware.auth.isUserLoggedIn, controller.user.getBadge)
api.get('/ticketList', middleware.auth.isUserLoggedIn, controller.user.activeTicketList)

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

//즐겨찾기
api.post('/favorites', middleware.auth.isUserLoggedIn, controller.favorite.toggle)
api.get('/favorites', middleware.auth.isUserLoggedIn, controller.favorite.list)

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
api.get('/pointLogs', middleware.auth.isUserLoggedIn, controller.point.list)

// 주차권 구매
api.post('/payLogs', middleware.auth.isUserLoggedIn, controller.payLog.create)
api.get('/payLogs', middleware.auth.isUserLoggedIn, controller.payLog.list)
api.get('/payLogs/:uid', middleware.auth.isUserLoggedIn, controller.payLog.read)
api.put('/payLogs/:uid/refund', middleware.auth.isUserLoggedIn, controller.payLog.refundRequest)
api.get('/discountTickets/:uid/price', middleware.auth.isUserLoggedIn, controller.payLog.priceCheck)

// 문의사항
api.post('/questions', middleware.auth.isUserLoggedIn, controller.question.create)

//알림 리스트
api.get('/pushes', middleware.auth.isUserLoggedIn, controller.push.list)

// 공지사항
api.get('/notices', controller.notice.list)

// 이벤트
api.get('/events', controller.event.list)
api.get('/events/:uid', controller.event.read)

//팝업
api.get('/popups', controller.popup.list)

//테슬라
api.post('/teslaLogin', controller.tesla.teslaLogin)
api.post('/teslas', controller.tesla.teslaUpdate)

// 포인트 상품
api.get('/pointStore/info', controller.pointStore.getInfo)
api.post('/pointStore/exchange', middleware.auth.isUserLoggedIn, controller.pointStore.exchange)
api.post('/pointStore/playGame', middleware.auth.isUserLoggedIn, controller.pointStore.play)
api.get('/pointStore/gameInfo', controller.pointStore.getGameInfo)

// 모바일 상품권
api.post('/coop/use', middleware.auth.isUserLoggedIn, controller.coop.use)
api.post('/coop/check', middleware.auth.isUserLoggedIn, controller.coop.check)
api.post('/coop/cancel', middleware.auth.isUserLoggedIn, controller.coop.cancel)
api.get('/coop/history', middleware.auth.isUserLoggedIn, controller.coop.history)


// ETC
api.post('/searchLocal', commonController.searchLocal) //네이버 맵 검색
api.post('/searchList', commonController.searchList) //네이버 맵 검색
api.post('/codes', commonController.codes) // 코드
api.get('/versions', commonController.getVersions) //버전 정보
api.get('/parkingInfo', commonController.parkingBookingList) // 판매 주차장 정보
api.post('/ticket/active', commonController.ticketActive) //주차권 판매 on off

module.exports = api
