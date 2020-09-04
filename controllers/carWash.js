const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
    let _ = ctx.request.body
    let carWash = await models.carWash.create(_)
    response.send(ctx, carWash)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let carWash = await models.carWash.search(_, models)
	response.send(ctx, carWash)
}

exports.read = async function (ctx) {
    let {uid} = ctx.params
	let _ = ctx.request.query
    let carWash = await models.carWash.getByUid(ctx, uid, _)
    response.send(ctx, carWash)
}

exports.update = async function (ctx) {
    let {uid} = ctx.params
    let carWash = await models.carWash.getByUid(ctx, uid)
    let _ = ctx.request.body
    Object.assign(carWash, _)
    await carWash.save()
    response.send(ctx, carWash)
}

exports.delete = async function (ctx) {
    let {uid} = ctx.params
    let carWash = await models.carWash.getByUid(ctx, uid)
    await carWash.destroy()
    response.send(ctx, carWash)
}

exports.bulkDelete = async function (ctx) {
    let _ = ctx.request.body
    let deleteResult = await models.carWash.destroy({
        where: {
            uid: _.uids
        }
    })
    response.send(ctx, deleteResult)
}

exports.userList = async function (ctx) {
	let _ = ctx.request.query
	let carWash = await models.carWash.userSearch(_, models)
	response.send(ctx, carWash)
}
