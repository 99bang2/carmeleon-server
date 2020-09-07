'use strict'
const response = require('../libs/response')
const codes = require('../configs/codes.json')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

module.exports = (sequelize, DataTypes) => {
	const gasStation = sequelize.define('gasStation', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		gasStationName: {
			type: DataTypes.STRING,
			allowNull: false
		},
		gasStationUid: {
			type: DataTypes.STRING
		},
		brandCode: {
			type: DataTypes.STRING
		},
		brandCodeName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('brandCode') !== null) {
					return codes.brandCodeOpts[this.getDataValue('brandCode')]
				}
			}
		},
		gasStationType: {
			type: DataTypes.STRING,
		},
		gasStationTypeName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('gasStationType') !== null) {
					return codes.gasStationTypeOpts[this.getDataValue('gasStationType')]
				}
			}
		},
		address: {
			type: DataTypes.STRING
		},
		sido: {
			type: DataTypes.STRING
		},
		sigungu: {
			type: DataTypes.STRING
		},
		tel: {
			type: DataTypes.STRING
		},
		lat: {
			type: DataTypes.DOUBLE
		},
		lon: {
			type: DataTypes.DOUBLE
		},
		oilPrice: {
			type: DataTypes.JSON
		},
		picture: {
			type: DataTypes.JSON
		},
		rate: {
			type: DataTypes.DOUBLE
		},
		isRecommend: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		tag: {
			type: DataTypes.JSON
		},
		Gasoline: {
			type: DataTypes.INTEGER
		},
		Diesel: {
			type: DataTypes.INTEGER
		},
		PremiumGasoline: {
			type: DataTypes.INTEGER
		},
		HeatingOil: {
			type: DataTypes.INTEGER
		},
		lpg: {
			type: DataTypes.INTEGER
		}
	}, {
		timestamps: true,
		paranoid: true,
		underscored: true,
	})
	gasStation.associate = function (models) {
		//gasStation.hasMany(models.rating, {foreignKey: 'site_uid'})
		gasStation.hasMany(models.rating, {
			foreignKey: 'targetUid',
			constraints: false,
			scope: {
				targetType: 1
			}
		})
		gasStation.hasMany(models.favorite, {
			foreignKey: 'targetUid',
			constraints: false,
			scope: {
				targetType: 1
			}
		})
	}
	gasStation.getByUid = async function (ctx, uid, params) {
		let userUid = null
		if(params !== null) {
			if (params.userUid) {
				userUid = params.userUid
			}
		}
		let favoriteCheck = 'target_type = 2 AND target_uid = ' + uid + ' AND user_uid = ' + userUid + ' AND deleted_at IS NULL)'
		let data = await gasStation.findByPk(uid, {
			attributes: {
				include: [
					[Sequelize.literal(`(SELECT count(uid) FROM favorites WHERE ` + favoriteCheck), 'favoriteFlag']
				]
			},
		})
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}

	gasStation.search = async (params, models) => {
		let where = {}
		let order = [['createdAt', 'DESC']]

		if (params.searchKeyword) {
			where = {
				[Sequelize.Op.or]: [
					{
						gasStationName: {
							[Sequelize.Op.like]: '%' + params.searchKeyword + '%'
						}
					},
					// {
					// 	carWashIndustry: {
					// 		[Sequelize.Op.like]: '%' + params.searchKeyword + '%'
					// 	}
					// },
					// {
					// 	address: {
					// 		[Sequelize.Op.like]: '%' + params.searchKeyword + '%'
					// 	}
					// },
					// {
					// 	carWashChargeInfo: {
					// 		[Sequelize.Op.like]: '%' + params.searchKeyword + '%'
					// 	}
					// },
					// {
					// 	phoneNumber: {
					// 		[Sequelize.Op.like]: '%' + params.searchKeyword + '%'
					// 	}
					// }
				]
			}
		}

		if (params.searchBrandCode) {
			where.brandCode = params.searchBrandCode
		}
		if (params.searchType) {
			where.gasStationType = params.searchType
		}
		if (params.searchKpetro) {
			where.isKpetro = params.searchKpetro
		}
		where.oilPrice = {[Op.ne]: null}

		let result = await gasStation.findAll({
			offset: params.offset ? Number(params.offset) : null,
			limit: params.limit ? Number(params.limit) : null,
			order: order,
			where: where
		})
		let count = await gasStation.scope(null).count({
			where: where
		})
		return {
			rows: result,
			count: count
		}
	}

	gasStation.userSearch = async (params, models) => {
		let where = {}
		let order = [['createdAt', 'DESC']]
		let longitude = params.lon ? parseFloat(params.lon) : null
		let latitude = params.lat ? parseFloat(params.lat) : null
		let radius = params.radius
		let distaceQuery = sequelize.where(sequelize.literal(`(6371 * acos(cos(radians(${latitude})) * cos(radians(lat)) * cos(radians(lon) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(lat))))`), '<=', radius)
		if (!radius) {
			distaceQuery = null
		}
		let rateWhere = 'target_type = 2 AND target_uid = gasStation.uid)'
		if (params.brandCode) {
			where.site_type = params.brandCode
		}
		if (params.gasStationType) {
			where.gasStationType = params.gasStationType
		}
		if (params.isKpetro) {
			where.isKpetro = params.isKpetro
		}

		let result = await gasStation.findAll({
			attributes: {
				include: [
					[`(6371 * acos(cos(radians(${latitude})) * cos(radians(lat)) * cos(radians(lon) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(lat))))`, 'distance'],
					[`(SELECT count(uid) FROM ratings WHERE ` + rateWhere, 'rate_count']
				]
			},
			order: order,
			where: [
				distaceQuery
				, where
			]
		})
		return result
	}

	return gasStation
}
