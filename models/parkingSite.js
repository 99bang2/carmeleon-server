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
		}
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
			where.name = {[Sequelize.Op.like]: '%' + params.searchKeyword + '%'}
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

	parkingSite.userSearch = async (params, models) => {
		let where = {}
		let order = [['createdAt', 'DESC']]
		let longitude = params.lon ? parseFloat(params.lon) : null
		let latitude = params.lat ? parseFloat(params.lat) : null
		let radius = params.radius
		let distanceQuery = sequelize.where(sequelize.literal(`(6371 * acos(cos(radians(${latitude})) * cos(radians(lat)) * cos(radians(lon) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(lat))))`), '<=', radius)
		let rateWhere = 'target_type = 0 AND target_uid = parkingSite.uid)'
		if (!radius) {
			distanceQuery = null
		}
		if (params.siteType) {
			where.site_type = params.siteType
		}
		if (params.valetType) {
			where.valet_type = params.valetType
		}
		// if(params.paymentTag){
		// 	if(params.paymentTag.indexOf(',') !== -1){
		// 		let tagArr = params.paymentTag.split(',')
		// 		let tagWhereArr = []
		// 		for(let i in tagArr){
		// 			tagWhereArr.push(sequelize.where(sequelize.literal(`payment_tag`), 'like', '%'+tagArr[i]+'%'))
		// 		}
		// 		where.payment_tag = {
		// 			[Op.and] : tagWhereArr
		// 		}
		// 	}else{
		// 		where.payment_tag = {
		// 			[Op.substring]: params.paymentTag
		// 		}
		// 	}
		// }
		// if(params.brandTag){
		// 	//where.brandTag = params.brandTag
		// 	if(params.brandTag.indexOf(',') !== -1){
		// 		let tagArr = params.brandTag.split(',')
		// 		let tagWhereArr = []
		// 		for(let i in tagArr){
		// 			tagWhereArr.push(sequelize.where(sequelize.literal(`brand_tag`), 'like', '%'+tagArr[i]+'%'))
		// 		}
		// 		where.brand_tag = {
		// 			[Op.and] : tagWhereArr
		// 		}
		// 	}else{
		// 		where.brand_tag = {
		// 			[Op.substring]: params.brandTag
		// 		}
		// 	}
		// }
		// if(params.productTag){
		// 	if(params.productTag.indexOf(',') !== -1){
		// 		let tagArr = params.productTag.split(',')
		// 		let tagWhereArr = []
		// 		for(let i in tagArr){
		// 			tagWhereArr.push(sequelize.where(sequelize.literal(`product_tag`), 'like', '%'+tagArr[i]+'%'))
		// 		}
		// 		where.product_tag = {
		// 			[Op.and] : tagWhereArr
		// 		}
		// 	}else{
		// 		where.product_tag = {
		// 			[Op.substring]: params.productTag
		// 		}
		// 	}
		// }
		if(params.optionTag){
			if(params.optionTag.indexOf(',') !== -1){
				let tagArr = params.optionTag.split(',')
				let tagWhereArr = []
				for(let i in tagArr){
					tagWhereArr.push(sequelize.where(sequelize.literal(`option_tag`), 'like', '%'+tagArr[i]+'%'))
				}
				where.option_tag = {
					[Op.and] : tagWhereArr
				}
			}else{
				where.option_tag = {
					[Op.substring]: params.optionTag
				}
			}
		}
		// if(params.carTag){
		// 	if(params.carTag.indexOf(',') !== -1){
		// 		let tagArr = params.carTag.split(',')
		// 		let tagWhereArr = []
		// 		for(let i in tagArr){
		// 			tagWhereArr.push(sequelize.where(sequelize.literal(`car_tag`), 'like', '%'+tagArr[i]+'%'))
		// 		}
		// 		where.car_tag = {
		// 			[Op.and] : tagWhereArr
		// 		}
		// 	}else{
		// 		where.car_tag = {
		// 			[Op.substring]: params.carTag
		// 		}
		// 	}
		// }
		let attributes = ['uid', 'name', 'isBuy', 'rate', 'tag', 'valetType', 'isRecommend', 'price', 'lat', 'lon']

		let result = await parkingSite.findAll({
			/*attributes: {
				include: [
					[`(6371 * acos(cos(radians(${latitude})) * cos(radians(lat)) * cos(radians(lon) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(lat))))`, 'distance'],
					[`(SELECT count(uid) FROM ratings WHERE ` + rateWhere, 'rate_count']
				]
			},*/
			attributes: [
				'uid', 'name', 'isBuy', 'rate', 'tag', 'valetType', 'isRecommend', 'price', 'lat', 'lon',
				[`(6371 * acos(cos(radians(${latitude})) * cos(radians(lat)) * cos(radians(lon) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(lat))))`, 'distance'],
				[`(SELECT count(uid) FROM ratings WHERE ` + rateWhere, 'rate_count']
			],
			order: order,
			where: [
				distanceQuery
				, where
			]
		})
		return result
	}
	return parkingSite
}
