const models = require('../../models')
const response = require('../../libs/response')
const moment = require('moment')
const naverConfig = require('../../configs/objectStorage.json')
const converter = require('../../libs/imageConvert')

exports.create = async function (ctx) {
    let _           = ctx.request.body
    _.picture       = await converter(_.picture, naverConfig.prefix_parking)
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
    let parkingSite = await models.parkingSite.findByPk(uid)
    response.send(ctx, parkingSite)
}

exports.update = async function (ctx) {
    let {uid}       = ctx.params
	let _           = ctx.request.body
    let parkingSite = await models.parkingSite.findByPk(uid)
    _.picture       = await converter(_.picture, naverConfig.prefix_parking)
    Object.assign(parkingSite, _)
    await parkingSite.save()
    response.send(ctx, parkingSite)
}

exports.delete = async function (ctx) {
    let {uid} = ctx.params
	let _ = ctx.request.query
    let parkingSite = await models.parkingSite.findByPk(uid)
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

exports.parkingListForAdmin = async function (ctx){
	let params = ctx.request.query
	let where  = {}
	if(params.accountUid){
		where.accountUid = params.accountUid
	}
	where.isBuy = true
	let parkingList = await models.parkingSite.findAll({
		attributes: ['uid', 'name'],
		where: where
	})
	response.send(ctx, parkingList)
}
