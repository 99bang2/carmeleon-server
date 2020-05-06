'use strict'

const koa = require('koa')
const Router = require('koa-router')
const koaBody = require('koa-body')
const cors = require('koa2-cors')
const consola = require('consola')
const app = new koa()
const router = new Router()
const apiV1Router = require('./routes/api_v1')
const models = require('./models')
const response = require('./libs/response')
const env = process.env.NODE_ENV || 'development'
const config = require(__dirname + '/configs/config.json')[env]

router.use('/api', response.res, apiV1Router.routes())
app.use(cors())
app.use(koaBody())
app.use(router.routes()).use(router.allowedMethods())

models.sequelize.sync().then(function () {
	app.listen(config.listenPort, async () => {
		consola.ready({
			message: `Server listening on ${config.listenPort}`,
			badge: true
		})
		let superAdmin = await models.admin.getById('admin', models)
		if(!superAdmin) {
			models.admin.create({
				id: 'admin',
				password: 'admin',
				name: '최고관리자',
				isActive: true,
				grade: 'SUPER'
			})
		}
	})
})



