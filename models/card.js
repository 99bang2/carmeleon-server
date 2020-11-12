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
		cardNumber: {
			type: DataTypes.STRING
		},
		cardCode: {
			type: DataTypes.STRING
		},
		expiryYear: {
			type: DataTypes.STRING
		},
		expiryMonth: {
			type: DataTypes.STRING
		},
		cardPassword: {
			type: DataTypes.STRING
		},
		cardId: {
			type: DataTypes.STRING
		},
		billKey: {
			type: DataTypes.STRING
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
		},
		maskingCardNumber: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('cardNumber') !== null) {
					return this.getDataValue('cardNumber').replace(/\d(?=.{4})/gi, "*");
				}
			}
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
		let data = await card.findByPk(uid,{
			attributes: ['maskingCardNumber', 'cardCode', 'billKey', 'userUid', 'isMain']
		})
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	card.getByUserUid = async function (ctx, uid) {
		let data = await card.findAll({
			attributes: ['maskingCardNumber', 'cardCode', 'billKey', 'userUid', 'isMain'],
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
			attributes: ['maskingCardNumber', 'cardCode', 'billKey', 'userUid', 'isMain'],
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
