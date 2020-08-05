'use strict'
const response = require('../libs/response')
const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
	const evCharge = sequelize.define('evCharge', {
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
			type:DataTypes.STRING
		},
		stat: {
			type: DataTypes.INTEGER
		},
		chgerId: {
			type: DataTypes.STRING
		},
		chgerType: {
			type: DataTypes.STRING,
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
		statUpdDt: {
			type: DataTypes.STRING
		},
		powerType: {
			type: DataTypes.STRING
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
	}, {
		timestamps: true,
		paranoid: true,
		underscored: true,
	})
	evCharge.associate = function (models) {
		//gasStation.hasMany(models.rating, {foreignKey: 'site_uid'})
		evCharge.hasMany(models.rating, {
			foreignKey: 'targetUid',
			constraints: false,
			scope: {
				targetType: 1
			}
		})
		evCharge.hasMany(models.favorite, {
			foreignKey: 'targetUid',
			constraints: false,
			scope: {
				targetType: 1
			}
		})
	}
	evCharge.getByUid = async function (ctx, uid) {
		let data = await evCharge.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}

	evCharge.search = async (params, models) => {
		let where = {}
		let order = [['createdAt', 'DESC']]

		if (params.searchKeyword) {
			where = {
				[Sequelize.Op.or]: [
					{
						statNm: {
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

		if (params.searchChargeType) {
			where.chgerType = params.searchChargeType
		}
		if (params.searchStat) {
			where.stat = params.searchStat
		}

		let result = await evCharge.findAll({
			offset: params.offset ? Number(params.offset) : null,
			limit: params.limit ? Number(params.limit) : null,
			order: order,
			where: where
		})
		let count = await evCharge.scope(null).count({
			where: where
		})
		return {
			rows: result,
			count: count
		}
	}

	evCharge.userSearch = async (params, models) => {
		let where = {}
		let order = [['createdAt', 'DESC']]

		let result = await evCharge.findAll({
			order: order,
			where: [
				where
			]
		})
		return result
	}

	return evCharge
}
