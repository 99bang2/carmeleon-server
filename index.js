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
const fs = require('fs');

router.use('/api', response.res, apiV1Router.routes())
app.use(cors())
app.use(koaBody({
	formidable: {
		uploadDir: './uploads',
		//maxFileSize:200 * 1024 * 1024, //Upload file size
		keepExtensions: true //  Extensions to save images
	},
	multipart: true,
}))
app.use(router.routes()).use(router.allowedMethods())
global.imageUpload = function imageUpload(path, dir, imageName){
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir)
	}
	let newPath = dir + imageName
	fs.renameSync(path, newPath)
	return newPath
}
models.sequelize.sync().then(async function () {
	let superAdmin = await models.account.findOne({
		where: {
			id: 'admin'
		}
	})
	if(!superAdmin) {
		models.account.create({
			id: 'admin',
			password: 'admin',
			name: '관리자',
			grade: 0
		})
	}
	app.listen(config.listenPort, async () => {
		consola.ready({
			message: `Server listening on ${config.listenPort}`,
			badge: true
		})
	})
})



