const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let place
	switch (_.targetType) {
		case 0: place = await models.parkingSite.findByPk(_.targetUid, {raw:true})
			break
		case 1: place = await models.gasStation.findByPk(_.targetUid, {raw:true})
			break
		case 2: place = await models.carWash.findByPk(_.targetUid, {raw:true})
			break
		case 3: place = await models.evCharge.findByPk(_.targetUid, {raw:true})
			break
	}
	let checkFavorite = await  models.favorite.checkFavorite(_)
	if(checkFavorite.length > 0){
		if(checkFavorite[0].deletedAt === null){
			await checkFavorite[0].destroy()
			Object.assign(checkFavorite[0].dataValues, {place: null})
		}else{
			checkFavorite[0].setDataValue('deletedAt', null)
			Object.assign(checkFavorite[0], _)
			await checkFavorite[0].save({ paranoid: false })
		}
		Object.assign(checkFavorite[0].dataValues, {place: place})
		response.send(ctx, checkFavorite[0])//checkFavorite[0])
	}else{
		let favorite = await models.favorite.create(_)
		Object.assign(favorite.dataValues, {place: place})
		response.send(ctx, favorite)// favorite)
	}
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let favorites = await models.favorite.search(_, models)
	response.send(ctx, favorites)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let favorite = await models.favorite.getByUid(ctx, uid)
	response.send(ctx, favorite)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let favorite = await models.favorite.getByUid(ctx, uid)
	await favorite.destroy()
	response.send(ctx, favorite)
}

exports.userList = async function (ctx) {
	let {userUid} = ctx.params
	let favorite = await models.favorite.getByUserUid(ctx, userUid, models)
	response.send(ctx, favorite)
}
