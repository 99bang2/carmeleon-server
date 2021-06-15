const models = require('../../models')
const response = require('../../libs/response')

exports.create = async function (ctx) {
    let _ = ctx.request.body
    let discountTicket = await models.discountTicket.create(_)
    response.send(ctx, discountTicket)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let discountTicket = await models.discountTicket.search(_, models)
	response.send(ctx, discountTicket)
}

exports.read = async function (ctx) {
    let {uid} = ctx.params
    let discountTicket = await models.discountTicket.getByUid(ctx, uid)
    response.send(ctx, discountTicket)
}

exports.update = async function (ctx) {
    let {uid} = ctx.params
    let discountTicket = await models.discountTicket.getByUid(ctx, uid)
    let _ = ctx.request.body
    Object.assign(discountTicket, _)
    await discountTicket.save()
    response.send(ctx, discountTicket)
}

exports.delete = async function (ctx) {
    let {uid} = ctx.params
    let discountTicket = await models.discountTicket.getByUid(ctx, uid)
    await discountTicket.destroy()
    response.send(ctx, discountTicket)
}

exports.bulkDelete = async function (ctx) {
    let _ = ctx.request.body
    let deleteResult = await models.discountTicket.destroy({
        where: {
            uid: _.uids
        }
    })
    response.send(ctx, deleteResult)
}

exports.addDiscount = async function (ctx) {
	let _ = await ctx.request.body
	for (let i = 0; i<_.uids.length; i++){
		let discountPrice = await models.discountTicket.getByUid(ctx, _.uids[i], models)
		discountPrice.ticketPriceDiscountPercent = _.discountPercent
		discountPrice.ticketPriceDiscount = discountPrice.ticketPrice * (_.discountPercent * 1/100)
		discountPrice.save()
	}
	response.send(ctx)
}
