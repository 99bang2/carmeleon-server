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
				model: models.parkingSite
			},{
				as: 'gasStation',
				model: models.gasStation
			},{
				as: 'carWash',
				model: models.carWash
			},],
			where: {userUid:userUid}
		})
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
		let count = await favorite.count(
			{
				where: {
					targetType: params.targetType,
					targetUid: params.targetUid,
					userUid: params.userUid
				}
			}
		)
		return count
	}
	return favorite
}
