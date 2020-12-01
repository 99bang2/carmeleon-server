'use strict'
const response = require('../libs/response')
const codes = require('../configs/codes.json')
module.exports = (sequelize, DataTypes) => {
	const car = sequelize.define('car', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		carType: {
			type: DataTypes.STRING
		},
		carModel: {
			type: DataTypes.STRING
		},
		carPlate: {
			type: DataTypes.STRING
		},
		carGear: {
			type: DataTypes.INTEGER
		},
		userUid: {
			type: DataTypes.INTEGER
		},
		isMain: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		discountType: {
			type: DataTypes.INTEGER
		},
		discountTypeName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('discountType') !== null && this.getDataValue('discountType') !== 0) {
					return codes.discountType[this.getDataValue('discountType')]
				} else {
					return null
				}
			}
		},
		discountContent: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('discountType') !== null && this.getDataValue('discountType') !== 0) {
					return codes.discountContent[this.getDataValue('discountType')]
				} else {
					return null
				}
			}
		},
		discountPictures: {
			type: DataTypes.JSON
		},
		discountDay: {
			type: DataTypes.STRING
		},
		discountStatus: {
			type: DataTypes.INTEGER
		},
		discountStatusName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('discountStatus') !== null && this.getDataValue('discountStatus') !== 0) {
					return codes.discountStatus[this.getDataValue('discountStatus')]
				} else {
					return null
				}
			}
		},
	}, {
		timestamps: true,
		underscored: true,
		paranoid: true
	})
	car.associate = function (models) {
		car.belongsTo(models.user)
	}
	car.getByUid = async function (ctx, uid) {
		let data = await car.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	car.getByUserUid = async function (ctx, uid) {
		let data = await car.findAll({
			where: {userUid:uid}
		})
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	car.search = async (params) => {
		let where = {}
		let order = [['isMain', 'DESC']]
		if(params.userUid){
			where.userUid = params.userUid
		}
		let result = await car.findAll({
			where: where,
			order: order
		})
		return result
	}
	car.checkCar = async (params) => {
		let count = await car.count(
			{
				where: {
					userUid: params.userUid,
					carPlate: params.carPlate
				}
			}
		)
		return count
	}
	return car
}
