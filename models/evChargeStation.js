'use strict'
const response = require('../libs/response')
const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
	const evChargeStation = sequelize.define('evChargeStation', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		statNm: {
			type: DataTypes.STRING,
		},
		statId: {
			type:DataTypes.STRING,
			unique: true
		},
		addr: {
			type: DataTypes.STRING
		},
		useTime: {
			type: DataTypes.STRING
		},
		busiId: {
			type: DataTypes.STRING,
		},
		busiNm: {
			type: DataTypes.STRING,
		},
		busiCall: {
			type: DataTypes.STRING,
		},
		rate: {
			type: DataTypes.DOUBLE
		},
		lat: {
			type:DataTypes.DOUBLE
		},
		lon: {
			type:DataTypes.DOUBLE
		},
		sido: {
			type: DataTypes.STRING
		},
		sigungu:{
			type: DataTypes.STRING
		},
		picture:{
			type: DataTypes.STRING
		},
		is_recommend:{
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
	}, {
		timestamps: true,
		paranoid: true,
		underscored: true,
	})
	evChargeStation.associate = function (models) {
		//gasStation.hasMany(models.rating, {foreignKey: 'site_uid'})
		evChargeStation.hasMany(models.rating, {
			foreignKey: 'targetUid',
			constraints: false,
			scope: {
				targetType: 1
			}
		})
		evChargeStation.hasMany(models.favorite, {
			foreignKey: 'targetUid',
			constraints: false,
			scope: {
				targetType: 1
			}
		})
		evChargeStation.hasMany(models.evCharger, {
			foreignKey: 'statId',
			sourceKey: 'statId'
		})
	}
	evChargeStation.getByUid = async function (ctx, uid, models) {
		let data = await evChargeStation.findByPk(uid, {
			include: [{
				model: models.evCharger
			}],
		})
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}

	evChargeStation.search = async (params, models) => {
		let where = {}
		let order = [['createdAt', 'DESC']]

		if (params.searchKeyword) {
			where = {
				[Sequelize.Op.or]: [
					{
						statNm: {
							[Sequelize.Op.like]: '%' + params.searchKeyword + '%'
						}
					}
				]
			}
		}

		let result = await evChargeStation.findAll({
			offset: params.offset ? Number(params.offset) : null,
			limit: params.limit ? Number(params.limit) : null,
			order: order,
			where: where
		})
		let count = await evChargeStation.scope(null).count({
			where: where
		})
		return {
			rows: result,
			count: count
		}
	}

	return evChargeStation
}
