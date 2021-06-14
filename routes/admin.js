'use strict'
const Router = require('koa-router')
const api = new Router()

const commonController          = require('../controllers/common')

const accountController         = require('../controllers/admin/account')
const noticeController          = require('../controllers/admin/notice')
const eventController           = require('../controllers/admin/event')
const popupController           = require('../controllers/admin/popup')
const pointProductController    = require('../controllers/admin/pointProduct')
const pointOrderController      = require('../controllers/admin/pointOrder')
const parkingController         = require('../controllers/admin/parkingSite')
const evChargeStationController = require('../controllers/admin/evChargeStation')
const gasStationController      = require('../controllers/admin/gasStation')
const carWashController         = require('../controllers/admin/carWash')
const rateController            = require('../controllers/admin/rate')
const payLogController          = require('../controllers/admin/payLog')
const pgController              = require('../controllers/admin/pg')

const evChargeController        = require('../controllers/evCharge')
const carController             = require('../controllers/car')
const cardController            = require('../controllers/card')
const discountTicketController  = require('../controllers/discountTicket')
const pointLogController        = require('../controllers/point')
const couponController          = require('../controllers/coupon')
const couponLogController       = require('../controllers/couponLog')
const questionController        = require('../controllers/question')
const pushController            = require('../controllers/push')
const tutorialController        = require('../controllers/tutorial')
const statisticController       = require('../controllers/admin/statistics')
const versionController         = require('../controllers/admin/version')
const configController         = require('../controllers/admin/config')

const controller                = require('../controllers/admin')
const auth                      = require('../middleware/auth')

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
 * 팝업 관리
 */
api.post('/popups', auth.isAdminLoggedIn, popupController.create)
api.get('/popups', auth.isAdminLoggedIn, popupController.list)
api.get('/popups/:uid', auth.isAdminLoggedIn, popupController.read)
api.put('/popups/:uid', auth.isAdminLoggedIn, popupController.update)
api.delete('/popups/:uid', auth.isAdminLoggedIn, popupController.delete)
api.post('/popups/bulkDelete', auth.isAdminLoggedIn, popupController.bulkDelete) //복수삭제

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
api.get('/favorites/:userUid', auth.isAdminLoggedIn, controller.favorite.userList)
api.delete('/favorites/:uid', auth.isAdminLoggedIn, controller.favorite.delete)

/**
 * 포인트 상품 관리
 */
api.post('/pointProducts', auth.isAdminLoggedIn, pointProductController.create)
api.get('/pointProducts', auth.isAdminLoggedIn, pointProductController.list)
api.get('/pointProducts/:uid', auth.isAdminLoggedIn, pointProductController.read)
api.put('/pointProducts/:uid', auth.isAdminLoggedIn, pointProductController.update)
api.delete('/pointProducts/:uid', auth.isAdminLoggedIn, pointProductController.delete)
api.post('/pointProducts/bulkDelete', auth.isAdminLoggedIn, pointProductController.bulkDelete)

api.get('/pointOrders', auth.isAdminLoggedIn, pointOrderController.list)
api.put('/pointOrders/:uid', auth.isAdminLoggedIn, pointOrderController.update)
/**
 * 유저 관련 컨트롤러
 */
api.post('/users', auth.isAdminLoggedIn, controller.user.create)
api.get('/users', auth.isAdminLoggedIn, controller.user.list)
api.get('/users/:uid', auth.isAdminLoggedIn, controller.user.read)
api.put('/users/:uid', auth.isAdminLoggedIn, controller.user.update)
api.delete('/users/:uid', auth.isAdminLoggedIn, controller.user.delete)
api.post('/users/bulkDelete', auth.isAdminLoggedIn, controller.user.bulkDelete)

//유저 정보 조회
api.get('/userCars/:userUid', auth.isAdminLoggedIn, carController.userList)
api.get('/userCards/:userUid', auth.isAdminLoggedIn, cardController.userList)
api.get('/userPointLogs/:userUid', auth.isAdminLoggedIn, pointLogController.userListForAdmin)
api.get('/userPayLogs/:userUid', auth.isAdminLoggedIn, payLogController.userPayLogs)

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
// api.post('/payLogs', auth.isAdminLoggedIn, payLogController.create)
api.get('/payLogs', auth.isAdminLoggedIn, payLogController.list) // *
// api.get('/payLogs/:uid', auth.isAdminLoggedIn, payLogController.read)
// api.put('/payLogs/:uid', auth.isAdminLoggedIn, payLogController.update)
// api.delete('/payLogs/:uid', auth.isAdminLoggedIn, payLogController.delete)

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
api.post('/refundApprove', auth.isAdminLoggedIn, pgController.refundApprove)
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

api.get('/allPayLogs', auth.isAdminLoggedIn, payLogController.allList)
api.get('/parkingStatistics', auth.isAdminLoggedIn, statisticController.parkingStatistics)
api.get('/parkingLists', auth.isAdminLoggedIn, parkingController.parkingListForAdmin)

/**
 * 세차장 예약
 */
api.get('/carWashes/admin/bookings', auth.isAdminLoggedIn, carWashController.getBookings)
api.get('/carWashes/admin/bookings/:uid', auth.isAdminLoggedIn, carWashController.getBooking)
api.put('/carWashes/admin/bookings/:uid',auth.isAdminLoggedIn, carWashController.putBooking)
/**
 * 세차장 결제 취소
 */
//결제 취소 //
api.post('/bookingRefundApprove', auth.isAdminLoggedIn, pgController.bookingPgPaymentCancelNice)
api.post('/bookingRefundReject', auth.isAdminLoggedIn, pgController.bookingRefundReject)

/**
 * 버전 관리
 */
api.get('/versions', auth.isAdminLoggedIn, versionController.list)
api.put('/versions/:os', auth.isAdminLoggedIn, versionController.update)

/**
 * 키 관리
 */
api.post('/keys', auth.isAdminLoggedIn, configController.create)
api.get('/keys', auth.isAdminLoggedIn, configController.list)
api.put('/keys/:uid', auth.isAdminLoggedIn, configController.update)
api.delete('/keys/:uid', auth.isAdminLoggedIn, configController.delete)
api.post('/keys/bulkDelete', auth.isAdminLoggedIn, configController.bulkDelete)
api.get('/keys/unique/:key', auth.isAdminLoggedIn, configController.checkUniqueKey)
module.exports = api
