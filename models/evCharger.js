'use strict'
const response = require('../libs/response')
const Sequelize = require('sequelize')
const codes = require('../configs/codes.json')

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
		statName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('stat') !== null) {
					return codes.chargerStatus[this.getDataValue('stat').toString()]
				}
			}
		},
		chgerId: {
			type: DataTypes.STRING
		},
		chgerType: {
			type: DataTypes.STRING,
		},
		chgerTypeName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('chgerType') !== null) {
					return codes.chargerType[this.getDataValue('chgerType')]
				}
			}
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
