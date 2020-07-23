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
const commonController = require('../controllers/common')

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
api.get('/rates/:uid', rateController.userList)
api.put('/rates/:uid', rateController.update)
api.delete('/rates/:uid', rateController.delete)
/**
 * 즐겨찾기 관리
 */
api.post('/favorites', favoriteController.create)
api.get('/favorites/:uid', favoriteController.userList)
api.put('/favorites/:uid', favoriteController.update)
api.delete('/favorites/:uid', favoriteController.delete)
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
//api.get('/cars/:userUid', carController.userList)
//api.get('/cards/:userUid', cardController.userList)
//api.get('/favorites/:userUid', favoriteController.userList)
//api.get('/pointLogs/:userUid', pointLogController.userList)
//api.get('/payLogs/:userUid', payLogController.userList)

// api.post('/cars', carController.create)
// api.get('/cars', carController.list)
//api.get('/cars/:uid', carController.read)
// api.put('/cars/:uid', carController.update)
// api.delete('/cars/:uid', carController.delete)

api.post('/cards', cardController.create)
api.get('/cards', cardController.list)
api.get('/cards/:uid', cardController.read)
api.put('/cards/:uid', cardController.update)
api.delete('/cards/:uid', cardController.delete)

api.get('/cardLists/:userUid', cardController.cardList)

// api.post('/favorites', favoriteController.create)
// api.get('/favorites', favoriteController.list)
//api.get('/favorites/:uid', favoriteController.read)
// api.put('/favorites/:uid', favoriteController.update)
// api.delete('/favorites/:uid', favoriteController.delete)

// api.post('/points', pointController.create)
// api.get('/points', pointController.list)
//api.get('/points/:uid', pointController.read)
// api.put('/points/:uid', pointController.update)
// api.delete('/points/:uid', pointController.delete)

api.post('/payLogs', payLogController.create)
api.get('/payLogs', payLogController.list)
api.get('/payLogs/:uid', payLogController.read)
api.put('/payLogs/:uid', payLogController.update)
api.delete('/payLogs/:uid', payLogController.delete)

module.exports = api
