'use strict'
const Router = require('koa-router')
const api = new Router()

const auth = require('../libs/auth')
const userController = require('../controllers/user')
const noticeController = require('../controllers/notice')
const eventController = require('../controllers/event')
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

const pgController = require('../controllers/pg')
const commonController = require('../controllers/common')

/**
 * POST: Insert, GET: Read, PUT: UPDATE, DELETE: DELETE
 */

api.post('/users/login', userController.login)
api.get('/users/logout', auth.isUserLoggedIn, userController.logout)
api.get('/users/check', userController.check)

/**
 * 공지사항 관리
 */
api.get('/notices', noticeController.userList)
api.get('/notices/:uid', noticeController.read)
/**
 * 이벤트 관리
 */
api.get('/events', eventController.userList)
api.get('/events/:uid', eventController.read)
/**
 * 주차장 관리
 */
api.get('/parkings', parkingController.userList)
api.get('/parkings/:uid', parkingController.read)
/**
 * 전기차 충전소 관리(Main)
 */
api.get('/evChargeStations', evChargeStationController.list)
api.get('/evChargeStations/:uid', evChargeStationController.read)
/**
 * 주유소 관리
 */
api.get('/gasStations', gasStationController.userList)
api.get('/gasStations/:uid', gasStationController.read)
/**
 * 세차장 관리
 */
api.get('/carWashes', carWashController.userList)
api.get('/carWashes/:uid', carWashController.read)
/**
 * 리뷰 관리
 */
api.post('/rates/:targetType/:targetUid', auth.isUserLoggedIn, commonController.isAvailableTarget, rateController.create)
api.get('/rates/:targetType/:targetUid', auth.isUserLoggedIn, commonController.isAvailableTarget, rateController.targetList)
api.get('/rates', rateController.list)
api.get('/rates/:uid', rateController.userList)
api.put('/rates/:uid', auth.isUserLoggedIn, rateController.update)
api.delete('/rates/:uid', auth.isUserLoggedIn, rateController.delete)
api.get('/rateChecks', auth.isUserLoggedIn, rateController.checkAvailable)
/* 리뷰 꿀팁 */
api.post('/rateTips', auth.isUserLoggedIn, rateTipController.create)
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

module.exports = api
