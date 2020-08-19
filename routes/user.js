'use strict'
const Router = require('koa-router')
const api = new Router()

const userController = require('../controllers/user')
const noticeController = require('../controllers/notice')
const eventController = require('../controllers/event')
const parkingController = require('../controllers/parkingSite')
const carWashController = require('../controllers/carWash')
const gasStationController = require('../controllers/gasStation')
const rateController = require('../controllers/rate')
const carController = require('../controllers/car')
const cardController = require('../controllers/card')
const favoriteController = require('../controllers/favorite')
const pointLogController = require('../controllers/point')
const payLogController = require('../controllers/payLog')
const discountTicketController = require('../controllers/discountTicket')
const couponController = require('../controllers/coupon')
const couponLogController = require('../controllers/couponLog')
const reviewTemplateController = require('../controllers/reviewTemplate')

const commonController = require('../controllers/common')

/**
 * POST: Insert, GET: Read, PUT: UPDATE, DELETE: DELETE
 */

api.post('/users/login', userController.login)
api.get('/users/logout', userController.logout)
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
 * 세차장 관리
 */
api.get('/carWashes', carWashController.userList)
api.get('/carWashes/:uid', carWashController.read)
/**
 * 주유소 관리
 */
api.get('/gasStations', gasStationController.userList)
api.get('/gasStations/:uid', gasStationController.read)
/**
 * 리뷰 관리
 */
api.post('/rates/:targetType/:targetUid', commonController.isAvailableTarget, rateController.create)
api.get('/rates/:targetType/:targetUid', commonController.isAvailableTarget, rateController.targetList)
api.get('/rates', rateController.list)
api.get('/rates/:uid', rateController.userList)
api.put('/rates/:uid', rateController.update)
api.delete('/rates/:uid', rateController.delete)
api.get('/rateChecks' , rateController.checkAvailable)

/**
 * 즐겨찾기 관리
 */
api.post('/favorites', favoriteController.create)
api.get('/favorites/:userUid', favoriteController.userList)
/**
 * 유저 관련 컨트롤러
 */
api.post('/users', userController.create)
api.get('/users', userController.list)
api.get('/users/:uid', userController.read)
api.put('/users/:uid', userController.update)
api.delete('/users/:uid', userController.delete)
api.post('/users/bulkDelete', userController.bulkDelete)

api.post('/cars', carController.create)
api.get('/cars', carController.list)
api.get('/cars/:uid', carController.read)
api.put('/cars/:uid', carController.update)
api.delete('/cars/:uid', carController.delete)
api.put('/mainCars', carController.isMain)
api.get('/carLists/:userUid', carController.carList)

api.post('/cards', cardController.create)
api.get('/cards', cardController.list)
api.get('/cards/:uid', cardController.read)
api.put('/cards/:uid', cardController.update)
api.delete('/cards/:uid', cardController.delete)
api.put('/mainCards', cardController.isMain)
api.get('/cardLists/:userUid', cardController.cardList)

api.get('/discountTickets', discountTicketController.list)
api.get('/discountTickets/:uid', discountTicketController.read)

api.get('/points', pointLogController.list)
api.get('/points/:uid', pointLogController.read)
api.get('/pointLogs/:userUid', pointLogController.userList)

api.post('/payLogs', payLogController.create)
api.get('/payLogs', payLogController.list)
api.get('/payLogs/:uid', payLogController.read)
api.put('/payLogs/:uid', payLogController.update)

api.get('/coupons', couponController.list)
api.get('/coupons/:uid', couponController.read)

api.get('/couponLogs', couponLogController.list)
api.get('/couponLogs/:uid', couponLogController.read)

api.get('/reviewTemplates', reviewTemplateController.list)
api.get('/reviewTemplates/:uid', reviewTemplateController.read)

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

module.exports = api
