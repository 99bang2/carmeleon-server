'use strict'
const response = require('../libs/response')
module.exports = (sequelize, DataTypes) => {
	const account = sequelize.define('account', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		id: {
			type: DataTypes.STRING
		},
		password: {
			type: DataTypes.STRING
		},
		name: {
			type: DataTypes.STRING
		},
		grade: {
			type: DataTypes.INTEGER
		},
		isActive: {
			type: DataTypes.BOOLEAN
		}
	}, {
		timestamps: true,
		paranoid: true,
		underscored: true
	})
	account.getByUid = async function (ctx, uid) {
		let data = await account.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	account.search = async (params) => {
		let where = {}
		let result = await account.findAll({
			where: where
		})
		return result
	}
	return account
}
