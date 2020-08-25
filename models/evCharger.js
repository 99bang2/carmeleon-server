'use strict'
const response = require('../libs/response')
const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
	const evCharger = sequelize.define('evCharger', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
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
		statUpdDt: {
			type: DataTypes.STRING
		},
		powerType: {
			type: DataTypes.STRING
		},
	}, {
		timestamps: true,
		paranoid: true,
		underscored: true,
	})
	evCharger.associate = function (models) {
		evCharger.belongsTo(models.evChargeStation,{foreignKey: 'statId', targetKey: 'statId'})
	}
	evCharger.getByUid = async function (ctx, uid) {
		let data = await evCharger.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}

	evCharger.search = async (params, models) => {
		let where = {}

		let result = await evCharger.findAll({
			where: where
		})

		return result
	}

	return evCharger
}
