'use strict'
const response = require('../libs/response')
const Router = require('koa-router')
const codes = require('../configs/codes.json')
const api = new Router()
const exampleController = require('../controllers/example')

/**
 * example
 */
api.post('/complexes', exampleController.create)
api.get('/complexes', exampleController.list)
api.get('/complexes/:uid', exampleController.read)
api.put('/complexes/:uid', exampleController.update)
api.delete('/complexes/:uid', exampleController.delete)

module.exports = api
