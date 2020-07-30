'use strict'
const response = require('../libs/response')
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
			type: DataTypes.BOOLEAN
		}
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
		if(params.userUid){
			where.userUid = params.userUid
		}
		let result = await car.findAll({
			where: where
		})
		return result
	}
	return car
}
