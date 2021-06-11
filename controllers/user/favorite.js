const models = require('../../models')
const response = require('../../libs/response')

exports.toggle = async function (ctx) {
	let _ = ctx.request.body
	let favorite = await models.favorite.findOne({
		paranoid: false,
		where: {
			targetType: _.targetType,
			targetUid: _.targetUid,
			userUid: ctx.user.uid
		}
	})
	if(favorite) {
		if(favorite.deletedAt){
			await favorite.restore()
		}else{
			await favorite.destroy()
		}
	}else {
		favorite = await models.favorite.create({
			targetType: _.targetType,
			targetUid: _.targetUid,
			userUid: ctx.user.uid
		})
	}
	if(!favorite.deletedAt) {
		let place
		switch (_.targetType) {
			case 0: place = await models.parkingSite.findByPk(_.targetUid, {raw:true})
				break
			case 1: place = await models.evChargeStation.findByPk(_.targetUid, {raw:true})
				break
			case 2: place = await models.gasStation.findByPk(_.targetUid, {raw:true})
				break
			case 3: place = await models.carWash.findByPk(_.targetUid, {raw:true})
				break
		}
		favorite.dataValues.place = place
	}
	response.send(ctx, favorite)
}

exports.list = async function (ctx) {
	let favorites = await models.favorite.findAll({
		include: [{
			as: 'parkingSite',
			model: models.parkingSite,
			attributes: ['uid', 'name', 'address']
		}, {
			as: 'gasStation',
			model: models.gasStation,
			attributes: ['uid', 'gasStationName', 'address']
		}, {
			as: 'carWash',
			model: models.carWash,
			attributes: ['uid', 'carWashName', 'address']
		}, {
			as: 'evChargeStation',
			model: models.evChargeStation,
			attributes: ['uid', 'statNm', 'addr']
		}],
		where: {userUid: ctx.user.uid}
	})
	for(let index in favorites) {
		let favorite = favorites[index]
		let place = getPlaceInfo(favorite)
		if(place) {
			favorite.dataValues.place = place
			delete favorite.dataValues.parkingSite
			delete favorite.dataValues.gasStation
			delete favorite.dataValues.carWash
			delete favorite.dataValues.evChargeStation
		}else {
			favorite.splice(index, 1)
		}
	}
	response.send(ctx, favorites)
}

function getPlaceInfo(favorite){
	switch (favorite.targetType) {
		case 0:
			return favorite.parkingSite ? {
				uid: favorite.parkingSite.uid,
				name: favorite.parkingSite.name,
				address: favorite.parkingSite.address,
			} : null
		case 1:
			return favorite.evChargeStation ? {
				uid: favorite.evChargeStation.uid,
				name: favorite.evChargeStation.statNm,
				address: favorite.evChargeStation.addr,
			} : null
		case 2:
			return favorite.gasStation ? {
				uid: favorite.gasStation.uid,
				name: favorite.gasStation.gasStationName,
				address: favorite.gasStation.address,
			} : null
		case 3:
			return favorite.carWash ? {
				uid: favorite.carWash.uid,
				name: favorite.carWash.carWashName,
				address: favorite.carWash.address,
			} : null
		default: return null
	}
}
