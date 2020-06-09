'use strict'
const response = require('../libs/response')
module.exports = (sequelize, DataTypes) => {
	const card = sequelize.define('card', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		cardInfo: {
			type: DataTypes.JSON
		},
		userUid: {
			type: DataTypes.INTEGER
		},
		nickname: {
			type: DataTypes.STRING
		}
	}, {
		timestamps: true,
		underscored: true
	})
	card.associate = function (models) {
		card.belongsTo(models.user)
	}
	card.getByUid = async function (ctx, uid) {
		let data = await card.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	card.search = async (params) => {
		let where = {}
		let result = await card.findAll({
			where: where
		})
		return result
	}
	return card
}
