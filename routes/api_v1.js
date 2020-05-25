'use strict'
const response = require('../libs/response')
const Router = require('koa-router')
const codes = require('../configs/codes.json')
const api = new Router()
const adminController = require('../controllers/admin')
const complexController = require('../controllers/complex')
const doorController = require('../controllers/door')
const tagController = require('../controllers/tag')
const userController = require('../controllers/user')
const auth = require('../libs/auth')

/**
 * 관리자 계정 인증
 */
api.post('/admin/login', adminController.login)
api.get('/admin/logout', adminController.logout)
api.get('/admin/check', adminController.check)
api.get('/admin/unique/:id', adminController.checkUniqueId) //아이디중복체크

api.get('/admin', auth.isAdminLoggedIn, adminController.read)
api.put('/admin', auth.isAdminLoggedIn, adminController.update)
api.put('/admin/password', auth.isAdminLoggedIn, adminController.changePassword) //비밀번호변경

/**
 * 단지/건물 관리
 */
api.post('/complexes', auth.isAdminLoggedIn, complexController.create)
api.get('/complexes', auth.isAdminLoggedIn, complexController.list)
api.get('/complexes/:uid', auth.isAdminLoggedIn, complexController.read)
api.put('/complexes/:uid', auth.isAdminLoggedIn, complexController.update)
api.delete('/complexes/:uid', auth.isAdminLoggedIn, complexController.delete)
api.post('/complexes/bulkDelete', auth.isAdminLoggedIn, complexController.bulkDelete)

/**
 * 출입문관리
 */
api.post('/doors', auth.isAdminLoggedIn, doorController.create)
api.get('/doors', auth.isAdminLoggedIn, doorController.list)
api.get('/doors/:uid', auth.isAdminLoggedIn, doorController.read)
api.put('/doors/:uid', auth.isAdminLoggedIn, doorController.update)
api.delete('/doors/:uid', auth.isAdminLoggedIn, doorController.delete)
api.post('/doors/bulkDelete', auth.isAdminLoggedIn, doorController.bulkDelete)

/**
 * 태그
 */
api.post('/tags', auth.isAdminLoggedIn, tagController.create)
api.get('/tags', auth.isAdminLoggedIn, tagController.list)
api.put('/tags/:uid', auth.isAdminLoggedIn, tagController.update)
api.delete('/tags/:uid', auth.isAdminLoggedIn, tagController.delete)
api.post('/tags/bulkDelete', auth.isAdminLoggedIn, tagController.bulkDelete)

/**
 * 사용자 관리
 */
api.get('/complex/users', auth.isAdminLoggedIn, complexController.userList)
api.post('/complex/users', auth.isAdminLoggedIn, complexController.createUser)
api.put('/complex/users/:uid', auth.isAdminLoggedIn, complexController.updateUser)
api.post('/complex/users/bulkCreate', auth.isAdminLoggedIn, complexController.bulkCreateUser)
api.post('/complex/users/bulkDelete', auth.isAdminLoggedIn, complexController.bulkDeleteUser)

/**
 * 사용자측 API
 */
api.post('/user/sendAuthCode', userController.sendAuthCode)
api.post('/user/verifyAuthCode', userController.verifyAuthCode)

api.get('/user/search/complexes', auth.isUserLoggedIn, userController.searchComplexes)
api.get('/user/belong/complexes', auth.isUserLoggedIn, userController.getComplexes)
api.post('/user/belong/complexes', auth.isUserLoggedIn, userController.addComplexes)
api.get('/user/doors', auth.isUserLoggedIn, userController.getDoors)

api.get('/codes', async function (ctx) {
    response.send(ctx, codes)
})


api.post('/user/open/door', auth.isUserLoggedIn, userController.openDoor)


module.exports = api
