const models = require('../models')
const response = require('../libs/response')
const commonController = require('../controllers/common')
const moment = require('moment')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let notice = await models.notice.create(_)
	//add Push Default Data
	_.pushType = 2
	_.sendDate = moment().format('YYYY-MM-DD HH:mm:ss')
	_.status = 0
	_.body = _.content
	await commonController.pushMessage(_)
	response.send(ctx, notice)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let notices = await models.notice.search(_, models)
	response.send(ctx, notices)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let notice = await models.notice.getByUid(ctx, uid, models)
	response.send(ctx, notice)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let notice = await models.notice.getByUid(ctx, uid, models)
	let _ = ctx.request.body
	Object.assign(notice, _)
	await notice.save()
	response.send(ctx, notice)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let notice = await models.notice.getByUid(ctx, uid, models)
	await notice.destroy()
	response.send(ctx, notice)
}

exports.bulkDelete = async function (ctx) {
	let _ = ctx.request.body
	let deleteResult = await models.notice.destroy({
		where: {
			uid: _.uids
		}
	})
	response.send(ctx, deleteResult)
}

exports.userList = async function (ctx) {
	let _ = ctx.request.query
	let notice = await models.notice.userSearch(_, models)
	response.send(ctx, notice)
}
