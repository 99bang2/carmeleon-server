'use strict'
const response = require('../libs/response')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
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
		},
		isMain: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
	}, {
		timestamps: true,
		underscored: true,
		paranoid: true
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
	card.getByUserUid = async function (ctx, uid) {
		let data = await card.findAll({
			where: {userUid: uid}
		})
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	card.search = async (params) => {
		let where = {}
		let order = [['isMain', 'DESC']]
		if (params.userUid) {
			where.userUid = params.userUid
		}
		let result = await card.findAll({
			where: where,
			order: order
		})
		return result
	}
	card.checkCard = async (params) => {
		let count = await card.count(
			{
				where: {
					userUid: params.userUid,
					cardInfo: {[Op.substring]: params.cardInfo.cardNumber}
				}
			}
		)
		return count
	}
	return card
}
