'use strict'
const response = require('../libs/response')
const codes = require('../configs/codes.json')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const moment = require('moment')
const common = require('../controllers/common')

module.exports = (sequelize, DataTypes) => {
	const parkingSite = sequelize.define('parkingSite', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		siteType: {
			type: DataTypes.INTEGER
		},
		siteTypeName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('siteType') !== null) {
					return codes.site[this.getDataValue('siteType')]
				}
			}
		},
		lat: {
			type: DataTypes.DOUBLE
		},
		lon: {
			type: DataTypes.DOUBLE
		},
		parkingLot: {
			type: DataTypes.INTEGER
		},
		tel: {
			type: DataTypes.STRING
		},
		phone: {
			type: DataTypes.STRING
		},
		email: {
			type: DataTypes.STRING
		},
		manager: {
			type: DataTypes.STRING
		},
		isActive: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		paymentTag: {
			type: DataTypes.JSON
		},
		paymentTagName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('paymentTag') !== null) {
					return this.getDataValue('paymentTag').map(function (obj) {
						return codes.paymentTag[obj]
					})
				}
			}
		},
		brandTag: {
			type: DataTypes.JSON
		},
		brandTagName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('brandTag') !== null) {
					return this.getDataValue('brandTag').map(function (obj) {
						return codes.brandTag[obj]
					})
				}
			}
		},
		productTag: {
			type: DataTypes.JSON
		},
		productTagName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('productTag') !== null) {
					return this.getDataValue('productTag').map(function (obj) {
						return codes.productTag[obj]
					})
				}
			}
		},
		optionTag: {
			type: DataTypes.JSON
		},
		optionTagName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('optionTag') !== null) {
					return this.getDataValue('optionTag').map(function (obj) {
						return codes.optionTag[obj]
					})
				}
			}
		},
		carTag: {
			type: DataTypes.JSON
		},
		carTagName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('carTag') !== null) {
					return this.getDataValue('carTag').map(function (obj) {
						return codes.carTag[obj]
					})
				}
			}
		},
		price: {
			type: DataTypes.INTEGER
		},
		rate: {
			type: DataTypes.DOUBLE
		},
		address: {
			type: DataTypes.STRING
		},
		info: {
			type: DataTypes.TEXT
		},
		priceInfo: {
			type: DataTypes.TEXT
		},
		timeInfo: {
			type: DataTypes.TEXT
		},
		picture: {
			type: DataTypes.JSON
		},
		operationTime: {
			type: DataTypes.STRING
		},
		accountUid: {
			type: DataTypes.INTEGER
		},
		valetType: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		valetTypeName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('valetType') !== null) {
					return codes.valetType[this.getDataValue('valetType')]
				}
			}
		},
		isRecommend: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		isBuy: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		},
		isRate: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		},
		message: {
			type: DataTypes.TEXT
		},
		targetType: {
			type: DataTypes.VIRTUAL,
			get: function () {
				return 0
			}
		},
	}, {
		timestamps: true,
		paranoid: true,
		underscored: true,
	})
	parkingSite.associate = function (models) {
		//parkingSite.hasMany(models.rating, {foreignKey: 'site_uid'})
		parkingSite.hasMany(models.rating, {
			foreignKey: 'targetUid',
			constraints: false,
			scope: {
				targetType: 0
			}
		})
		parkingSite.hasMany(models.favorite, {
			foreignKey: 'targetUid',
			constraints: false,
			scope: {
				targetType: 0
			}
		})
		parkingSite.hasMany(models.discountTicket, {
			foreignKey: 'siteUid',
			sourceKey: 'uid'
		})
	}
	parkingSite.getByUid = async function (ctx, uid, params, models) {
		let currentDate = moment().format('YYYY-MM-DD')
		let currentDay = parseInt(moment().format('E'))
		let dayType
		(currentDay === 0 || currentDay === 6) ? dayType = 2 : dayType = 1
		let userUid = null
		let rateCheck = null
		if(params !== null) {
			if (params.userUid) {
				userUid = params.userUid
			}
		}
		let favoriteCheck = 'target_type = 0 AND target_uid = ' + uid + ' AND user_uid = ' + userUid + ' AND deleted_at IS NULL)'
		let data = await parkingSite.findByPk(uid, {
			//TODO: Attribute 필요 항목만//
			include: [{
				model: models.discountTicket,
				attributes: {
					include: [
						[sequelize.literal(`case when ('` + currentDate + `' not between ticket_start_date AND ticket_end_date) AND (ticket_day_type !=` + dayType + `) then true else false end`), 'expire'],
						[sequelize.literal(`case when ((select count(uid) from pay_logs where discount_ticket_uid = uid) >= ticket_count) then true else false end`), 'sold_out']
					]
				},
			}],
			attributes: {
				include: [
					[Sequelize.literal(`(SELECT count(uid) FROM favorites WHERE ` + favoriteCheck), 'favoriteFlag']
				]
			}
		})
		if (!data) {
			response.badRequest(ctx)
		}
		data.dataValues.rateFlag = rateCheck
		return data
	}

	parkingSite.search = async (params, models) => {
		let where = {}
		let order = [['createdAt', 'DESC']]

		if (params.searchSiteType) {
			where.siteType = params.searchSiteType
		}
		if (params.searchActive) {
			where.isActive = params.searchActive === 'true'?1:0
		}
		if (params.searchRating) {
			let start = parseInt(params.searchRating.split(";")[0])
			let end = parseInt(params.searchRating.split(";")[1])
			//where.rate = params.searchRating
			where.rate = {[Sequelize.Op.between]: [start, end]}
		}
		if (params.searchKeyword) {
			let searchObj = {
				[Op.or]: [
					{name: {[Sequelize.Op.like]: '%' + params.searchKeyword + '%'}},
					{address: {[Sequelize.Op.like]: '%' + params.searchKeyword + '%'}}
				]
			}
			Object.assign(where, searchObj)
		}
		if (params.accountUid) {
			where.accountUid = params.accountUid
		}
		let result = await parkingSite.findAll({
			offset: params.offset ? Number(params.offset) : null,
			limit: params.limit ? Number(params.limit) : null,
			order: order,
			where: where
		})
		let count = await parkingSite.scope(null).count({
			where: where
		})
		return {
			rows: result,
			count: count
		}
	}

	return parkingSite
}
