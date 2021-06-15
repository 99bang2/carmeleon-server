'use strict'
const Router = require('koa-router')
const api = new Router()
const middleware                = require('../middleware')
const controller                = require('../controllers/admin')
const commonController          = require('../controllers/common')
/**
 * POST: Insert, GET: Read, PUT: UPDATE, DELETE: DELETE
 */

api.post('/login', controller.account.login)
api.get('/logout', controller.account.logout)
api.get('/check', controller.account.check)
/**
 * 관리자 관리
 */
api.post('/accounts', middleware.auth.isAdminLoggedIn, controller.account.create)
api.get('/accounts', middleware.auth.isAdminLoggedIn, controller.account.list)
api.get('/accounts/:uid', middleware.auth.isAdminLoggedIn, controller.account.read)
api.put('/accounts/:uid', middleware.auth.isAdminLoggedIn, controller.account.update)
api.delete('/accounts/:uid', middleware.auth.isAdminLoggedIn, controller.account.delete)
api.post('/accounts/bulkDelete', middleware.auth.isAdminLoggedIn, controller.account.bulkDelete)//복수삭제
api.put('/accounts/changePassword/:uid', middleware.auth.isAdminLoggedIn, controller.account.changePassword)// 비밀번호 변경
api.get('/account/unique/:id', middleware.auth.isAdminLoggedIn, controller.account.checkUniqueId)
/**
 * 공지사항 관리
 */
api.post('/notices', middleware.auth.isAdminLoggedIn, controller.notice.create)
api.get('/notices', middleware.auth.isAdminLoggedIn, controller.notice.list)
api.get('/notices/:uid', middleware.auth.isAdminLoggedIn, controller.notice.read)
api.put('/notices/:uid', middleware.auth.isAdminLoggedIn, controller.notice.update)
api.delete('/notices/:uid', middleware.auth.isAdminLoggedIn, controller.notice.delete)
api.post('/notices/bulkDelete', middleware.auth.isAdminLoggedIn, controller.notice.bulkDelete) //복수삭제

/**
 * 문의사항 관리
 */
api.get('/questions', middleware.auth.isAdminLoggedIn, controller.question.list)
api.get('/questions/:uid', middleware.auth.isAdminLoggedIn, controller.question.read)
api.delete('/questions/:uid', middleware.auth.isAdminLoggedIn, controller.question.delete)
api.post('/questions/bulkDelete', middleware.auth.isAdminLoggedIn, controller.question.bulkDelete) //복수삭제

/**
 * 이벤트 관리
 */
api.post('/events', middleware.auth.isAdminLoggedIn, controller.event.create)
api.get('/events', middleware.auth.isAdminLoggedIn, controller.event.list)
api.get('/events/:uid', middleware.auth.isAdminLoggedIn, controller.event.read)
api.put('/events/:uid', middleware.auth.isAdminLoggedIn, controller.event.update)
api.delete('/events/:uid', middleware.auth.isAdminLoggedIn, controller.event.delete)
api.post('/events/bulkDelete', middleware.auth.isAdminLoggedIn, controller.event.bulkDelete) //복수삭제

/**
 * 팝업 관리
 */
api.post('/popups', middleware.auth.isAdminLoggedIn, controller.popup.create)
api.get('/popups', middleware.auth.isAdminLoggedIn, controller.popup.list)
api.get('/popups/:uid', middleware.auth.isAdminLoggedIn, controller.popup.read)
api.put('/popups/:uid', middleware.auth.isAdminLoggedIn, controller.popup.update)
api.delete('/popups/:uid', middleware.auth.isAdminLoggedIn, controller.popup.delete)
api.post('/popups/bulkDelete', middleware.auth.isAdminLoggedIn, controller.popup.bulkDelete) //복수삭제

/**
 * 주차장 관리
 */
api.post('/parkings', middleware.auth.isAdminLoggedIn, controller.parkingSite.create)
api.get('/parkings', middleware.auth.isAdminLoggedIn, controller.parkingSite.list)
api.get('/parkings/:uid', middleware.auth.isAdminLoggedIn, controller.parkingSite.read)
api.put('/parkings/:uid', middleware.auth.isAdminLoggedIn, controller.parkingSite.update)
api.delete('/parkings/:uid', middleware.auth.isAdminLoggedIn, controller.parkingSite.delete)
api.post('/parkings/bulkDelete', middleware.auth.isAdminLoggedIn, controller.parkingSite.bulkDelete)//복수삭제

/**
 * 세차장 관리
 */
api.post('/carWashes', middleware.auth.isAdminLoggedIn, controller.carWash.create)
api.get('/carWashes', middleware.auth.isAdminLoggedIn, controller.carWash.list)
api.get('/carWashes/:uid', middleware.auth.isAdminLoggedIn, controller.carWash.read)
api.put('/carWashes/:uid', middleware.auth.isAdminLoggedIn, controller.carWash.update)
api.delete('/carWashes/:uid', middleware.auth.isAdminLoggedIn, controller.carWash.delete)
api.post('/carWashes/bulkDelete', middleware.auth.isAdminLoggedIn, controller.carWash.bulkDelete)//복수삭제
/**
 * 주유소 관리
 */
api.post('/gasStations', middleware.auth.isAdminLoggedIn, controller.gasStation.create)
api.get('/gasStations', middleware.auth.isAdminLoggedIn, controller.gasStation.list)
api.get('/gasStations/:uid', middleware.auth.isAdminLoggedIn, controller.gasStation.read)
api.put('/gasStations/:uid', middleware.auth.isAdminLoggedIn, controller.gasStation.update)
api.delete('/gasStations/:uid', middleware.auth.isAdminLoggedIn, controller.gasStation.delete)
api.post('/gasStations/bulkDelete', middleware.auth.isAdminLoggedIn, controller.gasStation.bulkDelete)//복수삭제
/**
 * 전기차 충전소 관리
 */
api.post('/evCharges', middleware.auth.isAdminLoggedIn, controller.evCharge.create)
api.get('/evCharges', middleware.auth.isAdminLoggedIn, controller.evCharge.list)
api.get('/evCharges/:uid', middleware.auth.isAdminLoggedIn, controller.evCharge.read)
api.put('/evCharges/:uid', middleware.auth.isAdminLoggedIn, controller.evCharge.update)
api.delete('/evCharges/:uid', middleware.auth.isAdminLoggedIn, controller.evCharge.delete)
api.post('/evCharges/bulkDelete', middleware.auth.isAdminLoggedIn, controller.evCharge.bulkDelete)//복수삭제

/**
 * 전기차 충전소 관리(Main)
 */
api.post('/evChargeStations', middleware.auth.isAdminLoggedIn, controller.evChargeStation.create)
api.get('/evChargeStations', middleware.auth.isAdminLoggedIn, controller.evChargeStation.list)
api.get('/evChargeStations/:uid', middleware.auth.isAdminLoggedIn, controller.evChargeStation.read)
api.put('/evChargeStations/:uid', middleware.auth.isAdminLoggedIn, controller.evChargeStation.update)
api.delete('/evChargeStations/:uid', middleware.auth.isAdminLoggedIn, controller.evChargeStation.delete)
api.post('/evChargeStations/bulkDelete', middleware.auth.isAdminLoggedIn, controller.evChargeStation.bulkDelete)//복수삭제

/**
 * 리뷰 관리
 */
api.get('/rates/:targetType/:targetUid', middleware.auth.isAdminLoggedIn, middleware.common.isAvailableTarget, controller.rate.targetList)
api.get('/rates/:uid', middleware.auth.isAdminLoggedIn, controller.rate.userList)
api.post('/rates/bulkDelete', middleware.auth.isAdminLoggedIn, controller.rate.bulkDelete)
/**
 * 즐겨찾기 관리
 */
api.get('/favorites/:userUid', middleware.auth.isAdminLoggedIn, controller.favorite.userList)
api.delete('/favorites/:uid', middleware.auth.isAdminLoggedIn, controller.favorite.delete)

/**
 * 포인트 상품 관리
 */
api.post('/pointProducts', middleware.auth.isAdminLoggedIn, controller.pointProduct.create)
api.get('/pointProducts', middleware.auth.isAdminLoggedIn, controller.pointProduct.list)
api.get('/pointProducts/:uid', middleware.auth.isAdminLoggedIn, controller.pointProduct.read)
api.put('/pointProducts/:uid', middleware.auth.isAdminLoggedIn, controller.pointProduct.update)
api.delete('/pointProducts/:uid', middleware.auth.isAdminLoggedIn, controller.pointProduct.delete)
api.post('/pointProducts/bulkDelete', middleware.auth.isAdminLoggedIn, controller.pointProduct.bulkDelete)

api.get('/pointOrders', middleware.auth.isAdminLoggedIn, controller.pointOrder.list)
api.put('/pointOrders/:uid', middleware.auth.isAdminLoggedIn, controller.pointOrder.update)
/**
 * 유저 관련 컨트롤러
 */
api.post('/users', middleware.auth.isAdminLoggedIn, controller.user.create)
api.get('/users', middleware.auth.isAdminLoggedIn, controller.user.list)
api.get('/users/:uid', middleware.auth.isAdminLoggedIn, controller.user.read)
api.put('/users/:uid', middleware.auth.isAdminLoggedIn, controller.user.update)
api.delete('/users/:uid', middleware.auth.isAdminLoggedIn, controller.user.delete)
api.post('/users/bulkDelete', middleware.auth.isAdminLoggedIn, controller.user.bulkDelete)

//유저 정보 조회
api.get('/userCars/:userUid', middleware.auth.isAdminLoggedIn, controller.user.carList)
api.get('/userCards/:userUid', middleware.auth.isAdminLoggedIn, controller.user.cardList)
api.get('/userPointLogs/:userUid', middleware.auth.isAdminLoggedIn, controller.user.pointLogList)
api.get('/userPayLogs/:userUid', middleware.auth.isAdminLoggedIn, controller.payLog.userPayLogs)

/**
 * 할인권 관리
 */
api.post('/discountTickets', middleware.auth.isAdminLoggedIn, controller.discountTicket.create)
api.get('/discountTickets', middleware.auth.isAdminLoggedIn, controller.discountTicket.list)
api.get('/discountTickets/:uid', middleware.auth.isAdminLoggedIn, controller.discountTicket.read)
api.put('/discountTickets/:uid', middleware.auth.isAdminLoggedIn, controller.discountTicket.update)
api.delete('/discountTickets/:uid', middleware.auth.isAdminLoggedIn, controller.discountTicket.delete)
api.post('/discountTickets/addDiscount', middleware.auth.isAdminLoggedIn, controller.discountTicket.addDiscount)

/**
 * 이용내역 관리
 */
api.get('/payLogs', middleware.auth.isAdminLoggedIn, controller.payLog.list) // *

/**
 * 푸쉬 관리
 */
api.post('/pushes', middleware.auth.isAdminLoggedIn, controller.push.create)
api.get('/pushes', middleware.auth.isAdminLoggedIn, controller.push.list)
api.get('/pushes/:uid', middleware.auth.isAdminLoggedIn, controller.push.read)
api.put('/pushes/:uid', middleware.auth.isAdminLoggedIn, controller.push.update)
api.delete('/pushes/:uid', middleware.auth.isAdminLoggedIn, controller.push.delete)
api.post('/pushes/bulkDelete', middleware.auth.isAdminLoggedIn, controller.push.bulkDelete)

//결제 취소 //
api.post('/refundApprove', middleware.auth.isAdminLoggedIn, controller.pg.refundApprove)
api.post('/refundReject', middleware.auth.isAdminLoggedIn, controller.pg.refundReject)

api.get('/allPayLogs', middleware.auth.isAdminLoggedIn, controller.payLog.allList)
api.get('/parkingStatistics', middleware.auth.isAdminLoggedIn, controller.statistics.parkingStatistics)
api.get('/parkingLists', middleware.auth.isAdminLoggedIn, controller.parkingSite.parkingListForAdmin)

/**
 * 세차장 예약
 */
api.get('/carWashes/admin/bookings', middleware.auth.isAdminLoggedIn, controller.carWash.getBookings)
api.get('/carWashes/admin/bookings/:uid', middleware.auth.isAdminLoggedIn, controller.carWash.getBooking)
api.put('/carWashes/admin/bookings/:uid',middleware.auth.isAdminLoggedIn, controller.carWash.putBooking)
/**
 * 세차장 결제 취소
 */
//결제 취소 //
api.post('/bookingRefundApprove', middleware.auth.isAdminLoggedIn, controller.pg.bookingPgPaymentCancelNice)
api.post('/bookingRefundReject', middleware.auth.isAdminLoggedIn, controller.pg.bookingRefundReject)

/**
 * 버전 관리
 */
api.get('/versions', middleware.auth.isAdminLoggedIn, controller.version.list)
api.put('/versions/:os', middleware.auth.isAdminLoggedIn, controller.version.update)

/**
 * 키 관리
 */
api.post('/keys', middleware.auth.isAdminLoggedIn, controller.config.create)
api.get('/keys', middleware.auth.isAdminLoggedIn, controller.config.list)
api.put('/keys/:uid', middleware.auth.isAdminLoggedIn, controller.config.update)
api.delete('/keys/:uid', middleware.auth.isAdminLoggedIn, controller.config.delete)
api.post('/keys/bulkDelete', middleware.auth.isAdminLoggedIn, controller.config.bulkDelete)
api.get('/keys/unique/:key', middleware.auth.isAdminLoggedIn, controller.config.checkUniqueKey)


/**
 * ETC
 */
api.post('/searchLocal', commonController.searchLocal)
api.post('/searchList', commonController.searchList)
api.post('/codes', commonController.codes)


module.exports = api
