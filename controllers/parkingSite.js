const models = require('../models')
const response = require('../libs/response')
const imageUpload = require('../libs/imageUpload')
const common = require('../libs/common')
const dir = './uploads/site/'
const folder = 'site/'

exports.create = async function (ctx) {
    let _ = ctx.request.body
	_.paymentTag = common.makeArray(_.paymentTag)
	_.brandTag = common.makeArray(_.brandTag)
	_.productTag = common.makeArray(_.productTag)
	_.optionTag = common.makeArray(_.optionTag)
	_.carTag = common.makeArray(_.carTag)
	_.picture = common.makeArray(_.picture)
    let parkingSite = await models.parkingSite.create(_)
    response.send(ctx, parkingSite)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let parkingSite = await models.parkingSite.search(_, models)
    response.send(ctx, parkingSite)
}

exports.read = async function (ctx) {
    let {uid} = ctx.params
    let parkingSite = await models.parkingSite.getByUid(ctx, uid)
    response.send(ctx, parkingSite)
}

exports.update = async function (ctx) {
    let {uid} = ctx.params
    let parkingSite = await models.parkingSite.getByUid(ctx, uid)
    let _ = ctx.request.body
    Object.assign(parkingSite, _)
    await parkingSite.save()
    response.send(ctx, parkingSite)
}

exports.delete = async function (ctx) {
    let {uid} = ctx.params
    let parkingSite = await models.parkingSite.getByUid(ctx, uid)
    await parkingSite.destroy()
    response.send(ctx, parkingSite)
}

exports.bulkDelete = async function (ctx) {
    let _ = ctx.request.body
    let deleteResult = await models.parkingSite.destroy({
        where: {
            uid: _.uids
        }
    })
    response.send(ctx, deleteResult)
}

exports.searchList = async function (ctx) {
	let _ = ctx.request.query
	let parkingSite = await models.parkingSite.search(_, models)
	response.send(ctx, parkingSite)
}
