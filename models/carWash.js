'use strict'
const response = require('../libs/response')
const codes = require('../configs/codes.json')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

module.exports = (sequelize, DataTypes) => {
	const carWash = sequelize.define('carWash', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		bookingCode:{
			type:DataTypes.STRING
		},
		carWashName: {
			type: DataTypes.STRING,
			allowNull: false
		},
		carWashIndustry: {
			type: DataTypes.STRING
		},
		carWashType: {
			type: DataTypes.STRING
		},
		carWashTypeName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('carWashType') !== null) {
					return codes.carWashTypeOpts[this.getDataValue('carWashType')]
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
		closedDay: {
			type: DataTypes.STRING,
		},
		weekdayOperOpenHhmm: {
			type: DataTypes.STRING
		},
		weekdayOperCloseHhmm: {
			type: DataTypes.STRING
		},
		holidayOperOpenHhmm: {
			type: DataTypes.STRING
		},
		holidayOperCloseHhmm: {
			type: DataTypes.STRING
		},
		carWashChargeInfo: {
			type: DataTypes.STRING
		},
		phoneNumber: {
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
		typeTag: {
			type: DataTypes.JSON
		},
		typeTagName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('typeTag') !== null) {
					if(typeof this.getDataValue('typeTag') !== 'undefined'){
						return this.getDataValue('typeTag').map(function (obj) {
							return codes.carWashTypeTag[obj]
						})
					}
					return null
				}
			}
		},
		isRate: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		},
		timeTag: {
			type: DataTypes.JSON
		},
		timeTagName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('timeTag') !== null) {
					if(typeof this.getDataValue('timeTag') !== 'undefined'){
						return this.getDataValue('timeTag').map(function (obj) {
							return codes.carWashTimeTag[obj]
						})
					}
					return null
				}
			}
		},
		targetType: {
			type: DataTypes.VIRTUAL,
			get: function () {
				return 3
			}
		},
	}, {
		timestamps: true,
		paranoid: true,
		underscored: true,
	})
	carWash.associate = function (models) {
		//carWash.hasMany(models.rating, {foreignKey: 'site_uid'})
		carWash.hasMany(models.rating, {
			foreignKey: 'targetUid',
			constraints: false,
			scope: {
				targetType: 2
			}
		})
		carWash.hasMany(models.favorite, {
			foreignKey: 'targetUid',
			constraints: false,
			scope: {
				targetType: 2
			}
		})
	}

	// 어드민용
	carWash.search = async (params, models) => {
		let where = {}
		let order = [['createdAt', 'DESC']]

		if (params.searchKeyword) {
			where = {
				[Sequelize.Op.or]: [
					{
						carWashName: {
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

		if (params.searchType) {
			where.carWashIndustry = {
				[Sequelize.Op.like]: '%' + params.searchType + '%'
			}
		}
		if (params.typeTag) {
			if (params.typeTag.indexOf(',') !== -1) {
				let tagArr = params.typeTag.split(',')
				let tagWhereArr = []
				for (let i in tagArr) {
					tagWhereArr.push(sequelize.where(sequelize.literal(`type_tag`), 'like', '%' + tagArr[i] + '%'))
				}
				where.type_tag = {
					[Op.and]: tagWhereArr
				}
			} else {
				where.type_tag = {
					[Op.substring]: params.typeTag
				}
			}
		}
		if (params.timeTag) {
			if (params.timeTag.indexOf(',') !== -1) {
				let tagArr = params.timeTag.split(',')
				let tagWhereArr = []
				for (let i in tagArr) {
					tagWhereArr.push(sequelize.where(sequelize.literal(`time_tag`), 'like', '%' + tagArr[i] + '%'))
				}
				where.time_tag = {
					[Op.and]: tagWhereArr
				}
			} else {
				where.time_tag = {
					[Op.substring]: params.timeTag
				}
			}
		}

		let result = await carWash.findAll({
			offset: params.offset ? Number(params.offset) : null,
			limit: params.limit ? Number(params.limit) : null,
			order: order,
			where: where
		})
		let count = await carWash.scope(null).count({
			where: where
		})
		return {
			rows: result,
			count: count
		}
	}

	return carWash
}
