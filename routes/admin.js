'use strict'
const Router = require('koa-router')
const api = new Router()

const commonController = require('../controllers/common')
const accountController = require('../controllers/account')
const userController = require('../controllers/user')
const noticeController = require('../controllers/notice')
const eventController = require('../controllers/event')

const parkingController = require('../controllers/parkingSite')
const carWashController = require('../controllers/carWash')
const gasStationController = require('../controllers/gasStation')
const evChargeController = require('../controllers/evCharge')

const rateController = require('../controllers/rate')
const reviewTemplateController = require('../controllers/reviewTemplate')
const pointProductController = require('../controllers/pointProduct')
const carController = require('../controllers/car')
const cardController = require('../controllers/card')
const favoriteController = require('../controllers/favorite')
const discountTicketController = require('../controllers/discountTicket')
const pointLogController = require('../controllers/point')
const payLogController = require('../controllers/payLog')
const couponController = require('../controllers/coupon')
const couponLogController = require('../controllers/couponLog')
const evChargeStationController = require('../controllers/evChargeStation')
const questionController = require('../controllers/question')
const pushController = require('../controllers/push')
const pgController = require('../controllers/pg')
const tutorialController = require('../controllers/tutorial')

/**
 * POST: Insert, GET: Read, PUT: UPDATE, DELETE: DELETE
 */

api.post('/login', accountController.login)
api.get('/logout', accountController.logout)
api.get('/check', accountController.check)
/**
 * 관리자 관리
 */
api.post('/accounts', accountController.create)
api.get('/accounts', accountController.list)
api.get('/accounts/:uid', accountController.read)
api.put('/accounts/:uid', accountController.update)
api.delete('/accounts/:uid', accountController.delete)
api.post('/accounts/bulkDelete', accountController.bulkDelete)//복수삭제
api.put('/accounts/changePassword/:uid', accountController.changePassword)// 비밀번호 변경
api.get('/account/unique/:id', accountController.checkUniqueId)
/**
 * 공지사항 관리
 */
api.post('/notices', noticeController.create)
api.get('/notices', noticeController.list)
api.get('/notices/:uid', noticeController.read)
api.put('/notices/:uid', noticeController.update)
api.delete('/notices/:uid', noticeController.delete)
api.post('/notices/bulkDelete', noticeController.bulkDelete) //복수삭제
api.get('/userNotices', noticeController.userList)
/**
 * 문의사항 관리
 */
api.get('/questions', questionController.list)
api.get('/questions/:uid', questionController.read)
api.delete('/questions/:uid', questionController.delete)
api.post('/questions/bulkDelete', questionController.bulkDelete) //복수삭제

/**
 * 이벤트 관리
 */
api.post('/events', eventController.create)
//api.post('/events', auth.isEitherLoggedIn, eventController.create)
api.get('/events', eventController.list)
api.get('/events/:uid', eventController.read)
api.put('/events/:uid', eventController.update)
api.delete('/events/:uid', eventController.delete)
api.post('/events/bulkDelete', eventController.bulkDelete) //복수삭제
api.get('/userEvents', eventController.userList)
/**
 * 주차장 관리
 */
api.post('/parkings', parkingController.create)
api.get('/parkings', parkingController.list)
api.get('/parkings/:uid', parkingController.read)
api.put('/parkings/:uid', parkingController.update)
api.delete('/parkings/:uid', parkingController.delete)
api.post('/parkings/bulkDelete', parkingController.bulkDelete)//복수삭제

/**
 * 세차장 관리
 */
api.post('/carWashes', carWashController.create)
api.get('/carWashes', carWashController.list)
api.get('/carWashes/:uid', carWashController.read)
api.put('/carWashes/:uid', carWashController.update)
api.delete('/carWashes/:uid', carWashController.delete)
api.post('/carWashes/bulkDelete', carWashController.bulkDelete)//복수삭제
/**
 * 주유소 관리
 */
api.post('/gasStations', gasStationController.create)
api.get('/gasStations', gasStationController.list)
api.get('/gasStations/:uid', gasStationController.read)
api.put('/gasStations/:uid', gasStationController.update)
api.delete('/gasStations/:uid', gasStationController.delete)
api.post('/gasStations/bulkDelete', gasStationController.bulkDelete)//복수삭제
/**
 * 전기차 충전소 관리
 */
api.post('/evCharges', evChargeController.create)
api.get('/evCharges', evChargeController.list)
api.get('/evCharges/:uid', evChargeController.read)
api.put('/evCharges/:uid', evChargeController.update)
api.delete('/evCharges/:uid', evChargeController.delete)
api.post('/evCharges/bulkDelete', evChargeController.bulkDelete)//복수삭제
/**
 * 리뷰 관리
 */
api.post('/rates/:targetType/:targetUid', commonController.isAvailableTarget, rateController.create)
api.get('/rates/:targetType/:targetUid', commonController.isAvailableTarget, rateController.targetList)
api.get('/rates/:uid', rateController.userList)
api.put('/rates/:uid', rateController.update)
api.delete('/rates/:uid', rateController.delete)
api.post('/rates/bulkDelete', rateController.bulkDelete)
/**
 * 즐겨찾기 관리
 */
api.get('/favorites/:userUid', favoriteController.userList)
api.delete('/favorites/:uid', favoriteController.delete)
/**
 * 리뷰 템플릿 관리
 */
api.post('/reviewTemplates', reviewTemplateController.create)
api.get('/reviewTemplates', reviewTemplateController.list)
api.get('/reviewTemplates/:uid', reviewTemplateController.read)
api.put('/reviewTemplates/:uid', reviewTemplateController.update)
api.delete('/reviewTemplates/:uid', reviewTemplateController.delete)
api.post('/reviewTemplates/bulkDelete', reviewTemplateController.bulkDelete)

/**
 * 포인트 상품 관리
 */
api.post('/pointProducts', pointProductController.create)
api.get('/pointProducts', pointProductController.list)
api.get('/pointProducts/:uid', pointProductController.read)
api.put('/pointProducts/:uid', pointProductController.update)
api.post('/pointProducts/addPoint', pointProductController.addPoint)
api.delete('/pointProducts/:uid', pointProductController.delete)
api.post('/pointProducts/bulkDelete', pointProductController.bulkDelete)

/**
 * 유저 관련 컨트롤러
 */
api.post('/users', userController.create)
api.get('/users', userController.list)
api.get('/users/:uid', userController.read)
api.put('/users/:uid', userController.update)
api.delete('/users/:uid', userController.delete)
api.post('/users/bulkDelete', userController.bulkDelete)
//유저 정보 조회
api.get('/userCars/:userUid', carController.userList)
api.get('/userCards/:userUid', cardController.userList)
api.get('/userFavorites/:userUid', favoriteController.userList)
api.get('/userPointLogs/:userUid', pointLogController.userList)
api.get('/userPayLogs/:userUid', payLogController.userList)
/**
 * 할인권 관리
 */
api.post('/discountTickets', discountTicketController.create)
api.get('/discountTickets', discountTicketController.list)
api.get('/discountTickets/:uid', discountTicketController.read)
api.put('/discountTickets/:uid', discountTicketController.update)
api.delete('/discountTickets/:uid', discountTicketController.delete)
//상품 할인
api.post('/discountTickets/addDiscount', discountTicketController.addDiscount)
/**
 * 이용내역 관리
 */
api.post('/payLogs', payLogController.create)
api.get('/payLogs', payLogController.list)
api.get('/payLogs/:uid', payLogController.read)
api.put('/payLogs/:uid', payLogController.update)
api.delete('/payLogs/:uid', payLogController.delete)
/**
 * 쿠폰 관리
 */
api.post('/coupons', couponController.create)
api.get('/coupons', couponController.list)
api.get('/coupons/:uid', couponController.read)
api.put('/coupons/:uid', couponController.update)
api.delete('/coupons/:uid', couponController.delete)
/**
 * 쿠폰 내역 관리
 */
api.post('/couponLogs', couponLogController.create)
api.get('/couponLogs', couponLogController.list)
api.get('/couponLogs/:uid', couponLogController.read)
api.put('/couponLogs/:uid', couponLogController.update)
api.delete('/couponLogs/:uid', couponLogController.delete)
/**
 * 튜토리얼
 */
api.post('/tutorials', tutorialController.setTutorial)
api.get('/tutorials', tutorialController.getTutorial)
//api.put('/tutorials/:uid', tutorialController.setTutorial)
/**
 * 전기차 충전소 관리(Main)
 */
api.post('/evChargeStations', evChargeStationController.create)
api.get('/evChargeStations', evChargeStationController.listAdmin)
api.get('/evChargeStations/:uid', evChargeStationController.read)
api.put('/evChargeStations/:uid', evChargeStationController.update)
api.delete('/evChargeStations/:uid', evChargeStationController.delete)
api.post('/evChargeStations/bulkDelete', evChargeStationController.bulkDelete)//복수삭제
/**
 * 푸쉬 관리
 */
api.post('/pushes', pushController.create)
api.get('/pushes', pushController.list)
api.get('/pushes/:uid', pushController.read)
api.put('/pushes/:uid', pushController.update)
api.delete('/pushes/:uid', pushController.delete)
api.post('/pushes/bulkDelete', pushController.bulkDelete)
//결제 취소 //
api.get('/pg/:uid', pgController.pgPaymentCancelNice)
// api.post('/pg', pgController.pgPaymentCancelNice)
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
