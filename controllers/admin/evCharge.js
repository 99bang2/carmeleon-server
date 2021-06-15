const models = require('../../models')
const response = require('../../libs/response')

exports.create = async function (ctx) {
    let _ = ctx.request.body
    let evCharge = await models.evCharge.create(_)
    response.send(ctx, evCharge)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let evCharge = await models.evCharge.search(_, models)
	response.send(ctx, evCharge)
}

exports.read = async function (ctx) {
    let {uid} = ctx.params
    let evCharge = await models.evCharge.getByUid(ctx, uid)
    response.send(ctx, evCharge)
}

exports.update = async function (ctx) {
    let {uid} = ctx.params
    let evCharge = await models.evCharge.getByUid(ctx, uid)
    let _ = ctx.request.body
    Object.assign(evCharge, _)
    await evCharge.save()
    response.send(ctx, evCharge)
}

exports.delete = async function (ctx) {
    let {uid} = ctx.params
    let evCharge = await models.evCharge.getByUid(ctx, uid)
    await evCharge.destroy()
    response.send(ctx, evCharge)
}

exports.bulkDelete = async function (ctx) {
    let _ = ctx.request.body
    let deleteResult = await models.evCharge.destroy({
        where: {
            uid: _.uids
        }
    })
    response.send(ctx, deleteResult)
}

exports.userList = async function (ctx) {
	let _ = ctx.request.query
	let evCharge = await models.evCharge.userSearch(_, models)
	response.send(ctx, evCharge)
}
