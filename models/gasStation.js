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
		tagName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('tag') !== null) {
					return this.getDataValue('tag').map(function (obj) {
						return codes.gasStationTag[obj]
					})
				}
			}
		},
		isRate: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
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
		},
		targetType: {
			type: DataTypes.VIRTUAL,
			get: function () {
				return 2
			}
		},
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
	//어드민용
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
					}
				]
			}
		}

		if (params.searchBrandCode) {
			where.brandCode = params.searchBrandCode
		}
		if (params.searchType) {
			where.gasStationType = params.searchType
		}
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

	return gasStation
}
