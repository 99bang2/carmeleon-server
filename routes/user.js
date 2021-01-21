'use strict'
const Router = require('koa-router')
const api = new Router()

const auth = require('../libs/auth')
const userController = require('../controllers/user')
const noticeController = require('../controllers/notice')
const eventController = require('../controllers/event')
const popupController = require('../controllers/popup')
const parkingController = require('../controllers/parkingSite')
const carWashController = require('../controllers/carWash')
const gasStationController = require('../controllers/gasStation')
const rateController = require('../controllers/rate')
const rateTipController = require('../controllers/rateTip')
const carController = require('../controllers/car')
const cardController = require('../controllers/card')
const favoriteController = require('../controllers/favorite')
const pointLogController = require('../controllers/point')
const payLogController = require('../controllers/payLog')
const discountTicketController = require('../controllers/discountTicket')
const couponController = require('../controllers/coupon')
const couponLogController = require('../controllers/couponLog')
const evChargeStationController = require('../controllers/evChargeStation')
const questionController = require('../controllers/question')
const pushController = require('../controllers/push')
const teslaController = require('../controllers/tesla')

const pointStoreController = require('../controllers/pointStore')

const pgController = require('../controllers/pg')
const commonController = require('../controllers/common')

/**
 * POST: Insert, GET: Read, PUT: UPDATE, DELETE: DELETE
 */

api.post('/users/login', userController.login)
api.get('/users/logout', auth.isUserLoggedIn, userController.logout)
api.get('/users/check', userController.check)


// 공지사항
api.get('/notices', noticeController.list)

// 이벤트
api.get('/events', eventController.list)
api.get('/events/:uid', eventController.read)

//팝업
api.get('/popups', popupController.list)

// 주차장
api.get('/parkings', parkingController.list)
api.get('/parkings/:uid', parkingController.read)

// 전기충전소
api.get('/evChargeStations', evChargeStationController.list)
api.get('/evChargeStations/:uid', evChargeStationController.read)

// 주유소
api.get('/gasStations', gasStationController.list)
api.get('/gasStations/:uid', gasStationController.read)

// 세차장
api.get('/carWashes', carWashController.list)
api.get('/carWashes/:uid', carWashController.read)
api.get('/carWashes/products/:productUid', carWashController.getProductInfo)
api.get('/carWashes/:uid/timeSlots/:date', carWashController.getTimeSlots)
api.post('/carWashes/booking', auth.isUserLoggedIn, carWashController.booking)

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

api.post('/cars', auth.isUserLoggedIn, carController.create)
api.get('/cars', auth.isUserLoggedIn, carController.list)
api.get('/cars/:uid', auth.isUserLoggedIn, carController.read)
api.put('/cars/:uid', auth.isUserLoggedIn, carController.update)
api.delete('/cars/:uid', auth.isUserLoggedIn, carController.delete)
api.put('/mainCars', auth.isUserLoggedIn, carController.isMain)
api.get('/carLists/:userUid', auth.isUserLoggedIn, carController.carList)

api.post('/cards', auth.isUserLoggedIn, cardController.create)
api.get('/cards', auth.isUserLoggedIn, cardController.list)
api.get('/cards/:uid', auth.isUserLoggedIn, cardController.read)
api.put('/cards/:uid', auth.isUserLoggedIn, cardController.update)
api.delete('/cards/:uid', auth.isUserLoggedIn, cardController.delete)
api.put('/mainCards', auth.isUserLoggedIn, cardController.isMain)
api.get('/cardLists/:userUid', auth.isUserLoggedIn, cardController.cardList)

api.get('/discountTickets', discountTicketController.list)
api.get('/discountTickets/:uid', discountTicketController.read)

api.get('/points', auth.isUserLoggedIn, pointLogController.list)
api.get('/points/:uid', auth.isUserLoggedIn, pointLogController.read)
api.get('/pointLogs/:userUid', auth.isUserLoggedIn, pointLogController.userList)

api.post('/payLogs', auth.isUserLoggedIn, payLogController.create)
api.get('/payLogs', auth.isUserLoggedIn, payLogController.userList)
api.get('/payLogs/:uid', auth.isUserLoggedIn, payLogController.read)
api.put('/payLogs/:uid', auth.isUserLoggedIn, payLogController.update)
api.get('/ticketList', auth.isUserLoggedIn, payLogController.activeTicketList)

api.get('/coupons', auth.isUserLoggedIn, couponController.list)
api.get('/coupons/:uid', auth.isUserLoggedIn, couponController.read)

api.get('/couponLogs', auth.isUserLoggedIn, couponLogController.list)
api.get('/couponLogs/:uid', auth.isUserLoggedIn, couponLogController.read)

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

api.post('/pgBillNice', auth.isUserLoggedIn, pgController.pgBillNice)
api.post('/pgPaymentNice', auth.isUserLoggedIn, pgController.pgPaymentNice)
api.post('/pgPaymentCancelNice', auth.isUserLoggedIn, pgController.pgPaymentCancelNice)

api.post('/pgPaymentRefund', auth.isUserLoggedIn, payLogController.refundRequest)
api.post('/pgPaymentRefundCancel', auth.isUserLoggedIn, payLogController.refundRequestCancel)

api.post('/priceCheck', auth.isUserLoggedIn, payLogController.priceCheck)


api.get('/pointStore/info', pointStoreController.getInfo)
api.post('/pointStore/exchange', auth.isUserLoggedIn, pointStoreController.exchange)
api.post('/pointStore/playGame', auth.isUserLoggedIn, pointStoreController.play)
api.get('/pointStore/gameInfo', pointStoreController.getGameInfo)


api.get('/versions', commonController.getVersions)

module.exports = api
