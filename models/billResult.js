'use strict'
const response = require('../libs/response')
module.exports = (sequelize, DataTypes) => {
	const billResult = sequelize.define('billResult', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		userUid: {
			type: DataTypes.INTEGER
		},
		resultCode: {
			type: DataTypes.STRING
		},
		resultMsg: {
			type: DataTypes.STRING
		},
		bid: {
			type: DataTypes.STRING
		},
		authDate: {
			type: DataTypes.STRING
		},
		cardCode: {
			type: DataTypes.STRING
		},
		cardName: {
			type: DataTypes.STRING
		},
		tid: {
			type: DataTypes.STRING
		},
	}, {
		timestamps: true,
		underscored: true,
		paranoid: true
	})
	billResult.associate = function (models) {
		billResult.belongsTo(models.user)
	}
	billResult.getByUid = async function (ctx, uid) {
		let data = await billResult.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	billResult.search = async (params) => {
		let where = {}
		if(params.userUid){
			where.userUid = params.userUid
		}
		let result = await billResult.findAll({
			where: where,
		})
		return result
	}
	return billResult
}
