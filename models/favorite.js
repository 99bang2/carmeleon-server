'use strict'
const response = require('../libs/response')
module.exports = (sequelize, DataTypes) => {
	const favorite = sequelize.define('favorite', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		targetType:{
			type: DataTypes.INTEGER,
			allowNull: false
		},
		targetUid: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		userUid: {
			type: DataTypes.INTEGER
		},
		nickname: {
			type: DataTypes.STRING
		}
	}, {
		timestamps: true,
		underscored: true,
		paranoid: true
	})
	favorite.associate = function (models) {
		favorite.belongsTo(models.user)
		//favorite.belongsTo(models.parkingSite, {foreignKey: 'site_uid', targetKey: 'uid'})
		favorite.belongsTo(models.parkingSite, {
			foreignKey: 'targetUid',
			constraints: false,
			as: 'parkingSite'
		})
		favorite.belongsTo(models.gasStation, {
			foreignKey: 'targetUid',
			constraints: false,
			as: 'gasStation'
		})
		favorite.belongsTo(models.carWash, {
			foreignKey: 'targetUid',
			constraints: false,
			as: 'carWash'
		})
		favorite.belongsTo(models.evChargeStation, {
			foreignKey: 'targetUid',
			constraints: false,
			as: 'evChargeStation'
		})
	}
	favorite.getByUid = async function (ctx, uid) {
		let data = await favorite.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	favorite.getByUserUid = async function (ctx, userUid, models) {
		let data = await favorite.findAll({
			include: [{
				as: 'parkingSite',
				model: models.parkingSite,
				attributes: ['uid', 'name', 'address']
			},{
				as: 'gasStation',
				model: models.gasStation,
				attributes: ['uid', 'gasStationName', 'address']
			},{
				as: 'carWash',
				model: models.carWash,
				attributes: ['uid', 'carWashName', 'address']
			},{
				as: 'evChargeStation',
				model: models.evChargeStation,
				attributes: ['uid', 'statNm', 'addr']
			}],
			where: {userUid:userUid}
		}).then(function(val){
			val.map(function (obj) {
				let tempVal = {}
				switch (obj.dataValues.targetType) {
					case 0:
						if(!obj.dataValues.parkingSite){
							ctx.throw({
								code: 400,
								message: '존재 하지 않습니다.'
							})
						}
						tempVal.uid = obj.dataValues.parkingSite.uid
						tempVal.name = obj.dataValues.parkingSite.name
						tempVal.address = obj.dataValues.parkingSite.address
						break;
					case 1:
						if(!obj.dataValues.gasStation){
							ctx.throw({
								code: 400,
								message: '존재 하지 않습니다.'
							})
						}
						tempVal.uid = obj.dataValues.gasStation.uid
						tempVal.name = obj.dataValues.gasStation.gasStationName
						tempVal.address = obj.dataValues.gasStation.address
						break;
					case 2:
						if(!obj.dataValues.carWash){
							ctx.throw({
								code: 400,
								message: '존재 하지 않습니다.'
							})
						}
						tempVal.uid = obj.dataValues.carWash.uid
						tempVal.name = obj.dataValues.carWash.carWashName
						tempVal.address = obj.dataValues.carWash.address
						break;
					case 3:
						if(!obj.dataValues.evChargeStation){
							ctx.throw({
								code: 400,
								message: '존재 하지 않습니다.'
							})
						}
						tempVal.uid = obj.dataValues.evChargeStation.uid
						tempVal.name = obj.dataValues.evChargeStation.statNm
						tempVal.address = obj.dataValues.evChargeStation.addr
						break;
				}
				obj.dataValues.place = tempVal
				if(obj.dataValues.parkingSite){
					delete obj.dataValues.parkingSite
				}
				if(obj.dataValues.gasStation){
					delete obj.dataValues.gasStation
				}
				if(obj.dataValues.carWash) {
					delete obj.dataValues.carWash
				}
				if(obj.dataValues.evChargeStation) {
					delete obj.dataValues.evChargeStation
				}
			})
			return val
		}).catch()
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	favorite.search = async (params) => {
		let where = {}
		let offset = null
		let limit = null
		let targetTable = ''
		if (params.targetType) {
			where.targetType = params.targetType
			switch (params.targetType) {
				case '0' : targetTable = 'parking_sites';
					break;
				case '1' : targetTable = 'gas_stations';
					break;
				case '2' : targetTable = 'car_washes';
					break;
				case '3' : targetTable = 'ev_charges';
					break;
				default : targetTable = 'parking_sites';
					break;
			}
		}
		if (params.targetUid) {
			where.targetUid = params.targetUid
		}
		if(params.userUid){
			where.userUid = params.userUid
		}
		let result = await favorite.findAll({
			where: where
		})
		return result
	}
	favorite.checkFavorite = async (params) => {
		let where = {
			targetType: params.targetType,
			targetUid: params.targetUid,
			userUid: params.userUid
		}

		let data = await favorite.findAll({
			paranoid: false,
			where: where
		})
		// let count = await favorite.count(
		// 	{
		// 		where: where
		// 	}
		// )
		//return asw
		return data
	}
	return favorite
}
