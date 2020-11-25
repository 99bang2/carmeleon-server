'use strict'
const response = require('../libs/response')
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]

module.exports = (sequelize, DataTypes) => {
	const rating = sequelize.define('rating', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		targetType: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		targetUid: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		userUid: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		rate: {
			type: DataTypes.DOUBLE
		},
		reviewContent: {
			type: DataTypes.TEXT
		},
		rateType: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		picture: {
			type: DataTypes.JSON,
		},
		point: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		}
	}, {
		timestamps: true,
		underscored: true,
		paranoid: true,
		hooks: {}
	})
	rating.associate = function (models) {
		rating.belongsTo(models.user)
		//rating.belongsTo(models.parkingSite, {foreignKey: 'site_uid', targetKey: 'uid'})
		rating.belongsTo(models.parkingSite, {
			foreignKey: 'targetUid',
			constraints: false,
			as: 'parkingSite'
		})
		rating.belongsTo(models.gasStation, {
			foreignKey: 'targetUid',
			constraints: false,
			as: 'gasStation'
		})
		rating.belongsTo(models.carWash, {
			foreignKey: 'targetUid',
			constraints: false,
			as: 'carWash'
		})
		rating.belongsTo(models.evChargeStation, {
			foreignKey: 'targetUid',
			constraints: false,
			as: 'evChargeStation'
		})
	}
	rating.getByUid = async function (ctx, uid, models) {
		let data = await rating.findByPk(uid, {
			include: [{
				model: models.user
			}]
		})
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	rating.getByTargetUid = async function (ctx, targetType, targetUid) {
		let where = {}
		if (targetType) {
			where.targetType = targetType
		}
		if (targetUid) {
			where.targetUid = targetUid
		}
		let data = await rating.findAll({
			where: where
		})
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	rating.getByUserUid = async function (ctx, uid, params, models) {
		let offset = null
		let limit = null
		let order = [['createdAt', 'DESC']]
		if (params.page) {
			//offset, limit 처리//
			limit = 10
			offset = (Number(params.page) - 1) * limit
		}
		let data = await rating.findAll({
			attributes: {
				include: [[sequelize.literal(`(SELECT COUNT(uid) FROM rate_tips WHERE rate_uid= rating.uid AND rate_tip = true)`), 'rate_tip_count']]
			},
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
			offset: offset,
			limit: limit,
			order: order,
			where: {userUid: uid}
		}).then(function (val) {
			val.map(function (obj) {
				let tempVal = {}
				switch (obj.dataValues.targetType) {
					case 0:
						if (!obj.dataValues.parkingSite) {
							ctx.throw({
								code: 400,
								message: '존재 하지 않습니다.'
							})
						}
						tempVal.uid = obj.dataValues.parkingSite.uid
						tempVal.name = obj.dataValues.parkingSite.name
						tempVal.address = obj.dataValues.parkingSite.address
						break
					case 1:
						if (!obj.dataValues.evChargeStation) {
							ctx.throw({
								code: 400,
								message: '존재 하지 않습니다.'
							})
						}
						tempVal.uid = obj.dataValues.evChargeStation.uid
						tempVal.name = obj.dataValues.evChargeStation.statNm
						tempVal.address = obj.dataValues.evChargeStation.addr
						break
					case 2:
						if (!obj.dataValues.gasStation) {
							ctx.throw({
								code: 400,
								message: '존재 하지 않습니다.'
							})
						}
						tempVal.uid = obj.dataValues.gasStation.uid
						tempVal.name = obj.dataValues.gasStation.gasStationName
						tempVal.address = obj.dataValues.gasStation.address
						break
					case 3:
						if (!obj.dataValues.carWash) {
							ctx.throw({
								code: 400,
								message: '존재 하지 않습니다.'
							})
						}
						tempVal.uid = obj.dataValues.carWash.uid
						tempVal.name = obj.dataValues.carWash.carWashName
						tempVal.address = obj.dataValues.carWash.address
						break
				}
				obj.dataValues.place = tempVal
				if (obj.dataValues.parkingSite) {
					delete obj.dataValues.parkingSite
				}
				if (obj.dataValues.gasStation) {
					delete obj.dataValues.gasStation
				}
				if (obj.dataValues.carWash) {
					delete obj.dataValues.carWash
				}
				if (obj.dataValues.evChargeStation) {
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
	rating.search = async (params, models) => {
		let where = {}
		let offset = null
		let limit = null
		let userUid = null
		let targetTable = ''
		if (params.targetType) {
			where.targetType = params.targetType
			let targetType = Number(params.targetType)
			switch (targetType) {
				case 0 :
					targetTable = 'parking_sites'
					break
				case 1 :
					targetTable = 'ev_charge_stations'
					break
				case 2 :
					targetTable = 'gas_stations'
					break
				case 3 :
					targetTable = 'car_washes'
					break
				default :
					targetTable = 'parking_sites'
					break
			}
		}
		if (params.targetUid) {
			where.targetUid = params.targetUid
		}
		if (params.userUid) {
			userUid = params.userUid
		}
		if (params.page) {
			//offset, limit 처리//
			limit = 10
			offset = (Number(params.page) - 1) * limit
		}
		let order = [['createdAt', 'DESC']]
		if(params.order) {
			if (Number(params.order) === 0) {
				order = sequelize.literal(`rate_tip_count desc createdAt desc`)
			}else if (Number(params.order) === 1) {
				order = [['createdAt', 'DESC']]
			}else if (Number(params.order) === 2) {
				order = [['rate', 'DESC'],['createdAt', 'DESC']]
			}else if (Number(params.order) === 3) {
				order = [['rate', 'ASC'],['createdAt', 'DESC']]
			}
		}
		let result = await rating.findAll({
			attributes: {
				include: [
					[sequelize.literal(`(SELECT COUNT(uid) FROM rate_tips WHERE rate_uid= rating.uid AND rate_tip = true AND deleted_at IS NULL)`), 'rate_tip_count'],
					[sequelize.literal(`(SELECT COUNT(uid) FROM rate_tips WHERE user_uid=` + userUid + ` AND rate_uid = rating.uid AND rate_tip = true AND deleted_at IS NULL)`), 'user_tip_check'],
				]
			},
			include: [
				{
					model: models.user,
					attributes: ['name', 'nickname', 'email', 'profile_image']
				}
			],
			offset: offset,
			limit: limit,
			where: where,
			order: order
		})
		// 필요 정보 //
		let count = await rating.findAll({
			attributes: [
				[sequelize.literal(`COUNT(CASE WHEN rate = 1 OR rate = 2  AND deleted_at IS NULL THEN 0 END)`), 'rate_1'],
				[sequelize.literal(`COUNT(CASE WHEN rate = 3 OR rate = 4  AND deleted_at IS NULL THEN 0 END)`), 'rate_2'],
				[sequelize.literal(`COUNT(CASE WHEN rate = 5 OR rate = 6  AND deleted_at IS NULL THEN 0 END)`), 'rate_3'],
				[sequelize.literal(`COUNT(CASE WHEN rate = 7 OR rate = 8  AND deleted_at IS NULL THEN 0 END)`), 'rate_4'],
				[sequelize.literal(`COUNT(CASE WHEN rate = 9 OR rate = 10  AND deleted_at IS NULL THEN 0 END)`), 'rate_5'],
				[sequelize.literal(`COUNT(*)`), 'count'],
				[`(SELECT rate FROM ` + targetTable + ` WHERE uid=` + params.targetUid + ')', 'avg_rate']
			],
			where: where
		})
		/////////////
		return {
			rows: result,
			count: count
		}
	}
	rating.checkRate = async (params) => {
		let count = await rating.count(
			{
				where: {
					targetType: params.targetType,
					targetUid: params.targetUid,
					userUid: params.userUid,
					rateType: params.rateType
				}
			}
		)
		return count
	}
	rating.checkPay = async (params, models) => {
		let count = await models.payLog.count(
			{
				where: {
					siteUid: params.targetUid,
					userUid: params.userUid
				}
			}
		)
		return count
	}

	rating.avgRate = async (targetType, targetUid) => {
		let data = await rating.findAll({
			attributes: [[sequelize.fn('AVG', sequelize.col('rate')), 'ratingAvg']],
			where: {
				targetType: targetType,
				targetUid: targetUid
			},
		})
		return data
	}
	return rating
}
