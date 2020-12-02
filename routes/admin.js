'use strict'
const Router = require('koa-router')
const api = new Router()

const commonController = require('../controllers/common')
const accountController = require('../controllers/account')
const userController = require('../controllers/user')
const noticeController = require('../controllers/admin/notice')
const eventController = require('../controllers/admin/event')

const parkingController = require('../controllers/admin/parkingSite')
const evChargeStationController = require('../controllers/admin/evChargeStation')
const gasStationController = require('../controllers/admin/gasStation')
const carWashController = require('../controllers/carWash')
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
const questionController = require('../controllers/question')
const pushController = require('../controllers/push')
const pgController = require('../controllers/pg')
const tutorialController = require('../controllers/tutorial')
const auth = require('../libs/auth')

/**
 * POST: Insert, GET: Read, PUT: UPDATE, DELETE: DELETE
 */

api.post('/login', accountController.login)
api.get('/logout', accountController.logout)
api.get('/check', accountController.check)
/**
 * 관리자 관리
 */
api.post('/accounts', auth.isAdminLoggedIn, accountController.create)
api.get('/accounts', auth.isAdminLoggedIn, accountController.list)
api.get('/accounts/:uid', auth.isAdminLoggedIn, accountController.read)
api.put('/accounts/:uid', auth.isAdminLoggedIn, accountController.update)
api.delete('/accounts/:uid', auth.isAdminLoggedIn, accountController.delete)
api.post('/accounts/bulkDelete', auth.isAdminLoggedIn, accountController.bulkDelete)//복수삭제
api.put('/accounts/changePassword/:uid', auth.isAdminLoggedIn, accountController.changePassword)// 비밀번호 변경
api.get('/account/unique/:id', auth.isAdminLoggedIn, accountController.checkUniqueId)
/**
 * 공지사항 관리
 */
api.post('/notices', auth.isAdminLoggedIn, noticeController.create)
api.get('/notices', auth.isAdminLoggedIn, noticeController.list)
api.get('/notices/:uid', auth.isAdminLoggedIn, noticeController.read)
api.put('/notices/:uid', auth.isAdminLoggedIn, noticeController.update)
api.delete('/notices/:uid', auth.isAdminLoggedIn, noticeController.delete)
api.post('/notices/bulkDelete', auth.isAdminLoggedIn, noticeController.bulkDelete) //복수삭제

/**
 * 문의사항 관리
 */
api.get('/questions', auth.isAdminLoggedIn, questionController.list)
api.get('/questions/:uid', auth.isAdminLoggedIn, questionController.read)
api.delete('/questions/:uid', auth.isAdminLoggedIn, questionController.delete)
api.post('/questions/bulkDelete', auth.isAdminLoggedIn, questionController.bulkDelete) //복수삭제

/**
 * 이벤트 관리
 */
api.post('/events', auth.isAdminLoggedIn, eventController.create)
api.get('/events', auth.isAdminLoggedIn, eventController.list)
api.get('/events/:uid', auth.isAdminLoggedIn, eventController.read)
api.put('/events/:uid', auth.isAdminLoggedIn, eventController.update)
api.delete('/events/:uid', auth.isAdminLoggedIn, eventController.delete)
api.post('/events/bulkDelete', auth.isAdminLoggedIn, eventController.bulkDelete) //복수삭제
/**
 * 주차장 관리
 */
api.post('/parkings', auth.isAdminLoggedIn, parkingController.create)
api.get('/parkings', auth.isAdminLoggedIn, parkingController.list)
api.get('/parkings/:uid', auth.isAdminLoggedIn, parkingController.read)
api.put('/parkings/:uid', auth.isAdminLoggedIn, parkingController.update)
api.delete('/parkings/:uid', auth.isAdminLoggedIn, parkingController.delete)
api.post('/parkings/bulkDelete', auth.isAdminLoggedIn, parkingController.bulkDelete)//복수삭제

/**
 * 세차장 관리
 */
api.post('/carWashes', auth.isAdminLoggedIn, carWashController.create)
api.get('/carWashes', auth.isAdminLoggedIn, carWashController.list)
api.get('/carWashes/:uid', auth.isAdminLoggedIn, carWashController.read)
api.put('/carWashes/:uid', auth.isAdminLoggedIn, carWashController.update)
api.delete('/carWashes/:uid', auth.isAdminLoggedIn, carWashController.delete)
api.post('/carWashes/bulkDelete', auth.isAdminLoggedIn, carWashController.bulkDelete)//복수삭제
/**
 * 주유소 관리
 */
api.post('/gasStations', auth.isAdminLoggedIn, gasStationController.create)
api.get('/gasStations', auth.isAdminLoggedIn, gasStationController.list)
api.get('/gasStations/:uid', auth.isAdminLoggedIn, gasStationController.read)
api.put('/gasStations/:uid', auth.isAdminLoggedIn, gasStationController.update)
api.delete('/gasStations/:uid', auth.isAdminLoggedIn, gasStationController.delete)
api.post('/gasStations/bulkDelete', auth.isAdminLoggedIn, gasStationController.bulkDelete)//복수삭제
/**
 * 전기차 충전소 관리
 */
api.post('/evCharges', auth.isAdminLoggedIn, evChargeController.create)
api.get('/evCharges', auth.isAdminLoggedIn, evChargeController.list)
api.get('/evCharges/:uid', auth.isAdminLoggedIn, evChargeController.read)
api.put('/evCharges/:uid', auth.isAdminLoggedIn, evChargeController.update)
api.delete('/evCharges/:uid', auth.isAdminLoggedIn, evChargeController.delete)
api.post('/evCharges/bulkDelete', auth.isAdminLoggedIn, evChargeController.bulkDelete)//복수삭제
/**
 * 리뷰 관리
 */
api.post('/rates/:targetType/:targetUid', auth.isAdminLoggedIn, commonController.isAvailableTarget, rateController.create)
api.get('/rates/:targetType/:targetUid', auth.isAdminLoggedIn, commonController.isAvailableTarget, rateController.targetList)
api.get('/rates/:uid', auth.isAdminLoggedIn, rateController.userList)
api.put('/rates/:uid', auth.isAdminLoggedIn, rateController.update)
api.delete('/rates/:uid', auth.isAdminLoggedIn, rateController.delete)
api.post('/rates/bulkDelete', auth.isAdminLoggedIn, rateController.bulkDelete)
/**
 * 즐겨찾기 관리
 */
api.get('/favorites/:userUid', auth.isAdminLoggedIn, favoriteController.userList)
api.delete('/favorites/:uid', auth.isAdminLoggedIn, favoriteController.delete)

/**
 * 포인트 상품 관리
 */
api.post('/pointProducts', auth.isAdminLoggedIn, pointProductController.create)
api.get('/pointProducts', auth.isAdminLoggedIn, pointProductController.list)
api.get('/pointProducts/:uid', auth.isAdminLoggedIn, pointProductController.read)
api.put('/pointProducts/:uid', auth.isAdminLoggedIn, pointProductController.update)
api.post('/pointProducts/addPoint',auth.isAdminLoggedIn,  pointProductController.addPoint)
api.delete('/pointProducts/:uid', auth.isAdminLoggedIn, pointProductController.delete)
api.post('/pointProducts/bulkDelete', auth.isAdminLoggedIn, pointProductController.bulkDelete)

/**
 * 유저 관련 컨트롤러
 */
api.post('/users', auth.isAdminLoggedIn, userController.create)
api.get('/users', auth.isAdminLoggedIn, userController.list)
api.get('/users/:uid', auth.isAdminLoggedIn, userController.read)
api.put('/users/:uid', auth.isAdminLoggedIn, userController.update)
api.delete('/users/:uid', auth.isAdminLoggedIn, userController.delete)
api.post('/users/bulkDelete', auth.isAdminLoggedIn, userController.bulkDelete)
//유저 정보 조회
api.get('/userCars/:userUid', auth.isAdminLoggedIn, carController.userList)
api.get('/userCards/:userUid', auth.isAdminLoggedIn, cardController.userList)
api.get('/userFavorites/:userUid', auth.isAdminLoggedIn, favoriteController.userList)
api.get('/userPointLogs/:userUid', auth.isAdminLoggedIn, pointLogController.userListForAdmin)
api.get('/userPayLogs/:userUid', auth.isAdminLoggedIn, payLogController.userListForAdmin)
/**
 * 할인권 관리
 */
api.post('/discountTickets', auth.isAdminLoggedIn, discountTicketController.create)
api.get('/discountTickets', auth.isAdminLoggedIn, discountTicketController.list)
api.get('/discountTickets/:uid', auth.isAdminLoggedIn, discountTicketController.read)
api.put('/discountTickets/:uid', auth.isAdminLoggedIn, discountTicketController.update)
api.delete('/discountTickets/:uid', auth.isAdminLoggedIn, discountTicketController.delete)
//상품 할인
api.post('/discountTickets/addDiscount', auth.isAdminLoggedIn, discountTicketController.addDiscount)
/**
 * 이용내역 관리
 */
api.post('/payLogs', auth.isAdminLoggedIn, payLogController.create)
api.get('/payLogs', auth.isAdminLoggedIn, payLogController.list)
api.get('/payLogs/:uid', auth.isAdminLoggedIn, payLogController.read)
api.put('/payLogs/:uid', auth.isAdminLoggedIn, payLogController.update)
api.delete('/payLogs/:uid', auth.isAdminLoggedIn, payLogController.delete)
/**
 * 쿠폰 관리
 */
api.post('/coupons', auth.isAdminLoggedIn, couponController.create)
api.get('/coupons', auth.isAdminLoggedIn, couponController.list)
api.get('/coupons/:uid', auth.isAdminLoggedIn, couponController.read)
api.put('/coupons/:uid', auth.isAdminLoggedIn, couponController.update)
api.delete('/coupons/:uid', auth.isAdminLoggedIn, couponController.delete)
/**
 * 쿠폰 내역 관리
 */
api.post('/couponLogs', auth.isAdminLoggedIn, couponLogController.create)
api.get('/couponLogs', auth.isAdminLoggedIn, couponLogController.list)
api.get('/couponLogs/:uid', auth.isAdminLoggedIn, couponLogController.read)
api.put('/couponLogs/:uid', auth.isAdminLoggedIn, couponLogController.update)
api.delete('/couponLogs/:uid', auth.isAdminLoggedIn, couponLogController.delete)
/**
 * 튜토리얼
 */
api.post('/tutorials', auth.isAdminLoggedIn, tutorialController.setTutorial)
api.get('/tutorials', auth.isAdminLoggedIn, tutorialController.getTutorial)
//api.put('/tutorials/:uid', tutorialController.setTutorial)

/**
 * 전기차 충전소 관리(Main)
 */
api.post('/evChargeStations', auth.isAdminLoggedIn, evChargeStationController.create)
api.get('/evChargeStations', auth.isAdminLoggedIn, evChargeStationController.list)
api.get('/evChargeStations/:uid', auth.isAdminLoggedIn, evChargeStationController.read)
api.put('/evChargeStations/:uid', auth.isAdminLoggedIn, evChargeStationController.update)
api.delete('/evChargeStations/:uid', auth.isAdminLoggedIn, evChargeStationController.delete)
api.post('/evChargeStations/bulkDelete', auth.isAdminLoggedIn, evChargeStationController.bulkDelete)//복수삭제
/**
 * 푸쉬 관리
 */
api.post('/pushes', auth.isAdminLoggedIn, pushController.create)
api.get('/pushes', auth.isAdminLoggedIn, pushController.list)
api.get('/pushes/:uid', auth.isAdminLoggedIn, pushController.read)
api.put('/pushes/:uid', auth.isAdminLoggedIn, pushController.update)
api.delete('/pushes/:uid', auth.isAdminLoggedIn, pushController.delete)
api.post('/pushes/bulkDelete', auth.isAdminLoggedIn, pushController.bulkDelete)
//결제 취소 //
api.post('/refundApprove', auth.isAdminLoggedIn, pgController.pgPaymentCancelNice)
api.post('/refundReject', auth.isAdminLoggedIn, pgController.refundReject)
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
